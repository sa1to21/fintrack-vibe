class Category < ApplicationRecord
  belongs_to :user
  has_many :transactions

  validates :name, presence: true, uniqueness: { scope: :user_id }
  validates :category_type, presence: true, inclusion: { in: %w[income expense] }
end