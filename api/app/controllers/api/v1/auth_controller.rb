class Api::V1::AuthController < ApplicationController
  before_action :authenticate_user!, only: [:me]

  def register
    user = User.new(user_params)

    if user.save
      token = JsonWebToken.encode(user_id: user.id)
      render json: {
        token: token,
        user: UserSerializer.new(user)
      }, status: :created
    else
      render_validation_errors(user)
    end
  end

  def login
    user = User.find_by(email: params[:email])

    if user&.authenticate(params[:password])
      token = JsonWebToken.encode(user_id: user.id)
      render json: {
        token: token,
        user: UserSerializer.new(user)
      }
    else
      render json: { error: 'Invalid email or password' }, status: :unauthorized
    end
  end

  def me
    render json: UserSerializer.new(current_user)
  end

  private

  def user_params
    params.require(:user).permit(:name, :email, :password)
  end

  def authenticate_user!
    token = request.headers['Authorization']&.split(' ')&.last
    return render_unauthorized unless token

    begin
      decoded_token = JsonWebToken.decode(token)
      @current_user = User.find(decoded_token[:user_id])
    rescue JWT::DecodeError, ActiveRecord::RecordNotFound
      render_unauthorized
    end
  end

  def current_user
    @current_user
  end

  def render_unauthorized
    render json: { error: 'Unauthorized' }, status: :unauthorized
  end

  def render_validation_errors(resource)
    render json: {
      error: 'Validation failed',
      details: resource.errors.full_messages
    }, status: :unprocessable_entity
  end
end