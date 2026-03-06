import { useState, useEffect, useCallback } from 'react';
import api from '../services/api.js';

export function useProducts(initialFilters = {}) {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 0 });
  const [filters, setFilters] = useState(initialFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = useCallback(async (params = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const query = { ...filters, ...params };
      const res = await api.get('/products', { params: query });
      setProducts(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.userMessage || 'Error al cargar productos.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get('/products/categories');
      setCategories(res.data.data);
    } catch {
      // Categories are non-critical
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const setPage = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  return { products, categories, pagination, filters, isLoading, error, updateFilters, setPage, refetch: fetchProducts };
}
