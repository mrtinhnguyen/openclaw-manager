import { create } from "zustand";

export type AuthState = {
  authHeader: string | null;
  authenticated: boolean;
  sessionChecked: boolean;
  setAuthHeader: (value: string | null) => void;
  setAuthenticated: (value: boolean) => void;
  setSessionChecked: (value: boolean) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  authHeader: null,
  authenticated: false,
  sessionChecked: false,
  setAuthHeader: (value) => set({ authHeader: value }),
  setAuthenticated: (value) => set({ authenticated: value }),
  setSessionChecked: (value) => set({ sessionChecked: value }),
  clearAuth: () =>
    set({
      authHeader: null,
      authenticated: false,
      sessionChecked: true
    })
}));
