module Api
  class TelegramAuthController < ApplicationController
    # POST /api/auth/telegram
    def authenticate
      telegram_data = validate_telegram_data(params[:init_data])

      unless telegram_data
        render json: { error: 'Invalid Telegram data' }, status: :unauthorized
        return
      end

      user_params = params[:user]
      telegram_id = user_params[:telegram_id]

      # Найти или создать пользователя
      user = User.find_or_initialize_by(telegram_id: telegram_id)

      if user.new_record?
        # Новый пользователь
        user.assign_attributes(
          name: "#{user_params[:first_name]} #{user_params[:last_name]}".strip,
          email: user_params[:username] ? "#{user_params[:username]}@telegram.user" : "tg_#{telegram_id}@telegram.user",
          password: SecureRandom.hex(32), # Случайный пароль (не используется для Telegram)
          username: user_params[:username],
          language_code: user_params[:language_code]
        )

        unless user.save
          render json: { error: user.errors.full_messages }, status: :unprocessable_entity
          return
        end

        # Создать дефолтный счет и категории для нового пользователя
        create_default_account(user)
        create_default_categories(user)
      else
        # Обновить данные существующего пользователя
        user.update(
          name: "#{user_params[:first_name]} #{user_params[:last_name]}".strip,
          username: user_params[:username],
          language_code: user_params[:language_code]
        )
      end

      # Генерируем токен
      token = generate_token(user)

      render json: {
        token: token,
        user: UserSerializer.new(user).as_json
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
      user.accounts.create!(
        name: 'Основной счёт',
        balance: 0,
        currency: 'RUB',
        account_type: 'cash'
      )
    end

    def create_default_categories(user)
      default_categories = [
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
      ]

      default_categories.each do |category_attrs|
        user.categories.create!(category_attrs)
      end
    end
  end
end
