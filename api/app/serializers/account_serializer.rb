class AccountSerializer < ActiveModel::Serializer
  attributes :id, :name, :account_type, :balance, :currency, :created_at
  belongs_to :user
end