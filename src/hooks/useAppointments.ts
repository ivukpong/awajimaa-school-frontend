import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, del, patch } from '@/lib/api';

export interface Appointment {
    id: number;
    bookable_type?: string;
    bookable_id?: number;
    booker_id: number;
    title: string;
    description?: string;
    appointment_date: string;
    start_time: string;
    end_time: string;
    type: 'in_person' | 'virtual';
    location?: string;
    meeting_url?: string;
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'rescheduled';
    cancel_reason?: string;
    notes?: string;
    reminder_sent_at?: string;
    booker?: { id: number; name: string; email: string };
    bookable?: { id: number; name: string };
    created_at: string;
}

export interface AppointmentParams {
    school_id?: number;
    ministry_id?: number;
    status?: string;
    page?: number;
}

export function useAppointments(params: AppointmentParams = {}) {
    const q = new URLSearchParams(
        Object.fromEntries(Object.entries(params).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)]))
    ).toString();
    return useQuery({
        queryKey: ['appointments', params],
        queryFn: () => get<{ data: Appointment[]; meta?: unknown }>(`/appointments${q ? `?${q}` : ''}`),
    });
}

export function useAppointment(id: number) {
    return useQuery({
        queryKey: ['appointments', id],
        queryFn: () => get<Appointment>(`/appointments/${id}`),
        enabled: !!id,
    });
}

export function useCreateAppointment() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Appointment>) => post<Appointment>('/appointments', data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
    });
}

export function useUpdateAppointment() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }: Partial<Appointment> & { id: number }) =>
            patch<Appointment>(`/appointments/${id}`, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
    });
}

export function useDeleteAppointment() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => del(`/appointments/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
    });
}

export function useConfirmAppointment() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => post<Appointment>(`/appointments/${id}/confirm`, {}),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
    });
}

export function useCancelAppointment() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, cancel_reason }: { id: number; cancel_reason: string }) =>
            post<Appointment>(`/appointments/${id}/cancel`, { cancel_reason }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
    });
}

export function useRescheduleAppointment() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({
            id,
            appointment_date,
            start_time,
            end_time,
        }: {
            id: number;
            appointment_date: string;
            start_time: string;
            end_time: string;
        }) => post<Appointment>(`/appointments/${id}/reschedule`, { appointment_date, start_time, end_time }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['appointments'] }),
    });
}
