import { useState, useEffect, useCallback } from 'react';
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
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 w-full flex-1">
        <h1 className="font-display text-3xl font-bold text-[#1A1A1A] mb-8 animate-in">
          Moderación de productos
        </h1>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-[#E8E8E8] p-4 mb-5 flex flex-wrap gap-3 animate-in delay-1">
          <input
            type="text"
            placeholder="Buscar por nombre…"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchProducts(1)}
            className={`${inputClass} flex-1 min-w-48`}
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={inputClass}
          >
            <option value="">Todas las categorías</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
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
          <Button onClick={() => fetchProducts(1)} size="sm">Buscar</Button>
        </div>

        {/* Product list */}
        <div className="bg-white rounded-2xl border border-[#E8E8E8] overflow-hidden animate-in delay-2">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-16 rounded-xl skeleton" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 text-[#999999]">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-[rgba(153,1,0,0.06)] border border-[rgba(153,1,0,0.20)] flex items-center justify-center">
                <svg className="w-8 h-8 text-[#990100]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
                </svg>
              </div>
              <p className="text-sm">No se encontraron productos.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-[#F6F6F6] border-b border-[#E8E8E8]">
                <tr className="text-left">
                  <th className="px-4 py-3 font-mono text-xs text-[#999999] uppercase tracking-wider font-medium">Producto</th>
                  <th className="px-4 py-3 font-mono text-xs text-[#999999] uppercase tracking-wider font-medium hidden md:table-cell">Vendedor</th>
                  <th className="px-4 py-3 font-mono text-xs text-[#999999] uppercase tracking-wider font-medium hidden sm:table-cell">Precio</th>
                  <th className="px-4 py-3 font-mono text-xs text-[#999999] uppercase tracking-wider font-medium">Estado</th>
                  <th className="px-4 py-3 font-mono text-xs text-[#999999] uppercase tracking-wider font-medium hidden lg:table-cell">Publicado</th>
                  <th className="px-4 py-3 font-mono text-xs text-[#999999] uppercase tracking-wider font-medium text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8E8E8]">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-[#F6F6F6] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#E8E8E8] shrink-0">
                          {product.images?.[0] ? (
                            <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-5 h-5 text-[#999999]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#1A1A1A] truncate max-w-xs">{product.name}</p>
                          <p className="text-xs text-[#999999] truncate">{product.category?.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-[#666666] truncate max-w-[160px]">
                        {product.seller?.profile?.displayName || product.seller?.email || '—'}
                      </p>
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-[#990100] hidden sm:table-cell">
                      {formatCurrency(product.price)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant(product.status)}>{statusLabel(product.status)}</Badge>
                    </td>
                    <td className="px-4 py-3 text-[#999999] text-xs font-mono hidden lg:table-cell">
                      {formatDate(product.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {product.status === 'ACTIVE' ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-[#B45309] hover:bg-[#FEF3C7]"
                              onClick={() => setStatusModal({ product, action: 'deactivate' })}
                            >
                              Desactivar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-[#990100] hover:bg-[rgba(153,1,0,0.06)]"
                              onClick={() => setDeleteModal(product)}
                            >
                              Eliminar
                            </Button>
                          </>
                        ) : product.status === 'INACTIVE' ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-[#065F46] hover:bg-[#D1FAE5]"
                              onClick={() => setStatusModal({ product, action: 'reactivate' })}
                            >
                              Reactivar
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-[#990100] hover:bg-[rgba(153,1,0,0.06)]"
                              onClick={() => setDeleteModal(product)}
                            >
                              Eliminar
                            </Button>
                          </>
                        ) : null}
                      </div>
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

      <Footer />

      <Modal
        isOpen={!!statusModal}
        onClose={() => setStatusModal(null)}
        title={statusModal?.action === 'deactivate' ? 'Desactivar producto' : 'Reactivar producto'}
        confirmLabel={statusModal?.action === 'deactivate' ? 'Desactivar' : 'Reactivar'}
        confirmVariant={statusModal?.action === 'deactivate' ? 'danger' : 'primary'}
        onConfirm={handleStatusChange}
        isLoading={isUpdating}
      >
        <p>
          {statusModal?.action === 'deactivate'
            ? `¿Deseas desactivar ${statusModal?.product?.name}? El producto no aparecerá en el catálogo, pero podrá reactivarse después.`
            : `¿Deseas reactivar ${statusModal?.product?.name}? El producto volverá a aparecer en el catálogo.`
          }
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
          ¿Seguro que deseas eliminar <strong className="text-[#1A1A1A]">{deleteModal?.name}</strong>?
          Esta acción no se puede deshacer y eliminará el producto del catálogo.
        </p>
      </Modal>
    </div>
  );
}
