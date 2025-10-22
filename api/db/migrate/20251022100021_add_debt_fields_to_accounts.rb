class AddDebtFieldsToAccounts < ActiveRecord::Migration[8.0]
  def change
    add_column :accounts, :is_debt, :boolean, default: false, null: false
    add_column :accounts, :debt_info, :json
  end
end
