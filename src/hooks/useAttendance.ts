import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, put, del } from '@/lib/api';

export interface Attendance {
    id: number; date: string; status: 'present' | 'absent' | 'late';
    student?: { full_name: string };
    marked_by?: { name: string };
}

export function useAttendance(params: Record<string, string> = {}) {
    const q = new URLSearchParams(params).toString();
    return useQuery({
        queryKey: ['attendance', params],
        queryFn: () => get<{ data: Attendance[] }>(`/attendance${q ? `?${q}` : ''}`),
    });
}

export function useMarkAttendance() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => post('/attendance', data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['attendance'] }),
    });
}

export function useBatchMarkAttendance() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: { class_room_id: number; date: string; records: any[] }) =>
            post('/attendance/batch', payload),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['attendance'] }),
    });
}

export function useUpdateAttendance(id: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: { status: string }) => put(`/attendance/${id}`, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['attendance'] }),
    });
}
