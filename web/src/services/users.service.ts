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
    console.log('UsersService.update called with data:', data);
    console.log('Making PUT request to /users/current with payload:', { user: data });
    const response = await api.put('/users/current', { user: data });
    console.log('UsersService.update response:', response.data);
    return response.data;
  }
}

export default new UsersService();
