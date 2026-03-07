import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from 'shared-types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
}

const syncBrowserStorage = (user: User | null, accessToken: string | null, refreshToken: string | null) => {
  if (typeof window === 'undefined') {
    return;
  }

  if (accessToken) {
    localStorage.setItem('accessToken', accessToken);
  } else {
    localStorage.removeItem('accessToken');
  }

  if (refreshToken) {
    localStorage.setItem('refreshToken', refreshToken);
  } else {
    localStorage.removeItem('refreshToken');
  }

  if (user) {
    localStorage.setItem('user', JSON.stringify(user));
  } else {
    localStorage.removeItem('user');
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      login: (user, accessToken, refreshToken) => {
        syncBrowserStorage(user, accessToken, refreshToken);
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },
      logout: () => {
        syncBrowserStorage(null, null, null);
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },
      setUser: (user) => {
        syncBrowserStorage(user, useAuthStore.getState().accessToken, useAuthStore.getState().refreshToken);
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          syncBrowserStorage(state.user, state.accessToken, state.refreshToken);
        }
      },
    }
  )
);
