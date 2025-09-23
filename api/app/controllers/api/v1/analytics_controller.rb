class Api::V1::AnalyticsController < Api::V1::BaseController
  def summary
    # Get all user transactions
    transactions = current_user.transactions.includes(:category)

    # Calculate totals
    total_income = transactions.income.sum(:amount)
    total_expenses = transactions.expense.sum(:amount)
    balance = total_income - total_expenses

    # Get recent transactions
    recent_transactions = transactions.order(date: :desc, time: :desc).limit(5)

    # Calculate monthly data for current month
    current_month = Date.current.beginning_of_month..Date.current.end_of_month
    monthly_income = transactions.income.where(date: current_month).sum(:amount)
    monthly_expenses = transactions.expense.where(date: current_month).sum(:amount)

    render json: {
      total_income: total_income,
      total_expenses: total_expenses,
      balance: balance,
      monthly_income: monthly_income,
      monthly_expenses: monthly_expenses,
      accounts_count: current_user.accounts.count,
      transactions_count: transactions.count,
      recent_transactions: ActiveModelSerializers::SerializableResource.new(
        recent_transactions,
        each_serializer: TransactionSerializer
      )
    }
  end

  def monthly
    # Get transactions for the last 12 months
    months_data = []

    12.times do |i|
      month_start = i.months.ago.beginning_of_month
      month_end = i.months.ago.end_of_month
      month_transactions = current_user.transactions.where(date: month_start..month_end)

      months_data << {
        month: month_start.strftime('%Y-%m'),
        month_name: month_start.strftime('%B %Y'),
        income: month_transactions.income.sum(:amount),
        expenses: month_transactions.expense.sum(:amount),
        transactions_count: month_transactions.count
      }
    end

    render json: { months: months_data.reverse }
  end

  def by_category
    # Get transactions grouped by category
    income_by_category = current_user.transactions.income
      .joins(:category)
      .group('categories.name', 'categories.color', 'categories.icon')
      .sum(:amount)
      .map do |(name, color, icon), amount|
        {
          category: name,
          amount: amount,
          color: color,
          icon: icon,
          type: 'income'
        }
      end

    expenses_by_category = current_user.transactions.expense
      .joins(:category)
      .group('categories.name', 'categories.color', 'categories.icon')
      .sum(:amount)
      .map do |(name, color, icon), amount|
        {
          category: name,
          amount: amount,
          color: color,
          icon: icon,
          type: 'expense'
        }
      end

    render json: {
      income_categories: income_by_category,
      expense_categories: expenses_by_category
    }
  end
end