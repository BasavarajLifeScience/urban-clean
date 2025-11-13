import api from './axios.config';
import { ApiResponse, Booking, PaginatedResponse } from '../../types';

export const bookingApi = {
  createBooking: async (data: {
    serviceId: string;
    scheduledDate: string;
    scheduledTime: string;
    address: any;
    specialInstructions?: string;
  }): Promise<ApiResponse<{ booking: Booking }>> => {
    const response = await api.post('/bookings', data);
    return response.data;
  },

  getMyBookings: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Booking>> => {
    const response = await api.get('/bookings/my-bookings', { params });
    return response.data;
  },

  getBookingById: async (bookingId: string): Promise<ApiResponse<{ booking: Booking }>> => {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  },

  rescheduleBooking: async (
    bookingId: string,
    newDate: string,
    newTime: string
  ): Promise<ApiResponse<{ booking: Booking }>> => {
    const response = await api.patch(`/bookings/${bookingId}/reschedule`, { newDate, newTime });
    return response.data;
  },

  cancelBooking: async (bookingId: string, reason: string): Promise<ApiResponse<{ booking: Booking; refundAmount: number }>> => {
    const response = await api.patch(`/bookings/${bookingId}/cancel`, { reason });
    return response.data;
  },

  getAvailableSlots: async (serviceId: string, date: string): Promise<ApiResponse<{ availableSlots: string[] }>> => {
    const response = await api.get('/bookings/available-slots', {
      params: { serviceId, date },
    });
    return response.data;
  },
};
