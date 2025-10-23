class AccountSerializer < ActiveModel::Serializer
  attributes :id, :name, :account_type, :balance, :currency, :created_at, :is_debt, :debt_info, :debt_progress,
             :is_savings_account, :interest_rate, :deposit_term_months, :deposit_start_date, :deposit_end_date,
             :auto_renewal, :withdrawal_allowed, :target_amount, :last_interest_date
  belongs_to :user

  def debt_progress
    object.debt_progress
  end
end