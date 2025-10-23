class AccountSerializer < ActiveModel::Serializer
  attributes :id, :name, :account_type, :balance, :currency, :created_at, :is_debt, :debt_info, :debt_progress
  belongs_to :user

  def debt_progress
    object.debt_progress
  end
end