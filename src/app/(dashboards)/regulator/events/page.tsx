"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Table, type Column } from "@/components/ui/Table";
import { useGovernmentEvents } from "@/hooks/useGovernment";
import type { GovernmentEvent, EventCategory } from "@/types/government";
import { Plus, Calendar } from "lucide-react";
import toast from "react-hot-toast";

const categories = [
  "workshop",
  "training",
  "conference",
  "inspection",
  "sports",
  "competition",
  "census",
  "other",
] as const;

export default function RegulatorEventsPage() {
  const { events, loading, createEvent, updateEvent, deleteEvent } =
    useGovernmentEvents();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<GovernmentEvent | null>(null);
  const [form, setForm] = useState({
    title: "",
    category: "workshop",
    description: "",
    venue: "",
    start_datetime: "",
    end_datetime: "",
    max_participants: "",
  });
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm({
      title: "",
      category: "workshop",
      description: "",
      venue: "",
      start_datetime: "",
      end_datetime: "",
      max_participants: "",
    });
    setShowModal(true);
  };
  const openEdit = (e: GovernmentEvent) => {
    setEditing(e);
    setForm({
      title: e.title,
      category: e.category,
      description: e.description ?? "",
      venue: e.venue ?? "",
      start_datetime: e.start_datetime ?? "",
      end_datetime: e.end_datetime ?? "",
      max_participants: e.max_participants?.toString() ?? "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.title) return toast.error("Title required");
    setSaving(true);
    try {
      const payload = {
        ...form,
        category: form.category as EventCategory,
        max_participants: form.max_participants
          ? Number(form.max_participants)
          : undefined,
      };
      if (editing) {
        await updateEvent(editing.id, payload);
        toast.success("Event updated");
      } else {
        await createEvent(payload);
        toast.success("Event created");
      }
      setShowModal(false);
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<GovernmentEvent>[] = [
    {
      key: "title",
      header: "Event",
      render: (r) => <span className="font-medium">{r.title}</span>,
    },
    {
      key: "category",
      header: "Category",
      render: (r) => <Badge variant="blue">{r.category}</Badge>,
    },
    { key: "venue", header: "Venue" },
    {
      key: "start_datetime",
      header: "Date",
      render: (r) =>
        r.start_datetime ? new Date(r.start_datetime).toLocaleString() : "—",
    },
    {
      key: "registrations_count",
      header: "Registered",
      render: (r) => <span>{r.registrations_count ?? 0}</span>,
    },
    {
      key: "id" as keyof GovernmentEvent,
      header: "Actions",
      render: (r) => (
        <div className="flex gap-1">
          <Button size="sm" variant="secondary" onClick={() => openEdit(r)}>
            Edit
          </Button>
          <Button
            size="sm"
            variant="danger"
            onClick={() =>
              deleteEvent(r.id)
                .then(() => toast.success("Deleted"))
                .catch(() => toast.error("Failed"))
            }
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Government Events
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage workshops, seminars, and training events
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Event
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Table
            keyField="id"
            columns={columns}
            data={
              (events?.data ?? []) as unknown as (GovernmentEvent &
                Record<string, unknown>)[]
            }
            loading={loading}
          />
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-500" />
              <h2 className="text-lg font-bold">
                {editing ? "Edit Event" : "New Event"}
              </h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Title *</label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Start Date/Time</label>
                  <Input
                    type="datetime-local"
                    value={form.start_datetime}
                    onChange={(e) =>
                      setForm({ ...form, start_datetime: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End Date/Time</label>
                  <Input
                    type="datetime-local"
                    value={form.end_datetime}
                    onChange={(e) =>
                      setForm({ ...form, end_datetime: e.target.value })
                    }
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Venue</label>
                <Input
                  value={form.venue}
                  onChange={(e) => setForm({ ...form, venue: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Max Participants</label>
                <Input
                  type="number"
                  value={form.max_participants}
                  onChange={(e) =>
                    setForm({ ...form, max_participants: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
