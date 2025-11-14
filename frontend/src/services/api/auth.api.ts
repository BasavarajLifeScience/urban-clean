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
    console.log('🌐 [authApi] register() called');
    console.log('📤 [authApi] Request data:', {
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      email: data.email,
      role: data.role,
      hasPassword: !!data.password,
    });

    try {
      console.log('⏳ [authApi] Making POST request to /auth/register');
      const response = await api.post('/auth/register', data);

      console.log('📥 [authApi] Response received');
      console.log('📥 [authApi] Status:', response.status);
      console.log('📥 [authApi] Response data:', response.data);

      return response.data;
    } catch (error: any) {
      console.error('❌ [authApi] Request failed:', error);
      console.error('❌ [authApi] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
      });
      throw error;
    }
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
