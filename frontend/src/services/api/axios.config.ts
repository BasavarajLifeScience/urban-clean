import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:5001/api/v1';

console.log('🌐 [axios.config] Initializing axios with API_URL:', API_URL);
console.log('🌐 [axios.config] Expo config apiUrl:', Constants.expoConfig?.extra?.apiUrl);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

console.log('✅ [axios.config] Axios instance created successfully');

// Request interceptor - attach token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    console.log('🔧 [axios] Request interceptor triggered');
    console.log('🔧 [axios] Request config:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      headers: config.headers,
      data: config.data,
    });

    const token = await SecureStore.getItemAsync('accessToken');
    console.log('🔧 [axios] Access token:', token ? 'Present' : 'Not present');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('🔧 [axios] Token attached to request');
    }

    console.log('✅ [axios] Request ready to send');
    return config;
  },
  (error: AxiosError) => {
    console.error('❌ [axios] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - handle errors & token refresh
api.interceptors.response.use(
  (response) => {
    console.log('✅ [axios] Response received successfully');
    console.log('✅ [axios] Response details:', {
      status: response.status,
      statusText: response.statusText,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  async (error: AxiosError) => {
    console.error('❌ [axios] Response error interceptor triggered');
    console.error('❌ [axios] Error details:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      responseData: error.response?.data,
    });

    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Token expired - refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('🔄 [axios] 401 detected, attempting token refresh...');
      originalRequest._retry = true;

      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');

        if (!refreshToken) {
          console.error('❌ [axios] No refresh token available');
          throw new Error('No refresh token');
        }

        console.log('⏳ [axios] Refreshing access token...');
        const response = await axios.post(`${API_URL}/auth/refresh-token`, {
          refreshToken,
        });

        const { accessToken } = response.data.data;
        await SecureStore.setItemAsync('accessToken', accessToken);
        console.log('✅ [axios] Token refreshed successfully');

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        console.log('🔄 [axios] Retrying original request');
        return api(originalRequest);
      } catch (refreshError) {
        console.error('❌ [axios] Token refresh failed:', refreshError);
        // Refresh failed - logout user
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        await SecureStore.deleteItemAsync('user');
        console.log('🔓 [axios] User logged out due to refresh failure');

        // Navigate to login (handled by auth context)
        return Promise.reject(refreshError);
      }
    }

    console.error('❌ [axios] Rejecting error:', error);
    return Promise.reject(error);
  }
);

export default api;
export { API_URL };
