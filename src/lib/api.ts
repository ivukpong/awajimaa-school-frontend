import axios from "axios";

export async function get<T = any>(url: string, config?: any) {
    return axios.get<T>(url, config);
}
export async function post<T = any>(url: string, data?: any, config?: any) {
    return axios.post<T>(url, data, config);
}
export async function patch<T = any>(url: string, data?: any, config?: any) {
    return axios.patch<T>(url, data, config);
}
export async function del<T = any>(url: string, config?: any) {
    return axios.delete<T>(url, config);
}
export async function postForm<T = any>(url: string, data?: any, config?: any) {
    // For multipart/form-data
    const formData = new FormData();
    if (data && typeof data === 'object') {
        Object.entries(data).forEach(([key, value]) => {
            formData.append(key, value as any);
        });
    }
    return axios.post<T>(url, formData, {
        ...(config || {}),
        headers: {
            ...(config?.headers || {}),
            'Content-Type': 'multipart/form-data',
        },
    });
}

export async function put<T = any>(url: string, data?: any, config?: any) {
    return axios.put<T>(url, data, config);
}

// Default export for api helpers
const api = { get, post, patch, del, postForm, put };
export default api;
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import Cookies from "js-cookie";
import { tokenStore } from "@/lib/tokenStore";
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
                    tokenStore.set(token);
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

            logout: async () => {
                try {
                    await apiLogout();
                } catch {
                    // ignore
                } finally {
                    tokenStore.set(null);
                    Cookies.remove("auth_token");
                    localStorage.removeItem("awajimaa-auth");
                    set({ user: null, token: null, isAuthenticated: false, hasHydrated: true });
                }
            },

            setUser: (user) => set({ user, hasHydrated: true }),

            setAuth: (token, user) => {
                tokenStore.set(token); // ← sync, immediate, no storage read
                Cookies.set("auth_token", token, {
                    expires: 7,
                    sameSite: "strict",
                    secure: process.env.NODE_ENV === "production",
                });
                set({ token, user, isAuthenticated: true, hasHydrated: true });
            },

            clearAuth: () => {
                tokenStore.set(null);
                Cookies.remove("auth_token");
                localStorage.removeItem("awajimaa-auth");
                set({ user: null, token: null, isAuthenticated: false, hasHydrated: true });
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
                // Restore tokenStore from persisted state on page load
                if (state?.token) {
                    tokenStore.set(state.token);
                }
                state?.setHasHydrated(true);
            },
        }
    )
);