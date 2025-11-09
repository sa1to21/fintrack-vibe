# Script to create default notification settings for existing users
# This ensures all users have notification settings created

puts "Creating notification settings for users without them..."

User.find_each do |user|
  next if user.notification_setting.present?

  # Default to UTC+3 (Moscow time)
  utc_offset = 180

  user.create_notification_setting(
    enabled: true,
    reminder_time: '20:00',
    timezone: 'User/Local',
    utc_offset: utc_offset,
    days_of_week: [0, 1, 2, 3, 4, 5, 6]
  )

  puts "Created notification settings for user #{user.id} (#{user.name})"
end

puts "Done! All users now have notification settings."
puts "Total users: #{User.count}"
puts "Users with notification settings: #{User.joins(:notification_setting).count}"
