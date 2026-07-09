import { create } from "zustand";
import type { PublicUser } from "@/types";

type AuthState = {
  user: PublicUser | null;
  setUser: (user: PublicUser | null) => void;
  clear: () => void;
};

/**
 * Optional UI mirror after login/signup responses. The session JWT lives only in
 * the httpOnly cookie — never in localStorage.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clear: () => set({ user: null }),
}));
