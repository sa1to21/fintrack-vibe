class Api::V1::AccountsController < Api::V1::BaseController
  before_action :set_account, only: [:show, :update, :destroy]

  def index
    accounts = current_user.accounts.includes(:transactions)

    # Filter by debt type if requested
    if params[:type] == 'debt'
      accounts = accounts.debts
    elsif params[:type] == 'regular'
      accounts = accounts.regular
    end

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

  def debt_stats
    debts = current_user.accounts.debts

    total_debt = debts.sum(&:balance).abs
    total_initial = debts.sum { |d| d.debt_info&.dig('initialAmount').to_f || 0 }
    total_paid = total_initial - total_debt

    debts_data = debts.map do |debt|
      {
        id: debt.id,
        name: debt.name,
        creditor: debt.debt_info&.dig('creditorName'),
        balance: debt.balance.abs,
        initial_amount: debt.debt_info&.dig('initialAmount'),
        due_date: debt.debt_info&.dig('dueDate'),
        progress: debt.debt_progress,
        currency: debt.currency
      }
    end

    render json: {
      total_debt: total_debt,
      total_initial: total_initial,
      total_paid: total_paid,
      overall_progress: total_initial.zero? ? 0 : (total_paid / total_initial * 100).round(2),
      debts: debts_data
    }
  end

  private

  def set_account
    @account = current_user.accounts.find_by(id: params[:id])
    render_not_found('Account') unless @account
  end

  def account_params
    params.require(:account).permit(:name, :account_type, :balance, :currency, :is_debt, debt_info: {})
  end
end