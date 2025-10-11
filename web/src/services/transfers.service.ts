import api from '../lib/api';

export interface CreateTransferData {
  from_account_id: string | number;
  to_account_id: string | number;
  amount: number;
  description?: string;
}

export interface UpdateTransferData {
  from_account_id?: string | number;
  to_account_id?: string | number;
  amount?: number;
  description?: string;
  date?: string;
}

export interface Transfer {
  success: boolean;
  from_transaction: any;
  to_transaction: any;
  from_account: {
    id: number;
    balance: number;
  };
  to_account: {
    id: number;
    balance: number;
  };
}

class TransfersService {
  async create(data: CreateTransferData): Promise<Transfer> {
    const response = await api.post('/transfers', { transfer: data });
    return response.data;
  }

  async update(transferId: string, data: UpdateTransferData): Promise<Transfer> {
    const response = await api.put(`/transfers/${transferId}`, { transfer: data });
    return response.data;
  }

  async delete(transferId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/transfers/${transferId}`);
    return response.data;
  }
}

export default new TransfersService();
