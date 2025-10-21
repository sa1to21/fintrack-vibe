require 'csv'

class Api::V1::ExportsController < Api::V1::BaseController
  def transactions_csv
    transactions = current_user.transactions
      .includes(:category, :account)
      .order(date: :desc, time: :desc)

    csv_data = CSV.generate(headers: true, col_sep: ';', encoding: 'UTF-8') do |csv|
      # Заголовки
      csv << ['Дата', 'Время', 'Категория', 'Счёт', 'Сумма', 'Валюта', 'Тип', 'Описание']

      # Данные транзакций
      transactions.each do |transaction|
        csv << [
          transaction.date.strftime('%Y-%m-%d'),
          transaction.time.strftime('%H:%M'),
          transaction.category&.name || 'Без категории',
          transaction.account&.name || 'Неизвестный счёт',
          transaction.amount,
          transaction.account&.currency || 'RUB',
          transaction_type_name(transaction.transaction_type),
          transaction.description || ''
        ]
      end
    end

    # Добавляем BOM для корректного открытия в Excel
    csv_with_bom = "\uFEFF" + csv_data

    send_data csv_with_bom,
              filename: "fintrack-transactions-#{Date.today}.csv",
              type: 'text/csv; charset=utf-8',
              disposition: 'attachment'
  end

  private

  def transaction_type_name(type)
    case type
    when 'income'
      'Доход'
    when 'expense'
      'Расход'
    when 'transfer'
      'Перевод'
    else
      type
    end
  end
end
