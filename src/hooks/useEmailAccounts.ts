import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, patch, del } from "@/lib/api";

export type EmailAccountType = "admin" | "staff" | "student";
export type EmailAccountStatus = "active" | "suspended";

export interface SchoolEmailAccount {
    id: number;
    school_id: number;
    user_id: number | null;
    email_address: string;
    account_type: EmailAccountType;
    status: EmailAccountStatus;
    created_by: number;
    user: { id: number; name: string } | null;
    creator: { id: number; name: string };
    created_at: string;
}

export function useEmailAccounts(filters?: {
    status?: string;
    account_type?: string;
}) {
    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);
    if (filters?.account_type) params.set("account_type", filters.account_type);
    const query = params.toString() ? `?${params.toString()}` : "";

    return useQuery({
        queryKey: ["email-accounts", filters],
        queryFn: () =>
            get<{ data: SchoolEmailAccount[] }>(`/email-accounts${query}`),
    });
}

export function useCreateEmailAccount() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: {
            email_address: string;
            account_type: EmailAccountType;
            user_id?: number;
        }) => post<SchoolEmailAccount>("/email-accounts", data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["email-accounts"] }),
    });
}

export function useUpdateEmailAccount() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            ...data
        }: {
            id: number;
            status?: EmailAccountStatus;
            account_type?: EmailAccountType;
            user_id?: number | null;
        }) => patch<SchoolEmailAccount>(`/email-accounts/${id}`, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["email-accounts"] }),
    });
}

export function useDeleteEmailAccount() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => del(`/email-accounts/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["email-accounts"] }),
    });
}
