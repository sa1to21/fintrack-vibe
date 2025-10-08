import api from '../lib/api';

export interface CreateTransferData {
  from_account_id: string | number;
  to_account_id: string | number;
  amount: number;
  description?: string;
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
}

export default new TransfersService();
