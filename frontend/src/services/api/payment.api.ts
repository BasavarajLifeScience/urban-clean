import api from './axios.config';
import { ApiResponse, Payment, Invoice, PaginatedResponse } from '../../types';

export const paymentApi = {
  createOrder: async (bookingId: string, amount: number): Promise<ApiResponse<{
    orderId: string;
    razorpayOrderId: string;
    amount: number;
    currency: string;
  }>> => {
    const response = await api.post('/payments/create-order', { bookingId, amount });
    return response.data;
  },

  verifyPayment: async (
    razorpayOrderId: string,
    razorpayPaymentId: string,
    razorpaySignature: string
  ): Promise<ApiResponse<{ payment: Payment; booking: any; invoice: Invoice }>> => {
    const response = await api.post('/payments/verify', {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    });
    return response.data;
  },

  getInvoice: async (bookingId: string): Promise<ApiResponse<{ invoice: Invoice }>> => {
    const response = await api.get(`/payments/invoice/${bookingId}`);
    return response.data;
  },

  getPaymentHistory: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ payments: Payment[]; pagination: any }>> => {
    const response = await api.get('/payments/history', { params });
    return response.data;
  },

  processRefund: async (bookingId: string, amount: number, reason: string): Promise<ApiResponse> => {
    const response = await api.post('/payments/refund', { bookingId, amount, reason });
    return response.data;
  },
};
