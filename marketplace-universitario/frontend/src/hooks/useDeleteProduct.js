import { useState } from 'react';
import api from '../services/api.js';
import { useToast } from '../components/ui/Toast.jsx';

export function useDeleteProduct() {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);
  const { addToast } = useToast();

  const deleteProduct = async (productId) => {
    setIsDeleting(true);
    setError(null);
    try {
      await api.delete(`/products/${productId}`);
      addToast('Publicación eliminada exitosamente', 'success');
      return { success: true };
    } catch (err) {
      const errorData = err.response?.data;
      setError(errorData);
      return { success: false, error: errorData };
    } finally {
      setIsDeleting(false);
    }
  };

  const resetError = () => setError(null);

  return { deleteProduct, isDeleting, error, resetError };
}
