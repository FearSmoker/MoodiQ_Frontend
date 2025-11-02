import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
import api from '../lib/api';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      loading: false,
      
      setToken: (token) => {
        try {
          const decoded = jwtDecode(token);
          set({ token, user: { id: decoded.id } });
          get().fetchUser();
        } catch (e) {
          console.error("Invalid token", e);
          get().logout();
        }
      },
      
      fetchUser: async () => {
        try {
          set({ loading: true });
          const { data } = await api.get('/auth/me');
          set((state) => ({ 
            user: { ...state.user, ...data },
            loading: false,
          }));
        } catch (e) {
          console.error("Failed to fetch user", e);
          set({ loading: false });
          if (e.response?.status === 401) {
            get().logout();
          }
        }
      },

      logout: () => {
        set({ token: null, user: null });
        // Redirect to login
        window.location.href = '/login';
      },

      // Check if service is linked
      isServiceLinked: (service) => {
        const user = get().user;
        return user?.linkedServices?.includes(service) || false;
      },

      // Update user data
      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData }
        }));
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token,
        user: state.user 
      }),
    }
  )
);