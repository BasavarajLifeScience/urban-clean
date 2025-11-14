'use client';

import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import { Users, Calendar, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

interface DashboardStats {
  statistics: {
    users: {
      total: number;
      residents: { total: number };
      sevaks: {
        total: number;
        active: number;
        verified: number;
        blacklisted: number;
      };
      vendors: { total: number };
    };
    bookings: {
      total: number;
      pending: number;
      completed: number;
      cancelled: number;
      today: number;
      thisMonth: number;
    };
    services: {
      total: number;
      active: number;
    };
    revenue: {
      today: number;
      thisMonth: number;
      lastMonth: number;
      growth: number;
    };
  };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const response = await adminAPI.getDashboardStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Failed to load statistics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-red-800">Error Loading Dashboard</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Welcome to your admin control center</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Total Users */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.statistics.users.total || 0}</p>
            </div>
          </div>
          <div className="mt-4 flex text-sm">
            <span className="text-gray-600">Residents: {stats?.statistics.users.residents.total || 0}</span>
            <span className="ml-4 text-gray-600">Sevaks: {stats?.statistics.users.sevaks.total || 0}</span>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Bookings</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.statistics.bookings.total || 0}</p>
            </div>
          </div>
          <div className="mt-4 flex text-sm">
            <span className="text-green-600">Today: {stats?.statistics.bookings.today || 0}</span>
            <span className="ml-4 text-gray-600">Pending: {stats?.statistics.bookings.pending || 0}</span>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-100 rounded-lg p-3">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(stats?.statistics.revenue.thisMonth || 0)}
              </p>
            </div>
          </div>
          <div className="mt-4 text-sm">
            <span className="text-gray-600">Today: {formatCurrency(stats?.statistics.revenue.today || 0)}</span>
          </div>
        </div>

        {/* Revenue Growth */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-orange-100 rounded-lg p-3">
              <TrendingUp className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Growth</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.statistics.revenue.growth.toFixed(1) || 0}%
              </p>
            </div>
          </div>
          <div className="mt-4 text-sm">
            <span className="text-gray-600">
              vs Last Month: {formatCurrency(stats?.statistics.revenue.lastMonth || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Sevak Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Sevak Statistics</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Sevaks</span>
              <span className="font-semibold text-gray-900">{stats?.statistics.users.sevaks.total || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active</span>
              <span className="font-semibold text-green-600">{stats?.statistics.users.sevaks.active || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Verified</span>
              <span className="font-semibold text-blue-600">{stats?.statistics.users.sevaks.verified || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Blacklisted</span>
              <span className="font-semibold text-red-600">{stats?.statistics.users.sevaks.blacklisted || 0}</span>
            </div>
          </div>
        </div>

        {/* Booking Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Statistics</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Bookings</span>
              <span className="font-semibold text-gray-900">{stats?.statistics.bookings.total || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending</span>
              <span className="font-semibold text-yellow-600">{stats?.statistics.bookings.pending || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Completed</span>
              <span className="font-semibold text-green-600">{stats?.statistics.bookings.completed || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Cancelled</span>
              <span className="font-semibold text-red-600">{stats?.statistics.bookings.cancelled || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
