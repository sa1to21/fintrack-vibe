import api from '../lib/api';

export interface DashboardData {
  accounts: Array<{
    id: number;
    name: string;
    balance: string;
    account_type: string;
    user_id: number;
    created_at: string;
    updated_at: string;
  }>;
  transactions: Array<{
    id: number;
    amount: string;
    transaction_type: string;
    description: string;
    date: string;
    time: string;
    account_id: number;
    category_id: number;
    paired_transaction_id: number | null;
    transfer_id: string | null;
    created_at: string;
    updated_at: string;
    category?: {
      id: number;
      name: string;
      icon: string;
      category_type: string;
    };
    paired_account_id?: number;
  }>;
}

const dashboardService = {
  /**
   * Получить данные для дашборда (счета + последние транзакции)
   * Один запрос вместо 4+ отдельных
   */
  async getData(): Promise<DashboardData> {
    const response = await api.get<DashboardData>('/dashboard');
    return response.data;
  }
};

export default dashboardService;
