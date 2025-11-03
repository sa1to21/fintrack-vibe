class Api::V1::NotificationSettingsController < Api::V1::BaseController
  before_action :set_notification_setting, only: [:show, :update]

  # GET /api/v1/notification_settings
  def show
    # Если настроек ещё нет, создадим их с дефолтными значениями
    unless @notification_setting
      # Получаем timezone offset пользователя (по умолчанию UTC+3)
      utc_offset = 180

      @notification_setting = current_user.create_notification_setting(
        enabled: true,
        reminder_time: '20:00',
        timezone: 'User/Local',
        utc_offset: utc_offset,
        days_of_week: [0, 1, 2, 3, 4, 5, 6]
      )
    end

    render json: @notification_setting
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
