import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { toast } from "sonner";
import notificationsService, { NotificationSetting } from "../services/notifications.service";
import { Bell, Clock, Calendar } from "./icons";

interface NotificationSettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const DAYS_OF_WEEK = [
  { value: 1, labelKey: "notifications.days.mon" },
  { value: 2, labelKey: "notifications.days.tue" },
  { value: 3, labelKey: "notifications.days.wed" },
  { value: 4, labelKey: "notifications.days.thu" },
  { value: 5, labelKey: "notifications.days.fri" },
  { value: 6, labelKey: "notifications.days.sat" },
  { value: 0, labelKey: "notifications.days.sun" },
];

// Генерируем опции для часов (0-23)
const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
  value: i.toString().padStart(2, '0'),
  label: i.toString().padStart(2, '0'),
}));

// Генерируем опции для минут с шагом 5 (0, 5, 10, ..., 55)
const MINUTE_OPTIONS = Array.from({ length: 12 }, (_, i) => {
  const minute = i * 5;
  return {
    value: minute.toString().padStart(2, '0'),
    label: minute.toString().padStart(2, '0'),
  };
});

export default function NotificationSettingsDialog({ isOpen, onClose }: NotificationSettingsDialogProps) {
  const { t } = useTranslation('settings');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<NotificationSetting | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState("20:00");
  const [selectedHour, setSelectedHour] = useState("20");
  const [selectedMinute, setSelectedMinute] = useState("00");
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5, 6, 0]);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      const data = await notificationsService.getSettings();
      setSettings(data);
      setEnabled(data.enabled);
      setReminderTime(data.reminder_time);

      // Разбираем время на часы и минуты
      const [hour, minute] = data.reminder_time.split(':');
      setSelectedHour(hour);
      setSelectedMinute(minute);

      setSelectedDays(data.days_of_week);
    } catch (error) {
      console.error('Failed to load notification settings:', error);
      toast.error(t('notifications.failedToLoad'));
    } finally {
      setIsLoading(false);
    }
  };

  const getTimezoneInfo = () => {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const offset = -new Date().getTimezoneOffset(); // Minutes from UTC
    return { timezone, offset };
  };

  const toggleDay = (day: number) => {
    setSelectedDays(prev => {
      if (prev.includes(day)) {
        // Не даём убрать последний день
        if (prev.length === 1) {
          toast.error(t('notifications.selectAtLeastOneDay'));
          return prev;
        }
        return prev.filter(d => d !== day);
      } else {
        return [...prev, day].sort();
      }
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const { timezone, offset } = getTimezoneInfo();

      // Формируем время из часов и минут
      const timeToSave = `${selectedHour}:${selectedMinute}`;

      await notificationsService.updateSettings({
        enabled,
        reminder_time: timeToSave,
        timezone,
        utc_offset: offset,
        days_of_week: selectedDays,
      });

      toast.success(t('notifications.saved'));
      onClose();
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      toast.error(t('notifications.failedToSave'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm border-blue-200 bg-gradient-to-br from-white to-blue-50/30">
        <DialogHeader>
          <DialogTitle className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {t('notifications.title')}
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            {t('notifications.description')}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-slate-500">{t('notifications.loading')}</div>
        ) : (
          <div className="space-y-6">
            {/* Включить/выключить */}
            <div className="flex items-center justify-between">
              <Label>{t('notifications.enableReminders')}</Label>
              <Switch checked={enabled} onCheckedChange={setEnabled} />
            </div>

            {enabled && (
              <>
                {/* Время напоминания */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    {t('notifications.reminderTime')}
                  </Label>
                  <div className="flex gap-2">
                    <Select value={selectedHour} onValueChange={setSelectedHour}>
                      <SelectTrigger className="w-full border-blue-200 focus:border-blue-400">
                        <SelectValue placeholder={t('notifications.hourPlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {HOUR_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="flex items-center text-blue-400 font-medium">:</span>
                    <Select value={selectedMinute} onValueChange={setSelectedMinute}>
                      <SelectTrigger className="w-full border-blue-200 focus:border-blue-400">
                        <SelectValue placeholder={t('notifications.minutePlaceholder')} />
                      </SelectTrigger>
                      <SelectContent>
                        {MINUTE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-slate-500">
                    {t('notifications.localTimeNote')}
                  </p>
                </div>

                {/* Дни недели */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    {t('notifications.daysOfWeek')}
                  </Label>
                  <div className="flex flex-col items-center gap-2">
                    {/* Первая линия: 4 дня */}
                    <div className="flex gap-2">
                      {DAYS_OF_WEEK.slice(0, 4).map(({ value, labelKey }) => (
                        <button
                          key={value}
                          onClick={() => toggleDay(value)}
                          className={`
                            w-12 h-12 rounded-full flex items-center justify-center font-medium text-sm
                            transition-all
                            ${selectedDays.includes(value)
                              ? 'bg-blue-600 text-white shadow-md scale-105'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }
                          `}
                        >
                          {t(labelKey)}
                        </button>
                      ))}
                    </div>
                    {/* Вторая линия: 3 дня */}
                    <div className="flex gap-2">
                      {DAYS_OF_WEEK.slice(4).map(({ value, labelKey }) => (
                        <button
                          key={value}
                          onClick={() => toggleDay(value)}
                          className={`
                            w-12 h-12 rounded-full flex items-center justify-center font-medium text-sm
                            transition-all
                            ${selectedDays.includes(value)
                              ? 'bg-blue-600 text-white shadow-md scale-105'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }
                          `}
                        >
                          {t(labelKey)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Кнопки */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 border-blue-300"
                disabled={isSaving}
              >
                {t('notifications.cancel')}
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={isSaving}
              >
                {isSaving ? t('notifications.saving') : t('notifications.save')}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
