import Cookies from "js-cookie";
import axios from "axios";
import { post } from "./api";
import type { User, AuthState } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ── Device helpers ────────────────────────────────────────────────────────────

export function getDeviceId(): string {
    if (typeof window === "undefined") return "";
    const key = "awajimaa_device_id";
    let id = localStorage.getItem(key);
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem(key, id);
    }
    return id;
}

export function getDeviceInfo(): { name: string; type: "browser" | "mobile" | "tablet" } {
    if (typeof window === "undefined") return { name: "Server", type: "browser" };
    const ua = navigator.userAgent;
    const browser =
        /Edg\//.test(ua) ? "Edge" :
            /Chrome\//.test(ua) ? "Chrome" :
                /Firefox\//.test(ua) ? "Firefox" :
                    /Safari\//.test(ua) ? "Safari" : "Browser";
    const os =
        /Windows/.test(ua) ? "Windows" :
            /Mac OS/.test(ua) ? "macOS" :
                /Linux/.test(ua) ? "Linux" :
                    /Android/.test(ua) ? "Android" :
                        /iPhone|iPad/.test(ua) ? "iOS" : "Unknown OS";
    const type: "mobile" | "tablet" | "browser" =
        /Mobile|iPhone|Android.*Mobile/.test(ua) ? "mobile" :
            /iPad|Tablet/.test(ua) ? "tablet" : "browser";
    return { name: `${browser} on ${os}`, type };
}

// ── Auth error types ──────────────────────────────────────────────────────────

export class OtpRequiredError extends Error {
    constructor(public readonly email: string, message: string) {
        super(message);
        this.name = "OtpRequiredError";
    }
}

// ── Auth payloads & responses ─────────────────────────────────────────────────

export interface LoginPayload {
    identifier: string;   // email address OR student admission/matric number
    password: string;
}

export interface LoginResponse {
    user: User;
    token: string;
}

export interface DeviceCheckResult {
    trusted: boolean;
    pin_set: boolean;
    user?: { name: string; avatar?: string };
}

// ── Auth functions ────────────────────────────────────────────────────────────

export async function login(payload: LoginPayload): Promise<LoginResponse> {
    const deviceId = getDeviceId();
    const { name: deviceName, type: deviceType } = getDeviceInfo();

    const response = await axios.post<LoginResponse | { status: string; message: string }>(
        `${BASE_URL}/auth/login`,
        { ...payload, device_id: deviceId, device_name: deviceName, device_type: deviceType },
        {
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            validateStatus: (s) => s < 500,
        }
    );

    if (response.status === 202) {
        // Backend signals OTP is required
        throw new OtpRequiredError(
            payload.identifier,
            (response.data as { message: string }).message ?? "Verification required"
        );
    }

    if (response.status >= 400) {
        const msg =
            (response.data as { message?: string; errors?: Record<string, string[]> }).message
            ?? "Login failed";
        throw new Error(msg);
    }

    const data = response.data as LoginResponse;
    Cookies.set("auth_token", data.token, {
        expires: 7,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
    });
    if (typeof window !== "undefined") {
        // Store the email for future device-check on next visit
        const email = data.user?.email ?? payload.identifier;
        localStorage.setItem("awajimaa_last_email", email);
    }
    return data;
}

export async function checkDevice(email: string, deviceId: string): Promise<DeviceCheckResult> {
    const { data } = await axios.post<DeviceCheckResult>(
        `${BASE_URL}/auth/device/check`,
        { email, device_id: deviceId },
        { headers: { "Content-Type": "application/json", Accept: "application/json" } }
    );
    return data;
}

export async function verifyDeviceOtp(
    email: string,
    deviceId: string,
    otp: string
): Promise<LoginResponse> {
    const { data } = await axios.post<LoginResponse>(
        `${BASE_URL}/auth/device/verify-otp`,
        { email, device_id: deviceId, otp },
        { headers: { "Content-Type": "application/json", Accept: "application/json" } }
    );
    Cookies.set("auth_token", data.token, {
        expires: 7,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
    });
    if (typeof window !== "undefined") {
        localStorage.setItem("awajimaa_last_email", email);
    }
    return data;
}

export async function pinLogin(deviceId: string, pin: string): Promise<LoginResponse> {
    const { data } = await axios.post<LoginResponse>(
        `${BASE_URL}/auth/device/pin-login`,
        { device_id: deviceId, pin },
        { headers: { "Content-Type": "application/json", Accept: "application/json" } }
    );
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
    state_regulator: "/regulator",
    lga_regulator: "/regulator",
    school_admin: "/school-admin",
    branch_admin: "/school-admin",
    teacher: "/teacher",
    student: "/student",
    parent: "/parent",
    sponsor: "/sponsor",
    revenue_collector: "/revenue",
    affiliate: "/affiliate",
};

