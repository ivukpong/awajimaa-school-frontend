import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";

export interface NotificationItem {
    id: number;
    title: string;
    body: string;
    type: string;
    channel: string;
    is_read: boolean;
    read_at: string | null;
    data: Record<string, unknown> | null;
    created_at: string;
}

export function useUnreadCount() {
    return useQuery({
        queryKey: ["notifications", "unread-count"],
        queryFn: () =>
            api
                .get<{ count: number }>("/notifications/unread-count")
                .then((r) => r.data),
        refetchInterval: 30_000,
    });
}

export function useNotifications() {
    return useQuery({
        queryKey: ["notifications"],
        queryFn: () =>
            api
                .get<{ data: NotificationItem[] }>("/notifications")
                .then((r) => r.data),
    });
}

export function useMarkAllRead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: () => api.post("/notifications/read-all", {}).then((r) => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
        },
    });
}

export function useMarkRead() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) =>
            api.patch(`/notifications/${id}/read`, {}).then((r) => r.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
            queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
        },
    });
}
