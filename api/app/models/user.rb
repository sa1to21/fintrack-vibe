class User < ApplicationRecord
  has_secure_password validations: false
  has_many :accounts, dependent: :destroy
  has_many :transactions, through: :accounts
  has_many :categories, dependent: :destroy
  has_one :notification_setting, dependent: :destroy

  # Автоматически создаём настройки уведомлений и категории после создания пользователя
  after_create :create_default_notification_setting
  after_create :create_default_categories

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

  def create_default_categories
    return if categories.exists?

    lang = language_code == 'ru' ? 'ru' : 'en'

    categories_data = {
      'ru' => [
        # Расходы
        { name: 'Продукты', category_type: 'expense', icon: '🛒', color: '#FF6B6B' },
        { name: 'Транспорт', category_type: 'expense', icon: '🚗', color: '#4ECDC4' },
        { name: 'Кафе и рестораны', category_type: 'expense', icon: '🍔', color: '#FFD93D' },
        { name: 'Развлечения', category_type: 'expense', icon: '🎮', color: '#A8E6CF' },
        { name: 'Здоровье', category_type: 'expense', icon: '💊', color: '#FF8B94' },
        { name: 'Покупки', category_type: 'expense', icon: '🛍️', color: '#C7CEEA' },

        # Доходы
        { name: 'Зарплата', category_type: 'income', icon: '💰', color: '#95E1D3' },
        { name: 'Фриланс', category_type: 'income', icon: '💼', color: '#6C5CE7' },
        { name: 'Подарки', category_type: 'income', icon: '🎁', color: '#FDCB6E' }
      ],
      'en' => [
        # Expenses
        { name: 'Groceries', category_type: 'expense', icon: '🛒', color: '#FF6B6B' },
        { name: 'Transport', category_type: 'expense', icon: '🚗', color: '#4ECDC4' },
        { name: 'Restaurants', category_type: 'expense', icon: '🍔', color: '#FFD93D' },
        { name: 'Entertainment', category_type: 'expense', icon: '🎮', color: '#A8E6CF' },
        { name: 'Health', category_type: 'expense', icon: '💊', color: '#FF8B94' },
        { name: 'Shopping', category_type: 'expense', icon: '🛍️', color: '#C7CEEA' },

        # Income
        { name: 'Salary', category_type: 'income', icon: '💰', color: '#95E1D3' },
        { name: 'Freelance', category_type: 'income', icon: '💼', color: '#6C5CE7' },
        { name: 'Gifts', category_type: 'income', icon: '🎁', color: '#FDCB6E' }
      ]
    }

    default_categories = categories_data[lang]

    default_categories.each do |category_attrs|
      categories.create!(category_attrs)
    end

    Rails.logger.info "Created #{default_categories.count} default categories (#{lang}) for user #{id}"
  rescue => e
    Rails.logger.error "Failed to create default categories for user #{id}: #{e.message}"
  end
end
