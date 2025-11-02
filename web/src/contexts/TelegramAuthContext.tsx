import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api, { authApi } from '../lib/api';
import i18n from '../i18n';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

export interface User {
  id: string;
  telegram_id: number;
  name: string;
  username?: string;
  language_code?: string;
  created_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  is_new_user: boolean;
}

interface TelegramAuthContextType {
  user: User | null;
  telegramUser: TelegramUser | null;
  loading: boolean;
  error: string | null;
  logout: () => void;
  isAuthenticated: boolean;
  isTelegramReady: boolean;
  isNewUser: boolean;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  language: string;
  changeLanguage: (lang: string) => Promise<void>;
}

const TelegramAuthContext = createContext<TelegramAuthContextType | undefined>(undefined);

// Объявляем глобальный интерфейс для Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            photo_url?: string;
          };
        };
        ready: () => void;
        expand: () => void;
        colorScheme: 'light' | 'dark';
        onEvent: (eventType: string, callback: () => void) => void;
        offEvent: (eventType: string, callback: () => void) => void;
      };
    };
  }
}

export function TelegramAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTelegramReady, setIsTelegramReady] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  // Тема всегда светлая (темная тема отключена)
  const [theme] = useState<'light' | 'dark'>('light');
  const [isManualTheme] = useState(false);
  const detectInitialLanguage = () => {
    if (typeof window === 'undefined') {
      return 'en';
    }

    const savedUserRaw = localStorage.getItem('user');
    if (savedUserRaw) {
      try {
        const savedUser: User = JSON.parse(savedUserRaw);
        const savedLanguage = savedUser.language_code === 'ru' ? 'ru' : 'en';
        document.documentElement.lang = savedLanguage;
        i18n.changeLanguage(savedLanguage);
        return savedLanguage;
      } catch (error) {
        console.warn('[TelegramAuth] Failed to parse saved user for language detection:', error);
      }
    }

    return 'en';
  };

  const [language, setLanguage] = useState<string>(detectInitialLanguage);

  useEffect(() => {
    // Функция ожидания загрузки Telegram SDK с таймаутом
    const waitForTelegram = (timeout = 3000): Promise<any> => {
      return new Promise((resolve) => {
        console.log('[TelegramAuth] Waiting for Telegram SDK...');

        // Проверяем сразу
        if (window.Telegram?.WebApp) {
          console.log('[TelegramAuth] Telegram SDK already loaded');
          resolve(window.Telegram.WebApp);
          return;
        }

        // Ждем с интервалом
        const startTime = Date.now();
        const checkInterval = setInterval(() => {
          if (window.Telegram?.WebApp) {
            console.log('[TelegramAuth] Telegram SDK loaded successfully');
            clearInterval(checkInterval);
            resolve(window.Telegram.WebApp);
          } else if (Date.now() - startTime > timeout) {
            console.warn('[TelegramAuth] Telegram SDK loading timeout');
            clearInterval(checkInterval);
            resolve(null);
          }
        }, 100);
      });
    };

    const initializeTelegram = async () => {
      try {
        console.log('[TelegramAuth] Starting initialization...');
        console.log('[TelegramAuth] window.Telegram:', window.Telegram);
        console.log('[TelegramAuth] User Agent:', navigator.userAgent);

        // Ждем загрузки Telegram SDK
        const tg = await waitForTelegram();

        if (!tg) {
          console.error('[TelegramAuth] Telegram SDK not available');
          // Проверяем localStorage для локальной разработки
          const savedUserRaw = localStorage.getItem('user');
          if (savedUserRaw) {
            console.log('[TelegramAuth] Using saved user from localStorage');
            const savedUser: User = JSON.parse(savedUserRaw);
            setUser(savedUser);

            const savedLanguage = savedUser.language_code === 'ru' ? 'ru' : 'en';
            await i18n.changeLanguage(savedLanguage);
            setLanguage(savedLanguage);
            document.documentElement.lang = savedLanguage;
          } else {
            setError('Telegram SDK не доступен. Откройте приложение из Telegram Mini App.');
          }
          setLoading(false);
          return;
        }

        console.log('[TelegramAuth] Telegram WebApp:', tg);
        console.log('[TelegramAuth] initData:', tg.initData);
        console.log('[TelegramAuth] initDataUnsafe:', tg.initDataUnsafe);

        if (tg.initDataUnsafe?.user) {
          // Инициализируем Telegram WebApp
          console.log('[TelegramAuth] Initializing Telegram WebApp...');
          tg.ready();
          tg.expand();

          const tgUser: TelegramUser = {
            id: tg.initDataUnsafe.user.id,
            first_name: tg.initDataUnsafe.user.first_name,
            last_name: tg.initDataUnsafe.user.last_name,
            username: tg.initDataUnsafe.user.username,
            language_code: tg.initDataUnsafe.user.language_code,
            photo_url: tg.initDataUnsafe.user.photo_url,
          };

          console.log('[TelegramAuth] Telegram user:', tgUser);
          setTelegramUser(tgUser);
          setIsTelegramReady(true);

          console.log('[TelegramAuth] Authenticating with backend...');

          // Отправляем данные на backend для авторизации/регистрации
          const response = await authApi.post<AuthResponse>('/auth/telegram', {
            init_data: tg.initData,
            user: {
              telegram_id: tgUser.id,
              first_name: tgUser.first_name,
              last_name: tgUser.last_name,
              username: tgUser.username,
              language_code: tgUser.language_code,
            },
          });

          console.log('[TelegramAuth] Auth response:', response.data);

          // Сохраняем токен и флаг нового пользователя
          if (response.data.token) {
            localStorage.setItem('authToken', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            setUser(response.data.user);
            setIsNewUser(response.data.is_new_user);

            // Устанавливаем язык из БД или автоопределение
            const userLanguage = response.data.user.language_code || tgUser.language_code || 'en';
            const appLanguage = userLanguage === 'ru' ? 'ru' : 'en';
            setLanguage(appLanguage);
            i18n.changeLanguage(appLanguage);

            console.log('[TelegramAuth] User authenticated successfully');
            console.log('[TelegramAuth] Is new user:', response.data.is_new_user);
            console.log('[TelegramAuth] Language set to:', appLanguage);
          }
        } else {
          // Если нет данных пользователя
          console.warn('[TelegramAuth] No user data in initDataUnsafe');
          const savedUserRaw = localStorage.getItem('user');
          if (savedUserRaw) {
            console.log('[TelegramAuth] Using saved user from localStorage');
            const savedUser: User = JSON.parse(savedUserRaw);
            setUser(savedUser);

            const savedLanguage = savedUser.language_code === 'ru' ? 'ru' : 'en';
            await i18n.changeLanguage(savedLanguage);
            setLanguage(savedLanguage);
            document.documentElement.lang = savedLanguage;
          } else {
            setError('Данные пользователя недоступны. Перезапустите приложение.');
          }
        }
      } catch (err: any) {
        console.error('[TelegramAuth] Initialization error:', err);
        console.error('[TelegramAuth] Error response:', err.response?.data);
        console.error('[TelegramAuth] Error message:', err.message);

        // Fallback для локальной разработки
        const savedUserRaw = localStorage.getItem('user');
        if (savedUserRaw) {
          console.log('[TelegramAuth] Using saved user after error');
          const savedUser: User = JSON.parse(savedUserRaw);
          setUser(savedUser);
          setIsTelegramReady(false);

          const savedLanguage = savedUser.language_code === 'ru' ? 'ru' : 'en';
          await i18n.changeLanguage(savedLanguage);
          setLanguage(savedLanguage);
          document.documentElement.lang = savedLanguage;
        } else {
          const errorMessage = err.response?.data?.error || err.message || 'Ошибка авторизации через Telegram';
          console.error('[TelegramAuth] Setting error:', errorMessage);
          setError(errorMessage);
        }
      } finally {
        console.log('[TelegramAuth] Initialization complete');
        setLoading(false);
      }
    };

    initializeTelegram();
  }, []);

  // Эффект для применения светлой темы к DOM (темная тема отключена)
  useEffect(() => {
    // Всегда используем светлую тему
    document.documentElement.classList.remove('dark');
    document.documentElement.classList.add('light');

    // Очищаем сохраненную тему из localStorage
    localStorage.removeItem('theme');
  }, []);

  // Эффект для синхронизации с темой Telegram (ВРЕМЕННО ОТКЛЮЧЕНО)
  // useEffect(() => {
  //   const tg = window.Telegram?.WebApp;
  //   if (!tg) return;

  //   // Только синхронизируем с Telegram, если пользователь не выбирал тему вручную
  //   if (isManualTheme) return;

  //   // Устанавливаем начальную тему из Telegram
  //   const telegramTheme = tg.colorScheme || 'light';
  //   setThemeState(telegramTheme);

  //   // Слушаем изменения темы в Telegram
  //   const handleThemeChange = () => {
  //     // Только если тема не установлена вручную
  //     if (!isManualTheme) {
  //       const newTheme = tg.colorScheme || 'light';
  //       setThemeState(newTheme);
  //     }
  //   };

  //   tg.onEvent('themeChanged', handleThemeChange);

  //   return () => {
  //     tg.offEvent('themeChanged', handleThemeChange);
  //   };
  // }, [isTelegramReady, isManualTheme]);

  // Функция setTheme оставлена для совместимости, но ничего не делает (темная тема отключена)
  const setTheme = (_newTheme: 'light' | 'dark') => {
    // Тема всегда светлая, изменение отключено
  };

  // Синхронизируем атрибут lang документа с выбранным языком
  useEffect(() => {
    document.documentElement.lang = language || 'en';
  }, [language]);

  // Единая точка для смены языка из приложения или бота
  const changeLanguage = async (lang: string) => {
    try {
      const appLanguage = lang === 'ru' ? 'ru' : 'en';

      await i18n.changeLanguage(appLanguage);
      setLanguage(appLanguage);
      document.documentElement.lang = appLanguage;

      let updatedUserData: User | null = null;

      if (user?.telegram_id) {
        const response = await api.patch<User>(`/users/telegram/${user.telegram_id}`, {
          language_code: appLanguage,
        });
        updatedUserData = response.data;
      } else if (user) {
        const response = await api.put<User>('/users/current', {
          user: { language_code: appLanguage },
        });
        updatedUserData = response.data;
      }

      if (user || updatedUserData) {
        const mergedUser = {
          ...(user || {}),
          ...(updatedUserData || {}),
          language_code: appLanguage,
        } as User;

        setUser(mergedUser);
        localStorage.setItem('user', JSON.stringify(mergedUser));
      }

      console.log('[TelegramAuth] Language changed to:', appLanguage);
    } catch (err) {
      console.error('[TelegramAuth] Error changing language:', err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <TelegramAuthContext.Provider
      value={{
        user,
        telegramUser,
        loading,
        error,
        logout,
        isAuthenticated: !!user,
        isTelegramReady,
        isNewUser,
        theme,
        setTheme,
        language,
        changeLanguage,
      }}
    >
      {children}
    </TelegramAuthContext.Provider>
  );
}

export function useTelegramAuth() {
  const context = useContext(TelegramAuthContext);
  if (context === undefined) {
    throw new Error('useTelegramAuth must be used within a TelegramAuthProvider');
  }
  return context;
}
