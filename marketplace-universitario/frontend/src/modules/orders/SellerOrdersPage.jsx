import { useState } from 'react';
import Navbar from '../../components/layout/Navbar.jsx';
import OrderCard from '../../components/ui/OrderCard.jsx';
import Pagination from '../../components/ui/Pagination.jsx';
import Modal from '../../components/ui/Modal.jsx';
import { useToast } from '../../components/ui/Toast.jsx';
import { useOrders } from '../../hooks/useOrders.js';

const STATUS_TABS = [
  { key: '', label: 'Todos' },
  { key: 'PENDING', label: 'Pendientes' },
  { key: 'ACCEPTED', label: 'Aceptados' },
  { key: 'DELIVERED', label: 'Entregados' },
];

export default function SellerOrdersPage() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('');
  const [confirmModal, setConfirmModal] = useState(null); // { id, action }
  const [processing, setProcessing] = useState(false);

  const { orders, pagination, isLoading, error, acceptOrder, rejectOrder, deliverOrder, refetch } = useOrders(
    activeTab ? { status: activeTab } : {}
  );

  const handleAction = async () => {
    const { id, action } = confirmModal;
    setProcessing(true);
    try {
      if (action === 'accept') await acceptOrder(id);
      else if (action === 'reject') await rejectOrder(id);
      else if (action === 'deliver') await deliverOrder(id);
      addToast('Acción realizada correctamente.', 'success');
      setConfirmModal(null);
    } catch (err) {
      addToast(err.userMessage || 'Error al procesar.', 'error');
    } finally {
      setProcessing(false);
    }
  };

  const actionLabels = { accept: 'Aceptar pedido', reject: 'Rechazar pedido', deliver: 'Marcar como entregado' };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Pedidos recibidos</h1>

        {/* Status tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
          {STATUS_TABS.map((tab) => (
            <button key={tab.key} onClick={() => { setActiveTab(tab.key); refetch({ status: tab.key || undefined }); }}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${activeTab === tab.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {tab.label}
            </button>
          ))}
        </div>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        {isLoading ? (
          <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />)}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <span className="text-5xl">📦</span>
            <p className="mt-3">No hay pedidos en esta categoría.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} role="EMPRENDEDOR"
                onAccept={(id) => setConfirmModal({ id, action: 'accept' })}
                onReject={(id) => setConfirmModal({ id, action: 'reject' })}
                onDeliver={(id) => setConfirmModal({ id, action: 'deliver' })} />
            ))}
          </div>
        )}

        <Pagination pagination={pagination} onPageChange={(p) => refetch({ page: p })} />
      </main>

      <Modal isOpen={!!confirmModal} onClose={() => setConfirmModal(null)}
        title={confirmModal ? actionLabels[confirmModal.action] : ''}
        confirmLabel="Confirmar" onConfirm={handleAction} isLoading={processing}
        confirmVariant={confirmModal?.action === 'reject' ? 'danger' : 'primary'}>
        <p className="text-gray-600">¿Confirmas esta acción? El comprador será notificado por correo.</p>
      </Modal>
    </div>
  );
}
