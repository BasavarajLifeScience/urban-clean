import api from './axios.config';
import {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  OTPVerifyRequest,
} from '../../types';

export const authApi = {
  register: async (data: RegisterRequest): Promise<ApiResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  verifyOTP: async (data: OTPVerifyRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post('/auth/verify-otp', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<ApiResponse<{ accessToken: string }>> => {
    const response = await api.post('/auth/refresh-token', { refreshToken });
    return response.data;
  },

  forgotPassword: async (phoneOrEmail: string): Promise<ApiResponse> => {
    const response = await api.post('/auth/forgot-password', { phoneOrEmail });
    return response.data;
  },

  resetPassword: async (userId: string, otp: string, newPassword: string): Promise<ApiResponse> => {
    const response = await api.post('/auth/reset-password', { userId, otp, newPassword });
    return response.data;
  },

  logout: async (refreshToken: string): Promise<ApiResponse> => {
    const response = await api.post('/auth/logout', { refreshToken });
    return response.data;
  },
};
