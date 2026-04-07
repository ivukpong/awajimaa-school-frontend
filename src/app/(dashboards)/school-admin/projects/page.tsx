"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { StatCard } from "@/components/ui/StatCard";
import {
  FolderKanban,
  Plus,
  Edit,
  Trash2,
  X,
  CheckCircle2,
  Clock,
  PauseCircle,
  Lightbulb,
} from "lucide-react";
import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
  type SchoolProject,
  type ProjectStatus,
  type ProjectPriority,
} from "@/hooks/useProjects";
import toast from "react-hot-toast";

const statusColors: Record<ProjectStatus, string> = {
  planning: "bg-blue-100 text-blue-800",
  in_progress: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  on_hold: "bg-gray-100 text-gray-700",
};

const statusIcons: Record<ProjectStatus, React.ReactNode> = {
  planning: <Lightbulb className="h-4 w-4" />,
  in_progress: <Clock className="h-4 w-4" />,
  completed: <CheckCircle2 className="h-4 w-4" />,
  on_hold: <PauseCircle className="h-4 w-4" />,
};

const priorityColors: Record<ProjectPriority, string> = {
  low: "bg-gray-100 text-gray-700",
  medium: "bg-orange-100 text-orange-800",
  high: "bg-red-100 text-red-700",
};

const emptyForm = {
  title: "",
  description: "",
  status: "planning" as ProjectStatus,
  priority: "medium" as ProjectPriority,
  budget: "",
  spent: "",
  start_date: "",
  end_date: "",
};

export default function ProjectsPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const { data, isLoading } = useProjects(
    statusFilter ? { status: statusFilter } : undefined,
  );
  const projects: SchoolProject[] = (data as any)?.data?.data ?? [];

  const create = useCreateProject();
  const update = useUpdateProject();
  const remove = useDeleteProject();

  const totalBudget = projects.reduce((s, p) => s + (p.budget ?? 0), 0);
  const totalSpent = projects.reduce((s, p) => s + (p.spent ?? 0), 0);
  const completed = projects.filter((p) => p.status === "completed").length;
  const inProgress = projects.filter((p) => p.status === "in_progress").length;

  function openCreate() {
    setEditingId(null);
    setForm(emptyForm);
    setShowForm(true);
  }

  function openEdit(p: SchoolProject) {
    setEditingId(p.id);
    setForm({
      title: p.title,
      description: p.description ?? "",
      status: p.status,
      priority: p.priority,
      budget: String(p.budget ?? ""),
      spent: String(p.spent ?? ""),
      start_date: p.start_date ?? "",
      end_date: p.end_date ?? "",
    });
    setShowForm(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...form,
      budget: form.budget ? Number(form.budget) : undefined,
      spent: form.spent ? Number(form.spent) : undefined,
      start_date: form.start_date || undefined,
      end_date: form.end_date || undefined,
    };
    if (editingId) {
      update.mutate(
        { id: editingId, ...payload },
        {
          onSuccess: () => {
            toast.success("Project updated");
            setShowForm(false);
          },
          onError: () => toast.error("Failed to update project"),
        },
      );
    } else {
      create.mutate(payload, {
        onSuccess: () => {
          toast.success("Project created");
          setShowForm(false);
        },
        onError: () => toast.error("Failed to create project"),
      });
    }
  }

  function confirmDelete() {
    if (!deleteId) return;
    remove.mutate(deleteId, {
      onSuccess: () => {
        toast.success("Project deleted");
        setDeleteId(null);
      },
      onError: () => toast.error("Failed to delete"),
    });
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FolderKanban className="h-6 w-6 text-brand" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Projects &amp; Development
            </h1>
            <p className="text-sm text-gray-500">
              Track school development and improvement projects
            </p>
          </div>
        </div>
        <Button onClick={openCreate} className="flex items-center gap-1">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          title="Total Projects"
          value={projects.length}
          icon={<FolderKanban className="h-5 w-5" />}
        />
        <StatCard
          title="In Progress"
          value={inProgress}
          icon={<Clock className="h-5 w-5 text-yellow-600" />}
        />
        <StatCard
          title="Completed"
          value={completed}
          icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
        />
        <StatCard
          title="Budget Utilisation"
          value={
            totalBudget
              ? `${Math.round((totalSpent / totalBudget) * 100)}%`
              : "—"
          }
          icon={<CheckCircle2 className="h-5 w-5" />}
        />
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {["", "planning", "in_progress", "completed", "on_hold"].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === s
                ? "bg-brand text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {s ? s.replace("_", " ") : "All"}
          </button>
        ))}
      </div>

      {/* Projects grid */}
      {isLoading ? (
        <div className="py-12 text-center text-gray-400">Loading projects…</div>
      ) : projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <FolderKanban className="h-12 w-12 mb-4 opacity-30" />
          <p className="font-medium">No projects found</p>
          <p className="text-sm">Create your first project to get started</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Card key={p.id} className="flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-snug">
                    {p.title}
                  </CardTitle>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => openEdit(p)}
                      className="rounded p-1 text-gray-400 hover:text-brand"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteId(p.id)}
                      className="rounded p-1 text-gray-400 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap mt-1">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${statusColors[p.status]}`}
                  >
                    {statusIcons[p.status]}
                    {p.status.replace("_", " ")}
                  </span>
                  <Badge
                    variant="gray"
                    className={`text-xs ${priorityColors[p.priority]}`}
                  >
                    {p.priority}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-3 text-sm text-gray-600">
                {p.description && (
                  <p className="line-clamp-2">{p.description}</p>
                )}
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span>Budget</span>
                    <span className="font-medium">
                      ₦{(p.budget ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Spent</span>
                    <span className="font-medium text-orange-600">
                      ₦{(p.spent ?? 0).toLocaleString()}
                    </span>
                  </div>
                  {p.budget > 0 && (
                    <div className="h-1.5 w-full rounded-full bg-gray-200">
                      <div
                        className="h-1.5 rounded-full bg-brand"
                        style={{
                          width: `${Math.min(100, Math.round((p.spent / p.budget) * 100))}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
                {(p.start_date || p.end_date) && (
                  <p className="text-xs text-gray-400">
                    {p.start_date ?? "—"} → {p.end_date ?? "—"}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="relative w-full max-w-lg rounded-xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b px-6 py-4">
              <h2 className="text-lg font-semibold">
                {editingId ? "Edit Project" : "New Project"}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Title *
                </label>
                <Input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block mb-1 text-sm font-medium">
                  Description
                </label>
                <textarea
                  rows={2}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Status
                  </label>
                  <select
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                    value={form.status}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status: e.target.value as ProjectStatus,
                      })
                    }
                  >
                    <option value="planning">Planning</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Priority
                  </label>
                  <select
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
                    value={form.priority}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        priority: e.target.value as ProjectPriority,
                      })
                    }
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Budget (₦)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={form.budget}
                    onChange={(e) =>
                      setForm({ ...form, budget: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Spent (₦)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={form.spent}
                    onChange={(e) =>
                      setForm({ ...form, spent: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={form.start_date}
                    onChange={(e) =>
                      setForm({ ...form, start_date: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-medium">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={form.end_date}
                    onChange={(e) =>
                      setForm({ ...form, end_date: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={create.isPending || update.isPending}
                >
                  {editingId ? "Save Changes" : "Create Project"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-2">Delete Project?</h3>
            <p className="text-sm text-gray-600 mb-6">
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteId(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={confirmDelete}
                disabled={remove.isPending}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
