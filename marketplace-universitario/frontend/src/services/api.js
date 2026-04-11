import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api`,
  withCredentials: true, // Send httpOnly cookies automatically
  headers: { 'Content-Type': 'application/json' },
});

// ─────────────────────────────────────────────
// Request interceptor
// ─────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    // Attach Bearer token from localStorage for cross-domain auth
    const token = localStorage.getItem('mu_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    // For multipart/form-data, let the browser set the Content-Type
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─────────────────────────────────────────────
// Response interceptor — RNF-09 descriptive errors
// ─────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || 'Error de conexión. Intenta de nuevo.';

    if (status === 401) {
      const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/reset-password'];
      const onPublicPage = PUBLIC_PATHS.some((p) => window.location.pathname.startsWith(p));

      if (!onPublicPage) {
        // Token expired or invalid — clear stored token and redirect to login
        localStorage.removeItem('mu_token');
        import('../store/authStore.js').then(({ useAuthStore }) => {
          useAuthStore.getState().logout();
        });
        window.location.href = '/login';
      }
    }

    if (status === 403) {
      const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/reset-password'];
      const onPublicPage = PUBLIC_PATHS.some((p) => window.location.pathname.startsWith(p));
      if (!onPublicPage) {
        window.location.href = '/?error=access-denied';
      }
    }

    // Attach user-friendly message to the error
    error.userMessage = message;
    error.validationErrors = error.response?.data?.errors;

    return Promise.reject(error);
  }
);

export default api;
