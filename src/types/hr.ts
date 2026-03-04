// ─── HR / Staff ───────────────────────────────────────────────────────────────

export interface Department {
    id: number;
    school_id: number;
    branch_id?: number;
    name: string;
    code?: string;
    description?: string;
    head_id?: number;
    head?: { id: number; name: string; email: string };
    is_active: boolean;
    teachers_count?: number;
    created_at: string;
}

export interface TeacherProfile {
    id: number;
    user_id: number;
    school_id: number;
    branch_id?: number;
    department_id?: number;
    staff_id: string;
    qualification?: string;
    specialization?: string;
    employment_type: "full_time" | "part_time" | "contract" | "volunteer";
    status: "active" | "on_leave" | "suspended" | "resigned" | "retired";
    date_of_hire: string;
    date_of_departure?: string;
    bank_name?: string;
    bank_account_number?: string;
    bank_account_name?: string;
    pension_pin?: string;
    tax_id?: string;
    bio?: string;
    user?: { id: number; name: string; email: string; phone?: string; avatar?: string };
    department?: { id: number; name: string };
    created_at: string;
}

export interface SalaryStructure {
    id: number;
    school_id: number;
    name: string;
    basic_salary: number;
    housing_allowance: number;
    transport_allowance: number;
    medical_allowance: number;
    utility_allowance: number;
    other_allowances: number;
    is_active: boolean;
    // computed
    gross_salary?: number;
    total_allowances?: number;
}

export interface PayrollRun {
    id: number;
    school_id: number;
    month: string;
    status: "draft" | "approved" | "paid" | "reversed";
    total_gross: number;
    total_deductions: number;
    total_net: number;
    approved_by?: number;
    approved_at?: string;
    paid_at?: string;
    notes?: string;
    items_count?: number;
    created_at: string;
}

export interface PayrollItem {
    id: number;
    payroll_run_id: number;
    teacher_profile_id: number;
    basic_salary: number;
    total_allowances: number;
    gross_salary: number;
    tax_deduction: number;
    pension_deduction: number;
    other_deductions: number;
    net_salary: number;
    payment_status: "pending" | "paid" | "failed";
    payment_reference?: string;
    paid_at?: string;
    breakdown?: Record<string, number>;
    teacher_profile?: TeacherProfile;
    payroll_run?: PayrollRun;
}

export interface LeaveType {
    id: number;
    school_id: number;
    name: string;
    days_allowed: number;
    is_paid: boolean;
    requires_document: boolean;
    is_active: boolean;
}

export interface LeaveRequest {
    id: number;
    teacher_profile_id: number;
    leave_type_id: number;
    start_date: string;
    end_date: string;
    total_days: number;
    reason: string;
    support_document?: string;
    status: "pending" | "approved" | "rejected" | "cancelled";
    reviewed_by?: number;
    review_note?: string;
    reviewed_at?: string;
    teacher_profile?: TeacherProfile;
    leave_type?: LeaveType;
    reviewer?: { id: number; name: string };
    created_at: string;
}

export interface JobPosting {
    id: number;
    school_id: number;
    department_id?: number;
    title: string;
    description: string;
    requirements?: string[];
    employment_type: "full_time" | "part_time" | "contract";
    application_deadline?: string;
    status: "draft" | "open" | "closed" | "filled";
    slots: number;
    applications_count?: number;
    created_at: string;
}

export interface JobApplication {
    id: number;
    job_posting_id: number;
    applicant_name: string;
    applicant_email: string;
    applicant_phone?: string;
    cv_path?: string;
    cover_letter?: string;
    qualifications?: string[];
    status: "submitted" | "shortlisted" | "interviewed" | "offered" | "rejected" | "hired";
    review_notes?: string;
    created_at: string;
}
