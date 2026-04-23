import { create } from 'zustand';
import api from '../services/api.js';

const TOKEN_KEY = 'mu_token';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  token: localStorage.getItem(TOKEN_KEY) || null,

  // Called on app init — restores session from stored token
  checkAuth: async () => {
    const token = get().token;
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }
    set({ isLoading: true });
    try {
      const res = await api.get('/auth/me');
      set({ user: res.data.user, isAuthenticated: true, isLoading: false });
    } catch {
      // Only clear auth if the token hasn't been replaced by a concurrent login()
      if (get().token === token) {
        localStorage.removeItem(TOKEN_KEY);
        set({ user: null, isAuthenticated: false, isLoading: false, token: null });
      } else {
        set({ isLoading: false });
      }
    }
  },

  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user } = res.data;
    localStorage.setItem(TOKEN_KEY, token);
    // isLoading: false cancels any in-flight checkAuth that may still be running
    set({ user, isAuthenticated: true, token, isLoading: false });
    return user;
  },

  register: async (email, password, confirmPassword, role) => {
    const res = await api.post('/auth/register', { email, password, confirmPassword, role });
    const { token, user } = res.data;
    localStorage.setItem(TOKEN_KEY, token);
    set({ user, isAuthenticated: true, token, isLoading: false });
    return user;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      set({ user: null, isAuthenticated: false, token: null, isLoading: false });
    }
  },

  // Called by the 401 interceptor — clears local session without hitting the API.
  // ProtectedRoute re-renders automatically via Zustand subscription and redirects.
  clearSession: () => {
    localStorage.removeItem(TOKEN_KEY);
    set({ user: null, isAuthenticated: false, token: null, isLoading: false });
  },

  updateUser: (updates) => {
    set((state) => ({ user: { ...state.user, ...updates } }));
  },
}));
