import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api.js';
import Navbar from '../../components/layout/Navbar.jsx';
import Footer from '../../components/layout/Footer.jsx';
import Button from '../../components/ui/Button.jsx';
import DeleteProductModal from '../../components/products/DeleteProductModal.jsx';
import ProductReviewsSection from '../products/ProductReviewsSection.jsx';
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
  const [deleteModal, setDeleteModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [ordering, setOrdering] = useState(false);
  const [orderSent, setOrderSent] = useState(false);

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
      setOrderSent(true);
      addToast('¡Pedido enviado! Revisa tu correo para confirmación.', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Error al crear el pedido.', 'error');
    } finally {
      setOrdering(false);
    }
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#F6F6F6]">
      <div className="w-8 h-8 border-2 border-transparent animate-spin-ring"
        style={{ borderTopColor: '#990100', borderRightColor: 'rgba(153,1,0,0.2)', borderRadius: '50%' }} />
    </div>
  );

  if (!product) return null;

  const images = product.images?.length ? product.images : ['https://placehold.co/600x500?text=Sin+imagen'];
  const sellerProfile = product.seller?.profile;

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F6F6]">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-3 animate-in">
            <div className="aspect-square bg-[#E8E8E8] rounded-2xl overflow-hidden border border-[#E8E8E8]">
              <img src={images[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {images.length > 1 && (
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <button key={i} onClick={() => setSelectedImage(i)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                      i === selectedImage ? 'border-[#990100]' : 'border-[#E8E8E8] hover:border-[#CCCCCC]'
                    }`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-5 animate-in delay-1">
            <div>
              {product.category && (
                <span className="text-xs font-mono font-semibold uppercase tracking-widest text-[#333333] bg-[#E8E8E8] px-3 py-1 rounded-full border border-[#CCCCCC]">
                  {product.category.name}
                </span>
              )}
              <h1 className="font-display text-3xl font-bold text-[#1A1A1A] mt-3">{product.name}</h1>
              <p className="font-mono text-3xl font-bold text-[#990100] mt-2">{formatCurrency(product.price)}</p>
            </div>

            <p className="text-[#666666] leading-relaxed">{product.description}</p>

            {sellerProfile && (
              <Link to={`/profile/${product.seller.id}`}
                className="flex items-center gap-3 p-4 bg-white rounded-xl border border-[#E8E8E8] hover:border-[#990100] hover:shadow-glow-primary transition-all duration-200">
                <div className="w-10 h-10 rounded-full bg-[rgba(153,1,0,0.08)] text-[#990100] flex items-center justify-center font-bold font-display">
                  {sellerProfile.businessName?.[0]}
                </div>
                <div>
                  <p className="font-semibold text-[#1A1A1A]">{sellerProfile.businessName}</p>
                  <p className="text-sm text-[#990100]">Ver perfil del emprendedor →</p>
                </div>
              </Link>
            )}

            {isAuthenticated && user?.id === product.seller?.id ? (
              <div className="flex gap-3">
                <Link to={`/my-products/${product.id}/edit`} className="flex-1">
                  <Button variant="secondary" className="w-full" size="lg">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                    </svg>
                    Editar publicación
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="lg"
                  className="text-[#990100] border-[1.5px] border-[#990100] hover:bg-[rgba(153,1,0,0.06)]"
                  onClick={() => setDeleteModal(true)}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                  Eliminar
                </Button>
              </div>
            ) : isComprador && product.seller?.id !== user?.id ? (
              orderSent ? (
                <div className="p-4 bg-[rgba(153,1,0,0.06)] border border-[rgba(153,1,0,0.2)] rounded-xl flex items-center gap-3">
                  <svg className="w-5 h-5 text-[#990100] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="font-semibold text-[#1A1A1A] text-sm">¡Pedido enviado!</p>
                    <p className="text-xs text-[#666666]">Revisa tu correo para ver la confirmación.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 p-4 bg-white border border-[#E8E8E8] rounded-xl">
                  {/* Quantity stepper */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#1A1A1A]">Cantidad</span>
                    <div className="flex items-center gap-0 border border-[#E8E8E8] rounded-lg overflow-hidden">
                      <button
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-9 h-9 flex items-center justify-center text-[#666666] hover:bg-[#F6F6F6] transition-colors text-lg font-medium disabled:opacity-40"
                        disabled={quantity <= 1}
                      >−</button>
                      <span className="w-10 text-center font-mono text-sm font-semibold text-[#1A1A1A]">{quantity}</span>
                      <button
                        onClick={() => setQuantity((q) => Math.min(100, q + 1))}
                        className="w-9 h-9 flex items-center justify-center text-[#666666] hover:bg-[#F6F6F6] transition-colors text-lg font-medium disabled:opacity-40"
                        disabled={quantity >= 100}
                      >+</button>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex items-center justify-between py-1 border-t border-[#F0F0F0]">
                    <span className="text-sm text-[#666666]">Total estimado</span>
                    <span className="font-mono font-bold text-[#990100]">{formatCurrency(product.price * quantity)}</span>
                  </div>

                  {/* Collapsible message */}
                  <div>
                    {!showMessage ? (
                      <button
                        onClick={() => setShowMessage(true)}
                        className="text-sm text-[#999999] hover:text-[#990100] transition-colors flex items-center gap-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Agregar mensaje →
                      </button>
                    ) : (
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={3}
                        maxLength={500}
                        placeholder="Instrucciones especiales, consultas…"
                        autoFocus
                        className="w-full px-3 py-2 border-[1.5px] border-[#E8E8E8] rounded-lg text-sm focus:ring-[3px] focus:ring-[rgba(153,1,0,0.10)] focus:border-[#990100] focus:outline-none resize-none text-[#1A1A1A] bg-[#FAFAFA] transition-all placeholder:text-[#BBBBBB]"
                      />
                    )}
                  </div>

                  <Button className="w-full" size="lg" onClick={handleOrder} disabled={ordering}>
                    {ordering ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                        Enviando…
                      </span>
                    ) : 'Solicitar pedido'}
                  </Button>
                </div>
              )
            ) : !isAuthenticated ? (
              <Button className="w-full" size="lg" onClick={() => navigate('/login')}>
                Inicia sesión para pedir
              </Button>
            ) : null}

            <p className="text-xs text-[#999999] font-mono">Publicado el {formatDate(product.createdAt)}</p>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-12 max-w-4xl">
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-6">Reseñas del producto</h2>
          <ProductReviewsSection productId={id} />
        </div>
      </main>

      <DeleteProductModal
        product={product}
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onDeleted={() => {
          setDeleteModal(false);
          navigate('/my-products');
        }}
      />

      <Footer />
    </div>
  );
}
