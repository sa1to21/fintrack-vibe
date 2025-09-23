class Api::V1::BaseController < ApplicationController
  before_action :authenticate_user!

  protected

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

  def render_not_found(resource = 'Resource')
    render json: { error: "#{resource} not found" }, status: :not_found
  end

  def render_validation_errors(resource)
    render json: {
      error: 'Validation failed',
      details: resource.errors.full_messages
    }, status: :unprocessable_entity
  end
end