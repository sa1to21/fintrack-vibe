import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../lib/api';

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
}

interface TelegramAuthContextType {
  user: User | null;
  telegramUser: TelegramUser | null;
  loading: boolean;
  error: string | null;
  logout: () => void;
  isAuthenticated: boolean;
  isTelegramReady: boolean;
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

  useEffect(() => {
    const initializeTelegram = async () => {
      try {
        // Проверяем наличие Telegram WebApp API
        const tg = window.Telegram?.WebApp;

        if (tg && tg.initDataUnsafe?.user) {
          // Инициализируем Telegram WebApp
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

          setTelegramUser(tgUser);
          setIsTelegramReady(true);

          console.log('Telegram user:', tgUser);
          console.log('Authenticating with backend...');

          // Отправляем данные на backend для авторизации/регистрации
          const response = await api.post<AuthResponse>('/auth/telegram', {
            init_data: tg.initData,
            user: {
              telegram_id: tgUser.id,
              first_name: tgUser.first_name,
              last_name: tgUser.last_name,
              username: tgUser.username,
              language_code: tgUser.language_code,
            },
          });

          console.log('Auth response:', response.data);

          // Сохраняем токен
          if (response.data.token) {
            localStorage.setItem('authToken', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            setUser(response.data.user);
          }
        } else {
          // Если не в Telegram - проверяем localStorage для локальной разработки
          console.warn('Not in Telegram WebApp environment');
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            console.log('Loading saved user from localStorage');
            setUser(JSON.parse(savedUser));
          } else {
            setError('Приложение должно быть открыто в Telegram');
          }
        }
      } catch (err: any) {
        console.error('Telegram initialization error:', err);
        console.error('Error details:', err.response?.data);

        // Fallback для локальной разработки
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
          setIsTelegramReady(false);
        } else {
          setError(err.response?.data?.error || 'Ошибка авторизации через Telegram');
        }
      } finally {
        setLoading(false);
      }
    };

    initializeTelegram();
  }, []);

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
