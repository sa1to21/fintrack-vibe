require 'faraday'
require 'faraday/multipart'

class TelegramService
  TELEGRAM_API_URL = "https://api.telegram.org"

  def self.send_document(chat_id:, file_path:, filename: nil, caption: nil)
    bot_token = ENV['TELEGRAM_BOT_TOKEN']

    unless bot_token
      Rails.logger.error "TELEGRAM_BOT_TOKEN не установлен в переменных окружения"
      return false
    end

    url = "#{TELEGRAM_API_URL}/bot#{bot_token}/sendDocument"

    conn = Faraday.new do |f|
      f.request :multipart
      f.request :url_encoded
      f.adapter Faraday.default_adapter
    end

    file = Faraday::Multipart::FilePart.new(
      file_path,
      'text/csv',
      filename || File.basename(file_path)
    )

    payload = {
      chat_id: chat_id,
      document: file
    }

    payload[:caption] = caption if caption

    begin
      response = conn.post(url, payload)
      result = JSON.parse(response.body)

      if result['ok']
        Rails.logger.info "Файл успешно отправлен в чат #{chat_id}"
        true
      else
        Rails.logger.error "Ошибка отправки файла: #{result['description']}"
        false
      end
    rescue => e
      Rails.logger.error "Исключение при отправке файла в Telegram: #{e.message}"
      false
    end
  end
end
