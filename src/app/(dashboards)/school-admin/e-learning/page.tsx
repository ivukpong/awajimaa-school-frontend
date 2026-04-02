"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post } from "@/lib/api";
import { BookOpen, Play, FileText, PlusCircle, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

interface Course {
  id: number;
  title: string;
  description?: string;
  thumbnail?: string;
  is_published: boolean;
  lessons_count: number;
  subject?: { name: string };
  class_room?: { name: string };
  teacher?: { name: string };
}

interface ClassRoom {
  id: number;
  name: string;
}
interface Subject {
  id: number;
  name: string;
}

const emptyForm = {
  title: "",
  description: "",
  subject_id: "",
  class_room_id: "",
  thumbnail: "",
  is_published: false,
};

export default function ELearningPage() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: () => get<Course[]>("/courses"),
  });

  const { data: classesData } = useQuery({
    queryKey: ["classes"],
    queryFn: () => get<ClassRoom[]>("/classes"),
  });
  const classes: ClassRoom[] = classesData?.data ?? [];

  const { data: subjectsData } = useQuery({
    queryKey: ["subjects"],
    queryFn: () => get<Subject[]>("/subjects"),
  });
  const subjects: Subject[] = subjectsData?.data ?? [];

  const createCourse = useMutation({
    mutationFn: (f: typeof emptyForm) =>
      post("/courses", {
        school_id: user?.school_id,
        title: f.title,
        description: f.description || undefined,
        subject_id: Number(f.subject_id),
        class_room_id: Number(f.class_room_id),
        thumbnail: f.thumbnail || undefined,
        is_published: f.is_published,
      }),
    onSuccess: () => {
      toast.success("Course created");
      qc.invalidateQueries({ queryKey: ["courses"] });
      setShowForm(false);
      setForm(emptyForm);
    },
    onError: () => toast.error("Failed to create course"),
  });

  const courses = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          E-Learning
        </h1>
        <Button
          leftIcon={<PlusCircle size={16} />}
          onClick={() => setShowForm(true)}
        >
          Create Course
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Create Course</CardTitle>
              <button onClick={() => setShowForm(false)}>
                <X size={18} />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Title *
                </label>
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Course title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Class *
                </label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800"
                  value={form.class_room_id}
                  onChange={(e) =>
                    setForm({ ...form, class_room_id: e.target.value })
                  }
                >
                  <option value="">Select class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Subject *
                </label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800"
                  value={form.subject_id}
                  onChange={(e) =>
                    setForm({ ...form, subject_id: e.target.value })
                  }
                >
                  <option value="">Select subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  className="w-full border rounded-md px-3 py-2 text-sm bg-white dark:bg-gray-800"
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Course description"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium mb-1">
                  Thumbnail URL
                </label>
                <Input
                  value={form.thumbnail}
                  onChange={(e) =>
                    setForm({ ...form, thumbnail: e.target.value })
                  }
                  placeholder="https://..."
                />
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <input
                  type="checkbox"
                  id="is_published_course"
                  checked={form.is_published}
                  onChange={(e) =>
                    setForm({ ...form, is_published: e.target.checked })
                  }
                />
                <label htmlFor="is_published_course" className="text-sm">
                  Publish immediately
                </label>
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => createCourse.mutate(form)}
                  disabled={
                    createCourse.isPending ||
                    !form.title ||
                    !form.class_room_id ||
                    !form.subject_id
                  }
                >
                  {createCourse.isPending ? "Creating..." : "Create Course"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
              />
            ))
          : courses.map((course) => (
              <Card
                key={course.id}
                className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              >
                {course.thumbnail ? (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <div className="w-full h-32 bg-gradient-to-br from-brand to-brand-light flex items-center justify-center">
                    <BookOpen size={40} className="text-white opacity-60" />
                  </div>
                )}
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-sm leading-snug">
                      {course.title}
                    </h3>
                    <Badge
                      variant={course.is_published ? "green" : "yellow"}
                      size="sm"
                    >
                      {course.is_published ? "Live" : "Draft"}
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Play size={12} /> {course.lessons_count} lessons
                    </span>
                    <span>{course.class_room?.name ?? ""}</span>
                  </div>
                </CardContent>
              </Card>
            ))}

        {!isLoading && courses.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">
            No courses yet. Create your first course to get started.
          </div>
        )}
      </div>
    </div>
  );
}
