'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminAPI } from './api';

interface AdminUser {
  _id: string;
  email: string;
  fullName: string;
  role: string;
  admin: {
    adminCode: string;
    isSuperAdmin: boolean;
    department?: string;
  };
}

interface AuthContextType {
  user: AdminUser | null;
  login: (email: string, password: string, adminCode: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('adminUser');
    const token = localStorage.getItem('adminToken');

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, adminCode: string) => {
    try {
      const response = await adminAPI.login(email, password, adminCode);

      // Backend returns { success, message, data: { accessToken, user, admin } }
      if (response.success) {
        const { accessToken, user: userData, admin } = response.data;

        const adminUser = {
          ...userData,
          admin,
        };

        localStorage.setItem('adminToken', accessToken);
        localStorage.setItem('adminUser', JSON.stringify(adminUser));
        setUser(adminUser);
        router.push('/dashboard');
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
