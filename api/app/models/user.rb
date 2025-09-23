class User < ApplicationRecord
  has_secure_password
  has_many :accounts, dependent: :destroy
  has_many :transactions, through: :accounts

  validates :email, presence: true, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :name, presence: true, length: { minimum: 2 }
end