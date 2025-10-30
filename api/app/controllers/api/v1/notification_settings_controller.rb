class Api::V1::NotificationSettingsController < Api::V1::BaseController
  before_action :set_notification_setting, only: [:show, :update]

  # GET /api/v1/notification_settings
  def show
    if @notification_setting
      render json: @notification_setting
    else
      # Возвращаем дефолтные настройки, если их ещё нет
      render json: {
        id: nil,
        user_id: current_user.id,
        enabled: false,
        reminder_time: "20:00",
        timezone: "UTC",
        utc_offset: 0,
        days_of_week: [1, 2, 3, 4, 5, 6, 0],
        next_send_time_utc: nil
      }
    end
  end

  # POST /api/v1/notification_settings or PATCH /api/v1/notification_settings
  def update
    if @notification_setting
      # Обновляем существующие настройки
      if @notification_setting.update(notification_setting_params)
        render json: @notification_setting
      else
        render_validation_errors(@notification_setting)
      end
    else
      # Создаём новые настройки
      @notification_setting = current_user.build_notification_setting(notification_setting_params)
      @notification_setting.id = SecureRandom.uuid

      if @notification_setting.save
        render json: @notification_setting, status: :created
      else
        render_validation_errors(@notification_setting)
      end
    end
  end

  private

  def set_notification_setting
    @notification_setting = current_user.notification_setting
  end

  def notification_setting_params
    params.require(:notification_setting).permit(
      :enabled,
      :reminder_time,
      :timezone,
      :utc_offset,
      days_of_week: []
    )
  end
end
