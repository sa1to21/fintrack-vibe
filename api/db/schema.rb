# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.0].define(version: 2025_11_02_091500) do
  create_table "accounts", force: :cascade do |t|
    t.string "name", null: false
    t.string "account_type", null: false
    t.decimal "balance", precision: 10, scale: 2, default: "0.0"
    t.string "currency", default: "RUB"
    t.integer "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "is_debt", default: false, null: false
    t.json "debt_info"
    t.integer "display_order", default: 0, null: false
    t.boolean "is_savings_account", default: false, null: false
    t.decimal "interest_rate", precision: 5, scale: 2
    t.integer "deposit_term_months"
    t.date "deposit_start_date"
    t.date "deposit_end_date"
    t.boolean "auto_renewal", default: false
    t.boolean "withdrawal_allowed", default: true
    t.decimal "target_amount", precision: 15, scale: 2
    t.date "last_interest_date"
    t.index ["user_id", "display_order"], name: "index_accounts_on_user_id_and_display_order"
    t.index ["user_id"], name: "index_accounts_on_user_id"
  end

  create_table "categories", force: :cascade do |t|
    t.string "name", null: false
    t.string "category_type", null: false
    t.string "icon"
    t.string "color"
    t.integer "user_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "is_system", default: false, null: false
    t.index ["user_id", "name"], name: "index_categories_on_user_id_and_name", unique: true
    t.index ["user_id"], name: "index_categories_on_user_id"
  end

  create_table "notification_settings", id: :string, force: :cascade do |t|
    t.string "user_id", null: false
    t.boolean "enabled", default: false, null: false
    t.string "reminder_time", default: "20:00", null: false
    t.string "timezone", default: "UTC", null: false
    t.integer "utc_offset", default: 0, null: false
    t.json "days_of_week", default: [1, 2, 3, 4, 5, 6, 0], null: false
    t.datetime "next_send_time_utc"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["enabled", "next_send_time_utc"], name: "index_notifications_for_sending"
    t.index ["user_id"], name: "index_notification_settings_on_user_id", unique: true
  end

  create_table "transactions", force: :cascade do |t|
    t.decimal "amount", precision: 10, scale: 2, null: false
    t.string "transaction_type", null: false
    t.text "description"
    t.date "date", null: false
    t.time "time"
    t.integer "account_id", null: false
    t.integer "category_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "transfer_id"
    t.integer "paired_transaction_id"
    t.index ["account_id", "created_at"], name: "index_transactions_on_account_id_and_created_at"
    t.index ["account_id", "date"], name: "index_transactions_on_account_id_and_date"
    t.index ["account_id"], name: "index_transactions_on_account_id"
    t.index ["category_id", "transaction_type"], name: "index_transactions_on_category_id_and_transaction_type"
    t.index ["category_id"], name: "index_transactions_on_category_id"
    t.index ["paired_transaction_id"], name: "index_transactions_on_paired_transaction_id"
    t.index ["transfer_id"], name: "index_transactions_on_transfer_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "name", null: false
    t.string "email"
    t.string "password_digest"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "telegram_id"
    t.string "username"
    t.string "language_code"
    t.string "base_currency", default: "RUB", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["telegram_id"], name: "index_users_on_telegram_id", unique: true
  end

  add_foreign_key "accounts", "users"
  add_foreign_key "categories", "users"
  add_foreign_key "notification_settings", "users"
  add_foreign_key "transactions", "accounts"
  add_foreign_key "transactions", "categories"
end
