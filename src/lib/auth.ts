import Cookies from "js-cookie";
import axios from "axios";
import { post } from "./api";
import type { User, AuthState } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export interface LoginPayload {
    email: string;
    password: string;
}

export interface LoginResponse {
    user: User;
    token: string;
}

export async function login(payload: LoginPayload): Promise<LoginResponse> {
    // Backend returns { token, user } directly — not wrapped in ApiResponse
    const { data } = await axios.post<LoginResponse>(
        `${BASE_URL}/auth/login`,
        payload,
        { headers: { "Content-Type": "application/json", Accept: "application/json" } }
    );
    if (data.token) {
        Cookies.set("auth_token", data.token, {
            expires: 7,
            sameSite: "strict",
            secure: process.env.NODE_ENV === "production",
        });
    }
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
    const res = await import("./api").then((m) => m.get<User>("/auth/me"));
    return res.data;
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

/** Map role to dashboard base path */
export const roleDashboardPath: Record<string, string> = {
    super_admin: "/super-admin",
    regulator: "/regulator",
    school_admin: "/school-admin",
    branch_admin: "/school-admin",
    teacher: "/teacher",
    student: "/student",
    parent: "/parent",
    sponsor: "/sponsor",
    revenue_collector: "/revenue",
};
