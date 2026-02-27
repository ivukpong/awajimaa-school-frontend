import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, put, del } from '@/lib/api';

export interface Announcement {
  id: number; title: string; body: string; audience: string[];
  is_published: boolean; published_at?: string;
  author?: { name: string };
}

export interface Course {
  id: number; title: string; description: string; is_published: boolean;
  teacher?: { name: string }; lessons_count?: number; progress_pct?: number;
}

export interface Lesson {
  id: number; title: string; type: string; order: number; content?: string;
  progress?: { completed_at: string | null };
}

// Announcements
export function useAnnouncements(params: Record<string, string> = {}) {
  const q = new URLSearchParams(params).toString();
  return useQuery({
    queryKey: ['announcements', params],
    queryFn: () => get<{ data: Announcement[] }>(`/announcements${q ? `?${q}` : ''}`),
  });
}

export function useCreateAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Announcement>) => post<Announcement>('/announcements', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['announcements'] }),
  });
}

export function useDeleteAnnouncement() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => del(`/announcements/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['announcements'] }),
  });
}

// Courses
export function useCourses(params: Record<string, string> = {}) {
  const q = new URLSearchParams(params).toString();
  return useQuery({
    queryKey: ['courses', params],
    queryFn: () => get<{ data: Course[] }>(`/e-learning/courses${q ? `?${q}` : ''}`),
  });
}

export function useCourse(id: number) {
  return useQuery({
    queryKey: ['courses', id],
    queryFn: () => get<Course & { lessons: Lesson[] }>(`/e-learning/courses/${id}`),
    enabled: !!id,
  });
}

export function useCreateCourse() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Course>) => post<Course>('/e-learning/courses', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courses'] }),
  });
}

export function useUpdateCourse(id: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Course>) => put<Course>(`/e-learning/courses/${id}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courses'] }),
  });
}

// Lessons
export function useCreateLesson(courseId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Lesson>) => post<Lesson>('/e-learning/lessons', { ...data, course_id: courseId }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courses', courseId] }),
  });
}

export function useUpdateLessonProgress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, completed }: { id: number; completed: boolean }) =>
      post(`/e-learning/lessons/${id}/progress`, { completed }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['courses'] }),
  });
}
