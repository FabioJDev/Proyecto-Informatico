import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api.js';
import Navbar from '../../components/layout/Navbar.jsx';
import Footer from '../../components/layout/Footer.jsx';
import Button from '../../components/ui/Button.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isComprador } = useAuth();
  const { addToast } = useToast();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [orderModal, setOrderModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    api.get(`/products/${id}`)
      .then((res) => setProduct(res.data.data))
      .catch(() => navigate('/products'))
      .finally(() => setIsLoading(false));
  }, [id, navigate]);

  const handleOrder = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setOrdering(true);
    try {
      await api.post('/orders', { productId: id, quantity, message });
      setOrderModal(false);
      addToast('¡Pedido enviado! El vendedor recibirá una notificación.', 'success');
    } catch (err) {
      addToast(err.userMessage || 'Error al crear el pedido.', 'error');
    } finally {
      setOrdering(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!product) return null;

  const images = product.images?.length ? product.images : ['https://placehold.co/600x500?text=Sin+imagen'];
  const sellerProfile = product.seller?.profile;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-3">
            <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden">
              <img src={images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${i === selectedImage ? 'border-primary-500' : 'border-gray-200'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-5">
            <div>
              {product.category && (
                <span className="text-sm font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-full">{product.category.name}</span>
              )}
              <h1 className="text-3xl font-bold text-gray-900 mt-3">{product.name}</h1>
              <p className="text-3xl font-bold text-primary-700 mt-2">{formatCurrency(product.price)}</p>
            </div>

            <p className="text-gray-600 leading-relaxed">{product.description}</p>

            {sellerProfile && (
              <Link to={`/profile/${product.seller.id}`} className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
                  {sellerProfile.businessName?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{sellerProfile.businessName}</p>
                  <p className="text-sm text-gray-500">Ver perfil del emprendedor →</p>
                </div>
              </Link>
            )}

            {isComprador && product.seller?.id !== user?.id && (
              <Button className="w-full" size="lg" onClick={() => setOrderModal(true)}>
                Solicitar pedido
              </Button>
            )}
            {!isAuthenticated && (
              <Button className="w-full" size="lg" onClick={() => navigate('/login')}>
                Inicia sesión para pedir
              </Button>
            )}

            <p className="text-xs text-gray-400">Publicado el {formatDate(product.createdAt)}</p>
          </div>
        </div>
      </main>

      <Modal isOpen={orderModal} onClose={() => setOrderModal(false)} title="Confirmar pedido"
        confirmLabel="Enviar pedido" onConfirm={handleOrder} isLoading={ordering}>
        <div className="space-y-4">
          <p className="text-gray-600">Estás a punto de solicitar: <strong>{product.name}</strong></p>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Cantidad</label>
            <input type="number" min="1" max="100" value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Mensaje (opcional)</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} maxLength={500}
              placeholder="Instrucciones especiales, consultas…"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none" />
          </div>
          <p className="font-semibold text-primary-700">Total: {formatCurrency(product.price * quantity)}</p>
        </div>
      </Modal>

      <Footer />
    </div>
  );
}
