class CreateAccounts < ActiveRecord::Migration[8.0]
  def change
    create_table :accounts, id: :uuid do |t|
      t.string :name, null: false
      t.string :account_type, null: false
      t.decimal :balance, precision: 10, scale: 2, default: 0
      t.string :currency, default: 'RUB'
      t.references :user, null: false, foreign_key: true, type: :uuid
      t.timestamps
    end
  end
end