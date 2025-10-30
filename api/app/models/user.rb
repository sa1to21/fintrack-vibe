class User < ApplicationRecord
  has_secure_password validations: false
  has_many :accounts, dependent: :destroy
  has_many :transactions, through: :accounts
  has_many :categories, dependent: :destroy
  has_one :notification_setting, dependent: :destroy

  # Валидация для обычных пользователей (email/password)
  validates :email, uniqueness: true, format: { with: URI::MailTo::EMAIL_REGEXP }, allow_nil: true
  validates :password, presence: true, length: { minimum: 6 }, if: -> { telegram_id.nil? && new_record? }

  # Валидация для Telegram пользователей
  validates :telegram_id, uniqueness: true, allow_nil: true
  validates :name, presence: true, length: { minimum: 2 }
  validates :base_currency, presence: true

  # Пользователь должен иметь либо email, либо telegram_id
  validate :must_have_email_or_telegram_id

  private

  def must_have_email_or_telegram_id
    if email.blank? && telegram_id.blank?
      errors.add(:base, 'Must have either email or telegram_id')
    end
  end
end
