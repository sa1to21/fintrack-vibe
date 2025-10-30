class AddIsSystemToCategories < ActiveRecord::Migration[8.0]
  def change
    add_column :categories, :is_system, :boolean, default: false, null: false
  end
end
