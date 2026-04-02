import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, patch, del } from "@/lib/api";
import type {
    InsuranceClaim,
    InsuranceOperator,
    InsuranceOperatorStats,
    InsurancePackage,
    InsurancePolicy,
} from "@/types";

// ── Browse (any authenticated user) ─────────────────────────────────────────

export function useInsurancePackages(filters?: {
    coverage_type?: string;
    subscription_type?: string;
}) {
    return useQuery({
        queryKey: ["insurance-packages", filters],
        queryFn: () =>
            get<InsurancePackage[]>("/insurance/packages", { params: filters }),
    });
}

export function useInsuranceOperators() {
    return useQuery({
        queryKey: ["insurance-operators"],
        queryFn: () => get<InsuranceOperator[]>("/insurance/operators"),
    });
}

// ── Insurance Operator — package management ──────────────────────────────────

export function useMyInsurancePackages() {
    return useQuery({
        queryKey: ["my-insurance-packages"],
        queryFn: () => get<InsurancePackage[]>("/insurance/my-packages"),
    });
}

export function useCreateInsurancePackage() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<InsurancePackage>) =>
            post<InsurancePackage>("/insurance/my-packages", data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["my-insurance-packages"] });
            qc.invalidateQueries({ queryKey: ["insurance-packages"] });
        },
    });
}

export function useUpdateInsurancePackage() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }: Partial<InsurancePackage> & { id: number }) =>
            patch<InsurancePackage>(`/insurance/my-packages/${id}`, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["my-insurance-packages"] });
            qc.invalidateQueries({ queryKey: ["insurance-packages"] });
        },
    });
}

export function useDeleteInsurancePackage() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => del(`/insurance/my-packages/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["my-insurance-packages"] });
            qc.invalidateQueries({ queryKey: ["insurance-packages"] });
        },
    });
}

export function useInsuranceOperatorStats() {
    return useQuery({
        queryKey: ["insurance-operator-stats"],
        queryFn: () => get<InsuranceOperatorStats>("/insurance/operator-stats"),
    });
}

// ── School — subscriptions & claims ─────────────────────────────────────────

export function useMyInsurancePolicies() {
    return useQuery({
        queryKey: ["my-insurance-policies"],
        queryFn: () => get<InsurancePolicy[]>("/insurance/my-policies"),
    });
}

export function useSubscribeInsurancePolicy() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: {
            insurance_scheme_id: number;
            start_date: string;
            end_date?: string;
            premium_paid: number;
        }) => post<InsurancePolicy>("/insurance/my-policies", data),
        onSuccess: () =>
            qc.invalidateQueries({ queryKey: ["my-insurance-policies"] }),
    });
}

export function useInsuranceClaims() {
    return useQuery({
        queryKey: ["insurance-claims"],
        queryFn: () => get<InsuranceClaim[]>("/insurance/claims"),
    });
}

export function useSubmitInsuranceClaim() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: {
            insurance_scheme_id: number;
            school_insurance_id?: number;
            claim_type: string;
            description: string;
            evidence_urls?: string[];
            amount_claimed: number;
        }) => post<InsuranceClaim>("/insurance/claims", data),
        onSuccess: () =>
            qc.invalidateQueries({ queryKey: ["insurance-claims"] }),
    });
}

export function useReviewInsuranceClaim() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            ...data
        }: {
            id: number;
            status: "under_review" | "approved" | "rejected" | "paid";
            review_notes?: string;
            amount_approved?: number;
        }) => patch<InsuranceClaim>(`/insurance/claims/${id}`, data),
        onSuccess: () =>
            qc.invalidateQueries({ queryKey: ["insurance-claims"] }),
    });
}
