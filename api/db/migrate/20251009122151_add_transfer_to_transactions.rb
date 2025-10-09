class AddTransferToTransactions < ActiveRecord::Migration[8.0]
  def change
    add_column :transactions, :transfer_id, :integer
    add_column :transactions, :paired_transaction_id, :integer
  end
end
