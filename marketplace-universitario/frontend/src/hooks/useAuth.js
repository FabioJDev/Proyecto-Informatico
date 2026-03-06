import { useAuthStore } from '../store/authStore.js';

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const login = useAuthStore((s) => s.login);
  const logout = useAuthStore((s) => s.logout);
  const register = useAuthStore((s) => s.register);

  const isEmprendedor = user?.role === 'EMPRENDEDOR';
  const isComprador = user?.role === 'COMPRADOR';
  const isAdmin = user?.role === 'ADMIN';

  return {
    user,
    isAuthenticated,
    isLoading,
    isEmprendedor,
    isComprador,
    isAdmin,
    login,
    logout,
    register,
  };
}
