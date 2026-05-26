import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface User {
  id: number;
  email: string;
  first_name: string;
  group: string;
  loja_id: string | null;
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
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);

export const GERENTE_GROUPS = ["Gerente", "Administrador", "Admin"] as const;
export const ADMIN_GROUPS = ["Admin", "Administrador"] as const;
export const RESPONSAVEL_GROUPS = ["Responsavel", "Responsável"] as const;

export const selectIsAdmin = (state: AuthState) =>
  state.user?.group
    ? ADMIN_GROUPS.includes(state.user.group as (typeof ADMIN_GROUPS)[number])
    : false;

export const selectIsGerente = (state: AuthState) =>
  state.user?.group
    ? GERENTE_GROUPS.includes(
        state.user.group as (typeof GERENTE_GROUPS)[number]
      )
    : false;

export const selectIsResponsavel = (state: AuthState) =>
  state.user?.group
    ? RESPONSAVEL_GROUPS.includes(
        state.user.group as (typeof RESPONSAVEL_GROUPS)[number]
      )
    : false;
