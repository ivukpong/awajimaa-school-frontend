import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, put, del } from '@/lib/api';

export interface Student {
    id: number; full_name: string; admission_number: string; public_token: string;
    gender: string; date_of_birth: string; is_active: boolean;
    class_room?: { id: number; name: string };
    school?: { id: number; name: string };
}

export function useStudents(params: Record<string, string> = {}) {
    const q = new URLSearchParams(params).toString();
    return useQuery({
        queryKey: ['students', params],
        queryFn: () => get<{ data: Student[]; meta: any }>(`/students${q ? `?${q}` : ''}`),
    });
}

export function useStudent(id: number | string) {
    return useQuery({
        queryKey: ['students', id],
        queryFn: () => get<Student>(`/students/${id}`),
        enabled: !!id,
    });
}

export function usePublicStudent(token: string) {
    return useQuery({
        queryKey: ['public-student', token],
        queryFn: () => get<any>(`/s/${token}`),
        enabled: !!token,
    });
}

export function useCreateStudent() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Student>) => post<Student>('/students', data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }),
    });
}

export function useUpdateStudent(id: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Student>) => put<Student>(`/students/${id}`, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }),
    });
}

export function useDeleteStudent() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => del(`/students/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['students'] }),
    });
}

export function useStudentResults(id: number) {
    return useQuery({
        queryKey: ['student-results', id],
        queryFn: () => get<any>(`/students/${id}/results`),
        enabled: !!id,
    });
}

export function useStudentAttendance(id: number) {
    return useQuery({
        queryKey: ['student-attendance', id],
        queryFn: () => get<any>(`/students/${id}/attendance`),
        enabled: !!id,
    });
}
