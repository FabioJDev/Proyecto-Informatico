import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api.js';
import { useAuthStore } from '../../store/authStore.js';
import Navbar from '../../components/layout/Navbar.jsx';
import ProfileForm from '../../components/profile/ProfileForm.jsx';
import { useToast } from '../../components/ui/Toast.jsx';

export default function EditProfilePage() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [initialValues, setInitialValues] = useState(null);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    api.get('/users/profile/me')
      .then((res) => {
        const p = res.data.profile;
        setInitialValues({
          businessName: p.businessName || '',
          description: p.description || '',
          contactInfo: p.contactInfo || '',
          photoUrl: p.photoUrl || null,
        });
      })
      .catch((err) => {
        if (err.response?.status === 404) {
          // No profile yet — redirect to create
          navigate('/profile/create', { replace: true });
        } else if (err.response?.status === 403) {
          // CA-04: not an emprendedor
          addToast('No tienes permiso para editar este perfil.', 'error');
          navigate('/dashboard', { replace: true });
        } else {
          addToast('Error al cargar el perfil.', 'error');
          navigate('/dashboard', { replace: true });
        }
      })
      .finally(() => setIsFetching(false));
  }, []);

  const handleSubmit = async (payload) => {
    try {
      const res = await api.put('/users/profile', payload);
      updateUser({ profile: res.data.profile });
      addToast('Perfil actualizado correctamente.', 'success');
      navigate(`/profile/${user.id}`);
    } catch (err) {
      if (err.response?.status === 403) {
        addToast('No tienes permiso para editar este perfil.', 'error');
        navigate('/dashboard', { replace: true });
        return;
      }
      const validationErrors = err.validationErrors;
      if (validationErrors?.length) {
        addToast(validationErrors[0].msg, 'error');
      } else {
        addToast(err.userMessage || 'Error al guardar. Inténtalo de nuevo.', 'error');
      }
      // Re-throw so ProfileForm can release its loading state
      throw err;
    }
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

  if (!initialValues) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F6F6]">
      <Navbar />
      <main className="flex-1">
        <ProfileForm
          isEditing={true}
          initialValues={initialValues}
          pageTitle="Editar tu perfil"
          pageSubtitle="Los cambios se reflejan inmediatamente en el catálogo."
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/profile/${user.id}`)}
        />
      </main>
    </div>
  );
}
