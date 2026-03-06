import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router/index.jsx';
import { useAuthStore } from './store/authStore.js';

export default function App() {
  const checkAuth = useAuthStore((s) => s.checkAuth);

  // Restore session from httpOnly cookie on app mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return <RouterProvider router={router} />;
}
