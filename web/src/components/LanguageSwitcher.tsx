import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Globe, Check } from "./icons";
import { useTelegramAuth } from "../contexts/TelegramAuthContext";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface LanguageSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
}

const LANGUAGES = [
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
];

export default function LanguageSwitcher({ isOpen, onClose }: LanguageSwitcherProps) {
  const { language, changeLanguage } = useTelegramAuth();
  const { t } = useTranslation('settings');
  const [isChanging, setIsChanging] = useState(false);

  const handleLanguageChange = async (langCode: string) => {
    if (langCode === language) {
      onClose();
      return;
    }

    try {
      setIsChanging(true);
      await changeLanguage(langCode);

      // Show success message in the new language
      const successMessage = langCode === 'ru'
        ? 'Язык изменён на русский'
        : 'Language changed to English';
      toast.success(successMessage);

      onClose();
    } catch (error) {
      console.error('Failed to change language:', error);
      toast.error(t('messages.error'));
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-to-br from-white to-blue-50 border-blue-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-700">
            <Globe className="w-5 h-5" />
            {t('language')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-2 pt-2">
          {LANGUAGES.map((lang) => (
            <Button
              key={lang.code}
              variant={language === lang.code ? "default" : "outline"}
              className={`w-full justify-between h-auto py-3 ${
                language === lang.code
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'border-blue-200 hover:bg-blue-50'
              }`}
              onClick={() => handleLanguageChange(lang.code)}
              disabled={isChanging}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{lang.flag}</span>
                <span className="font-medium">{lang.name}</span>
              </div>
              {language === lang.code && (
                <Check className="w-5 h-5" />
              )}
            </Button>
          ))}
        </div>

        <div className="text-xs text-slate-600 pt-2 border-t border-blue-100">
          {language === 'ru'
            ? 'Выбранный язык будет сохранён для всех устройств'
            : 'Selected language will be saved for all devices'}
        </div>
      </DialogContent>
    </Dialog>
  );
}
