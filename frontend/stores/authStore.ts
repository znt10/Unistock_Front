import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: number;
  email: string;
  first_name: string;
  group: string;
  loja_id: number | null;
  loja_nome: string | null;
}

interface AuthState {
  user: User | null;
  hydrated: boolean;
  setUser: (user: User) => void;
  clearUser: () => void;
  setHydrated: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      hydrated: false,

      setUser: (user) => set({ user }),
      clearUser: () => set({ user: null }),

      setHydrated: (value) => set({ hydrated: value }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
      }),

      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);