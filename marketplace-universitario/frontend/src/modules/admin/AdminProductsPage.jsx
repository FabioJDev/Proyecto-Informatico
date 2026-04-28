import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import Navbar from '../../components/layout/Navbar.jsx';
import Footer from '../../components/layout/Footer.jsx';
import Button from '../../components/ui/Button.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Modal from '../../components/ui/Modal.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

const inputClass = `
  px-4 py-2.5 rounded-xl text-sm
  bg-white text-[#1A1A1A]
  border-[1.5px] border-[#E8E8E8]
  placeholder:text-[#999999]
  hover:border-[#CCCCCC]
  focus:outline-none focus:border-[#990100] focus:ring-[3px] focus:ring-[rgba(153,1,0,0.10)]
  transition-all duration-200
`;

export default function AdminProductsPage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [statusModal, setStatusModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

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
    setIsUpdating(true);
    try {
      await api.delete(`/products/${deleteModal.id}`);
      addToast('Producto eliminado correctamente.', 'success');
      setDeleteModal(null);
      setProducts((prev) => prev.filter((p) => p.id !== deleteModal.id));
    } catch (err) {
      addToast(err.userMessage || 'Error al eliminar el producto.', 'error');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = async () => {
    if (!statusModal) return;
    setIsUpdating(true);
    try {
      const newStatus = statusModal.action === 'deactivate' ? 'INACTIVE' : 'ACTIVE';
      await api.patch(`/products/${statusModal.product.id}/status`, { status: newStatus });
      addToast(`Producto ${newStatus === 'INACTIVE' ? 'desactivado' : 'activado'} correctamente.`, 'success');
      setStatusModal(null);
      setProducts((prev) => prev.map((p) => (p.id === statusModal.product.id ? { ...p, status: newStatus } : p)));
    } catch (err) {
      addToast(err.userMessage || 'Error al actualizar estado.', 'error');
    } finally {
      setIsUpdating(false);
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
  <div className="min-h-screen flex flex-col bg-[#F6F6F6]">
    <Navbar />

    <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate('/admin')}
            variant="ghost"
            size="md"
            className="text-[#666666] hover:text-[#990100]"
          >
            ← Volver
          </Button>

          <h1 className="font-display text-3xl font-bold text-[#1A1A1A]">
            Moderación de productos
          </h1>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#E8E8E8] p-4 mb-6 flex flex-wrap gap-3">
        <input
          type="text"
          placeholder="Buscar por nombre…"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchProducts(1)}
          className={`${inputClass} flex-1 min-w-[200px]`}
        />

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className={inputClass}
        >
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className={inputClass}
        >
          <option value="">Todos los estados</option>
          <option value="ACTIVE">Activo</option>
          <option value="INACTIVE">Inactivo</option>
        </select>

        <Button onClick={() => fetchProducts(1)} size="sm">
          Buscar
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden">
        {isLoading ? (
          <div className="space-y-2 p-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl skeleton" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-[#999999]">
            <p>No se encontraron productos.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#F6F6F6] border-b border-[#E8E8E8]">
              <tr className="text-left">
                <th className="px-4 py-3 text-xs text-[#999999] uppercase">Producto</th>
                <th className="px-4 py-3 text-xs text-[#999999] hidden md:table-cell">Vendedor</th>
                <th className="px-4 py-3 text-xs text-[#999999] hidden sm:table-cell">Precio</th>
                <th className="px-4 py-3 text-xs text-[#999999]">Estado</th>
                <th className="px-4 py-3 text-xs text-[#999999] hidden lg:table-cell">Publicado</th>
                <th className="px-4 py-3 text-xs text-[#999999] text-right">Acción</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#E8E8E8]">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-[#F6F6F6] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#E8E8E8]" />
                      <div>
                        <p className="font-semibold">{product.name}</p>
                        <p className="text-xs text-[#999999]">
                          {product.category?.name}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3 hidden md:table-cell">
                    {product.seller?.email || '—'}
                  </td>

                  <td className="px-4 py-3 hidden sm:table-cell">
                    {formatCurrency(product.price)}
                  </td>

                  <td className="px-4 py-3">
                    <Badge variant={statusVariant(product.status)}>
                      {statusLabel(product.status)}
                    </Badge>
                  </td>

                  <td className="px-4 py-3 hidden lg:table-cell">
                    {formatDate(product.createdAt)}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setStatusModal({
                            product,
                            action:
                              product.status === 'ACTIVE'
                                ? 'deactivate'
                                : 'reactivate',
                          })
                        }
                      >
                        {product.status === 'ACTIVE'
                          ? 'Desactivar'
                          : 'Reactivar'}
                      </Button>

                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-[#990100]"
                        onClick={() => setDeleteModal(product)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center">
        <Pagination pagination={pagination} onPageChange={fetchProducts} />
      </div>
    </main>

    <Footer />

    {/* Modals */}
    <Modal
      isOpen={!!statusModal}
      onClose={() => setStatusModal(null)}
      title={
        statusModal?.action === 'deactivate'
          ? 'Desactivar producto'
          : 'Reactivar producto'
      }
      confirmLabel={
        statusModal?.action === 'deactivate'
          ? 'Desactivar'
          : 'Reactivar'
      }
      confirmVariant={
        statusModal?.action === 'deactivate' ? 'danger' : 'primary'
      }
      onConfirm={handleStatusChange}
      isLoading={isUpdating}
    >
      <p>
        {statusModal?.action === 'deactivate'
          ? `¿Deseas desactivar ${statusModal?.product?.name}?`
          : `¿Deseas reactivar ${statusModal?.product?.name}?`}
      </p>
    </Modal>

    <Modal
      isOpen={!!deleteModal}
      onClose={() => setDeleteModal(null)}
      title="Eliminar producto"
      confirmLabel="Eliminar"
      confirmVariant="danger"
      onConfirm={handleDelete}
      isLoading={isUpdating}
    >
      <p>
        ¿Seguro que deseas eliminar{' '}
        <strong>{deleteModal?.name}</strong>?
      </p>
    </Modal>
  </div>
);
}