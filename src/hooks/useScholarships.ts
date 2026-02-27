import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, put, del } from '@/lib/api';

export interface ScholarshipItem { id: number; category: string; description: string; amount: number; }
export interface Scholarship {
    id: number; name: string; description: string; total_amount: number; students_count: number;
    items: ScholarshipItem[];
}

export function useScholarships() {
    return useQuery({
        queryKey: ['scholarships'],
        queryFn: () => get<{ data: Scholarship[] }>('/scholarships'),
    });
}

export function useScholarship(id: number) {
    return useQuery({
        queryKey: ['scholarships', id],
        queryFn: () => get<Scholarship>(`/scholarships/${id}`),
        enabled: !!id,
    });
}

export function useCreateScholarship() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => post<Scholarship>('/scholarships', data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['scholarships'] }),
    });
}

export function useUpdateScholarship(id: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<Scholarship>) => put<Scholarship>(`/scholarships/${id}`, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['scholarships'] }),
    });
}

export function useDeleteScholarship() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => del(`/scholarships/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['scholarships'] }),
    });
}

export function useSponsoredStudents() {
    return useQuery({
        queryKey: ['sponsored-students'],
        queryFn: () => get<{ data: any[] }>('/sponsor/students'),
    });
}

export function useSponsorStudent() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: { student_id: number; scholarship_id: number }) =>
            post('/sponsor/students', data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['sponsored-students'] });
            qc.invalidateQueries({ queryKey: ['scholarships'] });
        },
    });
}
