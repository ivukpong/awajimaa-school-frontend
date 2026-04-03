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
    | "affiliate"
    | "security"
    | "insurance_operator"
    | "platform_accountant"
    | "school_accountant";

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
    area_of_concentration?: string;
    description?: string;
    requirements?: string;
    currency: "usd" | "ngn";
    rate_per_hour: number;
    duration_hours: number;
    total_amount: number;
    platform_fee: number;
    referrer_id?: number;
    referrer_fee: number;
    teacher_payout: number;
    status: "awaiting_payment" | "pending" | "accepted" | "declined" | "ongoing" | "completed" | "cancelled";
    scheduled_at: string;
    start_date?: string;
    end_date?: string;
    milestones?: Array<{
        title: string;
        due_date?: string;
        amount?: number;
    }>;
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

// ─── Insurance ────────────────────────────────────────────────────────────────
export interface InsurancePackage {
    id: number;
    operator_id?: number;
    operator?: Pick<User, "id" | "name" | "email">;
    name: string;
    provider?: string;
    description?: string;
    media_url?: string;
    premium: number;
    subscription_type: "one_time" | "recurring";
    duration_months?: number;
    coverage_type: "school" | "student" | "both";
    coverage_details?: Record<string, unknown>;
    benefits?: string[];
    is_active: boolean;
    created_at: string;
}

export interface InsurancePolicy {
    id: number;
    school_id: number;
    insurance_scheme_id: number;
    scheme?: InsurancePackage;
    start_date: string;
    end_date?: string;
    premium_paid: number;
    status: "active" | "expired" | "cancelled";
    created_at: string;
}

export interface InsuranceClaim {
    id: number;
    school_id: number;
    school?: { id: number; name: string };
    insurance_scheme_id: number;
    scheme?: Pick<InsurancePackage, "id" | "name">;
    school_insurance_id?: number;
    claim_type: string;
    description: string;
    evidence_urls?: string[];
    amount_claimed: number;
    status: "pending" | "under_review" | "approved" | "rejected" | "paid";
    reviewed_by?: number;
    reviewer?: Pick<User, "id" | "name">;
    review_notes?: string;
    amount_approved?: number;
    reviewed_at?: string;
    created_at: string;
}

export interface InsuranceOperatorStats {
    total_packages: number;
    active_subscriptions: number;
    pending_claims: number;
    total_claims: number;
    total_premium_collected: number;
}

export interface InsuranceOperator {
    id: number;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    packages_count: number;
    created_at: string;
}

// ─── Subscriptions ────────────────────────────────────────────────────────────
export interface SubscriptionPlan {
    id: number;
    name: string;
    description?: string;
    price_monthly: number;
    price_yearly: number;
    max_branches: number;
    max_students: number;
    max_teachers: number;
    features?: string[];
    is_active: boolean;
    paystack_plan_code_monthly?: string;
    paystack_plan_code_yearly?: string;
    created_at: string;
    updated_at: string;
}

export interface SchoolSubscription {
    id: number;
    school_id: number;
    plan_id: number;
    billing_cycle: "monthly" | "yearly";
    status: "active" | "pending" | "expired" | "cancelled" | "trial";
    start_date?: string;
    end_date?: string;
    paystack_subscription_code?: string;
    paystack_customer_code?: string;
    auto_renew: boolean;
    activated_by?: number;
    plan?: SubscriptionPlan;
    school?: { id: number; name: string; subdomain?: string };
    created_at: string;
    updated_at: string;
}

export interface SubscriptionInvoice {
    id: number;
    school_id: number;
    subscription_id?: number;
    plan_id: number;
    invoice_number: string;
    amount: number;
    amount_paid: number;
    status: "unpaid" | "partial" | "paid" | "cancelled";
    due_date?: string;
    billing_cycle: string;
    notes?: string;
    plan?: SubscriptionPlan;
    school?: { id: number; name: string };
    subscription?: SchoolSubscription;
    payment_url?: string;
    offline_requests?: OfflinePaymentRequest[];
    created_at: string;
    updated_at: string;
}

export interface OfflinePaymentRequest {
    id: number;
    school_id: number;
    subscription_invoice_id?: number;
    amount: number;
    bank_name: string;
    account_name: string;
    transaction_reference: string;
    transaction_date: string;
    proof_url?: string;
    status: "pending" | "approved" | "rejected";
    reviewed_by?: number;
    review_notes?: string;
    reviewed_at?: string;
    school?: { id: number; name: string };
    invoice?: { id: number; invoice_number: string; amount: number; status: string };
    reviewer?: { id: number; name: string };
    created_at: string;
    updated_at: string;
}

export interface PlatformAccountantSummary {
    total_subscriptions: number;
    active_subscriptions: number;
    pending_offline: number;
    revenue_this_month: number;
    revenue_total: number;
    plans_breakdown: Array<{
        id: number;
        name: string;
        price_monthly: number;
        price_yearly: number;
        active_count: number;
    }>;
}

