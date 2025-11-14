import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../services/api';
import { storageService } from '../services/storage.service';
import { User, LoginRequest, RegisterRequest, OTPVerifyRequest } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<{ userId: string; otp?: string }>;
  verifyOTP: (data: OTPVerifyRequest) => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (phoneOrEmail: string) => Promise<{ userId: string; otp?: string }>;
  resetPassword: (userId: string, otp: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const accessToken = await storageService.getSecureItem('accessToken');
      const savedUser = await storageService.getItem<User>('user');

      if (accessToken && savedUser) {
        setUser(savedUser);
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginRequest) => {
    try {
      const response = await authApi.login(data);

      if (response.success && response.data) {
        const { accessToken, refreshToken, user } = response.data;

        await storageService.setSecureItem('accessToken', accessToken);
        await storageService.setSecureItem('refreshToken', refreshToken);
        await storageService.setItem('user', user);

        setUser(user);
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
  };

  const register = async (data: RegisterRequest) => {
    console.log('🔐 [AuthContext] register() called');
    console.log('📤 [AuthContext] Register request data:', {
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      email: data.email,
      role: data.role,
      hasPassword: !!data.password,
    });

    try {
      console.log('⏳ [AuthContext] Calling authApi.register...');
      const response = await authApi.register(data);

      console.log('📥 [AuthContext] Raw API response:', response);

      if (response.success && response.data) {
        console.log('✅ [AuthContext] Registration API call successful');
        console.log('📥 [AuthContext] Response data:', {
          userId: response.data.userId,
          hasOtp: !!response.data.otp,
          otp: response.data.otp, // Only in development
        });

        return {
          userId: response.data.userId,
          otp: response.data.otp, // Only in development
        };
      } else {
        console.error('❌ [AuthContext] API returned success=false');
        console.error('❌ [AuthContext] Response:', response);
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error: any) {
      console.error('❌ [AuthContext] Registration error caught:', error);
      console.error('❌ [AuthContext] Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText,
      });
      throw new Error(error.response?.data?.message || error.message || 'Registration failed');
    }
  };

  const verifyOTP = async (data: OTPVerifyRequest) => {
    try {
      const response = await authApi.verifyOTP(data);

      if (response.success && response.data) {
        const { accessToken, refreshToken, user } = response.data;

        await storageService.setSecureItem('accessToken', accessToken);
        await storageService.setSecureItem('refreshToken', refreshToken);
        await storageService.setItem('user', user);

        setUser(user);
      } else {
        throw new Error(response.message || 'OTP verification failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'OTP verification failed');
    }
  };

  const logout = async () => {
    try {
      const refreshToken = await storageService.getSecureItem('refreshToken');
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await storageService.deleteSecureItem('accessToken');
      await storageService.deleteSecureItem('refreshToken');
      await storageService.removeItem('user');
      setUser(null);
    }
  };

  const forgotPassword = async (phoneOrEmail: string) => {
    try {
      const response = await authApi.forgotPassword(phoneOrEmail);

      if (response.success && response.data) {
        return {
          userId: response.data.userId,
          otp: response.data.otp, // Only in development
        };
      } else {
        throw new Error(response.message || 'Password reset request failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Password reset request failed');
    }
  };

  const resetPassword = async (userId: string, otp: string, newPassword: string) => {
    try {
      const response = await authApi.resetPassword(userId, otp, newPassword);

      if (!response.success) {
        throw new Error(response.message || 'Password reset failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Password reset failed');
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    verifyOTP,
    logout,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
