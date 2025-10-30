import api from '../lib/api';

export interface NotificationSetting {
  id: string | null;
  user_id: string;
  enabled: boolean;
  reminder_time: string; // "HH:MM" format
  timezone: string;
  utc_offset: number; // Minutes from UTC
  days_of_week: number[]; // 0-6, where 0 is Sunday
  next_send_time_utc?: string;
}

export interface UpdateNotificationSettingData {
  enabled: boolean;
  reminder_time: string;
  timezone: string;
  utc_offset: number;
  days_of_week: number[];
}

class NotificationsService {
  async getSettings(): Promise<NotificationSetting> {
    const response = await api.get('/notification_settings');
    return response.data;
  }

  async updateSettings(data: UpdateNotificationSettingData): Promise<NotificationSetting> {
    const response = await api.post('/notification_settings', {
      notification_setting: data
    });
    return response.data;
  }
}

export default new NotificationsService();
