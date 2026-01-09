import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      login: (userData, token) => set({ user: userData, token }),
      logout: () => set({ user: null, token: null }),
      setUser: (userData) => set({ user: userData }),
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
    }
  )
);

export default useAuthStore;
