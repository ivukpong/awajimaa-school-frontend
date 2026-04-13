import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, put, del } from '@/lib/api';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Curriculum {
    id: number;
    title: string;
    description?: string;
    academic_session: string;
    term: 'first' | 'second' | 'third' | 'full_year';
    school_types?: string[];
    class_levels?: string[];
    file_url: string;
    file_name: string;
    mime_type?: string;
    file_size?: number;
    is_published: boolean;
    created_at: string;
    regulator?: { id: number; name: string };
    state?: { id: number; name: string };
    lga?: { id: number; name: string } | null;
}

export interface AcademicCalendar {
    id: number;
    title: string;
    description?: string;
    academic_session: string;
    term: 'first' | 'second' | 'third' | 'full_year';
    start_date?: string;
    end_date?: string;
    school_types?: string[];
    file_url?: string;
    file_name?: string;
    mime_type?: string;
    file_size?: number;
    is_published: boolean;
    created_at: string;
    regulator?: { id: number; name: string };
    state?: { id: number; name: string };
    lga?: { id: number; name: string } | null;
}

export interface ApprovedBook {
    id: number;
    title: string;
    author?: string;
    isbn?: string;
    publisher?: string;
    description?: string;
    subject_name: string;
    class_levels?: string[];
    school_types?: string[];
    academic_session?: string;
    cover_url?: string;
    file_url?: string;
    file_name?: string;
    mime_type?: string;
    file_size?: number;
    is_ebook: boolean;
    is_published: boolean;
    created_at: string;
    regulator?: { id: number; name: string };
    state?: { id: number; name: string };
    lga?: { id: number; name: string } | null;
}

// ── Curriculum ────────────────────────────────────────────────────────────────

export function useCurricula(params: Record<string, string> = {}) {
    const q = new URLSearchParams(params).toString();
    return useQuery({
        queryKey: ['curricula', params],
        queryFn: () => get<{ data: Curriculum[] }>(`/curricula${q ? `?${q}` : ''}`),
    });
}

export function useCreateCurriculum() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (formData: FormData) =>
            post<Curriculum>('/curricula', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['curricula'] }),
    });
}

export function useUpdateCurriculum(id: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (formData: FormData) =>
            put<Curriculum>(`/curricula/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['curricula'] }),
    });
}

export function useDeleteCurriculum() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => del(`/curricula/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['curricula'] }),
    });
}

// ── Academic Calendars ────────────────────────────────────────────────────────

export function useAcademicCalendars(params: Record<string, string> = {}) {
    const q = new URLSearchParams(params).toString();
    return useQuery({
        queryKey: ['academic-calendars', params],
        queryFn: () => get<{ data: AcademicCalendar[] }>(`/academic-calendars${q ? `?${q}` : ''}`),
    });
}

export function useCreateAcademicCalendar() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (formData: FormData) =>
            post<AcademicCalendar>('/academic-calendars', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['academic-calendars'] }),
    });
}

export function useUpdateAcademicCalendar(id: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (formData: FormData) =>
            put<AcademicCalendar>(`/academic-calendars/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['academic-calendars'] }),
    });
}

export function useDeleteAcademicCalendar() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => del(`/academic-calendars/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['academic-calendars'] }),
    });
}

// ── Approved Books & E-Library ────────────────────────────────────────────────

export function useApprovedBooks(params: Record<string, string> = {}) {
    const q = new URLSearchParams(params).toString();
    return useQuery({
        queryKey: ['approved-books', params],
        queryFn: () => get<{ data: ApprovedBook[] }>(`/approved-books${q ? `?${q}` : ''}`),
    });
}

export function useELibrary(params: Record<string, string> = {}) {
    const q = new URLSearchParams(params).toString();
    return useQuery({
        queryKey: ['e-library', params],
        queryFn: () => get<{ data: ApprovedBook[] }>(`/e-library${q ? `?${q}` : ''}`),
    });
}

export function useCreateApprovedBook() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (formData: FormData) =>
            post<ApprovedBook>('/approved-books', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['approved-books'] });
            qc.invalidateQueries({ queryKey: ['e-library'] });
        },
    });
}

export function useUpdateApprovedBook(id: number) {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (formData: FormData) =>
            put<ApprovedBook>(`/approved-books/${id}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['approved-books'] });
            qc.invalidateQueries({ queryKey: ['e-library'] });
        },
    });
}

export function useDeleteApprovedBook() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => del(`/approved-books/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['approved-books'] });
            qc.invalidateQueries({ queryKey: ['e-library'] });
        },
    });
}
