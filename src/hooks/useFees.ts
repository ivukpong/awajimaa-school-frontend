import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, del } from '@/lib/api';

export interface Invoice {
    id: number; invoice_number: string; amount_due: number; amount_paid: number;
    balance: number; status: 'paid' | 'partial' | 'unpaid'; due_date: string;
    student?: { full_name: string };
}

export interface Payment {
    id: number; reference: string; amount: number; status: 'pending' | 'verified' | 'rejected';
    payment_method: string; created_at: string;
    invoice?: { invoice_number: string };
}

export function useFees(params: Record<string, string> = {}) {
    const q = new URLSearchParams(params).toString();
    return useQuery({
        queryKey: ['fees', params],
        queryFn: () => get<any>(`/finance/fees${q ? `?${q}` : ''}`),
    });
}

export function useInvoices(params: Record<string, string> = {}) {
    const q = new URLSearchParams(params).toString();
    return useQuery({
        queryKey: ['invoices', params],
        queryFn: () => get<{ data: Invoice[]; summary?: any }>(`/finance/invoices${q ? `?${q}` : ''}`),
    });
}

export function useCreateInvoice() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => post('/finance/invoices', data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['invoices'] }),
    });
}

export function usePayments(params: Record<string, string> = {}) {
    const q = new URLSearchParams(params).toString();
    return useQuery({
        queryKey: ['payments', params],
        queryFn: () => get<{ data: Payment[] }>(`/finance/payments${q ? `?${q}` : ''}`),
    });
}

export function useCreatePayment() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => post('/finance/payments', data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['payments'] });
            qc.invalidateQueries({ queryKey: ['invoices'] });
        },
    });
}

export function useVerifyPayment() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => post(`/finance/payments/${id}/verify`, {}),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['payments'] }),
    });
}

export function usePaymentReceipt(id: number) {
    return useQuery({
        queryKey: ['payment-receipt', id],
        queryFn: () => get<any>(`/finance/payments/${id}/receipt`),
        enabled: !!id,
    });
}
