# Enable notifications and test
setting = NotificationSetting.first
setting.enabled = true
setting.next_send_time_utc = 1.minute.ago
setting.save!

puts "✅ Updated notification setting:"
puts "   Enabled: #{setting.enabled}"
puts "   Next send time (UTC): #{setting.next_send_time_utc}"
puts "   Current time (UTC): #{Time.current}"
puts "   Days: #{setting.days_of_week}"

# Check scope
ready = NotificationSetting.ready_to_send.includes(:user)
puts "\n🔍 Ready to send: #{ready.count} notifications"

if ready.any?
  ready.each do |ns|
    puts "   ✓ User: #{ns.user.name} (Telegram ID: #{ns.user.telegram_id})"
  end
  puts "\n✅ Notification is ready to send!"
else
  puts "   ✗ No notifications ready to send"
end
