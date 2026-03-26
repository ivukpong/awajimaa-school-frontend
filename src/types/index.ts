// ─── Roles ────────────────────────────────────────────────────────────────────
export type UserRole =
    | "super_admin"
    | "regulator"
    | "state_regulator"
    | "lga_regulator"
    | "school_admin"
    | "branch_admin"
    | "teacher"
    | "freelancer_teacher"
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

// ─── Freelancer Teacher ───────────────────────────────────────────────────────
export interface FreelancerProfile {
    id: number;
    user_id: number;
    user?: Pick<User, "id" | "name" | "email" | "avatar">;
    hourly_rate_usd: number;
    hourly_rate_ngn: number;
    subjects: string[];
    bio?: string;
    is_available: boolean;
    total_sessions: number;
    total_students: number;
    total_revenue_usd: number;
    total_revenue_ngn: number;
    average_rating: number;
    ratings_count: number;
    qualification?: string;
    specialization?: string;
    state?: string;
    lga?: string;
    google_scholar_url?: string;
    publons_url?: string;
    researchgate_url?: string;
    orcid_url?: string;
    scopus_url?: string;
    created_at: string;
    updated_at: string;
}

// ─── Teacher Postings ─────────────────────────────────────────────────────────
export interface TeacherPosting {
    id: number;
    teacher_id: number;
    school_id: number;
    regulator_id: number;
    teacher?: Pick<User, "id" | "name" | "email">;
    school?: { id: number; name: string };
    regulator?: Pick<User, "id" | "name">;
    effective_date: string;
    posting_letter: string;
    status: "pending" | "accepted" | "declined" | "revoked";
    notes?: string;
    responded_at?: string;
    created_at: string;
}

// ─── Teacher Engagements ──────────────────────────────────────────────────────
export interface TeacherEngagement {
    id: number;
    teacher_id: number;
    parent_id: number;
    teacher?: Pick<User, "id" | "name" | "email" | "avatar">;
    parent?: Pick<User, "id" | "name" | "email">;
    subject: string;
    description?: string;
    currency: "usd" | "ngn";
    rate_per_hour: number;
    duration_hours: number;
    total_amount: number;
    platform_fee: number;
    referrer_id?: number;
    referrer_fee: number;
    teacher_payout: number;
    status: "pending" | "accepted" | "declined" | "ongoing" | "completed" | "cancelled";
    scheduled_at: string;
    accepted_at?: string;
    completed_at?: string;
    payment_reference?: string;
    paid_at?: string;
    rating?: number;
    review?: string;
    created_at: string;
}

// ─── Wallet ───────────────────────────────────────────────────────────────────
export interface Wallet {
    id: number;
    user_id: number;
    currency: "usd" | "ngn";
    balance: number;
    total_earned: number;
    total_withdrawn: number;
    created_at: string;
}

export interface WalletTransaction {
    id: number;
    wallet_id: number;
    wallet?: Pick<Wallet, "id" | "currency">;
    type: "credit" | "debit";
    amount: number;
    description: string;
    reference?: string;
    status: "pending" | "completed" | "failed";
    created_at: string;
}

export interface WalletPayout {
    id: number;
    wallet_id: number;
    wallet?: Pick<Wallet, "id" | "currency">;
    amount: number;
    bank_name: string;
    account_number: string;
    account_name: string;
    status: "pending" | "approved" | "paid" | "rejected";
    paid_at?: string;
    created_at: string;
}
