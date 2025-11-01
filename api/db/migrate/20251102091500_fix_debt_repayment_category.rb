class FixDebtRepaymentCategory < ActiveRecord::Migration[7.1]
  class Category < ActiveRecord::Base
    self.table_name = 'categories'
  end

  class Transaction < ActiveRecord::Base
    self.table_name = 'transactions'
  end

  def up
    Category.reset_column_information
    Transaction.reset_column_information

    Category.where(name: 'Погашение долга', category_type: 'expense').find_each do |category|
      existing = Category.find_by(
        user_id: category.user_id,
        name: 'Погашение задолженности',
        category_type: 'expense'
      )

      if existing
        Transaction.where(category_id: category.id).update_all(category_id: existing.id)
        updates = {}
        updates[:is_system] = true unless existing.is_system?
        updates[:icon] = '💳' if existing.icon.blank?
        existing.update!(updates) if updates.any?
        category.destroy!
      else
        category.update!(
          name: 'Погашение задолженности',
          is_system: true,
          icon: category.icon.presence || '💳'
        )
      end
    end

    Category.where(name: 'Погашение задолженности', category_type: 'expense').find_each do |category|
      updates = {}
      updates[:is_system] = true unless category.is_system?
      updates[:icon] = '💳' if category.icon.blank?
      category.update!(updates) if updates.any?
    end

    Category.where(name: 'Перевод', category_type: 'expense').find_each do |category|
      updates = {}
      updates[:is_system] = true unless category.is_system?
      updates[:icon] = '🔄' if category.icon.blank?
      category.update!(updates) if updates.any?
    end
  end

  def down
    # intentionally left blank – fixing legacy data is not reversible
  end
end
