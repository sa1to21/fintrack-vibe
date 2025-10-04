class AddTelegramFieldsToUsers < ActiveRecord::Migration[8.0]
  def change
    add_column :users, :telegram_id, :bigint
    add_column :users, :username, :string
    add_column :users, :language_code, :string

    add_index :users, :telegram_id, unique: true

    # Делаем email необязательным для Telegram пользователей
    change_column_null :users, :email, true
    change_column_null :users, :password_digest, true
  end
end
