class Api::V1::TransactionsController < Api::V1::BaseController
  before_action :set_account, only: [:index, :create]
  before_action :set_transaction, only: [:show, :update, :destroy]

  def index
    transactions = @account.transactions.includes(:category).order(date: :desc, time: :desc)
    render json: transactions, each_serializer: TransactionSerializer
  end

  def show
    render json: @transaction, serializer: TransactionSerializer
  end

  def create
    transaction = @account.transactions.build(transaction_params)

    if transaction.save
      render json: transaction, serializer: TransactionSerializer, status: :created
    else
      render_validation_errors(transaction)
    end
  end

  def update
    if @transaction.update(transaction_params)
      render json: @transaction, serializer: TransactionSerializer
    else
      render_validation_errors(@transaction)
    end
  end

  def destroy
    @transaction.destroy
    head :no_content
  end

  private

  def set_account
    @account = current_user.accounts.find_by(id: params[:account_id])
    render_not_found('Account') unless @account
  end

  def set_transaction
    @transaction = current_user.transactions.find_by(id: params[:id])
    render_not_found('Transaction') unless @transaction
  end

  def transaction_params
    params.require(:transaction).permit(:amount, :transaction_type, :description, :date, :time, :category_id)
  end
end