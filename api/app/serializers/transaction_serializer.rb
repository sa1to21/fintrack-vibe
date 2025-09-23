class TransactionSerializer < ActiveModel::Serializer
  attributes :id, :amount, :transaction_type, :description, :date, :time, :created_at
  belongs_to :account
  belongs_to :category
end