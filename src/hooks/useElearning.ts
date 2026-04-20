import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, patch, del } from "@/lib/api";

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface ElearningProgram {
    id: number;
    school_id: number | null;
    instructor_id: number;
    name: string;
    slug: string;
    description: string | null;
    thumbnail: string | null;
    promo_video_url: string | null;
    amount: number;
    currency: string;
    is_free: boolean;
    duration_days: number | null;
    access_duration_days: number | null;
    certificate_threshold: number;
    is_published: boolean;
    modules_count?: number;
    enrollments_count?: number;
    certificates_count?: number;
    total_lessons?: number;
    certificate_lesson_threshold?: number;
    instructor?: { id: number; name: string; avatar: string | null };
    modules?: ElearningModule[];
    created_at: string;
}

export interface ElearningModule {
    id: number;
    program_id: number;
    title: string;
    description: string | null;
    order: number;
    lessons_count?: number;
    lessons?: ElearningLesson[];
}

export interface ElearningLesson {
    id: number;
    module_id: number;
    title: string;
    content: string | null;
    video_url: string | null;
    file_url: string | null;
    type: "video" | "article" | "document" | "quiz";
    duration_minutes: number | null;
    order: number;
    is_preview: boolean;
}

export interface ElearningEnrollment {
    id: number;
    program_id: number;
    user_id: number;
    status: "active" | "completed" | "expired";
    payment_reference: string | null;
    amount_paid: number;
    currency: string;
    enrolled_at: string;
    completed_at: string | null;
    expires_at: string | null;
    completion_percent?: number;
    certificate_eligible?: boolean;
    program?: Pick<ElearningProgram, "id" | "name" | "slug" | "thumbnail" | "certificate_threshold">;
    user?: { id: number; name: string; email: string; avatar: string | null };
}

export interface ElearningCertificate {
    id: number;
    enrollment_id: number;
    user_id: number;
    program_id: number;
    certificate_number: string;
    issued_to: string | null;
    issued_at: string;
    expires_at: string | null;
    pdf_url: string | null;
    verification_url: string | null;
    program?: Pick<ElearningProgram, "id" | "name" | "slug" | "thumbnail"> & { school_name?: string };
    user?: { id: number; name: string; email?: string };
    enrollment?: ElearningEnrollment & { program?: Pick<ElearningProgram, "id" | "name" | "slug"> & { school_name?: string } };
}

export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    per_page: number;
}

// ─── Program Hooks ─────────────────────────────────────────────────────────────

export function useElearningPrograms(params?: { school_id?: number; published?: boolean; search?: string }) {
    return useQuery({
        queryKey: ["elearning-programs", params],
        queryFn: () => get<PaginatedResponse<ElearningProgram>>("/elearning/programs", { params }),
    });
}

export function usePublicElearningPrograms(params?: { school_id?: number; published?: boolean; search?: string }) {
    return useQuery({
        queryKey: ["public-elearning-programs", params],
        queryFn: () => get<PaginatedResponse<ElearningProgram>>("/public/elearning/programs", { params }),
        staleTime: 60_000,
    });
}

export function useElearningProgram(programId: number | null) {
    return useQuery({
        queryKey: ["elearning-program", programId],
        queryFn: () => get<ElearningProgram>(`/elearning/programs/${programId}`),
        enabled: !!programId,
    });
}

export function useCreateProgram() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: Partial<ElearningProgram>) =>
            post<ElearningProgram>("/elearning/programs", payload),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["elearning-programs"] }),
    });
}

export function useUpdateProgram(programId: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: Partial<ElearningProgram>) =>
            patch<ElearningProgram>(`/elearning/programs/${programId}`, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["elearning-programs"] });
            qc.invalidateQueries({ queryKey: ["elearning-program", programId] });
        },
    });
}

export function useDeleteProgram() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (programId: number) => del(`/elearning/programs/${programId}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["elearning-programs"] }),
    });
}

// ─── Module Hooks ─────────────────────────────────────────────────────────────

export function useProgramModules(programId: number | null) {
    return useQuery({
        queryKey: ["elearning-modules", programId],
        queryFn: () => get<ElearningModule[]>(`/elearning/programs/${programId}/modules`),
        enabled: !!programId,
    });
}

export function useCreateModule(programId: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: { title: string; description?: string; order: number }) =>
            post<ElearningModule>(`/elearning/programs/${programId}/modules`, payload),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["elearning-modules", programId] }),
    });
}

export function useUpdateModule(programId: number, moduleId: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: Partial<ElearningModule>) =>
            patch<ElearningModule>(`/elearning/programs/${programId}/modules/${moduleId}`, payload),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["elearning-modules", programId] }),
    });
}

export function useDeleteModule(programId: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (moduleId: number) =>
            del(`/elearning/programs/${programId}/modules/${moduleId}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["elearning-modules", programId] }),
    });
}

// ─── Lesson Hooks ─────────────────────────────────────────────────────────────

export function useModuleLessons(moduleId: number | null) {
    return useQuery({
        queryKey: ["elearning-lessons", moduleId],
        queryFn: () => get<ElearningLesson[]>(`/elearning/modules/${moduleId}/lessons`),
        enabled: !!moduleId,
    });
}

export function useCreateLesson(moduleId: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: Partial<ElearningLesson>) =>
            post<ElearningLesson>(`/elearning/modules/${moduleId}/lessons`, payload),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["elearning-lessons", moduleId] }),
    });
}

export function useUpdateLesson(moduleId: number, lessonId: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: Partial<ElearningLesson>) =>
            patch<ElearningLesson>(`/elearning/modules/${moduleId}/lessons/${lessonId}`, payload),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["elearning-lessons", moduleId] }),
    });
}

export function useDeleteLesson(moduleId: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (lessonId: number) =>
            del(`/elearning/modules/${moduleId}/lessons/${lessonId}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["elearning-lessons", moduleId] }),
    });
}

// ─── Enrollment Hooks ─────────────────────────────────────────────────────────

export function useMyEnrollments() {
    return useQuery({
        queryKey: ["my-elearning-enrollments"],
        queryFn: () => get<ElearningEnrollment[]>("/elearning/my-enrollments"),
    });
}

export function useProgramEnrollments(programId: number | null) {
    return useQuery({
        queryKey: ["elearning-program-enrollments", programId],
        queryFn: () =>
            get<PaginatedResponse<ElearningEnrollment>>(`/elearning/programs/${programId}/enrollments`),
        enabled: !!programId,
    });
}

export function useEnroll(programId: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: { payment_reference?: string; amount_paid: number; currency: string }) =>
            post<ElearningEnrollment>(`/elearning/programs/${programId}/enroll`, payload),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["my-elearning-enrollments"] }),
    });
}

// ─── Certificate Hooks ────────────────────────────────────────────────────────

export function useMyCertificates() {
    return useQuery({
        queryKey: ["my-elearning-certificates"],
        queryFn: () => get<ElearningCertificate[]>("/elearning/my-certificates"),
    });
}

export function useIssueCertificate(enrollmentId: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: () =>
            post<ElearningCertificate>(`/elearning/enrollments/${enrollmentId}/certificate`, {}),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["my-elearning-certificates"] });
            qc.invalidateQueries({ queryKey: ["my-elearning-enrollments"] });
        },
    });
}

export function useVerifyCertificate(certNumber: string | null) {
    return useQuery({
        queryKey: ["verify-certificate", certNumber],
        queryFn: () =>
            get<ElearningCertificate>(`/public/certificates/${certNumber}/verify`),
        enabled: !!certNumber,
        retry: false,
    });
}
