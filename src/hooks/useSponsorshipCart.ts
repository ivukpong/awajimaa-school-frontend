import { useQuery, useMutation } from '@tanstack/react-query';
import { get, post } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface FeaturedStudent {
    id: number;
    admission_number: string;
    public_token: string;
    gender: 'male' | 'female' | 'other';
    needy_reason: string | null;
    profile_photo: string | null;
    school: {
        id: number;
        name: string;
        logo: string | null;
        address: string | null;
        state: { id: number; name: string } | null;
    };
    current_class: { id: number; name: string } | null;
    user: { id: number; name: string; avatar: string | null } | null;
    suggested_amount: number;
}

export interface FeaturedStudentsResponse {
    data: FeaturedStudent[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface SponsorshipOrderItem {
    id: number;
    student_id: number;
    amount: number;
    student: FeaturedStudent;
}

export interface SponsorshipOrder {
    id: number;
    reference: string;
    sponsor_name: string;
    sponsor_email: string;
    sponsor_phone: string | null;
    currency: string;
    subtotal: number;
    gateway_fee: number;
    total: number;
    gateway: string;
    status: 'pending' | 'paid' | 'expired' | 'failed';
    expires_at: string;
    paid_at: string | null;
    items: SponsorshipOrderItem[];
}

export interface CreateOrderPayload {
    student_ids: number[];
    sponsor_name: string;
    sponsor_email: string;
    sponsor_phone?: string;
    gateway: string;
    currency?: string;
}

export interface CheckoutPayload {
    gateway?: string;
}

export interface CheckoutResponse {
    checkout_url: string;
    reference: string;
    order: SponsorshipOrder;
}

export interface VerifyResponse {
    status: 'paid' | 'pending' | 'failed';
    order: SponsorshipOrder;
    message: string;
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useFeaturedStudents(params?: { page?: number; per_page?: number }) {
    return useQuery({
        queryKey: ['featured-students', params],
        queryFn: () =>
            get<FeaturedStudentsResponse>('/public/featured-students', { params }),
        staleTime: 5 * 60_000,
    });
}

export function useCreateSponsorshipOrder() {
    return useMutation({
        mutationFn: (payload: CreateOrderPayload) =>
            post<SponsorshipOrder>('/public/sponsorship-cart', payload),
    });
}

export function useCheckoutOrder(orderId: number) {
    return useMutation({
        mutationFn: (payload: CheckoutPayload) =>
            post<CheckoutResponse>(`/public/sponsorship-cart/${orderId}/checkout`, payload),
    });
}

export function useVerifySponsorshipOrder(reference: string | null) {
    return useQuery({
        queryKey: ['sponsorship-verify', reference],
        queryFn: () =>
            get<VerifyResponse>(`/public/sponsorship-cart/${reference}/verify`),
        enabled: !!reference,
        retry: false,
    });
}
