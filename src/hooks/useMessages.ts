import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, del } from '@/lib/api';

export interface Message {
    id: number;
    subject?: string;
    body: string;
    is_read: boolean;
    created_at: string;
    sender: { id: number; name: string };
    replies?: Message[];
    attachment?: string;
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
        mutationFn: (data: { recipient_id: number; subject?: string; body: string; parent_id?: number; attachment?: File }) => {
            const formData = new FormData();
            formData.append('recipient_id', String(data.recipient_id));
            if (data.subject) formData.append('subject', data.subject);
            formData.append('body', data.body);
            if (data.parent_id) formData.append('parent_id', String(data.parent_id));
            if (data.attachment) formData.append('attachment', data.attachment);
            return post<Message>('/messages', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
        },
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
