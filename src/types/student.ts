// ─── Student ──────────────────────────────────────────────────────────────────
export interface Student {
    id: number;
    school_id: number;
    branch_id?: number;
    reg_number: string;
    unique_link_token: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    date_of_birth: string;
    gender: "male" | "female";
    photo?: string;
    address?: string;
    state_id?: number;
    lga_id?: number;
    admission_date: string;
    current_class_id?: number;
    status: "active" | "graduated" | "withdrawn" | "suspended";
    created_at: string;
}

export interface StudentHealthRecord {
    id: number;
    student_id: number;
    blood_group: "A+" | "A-" | "B+" | "B-" | "AB+" | "AB-" | "O+" | "O-";
    genotype: "AA" | "AS" | "SS" | "AC" | "SC";
    allergies?: string[];
    medical_conditions?: string[];
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    updated_at: string;
}

export interface StudentActivity {
    id: number;
    student_id: number;
    category:
    | "sports"
    | "arts"
    | "music"
    | "science_club"
    | "debate"
    | "drama"
    | "other";
    name: string;
    level: string; // e.g. "Primary 3", "JSS 2"
    achievement?: string;
    year: string;
}

export interface Attendance {
    id: number;
    student_id: number;
    class_id: number;
    date: string;
    status: "present" | "absent" | "late" | "excused";
    note?: string;
    marked_by: number;
}

export interface Result {
    id: number;
    student_id: number;
    subject_id: number;
    class_id: number;
    term_id: number;
    academic_year_id: number;
    ca1?: number;
    ca2?: number;
    exam?: number;
    total?: number;
    grade?: string;
    remark?: string;
    position?: number;
    teacher_id: number;
}

export interface ExamSchedule {
    id: number;
    school_id: number;
    class_id: number;
    subject_id: number;
    term_id: number;
    exam_date: string;
    start_time: string;
    end_time: string;
    venue?: string;
    instructions?: string;
}

// Public student profile (accessible via unique link)
export interface PublicStudentProfile {
    student: Student;
    health: StudentHealthRecord;
    activities: StudentActivity[];
    results_by_year: Record<string, Result[]>;
    attendance_summary: {
        total_days: number;
        present: number;
        absent: number;
        percentage: number;
    };
    shared_fields?: string[]; // fields owner has unlocked for this viewer
}
