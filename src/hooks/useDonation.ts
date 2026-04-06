import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, patch } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DonationStats {
    total_donated: number;
    balance_remaining: number;
    students_paid: number;
    sponsors_count: number;
}

export interface Donation {
    id: number;
    donor_name: string | null;
    is_anonymous: boolean;
    amount: number;
    currency: string;
    message: string | null;
    status: 'pending' | 'confirmed';
    created_at: string;
}

export interface DonationPayload {
    donor_name?: string;
    donor_email?: string;
    amount: number;
    currency?: 'USD' | 'NGN';
    message?: string;
    is_anonymous?: boolean;
}

export interface CreateDonationResponse {
    success: boolean;
    data: Donation;
    checkout_url: string | null;
    message: string;
}

// ─── Public Hooks ──────────────────────────────────────────────────────────────

export function useDonationStats() {
    return useQuery({
        queryKey: ['donation-stats'],
        queryFn: () => get<DonationStats>('/donations/stats'),
        staleTime: 60_000,
    });
}

export function useDonations() {
    return useQuery({
        queryKey: ['donations'],
        queryFn: () => get<{ data: { data: Donation[]; total: number; current_page: number; last_page: number } }>('/donations'),
    });
}

export function useCreateDonation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: DonationPayload) =>
            post<CreateDonationResponse>('/donations', payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['donation-stats'] });
            qc.invalidateQueries({ queryKey: ['donations'] });
        },
    });
}

// ─── Admin Hooks ───────────────────────────────────────────────────────────────

export interface AdminDonation extends Donation {
    donor_email: string | null;
    reference: string | null;
    allocated_amount: number;
    student_id: number | null;
    student?: { id: number; full_name: string; admission_number: string } | null;
}

export function useAdminDonations(status?: string) {
    const q = status ? `?status=${status}` : '';
    return useQuery({
        queryKey: ['admin-donations', status],
        queryFn: () => get<{ data: { data: AdminDonation[] } }>(`/donations/all${q}`),
    });
}

export function useConfirmDonation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => patch<{ success: boolean; data: AdminDonation }>(`/donations/${id}/confirm`, {}),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin-donations'] });
            qc.invalidateQueries({ queryKey: ['donation-stats'] });
        },
    });
}

export function useAllocateDonation() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, student_id, amount }: { id: number; student_id: number; amount: number }) =>
            post<{ success: boolean; data: AdminDonation }>(`/donations/${id}/allocate`, { student_id, amount }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin-donations'] });
            qc.invalidateQueries({ queryKey: ['donation-stats'] });
        },
    });
}
