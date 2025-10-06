import api from '../lib/api';

export interface Category {
  id: string | number;
  name: string;
  category_type: 'income' | 'expense';
  color: string;
  icon: string;
  user_id?: string | number;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryData {
  name: string;
  category_type: 'income' | 'expense';
  color?: string;
  icon?: string;
}

export interface UpdateCategoryData {
  name?: string;
  category_type?: 'income' | 'expense';
  color?: string;
  icon?: string;
}

class CategoriesService {
  async getAll(): Promise<Category[]> {
    const response = await api.get('/categories');
    return response.data;
  }

  async getById(id: string): Promise<Category> {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  }

  async create(data: CreateCategoryData): Promise<Category> {
    const response = await api.post('/categories', { category: data });
    return response.data;
  }

  async update(id: string, data: UpdateCategoryData): Promise<Category> {
    const response = await api.put(`/categories/${id}`, { category: data });
    return response.data;
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  }
}

export default new CategoriesService();
