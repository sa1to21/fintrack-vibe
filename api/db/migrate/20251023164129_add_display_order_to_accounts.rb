class AddDisplayOrderToAccounts < ActiveRecord::Migration[8.0]
  def change
    add_column :accounts, :display_order, :integer, default: 0, null: false
    add_index :accounts, [:user_id, :display_order]

    # Set initial display_order for existing accounts
    reversible do |dir|
      dir.up do
        execute <<-SQL
          UPDATE accounts
          SET display_order = (
            SELECT COUNT(*)
            FROM accounts AS a2
            WHERE a2.user_id = accounts.user_id
            AND a2.id <= accounts.id
          )
        SQL
      end
    end
  end
end
