"use client";

import React, { useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  X,
  Loader2,
  Newspaper,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table, Column } from "@/components/ui/Table";
import {
  useAdminBlogPosts,
  useCreateBlogPost,
  useUpdateBlogPost,
  useDeleteBlogPost,
  type BlogPostPayload,
} from "@/hooks/useBlog";
import { BlogPost, BlogCategory } from "@/types";
import toast from "react-hot-toast";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CATEGORIES: BlogCategory[] = [
  "education",
  "achievement",
  "innovation",
  "policy",
  "event",
];

const CATEGORY_BADGE: Record<
  BlogCategory,
  "green" | "blue" | "purple" | "yellow" | "gray"
> = {
  achievement: "green",
  education: "blue",
  innovation: "purple",
  policy: "yellow",
  event: "gray",
};

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Create / Edit Modal ──────────────────────────────────────────────────────

const EMPTY: BlogPostPayload = {
  title: "",
  excerpt: "",
  body: "",
  category: "education",
  source_url: "",
  source_credit: "",
  is_published: false,
};

function PostModal({
  post,
  onClose,
}: {
  post?: BlogPost | null;
  onClose: () => void;
}) {
  const isEdit = Boolean(post);
  const [form, setForm] = useState<BlogPostPayload>(
    post
      ? {
          title: post.title,
          excerpt: post.excerpt ?? "",
          body: post.body,
          category: post.category,
          source_url: post.source_url ?? "",
          source_credit: post.source_credit ?? "",
          is_published: post.is_published,
        }
      : EMPTY,
  );

  const create = useCreateBlogPost();
  const update = useUpdateBlogPost();
  const busy = create.isPending || update.isPending;

  function set(k: keyof BlogPostPayload, v: unknown) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      toast.error("Title and body are required.");
      return;
    }
    try {
      if (isEdit && post) {
        await update.mutateAsync({ id: post.id, payload: form });
        toast.success("Post updated.");
      } else {
        await create.mutateAsync(form);
        toast.success("Post created.");
      }
      onClose();
    } catch {
      toast.error("Failed to save post.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="font-semibold text-gray-900 text-lg">
            {isEdit ? "Edit Post" : "New Blog Post"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-4"
        >
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="Post title"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={form.category}
              onChange={(e) => set("category", e.target.value as BlogCategory)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Excerpt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Excerpt
            </label>
            <textarea
              rows={2}
              value={form.excerpt}
              onChange={(e) => set("excerpt", e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
              placeholder="Short summary (shown in listing cards)"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Body <span className="text-red-500">*</span>
            </label>
            <textarea
              rows={10}
              value={form.body}
              onChange={(e) => set("body", e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-y font-mono"
              placeholder="Full article content (HTML supported)"
            />
          </div>

          {/* Source URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source URL
            </label>
            <input
              type="url"
              value={form.source_url}
              onChange={(e) => set("source_url", e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="https://…"
            />
          </div>

          {/* Source Credit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Source Credit
            </label>
            <input
              value={form.source_credit}
              onChange={(e) => set("source_credit", e.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              placeholder="e.g. Alex Onyia (@winexviv)"
            />
          </div>

          {/* Published toggle */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => set("is_published", e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Publish immediately
            </span>
          </label>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t">
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit as unknown as React.MouseEventHandler}
            disabled={busy}
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Create Post"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({
  post,
  onClose,
}: {
  post: BlogPost;
  onClose: () => void;
}) {
  const del = useDeleteBlogPost();

  async function handleDelete() {
    try {
      await del.mutateAsync(post.id);
      toast.success("Post deleted.");
      onClose();
    } catch {
      toast.error("Failed to delete post.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-xl p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Delete Post?</h3>
        <p className="text-sm text-gray-500">
          &ldquo;{post.title}&rdquo; will be permanently deleted.
        </p>
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={del.isPending}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            disabled={del.isPending}
          >
            {del.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              "Delete"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminBlogPage() {
  const { data, isLoading } = useAdminBlogPosts();
  const update = useUpdateBlogPost();

  const [modal, setModal] = useState<"create" | "edit" | "delete" | null>(null);
  const [selected, setSelected] = useState<BlogPost | null>(null);

  const posts: BlogPost[] = data?.data?.data ?? [];

  async function togglePublish(post: BlogPost) {
    try {
      await update.mutateAsync({
        id: post.id,
        payload: { is_published: !post.is_published },
      });
      toast.success(
        post.is_published ? "Post unpublished." : "Post published.",
      );
    } catch {
      toast.error("Failed to update post.");
    }
  }

  const columns: Column<BlogPost>[] = [
    {
      key: "title",
      header: "Title",
      render: (p) => (
        <div className="max-w-xs">
          <p className="font-medium text-gray-900 line-clamp-1 text-sm">
            {p.title}
          </p>
          {p.source_credit && (
            <p className="text-xs text-gray-400 mt-0.5">
              Credit: {p.source_credit}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (p) => (
        <Badge variant={CATEGORY_BADGE[p.category]}>
          {p.category.charAt(0).toUpperCase() + p.category.slice(1)}
        </Badge>
      ),
    },
    {
      key: "is_published",
      header: "Status",
      render: (p) => (
        <Badge variant={p.is_published ? "green" : "gray"}>
          {p.is_published ? "Published" : "Draft"}
        </Badge>
      ),
    },
    {
      key: "published_at",
      header: "Published",
      render: (p) => (
        <span className="text-sm text-gray-500">
          {formatDate(p.published_at)}
        </span>
      ),
    },
    {
      key: "id",
      header: "Actions",
      render: (p) => (
        <div className="flex items-center gap-2">
          <button
            title={p.is_published ? "Unpublish" : "Publish"}
            onClick={() => togglePublish(p)}
            className="text-gray-400 hover:text-indigo-600 transition"
          >
            {p.is_published ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          <button
            title="Edit"
            onClick={() => {
              setSelected(p);
              setModal("edit");
            }}
            className="text-gray-400 hover:text-blue-600 transition"
          >
            <Pencil size={16} />
          </button>
          <button
            title="Delete"
            onClick={() => {
              setSelected(p);
              setModal("delete");
            }}
            className="text-gray-400 hover:text-red-600 transition"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Newspaper className="h-6 w-6 text-indigo-600" />
          <h1 className="text-xl font-bold text-gray-900">Blog &amp; News</h1>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setSelected(null);
            setModal("create");
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          New Post
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
            </div>
          ) : (
            <Table<BlogPost>
              data={posts}
              columns={columns}
              keyField="id"
              emptyMessage="No blog posts yet. Create your first post!"
            />
          )}
        </CardContent>
      </Card>

      {/* Modals */}
      {(modal === "create" || modal === "edit") && (
        <PostModal
          post={modal === "edit" ? selected : null}
          onClose={() => {
            setModal(null);
            setSelected(null);
          }}
        />
      )}

      {modal === "delete" && selected && (
        <DeleteConfirm
          post={selected}
          onClose={() => {
            setModal(null);
            setSelected(null);
          }}
        />
      )}
    </div>
  );
}
