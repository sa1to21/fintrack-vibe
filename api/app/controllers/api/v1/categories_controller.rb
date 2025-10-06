class Api::V1::CategoriesController < Api::V1::BaseController
  before_action :set_category, only: [:show]

  def index
    categories = current_user.categories.order(:category_type, :name)

    # Filter by type if specified
    if params[:type].present? && %w[income expense].include?(params[:type])
      categories = categories.where(category_type: params[:type])
    end

    render json: categories, each_serializer: CategorySerializer
  end

  def show
    render json: @category, serializer: CategorySerializer
  end

  private

  def set_category
    @category = current_user.categories.find_by(id: params[:id])
    render_not_found('Category') unless @category
  end
end