class Api::V1::CategoriesController < Api::V1::BaseController
  before_action :set_category, only: [:show, :update, :destroy]

  def index
    categories = current_user.categories.where(is_system: false).order(:category_type, :name)

    # Filter by type if specified
    if params[:type].present? && %w[income expense].include?(params[:type])
      categories = categories.where(category_type: params[:type])
    end

    render json: categories, each_serializer: CategorySerializer
  end

  def show
    render json: @category, serializer: CategorySerializer
  end

  def create
    category = current_user.categories.build(category_params)

    if category.save
      render json: category, serializer: CategorySerializer, status: :created
    else
      render json: { errors: category.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @category.update(category_params)
      render json: @category, serializer: CategorySerializer
    else
      render json: { errors: @category.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    # Проверяем, есть ли транзакции с этой категорией
    if @category.transactions.exists?
      render json: {
        error: 'Невозможно удалить категорию, к которой привязаны транзакции',
        transactions_count: @category.transactions.count
      }, status: :unprocessable_entity
      return
    end

    @category.destroy
    head :no_content
  end

  private

  def set_category
    @category = current_user.categories.find_by(id: params[:id])
    render_not_found('Category') unless @category
  end

  def category_params
    params.require(:category).permit(:name, :category_type, :color, :icon)
  end
end