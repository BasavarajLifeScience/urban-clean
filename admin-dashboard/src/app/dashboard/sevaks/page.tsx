'use client';

import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import { Search, UserX, UserCheck, Ban, CheckCircle, AlertCircle } from 'lucide-react';

interface Sevak {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  isVerified: boolean;
  isBlacklisted: boolean;
  blacklistReason?: string;
  createdAt: string;
}

export default function SevaksPage() {
  const [sevaks, setSevaks] = useState<Sevak[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedSevak, setSelectedSevak] = useState<Sevak | null>(null);
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [blacklistReason, setBlacklistReason] = useState('');
  const [blacklistType, setBlacklistType] = useState<'temporary' | 'permanent'>('temporary');

  useEffect(() => {
    fetchSevaks();
  }, [filter]);

  const fetchSevaks = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (filter === 'active') params.status = 'active';
      if (filter === 'blacklisted') params.isBlacklisted = true;
      if (filter === 'unverified') params.isVerified = false;

      const response = await adminAPI.getSevaks(params);
      if (response.success) {
        setSevaks(response.data.sevaks);
      }
    } catch (err) {
      console.error('Failed to fetch sevaks:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlacklist = async () => {
    if (!selectedSevak || !blacklistReason) return;

    try {
      await adminAPI.blacklistSevak(selectedSevak._id, {
        reason: blacklistReason,
        type: blacklistType,
        duration: blacklistType === 'temporary' ? 30 : undefined,
      });
      setShowBlacklistModal(false);
      setBlacklistReason('');
      fetchSevaks();
    } catch (err) {
      console.error('Failed to blacklist sevak:', err);
    }
  };

  const handleReinstate = async (sevakId: string) => {
    try {
      await adminAPI.reinstateSevak(sevakId, { reason: 'Admin reinstated' });
      fetchSevaks();
    } catch (err) {
      console.error('Failed to reinstate sevak:', err);
    }
  };

  const handleToggleActive = async (sevakId: string, isActive: boolean) => {
    try {
      await adminAPI.toggleSevakActive(sevakId, {
        isActive: !isActive,
        reason: isActive ? 'Admin deactivated' : 'Admin activated',
      });
      fetchSevaks();
    } catch (err) {
      console.error('Failed to toggle sevak status:', err);
    }
  };

  const filteredSevaks = sevaks.filter((sevak) =>
    sevak.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sevak.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sevak.phoneNumber.includes(searchTerm)
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Sevak Management</h1>
        <p className="text-gray-600 mt-2">Manage and monitor service providers</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex space-x-2">
            {['all', 'active', 'blacklisted', 'unverified'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search sevaks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Sevaks Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sevak
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSevaks.map((sevak) => (
                <tr key={sevak._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-600 font-semibold">
                          {sevak.fullName.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{sevak.fullName}</div>
                        <div className="text-sm text-gray-500">ID: {sevak._id.slice(-8)}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{sevak.email}</div>
                    <div className="text-sm text-gray-500">{sevak.phoneNumber}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {sevak.isBlacklisted ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          Blacklisted
                        </span>
                      ) : sevak.isActive ? (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          Inactive
                        </span>
                      )}
                      {sevak.isVerified && (
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 ml-2">
                          Verified
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium space-x-2">
                    {sevak.isBlacklisted ? (
                      <button
                        onClick={() => handleReinstate(sevak._id)}
                        className="text-green-600 hover:text-green-900"
                        title="Reinstate"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => handleToggleActive(sevak._id, sevak.isActive)}
                          className={sevak.isActive ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}
                          title={sevak.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {sevak.isActive ? <UserX className="h-5 w-5" /> : <UserCheck className="h-5 w-5" />}
                        </button>
                        <button
                          onClick={() => {
                            setSelectedSevak(sevak);
                            setShowBlacklistModal(true);
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Blacklist"
                        >
                          <Ban className="h-5 w-5" />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredSevaks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No sevaks found</p>
            </div>
          )}
        </div>
      )}

      {/* Blacklist Modal */}
      {showBlacklistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Blacklist Sevak</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  value={blacklistType}
                  onChange={(e) => setBlacklistType(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="temporary">Temporary (30 days)</option>
                  <option value="permanent">Permanent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                <textarea
                  value={blacklistReason}
                  onChange={(e) => setBlacklistReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  rows={3}
                  placeholder="Enter reason for blacklisting..."
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowBlacklistModal(false);
                    setBlacklistReason('');
                  }}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleBlacklist}
                  disabled={!blacklistReason}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  Blacklist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
