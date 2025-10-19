class Api::V1::DashboardController < Api::V1::BaseController
  def index
    # Загружаем все счета пользователя
    accounts = current_user.accounts

    # Загружаем последние 20 транзакций со всех счетов
    transactions = Transaction
      .where(account: accounts)
      .includes(:category, :paired_transaction)
      .order(created_at: :desc)
      .limit(20)

    render json: {
      accounts: ActiveModelSerializers::SerializableResource.new(
        accounts,
        each_serializer: AccountSerializer
      ).as_json,
      transactions: ActiveModelSerializers::SerializableResource.new(
        transactions,
        each_serializer: TransactionSerializer
      ).as_json
    }
  end

  def monthly_stats
    # Get base currency from user settings
    base_currency = current_user.base_currency || 'RUB'

    # Get current month range
    month_start = Date.current.beginning_of_month
    month_end = Date.current.end_of_month

    # Get accounts with base currency
    base_currency_accounts = current_user.accounts.where(currency: base_currency)

    # Get all transactions for current month from base currency accounts
    monthly_transactions = Transaction
      .where(account: base_currency_accounts)
      .where(date: month_start..month_end)
      .includes(:category)

    # Calculate income and expenses
    income = monthly_transactions.income.sum(:amount)
    expenses = monthly_transactions.expense.sum(:amount)

    render json: {
      monthly_income: income,
      monthly_expenses: expenses,
      monthly_change: income - expenses,
      base_currency: base_currency
    }
  end
end
