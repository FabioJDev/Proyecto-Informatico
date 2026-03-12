import { useState } from 'react';
import Navbar from '../../components/layout/Navbar.jsx';
import Footer from '../../components/layout/Footer.jsx';
import OrderCard from '../../components/ui/OrderCard.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { useOrders } from '../../hooks/useOrders.js';

const STATUS_TABS = [
  { key: '',          label: 'Todos' },
  { key: 'PENDING',   label: 'Pendientes' },
  { key: 'ACCEPTED',  label: 'Aceptados' },
  { key: 'DELIVERED', label: 'Entregados' },
];

function SkeletonOrder() {
  return (
    <div className="rounded-2xl border border-[#E8E8E8] bg-white p-5 space-y-3">
      <div className="flex justify-between">
        <div className="space-y-1.5 flex-1">
          <div className="h-3 w-20 rounded skeleton" />
          <div className="h-5 w-2/3 rounded skeleton" />
        </div>
        <div className="h-6 w-20 rounded-full skeleton" />
      </div>
      <div className="flex gap-6">
        <div className="h-3 w-24 rounded skeleton" />
        <div className="h-3 w-20 rounded skeleton" />
      </div>
    </div>
  );
}

export default function SellerOrdersPage() {
  const { addToast } = useToast();
  const [activeTab,    setActiveTab]    = useState('');
  const [confirmModal, setConfirmModal] = useState(null);
  const [processing,   setProcessing]   = useState(false);

  const { orders, pagination, isLoading, error, acceptOrder, rejectOrder, deliverOrder, refetch } =
    useOrders(activeTab ? { status: activeTab } : {});

  const handleAction = async () => {
    const { id, action } = confirmModal;
    setProcessing(true);
    try {
      if (action === 'accept')  await acceptOrder(id);
      else if (action === 'reject')  await rejectOrder(id);
      else if (action === 'deliver') await deliverOrder(id);
      addToast('Acción realizada correctamente.', 'success');
      setConfirmModal(null);
    } catch (err) {
      addToast(err.userMessage || 'Error al procesar.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const actionLabels = {
    accept:  'Aceptar pedido',
    reject:  'Rechazar pedido',
    deliver: 'Marcar como entregado',
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F6F6]">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 w-full flex-1">
        <h1 className="font-display text-3xl font-bold text-[#1A1A1A] mb-8 animate-in">
          Pedidos recibidos
        </h1>

        {/* Status tabs */}
        <div className="flex gap-1 bg-white border border-[#E8E8E8] rounded-xl p-1 mb-6 w-fit animate-in delay-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); refetch({ status: tab.key || undefined }); }}
              className={`
                px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200
                ${activeTab === tab.key
                  ? 'bg-[rgba(153,1,0,0.08)] text-[#990100] border-b-2 border-b-[#990100]'
                  : 'text-[#999999] hover:text-[#666666]'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-4 rounded-xl bg-[rgba(153,1,0,0.06)] border border-[rgba(153,1,0,0.20)] text-sm text-[#990100]">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => <SkeletonOrder key={i} />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24 animate-in">
            <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-[rgba(153,1,0,0.06)] border border-[rgba(153,1,0,0.20)] flex items-center justify-center">
              <svg className="w-10 h-10 text-[#990100]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
              </svg>
            </div>
            <h3 className="font-display font-bold text-[#1A1A1A] text-lg mb-2">Sin pedidos</h3>
            <p className="text-[#999999] text-sm">No hay pedidos en esta categoría.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <div key={order.id} className="animate-in" style={{ animationDelay: `${i * 0.05}s` }}>
                <OrderCard
                  order={order}
                  role="EMPRENDEDOR"
                  onAccept={(id)  => setConfirmModal({ id, action: 'accept' })}
                  onReject={(id)  => setConfirmModal({ id, action: 'reject' })}
                  onDeliver={(id) => setConfirmModal({ id, action: 'deliver' })}
                />
              </div>
            ))}
          </div>
        )}

        <Pagination pagination={pagination} onPageChange={(p) => refetch({ page: p })} />
      </main>

      <Footer />

      <Modal
        isOpen={!!confirmModal}
        onClose={() => setConfirmModal(null)}
        title={confirmModal ? actionLabels[confirmModal.action] : ''}
        confirmLabel="Confirmar"
        onConfirm={handleAction}
        isLoading={processing}
        confirmVariant={confirmModal?.action === 'reject' ? 'danger' : 'primary'}
      >
        <p>¿Confirmas esta acción? El comprador será notificado por correo.</p>
      </Modal>
    </div>
  );
}
