class CreateNotificationSettings < ActiveRecord::Migration[8.0]
  def change
    create_table :notification_settings, id: :string do |t|
      t.references :user, type: :string, null: false, foreign_key: true, index: { unique: true }
      t.boolean :enabled, default: false, null: false
      t.string :reminder_time, null: false, default: "20:00"
      t.string :timezone, null: false, default: "UTC"
      t.integer :utc_offset, null: false, default: 0
      t.json :days_of_week, null: false, default: [1, 2, 3, 4, 5, 6, 0]
      t.datetime :next_send_time_utc

      t.timestamps
    end

    # Индекс для быстрого поиска пользователей, которым нужно отправить уведомления
    add_index :notification_settings, [:enabled, :next_send_time_utc], name: 'index_notifications_for_sending'
  end
end
