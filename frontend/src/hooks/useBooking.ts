import { useState, useCallback } from 'react';
import { bookingApi } from '../services/api';
import { Booking } from '../types';

export const useBooking = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async (params?: { status?: string; page?: number; limit?: number }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingApi.getMyBookings(params);
      if (response.success) {
        setBookings(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  }, []);

  const createBooking = useCallback(async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingApi.createBooking(data);
      if (response.success) {
        return response.data?.booking;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create booking');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelBooking = useCallback(async (bookingId: string, reason: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingApi.cancelBooking(bookingId, reason);
      if (response.success) {
        // Refresh bookings
        await fetchBookings();
        return response.data;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel booking');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchBookings]);

  const rescheduleBooking = useCallback(async (bookingId: string, newDate: string, newTime: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await bookingApi.rescheduleBooking(bookingId, newDate, newTime);
      if (response.success) {
        // Refresh bookings
        await fetchBookings();
        return response.data?.booking;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to reschedule booking');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchBookings]);

  return {
    bookings,
    loading,
    error,
    fetchBookings,
    createBooking,
    cancelBooking,
    rescheduleBooking,
  };
};
