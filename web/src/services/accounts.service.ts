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
  is_savings_account: boolean;
  interest_rate?: number;
  deposit_term_months?: number;
  deposit_start_date?: string;
  deposit_end_date?: string;
  auto_renewal?: boolean;
  withdrawal_allowed?: boolean;
  target_amount?: number;
  last_interest_date?: string;
}

export interface CreateAccountData {
  name: string;
  balance: number;
  currency?: string;
  account_type?: string;
  is_debt?: boolean;
  debt_info?: DebtInfo;
  is_savings_account?: boolean;
  interest_rate?: number;
  deposit_term_months?: number;
  deposit_start_date?: string;
  deposit_end_date?: string;
  auto_renewal?: boolean;
  withdrawal_allowed?: boolean;
  target_amount?: number;
}

export interface UpdateAccountData {
  name?: string;
  balance?: number;
  currency?: string;
  account_type?: string;
  is_debt?: boolean;
  debt_info?: DebtInfo;
  is_savings_account?: boolean;
  interest_rate?: number;
  deposit_term_months?: number;
  deposit_start_date?: string;
  deposit_end_date?: string;
  auto_renewal?: boolean;
  withdrawal_allowed?: boolean;
  target_amount?: number;
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

  async reorder(accountOrders: Array<{ id: string; position: number }>): Promise<void> {
    await api.post('/accounts/reorder', { accounts: accountOrders });
  }
}

export default new AccountsService();
