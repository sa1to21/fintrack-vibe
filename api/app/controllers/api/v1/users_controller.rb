class Api::V1::UsersController < Api::V1::BaseController
  before_action :set_user, only: [:show, :update, :destroy]

  def current
    render json: current_user, serializer: UserSerializer
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
    params.require(:user).permit(:name, :email, :password, :base_currency)
  end
end