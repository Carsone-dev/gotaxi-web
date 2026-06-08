import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { apiClient } from "@/lib/api";
import type { AdminUser } from "@/types/domain";

interface AuthState {
  user: AdminUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (telephone: string, password: string) => Promise<void>;
  logout: () => void;
  refresh: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      login: async (telephone, password) => {
        const { data } = await apiClient.post<{ access_token: string; refresh_token: string }>(
          "/auth/login",
          { telephone, password },
        );
        const { data: user } = await apiClient.get<AdminUser>("/users/me", {
          headers: { Authorization: `Bearer ${data.access_token}` },
        });
        if (!["ADMIN", "SUPER_ADMIN"].includes(user.role)) {
          throw new Error("Accès refusé : compte non administrateur");
        }
        localStorage.setItem("gotaxi_refresh_token", data.refresh_token);
        set({ user, accessToken: data.access_token, isAuthenticated: true });
      },

      logout: () => {
        const token = get().accessToken;
        if (token) apiClient.post("/auth/logout").catch(() => {});
        localStorage.removeItem("gotaxi_refresh_token");
        set({ user: null, accessToken: null, isAuthenticated: false });
        window.location.href = "/login";
      },

      refresh: async () => {
        const refreshToken = localStorage.getItem("gotaxi_refresh_token");
        if (!refreshToken) throw new Error("No refresh token");
        const { data } = await apiClient.post<{ access_token: string; refresh_token: string }>(
          "/auth/refresh",
          { refresh_token: refreshToken },
        );
        localStorage.setItem("gotaxi_refresh_token", data.refresh_token);
        set({ accessToken: data.access_token });
      },
    }),
    {
      name: "gotaxi-admin-auth",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        user: s.user,
        accessToken: s.accessToken,
        isAuthenticated: s.isAuthenticated,
      }),
    },
  ),
);
