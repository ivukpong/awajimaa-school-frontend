import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, put, del } from '@/lib/api';

export interface Meeting {
    id: number; title: string; description?: string; platform: string; link?: string;
    scheduled_at: string; audience: string[]; status: string;
    host?: { name: string };
    my_status?: string;
}

export function useMeetings(params: Record<string, string> = {}) {
    const q = new URLSearchParams(params).toString();
    return useQuery({
        queryKey: ['meetings', params],
        queryFn: () => get<{ data: Meeting[] }>(`/meetings${q ? `?${q}` : ''}`),
    });
}

export function useMeeting(id: number) {
    return useQuery({
        queryKey: ['meetings', id],
        queryFn: () => get<Meeting>(`/meetings/${id}`),
        enabled: !!id,
    });
}

export function useCreateMeeting() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Meeting>) => post<Meeting>('/meetings', data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['meetings'] }),
    });
}

export function useUpdateMeeting(id: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Meeting>) => put<Meeting>(`/meetings/${id}`, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['meetings'] }),
    });
}

export function useDeleteMeeting() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => del(`/meetings/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['meetings'] }),
    });
}

export function useRespondToMeeting() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, response }: { id: number; response: 'accept' | 'decline' }) =>
            post(`/meetings/${id}/${response}`, {}),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['meetings'] }),
    });
}
