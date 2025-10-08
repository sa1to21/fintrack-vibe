import api from '../lib/api';

const userDataService = {
  deleteAll: async (): Promise<void> => {
    const response = await api.delete('/user_data');
    return response.data;
  }
};

export default userDataService;
