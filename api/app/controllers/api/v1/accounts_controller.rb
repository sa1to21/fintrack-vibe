class Api::V1::AccountsController < Api::V1::BaseController
  before_action :set_account, only: [:show, :update, :destroy]

  def index
    accounts = current_user.accounts.includes(:transactions)
    render json: accounts, each_serializer: AccountSerializer
  end

  def show
    render json: @account, serializer: AccountSerializer
  end

  def create
    account = current_user.accounts.build(account_params)

    if account.save
      render json: account, serializer: AccountSerializer, status: :created
    else
      render_validation_errors(account)
    end
  end

  def update
    if @account.update(account_params)
      render json: @account, serializer: AccountSerializer
    else
      render_validation_errors(@account)
    end
  end

  def destroy
    @account.destroy
    head :no_content
  end

  private

  def set_account
    @account = current_user.accounts.find_by(id: params[:id])
    render_not_found('Account') unless @account
  end

  def account_params
    params.require(:account).permit(:name, :account_type, :balance, :currency)
  end
end