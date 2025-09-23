class CreateTransactions < ActiveRecord::Migration[8.0]
  def change
    create_table :transactions, id: :uuid do |t|
      t.decimal :amount, precision: 10, scale: 2, null: false
      t.string :transaction_type, null: false
      t.text :description, null: false
      t.date :date, null: false
      t.time :time, null: false
      t.references :account, null: false, foreign_key: true, type: :uuid
      t.references :category, null: false, foreign_key: true, type: :uuid
      t.timestamps
    end

    add_index :transactions, [:account_id, :date]
    add_index :transactions, [:category_id, :transaction_type]
  end
end