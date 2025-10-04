import api from '../lib/api';

export interface Account {
  id: string;
  name: string;
  balance: number;
  currency: string;
  account_type: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateAccountData {
  name: string;
  balance: number;
  currency?: string;
  account_type?: string;
}

export interface UpdateAccountData {
  name?: string;
  balance?: number;
  currency?: string;
  account_type?: string;
}

class AccountsService {
  async getAll(): Promise<Account[]> {
    const response = await api.get('/accounts');
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
}

export default new AccountsService();
