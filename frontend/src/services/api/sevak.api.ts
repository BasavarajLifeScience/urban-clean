import api from './axios.config';
import { ApiResponse, Job, Earnings, PerformanceMetrics, Rating } from '../../types';

export const sevakApi = {
  getJobs: async (params?: {
    date?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    jobs: Job[];
    todayCount: number;
    upcomingCount: number;
    pagination: any;
  }>> => {
    const response = await api.get('/sevak/jobs', { params });
    return response.data;
  },

  getJobDetails: async (jobId: string): Promise<ApiResponse<{
    job: Job;
    resident: any;
    service: any;
    checkInOTP: string;
  }>> => {
    const response = await api.get(`/sevak/jobs/${jobId}`);
    return response.data;
  },

  checkIn: async (data: {
    bookingId: string;
    otp: string;
    location?: { lat: number; lng: number };
  }): Promise<ApiResponse<{ booking: any; checkedInAt: string }>> => {
    const response = await api.post('/sevak/check-in', data);
    return response.data;
  },

  checkOut: async (data: {
    bookingId: string;
    location?: { lat: number; lng: number };
  }): Promise<ApiResponse<{ booking: any; checkedOutAt: string; duration: number }>> => {
    const response = await api.post('/sevak/check-out', data);
    return response.data;
  },

  completeJob: async (bookingId: string, formData: FormData): Promise<ApiResponse<{ booking: any }>> => {
    const response = await api.patch(`/sevak/jobs/${bookingId}/complete`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  reportIssue: async (bookingId: string, formData: FormData): Promise<ApiResponse<{ issue: any }>> => {
    const response = await api.post(`/sevak/jobs/${bookingId}/report-issue`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getEarnings: async (params?: {
    period?: 'today' | 'week' | 'month';
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<{
    totalEarnings: number;
    breakdown: Earnings[];
  }>> => {
    const response = await api.get('/sevak/earnings', { params });
    return response.data;
  },

  getPerformance: async (): Promise<ApiResponse<PerformanceMetrics>> => {
    const response = await api.get('/sevak/performance');
    return response.data;
  },

  getFeedback: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{
    feedback: Rating[];
    averageRating: number;
    pagination: any;
  }>> => {
    const response = await api.get('/sevak/feedback', { params });
    return response.data;
  },

  getAttendance: async (params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<{
    attendance: any[];
    totalDays: number;
    presentDays: number;
  }>> => {
    const response = await api.get('/sevak/attendance', { params });
    return response.data;
  },
};
