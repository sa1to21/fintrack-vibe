import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { retrieveLaunchParams, initData } from '@telegram-apps/sdk-react';
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

export function TelegramAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isTelegramReady, setIsTelegramReady] = useState(false);

  useEffect(() => {
    const initializeTelegram = async () => {
      try {
        // Попытка получить данные из Telegram
        const launchParams = retrieveLaunchParams();
        const data = initData();

        if (data && data.user) {
          // Сохраняем данные пользователя Telegram
          const tgUser: TelegramUser = {
            id: data.user.id,
            first_name: data.user.firstName,
            last_name: data.user.lastName,
            username: data.user.username,
            language_code: data.user.languageCode,
            photo_url: data.user.photoUrl,
          };

          setTelegramUser(tgUser);
          setIsTelegramReady(true);

          // Отправляем данные на backend для авторизации/регистрации
          const response = await api.post<AuthResponse>('/auth/telegram', {
            init_data: launchParams.initDataRaw,
            user: {
              telegram_id: tgUser.id,
              first_name: tgUser.first_name,
              last_name: tgUser.last_name,
              username: tgUser.username,
              language_code: tgUser.language_code,
            },
          });

          // Сохраняем токен
          if (response.data.token) {
            localStorage.setItem('authToken', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            setUser(response.data.user);
          }
        } else {
          // Если не в Telegram (локальная разработка), пробуем загрузить из localStorage
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          } else {
            setError('Приложение должно быть открыто в Telegram');
          }
        }
      } catch (err: any) {
        console.error('Telegram initialization error:', err);

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
    // В Telegram Mini App обычно не делают logout, но оставляем для гибкости
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
