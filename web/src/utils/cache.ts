/**
 * Утилита для кеширования данных в localStorage
 * Позволяет сохранять данные с timestamp и проверкой срока действия
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export const cache = {
  /**
   * Сохранить данные в кеш
   * @param key - Ключ для сохранения
   * @param data - Данные для сохранения
   */
  set<T>(key: string, data: T): void {
    try {
      const item: CacheItem<T> = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(item));
    } catch (error) {
      console.error('Failed to save to cache:', error);
    }
  },

  /**
   * Получить данные из кеша
   * @param key - Ключ для получения
   * @param maxAge - Максимальный возраст кеша в миллисекундах (по умолчанию 5 минут)
   * @returns Данные или null если не найдено/устарело
   */
  get<T>(key: string, maxAge: number = 5 * 60 * 1000): T | null {
    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const cached: CacheItem<T> = JSON.parse(item);

      // Проверяем не устарел ли кеш
      if (Date.now() - cached.timestamp > maxAge) {
        localStorage.removeItem(key);
        return null;
      }

      return cached.data;
    } catch (error) {
      console.error('Failed to read from cache:', error);
      return null;
    }
  },

  /**
   * Удалить данные из кеша
   * @param key - Ключ для удаления
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from cache:', error);
    }
  },

  /**
   * Очистить весь кеш
   */
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }
};
