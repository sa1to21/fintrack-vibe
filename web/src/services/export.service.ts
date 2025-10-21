import { api } from '../lib/api';

class ExportService {
  /**
   * Экспортирует все транзакции пользователя в CSV файл
   * Автоматически скачивает файл через браузер
   */
  async exportTransactionsToCsv(): Promise<void> {
    try {
      const response = await api.get('/exports/transactions', {
        responseType: 'blob', // Важно для получения файла
      });

      // Создаём URL для blob
      const blob = new Blob([response.data], { type: 'text/csv; charset=utf-8' });
      const url = window.URL.createObjectURL(blob);

      // Создаём временную ссылку и кликаем по ней
      const link = document.createElement('a');
      link.href = url;

      // Получаем имя файла из заголовка ответа или используем дефолтное
      const contentDisposition = response.headers['content-disposition'];
      let filename = `fintrack-transactions-${new Date().toISOString().split('T')[0]}.csv`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      link.download = filename;
      document.body.appendChild(link);
      link.click();

      // Очистка
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export transactions:', error);
      throw error;
    }
  }
}

export default new ExportService();
