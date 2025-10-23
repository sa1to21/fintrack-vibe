class Api::V1::AnalyticsController < Api::V1::BaseController
  def summary
    # Get date range from params or use current month
    date_from = params[:date_from]&.to_date || Date.current.beginning_of_month
    date_to = params[:date_to]&.to_date || Date.current.end_of_month

    # Get base currency from user settings
    base_currency = current_user.base_currency || 'RUB'

    # Get accounts with base currency
    base_currency_accounts = current_user.accounts.where(currency: base_currency)

    # Get transactions for the period from base currency accounts only
    transactions = Transaction
      .where(account: base_currency_accounts)
      .where(date: date_from..date_to)
      .includes(:category, :account)

    # Calculate totals for the period (excluding regular transfers)
    income = transactions.income.excluding_transfers.sum(:amount)
    expenses = transactions.expense.excluding_transfers.sum(:amount)
    savings = income - expenses

    # Calculate average expense per day
    days_count = (date_to - date_from).to_i + 1
    avg_expense_per_day = days_count > 0 ? (expenses / days_count).round(2) : 0

    # Get total balance for base currency accounts only
    total_balance = base_currency_accounts.sum(:balance)

    # Find biggest expense in the period
    biggest_expense_transaction = transactions.expense.excluding_transfers.order(amount: :desc).first
    biggest_expense = if biggest_expense_transaction
      {
        amount: biggest_expense_transaction.amount,
        category: biggest_expense_transaction.category&.name,
        date: biggest_expense_transaction.date
      }
    else
      nil
    end

    render json: {
      income: income,
      expenses: expenses,
      savings: savings,
      avg_expense_per_day: avg_expense_per_day,
      total_balance: total_balance,
      biggest_expense: biggest_expense
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
        income: month_transactions.income.excluding_transfers.sum(:amount),
        expenses: month_transactions.expense.excluding_transfers.sum(:amount),
        transactions_count: month_transactions.excluding_transfers.count
      }
    end

    render json: { months: months_data.reverse }
  end

  def by_category
    # Get date range from params or use current month
    date_from = params[:date_from]&.to_date || Date.current.beginning_of_month
    date_to = params[:date_to]&.to_date || Date.current.end_of_month
    limit = params[:limit]&.to_i || 5

    # Get base currency from user settings
    base_currency = current_user.base_currency || 'RUB'

    # Get accounts with base currency
    base_currency_accounts = current_user.accounts.where(currency: base_currency)

    # Get expense transactions for the period from base currency accounts only (excluding transfers)
    expense_transactions = Transaction
      .where(account: base_currency_accounts)
      .where(transaction_type: 'expense')
      .where(date: date_from..date_to)
      .excluding_transfers
      .includes(:category)

    # Calculate total expenses
    total_expenses = expense_transactions.sum(:amount)

    # Group by category and calculate percentages
    expenses_by_category = expense_transactions
      .joins(:category)
      .group('categories.id', 'categories.name', 'categories.color', 'categories.icon')
      .sum(:amount)
      .map do |(id, name, color, icon), amount|
        {
          id: id,
          name: name,
          icon: icon,
          amount: amount,
          percentage: total_expenses > 0 ? ((amount / total_expenses) * 100).round : 0,
          color: color
        }
      end
      .sort_by { |cat| -cat[:amount] }
      .first(limit)

    render json: {
      categories: expenses_by_category,
      total_expenses: total_expenses
    }
  end

  def accounts_balance
    # Get all user accounts
    accounts = current_user.accounts

    # Calculate total balance
    total_balance = accounts.sum(:balance)

    # Prepare accounts data with percentages
    accounts_data = accounts.map do |account|
      {
        id: account.id,
        name: account.name,
        balance: account.balance,
        percentage: total_balance > 0 ? ((account.balance / total_balance) * 100).round : 0,
        currency: account.currency,
        account_type: account.account_type
      }
    end

    render json: {
      accounts: accounts_data,
      total_balance: total_balance
    }
  end

  def comparison
    # Get date range from params
    date_from = params[:date_from]&.to_date || Date.current.beginning_of_month
    date_to = params[:date_to]&.to_date || Date.current.end_of_month

    # Get base currency from user settings
    base_currency = current_user.base_currency || 'RUB'

    # Get accounts with base currency
    base_currency_accounts = current_user.accounts.where(currency: base_currency)

    # Calculate period length
    period_length = (date_to - date_from).to_i + 1

    # Calculate previous period dates
    prev_date_to = date_from - 1.day
    prev_date_from = prev_date_to - period_length.days + 1.day

    # Current period transactions from base currency accounts
    current_transactions = Transaction
      .where(account: base_currency_accounts)
      .where(date: date_from..date_to)
      .includes(:category)

    current_income = current_transactions.where(transaction_type: 'income').excluding_transfers.sum(:amount)
    current_expenses = current_transactions.where(transaction_type: 'expense').excluding_transfers.sum(:amount)

    # Previous period transactions from base currency accounts
    previous_transactions = Transaction
      .where(account: base_currency_accounts)
      .where(date: prev_date_from..prev_date_to)
      .includes(:category)

    previous_income = previous_transactions.where(transaction_type: 'income').excluding_transfers.sum(:amount)
    previous_expenses = previous_transactions.where(transaction_type: 'expense').excluding_transfers.sum(:amount)

    # Calculate percentage changes
    income_change = if previous_income > 0
      (((current_income - previous_income) / previous_income) * 100).round
    else
      current_income > 0 ? 100 : 0
    end

    expenses_change = if previous_expenses > 0
      (((current_expenses - previous_expenses) / previous_expenses) * 100).round
    else
      current_expenses > 0 ? 100 : 0
    end

    render json: {
      current: {
        income: current_income,
        expenses: current_expenses
      },
      previous: {
        income: previous_income,
        expenses: previous_expenses
      },
      change: {
        income_percent: income_change,
        expenses_percent: expenses_change
      }
    }
  end

  def insights
    # Get date range from params or use current month
    date_from = params[:date_from]&.to_date || Date.current.beginning_of_month
    date_to = params[:date_to]&.to_date || Date.current.end_of_month

    # Get base currency from user settings
    base_currency = current_user.base_currency || 'RUB'

    # Get accounts with base currency
    base_currency_accounts = current_user.accounts.where(currency: base_currency)

    # Get transactions for the period from base currency accounts only
    transactions = Transaction
      .where(account: base_currency_accounts)
      .where(date: date_from..date_to)
      .includes(:category)

    expense_transactions = transactions.where(transaction_type: 'expense').excluding_transfers

    # 1. Biggest expense
    biggest_expense_transaction = expense_transactions.order(amount: :desc).first
    biggest_expense = if biggest_expense_transaction
      {
        amount: biggest_expense_transaction.amount,
        category: biggest_expense_transaction.category&.name,
        date: biggest_expense_transaction.date.strftime('%d %b')
      }
    else
      nil
    end

    # 2. Average transaction amount (expenses only)
    total_expense_transactions = expense_transactions.count
    avg_transaction = total_expense_transactions > 0 ?
      (expense_transactions.sum(:amount) / total_expense_transactions).round(2) : 0

    # 3. Busiest day of week (most transactions)
    transactions_by_weekday = expense_transactions.group_by { |t| t.date.strftime('%A') }
    busiest_day = if transactions_by_weekday.any?
      transactions_by_weekday.max_by { |day, txns| txns.count }&.first
    else
      nil
    end

    # Translate day to Russian
    day_translations = {
      'Monday' => 'Понедельник',
      'Tuesday' => 'Вторник',
      'Wednesday' => 'Среда',
      'Thursday' => 'Четверг',
      'Friday' => 'Пятница',
      'Saturday' => 'Суббота',
      'Sunday' => 'Воскресенье'
    }
    busiest_day = day_translations[busiest_day] if busiest_day

    # 4. Top category percentage
    top_category = expense_transactions
      .joins(:category)
      .group('categories.name')
      .sum(:amount)
      .max_by { |name, amount| amount }

    top_category_insight = if top_category
      total_expenses = expense_transactions.sum(:amount)
      percentage = total_expenses > 0 ? ((top_category[1] / total_expenses) * 100).round : 0
      {
        name: top_category[0],
        percentage: percentage
      }
    else
      nil
    end

    render json: {
      biggest_expense: biggest_expense,
      avg_transaction: avg_transaction,
      total_transactions: total_expense_transactions,
      busiest_day: busiest_day,
      top_category: top_category_insight
    }
  end
end