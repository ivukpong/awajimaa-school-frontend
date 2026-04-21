import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { get, post, del } from '@/lib/api';
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
        queryFn: () => get<BlogPost>(`/blog/${encodeURIComponent(slug)}`),
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
    cover_image?: File | null;
    source_url?: string;
    source_credit?: string;
    is_published?: boolean;
}

// Build multipart/form-data so file uploads work.
// For boolean values we convert to '1'/'0' since FormData only carries strings.
function buildFormData(payload: Partial<BlogPostPayload>): FormData {
    const fd = new FormData();
    (Object.keys(payload) as (keyof BlogPostPayload)[]).forEach((key) => {
        const val = payload[key];
        if (key === 'cover_image') {
            if (val instanceof File) fd.append('cover_image', val);
        } else if (val !== undefined && val !== null && val !== '') {
            fd.append(key, typeof val === 'boolean' ? (val ? '1' : '0') : String(val));
        }
    });
    return fd;
}

export function useCreateBlogPost() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (payload: BlogPostPayload) =>
            post<BlogPost>('/admin/blog', buildFormData(payload)),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['blog-posts'] });
        },
    });
}

export function useUpdateBlogPost() {
    const qc = useQueryClient();
    return useMutation({
        // PHP does not parse multipart bodies for PATCH, so we POST with _method spoofing.
        mutationFn: ({ id, payload }: { id: number; payload: Partial<BlogPostPayload> }) => {
            const fd = buildFormData(payload);
            fd.append('_method', 'PATCH');
            return post<BlogPost>(`/admin/blog/${id}`, fd);
        },
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
