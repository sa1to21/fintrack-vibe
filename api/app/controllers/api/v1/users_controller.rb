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
    user = User.find_by(telegram_id: params[:telegram_id])
    if user && user.update(telegram_user_params)
      render json: user, serializer: UserSerializer
    elsif user
      render json: { errors: user.errors.full_messages }, status: :unprocessable_entity
    else
      render json: { error: 'User not found' }, status: :not_found
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
end