import api from './axios.config';
import { ApiResponse, Notification } from '../../types';

export const notificationApi = {
  getNotifications: async (params?: {
    page?: number;
    limit?: number;
    isRead?: boolean;
  }): Promise<ApiResponse<{
    notifications: Notification[];
    unreadCount: number;
    total: number;
    page: number;
    totalPages: number;
  }>> => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  markAsRead: async (notificationId: string): Promise<ApiResponse<{ notification: Notification }>> => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<ApiResponse> => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },

  getSettings: async (): Promise<ApiResponse<{ settings: any }>> => {
    const response = await api.get('/notifications/settings');
    return response.data;
  },

  updateSettings: async (settings: {
    pushEnabled?: boolean;
    emailEnabled?: boolean;
    smsEnabled?: boolean;
    enabledTypes?: any;
  }): Promise<ApiResponse<{ settings: any }>> => {
    const response = await api.put('/notifications/settings', settings);
    return response.data;
  },
};
