import api from './axios.config';
import { ApiResponse, Rating, PaginatedResponse } from '../../types';

export const ratingApi = {
  createRating: async (data: {
    bookingId: string;
    ratedTo: string;
    rating: number;
    comment?: string;
  }): Promise<ApiResponse<{ rating: Rating }>> => {
    const response = await api.post('/ratings', data);
    return response.data;
  },

  getSevakRatings: async (
    sevakId: string,
    params?: {
      page?: number;
      limit?: number;
      sort?: 'recent' | 'highest' | 'lowest';
    }
  ): Promise<PaginatedResponse<Rating>> => {
    const response = await api.get(`/ratings/sevak/${sevakId}`, { params });
    return response.data;
  },

  getBookingRating: async (bookingId: string): Promise<ApiResponse<{ rating: Rating }>> => {
    const response = await api.get(`/ratings/booking/${bookingId}`);
    return response.data;
  },

  updateRating: async (
    ratingId: string,
    data: { rating: number; comment?: string }
  ): Promise<ApiResponse<{ rating: Rating }>> => {
    const response = await api.put(`/ratings/${ratingId}`, data);
    return response.data;
  },

  reportRating: async (ratingId: string, reason: string): Promise<ApiResponse> => {
    const response = await api.post(`/ratings/${ratingId}/report`, { reason });
    return response.data;
  },
};
