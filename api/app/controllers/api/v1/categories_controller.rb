class Api::V1::CategoriesController < Api::V1::BaseController
  skip_before_action :authenticate_user!, only: [:index, :show]
  before_action :set_category, only: [:show]

  def index
    categories = Category.all.order(:category_type, :name)

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
    @category = Category.find_by(id: params[:id])
    render_not_found('Category') unless @category
  end
end