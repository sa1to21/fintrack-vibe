# Тестовый скрипт для проверки notification settings
user = User.first
puts "User: #{user.name} (ID: #{user.id})"

# Удаляем старые настройки, если есть
user.notification_setting&.destroy

# Создаём настройки уведомлений
setting = user.build_notification_setting(
  enabled: true,
  reminder_time: '00:25',  # Ближайшее время для теста
  timezone: 'Asia/Tbilisi',
  utc_offset: 240,  # UTC+4 = 240 минут
  days_of_week: [1, 2, 3, 4, 5, 6, 0]  # Все дни
)
setting.id = SecureRandom.uuid
setting.save!

puts "\n✅ Created notification setting:"
puts "   ID: #{setting.id}"
puts "   Enabled: #{setting.enabled}"
puts "   Reminder time: #{setting.reminder_time}"
puts "   Timezone: #{setting.timezone}"
puts "   UTC offset: #{setting.utc_offset} minutes"
puts "   Days of week: #{setting.days_of_week.inspect}"
puts "   Next send time (UTC): #{setting.next_send_time_utc}"
puts "   Next send time (local): #{setting.next_send_time_utc + setting.utc_offset.minutes}"
puts "   Current time (UTC): #{Time.current}"

# Проверяем scope ready_to_send
puts "\n🔍 Checking ready_to_send scope:"
ready = NotificationSetting.ready_to_send
puts "   Found #{ready.count} notifications ready to send"

if ready.any?
  ready.each do |ns|
    puts "   - User #{ns.user.name}: next_send_time_utc = #{ns.next_send_time_utc}"
  end
end
