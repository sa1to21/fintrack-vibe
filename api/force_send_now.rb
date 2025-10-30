# Форсируем отправку прямо сейчас
user = User.first
setting = user.notification_setting

# Устанавливаем время отправки на 2 минуты назад
setting.update_column(:next_send_time_utc, 2.minutes.ago)

puts "✅ Forced next_send_time_utc to: #{setting.reload.next_send_time_utc}"
puts "   Current time (UTC): #{Time.current}"

# Проверяем
ready = NotificationSetting.ready_to_send.includes(:user)
puts "\n📬 Ready to send: #{ready.count}"

if ready.any?
  puts "   ✓ Great! Notification is ready"
  puts "\n🚀 Now run: bundle exec rake notifications:send_reminders"
end
