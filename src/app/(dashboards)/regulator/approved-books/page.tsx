"use client";
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Table, type Column } from "@/components/ui/Table";
import { Plus, Download, Pencil, Trash2, BookMarked } from "lucide-react";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  useApprovedBooks,
  useCreateApprovedBook,
  useUpdateApprovedBook,
  useDeleteApprovedBook,
  type ApprovedBook,
} from "@/hooks/useRegulatoryResources";

interface BookRow extends ApprovedBook, Record<string, unknown> {}

// ── Modal ─────────────────────────────────────────────────────────────────────

function BookModal({
  open,
  onClose,
  existing,
}: {
  open: boolean;
  onClose: () => void;
  existing?: ApprovedBook;
}) {
  const [title, setTitle] = useState(existing?.title ?? "");
  const [author, setAuthor] = useState(existing?.author ?? "");
  const [publisher, setPublisher] = useState(existing?.publisher ?? "");
  const [isbn, setIsbn] = useState(existing?.isbn ?? "");
  const [subject, setSubject] = useState(existing?.subject_name ?? "");
  const [session, setSession] = useState(existing?.academic_session ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [isPublished, setPublished] = useState(existing?.is_published ?? true);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [ebookFile, setEbookFile] = useState<File | null>(null);

  const createMutation = useCreateApprovedBook();
  const updateMutation = useUpdateApprovedBook(existing?.id ?? 0);
  const isLoading = createMutation.isPending || updateMutation.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim()) {
      toast.error("Subject name is required.");
      return;
    }

    const fd = new FormData();
    fd.append("title", title);
    fd.append("author", author);
    fd.append("publisher", publisher);
    fd.append("isbn", isbn);
    fd.append("subject_name", subject);
    fd.append("description", description);
    if (session) fd.append("academic_session", session);
    fd.append("is_published", isPublished ? "1" : "0");
    if (coverFile) fd.append("cover", coverFile);
    if (ebookFile) {
      fd.append("file", ebookFile);
      fd.append("is_ebook", "1");
    }

    try {
      if (existing) {
        await updateMutation.mutateAsync(fd);
        toast.success("Book updated.");
      } else {
        await createMutation.mutateAsync(fd);
        toast.success("Book added.");
      }
      onClose();
    } catch {
      toast.error("Failed to save book.");
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={existing ? "Edit Book" : "Add Approved Book"}
    >
      <form
        onSubmit={handleSubmit}
        className="space-y-4 max-h-[70vh] overflow-y-auto pr-1"
      >
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">
              Book Title *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Author</label>
            <Input value={author} onChange={(e) => setAuthor(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Publisher</label>
            <Input
              value={publisher}
              onChange={(e) => setPublisher(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">ISBN</label>
            <Input value={isbn} onChange={(e) => setIsbn(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Subject *</label>
            <Input
              placeholder="e.g. Mathematics"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-1">
              Academic Session
            </label>
            <Input
              placeholder="e.g. 2025/2026"
              value={session}
              onChange={(e) => setSession(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Cover Image (JPG/PNG/WebP · max 2 MB)
          </label>
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            onChange={(e) => setCoverFile(e.target.files?.[0] ?? null)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            E-Book File (PDF/EPUB · max 50 MB) — optional, makes book available
            in E-Library
          </label>
          <input
            type="file"
            accept=".pdf,.epub"
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            onChange={(e) => setEbookFile(e.target.files?.[0] ?? null)}
          />
          {existing?.is_ebook && !ebookFile && (
            <p className="mt-1 text-xs text-green-600">
              ✓ E-book file already attached.
            </p>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setPublished(e.target.checked)}
            className="rounded"
          />
          Publish immediately
        </label>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving…" : existing ? "Update" : "Add Book"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ApprovedBooksPage() {
  const [search, setSearch] = useState("");
  const [subjectFilter, setSubject] = useState("");
  const [ebookFilter, setEbook] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<ApprovedBook | undefined>();

  const params: Record<string, string> = {};
  if (search) params.search = search;
  if (subjectFilter) params.subject_name = subjectFilter;
  if (ebookFilter) params.is_ebook = ebookFilter;

  const { data, isLoading } = useApprovedBooks(params);
  const deleteMutation = useDeleteApprovedBook();

  async function handleDelete(id: number) {
    if (!confirm("Remove this book?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Book removed.");
    } catch {
      toast.error("Failed to remove book.");
    }
  }

  const columns: Column<BookRow>[] = [
    {
      key: "title",
      header: "Book",
      render: (r) => (
        <div className="flex items-center gap-3">
          {r.cover_url ? (
            <img
              src={r.cover_url}
              alt={r.title}
              className="h-10 w-8 object-cover rounded shadow-sm"
            />
          ) : (
            <div className="h-10 w-8 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
              <BookMarked className="h-4 w-4 text-gray-400" />
            </div>
          )}
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {r.title}
            </p>
            {r.author && <p className="text-xs text-gray-500">{r.author}</p>}
          </div>
        </div>
      ),
    },
    {
      key: "subject_name",
      header: "Subject",
      render: (r) => <Badge variant="info">{r.subject_name}</Badge>,
    },
    {
      key: "academic_session",
      header: "Session",
      render: (r) => (
        <span className="text-sm">{r.academic_session ?? "—"}</span>
      ),
    },
    {
      key: "is_ebook",
      header: "E-Book",
      render: (r) =>
        r.is_ebook ? (
          <Badge variant="success">Yes</Badge>
        ) : (
          <span className="text-gray-400 text-sm">—</span>
        ),
    },
    {
      key: "is_published",
      header: "Status",
      render: (r) =>
        r.is_published ? (
          <Badge variant="success">Published</Badge>
        ) : (
          <Badge variant="warning">Draft</Badge>
        ),
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <div className="flex items-center gap-2 justify-end">
          {r.file_url && (
            <a
              href={r.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800"
              title="Download e-book"
            >
              <Download className="h-4 w-4" />
            </a>
          )}
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => {
              setEditing(r as ApprovedBook);
              setShowModal(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            className="text-red-500 hover:text-red-700"
            onClick={() => handleDelete(r.id)}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const rows = (data?.data ?? []) as BookRow[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookMarked className="h-6 w-6 text-indigo-600" /> Approved Books
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage state-approved books per subject. Books with an e-book file
            appear in the E-Library.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(undefined);
            setShowModal(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1" /> Add Book
        </Button>
      </div>

      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search title, author…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-56"
        />
        <Input
          placeholder="Filter by subject"
          value={subjectFilter}
          onChange={(e) => setSubject(e.target.value)}
          className="w-48"
        />
        <select
          className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={ebookFilter}
          onChange={(e) => setEbook(e.target.value)}
        >
          <option value="">All Books</option>
          <option value="1">E-Books only</option>
          <option value="0">Print only</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table columns={columns} data={rows} loading={isLoading} />
        </CardContent>
      </Card>

      {showModal && (
        <BookModal
          open={showModal}
          onClose={() => {
            setShowModal(false);
            setEditing(undefined);
          }}
          existing={editing}
        />
      )}
    </div>
  );
}
