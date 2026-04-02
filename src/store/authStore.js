import { create } from 'zustand';
import { storage } from '../utils/localStorage';

export const useAuthStore = create((set) => ({
  user: storage.getUser(),
  token: storage.getAccessToken(),
  isAuthenticated: !!storage.getAccessToken(),
  loading: false,
  error: null,

  setUser: (user) => {
    storage.setUser(user);
    set({ user });
  },

  setToken: (token) => {
    storage.setAccessToken(token);
    set({ token, isAuthenticated: true });
  },

  setRefreshToken: (token) => {
    storage.setRefreshToken(token);
  },

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),

  clearError: () => set({ error: null }),

  logout: () => {
    storage.removeAccessToken();
    storage.removeRefreshToken();
    storage.removeUser();
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      error: null,
    });
  },

  login: (user, token, refreshToken) => {
    storage.setUser(user);
    storage.setAccessToken(token);
    storage.setRefreshToken(refreshToken);
    set({
      user,
      token,
      isAuthenticated: true,
      error: null,
    });
  },
}));