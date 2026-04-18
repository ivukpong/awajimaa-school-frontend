import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, patch, postForm } from "@/lib/api";
import type {
    FreelancerProfile,
    TeacherVerificationMessage,
    PaginatedResponse,
} from "@/types";

interface FreelancerFilters {
    subject?: string;
    min_rate?: number;
    max_rate?: number;
    currency?: "usd" | "ngn";
    state?: string;
    page?: number;
}

export function useFreelancers(params: FreelancerFilters = {}) {
    return useQuery({
        queryKey: ["freelancers", params],
        queryFn: () =>
            get<PaginatedResponse<FreelancerProfile>>("/freelancers", { params }),
    });
}

export function usePublicFreelancerProfile(userId: number) {
    return useQuery({
        queryKey: ["freelancer", userId],
        queryFn: () => get<FreelancerProfile>(`/freelancers/${userId}`),
        enabled: !!userId,
    });
}

export function useFreelancerProfile() {
    return useQuery({
        queryKey: ["freelancer-profile"],
        queryFn: () => get<FreelancerProfile>("/freelancer-profile"),
    });
}

export function useCreateFreelancerProfile() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<FreelancerProfile>) =>
            post<FreelancerProfile>("/freelancer-profile", data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["freelancer-profile"] }),
    });
}

export function useUpdateFreelancerProfile() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<FreelancerProfile>) =>
            patch<FreelancerProfile>("/freelancer-profile", data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["freelancer-profile"] }),
    });
}

// ─── Teacher KYC document uploads ────────────────────────────────────────────

export function useUploadTeacherDocument(type: "cv" | "trcn" | "nin_document" | "certificate") {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: FormData) =>
            postForm<{ success: boolean; url: string; profile: FreelancerProfile }>(
                `/freelancer/upload-document/${type}`,
                data
            ),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["freelancer-profile"] }),
    });
}

// ─── Email OTP ────────────────────────────────────────────────────────────────

export function useSendEmailOtp() {
    return useMutation({
        mutationFn: () => post<{ success: boolean; message: string }>("/freelancer/otp/email/send"),
    });
}

export function useVerifyEmailOtp() {
    return useMutation({
        mutationFn: (otp: string) =>
            post<{ success: boolean; message: string }>("/freelancer/otp/email/verify", { otp }),
    });
}

// ─── Phone OTP ────────────────────────────────────────────────────────────────

export function useSendPhoneOtp() {
    return useMutation({
        mutationFn: (phone?: string) =>
            post<{ success: boolean; message: string }>("/freelancer/otp/phone/send", { phone }),
    });
}

export function useVerifyPhoneOtp() {
    return useMutation({
        mutationFn: (otp: string) =>
            post<{ success: boolean; message: string }>("/freelancer/otp/phone/verify", { otp }),
    });
}

// ─── Teacher ↔ Admin message thread (teacher side) ───────────────────────────

export function useTeacherVerificationMessages() {
    return useQuery({
        queryKey: ["teacher-verification-messages"],
        queryFn: () =>
            get<PaginatedResponse<TeacherVerificationMessage>>(
                "/freelancer/verification/messages"
            ),
    });
}

export function useTeacherReply() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (message: string) =>
            post<TeacherVerificationMessage>("/freelancer/verification/messages", { message }),
        onSuccess: () =>
            qc.invalidateQueries({ queryKey: ["teacher-verification-messages"] }),
    });
}

// ─── Admin: teacher verification list ────────────────────────────────────────

interface VerificationFilters {
    status?: string;
    search?: string;
    page?: number;
}

export function useTeacherVerifications(filters: VerificationFilters = {}) {
    return useQuery({
        queryKey: ["teacher-verifications", filters],
        queryFn: () =>
            get<PaginatedResponse<FreelancerProfile>>(
                "/admin/teacher-verifications",
                { params: filters }
            ),
    });
}

export function useTeacherVerificationDetail(id: number) {
    return useQuery({
        queryKey: ["teacher-verification", id],
        queryFn: () => get<FreelancerProfile>(`/admin/teacher-verifications/${id}`),
        enabled: !!id,
    });
}

export function useApproveTeacher() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, notes }: { id: number; notes?: string }) =>
            post(`/admin/teacher-verifications/${id}/approve`, { notes }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["teacher-verifications"] }),
    });
}

export function useDeclineTeacher() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, reason }: { id: number; reason: string }) =>
            post(`/admin/teacher-verifications/${id}/decline`, { reason }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["teacher-verifications"] }),
    });
}

export function useRequestMoreInfo() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, message }: { id: number; message: string }) =>
            post(`/admin/teacher-verifications/${id}/request-info`, { message }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["teacher-verifications"] }),
    });
}

export function useAdminTeacherMessages(id: number) {
    return useQuery({
        queryKey: ["teacher-messages", id],
        queryFn: () =>
            get<PaginatedResponse<TeacherVerificationMessage>>(
                `/admin/teacher-verifications/${id}/messages`
            ),
        enabled: !!id,
    });
}

export function useSendAdminMessage(id: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (message: string) =>
            post<TeacherVerificationMessage>(
                `/admin/teacher-verifications/${id}/messages`,
                { message }
            ),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["teacher-messages", id] }),
    });
}
