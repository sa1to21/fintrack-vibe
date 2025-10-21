require 'csv'
require 'tempfile'

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

    # Формируем имя файла с username и датой
    username = current_user.username.present? ? "@#{current_user.username}" : "user"
    date_str = Time.current.strftime('%Y-%m-%d')
    filename = "fintrack-transactions-#{username}-#{date_str}.csv"

    # Создаём временный файл
    temp_file = Tempfile.new(['fintrack-transactions', '.csv'], encoding: 'utf-8')
    begin
      temp_file.write(csv_with_bom)
      temp_file.close

      # Отправляем через Telegram бота
      telegram_id = current_user.telegram_id
      if telegram_id
        success = TelegramService.send_document(
          chat_id: telegram_id,
          file_path: temp_file.path,
          filename: filename,
          caption: "📊 Экспорт транзакций (#{transactions.count} записей)"
        )

        if success
          render json: { message: 'Файл отправлен в чат' }, status: :ok
        else
          render json: { error: 'Не удалось отправить файл' }, status: :unprocessable_entity
        end
      else
        render json: { error: 'Telegram ID не найден' }, status: :unprocessable_entity
      end
    ensure
      temp_file.unlink # Удаляем временный файл
    end
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
