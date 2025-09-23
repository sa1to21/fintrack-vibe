class CreateCategories < ActiveRecord::Migration[8.0]
  def change
    create_table :categories, id: :uuid do |t|
      t.string :name, null: false, index: { unique: true }
      t.string :category_type, null: false
      t.string :icon
      t.string :color
      t.timestamps
    end
  end
end