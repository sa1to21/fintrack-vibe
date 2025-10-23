module Api
  module V1
    class TransfersController < BaseController
      # POST /api/v1/transfers
      def create
        from_account = current_user.accounts.find_by(id: transfer_params[:from_account_id])
        to_account = current_user.accounts.find_by(id: transfer_params[:to_account_id])

        unless from_account && to_account
          return render json: { error: 'Счет не найден' }, status: :not_found
        end

        if from_account.id == to_account.id
          return render json: { error: 'Нельзя перевести на тот же счет' }, status: :unprocessable_entity
        end

        # Level 2: Check currency match
        if from_account.currency != to_account.currency
          return render json: {
            error: 'Перевод между разными валютами невозможен',
            details: ["Счета используют разные валюты: #{from_account.currency} и #{to_account.currency}"]
          }, status: :unprocessable_entity
        end

        amount = transfer_params[:amount].to_f

        if amount <= 0
          return render json: { error: 'Сумма должна быть больше нуля' }, status: :unprocessable_entity
        end

        # Проверка баланса
        if from_account.balance < amount
          return render json: {
            error: 'Недостаточно средств',
            details: ['На счете недостаточно средств для перевода']
          }, status: :unprocessable_entity
        end

        # Проверка: долговой счет не может уйти в плюс
        if to_account.is_debt
          new_balance = to_account.balance + amount
          if new_balance > 0
            return render json: {
              error: 'Долговой счет не может иметь положительный баланс',
              details: ["Максимальная сумма для пополнения: #{(-to_account.balance).round(2)} #{to_account.currency}"]
            }, status: :unprocessable_entity
          end
        end

        # Выполняем перевод в транзакции
        ActiveRecord::Base.transaction do
          # Генерируем уникальный ID для связи двух транзакций
          transfer_id = SecureRandom.uuid

          # Создаем расход на счете отправителя
          expense = from_account.transactions.create!(
            amount: amount,
            transaction_type: 'expense',
            description: transfer_params[:description] || '',
            date: Date.today,
            time: Time.current,
            category_id: get_transfer_category.id,
            transfer_id: transfer_id
          )

          # Создаем доход на счете получателя
          income = to_account.transactions.create!(
            amount: amount,
            transaction_type: 'income',
            description: transfer_params[:description] || '',
            date: Date.today,
            time: Time.current,
            category_id: get_transfer_category.id,
            transfer_id: transfer_id
          )

          # Связываем транзакции
          expense.update!(paired_transaction_id: income.id)
          income.update!(paired_transaction_id: expense.id)

          # Проверяем, был ли полностью погашен долговой счет
          to_account.reload
          debt_fully_repaid = to_account.is_debt && to_account.balance >= 0

          response_data = {
            success: true,
            from_transaction: TransactionSerializer.new(expense).as_json,
            to_transaction: TransactionSerializer.new(income).as_json,
            from_account: { id: from_account.id, balance: from_account.balance },
            to_account: { id: to_account.id, balance: to_account.balance }
          }

          # Добавляем информацию о погашении долга
          if debt_fully_repaid
            response_data[:debt_fully_repaid] = true
            response_data[:debt_account] = {
              id: to_account.id,
              name: to_account.name,
              balance: to_account.balance
            }
          end

          render json: response_data, status: :created
        end
      rescue ActiveRecord::RecordInvalid => e
        render json: {
          error: 'Не удалось выполнить перевод',
          details: e.record.errors.full_messages
        }, status: :unprocessable_entity
      end

      # PUT /api/v1/transfers/:transfer_id
      def update
        # Находим обе транзакции по transfer_id
        transactions = current_user.transactions.where(transfer_id: params[:transfer_id])

        if transactions.count != 2
          return render json: { error: 'Перевод не найден' }, status: :not_found
        end

        expense_transaction = transactions.find_by(transaction_type: 'expense')
        income_transaction = transactions.find_by(transaction_type: 'income')

        unless expense_transaction && income_transaction
          return render json: { error: 'Некорректные данные перевода' }, status: :unprocessable_entity
        end

        from_account = expense_transaction.account
        to_account = income_transaction.account

        # Новые счета (если изменились)
        new_from_account = params[:transfer][:from_account_id].present? ?
          current_user.accounts.find_by(id: params[:transfer][:from_account_id]) : from_account
        new_to_account = params[:transfer][:to_account_id].present? ?
          current_user.accounts.find_by(id: params[:transfer][:to_account_id]) : to_account

        unless new_from_account && new_to_account
          return render json: { error: 'Счет не найден' }, status: :not_found
        end

        if new_from_account.id == new_to_account.id
          return render json: { error: 'Нельзя перевести на тот же счет' }, status: :unprocessable_entity
        end

        # Level 2: Check currency match
        if new_from_account.currency != new_to_account.currency
          return render json: {
            error: 'Перевод между разными валютами невозможен',
            details: ["Счета используют разные валюты: #{new_from_account.currency} и #{new_to_account.currency}"]
          }, status: :unprocessable_entity
        end

        new_amount = params[:transfer][:amount].present? ? params[:transfer][:amount].to_f : expense_transaction.amount

        if new_amount <= 0
          return render json: { error: 'Сумма должна быть больше нуля' }, status: :unprocessable_entity
        end

        # Проверка баланса с учетом возврата старой суммы
        available_balance = new_from_account.balance + (new_from_account.id == from_account.id ? expense_transaction.amount : 0)
        if available_balance < new_amount
          return render json: {
            error: 'Недостаточно средств',
            details: ['На счете недостаточно средств для перевода']
          }, status: :unprocessable_entity
        end

        # Выполняем обновление в транзакции
        ActiveRecord::Base.transaction do
          # Обновляем expense транзакцию
          expense_transaction.update!(
            amount: new_amount,
            account_id: new_from_account.id,
            description: params[:transfer][:description] || expense_transaction.description,
            date: params[:transfer][:date] || expense_transaction.date
          )

          # Обновляем income транзакцию
          income_transaction.update!(
            amount: new_amount,
            account_id: new_to_account.id,
            description: params[:transfer][:description] || income_transaction.description,
            date: params[:transfer][:date] || income_transaction.date
          )

          render json: {
            success: true,
            from_transaction: TransactionSerializer.new(expense_transaction.reload).as_json,
            to_transaction: TransactionSerializer.new(income_transaction.reload).as_json,
            from_account: { id: new_from_account.id, balance: new_from_account.reload.balance },
            to_account: { id: new_to_account.id, balance: new_to_account.reload.balance }
          }, status: :ok
        end
      rescue ActiveRecord::RecordInvalid => e
        render json: {
          error: 'Не удалось обновить перевод',
          details: e.record.errors.full_messages
        }, status: :unprocessable_entity
      end

      # DELETE /api/v1/transfers/:transfer_id
      def destroy
        # Находим обе транзакции по transfer_id
        transactions = current_user.transactions.where(transfer_id: params[:transfer_id])

        if transactions.count != 2
          return render json: { error: 'Перевод не найден' }, status: :not_found
        end

        # Удаляем обе транзакции в транзакции БД
        ActiveRecord::Base.transaction do
          transactions.destroy_all
          render json: { success: true, message: 'Перевод удален' }, status: :ok
        end
      rescue => e
        render json: {
          error: 'Не удалось удалить перевод',
          details: [e.message]
        }, status: :unprocessable_entity
      end

      private

      def transfer_params
        params.require(:transfer).permit(:from_account_id, :to_account_id, :amount, :description, :date)
      end

      def get_transfer_category
        # Находим или создаем категорию "Перевод"
        current_user.categories.find_or_create_by!(
          name: 'Перевод',
          category_type: 'expense'
        ) do |category|
          category.icon = '🔄'
        end
      end
    end
  end
end
