import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, del } from '@/lib/api';

export interface Message {
    id: number; subject?: string; body: string; is_read: boolean; created_at: string;
    sender: { id: number; name: string };
    replies?: Message[];
}

export function useMessages(params: Record<string, string> = {}) {
    const q = new URLSearchParams(params).toString();
    return useQuery({
        queryKey: ['messages', params],
        queryFn: () => get<{ data: Message[] }>(`/messages${q ? `?${q}` : ''}`),
    });
}

export function useMessage(id: number) {
    return useQuery({
        queryKey: ['messages', id],
        queryFn: () => get<Message>(`/messages/${id}`),
        enabled: !!id,
    });
}

export function useUnreadCount() {
    return useQuery({
        queryKey: ['messages-unread'],
        queryFn: () => get<{ count: number }>('/messages/unread-count'),
        refetchInterval: 30_000,
    });
}

export function useSendMessage() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: { recipient_id: number; subject?: string; body: string; parent_id?: number }) =>
            post<Message>('/messages', data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['messages'] });
            qc.invalidateQueries({ queryKey: ['messages-unread'] });
        },
    });
}

export function useMarkMessageRead() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => post(`/messages/${id}/read`, {}),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['messages'] });
            qc.invalidateQueries({ queryKey: ['messages-unread'] });
        },
    });
}

export function useDeleteMessage() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => del(`/messages/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['messages'] }),
    });
}
