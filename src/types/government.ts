// ─── Government Programs ────────────────────────────────────────────────────

export type ProgramCategory =
    | "grant" | "scholarship" | "training" | "infrastructure"
    | "feeding" | "health" | "technology" | "other";

export type ProgramStatus = "draft" | "open" | "closed" | "ongoing" | "completed" | "cancelled";

export interface GovernmentProgram {
    id: number;
    state_id?: number;
    created_by: number;
    title: string;
    description: string;
    category: ProgramCategory;
    budget?: number;
    application_start?: string;
    application_deadline?: string;
    commencement_date?: string;
    end_date?: string;
    status: ProgramStatus;
    max_beneficiaries?: number;
    eligibility_criteria?: string[];
    required_documents?: string[];
    coverage_lgas?: number[];
    target_school_types?: string[];
    applications_count?: number;
    creator?: { id: number; name: string };
    created_at: string;
}

export type ApplicationStatus =
    | "submitted" | "under_review" | "approved" | "rejected" | "disbursed" | "cancelled";

export interface ProgramApplication {
    id: number;
    government_program_id: number;
    school_id: number;
    submitted_by: number;
    application_number: string;
    statement?: string;
    documents?: string[];
    beneficiary_data?: unknown;
    status: ApplicationStatus;
    review_notes?: string;
    reviewed_by?: number;
    reviewed_at?: string;
    requested_amount?: number;
    amount_approved?: number;
    amount_disbursed?: number;
    disbursed_at?: string;
    program?: GovernmentProgram;
    created_at: string;
}

// ─── Government Events ──────────────────────────────────────────────────────

export type EventCategory =
    | "conference" | "training" | "workshop" | "inspection"
    | "sports" | "competition" | "census" | "other";

export interface GovernmentEvent {
    id: number;
    state_id?: number;
    created_by: number;
    title: string;
    description?: string;
    category: EventCategory;
    venue?: string;
    venue_address?: string;
    start_datetime: string;
    end_datetime: string;
    is_mandatory: boolean;
    max_participants?: number;
    eligible_roles?: string[];
    coverage_lgas?: number[];
    status: "published" | "cancelled" | "completed";
    registrations_count?: number;
    creator?: { id: number; name: string };
    created_at: string;
}

export interface EventRegistration {
    id: number;
    government_event_id: number;
    school_id: number;
    user_id: number;
    participant_count: number;
    participants?: unknown[];
    status: "registered" | "attended" | "absent" | "cancelled";
    confirmation_code?: string;
    event?: GovernmentEvent;
    created_at: string;
}

// ─── School Approvals ───────────────────────────────────────────────────────

export type ApprovalRequestType =
    | "new_registration" | "renewal" | "upgrade" | "branch_addition"
    | "curriculum_change" | "ownership_change" | "closure";

export type ApprovalStatus =
    | "submitted" | "under_review" | "additional_info_required"
    | "approved" | "rejected" | "withdrawn";

export interface SchoolApprovalRequest {
    id: number;
    school_id: number;
    submitted_by: number;
    request_type: ApprovalRequestType;
    title: string;
    description: string;
    documents?: string[];
    status: ApprovalStatus;
    review_notes?: string;
    reviewed_by?: number;
    reviewed_at?: string;
    valid_until?: string;
    school?: { id: number; name: string; code: string };
    submitter?: { id: number; name: string };
    reviewer?: { id: number; name: string };
    created_at: string;
}

// ─── Government Fees ────────────────────────────────────────────────────────

export interface GovernmentFeeType {
    id: number;
    state_id?: number;
    name: string;
    description?: string;
    amount: number;
    category: "registration" | "renewal" | "levy" | "inspection" | "other";
    applicable_school_types?: string[];
    is_mandatory: boolean;
    is_active: boolean;
}

export interface GovernmentFeePayment {
    id: number;
    school_id: number;
    government_fee_type_id: number;
    paid_by: number;
    receipt_number: string;
    amount: number;
    payment_reference?: string;
    payment_method: "bank_transfer" | "card" | "cash" | "ussd";
    status: "pending" | "confirmed" | "failed" | "reversed";
    confirmed_by?: number;
    confirmed_at?: string;
    year?: string;
    fee_type?: GovernmentFeeType;
    school?: { id: number; name: string };
    created_at: string;
}

// ─── Notifications ──────────────────────────────────────────────────────────

export interface AppNotification {
    id: number;
    user_id: number;
    school_id?: number;
    title: string;
    body: string;
    type: string;
    notifiable_type?: string;
    notifiable_id?: number;
    is_read: boolean;
    read_at?: string;
    data?: Record<string, unknown>;
    created_at: string;
}
