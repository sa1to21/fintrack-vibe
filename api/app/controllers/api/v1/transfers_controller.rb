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

          render json: {
            success: true,
            from_transaction: TransactionSerializer.new(expense).as_json,
            to_transaction: TransactionSerializer.new(income).as_json,
            from_account: { id: from_account.id, balance: from_account.reload.balance },
            to_account: { id: to_account.id, balance: to_account.reload.balance }
          }, status: :created
        end
      rescue ActiveRecord::RecordInvalid => e
        render json: {
          error: 'Не удалось выполнить перевод',
          details: e.record.errors.full_messages
        }, status: :unprocessable_entity
      end

      private

      def transfer_params
        params.require(:transfer).permit(:from_account_id, :to_account_id, :amount, :description)
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
