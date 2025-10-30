namespace :notifications do
  desc "Send reminder notifications to users"
  task send_reminders: :environment do
    require 'net/http'
    require 'json'

    bot_token = ENV['TELEGRAM_BOT_TOKEN']
    webapp_url = ENV['WEBAPP_URL'] || 'https://financetrack21.netlify.app'

    unless bot_token
      puts "ERROR: TELEGRAM_BOT_TOKEN environment variable is not set"
      exit 1
    end

    # Находим всех пользователей, которым нужно отправить уведомление
    settings = NotificationSetting.ready_to_send.includes(:user)

    puts "Found #{settings.count} users ready for reminders"

    settings.each do |setting|
      user = setting.user

      # Пропускаем пользователей без Telegram ID
      unless user.telegram_id
        puts "Skipping user #{user.id} - no telegram_id"
        next
      end

      # Получаем последнюю транзакцию пользователя
      last_transaction = user.transactions.order(created_at: :desc).first
      last_activity_text = if last_transaction
        time_ago = Time.current - last_transaction.created_at
        hours = (time_ago / 3600).round
        if hours < 1
          "меньше часа назад"
        elsif hours < 24
          hours_word = hours == 1 ? 'час' : (hours < 5 ? 'часа' : 'часов')
          "#{hours} #{hours_word} назад"
        else
          days = (hours / 24).round
          days_word = days == 1 ? 'день' : (days < 5 ? 'дня' : 'дней')
          "#{days} #{days_word} назад"
        end
      else
        "еще не было операций"
      end

      # Формируем сообщение
      message = <<~TEXT
        💰 Напоминание от WiseTrack

        Не забудь внести свои траты за сегодня!

        📊 Последняя операция: #{last_activity_text}
      TEXT

      # Кнопка для открытия приложения
      keyboard = {
        inline_keyboard: [
          [{
            text: "💰 Открыть WiseTrack",
            web_app: { url: webapp_url }
          }]
        ]
      }

      # Отправляем через Telegram API
      uri = URI("https://api.telegram.org/bot#{bot_token}/sendMessage")
      request = Net::HTTP::Post.new(uri, 'Content-Type' => 'application/json')
      request.body = {
        chat_id: user.telegram_id,
        text: message,
        reply_markup: keyboard,
        parse_mode: 'HTML'
      }.to_json

      begin
        response = Net::HTTP.start(uri.hostname, uri.port, use_ssl: true) do |http|
          http.request(request)
        end

        if response.is_a?(Net::HTTPSuccess)
          puts "✓ Sent reminder to user #{user.id} (#{user.name})"
          # Планируем следующую отправку
          setting.schedule_next_send!
        else
          puts "✗ Failed to send to user #{user.id}: #{response.body}"
        end
      rescue => e
        puts "✗ Error sending to user #{user.id}: #{e.message}"
      end

      # Небольшая задержка между отправками, чтобы не попасть в rate limit
      sleep 0.1
    end

    puts "Notification task completed"
  end
end
