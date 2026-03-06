import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import Navbar from '../../components/layout/Navbar.jsx';
import Input from '../../components/ui/Input.jsx';
import Button from '../../components/ui/Button.jsx';
import { useToast } from '../../components/ui/Toast.jsx';

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [form, setForm] = useState({ businessName: '', description: '', contactInfo: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    api.get('/auth/me')
      .then((res) => {
        const profile = res.data.user?.profile;
        if (profile) {
          setForm({
            businessName: profile.businessName || '',
            description: profile.description || '',
            contactInfo: profile.contactInfo || '',
          });
        }
      })
      .finally(() => setIsFetching(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await api.put('/users/profile', form);
      addToast('Perfil actualizado correctamente.', 'success');
      navigate('/dashboard');
    } catch (err) {
      addToast(err.userMessage || 'Error al actualizar el perfil.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Editar perfil de emprendimiento</h1>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input label="Nombre del emprendimiento" value={form.businessName} onChange={(e) => setForm((p) => ({ ...p, businessName: e.target.value }))} placeholder="Ej: Delicias Uni" required />
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">Descripción</label>
              <textarea value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} rows={4} maxLength={500}
                placeholder="Cuéntanos sobre tu emprendimiento…"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none" />
            </div>
            <Input label="Información de contacto" value={form.contactInfo} onChange={(e) => setForm((p) => ({ ...p, contactInfo: e.target.value }))} placeholder="WhatsApp, Instagram, etc." />
            <Button type="submit" className="w-full" isLoading={isLoading}>Guardar cambios</Button>
          </form>
        </div>
      </main>
    </div>
  );
}
