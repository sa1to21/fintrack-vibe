namespace :transfers do
  desc "Fix old transfers by adding transfer_id and paired_transaction_id"
  task fix_old: :environment do
    puts "Starting to fix old transfers..."

    # Находим категорию "Перевод"
    transfer_category = Category.find_by(name: 'Перевод')

    unless transfer_category
      puts "Transfer category not found. Skipping."
      exit
    end

    # Находим все транзакции с категорией "Перевод" без transfer_id
    old_transfers = Transaction.where(category_id: transfer_category.id, transfer_id: nil)

    puts "Found #{old_transfers.count} old transfer transactions"

    # Группируем по описанию и времени создания (в пределах 1 секунды)
    old_transfers.each do |expense_tx|
      next if expense_tx.transfer_id.present? # Уже обработана
      next unless expense_tx.transaction_type == 'expense'

      # Ищем парную income транзакцию
      income_tx = Transaction.where(
        category_id: transfer_category.id,
        amount: expense_tx.amount,
        transaction_type: 'income',
        transfer_id: nil
      ).where("ABS(strftime('%s', created_at) - strftime('%s', ?)) <= 2", expense_tx.created_at).first

      if income_tx
        # Создаём UUID и связываем транзакции
        transfer_id = SecureRandom.uuid

        ActiveRecord::Base.transaction do
          expense_tx.update!(transfer_id: transfer_id, paired_transaction_id: income_tx.id)
          income_tx.update!(transfer_id: transfer_id, paired_transaction_id: expense_tx.id)
          puts "Linked transfer: expense ##{expense_tx.id} <-> income ##{income_tx.id} (transfer_id: #{transfer_id})"
        end
      else
        puts "No matching income found for expense ##{expense_tx.id}"
      end
    end

    puts "Done!"
  end
end
