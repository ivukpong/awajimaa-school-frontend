import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, del } from '@/lib/api';

export interface PickupCode {
    id: number; code: string; guardian_name: string; guardian_phone: string;
    is_used: boolean; expires_at: string; revoked_at?: string;
    student?: { full_name: string };
}

export function usePickupCodes(studentId?: number) {
    return useQuery({
        queryKey: ['pickup-codes', studentId],
        queryFn: () => get<{ data: PickupCode[] }>(`/pickup-codes${studentId ? `?student_id=${studentId}` : ''}`),
    });
}

export function useCreatePickupCode() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: { student_id: number; guardian_name: string; guardian_phone: string; expires_at: string }) =>
            post<{ code: PickupCode; otp: string }>('/pickup-codes', data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['pickup-codes'] }),
    });
}

export function useVerifyPickupCode() {
    return useMutation({
        mutationFn: (data: { code: string; otp: string }) => post('/pickup-codes/verify', data),
    });
}

export function useRevokePickupCode() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => post(`/pickup-codes/${id}/revoke`, {}),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['pickup-codes'] }),
    });
}
