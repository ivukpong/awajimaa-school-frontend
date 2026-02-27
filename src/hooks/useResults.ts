import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, put, del } from '@/lib/api';

export interface Result {
    id: number; ca1: number; ca2: number; ca3: number; exam: number;
    total: number; grade: string;
    student?: { full_name: string };
    subject?: { name: string };
    term?: { name: string };
    academic_year?: { name: string };
}

export function useResults(params: Record<string, string | number> = {}) {
    const q = new URLSearchParams(Object.entries(params).map(([k, v]) => [k, String(v)])).toString();
    return useQuery({
        queryKey: ['results', params],
        queryFn: () => get<{ data: Result[] }>(`/results${q ? `?${q}` : ''}`),
    });
}

export function useSaveResult() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => post<Result>('/results', data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['results'] }),
    });
}

export function useBatchSaveResults() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: { results: any[] }) => post('/results/batch', payload),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['results'] }),
    });
}

export function useUpdateResult(id: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Result>) => put<Result>(`/results/${id}`, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['results'] }),
    });
}

export function useDeleteResult() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => del(`/results/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['results'] }),
    });
}
