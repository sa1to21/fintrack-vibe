import api from '../lib/api';

class ExportService {
  /**
   * Экспортирует все транзакции пользователя в CSV файл
   * Отправляет файл в чат через Telegram бота
   */
  async exportTransactionsToCsv(): Promise<void> {
    try {
      const response = await api.get('/exports/transactions');

      // API теперь отправляет файл в чат через бота
      // Возвращает JSON с сообщением об успехе
      return response.data;
    } catch (error) {
      console.error('Failed to export transactions:', error);
      throw error;
    }
  }
}

export default new ExportService();
