class UserSerializer < ActiveModel::Serializer
  attributes :id, :name, :email, :base_currency, :created_at
  has_many :accounts
end