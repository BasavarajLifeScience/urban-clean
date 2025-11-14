'use client';

import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import { TrendingUp, DollarSign, Users, Activity } from 'lucide-react';

export default function AnalyticsPage() {
  const [revenueData, setRevenueData] = useState<any>(null);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const [revenue, performance] = await Promise.all([
        adminAPI.getRevenueAnalytics(),
        adminAPI.getSevakPerformance({ limit: 5 }),
      ]);

      if (revenue.success) setRevenueData(revenue.data);
      if (performance.success) setPerformanceData(performance.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
        <p className="text-gray-600 mt-2">Track performance and revenue metrics</p>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{(revenueData?.totalRevenue || 0).toLocaleString()}
              </p>
            </div>
            <DollarSign className="h-10 w-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Transactions</p>
              <p className="text-2xl font-bold text-gray-900">
                {revenueData?.transactionCount || 0}
              </p>
            </div>
            <Activity className="h-10 w-10 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Order Value</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{(revenueData?.averageOrderValue || 0).toFixed(0)}
              </p>
            </div>
            <TrendingUp className="h-10 w-10 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Top Performing Sevaks */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Sevaks</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Sevak</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Total Jobs</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Completed</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Rating</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Completion Rate</th>
              </tr>
            </thead>
            <tbody>
              {performanceData?.sevaks?.map((sevak: any, index: number) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-gray-900">{sevak.name}</div>
                      <div className="text-sm text-gray-500">{sevak.email}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-900">{sevak.totalJobs}</td>
                  <td className="py-3 px-4 text-green-600 font-medium">{sevak.completedJobs}</td>
                  <td className="py-3 px-4">
                    <span className="text-yellow-600 font-medium">
                      ⭐ {sevak.averageRating.toFixed(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-gray-900 font-medium">{sevak.completionRate}%</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
