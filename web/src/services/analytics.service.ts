import api from '../lib/api';

export interface AnalyticsSummary {
  income: string;
  expenses: string;
  savings: string;
  avg_expense_per_day: string;
  total_balance: string;
  biggest_expense: {
    amount: string;
    category: string;
    date: string;
  } | null;
}

export interface CategoryExpense {
  id: number;
  name: string;
  icon: string;
  amount: string;
  percentage: number;
  color: string;
}

export interface CategoriesResponse {
  categories: CategoryExpense[];
  total_expenses: string;
}

export interface AccountBalance {
  id: number;
  name: string;
  balance: string;
  percentage: number;
  currency: string;
  account_type: string;
}

export interface AccountsBalanceResponse {
  accounts: AccountBalance[];
  total_balance: string;
}

export interface ComparisonResponse {
  current: {
    income: string;
    expenses: string;
  };
  previous: {
    income: string;
    expenses: string;
  };
  change: {
    income_percent: number;
    expenses_percent: number;
  };
}

export interface InsightsResponse {
  biggest_expense: {
    amount: string;
    category: string;
    date: string;
  } | null;
  avg_transaction: string;
  total_transactions: number;
  busiest_day: string | null;
  top_category: {
    name: string;
    percentage: number;
  } | null;
}

const analyticsService = {
  /**
   * Получить основную статистику за период
   */
  async getSummary(params?: { date_from?: string; date_to?: string }): Promise<AnalyticsSummary> {
    const response = await api.get<AnalyticsSummary>('/analytics/summary', { params });
    return response.data;
  },

  /**
   * Получить расходы по категориям
   */
  async getCategoriesExpenses(params?: {
    date_from?: string;
    date_to?: string;
    limit?: number;
  }): Promise<CategoriesResponse> {
    const response = await api.get<CategoriesResponse>('/analytics/categories', { params });
    return response.data;
  },

  /**
   * Получить баланс по счетам
   */
  async getAccountsBalance(): Promise<AccountsBalanceResponse> {
    const response = await api.get<AccountsBalanceResponse>('/analytics/accounts_balance');
    return response.data;
  },

  /**
   * Сравнить текущий период с предыдущим
   */
  async getComparison(params?: { date_from?: string; date_to?: string }): Promise<ComparisonResponse> {
    const response = await api.get<ComparisonResponse>('/analytics/comparison', { params });
    return response.data;
  },

  /**
   * Получить интересные факты и инсайты
   */
  async getInsights(params?: { date_from?: string; date_to?: string }): Promise<InsightsResponse> {
    const response = await api.get<InsightsResponse>('/analytics/insights', { params });
    return response.data;
  },
};

export default analyticsService;
