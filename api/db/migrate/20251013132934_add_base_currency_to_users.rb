class AddBaseCurrencyToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :base_currency, :string, default: 'RUB', null: false
  end
end
