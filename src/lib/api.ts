import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";
import Cookies from "js-cookie";
import type { ApiResponse } from "@/types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const api: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
    },
    withCredentials: false,
});

// ── Request Interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(
    (config) => {
        const token = Cookies.get("auth_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // For FormData payloads, remove the hardcoded JSON Content-Type so the
        // browser can set the correct multipart/form-data with its boundary.
        if (config.data instanceof FormData) {
            delete config.headers["Content-Type"];
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── Response Interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            Cookies.remove("auth_token");
            if (typeof window !== "undefined") {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

// ── Helpers ──────────────────────────────────────────────────────────────────
export async function get<T>(
    url: string,
    config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
    const { data } = await api.get<ApiResponse<T>>(url, config);
    return data;
}

export async function post<T>(
    url: string,
    body?: unknown,
    config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
    const { data } = await api.post<ApiResponse<T>>(url, body, config);
    return data;
}

export async function put<T>(
    url: string,
    body?: unknown,
    config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
    const { data } = await api.put<ApiResponse<T>>(url, body, config);
    return data;
}

export async function patch<T>(
    url: string,
    body?: unknown,
    config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
    const { data } = await api.patch<ApiResponse<T>>(url, body, config);
    return data;
}

export async function del<T>(
    url: string,
    config?: AxiosRequestConfig
): Promise<ApiResponse<T>> {
    const { data } = await api.delete<ApiResponse<T>>(url, config);
    return data;
}

export async function postForm<T>(
    url: string,
    formData: FormData
): Promise<ApiResponse<T>> {
    const { data } = await api.post<ApiResponse<T>>(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
}

export default api;
