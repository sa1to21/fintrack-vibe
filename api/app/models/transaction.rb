class Transaction < ApplicationRecord
  belongs_to :account
  belongs_to :category
  belongs_to :paired_transaction, class_name: 'Transaction', optional: true

  validates :amount, presence: true, numericality: { greater_than: 0 }
  validates :transaction_type, presence: true, inclusion: { in: %w[income expense] }
  validates :date, presence: true
  validates :time, presence: true

  after_create :update_account_balance
  after_update :update_account_balance
  after_destroy :update_account_balance

  scope :income, -> { where(transaction_type: 'income') }
  scope :expense, -> { where(transaction_type: 'expense') }
  scope :transfers, -> { where.not(transfer_id: nil) }
  scope :by_date_range, ->(start_date, end_date) { where(date: start_date..end_date) }

  # Проверка, является ли транзакция переводом
  def transfer?
    transfer_id.present?
  end

  # Получить парную транзакцию для перевода
  def get_paired_account
    return nil unless transfer?
    return paired_transaction.account if paired_transaction
    nil
  end

  private

  def update_account_balance
    account.update_balance!
  end
end