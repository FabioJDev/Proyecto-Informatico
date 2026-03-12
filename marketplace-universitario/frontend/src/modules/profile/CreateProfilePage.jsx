import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import { useAuthStore } from '../../store/authStore.js';
import Navbar from '../../components/layout/Navbar.jsx';
import ProfileForm from '../../components/profile/ProfileForm.jsx';
import { useToast } from '../../components/ui/Toast.jsx';

export default function CreateProfilePage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);
  const [isFetching, setIsFetching] = useState(true);

  // If profile already exists, redirect to edit
  useEffect(() => {
    api.get('/auth/me')
      .then((res) => {
        if (res.data.user?.profile) {
          addToast('Ya tienes un perfil creado. Puedes editarlo aquí.', 'info');
          navigate('/profile/edit', { replace: true });
        }
      })
      .catch(() => {})
      .finally(() => setIsFetching(false));
  }, []);

  const handleSubmit = async (payload) => {
    const res = await api.put('/users/profile', payload);
    updateUser({ profile: res.data.profile });
    addToast('¡Perfil creado exitosamente! Tu emprendimiento ya es visible en el catálogo.', 'success');
    navigate(`/profile/${user.id}`);
  };

  if (isFetching) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F6F6F6]">
        <div
          className="w-8 h-8 rounded-full border-[3px] border-[#E8E8E8]"
          style={{ borderTopColor: '#990100', animation: 'spin 0.8s linear infinite' }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F6F6]">
      <Navbar />
      <main className="flex-1">
        <ProfileForm
          isEditing={false}
          pageTitle="Crea tu perfil de emprendimiento"
          pageSubtitle="Tu perfil es lo primero que ven tus compradores. Hazlo memorable."
          pageBadge="Paso 1 de 1 · US-05"
          onSubmit={handleSubmit}
          onCancel={() => navigate('/dashboard')}
        />
      </main>
    </div>
  );
}
