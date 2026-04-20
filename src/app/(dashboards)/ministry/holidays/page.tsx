"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Plus, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import { get, post, patch, del } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";

interface Announcement {
  id: number;
  title: string;
  body: string;
  type: string;
  audience?: string[];
  event_date?: string;
  is_published: boolean;
  published_at?: string;
  created_at: string;
}

const TYPE_OPTIONS = [
  { value: "general", label: "General" },
  { value: "holiday", label: "Public Holiday" },
  { value: "policy", label: "Policy" },
  { value: "event", label: "Event" },
  { value: "emergency", label: "Emergency" },
];

const TYPE_VARIANT: Record<
  string,
  "yellow" | "blue" | "green" | "red" | "gray"
> = {
  holiday: "yellow",
  policy: "blue",
  event: "green",
  emergency: "red",
  general: "gray",
};

const AUDIENCE_OPTIONS = [
  "schools",
  "students",
  "teachers",
  "parents",
  "public",
];

const EMPTY_FORM = {
  title: "",
  body: "",
  type: "general",
  audience: [] as string[],
  event_date: "",
  is_published: false,
};

export default function MinistryHolidaysPage() {
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Announcement | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useQuery<{ data: Announcement[] }>({
    queryKey: ["ministry-announcements"],
    queryFn: () =>
      get<{ data: Announcement[] }>("/ministry/announcements").then(
        (r) => r.data,
      ),
  });

  const createMutation = useMutation({
    mutationFn: (payload: typeof EMPTY_FORM) =>
      post("/ministry/announcements", payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ministry-announcements"] });
      toast.success("Announcement created.");
      closeModal();
    },
    onError: () => toast.error("Failed to create announcement."),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<typeof EMPTY_FORM>;
    }) => patch(`/ministry/announcements/${id}`, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ministry-announcements"] });
      toast.success("Announcement updated.");
      closeModal();
    },
    onError: () => toast.error("Failed to update announcement."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => del(`/ministry/announcements/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ministry-announcements"] });
      toast.success("Announcement deleted.");
      setDeleteId(null);
    },
    onError: () => toast.error("Failed to delete announcement."),
  });

  function openCreate() {
    setEditItem(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  }

  function openEdit(a: Announcement) {
    setEditItem(a);
    setForm({
      title: a.title,
      body: a.body,
      type: a.type,
      audience: a.audience ?? [],
      event_date: a.event_date ?? "",
      is_published: a.is_published,
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditItem(null);
    setForm(EMPTY_FORM);
  }

  function toggleAudience(aud: string) {
    setForm((prev) => ({
      ...prev,
      audience: prev.audience.includes(aud)
        ? prev.audience.filter((a) => a !== aud)
        : [...prev.audience, aud],
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.body)
      return toast.error("Title and body are required.");
    if (editItem) {
      updateMutation.mutate({ id: editItem.id, payload: form });
    } else {
      createMutation.mutate(form);
    }
  }

  const announcements = data?.data ?? [];
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Announcements & Holidays
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Publish notices, public holidays, policies and events to schools and
            students
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" /> New Announcement
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Announcements ({announcements.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 rounded bg-gray-100 animate-pulse"
                />
              ))}
            </div>
          ) : announcements.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-gray-400">
              <Bell className="h-10 w-10 mb-3" />
              <p className="text-sm">No announcements yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-left">
                    <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                      Title
                    </th>
                    <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                      Type
                    </th>
                    <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                      Audience
                    </th>
                    <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                      Event Date
                    </th>
                    <th className="py-2 pr-4 font-medium text-gray-600 dark:text-gray-400">
                      Published
                    </th>
                    <th className="py-2 font-medium text-gray-600 dark:text-gray-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {announcements.map((a) => (
                    <tr
                      key={a.id}
                      className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-3 pr-4 font-medium text-gray-900 dark:text-white max-w-xs truncate">
                        {a.title}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={TYPE_VARIANT[a.type] ?? "gray"}>
                          {TYPE_OPTIONS.find((t) => t.value === a.type)
                            ?.label ?? a.type}
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">
                        {a.audience?.join(", ") || "All"}
                      </td>
                      <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">
                        {a.event_date ?? "—"}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={a.is_published ? "green" : "gray"}>
                          {a.is_published ? "Published" : "Draft"}
                        </Badge>
                      </td>
                      <td className="py-3 flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEdit(a)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => setDeleteId(a.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Modal */}
      <Modal
        open={showModal}
        onClose={closeModal}
        title={editItem ? "Edit Announcement" : "New Announcement"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title *
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Independence Day Holiday"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type *
            </label>
            <select
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Body *
            </label>
            <textarea
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              rows={4}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="Announcement details..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Audience
            </label>
            <div className="flex flex-wrap gap-3">
              {AUDIENCE_OPTIONS.map((aud) => (
                <label
                  key={aud}
                  className="flex items-center gap-2 text-sm cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={form.audience.includes(aud)}
                    onChange={() => toggleAudience(aud)}
                    className="rounded"
                  />
                  <span className="capitalize text-gray-700 dark:text-gray-300">
                    {aud}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Event Date
            </label>
            <input
              type="date"
              className="w-full border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              value={form.event_date}
              onChange={(e) => setForm({ ...form, event_date: e.target.value })}
            />
          </div>

          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) =>
                setForm({ ...form, is_published: e.target.checked })
              }
              className="rounded"
            />
            <span className="text-gray-700 dark:text-gray-300">
              Publish immediately
            </span>
          </label>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : editItem ? "Update" : "Publish"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        open={deleteId !== null}
        onClose={() => setDeleteId(null)}
        title="Delete Announcement"
      >
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
          Are you sure you want to delete this announcement?
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setDeleteId(null)}>
            Cancel
          </Button>
          <Button
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={deleteMutation.isPending}
            onClick={() => deleteId !== null && deleteMutation.mutate(deleteId)}
          >
            {deleteMutation.isPending ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
