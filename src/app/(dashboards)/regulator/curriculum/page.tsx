"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Table, type Column } from "@/components/ui/Table";
import { Plus, Download, Pencil, Trash2, BookOpen } from "lucide-react";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  useCurricula,
  useCreateCurriculum,
  useUpdateCurriculum,
  useDeleteCurriculum,
  type Curriculum,
} from "@/hooks/useRegulatoryResources";

const TERM_LABELS: Record<string, string> = {
  first: "1st Term",
  second: "2nd Term",
  third: "3rd Term",
  full_year: "Full Year",
};

interface CurriculumRow extends Curriculum, Record<string, unknown> {}

// ── Upload / Edit Modal ───────────────────────────────────────────────────────

function CurriculumModal({
  open,
  onClose,
  existing,
}: {
  open: boolean;
  onClose: () => void;
  existing?: Curriculum;
}) {
  const [title, setTitle] = useState(existing?.title ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [session, setSession] = useState(existing?.academic_session ?? "");
  const [term, setTerm] = useState(existing?.term ?? "full_year");
  const [isPublished, setIsPublished] = useState(
    existing?.is_published ?? true,
  );
  const [file, setFile] = useState<File | null>(null);

  const createMutation = useCreateCurriculum();
  const updateMutation = useUpdateCurriculum(existing?.id ?? 0);

  const isLoading = createMutation.isPending || updateMutation.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!existing && !file) {
      toast.error("Please select a curriculum file.");
      return;
    }

    const fd = new FormData();
    fd.append("title", title);
    fd.append("description", description);
    fd.append("academic_session", session);
    fd.append("term", term);
    fd.append("is_published", isPublished ? "1" : "0");
    if (file) fd.append("file", file);

    try {
      if (existing) {
        await updateMutation.mutateAsync(fd);
        toast.success("Curriculum updated.");
      } else {
        await createMutation.mutateAsync(fd);
        toast.success("Curriculum uploaded.");
      }
      onClose();
    } catch {
      toast.error("Failed to save curriculum.");
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={existing ? "Edit Curriculum" : "Upload Curriculum"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Academic Session *
            </label>
            <Input
              placeholder="e.g. 2025/2026"
              value={session}
              onChange={(e) => setSession(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Term *</label>
            <select
              className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={term}
              onChange={(e) => setTerm(e.target.value as Curriculum["term"])}
              required
            >
              {Object.entries(TERM_LABELS).map(([val, label]) => (
                <option key={val} value={val}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Curriculum File {existing ? "(leave blank to keep existing)" : "*"}{" "}
            — PDF, DOC, DOCX · max 20 MB
          </label>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          {existing?.file_name && !file && (
            <p className="mt-1 text-xs text-gray-500">
              Current: {existing.file_name}
            </p>
          )}
        </div>
        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="rounded"
          />
          Publish immediately (schools can see this)
        </label>
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving…" : existing ? "Update" : "Upload"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CurriculumPage() {
  const [search, setSearch] = useState("");
  const [sessionFilter, setSession] = useState("");
  const [termFilter, setTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Curriculum | undefined>();

  const params: Record<string, string> = {};
  if (search) params.search = search;
  if (sessionFilter) params.academic_session = sessionFilter;
  if (termFilter) params.term = termFilter;

  const { data, isLoading } = useCurricula(params);
  const deleteMutation = useDeleteCurriculum();

  function handleEdit(row: Curriculum) {
    setEditing(row);
    setShowModal(true);
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this curriculum? This cannot be undone.")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Curriculum deleted.");
    } catch {
      toast.error("Failed to delete curriculum.");
    }
  }

  const columns: Column<CurriculumRow>[] = [
    {
      key: "title",
      header: "Title",
      sortable: true,
      render: (r) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{r.title}</p>
          {r.description && (
            <p className="text-xs text-gray-500 line-clamp-1">
              {r.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "academic_session",
      header: "Session",
      render: (r) => <span className="text-sm">{r.academic_session}</span>,
    },
    {
      key: "term",
      header: "Term",
      render: (r) => <Badge variant="info">{TERM_LABELS[r.term]}</Badge>,
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
      key: "created_at",
      header: "Uploaded",
      render: (r) => (
        <span className="text-sm text-gray-500">
          {formatDate(r.created_at)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (r) => (
        <div className="flex items-center gap-2 justify-end">
          <a
            href={r.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800"
            title="Download"
          >
            <Download className="h-4 w-4" />
          </a>
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => handleEdit(r as Curriculum)}
            title="Edit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            className="text-red-500 hover:text-red-700"
            onClick={() => handleDelete(r.id)}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const rows = (data?.data ?? []) as CurriculumRow[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-indigo-600" /> Teaching Curriculum
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload and manage approved teaching curricula for schools in your
            jurisdiction.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(undefined);
            setShowModal(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1" /> Upload Curriculum
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-56"
        />
        <Input
          placeholder="Session e.g. 2025/2026"
          value={sessionFilter}
          onChange={(e) => setSession(e.target.value)}
          className="w-48"
        />
        <select
          className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={termFilter}
          onChange={(e) => setTerm(e.target.value)}
        >
          <option value="">All Terms</option>
          {Object.entries(TERM_LABELS).map(([val, label]) => (
            <option key={val} value={val}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table columns={columns} data={rows} loading={isLoading} />
        </CardContent>
      </Card>

      {showModal && (
        <CurriculumModal
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
