class UserSerializer < ActiveModel::Serializer
  attributes :id, :name, :email, :base_currency, :language_code, :created_at
  has_many :accounts
end