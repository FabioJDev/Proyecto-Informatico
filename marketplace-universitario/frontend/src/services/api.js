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
      // Pages where the user is intentionally unauthenticated — never redirect away.
      // checkAuth() fires on every app load and will 401 on these pages by design.
      const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/reset-password'];
      const onPublicPage = PUBLIC_PATHS.some((p) => window.location.pathname.startsWith(p));

      // Never redirect on /auth/me — it's the session probe used by checkAuth()
      // and can race with a just-completed login (the request was sent before the
      // cookie existed, so it legitimately 401s even when the user IS logged in).
      const isAuthProbe = error.config?.url?.includes('/auth/me');

      if (!onPublicPage && !isAuthProbe) {
        // Session expired on a protected page → clear state and go to login
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
