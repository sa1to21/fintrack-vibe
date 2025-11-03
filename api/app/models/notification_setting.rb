class NotificationSetting < ApplicationRecord
  belongs_to :user

  validates :reminder_time, presence: true, format: { with: /\A([01]\d|2[0-3]):([0-5]\d)\z/, message: "must be in HH:MM format" }
  validates :timezone, presence: true
  validates :utc_offset, presence: true, numericality: { only_integer: true }
  validates :days_of_week, presence: true
  validate :days_of_week_valid

  before_save :calculate_next_send_time

  # Найти все настройки, которым нужно отправить уведомление сейчас
  scope :ready_to_send, -> {
    where(enabled: true)
      .where('next_send_time_utc <= ?', Time.current)
      .where('next_send_time_utc >= ?', 5.minutes.ago)
  }

  # Обновить следующее время отправки после отправки уведомления
  def schedule_next_send!
    calculate_next_send_time
    save!
  end

  private

  def days_of_week_valid
    unless days_of_week.is_a?(Array) && days_of_week.all? { |d| (0..6).include?(d) }
      errors.add(:days_of_week, "must be an array of integers from 0 to 6")
    end
  end

  # Вычисляет следующее время отправки уведомления в UTC
  def calculate_next_send_time
    return unless enabled && reminder_time.present?

    hour, minute = reminder_time.split(':').map(&:to_i)

    # Текущее время в UTC
    now_utc = Time.current.utc

    # Конвертируем текущее UTC время в локальное время пользователя
    now_local = now_utc + utc_offset.minutes

    # Создаём время напоминания на "сегодня" в локальном времени пользователя
    today_local = Time.new(now_local.year, now_local.month, now_local.day, hour, minute, 0, 0)

    # Если время уже прошло сегодня, берём завтра
    next_send_local = if now_local >= today_local
      today_local + 1.day
    else
      today_local
    end

    # Ищем следующий подходящий день недели (в локальном времени пользователя)
    7.times do
      if days_of_week.include?(next_send_local.wday)
        # Конвертируем локальное время обратно в UTC для сохранения
        self.next_send_time_utc = next_send_local - utc_offset.minutes
        return
      end
      next_send_local += 1.day
    end

    # Если не нашли подходящий день (не должно случиться), устанавливаем nil
    self.next_send_time_utc = nil
  end
end
