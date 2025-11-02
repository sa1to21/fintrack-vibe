import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Switch } from "./ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";
import { Trash2, Sparkles, Tags, DollarSign, Bell, Globe, Upload, Settings, ChevronRight } from "./icons";
import { OptimizedMotion } from "./ui/OptimizedMotion";
import { LightMotion } from "./ui/LightMotion";
import { FlagIcon } from "./ui/flag-icon";
import { useTelegramAuth } from "../contexts/TelegramAuthContext";
import { toast } from "sonner";
import userDataService from "../services/userData.service";
import usersService from "../services/users.service";
import exportService from "../services/export.service";
import { CURRENCIES, getCurrency } from "../constants/currencies";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useEffect } from "react";
import DonateDialog from "./DonateDialog";
import NotificationSettingsDialog from "./NotificationSettingsDialog";
import LanguageSwitcher from "./LanguageSwitcher";
import logo from "../assets/logo.png";
import logoWhite from "../assets/logo-white.png";
import { useTranslation } from "react-i18next";

interface SettingsPageProps {
  onNavigate?: (screen: string) => void;
}

export function SettingsPage({ onNavigate }: SettingsPageProps) {
  // const { theme, setTheme } = useTelegramAuth(); // Тема временно отключена
  const { language } = useTelegramAuth();
  const { t } = useTranslation('settings');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [baseCurrency, setBaseCurrency] = useState<string>('RUB');
  const [isLoadingCurrency, setIsLoadingCurrency] = useState(true);
  const [isDonateDialogOpen, setIsDonateDialogOpen] = useState(false);
  const [isNotificationsDialogOpen, setIsNotificationsDialogOpen] = useState(false);
  const [isLanguageSwitcherOpen, setIsLanguageSwitcherOpen] = useState(false);

  // Выбираем логотип в зависимости от темы (временно отключено - всегда светлый)
  const currentLogo = logo; // theme === 'dark' ? logoWhite : logo;

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
      toast.success(t('messages.currencyChanged', { currency: newCurrency }));
    } catch (error: any) {
      // Revert to previous currency on error
      setBaseCurrency(previousCurrency);
      toast.error(t('messages.error', { error: error?.response?.data?.errors || error?.message || 'Failed to update currency' }));
    }
  };

  const handleDeleteAllData = async () => {
    try {
      setIsDeleting(true);
      await userDataService.deleteAll();
      toast.success(t('messages.allDataDeleted'));
      setIsDeleteDialogOpen(false);

      // Перезагружаем страницу через небольшую задержку
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error('Failed to delete data:', error);
      toast.error(t('messages.failedToDelete'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      await exportService.exportTransactionsToCsv();
      toast.success(t('messages.fileExported'));
    } catch (error) {
      console.error('Failed to export data:', error);
      toast.error(t('messages.failedToExport'));
    } finally {
      setIsExporting(false);
    }
  };

  const settingsGroups = [
    {
      title: t('groups.finance'),
      items: [
        {
          id: 'manage-categories',
          icon: Tags,
          label: t('items.manageCategories'),
          description: "",
          action: "navigate",
          color: "bg-purple-100 text-purple-600"
        },
        {
          id: 'manage-accounts',
          icon: DollarSign,
          label: t('items.accounts'),
          description: t('items.accountsDescription'),
          action: "navigate",
          color: "bg-orange-100 text-orange-600"
        }
      ]
    },
    {
      title: t('groups.application'),
      items: [
        {
          id: 'notifications',
          icon: Bell,
          label: t('items.notifications'),
          description: "",
          action: "navigate",
          color: "bg-yellow-100 text-yellow-600"
        },
        {
          id: 'language',
          icon: Globe,
          label: t('items.language'),
          description: language === 'ru' ? t('languages.ru') : t('languages.en'),
          action: "navigate",
          color: "bg-indigo-100 text-indigo-600"
        }
      ]
    },
    {
      title: t('groups.data'),
      items: [
        {
          id: 'export',
          icon: Upload,
          label: t('items.export'),
          description: t('items.exportDescription'),
          action: "button",
          color: "bg-cyan-100 text-cyan-600"
        }
      ]
    }
  ];

  const dangerousActions = [
    {
      icon: Trash2,
      label: t('danger.deleteAll'),
      description: t('danger.deleteAllDescription'),
      color: "bg-red-100 text-red-600"
    }
  ];

  return (
    <div className="min-h-full relative overflow-hidden" style={{ background: 'var(--bg-page-settings)' }}>
      {/* Background decorations removed for performance */}
      
      {/* Header */}
      <OptimizedMotion className="px-4 py-6 relative overflow-hidden" style={{ background: 'var(--bg-header)' }}>
        {/* Background decorations - simplified for performance */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-y-12 translate-y-8"></div>

        <div className="max-w-md mx-auto relative">
          <div className="flex items-center justify-center gap-2">
            <Settings className="w-6 h-6 text-yellow-300" />
            <h1 className="text-white font-medium">{t('title')}</h1>
          </div>
        </div>
      </OptimizedMotion>

      <div className="px-4 py-6 max-w-md mx-auto space-y-6 relative z-10">
        {/* Base Currency Selector */}
        <div className="space-y-3">
          <h2 className="font-medium text-sm uppercase tracking-wide bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {t('baseCurrency.title')}
          </h2>
          <Card className="border-blue-200 bg-gradient-to-br from-white to-blue-50/30 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm bg-gradient-to-br from-emerald-100 to-teal-200">
                    <Globe className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-slate-800">{t('baseCurrency.label')}</h3>
                    <p className="text-sm text-slate-600">
                      {t('baseCurrency.description')}
                    </p>
                  </div>
                </div>
                <div className="w-32">
                  {isLoadingCurrency ? (
                    <div className="text-sm text-slate-500">{t('loading')}</div>
                  ) : (
                    <Select value={baseCurrency} onValueChange={handleBaseCurrencyChange}>
                      <SelectTrigger className="border-blue-200 focus:border-blue-400">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCIES.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            <div className="flex items-center gap-2">
                              <FlagIcon countryCode={currency.countryCode} />
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
                    if (item.id === 'manage-accounts' && onNavigate) {
                      onNavigate('manage-accounts');
                    }
                    if (item.id === 'manage-categories' && onNavigate) {
                      onNavigate('manage-categories');
                    }
                    if (item.id === 'export') {
                      handleExportData();
                    }
                    if (item.id === 'notifications') {
                      setIsNotificationsDialogOpen(true);
                    }
                    if (item.id === 'language') {
                      setIsLanguageSwitcherOpen(true);
                    }
                  };

                  return (
                    <div
                      key={item.id}
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
                          {item.description && (
                            <p className="text-sm text-slate-600">
                              {item.description}
                            </p>
                          )}
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
                              {isExporting ? t('buttons.exporting') : t('buttons.download')}
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
            {t('danger.title')}
          </h2>
          <Card className="border-red-200 bg-gradient-to-br from-red-50 to-pink-50 shadow-sm hover:shadow-lg transition-all duration-300">
            <CardContent className="p-0">
              {dangerousActions.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
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
                        {isDeleting ? t('buttons.deleting') : t('buttons.delete')}
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
                {t('deleteDialog.title')}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-red-600">
                {t('deleteDialog.warning')}
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>{t('deleteDialog.transactions')}</li>
                  <li>{t('deleteDialog.accounts')}</li>
                  <li>{t('deleteDialog.categories')}</li>
                </ul>
                <p className="mt-2 font-medium">
                  {t('deleteDialog.afterDelete')}
                </p>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-red-300" disabled={isDeleting}>
                {t('buttons.cancel')}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteAllData}
                disabled={isDeleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isDeleting ? t('buttons.deleting') : t('buttons.confirmDelete')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* App Info */}
        <div className="text-center pt-2 space-y-2">
          {/* Logo */}
          <div className="flex justify-center">
            <img src={currentLogo} alt="WiseTrack" className="w-16 h-16" />
          </div>

          <div className="space-y-1">
            <p className="text-xs text-slate-500">
              WiseTrack v1.0 <span className="text-orange-500 font-medium">(BETA)</span>
            </p>
            <p className="text-xs text-slate-500">
              {t('appInfo.tagline')}
            </p>
            <p className="text-xs text-slate-500">
              {t('appInfo.creator')}{' '}
              <a
                href="https://t.me/sa1to21"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:text-blue-600 underline transition-colors"
              >
                @sa1to21
              </a>
            </p>
            <button
              onClick={() => setIsDonateDialogOpen(true)}
              className="text-xs text-blue-500 hover:text-blue-600 underline transition-colors cursor-pointer"
            >
              {t('appInfo.donationNote')}
            </button>
          </div>
        </div>

        {/* Donate Dialog */}
        <DonateDialog
          isOpen={isDonateDialogOpen}
          onClose={() => setIsDonateDialogOpen(false)}
        />

        {/* Notification Settings Dialog */}
        <NotificationSettingsDialog
          isOpen={isNotificationsDialogOpen}
          onClose={() => setIsNotificationsDialogOpen(false)}
        />

        {/* Language Switcher */}
        <LanguageSwitcher
          isOpen={isLanguageSwitcherOpen}
          onClose={() => setIsLanguageSwitcherOpen(false)}
        />
      </div>
    </div>
  );
}