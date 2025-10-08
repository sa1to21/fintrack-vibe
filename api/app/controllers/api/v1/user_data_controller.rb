class Api::V1::UserDataController < Api::V1::BaseController
  # DELETE /api/v1/user_data
  def destroy_all
    ActiveRecord::Base.transaction do
      # Удаляем все транзакции пользователя через счета
      current_user.accounts.each do |account|
        account.transactions.destroy_all
      end

      # Удаляем все счета
      current_user.accounts.destroy_all

      # Удаляем все категории
      current_user.categories.destroy_all

      # Создаём стандартный счёт и категории заново
      create_default_account
      create_default_categories
    end

    render json: { message: 'All data has been deleted successfully' }, status: :ok
  rescue => e
    render json: { error: 'Failed to delete data', details: e.message }, status: :unprocessable_entity
  end

  private

  def create_default_account
    current_user.accounts.create!(
      name: 'Основной счёт',
      account_type: 'cash',
      balance: 0,
      currency: 'RUB'
    )
  end

  def create_default_categories
    default_categories = [
      { name: 'Продукты', category_type: 'expense', icon: '🛒', color: '#FF6B6B' },
      { name: 'Транспорт', category_type: 'expense', icon: '🚗', color: '#4ECDC4' },
      { name: 'Кафе и рестораны', category_type: 'expense', icon: '🍔', color: '#FFD93D' },
      { name: 'Развлечения', category_type: 'expense', icon: '🎮', color: '#A8E6CF' },
      { name: 'Здоровье', category_type: 'expense', icon: '💊', color: '#FF8B94' },
      { name: 'Покупки', category_type: 'expense', icon: '🛍️', color: '#C7CEEA' },
      { name: 'Зарплата', category_type: 'income', icon: '💰', color: '#95E1D3' },
      { name: 'Фриланс', category_type: 'income', icon: '💼', color: '#6C5CE7' },
      { name: 'Подарки', category_type: 'income', icon: '🎁', color: '#FDCB6E' }
    ]

    default_categories.each do |cat_attrs|
      current_user.categories.find_or_create_by!(name: cat_attrs[:name]) do |category|
        category.category_type = cat_attrs[:category_type]
        category.icon = cat_attrs[:icon]
        category.color = cat_attrs[:color]
      end
    end
  end
end
