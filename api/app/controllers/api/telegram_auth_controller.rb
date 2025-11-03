module Api
  class TelegramAuthController < ApplicationController
    # POST /api/auth/telegram
    def authenticate
      telegram_data = validate_telegram_data(params[:init_data])

      unless telegram_data
        render json: { error: 'Invalid Telegram data' }, status: :unauthorized
        return
      end

      # Поддерживаем оба формата: params[:user] и прямые параметры
      user_params = params[:user] || params
      telegram_id = user_params[:telegram_id]

      # Найти или создать пользователя
      user = User.find_or_initialize_by(telegram_id: telegram_id)
      is_new_user = user.new_record?

      if is_new_user
        # Новый пользователь
        user.assign_attributes(
          name: "#{user_params[:first_name]} #{user_params[:last_name]}".strip,
          email: user_params[:username] ? "#{user_params[:username]}@telegram.user" : "tg_#{telegram_id}@telegram.user",
          password: SecureRandom.hex(32), # Случайный пароль (не используется для Telegram)
          username: user_params[:username],
          language_code: user_params[:language_code].presence || 'en'
        )

        unless user.save
          render json: { error: user.errors.full_messages }, status: :unprocessable_entity
          return
        end

        # Создать дефолтный счет и категории для нового пользователя
        create_default_account(user)
        create_default_categories(user)
        create_default_notification_settings(user)
      else
        # Обновить данные существующего пользователя
        preferred_language = user.language_code.presence ||
                             user_params[:language_code].presence ||
                             'en'

        user.update(
          name: "#{user_params[:first_name]} #{user_params[:last_name]}".strip,
          username: user_params[:username],
          language_code: preferred_language
        )
      end

      # Генерируем токен
      token = generate_token(user)

      render json: {
        token: token,
        user: UserSerializer.new(user).as_json,
        is_new_user: is_new_user
      }, status: :ok
    end

    private

    def validate_telegram_data(init_data)
      # В продакшене здесь должна быть валидация init_data
      # Проверка хеша данных с использованием bot token
      # Для локальной разработки временно возвращаем true

      # TODO: Реализовать валидацию init_data
      # https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app

      return true if Rails.env.development?

      # В продакшене обязательно валидировать!
      true
    end

    def generate_token(user)
      payload = {
        user_id: user.id,
        exp: 30.days.from_now.to_i
      }
      JWT.encode(payload, Rails.application.credentials.secret_key_base)
    end

    def create_default_account(user)
      lang = user.language_code == 'ru' ? 'ru' : 'en'

      account_name = {
        'ru' => 'Основной счёт',
        'en' => 'Main Account'
      }

      user.accounts.create!(
        name: account_name[lang],
        balance: 0,
        currency: 'RUB',
        account_type: 'cash'
      )
    end

    def create_default_categories(user)
      lang = user.language_code == 'ru' ? 'ru' : 'en'

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
        user.categories.create!(category_attrs)
      end
    end

    def create_default_notification_settings(user)
      # Получаем timezone offset пользователя из Telegram (в минутах)
      # По умолчанию используем UTC+3 (Москва) = 180 минут
      utc_offset = user_params[:timezone_offset]&.to_i || 180

      user.create_notification_setting!(
        enabled: true,
        reminder_time: '20:00',
        timezone: 'User/Local',
        utc_offset: utc_offset,
        days_of_week: [0, 1, 2, 3, 4, 5, 6] # Все дни недели
      )
    end
  end
end
