class AddSavingsFieldsToAccounts < ActiveRecord::Migration[8.0]
  def change
    add_column :accounts, :is_savings_account, :boolean, default: false, null: false
    add_column :accounts, :interest_rate, :decimal, precision: 5, scale: 2
    add_column :accounts, :deposit_term_months, :integer
    add_column :accounts, :deposit_start_date, :date
    add_column :accounts, :deposit_end_date, :date
    add_column :accounts, :auto_renewal, :boolean, default: false
    add_column :accounts, :withdrawal_allowed, :boolean, default: true
    add_column :accounts, :target_amount, :decimal, precision: 15, scale: 2
    add_column :accounts, :last_interest_date, :date
  end
end
