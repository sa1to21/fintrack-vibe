class Account < ApplicationRecord
  belongs_to :user
  has_many :transactions, dependent: :destroy

  validates :name, presence: true
  validates :account_type, presence: true
  validates :balance, presence: true, numericality: true
  validates :currency, presence: true
  validate :debt_info_structure, if: :is_debt?
  validate :debt_balance_must_be_negative, if: -> { is_debt? && !marked_for_destruction? }
  validate :savings_account_fields, if: :is_savings_account?

  scope :regular, -> { where(is_debt: false) }
  scope :debts, -> { where(is_debt: true) }
  scope :savings_accounts, -> { where(is_savings_account: true) }

  def update_balance!
    # Skip if account is being deleted
    return if destroyed? || marked_for_destruction?

    if is_debt?
      # For debt accounts, start with initial debt (negative) and adjust with transactions
      # Income = debt repayment (reduces absolute debt value, makes balance less negative)
      # Expense = additional debt (increases absolute debt value, makes balance more negative)
      initial_debt = -(debt_info['initialAmount'].to_f)
      transaction_sum = transactions.sum do |transaction|
        transaction.transaction_type == 'income' ? transaction.amount : -transaction.amount
      end
      self.balance = initial_debt + transaction_sum
    else
      # For regular accounts, calculate balance from transactions
      self.balance = transactions.sum do |transaction|
        transaction.transaction_type == 'income' ? transaction.amount : -transaction.amount
      end
    end

    save!(validate: false)
  end

  def debt_progress
    return nil unless is_debt? && debt_info.present?

    initial_amount = debt_info['initialAmount'].to_f
    return 0 if initial_amount.zero?

    paid = initial_amount - balance.abs
    (paid / initial_amount * 100).round(2)
  end

  private

  def debt_info_structure
    return unless debt_info.present?

    required_fields = ['initialAmount', 'creditorName', 'dueDate']
    missing_fields = required_fields - debt_info.keys

    if missing_fields.any?
      errors.add(:debt_info, "missing required fields: #{missing_fields.join(', ')}")
    end

    if debt_info['initialAmount'].present? && debt_info['initialAmount'].to_f <= 0
      errors.add(:debt_info, 'initialAmount must be positive')
    end
  end

  def debt_balance_must_be_negative
    if balance.present? && balance > 0
      errors.add(:balance, 'debt account balance must be negative or zero')
    end
  end

  def savings_account_fields
    if interest_rate.present? && (interest_rate <= 0 || interest_rate > 100)
      errors.add(:interest_rate, 'must be between 0 and 100')
    end

    if deposit_term_months.present? && deposit_term_months <= 0
      errors.add(:deposit_term_months, 'must be positive')
    end

    if deposit_start_date.present? && deposit_end_date.present? && deposit_start_date >= deposit_end_date
      errors.add(:deposit_end_date, 'must be after start date')
    end
  end
end