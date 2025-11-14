import { api } from './axios.config';
import { ApiResponse } from '../../types';

export interface VendorDashboard {
  statistics: {
    totalServices: number;
    totalBookings: number;
    pendingBookings: number;
    completedBookings: number;
    todayBookings: number;
    totalRevenue: number;
    monthRevenue: number;
    averageRating: number;
    totalRatings: number;
  };
  recentBookings: any[];
  activeServices: any[];
}

export interface VendorService {
  _id: string;
  name: string;
  description: string;
  category: string;
  basePrice: number;
  imageUrl?: string;
  isActive: boolean;
  stats?: {
    totalBookings: number;
    revenue: number;
  };
}

export interface VendorOrder {
  _id: string;
  bookingNumber: string;
  serviceId: any;
  residentId: any;
  sevakId?: any;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  totalAmount: number;
  paymentStatus: string;
}

export interface RevenueData {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  revenueByService: { [key: string]: number };
  dailyRevenue: { [key: string]: number };
}

export const vendorApi = {
  /**
   * Get vendor dashboard statistics
   */
  getDashboard: async (): Promise<ApiResponse<VendorDashboard>> => {
    const response = await api.get('/vendor/dashboard');
    return response.data;
  },

  /**
   * Get vendor's services
   */
  getServices: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    isActive?: boolean;
  }): Promise<ApiResponse<{
    services: VendorService[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
    };
  }>> => {
    const response = await api.get('/vendor/services', { params });
    return response.data;
  },

  /**
   * Get vendor's orders
   */
  getOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<{
    orders: VendorOrder[];
    statusCounts: { [key: string]: number };
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
    };
  }>> => {
    const response = await api.get('/vendor/orders', { params });
    return response.data;
  },

  /**
   * Get order details
   */
  getOrderDetails: async (orderId: string): Promise<ApiResponse<{
    order: VendorOrder;
    service: any;
    resident: any;
    sevak?: any;
    payment?: any;
    rating?: any;
    timeline: any[];
  }>> => {
    const response = await api.get(`/vendor/orders/${orderId}`);
    return response.data;
  },

  /**
   * Get revenue analytics
   */
  getRevenue: async (params?: {
    period?: 'today' | 'week' | 'month' | 'year';
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<RevenueData>> => {
    const response = await api.get('/vendor/revenue', { params });
    return response.data;
  },

  /**
   * Update service
   */
  updateService: async (serviceId: string, data: Partial<{
    name: string;
    description: string;
    basePrice: number;
    duration: number;
    isActive: boolean;
    features: string[];
    tags: string[];
  }>): Promise<ApiResponse<{ service: VendorService }>> => {
    const response = await api.patch(`/vendor/services/${serviceId}`, data);
    return response.data;
  },
};
