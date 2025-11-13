import api from './axios.config';
import { ApiResponse, Service, Category, PaginatedResponse } from '../../types';

export const serviceApi = {
  getServices: async (params?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Service>> => {
    const response = await api.get('/services', { params });
    return response.data;
  },

  getServiceById: async (serviceId: string): Promise<ApiResponse<{ service: Service }>> => {
    const response = await api.get(`/services/${serviceId}`);
    return response.data;
  },

  getCategories: async (): Promise<ApiResponse<{ categories: Category[] }>> => {
    const response = await api.get('/services/categories');
    return response.data;
  },

  addToFavorites: async (serviceId: string): Promise<ApiResponse> => {
    const response = await api.post('/services/favorites', { serviceId });
    return response.data;
  },

  getFavorites: async (): Promise<ApiResponse<{ favorites: Service[] }>> => {
    const response = await api.get('/services/user/favorites');
    return response.data;
  },

  removeFromFavorites: async (serviceId: string): Promise<ApiResponse> => {
    const response = await api.delete(`/services/favorites/${serviceId}`);
    return response.data;
  },
};
