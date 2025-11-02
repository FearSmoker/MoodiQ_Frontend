import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
import { getCurrentUser } from '../api/auth';

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
        } catch (e) {
          console.error("Invalid token", e);
          get().logout();
        }
      },
      
      fetchUser: async () => {
        try {
          set({ loading: true });
          const userData = await getCurrentUser();
          set((state) => ({ 
            user: { ...state.user, ...userData },
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
        window.location.href = '/';
      },

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