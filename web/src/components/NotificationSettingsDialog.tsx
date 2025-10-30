import { useState, useEffect } from "react";
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
  { value: 1, label: "Пн" },
  { value: 2, label: "Вт" },
  { value: 3, label: "Ср" },
  { value: 4, label: "Чт" },
  { value: 5, label: "Пт" },
  { value: 6, label: "Сб" },
  { value: 0, label: "Вс" },
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
      toast.error('Не удалось загрузить настройки');
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
          toast.error('Выберите хотя бы один день недели');
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

      toast.success('Настройки уведомлений сохранены');
      onClose();
    } catch (error) {
      console.error('Failed to save notification settings:', error);
      toast.error('Не удалось сохранить настройки');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-yellow-600" />
            Настройки уведомлений
          </DialogTitle>
          <DialogDescription>
            Настройте ежедневные напоминания о внесении расходов
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-slate-500">Загрузка...</div>
        ) : (
          <div className="space-y-6">
            {/* Включить/выключить */}
            <div className="flex items-center justify-between">
              <Label>Получать напоминания</Label>
              <Switch checked={enabled} onCheckedChange={setEnabled} />
            </div>

            {enabled && (
              <>
                {/* Время напоминания */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Время напоминания
                  </Label>
                  <div className="flex gap-2">
                    <Select value={selectedHour} onValueChange={setSelectedHour}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="ЧЧ" />
                      </SelectTrigger>
                      <SelectContent>
                        {HOUR_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="flex items-center text-slate-400 font-medium">:</span>
                    <Select value={selectedMinute} onValueChange={setSelectedMinute}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="ММ" />
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
                    Напоминание будет отправлено в ваше локальное время
                  </p>
                </div>

                {/* Дни недели */}
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Дни недели
                  </Label>
                  <div className="flex gap-2 flex-wrap">
                    {DAYS_OF_WEEK.map(({ value, label }) => (
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
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Кнопки */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isSaving}
              >
                Отмена
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1"
                disabled={isSaving}
              >
                {isSaving ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
