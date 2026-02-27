// ─── School ───────────────────────────────────────────────────────────────────
export interface School {
    id: number;
    name: string;
    code: string;
    logo?: string;
    email: string;
    phone: string;
    address: string;
    state_id: number;
    lga_id: number;
    town_id: number;
    custom_domain?: string;
    school_type: "primary" | "secondary" | "tertiary" | "nursery" | "combined";
    ownership: "public" | "private" | "mission";
    is_active: boolean;
    registration_number?: string;
    created_at: string;
    updated_at: string;
    state?: { id: number; name: string };
    lga?: { id: number; name: string };
    town?: { id: number; name: string };
}

export interface SchoolBranch {
    id: number;
    school_id: number;
    name: string;
    address: string;
    phone: string;
    email?: string;
    head_teacher_id?: number;
    is_active: boolean;
    created_at: string;
}

export interface ClassRoom {
    id: number;
    school_id: number;
    branch_id?: number;
    name: string;
    level: string; // e.g. "JSS 1", "SS 2", "Primary 3"
    section?: string; // e.g. "A", "B"
    capacity: number;
    form_teacher_id?: number;
    academic_year: string;
    created_at: string;
}

export interface Subject {
    id: number;
    school_id: number;
    name: string;
    code: string;
    category: "core" | "elective" | "vocational";
}

export interface AcademicYear {
    id: number;
    school_id: number;
    name: string; // e.g. "2024/2025"
    start_date: string;
    end_date: string;
    current_term: "first" | "second" | "third";
    is_active: boolean;
}

export interface Term {
    id: number;
    academic_year_id: number;
    name: "first" | "second" | "third";
    start_date: string;
    end_date: string;
    is_active: boolean;
}

export interface Announcement {
    id: number;
    school_id: number;
    title: string;
    body: string;
    audience: UserRoleTarget[];
    is_published: boolean;
    published_at?: string;
    author_id: number;
    created_at: string;
}

export type UserRoleTarget =
    | "all"
    | "teachers"
    | "students"
    | "parents"
    | "staff";

// ─── E-Learning ───────────────────────────────────────────────────────────────
export interface Course {
    id: number;
    school_id: number;
    subject_id: number;
    title: string;
    description?: string;
    teacher_id: number;
    class_ids: number[];
    thumbnail?: string;
    is_published: boolean;
    created_at: string;
}

export interface Lesson {
    id: number;
    course_id: number;
    title: string;
    content?: string;
    video_url?: string;
    file_url?: string;
    order: number;
    duration_minutes?: number;
    created_at: string;
}
