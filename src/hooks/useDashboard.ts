import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, put, del } from '@/lib/api';

export function useDashboard() {
    return useQuery({
        queryKey: ['dashboard'],
        queryFn: () => get<any>('/dashboard'),
    });
}

export function useUpdateProfile() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => put('/auth/profile', data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['me'] }),
    });
}

export function useChangePassword() {
    return useMutation({
        mutationFn: (data: { current_password: string; password: string; password_confirmation: string }) =>
            post('/auth/change-password', data),
    });
}
