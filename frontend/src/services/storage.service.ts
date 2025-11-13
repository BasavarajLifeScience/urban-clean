import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const storageService = {
  // Secure storage for sensitive data (tokens)
  async setSecureItem(key: string, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  },

  async getSecureItem(key: string): Promise<string | null> {
    return await SecureStore.getItemAsync(key);
  },

  async deleteSecureItem(key: string): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  },

  // Regular storage for non-sensitive data
  async setItem(key: string, value: any): Promise<void> {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  },

  async getItem<T = any>(key: string): Promise<T | null> {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  },

  async removeItem(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  },

  async clear(): Promise<void> {
    await AsyncStorage.clear();
  },
};
