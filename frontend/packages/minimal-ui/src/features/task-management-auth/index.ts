import { create } from 'zustand';

interface TaskAuthState {
  user: any | null;
  roles: string[];
  logout: () => void;
}

export const useTaskAuthStore = create<TaskAuthState>((set) => ({
  user: null,
  roles: [],
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
    }
    set({ user: null, roles: [] });
  },
}));

