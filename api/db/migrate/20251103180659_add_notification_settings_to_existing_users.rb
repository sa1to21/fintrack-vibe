class AddNotificationSettingsToExistingUsers < ActiveRecord::Migration[8.0]
  def up
    # Создаём настройки уведомлений для всех пользователей, у которых их нет
    User.find_each do |user|
      next if user.notification_setting.present?

      user.create_notification_setting!(
        enabled: true,
        reminder_time: '20:00',
        timezone: 'User/Local',
        utc_offset: 180,
        days_of_week: [0, 1, 2, 3, 4, 5, 6]
      )

      Rails.logger.info "Created notification settings for user #{user.id}"
    rescue => e
      Rails.logger.error "Failed to create notification settings for user #{user.id}: #{e.message}"
    end
  end

  def down
    # Не удаляем настройки при откате миграции
  end
end
