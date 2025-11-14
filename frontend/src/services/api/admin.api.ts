import api from './axios.config';

export interface AdminLoginData {
  email: string;
  password: string;
  adminCode: string;
}

export interface DashboardStats {
  statistics: {
    users: {
      total: number;
      residents: { total: number };
      sevaks: {
        total: number;
        active: number;
        verified: number;
        blacklisted: number;
      };
    };
    bookings: {
      total: number;
      pending: number;
      completed: number;
      cancelled: number;
      today: number;
      thisMonth: number;
    };
    services: {
      total: number;
      active: number;
    };
    revenue: {
      today: number;
      thisMonth: number;
      lastMonth: number;
      growth: number;
    };
  };
}

export interface Sevak {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  isVerified: boolean;
  isBlacklisted: boolean;
  blacklistReason?: string;
  createdAt: string;
}

export interface BookingListItem {
  _id: string;
  bookingNumber: string;
  resident: {
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  sevak?: {
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  service: {
    name: string;
    basePrice: number;
  };
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  totalAmount: number;
  createdAt: string;
}

/**
 * Admin authentication
 */
export const adminLogin = async (data: AdminLoginData) => {
  const response = await api.post('/auth/admin-login', data);
  return response.data;
};

/**
 * Dashboard
 */
export const getDashboardOverview = async (): Promise<DashboardStats> => {
  const response = await api.get('/admin/dashboard/overview');
  return response.data;
};

/**
 * Sevak Management
 */
export const getAllSevaks = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  isVerified?: boolean;
  isBlacklisted?: boolean;
  search?: string;
}) => {
  const response = await api.get('/admin/sevaks', { params });
  return response.data;
};

export const getSevakDetails = async (sevakId: string) => {
  const response = await api.get(`/admin/sevaks/${sevakId}`);
  return response.data;
};

export const verifySevakDocument = async (
  sevakId: string,
  data: {
    documentId: string;
    status: 'verified' | 'rejected';
    notes?: string;
  }
) => {
  const response = await api.put(`/admin/sevaks/${sevakId}/verify`, data);
  return response.data;
};

export const toggleSevakActive = async (
  sevakId: string,
  data: { isActive: boolean; reason?: string }
) => {
  const response = await api.put(`/admin/sevaks/${sevakId}/toggle-active`, data);
  return response.data;
};

export const blacklistSevak = async (
  sevakId: string,
  data: {
    reason: string;
    type: 'temporary' | 'permanent';
    duration?: number;
    notes?: string;
    relatedComplaints?: string[];
  }
) => {
  const response = await api.post(`/admin/sevaks/${sevakId}/blacklist`, data);
  return response.data;
};

export const reinstateSevak = async (
  sevakId: string,
  data: { reason: string; notes?: string }
) => {
  const response = await api.put(`/admin/sevaks/${sevakId}/reinstate`, data);
  return response.data;
};

/**
 * Booking Management
 */
export const getAllBookings = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  sevakId?: string;
  residentId?: string;
}) => {
  const response = await api.get('/admin/bookings', { params });
  return response.data;
};

export const assignSevakToBooking = async (
  bookingId: string,
  data: { sevakId: string; notes?: string }
) => {
  const response = await api.put(`/admin/bookings/${bookingId}/assign-sevak`, data);
  return response.data;
};

/**
 * Analytics
 */
export const getRevenueAnalytics = async (params?: {
  dateFrom?: string;
  dateTo?: string;
  groupBy?: 'day' | 'week' | 'month';
}) => {
  const response = await api.get('/admin/analytics/revenue', { params });
  return response.data;
};

export const getSevakPerformance = async (params?: {
  dateFrom?: string;
  dateTo?: string;
  sevakId?: string;
  limit?: number;
}) => {
  const response = await api.get('/admin/analytics/sevak-performance', { params });
  return response.data;
};

/**
 * Platform Settings
 */
export const getPlatformSettings = async () => {
  const response = await api.get('/admin/settings');
  return response.data;
};

export const updatePlatformSettings = async (data: any) => {
  const response = await api.put('/admin/settings', data);
  return response.data;
};

/**
 * Offers Management
 */
export const getAllOffers = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
}) => {
  const response = await api.get('/admin/offers', { params });
  return response.data;
};

export const createOffer = async (data: any) => {
  const response = await api.post('/admin/offers', data);
  return response.data;
};

/**
 * Notifications
 */
export const sendBroadcast = async (data: {
  title: string;
  message: string;
  targetAudience: 'all' | 'residents' | 'sevaks' | 'custom';
  userIds?: string[];
}) => {
  const response = await api.post('/admin/notifications/broadcast', data);
  return response.data;
};
