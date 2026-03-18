// ─── Roles ────────────────────────────────────────────────────────────────────
export type UserRole =
    | "super_admin"
    | "regulator"
    | "state_regulator"
    | "lga_regulator"
    | "school_admin"
    | "branch_admin"
    | "teacher"
    | "student"
    | "parent"
    | "sponsor"
    | "revenue_collector"
    | "affiliate";

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface User {
    id: number;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    role: UserRole;
    school_id?: number;
    created_at: string;
    updated_at: string;
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
}

// ─── Location ─────────────────────────────────────────────────────────────────
export interface State {
    id: number;
    name: string;
    code: string;
}

export interface LGA {
    id: number;
    state_id: number;
    name: string;
}

export interface Town {
    id: number;
    lga_id: number;
    name: string;
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

// ─── API ──────────────────────────────────────────────────────────────────────
export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
}
