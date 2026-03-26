import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post } from "@/lib/api";
import type { TeacherEngagement, PaginatedResponse } from "@/types";

interface EngagementFilters {
    status?: string;
    page?: number;
}

export function useEngagements(params: EngagementFilters = {}) {
    return useQuery({
        queryKey: ["engagements", params],
        queryFn: () =>
            get<PaginatedResponse<TeacherEngagement>>("/engagements", { params }),
    });
}

export function useCreateEngagement() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: {
            teacher_id: number;
            subject: string;
            description?: string;
            currency: "usd" | "ngn";
            rate_per_hour: number;
            duration_hours: number;
            scheduled_at: string;
        }) => post<TeacherEngagement>("/engagements", data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["engagements"] }),
    });
}

export function useAcceptEngagement() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => post(`/engagements/${id}/accept`, {}),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["engagements"] }),
    });
}

export function useDeclineEngagement() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => post(`/engagements/${id}/decline`, {}),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["engagements"] }),
    });
}

export function useCompleteEngagement() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => post(`/engagements/${id}/complete`, {}),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["engagements"] }),
    });
}

export function useRateEngagement() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, rating, review }: { id: number; rating: number; review?: string }) =>
            post(`/engagements/${id}/rate`, { rating, review }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["engagements"] }),
    });
}
