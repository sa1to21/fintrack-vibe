import api from '../lib/api';

export interface User {
  id: string;
  name: string;
  email?: string;
  base_currency: string;
  created_at: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  base_currency?: string;
}

class UsersService {
  async getCurrent(): Promise<User> {
    const response = await api.get('/users/current');
    return response.data;
  }

  async update(data: UpdateUserData): Promise<User> {
    const response = await api.put('/users/current', { user: data });
    return response.data;
  }
}

export default new UsersService();
