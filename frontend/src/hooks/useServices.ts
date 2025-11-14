import { useState, useCallback } from 'react';
import { serviceApi } from '../services/api/service.api';
import { Service, Category } from '../types';

export const useServices = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchServices = useCallback(async (params?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    rating?: number;
    page?: number;
    limit?: number;
  }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await serviceApi.getServices(params);
      if (response.success) {
        setServices(response.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await serviceApi.getCategories();
      if (response.success && response.data) {
        setCategories(response.data.categories);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, []);

  const getServiceById = useCallback(async (serviceId: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await serviceApi.getServiceById(serviceId);
      if (response.success && response.data) {
        return response.data.service;
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch service');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const addToFavorites = useCallback(async (serviceId: string) => {
    try {
      setError(null);
      const response = await serviceApi.addToFavorites(serviceId);
      return response.success;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add to favorites');
      throw err;
    }
  }, []);

  const removeFromFavorites = useCallback(async (serviceId: string) => {
    try {
      setError(null);
      const response = await serviceApi.removeFromFavorites(serviceId);
      return response.success;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove from favorites');
      throw err;
    }
  }, []);

  return {
    services,
    categories,
    loading,
    error,
    fetchServices,
    fetchCategories,
    getServiceById,
    addToFavorites,
    removeFromFavorites,
  };
};
