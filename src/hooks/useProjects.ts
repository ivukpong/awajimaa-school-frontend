import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, patch, del } from "@/lib/api";

export type ProjectStatus = "planning" | "in_progress" | "completed" | "on_hold";
export type ProjectPriority = "low" | "medium" | "high";

export interface SchoolProject {
    id: number;
    school_id: number;
    branch_id: number | null;
    title: string;
    description: string | null;
    status: ProjectStatus;
    priority: ProjectPriority;
    budget: number;
    spent: number;
    start_date: string | null;
    end_date: string | null;
    created_by: number;
    branch: { id: number; name: string } | null;
    creator: { id: number; name: string };
    created_at: string;
}

export function useProjects(filters?: { status?: string; priority?: string }) {
    const params = new URLSearchParams();
    if (filters?.status) params.set("status", filters.status);
    if (filters?.priority) params.set("priority", filters.priority);
    const query = params.toString() ? `?${params.toString()}` : "";

    return useQuery({
        queryKey: ["school-projects", filters],
        queryFn: () => get<{ data: SchoolProject[] }>(`/school-projects${query}`),
    });
}

export function useCreateProject() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<SchoolProject>) =>
            post<SchoolProject>("/school-projects", data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["school-projects"] }),
    });
}

export function useUpdateProject() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, ...data }: Partial<SchoolProject> & { id: number }) =>
            patch<SchoolProject>(`/school-projects/${id}`, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["school-projects"] }),
    });
}

export function useDeleteProject() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => del(`/school-projects/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ["school-projects"] }),
    });
}
