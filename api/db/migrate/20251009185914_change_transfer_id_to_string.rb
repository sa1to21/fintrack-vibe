class ChangeTransferIdToString < ActiveRecord::Migration[8.0]
  def change
    change_column :transactions, :transfer_id, :string
  end
end
