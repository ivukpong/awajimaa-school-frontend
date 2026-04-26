import Cookies from "js-cookie";
import axios from "axios";
import { post } from "./api";
import type { User, AuthState } from "@/types";
import { roleDashboardPath } from "./routeAccess";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ── Auth payloads & responses ─────────────────────────────────────────────────

export interface LoginPayload {
    identifier: string;   // email address OR student admission/matric number
    password: string;
}

export interface LoginResponse {
    user: User;
    token: string;
}

// ── Auth functions ────────────────────────────────────────────────────────────

export async function login(payload: LoginPayload): Promise<LoginResponse> {
    const response = await axios.post<LoginResponse>(
        `${BASE_URL}/auth/login`,
        payload,
        {
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            validateStatus: (s) => s < 500,
        }
    );

    if (response.status >= 400) {
        const msg =
            (response.data as { message?: string }).message ?? "Login failed";
        throw new Error(msg);
    }

    const data = response.data as LoginResponse;
    Cookies.set("auth_token", data.token, {
        expires: 7,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
    });
    return data;
}

export async function logout(): Promise<void> {
    try {
        await post("/auth/logout");
    } finally {
        Cookies.remove("auth_token");
    }
}

export async function getMe(): Promise<User> {
    const res = await import("./api").then((m) =>
        m.default.get<{ user: User }>("/auth/me")
    );
    return res.data.user;
}

export function getToken(): string | undefined {
    return Cookies.get("auth_token");
}

export function isLoggedIn(): boolean {
    return !!Cookies.get("auth_token");
}

export function getAuthState(): AuthState {
    return {
        user: null,
        token: getToken() ?? null,
        isAuthenticated: isLoggedIn(),
    };
}

export { roleDashboardPath };
