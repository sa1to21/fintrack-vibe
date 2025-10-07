class Transaction < ApplicationRecord
  belongs_to :account
  belongs_to :category

  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :transaction_type, presence: true, inclusion: { in: %w[income expense] }
  validates :date, presence: true
  validates :time, presence: true

  after_create :update_account_balance
  after_update :update_account_balance
  after_destroy :update_account_balance

  scope :income, -> { where(transaction_type: 'income') }
  scope :expense, -> { where(transaction_type: 'expense') }
  scope :by_date_range, ->(start_date, end_date) { where(date: start_date..end_date) }

  private

  def update_account_balance
    account.update_balance!
  end
end