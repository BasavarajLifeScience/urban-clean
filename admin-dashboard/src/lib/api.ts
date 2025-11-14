import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('adminToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Admin API functions
export const adminAPI = {
  // Authentication
  login: async (email: string, password: string, adminCode: string) => {
    const response = await api.post('/auth/admin-login', { email, password, adminCode });
    return response.data;
  },

  // Dashboard
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/overview');
    return response.data;
  },

  // Sevaks
  getSevaks: async (params?: any) => {
    const response = await api.get('/admin/sevaks', { params });
    return response.data;
  },

  getSevakDetails: async (sevakId: string) => {
    const response = await api.get(`/admin/sevaks/${sevakId}`);
    return response.data;
  },

  blacklistSevak: async (sevakId: string, data: any) => {
    const response = await api.post(`/admin/sevaks/${sevakId}/blacklist`, data);
    return response.data;
  },

  reinstateSevak: async (sevakId: string, data: any) => {
    const response = await api.put(`/admin/sevaks/${sevakId}/reinstate`, data);
    return response.data;
  },

  toggleSevakActive: async (sevakId: string, data: any) => {
    const response = await api.put(`/admin/sevaks/${sevakId}/toggle-active`, data);
    return response.data;
  },

  // Bookings
  getBookings: async (params?: any) => {
    const response = await api.get('/admin/bookings', { params });
    return response.data;
  },

  assignSevak: async (bookingId: string, data: any) => {
    const response = await api.put(`/admin/bookings/${bookingId}/assign-sevak`, data);
    return response.data;
  },

  // Analytics
  getRevenueAnalytics: async (params?: any) => {
    const response = await api.get('/admin/analytics/revenue', { params });
    return response.data;
  },

  getSevakPerformance: async (params?: any) => {
    const response = await api.get('/admin/analytics/sevak-performance', { params });
    return response.data;
  },

  // Settings
  getSettings: async () => {
    const response = await api.get('/admin/settings');
    return response.data;
  },

  updateSettings: async (data: any) => {
    const response = await api.put('/admin/settings', data);
    return response.data;
  },

  // Offers
  getOffers: async (params?: any) => {
    const response = await api.get('/admin/offers', { params });
    return response.data;
  },

  createOffer: async (data: any) => {
    const response = await api.post('/admin/offers', data);
    return response.data;
  },

  // Broadcast
  sendBroadcast: async (data: any) => {
    const response = await api.post('/admin/notifications/broadcast', data);
    return response.data;
  },
};
