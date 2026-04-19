import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, patch, del } from '@/lib/api';
import { BlogPost, BlogCategory } from '@/types';

// ─── Paginated wrapper ─────────────────────────────────────────────────────────
export interface PaginatedBlogPosts {
    data: BlogPost[];
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
}

// ─── Public Hooks ──────────────────────────────────────────────────────────────

/** List published posts (public) */
export function usePublicBlogPosts(category?: BlogCategory, q?: string) {
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (q) params.set('q', q);
    const qs = params.toString() ? `?${params.toString()}` : '';

    return useQuery({
        queryKey: ['blog-posts', 'public', category, q],
        queryFn: () => get<PaginatedBlogPosts>(`/blog${qs}`),
        staleTime: 2 * 60_000,
    });
}

/** Single published post by slug (public) */
export function useBlogPost(slug: string) {
    return useQuery({
        queryKey: ['blog-post', slug],
        queryFn: () => get<BlogPost>(`/blog/${slug}`),
        enabled: Boolean(slug),
        staleTime: 5 * 60_000,
    });
}

// ─── Admin Hooks ───────────────────────────────────────────────────────────────

/** List ALL posts — drafts + published (admin) */
export function useAdminBlogPosts() {
    return useQuery({
        queryKey: ['blog-posts', 'admin'],
        queryFn: () => get<PaginatedBlogPosts>('/admin/blog'),
    });
}

export interface BlogPostPayload {
    title: string;
    slug?: string;
    excerpt?: string;
    body: string;
    category: BlogCategory;
    source_url?: string;
    source_credit?: string;
    is_published?: boolean;
}

export function useCreateBlogPost() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: BlogPostPayload) =>
            post<BlogPost>('/admin/blog', payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['blog-posts'] });
        },
    });
}

export function useUpdateBlogPost() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }: { id: number; payload: Partial<BlogPostPayload> }) =>
            patch<BlogPost>(`/admin/blog/${id}`, payload),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['blog-posts'] });
        },
    });
}

export function useDeleteBlogPost() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => del(`/admin/blog/${id}`),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['blog-posts'] });
        },
    });
}
