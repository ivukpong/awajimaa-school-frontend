import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, put, del } from '@/lib/api';

export interface School {
    id: number; name: string; slug: string; type: string; ownership: string;
    address: string; state?: { name: string }; lga?: { name: string }; is_active: boolean;
}

export function useSchools(params: Record<string, string> = {}) {
    const q = new URLSearchParams(params).toString();
    return useQuery({
        queryKey: ['schools', params],
        queryFn: () => get<{ data: School[]; meta: any }>(`/schools${q ? `?${q}` : ''}`),
    });
}

export function useSchool(id: number | string) {
    return useQuery({
        queryKey: ['schools', id],
        queryFn: () => get<School>(`/schools/${id}`),
        enabled: !!id,
    });
}

export function useCreateSchool() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<School>) => post<School>('/schools', data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['schools'] }),
    });
}

export function useUpdateSchool(id: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<School>) => put<School>(`/schools/${id}`, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['schools'] }),
    });
}

export function useDeleteSchool() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => del(`/schools/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['schools'] }),
    });
}
