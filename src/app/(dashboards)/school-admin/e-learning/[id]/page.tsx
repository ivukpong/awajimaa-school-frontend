"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft,
  Plus,
  Trash2,
  Edit,
  Play,
  FileText,
  BookOpen,
  Users,
  Award,
  ChevronDown,
  ChevronRight,
  Video,
  File,
  HelpCircle,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import toast from "react-hot-toast";
import {
  useElearningProgram,
  useProgramModules,
  useCreateModule,
  useUpdateModule,
  useDeleteModule,
  useModuleLessons,
  useCreateLesson,
  useUpdateLesson,
  useDeleteLesson,
  useProgramEnrollments,
  type ElearningModule,
  type ElearningLesson,
} from "@/hooks/useElearning";

const LESSON_TYPES = ["video", "article", "document", "quiz"] as const;

const lessonIcon = (type: ElearningLesson["type"]) => {
  switch (type) {
    case "video":
      return <Video size={13} />;
    case "article":
      return <FileText size={13} />;
    case "document":
      return <File size={13} />;
    case "quiz":
      return <HelpCircle size={13} />;
  }
};

// ─── Module form ────────────────────────────────────────────────────────────────

function ModuleModal({
  open,
  onClose,
  programId,
  module,
}: {
  open: boolean;
  onClose: () => void;
  programId: number;
  module?: ElearningModule;
}) {
  const [form, setForm] = useState({
    title: module?.title ?? "",
    description: module?.description ?? "",
    order: String(module?.order ?? 1),
  });

  const create = useCreateModule(programId);
  const update = useUpdateModule(programId, module?.id ?? 0);
  const isPending = create.isPending || update.isPending;

  const handleSubmit = async () => {
    const payload = {
      title: form.title,
      description: form.description || undefined,
      order: Number(form.order) || 1,
    };
    try {
      if (module) {
        await update.mutateAsync(payload);
        toast.success("Module updated");
      } else {
        await create.mutateAsync(payload);
        toast.success("Module added");
      }
      onClose();
    } catch {
      toast.error("Failed to save module");
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={module ? "Edit Module" : "Add Module"}
    >
      <div className="space-y-4 p-1">
        <div>
          <label className="block text-sm font-medium mb-1">
            Module Title *
          </label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Introduction to HTML"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:border-gray-700"
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Order</label>
          <Input
            type="number"
            min={1}
            value={form.order}
            onChange={(e) => setForm({ ...form, order: e.target.value })}
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !form.title}>
            {isPending ? "Saving..." : module ? "Update" : "Add Module"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Lesson form ────────────────────────────────────────────────────────────────

function LessonModal({
  open,
  onClose,
  moduleId,
  lesson,
}: {
  open: boolean;
  onClose: () => void;
  moduleId: number;
  lesson?: ElearningLesson;
}) {
  const [form, setForm] = useState({
    title: lesson?.title ?? "",
    content: lesson?.content ?? "",
    video_url: lesson?.video_url ?? "",
    file_url: lesson?.file_url ?? "",
    type: lesson?.type ?? ("video" as ElearningLesson["type"]),
    duration_minutes: String(lesson?.duration_minutes ?? ""),
    order: String(lesson?.order ?? 1),
    is_preview: lesson?.is_preview ?? false,
  });

  const create = useCreateLesson(moduleId);
  const update = useUpdateLesson(moduleId, lesson?.id ?? 0);
  const isPending = create.isPending || update.isPending;

  const handleSubmit = async () => {
    const payload = {
      title: form.title,
      content: form.content || undefined,
      video_url: form.video_url || undefined,
      file_url: form.file_url || undefined,
      type: form.type,
      duration_minutes: form.duration_minutes
        ? Number(form.duration_minutes)
        : undefined,
      order: Number(form.order) || 1,
      is_preview: form.is_preview,
    };
    try {
      if (lesson) {
        await update.mutateAsync(payload);
        toast.success("Lesson updated");
      } else {
        await create.mutateAsync(payload);
        toast.success("Lesson added");
      }
      onClose();
    } catch {
      toast.error("Failed to save lesson");
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={lesson ? "Edit Lesson" : "Add Lesson"}
    >
      <div className="space-y-4 p-1">
        <div>
          <label className="block text-sm font-medium mb-1">Title *</label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. What is HTML?"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:border-gray-700"
              value={form.type}
              onChange={(e) =>
                setForm({
                  ...form,
                  type: e.target.value as ElearningLesson["type"],
                })
              }
            >
              {LESSON_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Duration (mins)
            </label>
            <Input
              type="number"
              min={1}
              value={form.duration_minutes}
              onChange={(e) =>
                setForm({ ...form, duration_minutes: e.target.value })
              }
              placeholder="e.g. 15"
            />
          </div>
        </div>
        {form.type === "video" && (
          <div>
            <label className="block text-sm font-medium mb-1">Video URL</label>
            <Input
              value={form.video_url}
              onChange={(e) => setForm({ ...form, video_url: e.target.value })}
              placeholder="https://youtube.com/..."
            />
          </div>
        )}
        {form.type === "document" && (
          <div>
            <label className="block text-sm font-medium mb-1">File URL</label>
            <Input
              value={form.file_url}
              onChange={(e) => setForm({ ...form, file_url: e.target.value })}
              placeholder="https://..."
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">
            Content / Description
          </label>
          <textarea
            className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:border-gray-700"
            rows={3}
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Order</label>
            <Input
              type="number"
              min={1}
              value={form.order}
              onChange={(e) => setForm({ ...form, order: e.target.value })}
            />
          </div>
          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="is_preview_lesson"
              checked={form.is_preview}
              onChange={(e) =>
                setForm({ ...form, is_preview: e.target.checked })
              }
            />
            <label htmlFor="is_preview_lesson" className="text-sm">
              Free preview
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isPending || !form.title}>
            {isPending ? "Saving..." : lesson ? "Update" : "Add Lesson"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ─── Module row (expandable) ────────────────────────────────────────────────────

function ModuleRow({
  programId,
  module,
}: {
  programId: number;
  module: ElearningModule;
}) {
  const [open, setOpen] = useState(false);
  const [editingModule, setEditingModule] = useState(false);
  const [addingLesson, setAddingLesson] = useState(false);
  const [editingLesson, setEditingLesson] = useState<ElearningLesson | null>(
    null,
  );

  const { data: lessonsData } = useModuleLessons(open ? module.id : null);
  const lessons: ElearningLesson[] = lessonsData?.data ?? [];

  const deleteModule = useDeleteModule(programId);
  const deleteLesson = useDeleteLesson(module.id);

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-750"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-2">
          {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          <span className="font-medium text-sm">{module.title}</span>
          {module.description && (
            <span className="text-xs text-gray-400 hidden sm:inline">
              — {module.description}
            </span>
          )}
        </div>
        <div
          className="flex items-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <Badge variant="gray" size="sm">
            {module.lessons_count ?? (open ? lessons.length : 0)} lessons
          </Badge>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditingModule(true)}
          >
            <Edit size={12} />
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-red-500"
            onClick={() => {
              if (!confirm("Delete this module and all its lessons?")) return;
              deleteModule.mutate(module.id, {
                onSuccess: () => toast.success("Module deleted"),
                onError: () => toast.error("Failed to delete"),
              });
            }}
          >
            <Trash2 size={12} />
          </Button>
        </div>
      </div>

      {open && (
        <div className="p-4 space-y-2">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="flex items-center justify-between px-3 py-2 rounded-md border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400">{lessonIcon(lesson.type)}</span>
                <span>{lesson.title}</span>
                {lesson.is_preview && (
                  <Badge variant="blue" size="sm">
                    Preview
                  </Badge>
                )}
                {lesson.duration_minutes && (
                  <span className="text-xs text-gray-400">
                    {lesson.duration_minutes}m
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingLesson(lesson)}
                >
                  <Edit size={11} />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-500"
                  onClick={() =>
                    deleteLesson.mutate(lesson.id, {
                      onSuccess: () => toast.success("Lesson deleted"),
                      onError: () => toast.error("Failed to delete"),
                    })
                  }
                >
                  <Trash2 size={11} />
                </Button>
              </div>
            </div>
          ))}

          <Button
            size="sm"
            variant="outline"
            leftIcon={<Plus size={13} />}
            onClick={() => setAddingLesson(true)}
          >
            Add Lesson
          </Button>
        </div>
      )}

      {editingModule && (
        <ModuleModal
          open
          onClose={() => setEditingModule(false)}
          programId={programId}
          module={module}
        />
      )}
      {addingLesson && (
        <LessonModal
          open
          onClose={() => setAddingLesson(false)}
          moduleId={module.id}
        />
      )}
      {editingLesson && (
        <LessonModal
          open
          onClose={() => setEditingLesson(null)}
          moduleId={module.id}
          lesson={editingLesson}
        />
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────────

export default function ProgramDetailPage() {
  const params = useParams<{ id: string }>();
  const programId = Number(params.id);

  const { data: programData, isLoading } = useElearningProgram(programId);
  const { data: modulesData } = useProgramModules(programId);
  const { data: enrollmentsData } = useProgramEnrollments(programId);

  const program = programData?.data;
  const modules: ElearningModule[] = modulesData?.data ?? [];
  const enrollments = enrollmentsData?.data?.data ?? [];

  const [addingModule, setAddingModule] = useState(false);
  const [activeTab, setActiveTab] = useState<"curriculum" | "enrollments">(
    "curriculum",
  );

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      </div>
    );
  }

  if (!program) return <p className="text-gray-500">Program not found.</p>;

  return (
    <div className="space-y-6">
      {/* ── Back + header ─────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="../e-learning">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<ChevronLeft size={14} />}
            >
              Programs
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              {program.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant={program.is_published ? "green" : "yellow"}
                size="sm"
              >
                {program.is_published ? "Live" : "Draft"}
              </Badge>
              {program.is_free ? (
                <Badge variant="blue" size="sm">
                  Free
                </Badge>
              ) : (
                <span className="text-sm font-semibold text-brand">
                  {program.currency} {Number(program.amount).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          <Link href="../../e-learning/certificates">
            <Button size="sm" variant="outline" leftIcon={<Award size={14} />}>
              Certificates
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Stats ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          {
            label: "Modules",
            value: modules.length,
            icon: <BookOpen size={16} className="text-brand" />,
          },
          {
            label: "Total Lessons",
            value:
              program.total_lessons ??
              modules.reduce((s, m) => s + (m.lessons_count ?? 0), 0),
            icon: <Play size={16} className="text-purple-500" />,
          },
          {
            label: "Enrolled",
            value: program.enrollments_count ?? enrollments.length,
            icon: <Users size={16} className="text-blue-500" />,
          },
          {
            label: "Certificates",
            value: program.certificates_count ?? 0,
            icon: <Award size={16} className="text-yellow-500" />,
          },
        ].map((s) => (
          <Card key={s.label} className="p-3 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
              {s.icon}
            </div>
            <div>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-lg font-bold">{s.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* ── Program info ──────────────────────────────────────── */}
      <Card>
        <CardContent className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-xs text-gray-400 mb-0.5">Study Duration</p>
            <p className="font-medium">
              {program.duration_days
                ? `${program.duration_days} days`
                : "Self-paced"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">
              Access After Completion
            </p>
            <p className="font-medium">
              {program.access_duration_days
                ? `${program.access_duration_days} days`
                : "Lifetime"}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-0.5">
              Certificate Threshold
            </p>
            <p className="font-medium">
              {program.certificate_threshold}% of lessons
            </p>
          </div>
          {program.promo_video_url && (
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Promo Video</p>
              <a
                href={program.promo_video_url}
                target="_blank"
                rel="noreferrer"
                className="text-brand text-xs inline-flex items-center gap-1 hover:underline"
              >
                <Play size={11} /> Watch
              </a>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Tabs ─────────────────────────────────────────────── */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700">
        {(["curriculum", "enrollments"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? "border-b-2 border-brand text-brand"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Curriculum tab ───────────────────────────────────── */}
      {activeTab === "curriculum" && (
        <div className="space-y-3">
          {modules
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((module) => (
              <ModuleRow
                key={module.id}
                programId={programId}
                module={module}
              />
            ))}

          <Button
            variant="outline"
            leftIcon={<Plus size={15} />}
            onClick={() => setAddingModule(true)}
          >
            Add Module
          </Button>
        </div>
      )}

      {/* ── Enrollments tab ──────────────────────────────────── */}
      {activeTab === "enrollments" && (
        <Card>
          <CardHeader>
            <CardTitle>Enrolled Learners</CardTitle>
          </CardHeader>
          <CardContent>
            {enrollments.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">
                No enrollments yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b dark:border-gray-700 text-left text-xs text-gray-400">
                      <th className="pb-2 font-medium">Learner</th>
                      <th className="pb-2 font-medium">Enrolled</th>
                      <th className="pb-2 font-medium">Status</th>
                      <th className="pb-2 font-medium">Progress</th>
                      <th className="pb-2 font-medium">Certificate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-700">
                    {enrollments.map((e) => (
                      <tr key={e.id}>
                        <td className="py-2">
                          <p className="font-medium">{e.user?.name}</p>
                          <p className="text-xs text-gray-400">
                            {e.user?.email}
                          </p>
                        </td>
                        <td className="py-2 text-gray-500">
                          {new Date(e.enrolled_at).toLocaleDateString()}
                        </td>
                        <td className="py-2">
                          <Badge
                            size="sm"
                            variant={
                              e.status === "completed"
                                ? "green"
                                : e.status === "expired"
                                  ? "red"
                                  : "blue"
                            }
                          >
                            {e.status}
                          </Badge>
                        </td>
                        <td className="py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-brand rounded-full"
                                style={{
                                  width: `${e.completion_percent ?? 0}%`,
                                }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">
                              {e.completion_percent ?? 0}%
                            </span>
                          </div>
                        </td>
                        <td className="py-2">
                          {e.certificate_eligible ? (
                            <span className="flex items-center gap-1 text-green-500 text-xs">
                              <CheckCircle size={12} /> Eligible
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {addingModule && (
        <ModuleModal
          open
          onClose={() => setAddingModule(false)}
          programId={programId}
        />
      )}
    </div>
  );
}
