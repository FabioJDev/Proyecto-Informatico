import { useState, useEffect, useCallback } from 'react';
import api from '../services/api.js';

export function useOrders(params = {}) {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async (queryParams = {}) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get('/orders', { params: { ...params, ...queryParams } });
      setOrders(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) {
      setError(err.userMessage || 'Error al cargar pedidos.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const acceptOrder = async (id) => {
    const res = await api.patch(`/orders/${id}/accept`);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: 'ACCEPTED' } : o)));
    return res.data;
  };

  const rejectOrder = async (id) => {
    const res = await api.patch(`/orders/${id}/reject`);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: 'REJECTED' } : o)));
    return res.data;
  };

  const deliverOrder = async (id) => {
    const res = await api.patch(`/orders/${id}/deliver`);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: 'DELIVERED' } : o)));
    return res.data;
  };

  const cancelOrder = async (id) => {
    const res = await api.patch(`/orders/${id}/cancel`);
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: 'CANCELLED' } : o)));
    return res.data;
  };

  return { orders, pagination, isLoading, error, refetch: fetchOrders, acceptOrder, rejectOrder, deliverOrder, cancelOrder };
}
