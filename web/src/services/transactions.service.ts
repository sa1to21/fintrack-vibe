import api from '../lib/api';

export interface Transaction {
  id: string;
  amount: number;
  transaction_type: 'income' | 'expense';
  description: string;
  date: string;
  account_id: string;
  category_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  // Расширенные данные (join)
  account?: {
    id: string;
    name: string;
  };
  category?: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
}

export interface CreateTransactionData {
  amount: number;
  transaction_type: 'income' | 'expense';
  description: string;
  date: string;
  account_id: string;
  category_id: string;
}

export interface UpdateTransactionData {
  amount?: number;
  transaction_type?: 'income' | 'expense';
  description?: string;
  date?: string;
  account_id?: string;
  category_id?: string;
}

export interface TransactionFilters {
  start_date?: string;
  end_date?: string;
  transaction_type?: 'income' | 'expense';
  account_id?: string;
  category_id?: string;
}

export interface TransactionStats {
  total_income: number;
  total_expense: number;
  balance: number;
  transactions_count: number;
}

class TransactionsService {
  async getAll(filters?: TransactionFilters): Promise<Transaction[]> {
    const response = await api.get('/transactions', { params: filters });
    return response.data;
  }

  async getById(id: string): Promise<Transaction> {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  }

  async create(data: CreateTransactionData): Promise<Transaction> {
    const response = await api.post('/transactions', { transaction: data });
    return response.data;
  }

  async update(id: string, data: UpdateTransactionData): Promise<Transaction> {
    const response = await api.put(`/transactions/${id}`, { transaction: data });
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/transactions/${id}`);
  }

  async getStats(filters?: TransactionFilters): Promise<TransactionStats> {
    const response = await api.get('/transactions/stats', { params: filters });
    return response.data;
  }
}

export default new TransactionsService();
