class Api::V1::DashboardController < Api::V1::BaseController
  def index
    # Загружаем все счета пользователя
    accounts = current_user.accounts

    # Загружаем последние 20 транзакций со всех счетов
    transactions = Transaction
      .where(account: accounts)
      .includes(:category, :paired_transaction)
      .order(created_at: :desc)
      .limit(20)

    render json: {
      accounts: ActiveModelSerializers::SerializableResource.new(
        accounts,
        each_serializer: AccountSerializer
      ).as_json,
      transactions: ActiveModelSerializers::SerializableResource.new(
        transactions,
        each_serializer: TransactionSerializer
      ).as_json
    }
  end
end
