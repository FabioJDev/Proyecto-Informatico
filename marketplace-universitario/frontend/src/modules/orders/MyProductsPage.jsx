import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api.js';
import Navbar from '../../components/layout/Navbar.jsx';
import Footer from '../../components/layout/Footer.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { formatCurrency } from '../../utils/formatters.js';

export default function MyProductsPage() {
  const { addToast }    = useToast();
  const [products,      setProducts]      = useState([]);
  const [isLoading,     setIsLoading]     = useState(true);
  const [deleteModal,   setDeleteModal]   = useState(null);
  const [deleting,      setDeleting]      = useState(false);

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
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full flex-1">
        <div className="flex items-center justify-between mb-8 animate-in">
          <h1 className="font-display text-3xl font-bold text-[var(--text-primary)]">
            Mis productos
          </h1>
          <Link to="/my-products/new">
            <Button size="md">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Nuevo producto
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl skeleton" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 animate-in">
            <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-[var(--accent-primary-dim)] border border-[var(--accent-primary)]/20 flex items-center justify-center">
              <svg className="w-10 h-10 text-[var(--accent-primary-soft)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </div>
            <h3 className="font-display font-bold text-[var(--text-primary)] text-lg mb-2">Sin productos</h3>
            <p className="text-[var(--text-muted)] text-sm mb-5">Aún no tienes productos publicados.</p>
            <Link to="/my-products/new">
              <Button>Publicar primer producto</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {products.map((product, i) => (
              <div
                key={product.id}
                className="
                  glass rounded-2xl border border-[var(--border-subtle)] p-4
                  flex items-center gap-4
                  hover:border-[var(--border-strong)] hover:-translate-y-0.5
                  transition-all duration-200
                  animate-in
                "
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                {/* Thumbnail */}
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-[var(--bg-elevated)] shrink-0 border border-[var(--border-subtle)]">
                  {product.images?.[0] ? (
                    <img src={product.images[0]} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-[var(--text-primary)] truncate">
                    {product.name}
                  </p>
                  <p className="text-sm font-mono font-semibold text-amber-400 mt-0.5">
                    {formatCurrency(product.price)}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Link to={`/my-products/${product.id}/edit`}>
                    <Button variant="secondary" size="sm">Editar</Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:bg-red-500/10"
                    onClick={() => setDeleteModal(product.id)}
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />

      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Eliminar producto"
        confirmLabel="Eliminar"
        confirmVariant="danger"
        onConfirm={handleDelete}
        isLoading={deleting}
      >
        <p>¿Seguro que deseas eliminar este producto? Esta acción no se puede deshacer.</p>
      </Modal>
    </div>
  );
}
