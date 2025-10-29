import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../lib/api';

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
  const [theme, setThemeState] = useState<'light' | 'dark'>(() => {
    // Читаем тему из localStorage или дефолтная
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    return savedTheme || 'light';
  });
  const [isManualTheme, setIsManualTheme] = useState(() => {
    // Проверяем, была ли тема установлена вручную
    return localStorage.getItem('theme') !== null;
  });

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
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            console.log('[TelegramAuth] Using saved user from localStorage');
            setUser(JSON.parse(savedUser));
          } else {
            setError('Telegram SDK не загружен. Откройте приложение через Telegram.');
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
            console.log('[TelegramAuth] User authenticated successfully');
            console.log('[TelegramAuth] Is new user:', response.data.is_new_user);
          }
        } else {
          // Если нет данных пользователя
          console.warn('[TelegramAuth] No user data in initDataUnsafe');
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            console.log('[TelegramAuth] Using saved user from localStorage');
            setUser(JSON.parse(savedUser));
          } else {
            setError('Данные пользователя недоступны. Перезапустите приложение.');
          }
        }
      } catch (err: any) {
        console.error('[TelegramAuth] Initialization error:', err);
        console.error('[TelegramAuth] Error response:', err.response?.data);
        console.error('[TelegramAuth] Error message:', err.message);

        // Fallback для локальной разработки
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          console.log('[TelegramAuth] Using saved user after error');
          setUser(JSON.parse(savedUser));
          setIsTelegramReady(false);
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

  // Эффект для применения темы к DOM и синхронизации с Telegram
  useEffect(() => {
    // Применяем класс к document
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);

    // Сохраняем в localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

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

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    setIsManualTheme(true); // Отмечаем, что тема установлена вручную
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
