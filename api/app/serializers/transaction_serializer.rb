class TransactionSerializer < ActiveModel::Serializer
  attributes :id, :amount, :transaction_type, :description, :date, :time, :created_at, :account_id, :category_id, :transfer_id, :paired_transaction_id, :paired_account_id
  belongs_to :account
  belongs_to :category

  def paired_account_id
    object.paired_transaction&.account_id
  end
end