'use client';

import { useEffect, useState } from 'react';
import { adminAPI } from '@/lib/api';
import { Calendar, Search, User, UserPlus, X } from 'lucide-react';
import { format } from 'date-fns';

interface Booking {
  _id: string;
  bookingNumber: string;
  resident: {
    fullName: string;
    email: string;
  };
  sevak?: {
    _id: string;
    fullName: string;
  };
  service: {
    name: string;
  };
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  totalAmount: number;
}

interface Sevak {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  isVerified: boolean;
  isBlacklisted: boolean;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [sevaks, setSevaks] = useState<Sevak[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [selectedSevakId, setSelectedSevakId] = useState('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    fetchBookings();
    fetchSevaks();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const params: any = {};
      if (filter !== 'all') params.status = filter;

      const response = await adminAPI.getBookings(params);
      if (response.success) {
        setBookings(response.data.bookings);
      }
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSevaks = async () => {
    try {
      const response = await adminAPI.getSevaks({
        status: 'active',
        isVerified: 'true',
        limit: 100
      });
      if (response.success) {
        // Filter out blacklisted sevaks
        const availableSevaks = response.data.sevaks.filter(
          (sevak: Sevak) => !sevak.isBlacklisted && sevak.isActive && sevak.isVerified
        );
        setSevaks(availableSevaks);
      }
    } catch (err) {
      console.error('Failed to fetch sevaks:', err);
    }
  };

  const handleAssignClick = (booking: Booking) => {
    setSelectedBooking(booking);
    setSelectedSevakId('');
    setAssignmentNotes('');
    setShowAssignModal(true);
  };

  const handleAssignSevak = async () => {
    if (!selectedBooking || !selectedSevakId) return;

    try {
      setIsAssigning(true);
      const response = await adminAPI.assignSevak(selectedBooking._id, {
        sevakId: selectedSevakId,
        notes: assignmentNotes || undefined,
      });

      if (response.success) {
        // Show success message
        alert('Sevak assigned successfully!');

        // Close modal
        setShowAssignModal(false);
        setSelectedBooking(null);
        setSelectedSevakId('');
        setAssignmentNotes('');

        // Refresh bookings list
        fetchBookings();
      }
    } catch (err: any) {
      console.error('Failed to assign sevak:', err);
      alert(err.response?.data?.message || 'Failed to assign sevak');
    } finally {
      setIsAssigning(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      assigned: 'bg-purple-100 text-purple-800',
      'in-progress': 'bg-orange-100 text-orange-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const filteredBookings = bookings.filter((booking) =>
    booking.bookingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.resident.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    booking.service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const canAssignSevak = (booking: Booking) => {
    return !booking.sevak && booking.status === 'pending';
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Booking Management</h1>
        <p className="text-gray-600 mt-2">Monitor and manage all bookings</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'assigned', 'in-progress', 'completed', 'cancelled'].map((f) => (
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
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Booking ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Sevak
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Schedule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{booking.bookingNumber}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <User className="h-8 w-8 rounded-full bg-gray-200 p-1 text-gray-600" />
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">
                          {booking.resident?.fullName || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {booking.resident?.email || '-'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {booking.service?.name || 'Unknown Service'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {booking.sevak?.fullName || (
                        <span className="text-gray-400 italic">Not assigned</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center text-sm text-gray-900">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <div>
                        <div>{format(new Date(booking.scheduledDate), 'MMM dd, yyyy')}</div>
                        <div className="text-gray-500">{booking.scheduledTime}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      ₹{booking.totalAmount.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {canAssignSevak(booking) && (
                      <button
                        onClick={() => handleAssignClick(booking)}
                        className="inline-flex items-center px-3 py-1.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Assign
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredBookings.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No bookings found</p>
            </div>
          )}
        </div>
      )}

      {/* Assign Sevak Modal */}
      {showAssignModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Assign Sevak</h2>
                <p className="text-gray-600 mt-1">
                  Booking #{selectedBooking.bookingNumber}
                </p>
              </div>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Booking Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Booking Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600">Service</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedBooking.service?.name || 'Unknown Service'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Customer</p>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedBooking.resident?.fullName || 'Unknown'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Schedule</p>
                    <p className="text-sm font-medium text-gray-900">
                      {format(new Date(selectedBooking.scheduledDate), 'MMM dd, yyyy')} at {selectedBooking.scheduledTime}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600">Amount</p>
                    <p className="text-sm font-medium text-gray-900">₹{selectedBooking.totalAmount.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              {/* Select Sevak */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Sevak <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedSevakId}
                  onChange={(e) => setSelectedSevakId(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Choose a sevak...</option>
                  {sevaks.map((sevak) => (
                    <option key={sevak._id} value={sevak._id}>
                      {sevak.fullName} - {sevak.phoneNumber}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {sevaks.length} active and verified sevaks available
                </p>
              </div>

              {/* Notes (Optional) */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assignment Notes (Optional)
                </label>
                <textarea
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                  rows={3}
                  placeholder="Add any special instructions or notes..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => setShowAssignModal(false)}
                disabled={isAssigning}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignSevak}
                disabled={!selectedSevakId || isAssigning}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isAssigning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Assigning...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Assign Sevak
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
