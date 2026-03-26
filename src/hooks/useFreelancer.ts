import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, patch } from "@/lib/api";
import type { FreelancerProfile, PaginatedResponse } from "@/types";

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
