class Category < ApplicationRecord
  TRANSFER_NAME = 'Перевод'.freeze
  DEBT_REPAYMENT_NAME = 'Погашение задолженности'.freeze
  LEGACY_DEBT_REPAYMENT_NAME = 'Погашение долга'.freeze

  belongs_to :user
  has_many :transactions

  validates :name, presence: true, uniqueness: { scope: :user_id }
  validates :category_type, presence: true, inclusion: { in: %w[income expense] }
end
