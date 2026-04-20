"use client";
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Table, type Column } from "@/components/ui/Table";
import { Plus, Download, Pencil, Trash2, CalendarDays } from "lucide-react";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";
import {
  useAcademicCalendars,
  useCreateAcademicCalendar,
  useUpdateAcademicCalendar,
  useDeleteAcademicCalendar,
  type AcademicCalendar,
} from "@/hooks/useRegulatoryResources";

const TERM_LABELS: Record<string, string> = {
  first: "1st Term",
  second: "2nd Term",
  third: "3rd Term",
  full_year: "Full Year",
};

interface CalendarRow extends AcademicCalendar, Record<string, unknown> {}

// ── Modal ─────────────────────────────────────────────────────────────────────

function CalendarModal({
  open,
  onClose,
  existing,
}: {
  open: boolean;
  onClose: () => void;
  existing?: AcademicCalendar;
}) {
  const [title, setTitle] = useState(existing?.title ?? "");
  const [description, setDescription] = useState(existing?.description ?? "");
  const [session, setSession] = useState(existing?.academic_session ?? "");
  const [term, setTerm] = useState(existing?.term ?? "full_year");
  const [startDate, setStartDate] = useState(
    existing?.start_date?.slice(0, 10) ?? "",
  );
  const [endDate, setEndDate] = useState(
    existing?.end_date?.slice(0, 10) ?? "",
  );
  const [isPublished, setPublished] = useState(existing?.is_published ?? true);
  const [file, setFile] = useState<File | null>(null);

  const createMutation = useCreateAcademicCalendar();
  const updateMutation = useUpdateAcademicCalendar(existing?.id ?? 0);
  const isLoading = createMutation.isPending || updateMutation.isPending;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const fd = new FormData();
    fd.append("title", title);
    fd.append("description", description);
    fd.append("academic_session", session);
    fd.append("term", term);
    if (startDate) fd.append("start_date", startDate);
    if (endDate) fd.append("end_date", endDate);
    fd.append("is_published", isPublished ? "1" : "0");
    if (file) fd.append("file", file);

    try {
      if (existing) {
        await updateMutation.mutateAsync(fd);
        toast.success("Calendar updated.");
      } else {
        await createMutation.mutateAsync(fd);
        toast.success("Calendar uploaded.");
      }
      onClose();
    } catch {
      toast.error("Failed to save calendar.");
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={existing ? "Edit Calendar" : "Upload Academic Calendar"}
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
              onChange={(e) =>
                setTerm(e.target.value as AcademicCalendar["term"])
              }
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Calendar PDF {existing ? "(optional — replaces existing)" : ""} ·
            max 10 MB
          </label>
          <input
            type="file"
            accept=".pdf"
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
            {isLoading ? "Saving…" : existing ? "Update" : "Upload"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AcademicCalendarPage() {
  const [search, setSearch] = useState("");
  const [sessionFilter, setSession] = useState("");
  const [termFilter, setTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<AcademicCalendar | undefined>();

  const params: Record<string, string> = {};
  if (search) params.search = search;
  if (sessionFilter) params.academic_session = sessionFilter;
  if (termFilter) params.term = termFilter;

  const { data, isLoading } = useAcademicCalendars(params);
  const deleteMutation = useDeleteAcademicCalendar();

  async function handleDelete(id: number) {
    if (!confirm("Delete this calendar?")) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success("Deleted.");
    } catch {
      toast.error("Failed to delete.");
    }
  }

  const columns: Column<CalendarRow>[] = [
    {
      key: "title",
      header: "Title",
      sortable: true,
      render: (r) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{r.title}</p>
          {r.start_date && r.end_date && (
            <p className="text-xs text-gray-500">
              {formatDate(r.start_date)} – {formatDate(r.end_date)}
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
      render: (r) => <Badge variant="blue">{TERM_LABELS[r.term]}</Badge>,
    },
    {
      key: "is_published",
      header: "Status",
      render: (r) =>
        r.is_published ? (
          <Badge variant="green">Published</Badge>
        ) : (
          <Badge variant="yellow">Draft</Badge>
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
          {r.file_url && (
            <a
              href={r.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:text-indigo-800"
              title="Download PDF"
            >
              <Download className="h-4 w-4" />
            </a>
          )}
          <button
            className="text-gray-500 hover:text-gray-700"
            onClick={() => {
              setEditing(r as AcademicCalendar);
              setShowModal(true);
            }}
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

  const rows = (data?.data ?? []) as CalendarRow[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-indigo-600" /> Academic
            Calendar
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload and publish academic calendars for schools in your
            jurisdiction.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditing(undefined);
            setShowModal(true);
          }}
        >
          <Plus className="h-4 w-4 mr-1" /> Upload Calendar
        </Button>
      </div>

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
          <Table columns={columns} data={rows} loading={isLoading} keyField="id" />
        </CardContent>
      </Card>

      {showModal && (
        <CalendarModal
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
