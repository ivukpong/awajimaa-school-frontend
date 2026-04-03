import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, patch } from "@/lib/api";
import type {
    OfflinePaymentRequest,
    PaginatedResponse,
    PlatformAccountantSummary,
    SchoolSubscription,
    SubscriptionInvoice,
    SubscriptionPlan,
} from "@/types";

// ── Subscription Plans ────────────────────────────────────────────────────────

export function useSubscriptionPlans() {
    return useQuery({
        queryKey: ["subscription-plans"],
        queryFn: () => get<SubscriptionPlan[]>("/subscription-plans"),
    });
}

export function useAllSubscriptionPlans() {
    return useQuery({
        queryKey: ["subscription-plans-all"],
        queryFn: () => get<SubscriptionPlan[]>("/subscription-plans/all"),
    });
}

export function useCreateSubscriptionPlan() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<SubscriptionPlan> & { create_paystack_plans?: boolean }) =>
            post<SubscriptionPlan>("/subscription-plans", data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["subscription-plans"] });
            qc.invalidateQueries({ queryKey: ["subscription-plans-all"] });
        },
    });
}

export function useUpdateSubscriptionPlan() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }: Partial<SubscriptionPlan> & { id: number }) =>
            patch<SubscriptionPlan>(`/subscription-plans/${id}`, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["subscription-plans"] });
            qc.invalidateQueries({ queryKey: ["subscription-plans-all"] });
        },
    });
}

// ── School Subscription ───────────────────────────────────────────────────────

export function useMySubscription() {
    return useQuery({
        queryKey: ["my-subscription"],
        queryFn: () => get<SchoolSubscription | null>("/my-subscription"),
    });
}

export function useAllSubscriptions(params?: { status?: string; school_id?: number }) {
    return useQuery({
        queryKey: ["subscriptions", params],
        queryFn: () =>
            get<PaginatedResponse<SchoolSubscription>>("/subscriptions", { params }),
    });
}

export function useInitializeSubscription() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: {
            plan_id: number;
            billing_cycle: "monthly" | "yearly";
            email: string;
        }) =>
            post<{
                authorization_url: string;
                reference: string;
                invoice: SubscriptionInvoice;
                subscription: SchoolSubscription;
            }>("/subscription/initialize", data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["my-subscription"] });
            qc.invalidateQueries({ queryKey: ["subscription-invoices"] });
        },
    });
}

// ── Subscription Invoices ─────────────────────────────────────────────────────

export function useSubscriptionInvoices() {
    return useQuery({
        queryKey: ["subscription-invoices"],
        queryFn: () =>
            get<PaginatedResponse<SubscriptionInvoice>>("/subscription-invoices"),
    });
}

export function useSubscriptionInvoice(id: number) {
    return useQuery({
        queryKey: ["subscription-invoice", id],
        queryFn: () => get<SubscriptionInvoice>(`/subscription-invoices/${id}`),
        enabled: !!id,
    });
}

// ── Offline Payment Requests ──────────────────────────────────────────────────

export function useOfflinePaymentRequests(params?: { status?: string }) {
    return useQuery({
        queryKey: ["offline-payment-requests", params],
        queryFn: () =>
            get<PaginatedResponse<OfflinePaymentRequest>>("/offline-payment-requests", {
                params,
            }),
    });
}

export function useSubmitOfflinePayment() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: FormData) =>
            post<OfflinePaymentRequest>("/offline-payment-requests", data, {
                headers: { "Content-Type": "multipart/form-data" },
            }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["offline-payment-requests"] });
            qc.invalidateQueries({ queryKey: ["subscription-invoices"] });
        },
    });
}

export function useReviewOfflinePayment() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            ...data
        }: {
            id: number;
            status: "approved" | "rejected";
            review_notes?: string;
        }) =>
            post<OfflinePaymentRequest>(`/offline-payment-requests/${id}/review`, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["offline-payment-requests"] });
            qc.invalidateQueries({ queryKey: ["subscription-invoices"] });
            qc.invalidateQueries({ queryKey: ["subscriptions"] });
        },
    });
}

// ── Platform Accountant ───────────────────────────────────────────────────────

export function usePlatformAccountantSummary() {
    return useQuery({
        queryKey: ["platform-accountant-summary"],
        queryFn: () => get<PlatformAccountantSummary>("/platform-accountant/summary"),
    });
}
