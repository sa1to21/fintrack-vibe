# Тест отправки напоминания прямо сейчас
user = User.first
puts "User: #{user.name} (ID: #{user.id}, Telegram ID: #{user.telegram_id})"

# Обновляем настройки так, чтобы отправка была прямо сейчас
setting = user.notification_setting
setting.next_send_time_utc = 1.minute.ago  # Устанавливаем время в прошлом
setting.save!

puts "\n✅ Updated notification setting:"
puts "   Next send time (UTC): #{setting.next_send_time_utc}"
puts "   Current time (UTC): #{Time.current}"
puts "   Difference: #{((Time.current - setting.next_send_time_utc) / 60).round} minutes"

# Проверяем scope
ready = NotificationSetting.ready_to_send.includes(:user)
puts "\n🔍 Ready to send: #{ready.count} notifications"

if ready.any?
  ready.each do |ns|
    puts "   ✓ User: #{ns.user.name} (Telegram ID: #{ns.user.telegram_id})"
  end

  puts "\n🚀 Now let's test sending via rake task..."
  puts "   Run: bundle exec rake notifications:send_reminders"
else
  puts "   ✗ No notifications ready to send"
end
