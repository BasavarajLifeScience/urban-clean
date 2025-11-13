import api from './axios.config';
import { ApiResponse, User, Profile } from '../../types';

export const userApi = {
  getProfile: async (): Promise<ApiResponse<{ user: User; profile: Profile }>> => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  updateProfile: async (data: Partial<Profile>): Promise<ApiResponse<{ profile: Profile; isComplete: boolean }>> => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  uploadDocuments: async (formData: FormData): Promise<ApiResponse<{ documents: any[] }>> => {
    const response = await api.post('/users/profile/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteDocument: async (documentId: string): Promise<ApiResponse> => {
    const response = await api.delete(`/users/profile/documents/${documentId}`);
    return response.data;
  },
};
