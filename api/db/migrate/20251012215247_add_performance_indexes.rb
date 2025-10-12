class AddPerformanceIndexes < ActiveRecord::Migration[8.0]
  def change
    # Индексы для transactions таблицы
    add_index :transactions, :paired_transaction_id, if_not_exists: true
    add_index :transactions, :category_id, if_not_exists: true
    add_index :transactions, [:account_id, :created_at], if_not_exists: true
    add_index :transactions, :transfer_id, if_not_exists: true

    # Индекс для accounts
    add_index :accounts, :user_id, if_not_exists: true

    # Индекс для categories
    add_index :categories, :user_id, if_not_exists: true
  end
end
