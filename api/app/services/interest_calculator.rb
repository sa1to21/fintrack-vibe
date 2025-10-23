class InterestCalculator
  def initialize(account)
    @account = account
  end

  # Calculate interest for one month
  def calculate_monthly_interest
    return 0 unless @account.is_savings_account? && @account.interest_rate.present?
    return 0 if @account.balance <= 0

    # Simple interest: balance * (annual_rate / 12) / 100
    monthly_rate = @account.interest_rate / 12.0 / 100.0
    interest = @account.balance * monthly_rate

    interest.round(2)
  end

  # Check if interest should be accrued (monthly)
  def should_accrue_interest?
    return false unless @account.is_savings_account?
    return false unless @account.deposit_start_date.present?

    # If never accrued before, check if a month has passed since deposit_start_date
    if @account.last_interest_date.nil?
      return Date.today >= @account.deposit_start_date + 1.month
    end

    # If already accrued before, check if a month has passed since last accrual
    Date.today >= @account.last_interest_date + 1.month
  end

  # Accrue interest and create transaction
  def accrue_interest!
    return unless should_accrue_interest?

    interest_amount = calculate_monthly_interest
    return if interest_amount <= 0

    # Find or create "Проценты по вкладу" category
    interest_category = @account.user.categories.find_or_create_by!(
      name: 'Проценты по вкладу',
      category_type: 'income'
    ) do |category|
      category.icon = '💰'
    end

    # Create interest transaction
    transaction = @account.transactions.create!(
      user: @account.user,
      amount: interest_amount,
      transaction_type: 'income',
      category: interest_category,
      description: "Начисление процентов за #{Date.today.strftime('%B %Y')}",
      date: Date.today
    )

    # Update account balance and last_interest_date
    @account.update!(
      balance: @account.balance + interest_amount,
      last_interest_date: Date.today
    )

    transaction
  end
end
