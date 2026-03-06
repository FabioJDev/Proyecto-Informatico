import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import Navbar from '../../components/layout/Navbar.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { formatCurrency } from '../../utils/formatters.js';

export default function MyProductsPage() {
  const { addToast } = useToast();
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMyProducts = () => {
    api.get('/products', { params: { limit: 50 } })
      .then((res) => setProducts(res.data.data))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { fetchMyProducts(); }, []);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/products/${deleteModal}`);
      addToast('Producto eliminado.', 'success');
      setProducts((prev) => prev.filter((p) => p.id !== deleteModal));
      setDeleteModal(null);
    } catch (err) {
      addToast(err.userMessage || 'Error al eliminar.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Mis productos</h1>
          <Link to="/my-products/new">
            <Button>+ Nuevo producto</Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-gray-200 rounded-xl animate-pulse" />)}</div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <span className="text-5xl">📦</span>
            <p className="mt-3">Aún no tienes productos publicados.</p>
            <Link to="/my-products/new" className="mt-4 inline-block text-primary-600 font-medium hover:text-primary-700 text-sm">Publicar primer producto →</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  {product.images?.[0] ? <img src={product.images[0]} alt="" className="w-full h-full object-cover" /> : <span className="flex items-center justify-center h-full text-2xl">📦</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                  <p className="text-sm text-primary-600 font-medium">{formatCurrency(product.price)}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link to={`/my-products/${product.id}/edit`}>
                    <Button variant="secondary" size="sm">Editar</Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteModal(product.id)} className="text-red-600 hover:bg-red-50">Eliminar</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Modal isOpen={!!deleteModal} onClose={() => setDeleteModal(null)} title="Eliminar producto"
        confirmLabel="Eliminar" confirmVariant="danger" onConfirm={handleDelete} isLoading={deleting}>
        <p className="text-gray-600">¿Seguro que deseas eliminar este producto? Esta acción no se puede deshacer.</p>
      </Modal>
    </div>
  );
}
