import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserType {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  role: "admin" | "customer";
  is_active: boolean;
}

interface AuthStore {
  user: UserType | null;
  token: string | null;
  setAuth: (user: UserType, token: string) => void;
  logout: () => void;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      setAuth: (user, token) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("khan_token", token);
        }
        set({ user, token });
      },
      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("khan_token");
        }
        set({ user: null, token: null });
      },
      isAdmin: () => {
        const u = get().user;
        return u?.role === "admin";
      },
    }),
    {
      name: "khan_auth_storage",
    }
  )
);
