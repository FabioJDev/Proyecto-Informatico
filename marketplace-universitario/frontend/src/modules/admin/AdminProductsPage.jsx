import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api.js';
import Navbar from '../../components/layout/Navbar.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

export default function AdminProductsPage() {
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deleteModal, setDeleteModal] = useState(null); // product object
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProducts = useCallback((page = 1) => {
    setIsLoading(true);
    const params = { page, limit: 20, all: true };
    if (keyword) params.keyword = keyword;
    if (categoryFilter) params.categoryId = categoryFilter;
    if (statusFilter) params.status = statusFilter;

    api.get('/products', { params })
      .then((res) => {
        setProducts(res.data.data);
        setPagination(res.data.pagination);
      })
      .catch(() => addToast('Error al cargar productos.', 'error'))
      .finally(() => setIsLoading(false));
  }, [keyword, categoryFilter, statusFilter]);

  useEffect(() => {
    api.get('/products/categories')
      .then((res) => setCategories(res.data.data))
      .catch(() => {});
  }, []);

  useEffect(() => { fetchProducts(1); }, [fetchProducts]);

  const handleDelete = async () => {
    if (!deleteModal) return;
    setIsDeleting(true);
    try {
      await api.delete(`/products/${deleteModal.id}`);
      addToast('Producto eliminado correctamente.', 'success');
      setDeleteModal(null);
      setProducts((prev) => prev.filter((p) => p.id !== deleteModal.id));
    } catch (err) {
      addToast(err.userMessage || 'Error al eliminar el producto.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const statusVariant = (status) => {
    if (status === 'ACTIVE') return 'success';
    if (status === 'INACTIVE') return 'warning';
    return 'default';
  };

  const statusLabel = (status) => {
    const map = { ACTIVE: 'Activo', INACTIVE: 'Inactivo' };
    return map[status] || status;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Moderación de productos</h1>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Buscar por nombre…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchProducts(1)}
            className="flex-1 min-w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
          >
            <option value="">Todas las categorías</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none"
          >
            <option value="">Todos los estados</option>
            <option value="ACTIVE">Activo</option>
            <option value="INACTIVE">Inactivo</option>
          </select>
          <Button onClick={() => fetchProducts(1)} size="sm">Buscar</Button>
        </div>

        {/* Product list */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse bg-gray-100 rounded-lg" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <span className="text-5xl">📦</span>
              <p className="mt-3">No se encontraron productos.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr className="text-left text-gray-500">
                  <th className="px-4 py-3 font-medium">Producto</th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Vendedor</th>
                  <th className="px-4 py-3 font-medium hidden sm:table-cell">Precio</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell">Publicado</th>
                  <th className="px-4 py-3 font-medium text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                          {product.images?.[0]
                            ? <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                            : <span className="flex items-center justify-center h-full text-lg">📦</span>}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 truncate max-w-xs">{product.name}</p>
                          <p className="text-xs text-gray-400 truncate">{product.category?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-gray-700 truncate max-w-[160px]">
                        {product.seller?.profile?.displayName || product.seller?.email || '—'}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800 hidden sm:table-cell">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant(product.status)}>{statusLabel(product.status)}</Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs hidden lg:table-cell">
                      {formatDate(product.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => setDeleteModal(product)}
                      >
                        Eliminar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="mt-4">
          <Pagination pagination={pagination} onPageChange={fetchProducts} />
        </div>
      </main>

      {/* Delete confirmation */}
      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Eliminar producto"
        confirmLabel="Eliminar"
        confirmVariant="danger"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      >
        <p className="text-gray-600">
          ¿Seguro que deseas eliminar <strong className="text-gray-800">{deleteModal?.name}</strong>?
          Esta acción no se puede deshacer y eliminará el producto del catálogo.
        </p>
      </Modal>
    </div>
  );
}
