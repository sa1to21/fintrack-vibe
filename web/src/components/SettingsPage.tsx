import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Switch } from "./ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Trash2, Sparkles, Tags, DollarSign, Bell, Moon, Globe, Upload, Settings, ChevronRight } from "./icons";
import { OptimizedMotion } from "./ui/OptimizedMotion";
import { LightMotion } from "./ui/LightMotion";
import { useTelegramAuth } from "../contexts/TelegramAuthContext";
import { toast } from "sonner";
import userDataService from "../services/userData.service";
import usersService from "../services/users.service";
import exportService from "../services/export.service";
import { CURRENCIES, getCurrency } from "../constants/currencies";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useEffect } from "react";

interface SettingsPageProps {
  onNavigate?: (screen: string) => void;
}

export function SettingsPage({ onNavigate }: SettingsPageProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [baseCurrency, setBaseCurrency] = useState<string>('RUB');
  const [isLoadingCurrency, setIsLoadingCurrency] = useState(true);

  useEffect(() => {
    loadBaseCurrency();
  }, []);

  const loadBaseCurrency = async () => {
    try {
      const userData = await usersService.getCurrent();
      setBaseCurrency(userData.base_currency);
    } catch (error) {
      console.error('Failed to load base currency:', error);
    } finally {
      setIsLoadingCurrency(false);
    }
  };

  const handleBaseCurrencyChange = async (newCurrency: string) => {
    const previousCurrency = baseCurrency;

    // Optimistically update UI
    setBaseCurrency(newCurrency);

    try {
      await usersService.update({ base_currency: newCurrency });
      toast.success(`Основная валюта изменена на ${newCurrency}`);
    } catch (error: any) {
      // Revert to previous currency on error
      setBaseCurrency(previousCurrency);
      toast.error(`Ошибка: ${error?.response?.data?.errors || error?.message || 'Не удалось обновить валюту'}`);
    }
  };

  const handleDeleteAllData = async () => {
    try {
      setIsDeleting(true);
      await userDataService.deleteAll();
      toast.success('Все данные успешно удалены');
      setIsDeleteDialogOpen(false);

      // Перезагружаем страницу через небольшую задержку
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Failed to delete data:', error);
      toast.error('Не удалось удалить данные');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      await exportService.exportTransactionsToCsv();
      toast.success('Данные успешно экспортированы');
    } catch (error) {
      console.error('Failed to export data:', error);
      toast.error('Не удалось экспортировать данные');
    } finally {
      setIsExporting(false);
    }
  };
  const settingsGroups = [
    {
      title: "Финансы",
      items: [
        {
          icon: Tags,
          label: "Управление категориями",
          description: "Добавить, изменить или удалить категории",
          action: "navigate",
          color: "bg-purple-100 text-purple-600"
        },
        {
          icon: DollarSign,
          label: "Счета и карты",
          description: "Управление финансовыми счетами",
          action: "navigate",
          color: "bg-orange-100 text-orange-600"
        }
      ]
    },
    {
      title: "Приложение",
      items: [
        {
          icon: Bell,
          label: "Уведомления",
          description: "Напоминания о расходах и целях",
          action: "toggle",
          value: true,
          color: "bg-yellow-100 text-yellow-600"
        },
        {
          icon: Moon,
          label: "Тёмная тема",
          description: "Переключить на тёмное оформление",
          action: "toggle",
          value: false,
          color: "bg-gray-100 text-gray-600"
        },
        {
          icon: Globe,
          label: "Язык",
          description: "Русский",
          action: "navigate",
          color: "bg-indigo-100 text-indigo-600"
        }
      ]
    },
    {
      title: "Данные",
      items: [
        {
          icon: Upload,
          label: "Экспорт данных",
          description: "Скачать все ваши данные",
          action: "button",
          color: "bg-cyan-100 text-cyan-600"
        }
      ]
    }
  ];

  const dangerousActions = [
    {
      icon: Trash2,
      label: "Удалить все данные",
      description: "Безвозвратно удалить все операции",
      color: "bg-red-100 text-red-600"
    }
  ];

  return (
    <div className="min-h-full bg-gradient-to-br from-purple-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background decorations removed for performance */}
      
      {/* Header */}
      <OptimizedMotion className="bg-gradient-to-br from-blue-500 to-purple-700 px-4 py-6 relative overflow-hidden">
        {/* Background decorations - simplified for performance */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-y-12 translate-y-8"></div>

        <div className="max-w-md mx-auto relative">
          <div className="flex items-center justify-center gap-2">
            <Settings className="w-6 h-6 text-yellow-300" />
            <h1 className="text-white font-medium">Настройки</h1>
            <Sparkles className="w-5 h-5 text-yellow-300" />
          </div>
        </div>
      </OptimizedMotion>

      <div className="px-4 py-6 max-w-md mx-auto space-y-6 relative z-10">
        {/* Base Currency Selector */}
        <div className="space-y-3">
          <h2 className="font-medium text-sm uppercase tracking-wide bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Основная валюта
          </h2>
          <Card className="border-blue-200 bg-gradient-to-br from-white to-blue-50/30 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm bg-gradient-to-br from-emerald-100 to-teal-200">
                    <Globe className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-800">Валюта для статистики</h3>
                    <p className="text-sm text-slate-600">
                      Доходы и расходы будут считаться в этой валюте
                    </p>
                  </div>
                </div>
                <div className="w-32">
                  {isLoadingCurrency ? (
                    <div className="text-sm text-slate-500">Загрузка...</div>
                  ) : (
                    <Select value={baseCurrency} onValueChange={handleBaseCurrencyChange}>
                      <SelectTrigger className="border-blue-200 focus:border-blue-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            <div className="flex items-center gap-2">
                              <span>{currency.flag}</span>
                              <span>{currency.code}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {settingsGroups.map((group, groupIndex) => (
          <div key={group.title} className="space-y-3">
            <h2 className="font-medium text-sm uppercase tracking-wide bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {group.title}
            </h2>
            <Card className="border-blue-200 bg-gradient-to-br from-white to-blue-50/30 shadow-sm hover:shadow-lg transition-all duration-300">
              <CardContent className="p-0">
                {group.items.map((item, index) => {
                  const Icon = item.icon;
                  const handleClick = () => {
                    if (item.label === "Счета и карты" && onNavigate) {
                      onNavigate('manage-accounts');
                    }
                    if (item.label === "Управление категориями" && onNavigate) {
                      onNavigate('manage-categories');
                    }
                    if (item.label === "Экспорт данных") {
                      handleExportData();
                    }
                  };

                  return (
                    <div
                      key={item.label}
                      onClick={handleClick}
                      className="flex items-center justify-between p-4 hover:bg-blue-50/50 transition-colors duration-200 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm bg-gradient-to-br from-blue-100 to-indigo-200">
                          <Icon className={`w-5 h-5 ${
                            groupIndex === 0 ? 'text-blue-600' :
                            groupIndex === 1 ? 'text-purple-600' :
                            groupIndex === 2 ? 'text-indigo-600' :
                            'text-teal-600'
                          }`} />
                        </div>
                        <div>
                          <h3 className="font-medium text-slate-800">{item.label}</h3>
                          <p className="text-sm text-slate-600">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        {item.action === 'toggle' && (
                          <Switch checked={item.value} />
                        )}
                        {item.action === 'navigate' && (
                          <ChevronRight className="w-5 h-5 text-slate-500" />
                        )}
                        {item.action === 'button' && (
                          <LightMotion whileTap={{ scale: 0.95 }}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-blue-300 text-blue-600 hover:bg-blue-50"
                              disabled={isExporting}
                            >
                              {isExporting ? 'Экспорт...' : 'Скачать'}
                            </Button>
                          </LightMotion>
                        )}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        ))}

        {/* Dangerous Actions */}
        <div className="space-y-3">
          <h2 className="font-medium text-sm uppercase tracking-wide bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
            Осторожно
          </h2>
          <Card className="border-red-200 bg-gradient-to-br from-red-50 to-pink-50 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardContent className="p-0">
              {dangerousActions.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="flex items-center justify-between p-4 hover:bg-red-50/70 transition-colors duration-200"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-red-500 to-pink-600 shadow-sm flex-shrink-0">
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-red-700">{item.label}</h3>
                        <p className="text-sm text-red-600">
                          {item.description}
                        </p>
                      </div>
                    </div>
                    <LightMotion whileTap={{ scale: 0.95 }} className="flex-shrink-0 ml-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setIsDeleteDialogOpen(true)}
                        disabled={isDeleting}
                        className="shadow-sm hover:shadow-md transition-all duration-200"
                      >
                        {isDeleting ? 'Удаление...' : 'Удалить'}
                      </Button>
                    </LightMotion>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent className="border-red-200 bg-gradient-to-br from-white to-red-50/30">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-700 flex items-center gap-2">
                <Trash2 className="w-5 h-5" />
                Удалить все данные?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-red-600">
                Это действие нельзя отменить. Будут безвозвратно удалены:
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Все транзакции</li>
                  <li>Все счета</li>
                  <li>Все категории</li>
                </ul>
                <p className="mt-2 font-medium">
                  После удаления будут созданы стандартный счёт и категории.
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-red-300" disabled={isDeleting}>
                Отмена
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAllData}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? 'Удаление...' : 'Да, удалить всё'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* App Info */}
        <div className="text-center pt-4 space-y-1">
          <p className="text-xs text-slate-500">
            FinanceTracker v1.0 <span className="text-orange-500 font-medium">(BETA)</span>
          </p>
          <p className="text-xs text-slate-500">
            Сделано с ❤️ для вашего финансового благополучия
          </p>
          <p className="text-xs text-slate-500">
            Создатель:{' '}
            <a
              href="https://t.me/sa1to21"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 underline transition-colors"
            >
              @sa1to21
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}