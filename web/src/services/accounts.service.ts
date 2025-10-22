import api from '../lib/api';

export interface DebtInfo {
  initialAmount: number;
  creditorName: string;
  dueDate: string;
  interestRate?: number;
  notes?: string;
}

export interface Account {
  id: string;
  name: string;
  balance: number;
  currency: string;
  account_type: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  is_debt: boolean;
  debt_info?: DebtInfo;
  debt_progress?: number;
}

export interface CreateAccountData {
  name: string;
  balance: number;
  currency?: string;
  account_type?: string;
  is_debt?: boolean;
  debt_info?: DebtInfo;
}

export interface UpdateAccountData {
  name?: string;
  balance?: number;
  currency?: string;
  account_type?: string;
  is_debt?: boolean;
  debt_info?: DebtInfo;
}

export interface DebtStats {
  total_debt: number;
  total_initial: number;
  total_paid: number;
  overall_progress: number;
  debts: Array<{
    id: string;
    name: string;
    creditor: string;
    balance: number;
    initial_amount: number;
    due_date: string;
    progress: number;
    currency: string;
  }>;
}

class AccountsService {
  async getAll(type?: 'debt' | 'regular'): Promise<Account[]> {
    const params = type ? { type } : {};
    const response = await api.get('/accounts', { params });
    return response.data;
  }

  async getById(id: string): Promise<Account> {
    const response = await api.get(`/accounts/${id}`);
    return response.data;
  }

  async create(data: CreateAccountData): Promise<Account> {
    const response = await api.post('/accounts', { account: data });
    return response.data;
  }

  async update(id: string, data: UpdateAccountData): Promise<Account> {
    const response = await api.put(`/accounts/${id}`, { account: data });
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/accounts/${id}`);
  }

  async getDebtStats(): Promise<DebtStats> {
    const response = await api.get('/accounts/debt_stats');
    return response.data;
  }
}

export default new AccountsService();
