import { create } from 'zustand';
import api from '../services/api.js';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  // Called on app init — restores session from httpOnly cookie
  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/auth/me');
      set({ user: res.data.user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    set({ user: res.data.user, isAuthenticated: true });
    return res.data.user;
  },

  register: async (email, password, confirmPassword, role) => {
    const res = await api.post('/auth/register', { email, password, confirmPassword, role });
    set({ user: res.data.user, isAuthenticated: true });
    return res.data.user;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      set({ user: null, isAuthenticated: false });
    }
  },

  updateUser: (updates) => {
    set((state) => ({ user: { ...state.user, ...updates } }));
  },
}));
