import { create } from 'zustand';

interface AdminAuthState {
  logout: () => void;
}

export const useAdminAuthStore = create<AdminAuthState>((set) => ({
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
    }
  },
}));

