class FixNotificationSettingsIdType < ActiveRecord::Migration[8.0]
  def up
    # Удаляем старую таблицу и создаём заново с правильным типом id
    drop_table :notification_settings if table_exists?(:notification_settings)

    create_table :notification_settings do |t|
      t.references :user, type: :string, null: false, foreign_key: true, index: { unique: true }
      t.boolean :enabled, default: true, null: false
      t.string :reminder_time, null: false, default: "20:00"
      t.string :timezone, null: false, default: "UTC"
      t.integer :utc_offset, null: false, default: 0
      t.json :days_of_week, null: false, default: [1, 2, 3, 4, 5, 6, 0]
      t.datetime :next_send_time_utc

      t.timestamps
    end

    # Индекс для быстрого поиска пользователей, которым нужно отправить уведомления
    add_index :notification_settings, [:enabled, :next_send_time_utc], name: 'index_notifications_for_sending'

    # Создаём настройки для всех существующих пользователей
    User.find_each do |user|
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
    drop_table :notification_settings if table_exists?(:notification_settings)
  end
end
