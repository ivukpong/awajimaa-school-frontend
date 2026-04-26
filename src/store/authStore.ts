import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";
import type { User } from "@/types";
import { login as apiLogin, logout as apiLogout } from "@/lib/auth";
import type { LoginPayload } from "@/lib/auth";

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
                    set({ user, token, isAuthenticated: true, isLoading: false });
                    return user;
                } catch (error) {
                    set({ isLoading: false });
                    throw error;
                }
            },

            logout: async () => {
                await apiLogout();
                set({ user: null, token: null, isAuthenticated: false });
            },

            setUser: (user) => set({ user, hasHydrated: true }),

            setAuth: (token, user) =>
                set({
                    token,
                    user,
                    isAuthenticated: true,
                    hasHydrated: true,
                }),

            clearAuth: () =>
                {
                    Cookies.remove("auth_token");
                    set({
                        user: null,
                        token: null,
                        isAuthenticated: false,
                        hasHydrated: true,
                    });
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
