class Api::V1::UsersController < Api::V1::BaseController
  before_action :set_user, only: [:show, :update, :destroy]
  skip_before_action :authenticate_user!, only: [:show_by_telegram, :update_by_telegram]

  def current
    render json: current_user, serializer: UserSerializer
  end

  def show_by_telegram
    user = User.find_by(telegram_id: params[:telegram_id])
    if user
      render json: user, serializer: UserSerializer
    else
      render json: { error: 'User not found' }, status: :not_found
    end
  end

  def update_by_telegram
    user = User.find_or_initialize_by(telegram_id: params[:telegram_id])
    is_new_user = user.new_record?

    user.assign_attributes(telegram_user_params)
    user.name = default_telegram_name if user.name.blank?
    user.base_currency ||= 'RUB'

    if user.save
      # Создаем дефолтный счет для нового пользователя
      # Категории и notification_settings создаются через after_create колбэки
      if is_new_user
        create_default_account(user)
      end

      render json: user, serializer: UserSerializer
    else
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update_current
    if current_user.update(user_params)
      render json: current_user, serializer: UserSerializer
    else
      render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def show
    render json: @user, serializer: UserSerializer
  end

  def update
    if @user.update(user_params)
      render json: @user, serializer: UserSerializer
    else
      render_validation_errors(@user)
    end
  end

  def destroy
    @user.destroy
    head :no_content
  end

  private

  def set_user
    @user = current_user
  end

  def user_params
    params.require(:user).permit(:name, :email, :password, :base_currency, :language_code)
  end

  def telegram_user_params
    params.permit(:language_code, :name, :username)
  end

  def default_telegram_name
    params[:name].presence ||
      params[:username].presence ||
      "Telegram user #{params[:telegram_id]}"
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
  rescue => e
    Rails.logger.error "Failed to create default account for user #{user.id}: #{e.message}"
  end
end
