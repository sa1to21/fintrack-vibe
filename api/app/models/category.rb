class Category < ApplicationRecord
  has_many :transactions

  validates :name, presence: true, uniqueness: true
  validates :category_type, presence: true, inclusion: { in: %w[income expense] }
end