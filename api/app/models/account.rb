class Account < ApplicationRecord
  belongs_to :user
  has_many :transactions, dependent: :destroy

  validates :name, presence: true
  validates :account_type, presence: true
  validates :balance, presence: true, numericality: true
  validates :currency, presence: true

  def update_balance!
    self.balance = transactions.sum do |transaction|
      transaction.transaction_type == 'income' ? transaction.amount : -transaction.amount
    end
    save!
  end
end