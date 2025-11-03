class User < ApplicationRecord
  has_secure_password validations: false
  has_many :accounts, dependent: :destroy
  has_many :transactions, through: :accounts
  has_many :categories, dependent: :destroy
  has_one :notification_setting, dependent: :destroy

  # Автоматически создаём настройки уведомлений после создания пользователя
  after_create :create_default_notification_setting

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

  def create_default_notification_setting
    return if notification_setting.present?

    create_notification_setting!(
      enabled: true,
      reminder_time: '20:00',
      timezone: 'User/Local',
      utc_offset: 180,
      days_of_week: [0, 1, 2, 3, 4, 5, 6]
    )
    Rails.logger.info "Created default notification settings for user #{id} via after_create callback"
  rescue => e
    Rails.logger.error "Failed to create notification settings in callback for user #{id}: #{e.message}"
  end
end
