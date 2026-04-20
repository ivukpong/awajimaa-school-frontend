"use client";

import { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  PlusCircle,
  Users,
  Award,
  Play,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Clock,
  BarChart2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";
import {
  useElearningPrograms,
  useCreateProgram,
  useUpdateProgram,
  useDeleteProgram,
  type ElearningProgram,
} from "@/hooks/useElearning";

const CURRENCIES = ["USD", "NGN", "EUR", "GBP"] as const;

const emptyForm = {
  name: "",
  description: "",
  thumbnail: "",
  promo_video_url: "",
  amount: "",
  currency: "USD",
  is_free: false,
  duration_days: "",
  access_duration_days: "",
  certificate_threshold: "80",
  is_published: false,
};

function ProgramFormModal({
  open,
  onClose,
  initial,
  programId,
}: {
  open: boolean;
  onClose: () => void;
  initial?: typeof emptyForm;
  programId?: number;
}) {
  const { user } = useAuthStore();
  const [form, setForm] = useState(initial ?? emptyForm);
  const createProgram = useCreateProgram();
  const updateProgram = useUpdateProgram(programId ?? 0);

  const isEditing = !!programId;

  const handleSubmit = async () => {
    const payload = {
      school_id: user?.school_id ?? undefined,
      name: form.name,
      description: form.description || undefined,
      thumbnail: form.thumbnail || undefined,
      promo_video_url: form.promo_video_url || undefined,
      amount: Number(form.amount) || 0,
      currency: form.currency,
      is_free: form.is_free,
      duration_days: form.duration_days
        ? Number(form.duration_days)
        : undefined,
      access_duration_days: form.access_duration_days
        ? Number(form.access_duration_days)
        : undefined,
      certificate_threshold: Number(form.certificate_threshold) || 80,
      is_published: form.is_published,
    };

    try {
      if (isEditing) {
        await updateProgram.mutateAsync(payload);
        toast.success("Program updated");
      } else {
        await createProgram.mutateAsync(payload);
        toast.success("Program created");
      }
      onClose();
    } catch {
      toast.error(
        isEditing ? "Failed to update program" : "Failed to create program",
      );
    }
  };

  const isPending = createProgram.isPending || updateProgram.isPending;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Edit Program" : "New Program"}
    >
      <div className="space-y-4 p-1">
        <div>
          <label className="block text-sm font-medium mb-1">
            Program Name *
          </label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="e.g. Full-Stack Web Development"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:border-gray-700 resize-none"
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="What will students learn?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Promo / Ad Video URL
          </label>
          <Input
            value={form.promo_video_url}
            onChange={(e) =>
              setForm({ ...form, promo_video_url: e.target.value })
            }
            placeholder="https://youtube.com/..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Thumbnail URL
          </label>
          <Input
            value={form.thumbnail}
            onChange={(e) => setForm({ ...form, thumbnail: e.target.value })}
            placeholder="https://..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <Input
              type="number"
              min={0}
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="0"
              disabled={form.is_free}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Currency</label>
            <select
              className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:border-gray-700"
              value={form.currency}
              onChange={(e) => setForm({ ...form, currency: e.target.value })}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_free"
            checked={form.is_free}
            onChange={(e) =>
              setForm({
                ...form,
                is_free: e.target.checked,
                amount: e.target.checked ? "0" : form.amount,
              })
            }
          />
          <label htmlFor="is_free" className="text-sm">
            Free program
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Study Duration (days)
            </label>
            <Input
              type="number"
              min={1}
              value={form.duration_days}
              onChange={(e) =>
                setForm({ ...form, duration_days: e.target.value })
              }
              placeholder="e.g. 30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Access After Completion (days)
            </label>
            <Input
              type="number"
              min={1}
              value={form.access_duration_days}
              onChange={(e) =>
                setForm({ ...form, access_duration_days: e.target.value })
              }
              placeholder="e.g. 365 (blank = lifetime)"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Certificate Threshold (% of lessons required)
          </label>
          <Input
            type="number"
            min={1}
            max={100}
            value={form.certificate_threshold}
            onChange={(e) =>
              setForm({ ...form, certificate_threshold: e.target.value })
            }
            placeholder="80"
          />
          <p className="text-xs text-gray-400 mt-1">
            Learners who complete ≥ {form.certificate_threshold || 80}% of
            lessons earn a certificate.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_published"
            checked={form.is_published}
            onChange={(e) =>
              setForm({ ...form, is_published: e.target.checked })
            }
          />
          <label htmlFor="is_published" className="text-sm">
            Publish immediately (visible to students)
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !form.name}>
            {isPending
              ? "Saving..."
              : isEditing
                ? "Update Program"
                : "Create Program"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default function ELearningPage() {
  const { data, isLoading } = useElearningPrograms({ published: undefined });
  const deleteProgram = useDeleteProgram();

  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<ElearningProgram | null>(null);

  const programs: ElearningProgram[] = (Array.isArray(data?.data) ? data.data : (data?.data as { data?: ElearningProgram[] })?.data) ?? [];

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this program? This cannot be undone.")) return;
    try {
      await deleteProgram.mutateAsync(id);
      toast.success("Program deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            E-Learning Programs
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Create and manage online programs with modules, lessons, and
            completion certificates.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="e-learning/certificates">
            <Button variant="outline" leftIcon={<Award size={15} />}>
              Certificates
            </Button>
          </Link>
          <Button
            leftIcon={<PlusCircle size={15} />}
            onClick={() => setShowCreate(true)}
          >
            New Program
          </Button>
        </div>
      </div>

      {/* ── Stats strip ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Programs",
            value: programs.length,
            icon: <BookOpen size={18} className="text-brand" />,
          },
          {
            label: "Published",
            value: programs.filter((p) => p.is_published).length,
            icon: <Eye size={18} className="text-green-500" />,
          },
          {
            label: "Total Enrollments",
            value: programs.reduce((s, p) => s + (p.enrollments_count ?? 0), 0),
            icon: <Users size={18} className="text-blue-500" />,
          },
          {
            label: "Certificates Issued",
            value: programs.reduce(
              (s, p) => s + (p.certificates_count ?? 0),
              0,
            ),
            icon: <Award size={18} className="text-yellow-500" />,
          },
        ].map((stat) => (
          <Card key={stat.label} className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
              {stat.icon}
            </div>
            <div>
              <p className="text-xs text-gray-500">{stat.label}</p>
              <p className="text-xl font-bold">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Programs grid ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-64 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse"
              />
            ))
          : programs.map((program) => (
              <Card
                key={program.id}
                className="overflow-hidden flex flex-col hover:shadow-md transition-shadow"
              >
                {/* Thumbnail / promo */}
                <div className="relative">
                  {program.thumbnail ? (
                    <img
                      src={program.thumbnail}
                      alt={program.name}
                      className="w-full h-40 object-cover"
                    />
                  ) : (
                    <div className="w-full h-40 bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <BookOpen size={48} className="text-white/60" />
                    </div>
                  )}
                  {program.promo_video_url && (
                    <a
                      href={program.promo_video_url}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute bottom-2 right-2 bg-black/60 text-white rounded-full p-1.5 hover:bg-black/80"
                    >
                      <Play size={14} />
                    </a>
                  )}
                  <div className="absolute top-2 left-2">
                    <Badge
                      variant={program.is_published ? "green" : "yellow"}
                      size="sm"
                    >
                      {program.is_published ? "Live" : "Draft"}
                    </Badge>
                  </div>
                  {program.is_free && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="blue" size="sm">
                        Free
                      </Badge>
                    </div>
                  )}
                </div>

                <CardContent className="flex-1 flex flex-col p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold text-base leading-snug">
                      {program.name}
                    </h3>
                    {program.description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {program.description}
                      </p>
                    )}
                  </div>

                  {/* Meta row */}
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500">
                    {program.duration_days && (
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> {program.duration_days}d study
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <BarChart2 size={11} /> {program.certificate_threshold}%
                      for cert
                    </span>
                    <span className="flex items-center gap-1">
                      <Users size={11} /> {program.enrollments_count ?? 0}{" "}
                      enrolled
                    </span>
                    <span className="flex items-center gap-1">
                      <Award size={11} /> {program.certificates_count ?? 0}{" "}
                      certs
                    </span>
                  </div>

                  {/* Price */}
                  <p className="text-sm font-semibold text-brand">
                    {program.is_free
                      ? "Free"
                      : `${program.currency} ${Number(program.amount).toLocaleString()}`}
                  </p>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1 mt-auto">
                    <Link href={`e-learning/${program.id}`} className="flex-1">
                      <Button size="sm" variant="outline" className="w-full">
                        Manage
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setEditing({
                          ...program,
                        })
                      }
                    >
                      <Edit size={13} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleDelete(program.id)}
                      disabled={deleteProgram.isPending}
                    >
                      <Trash2 size={13} />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

        {!isLoading && programs.length === 0 && (
          <div className="col-span-full text-center py-16 text-gray-400">
            <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No programs yet</p>
            <p className="text-sm mt-1">
              Create your first program to get started.
            </p>
          </div>
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────────── */}
      <ProgramFormModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />

      {editing && (
        <ProgramFormModal
          open={!!editing}
          onClose={() => setEditing(null)}
          programId={editing.id}
          initial={{
            name: editing.name,
            description: editing.description ?? "",
            thumbnail: editing.thumbnail ?? "",
            promo_video_url: editing.promo_video_url ?? "",
            amount: String(editing.amount),
            currency: editing.currency,
            is_free: editing.is_free,
            duration_days: String(editing.duration_days ?? ""),
            access_duration_days: String(editing.access_duration_days ?? ""),
            certificate_threshold: String(editing.certificate_threshold),
            is_published: editing.is_published,
          }}
        />
      )}
    </div>
  );
}
