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

        # Создать дефолтный счет для нового пользователя
        # Категории и notification_settings создаются через after_create колбэки в модели User
        begin
          Rails.logger.info "Creating default data for new user #{user.id}"
          create_default_account(user)
          Rails.logger.info "Created default account for user #{user.id}"
        rescue => e
          Rails.logger.error "Failed to create default data for user #{user.id}: #{e.message}"
          Rails.logger.error e.backtrace.join("\n")
        end
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

        # Проверяем наличие счета и создаем если его нет
        if user.accounts.empty?
          begin
            Rails.logger.warn "User #{user.id} has no accounts, creating default account"
            create_default_account(user)
            Rails.logger.info "Created default account for existing user #{user.id}"
          rescue => e
            Rails.logger.error "Failed to create default account for user #{user.id}: #{e.message}"
          end
        end
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

  end
end
