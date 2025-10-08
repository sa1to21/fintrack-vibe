class TransactionSerializer < ActiveModel::Serializer
  attributes :id, :amount, :transaction_type, :description, :date, :time, :created_at, :account_id, :category_id
  belongs_to :account
  belongs_to :category
end