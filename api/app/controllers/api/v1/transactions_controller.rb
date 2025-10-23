class Api::V1::TransactionsController < Api::V1::BaseController
  before_action :set_account, only: [:index, :create]
  before_action :set_transaction, only: [:show, :update, :destroy]

  def index
    transactions = @account.transactions
      .includes(:category, :paired_transaction)
      .order(date: :desc, time: :desc)
    render json: transactions, each_serializer: TransactionSerializer
  end

  def show
    render json: @transaction, serializer: TransactionSerializer
  end

  def create
    transaction = @account.transactions.build(transaction_params)

    # Проверка баланса для расходных транзакций
    if transaction.transaction_type == 'expense'
      new_balance = @account.balance - transaction.amount
      if new_balance < 0
        return render json: {
          error: 'Недостаточно средств',
          details: ['Баланс счета не может быть отрицательным']
        }, status: :unprocessable_entity
      end
    end

    # Проверка: нельзя напрямую добавить доход на счёт задолженности
    if transaction.transaction_type == 'income' && @account.is_debt
      return render json: {
        error: 'Нельзя напрямую добавить доход на счёт задолженности',
        details: [
          'Для погашения задолженности используйте перевод с обычного счёта.',
          'Перейдите в раздел "Переводы" и выберите счёт задолженности как получателя.',
          'Перевод автоматически будет учтён как расход в категории "Погашение задолженности".'
        ]
      }, status: :unprocessable_entity
    end

    if transaction.save
      render json: {
        transaction: TransactionSerializer.new(transaction).as_json
      }, status: :created
    else
      render_validation_errors(transaction)
    end
  end

  def update
    # Проверка баланса при обновлении транзакции
    if transaction_params[:transaction_type] == 'expense' || (@transaction.transaction_type == 'expense' && transaction_params[:amount])
      # Вычисляем разницу между старой и новой суммой
      old_amount = @transaction.transaction_type == 'expense' ? @transaction.amount : 0
      new_amount = (transaction_params[:amount] || @transaction.amount).to_f
      new_type = transaction_params[:transaction_type] || @transaction.transaction_type

      if new_type == 'expense'
        balance_change = old_amount - new_amount
        new_balance = @transaction.account.balance + balance_change

        if new_balance < 0
          return render json: {
            error: 'Недостаточно средств',
            details: ['Баланс счета не может быть отрицательным']
          }, status: :unprocessable_entity
        end
      end
    end

    if @transaction.update(transaction_params)
      render json: @transaction, serializer: TransactionSerializer
    else
      render_validation_errors(@transaction)
    end
  end

  def destroy
    @transaction.destroy
    head :no_content
  end

  private

  def set_account
    @account = current_user.accounts.find_by(id: params[:account_id])
    render_not_found('Account') unless @account
  end

  def set_transaction
    @transaction = current_user.transactions.find_by(id: params[:id])
    render_not_found('Transaction') unless @transaction
  end

  def transaction_params
    params.require(:transaction).permit(:amount, :transaction_type, :description, :date, :time, :category_id)
  end
end