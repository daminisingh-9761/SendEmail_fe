import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthState } from "@/types";

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setSession: (user, token) => {
        localStorage.setItem("mailjob_token", token);
        set({ user, token });
      },
      logout: () => {
        localStorage.removeItem("mailjob_token");
        set({ user: null, token: null });
      },
    }),
    { name: "mailjob-auth" }
  )
);
