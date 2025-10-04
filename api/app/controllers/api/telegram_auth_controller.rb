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
  end
end
