// ─── Finance ──────────────────────────────────────────────────────────────────
export interface Fee {
    id: number;
    school_id: number;
    name: string;
    amount: number;
    category: "tuition" | "uniform" | "books" | "exam" | "development" | "other";
    class_ids?: number[]; // null = all classes
    term_id?: number;
    academic_year_id: number;
    due_date?: string;
    is_mandatory: boolean;
}

export interface Invoice {
    id: number;
    student_id: number;
    fee_id: number;
    school_id: number;
    amount: number;
    discount?: number;
    balance: number;
    status: "unpaid" | "partial" | "paid" | "waived";
    due_date?: string;
    created_at: string;
}

export interface Payment {
    id: number;
    invoice_id: number;
    student_id: number;
    amount: number;
    channel: "bank_transfer" | "pos" | "online" | "cash" | "wallet";
    reference: string;
    paid_at: string;
    verified_by?: number;
    receipt_url?: string;
}

// ─── Regulatory ───────────────────────────────────────────────────────────────
export interface SchoolCharge {
    id: number;
    regulator_id: number;
    state_id: number;
    name: string;
    amount: number;
    charge_type: "levy" | "tax" | "registration" | "renewal" | "inspection";
    applies_to: "all" | School["school_type"][];
    due_date?: string;
    academic_year?: string;
    description?: string;
    is_active: boolean;
    created_at: string;
}

export interface ChargePayment {
    id: number;
    charge_id: number;
    school_id: number;
    amount_paid: number;
    payment_date: string;
    receipt_number: string;
    status: "paid" | "unpaid" | "partial";
}

export interface VerificationForm {
    id: number;
    regulator_id: number;
    title: string;
    description?: string;
    fields: FormField[];
    target_school_types?: School["school_type"][];
    deadline?: string;
    is_active: boolean;
    created_at: string;
}

export interface FormField {
    key: string;
    label: string;
    type: "text" | "number" | "date" | "file" | "select" | "checkbox" | "textarea";
    options?: string[];
    required: boolean;
}

export interface FormSubmission {
    id: number;
    form_id: number;
    school_id: number;
    data: Record<string, unknown>;
    files?: Record<string, string>; // field_key => file_url
    status: "draft" | "submitted" | "under_review" | "approved" | "rejected" | "needs_revision";
    reviewer_note?: string;
    submitted_at?: string;
    reviewed_at?: string;
}

// ─── Meetings ─────────────────────────────────────────────────────────────────
export interface Meeting {
    id: number;
    organizer_id: number;
    organizer_type: "regulator" | "school_admin";
    title: string;
    description?: string;
    meeting_type: "virtual" | "physical";
    platform?: "zoom" | "google_meet" | "teams" | "other";
    meeting_link?: string;
    scheduled_at: string;
    duration_minutes: number;
    participants: MeetingParticipant[];
    status: "scheduled" | "ongoing" | "completed" | "cancelled";
}

export interface MeetingParticipant {
    user_id: number;
    user_type: string;
    name: string;
    email: string;
    status: "invited" | "accepted" | "declined" | "attended";
}

// ─── Scholarship ──────────────────────────────────────────────────────────────
export interface Scholarship {
    id: number;
    sponsor_id: number;
    name: string;
    description?: string;
    items: ScholarshipItem[];
    total_budget?: number;
    start_date: string;
    end_date?: string;
    is_active: boolean;
}

export interface ScholarshipItem {
    id: number;
    scholarship_id: number;
    category: "school_fees" | "books" | "uniform" | "upkeep" | "transport" | "other";
    description?: string;
    amount: number;
    frequency: "once" | "monthly" | "termly" | "annually";
}

export interface SponsorStudent {
    id: number;
    scholarship_id: number;
    student_id: number;
    amount_due: number;
    amount_paid: number;
    amount_donated: number;
    status: "active" | "completed" | "suspended";
    enrolled_at: string;
}

// ─── Pickup ───────────────────────────────────────────────────────────────────
export interface PickupCode {
    id: number;
    student_id: number;
    guardian_id: number;
    code: string;
    otp?: string;
    otp_expires_at?: string;
    pickup_person_name: string;
    pickup_person_phone: string;
    pickup_person_relationship: string;
    valid_from: string;
    valid_until: string;
    is_used: boolean;
    used_at?: string;
    security_officer_id?: number;
    created_at: string;
}

// ─── Messaging ────────────────────────────────────────────────────────────────
export interface Message {
    id: number;
    sender_id: number;
    sender_type: string;
    receiver_id: number;
    receiver_type: string;
    subject?: string;
    body: string;
    channel: "in_app" | "email" | "sms";
    related_to?: string; // e.g. "application:12", "meeting:5"
    read_at?: string;
    created_at: string;
}

import type { School } from "./school";
