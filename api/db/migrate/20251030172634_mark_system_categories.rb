class MarkSystemCategories < ActiveRecord::Migration[8.0]
  def up
    # Помечаем существующие служебные категории как системные
    Category.where(name: ['Перевод', 'Погашение задолженности']).update_all(is_system: true)
  end

  def down
    # Снимаем пометку системных категорий
    Category.where(name: ['Перевод', 'Погашение задолженности']).update_all(is_system: false)
  end
end
