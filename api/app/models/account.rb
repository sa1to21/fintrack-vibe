class Account < ApplicationRecord
  belongs_to :user
  has_many :transactions, dependent: :destroy

  validates :name, presence: true
  validates :account_type, presence: true
  validates :balance, presence: true, numericality: true
  validates :currency, presence: true
  validate :debt_info_structure, if: :is_debt?
  validate :debt_balance_must_be_negative, if: -> { is_debt? && !marked_for_destruction? }

  scope :regular, -> { where(is_debt: false) }
  scope :debts, -> { where(is_debt: true) }

  def update_balance!
    # Skip if account is being deleted
    return if destroyed? || marked_for_destruction?

    self.balance = transactions.sum do |transaction|
      transaction.transaction_type == 'income' ? transaction.amount : -transaction.amount
    end
    save!
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
end