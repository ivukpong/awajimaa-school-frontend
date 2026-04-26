import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";
import type { User } from "@/types";
import { login as apiLogin, logout as apiLogout } from "@/lib/auth";
import type { LoginPayload } from "@/lib/auth";
import { tokenStore } from "@/lib/tokenStore";

interface AuthStore {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    hasHydrated: boolean;

    login: (payload: LoginPayload) => Promise<User>;
    logout: () => Promise<void>;
    setUser: (user: User) => void;
    setAuth: (token: string, user: User) => void;
    clearAuth: () => void;
    setHasHydrated: (hasHydrated: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            hasHydrated: false,

            login: async (payload) => {
                set({ isLoading: true });
                try {
                    const { user, token } = await apiLogin(payload);
                    Cookies.set("auth_token", token, {
                        expires: 7,
                        sameSite: "strict",
                        secure: process.env.NODE_ENV === "production",
                    });
                    set({ user, token, isAuthenticated: true, isLoading: false, hasHydrated: true });
                    return user;
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            setUser: (user) => set({ user, hasHydrated: true }),

            setAuth: (token, user) => {
                tokenStore.set(token); // ← sync, no circular dep
                set({ token, user, isAuthenticated: true, hasHydrated: true });
            },

            clearAuth: () => {
                console.trace("clearAuth called");
                tokenStore.set(null);
                Cookies.remove("auth_token");
                localStorage.removeItem("awajimaa-auth");
                set({ user: null, token: null, isAuthenticated: false, hasHydrated: true });
            },

            logout: async () => {
                try {
                    await apiLogout();
                } catch {
                    // ignore
                } finally {
                    if (typeof window !== "undefined") {
                        localStorage.removeItem("auth_token");
                        localStorage.removeItem("awajimaa-auth");
                    }
                    Cookies.remove("auth_token");
                    set({ user: null, token: null, isAuthenticated: false, hasHydrated: true });
                }
            },

            setHasHydrated: (hasHydrated) => set({ hasHydrated }),
        }),
        {
            name: "awajimaa-auth",
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
            onRehydrateStorage: () => (state) => {
                state?.setHasHydrated(true);
            },
        }
    )
);