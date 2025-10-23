class CalculateInterestJob < ApplicationJob
  queue_as :default

  def perform
    # Find all savings accounts that need interest accrual
    Account.savings_accounts.find_each do |account|
      calculator = InterestCalculator.new(account)

      begin
        transaction = calculator.accrue_interest!

        if transaction
          Rails.logger.info "Accrued interest for account #{account.id}: #{transaction.amount} #{account.currency}"
        end
      rescue => e
        Rails.logger.error "Failed to accrue interest for account #{account.id}: #{e.message}"
      end
    end
  end
end
