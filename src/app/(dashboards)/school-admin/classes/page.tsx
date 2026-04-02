"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post } from "@/lib/api";
import { Users, BookOpen, PlusCircle, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

interface ClassRoom {
  id: number;
  name: string;
  level?: string;
  capacity?: number;
  students_count: number;
  class_teacher?: { name: string };
  subjects?: { id: number; name: string }[];
}

interface Teacher {
  id: number;
  name: string;
}

const emptyForm = { name: "", level: "", capacity: "", class_teacher_id: "" };

export default function ClassesPage() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ["classes"],
    queryFn: () => get<ClassRoom[]>("/classes"),
  });

  const { data: teachersData } = useQuery({
    queryKey: ["teachers"],
    queryFn: () =>
      get<{ data: Teacher[] }>("/users", { params: { role: "teacher" } }),
  });
  const teachers: Teacher[] = teachersData?.data?.data ?? [];

  const addClass = useMutation({
    mutationFn: (f: typeof emptyForm) =>
      post("/classes", {
        school_id: user?.school_id,
        name: f.name,
        level: f.level || undefined,
        capacity: f.capacity ? Number(f.capacity) : undefined,
        class_teacher_id: f.class_teacher_id
          ? Number(f.class_teacher_id)
          : undefined,
      }),
    onSuccess: () => {
      toast.success("Class created");
      qc.invalidateQueries({ queryKey: ["classes"] });
      setShowForm(false);
      setForm(emptyForm);
    },
    onError: () => toast.error("Failed to create class"),
  });

  const classes = data?.data ?? [];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-40 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Classes
        </h1>
        <Button
          leftIcon={<PlusCircle size={16} />}
          onClick={() => setShowForm(true)}
        >
          Add Class
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Class</CardTitle>
            <button
              onClick={() => setShowForm(false)}
              className="ml-auto p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X size={16} />
            </button>
          </CardHeader>
          <CardContent>
            <form
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                addClass.mutate(form);
              }}
            >
              <Input
                label="Class Name"
                required
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g. JSS 1A"
              />
              <Input
                label="Level (optional)"
                value={form.level}
                onChange={(e) =>
                  setForm((p) => ({ ...p, level: e.target.value }))
                }
                placeholder="e.g. Junior"
              />
              <Input
                label="Capacity (optional)"
                type="number"
                min="1"
                value={form.capacity}
                onChange={(e) =>
                  setForm((p) => ({ ...p, capacity: e.target.value }))
                }
              />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Class Teacher (optional)
                </label>
                <select
                  value={form.class_teacher_id}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, class_teacher_id: e.target.value }))
                  }
                  className="h-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm"
                >
                  <option value="">— Select teacher —</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={addClass.isPending}>
                  Create Class
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {classes.map((cls) => (
          <Card
            key={cls.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
          >
            <CardHeader>
              <CardTitle className="text-base">{cls.name}</CardTitle>
              {cls.level && (
                <Badge variant="blue" size="sm">
                  {cls.level}
                </Badge>
              )}
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <Users size={14} />
                <span>
                  {cls.students_count} / {cls.capacity ?? "∞"} students
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <BookOpen size={14} />
                <span>{cls.subjects?.length ?? 0} subjects</span>
              </div>
              {cls.class_teacher && (
                <p className="text-xs text-gray-500">
                  Class teacher:{" "}
                  <span className="font-medium">{cls.class_teacher.name}</span>
                </p>
              )}
              {cls.subjects && cls.subjects.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {cls.subjects.slice(0, 4).map((s) => (
                    <span
                      key={s.id}
                      className="text-xs bg-gray-100 dark:bg-gray-700 rounded px-1.5 py-0.5"
                    >
                      {s.name}
                    </span>
                  ))}
                  {cls.subjects.length > 4 && (
                    <span className="text-xs text-gray-400">
                      +{cls.subjects.length - 4}
                    </span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {classes.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">
            No classes found. Add your first class to get started.
          </div>
        )}
      </div>
    </div>
  );
}
