import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post } from "@/lib/api";
import type { TeachingGig, TeachingGigProposal, PaginatedResponse } from "@/types";

interface GigFilters {
    status?: string;
    subject?: string;
    scope?: "my" | "all";
    page?: number;
}

export function useTeachingGigs(params: GigFilters = {}) {
    return useQuery({
        queryKey: ["teaching-gigs", params],
        queryFn: () =>
            get<PaginatedResponse<TeachingGig>>("/teaching-gigs", { params }),
    });
}

export function useTeachingGig(id: number) {
    return useQuery({
        queryKey: ["teaching-gig", id],
        queryFn: () => get<TeachingGig>(`/teaching-gigs/${id}`),
        enabled: !!id,
    });
}

export function useCreateTeachingGig() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<TeachingGig>) =>
            post<TeachingGig>("/teaching-gigs", data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["teaching-gigs"] }),
    });
}

export function useProposeOnGig() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({
            gigId,
            proposed_price_usd,
            proposed_price_ngn,
            message,
        }: {
            gigId: number;
            proposed_price_usd?: number;
            proposed_price_ngn?: number;
            message?: string;
        }) =>
            post<TeachingGigProposal>(`/teaching-gigs/${gigId}/propose`, {
                proposed_price_usd,
                proposed_price_ngn,
                message,
            }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["teaching-gigs"] });
            qc.invalidateQueries({ queryKey: ["my-proposals"] });
        },
    });
}

export function useMyGigProposals(params: { page?: number } = {}) {
    return useQuery({
        queryKey: ["my-proposals", params],
        queryFn: () =>
            get<PaginatedResponse<TeachingGigProposal>>("/teaching-gigs", {
                params: { ...params, scope: "my_proposals" },
            }),
    });
}

export function useFundGig() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (gigId: number) =>
            post(`/teaching-gigs/${gigId}/fund`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["teaching-gigs"] }),
    });
}

export function useAcceptGigProposal() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ gigId, proposalId }: { gigId: number; proposalId: number }) =>
            post(`/teaching-gigs/${gigId}/accept-proposal/${proposalId}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["teaching-gigs"] }),
    });
}

export function useUpdateGigStatus() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ gigId, status }: { gigId: number; status: string }) =>
            post(`/teaching-gigs/${gigId}/status`, { status }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["teaching-gigs"] }),
    });
}
