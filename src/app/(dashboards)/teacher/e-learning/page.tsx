"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post, patch } from "@/lib/api";
import { Plus, BookOpen, Eye } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import toast from "react-hot-toast";

interface Course {
  id: number;
  title: string;
  description?: string;
  subject?: { name: string };
  is_published: boolean;
  lessons_count?: number;
}

export default function TeacherELearningPage() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const { data, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: () =>
      get<any>("/courses").then((r) => r.data?.data ?? r.data ?? []),
  });
  const courses: Course[] = Array.isArray(data) ? data : [];

  const createMutation = useMutation({
    mutationFn: (payload: any) => post("/courses", payload),
    onSuccess: () => {
      toast.success("Course created");
      qc.invalidateQueries({ queryKey: ["courses"] });
      setModal(false);
    },
    onError: () => toast.error("Failed to create course"),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            E-Learning
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage your courses and lessons
          </p>
        </div>
        <Button
          onClick={() => setModal(true)}
          leftIcon={<Plus className="h-4 w-4" />}
        >
          New Course
        </Button>
      </div>

      {isLoading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-32 rounded-xl bg-gray-100 dark:bg-gray-800 animate-pulse"
            />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-gray-500 text-center py-8">
              No courses yet. Create your first course.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {courses.map((c) => (
            <Card key={c.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                      <BookOpen className="h-5 w-5 text-brand" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {c.title}
                      </p>
                      {c.subject && (
                        <p className="text-xs text-gray-500">
                          {c.subject.name}
                        </p>
                      )}
                      {c.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {c.description}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant={c.is_published ? "green" : "yellow"}>
                    {c.is_published ? "Published" : "Draft"}
                  </Badge>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {c.lessons_count ?? 0} lessons
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<Eye className="h-3.5 w-3.5" />}
                  >
                    View
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setModal(false)}
          />
          <Card className="relative w-full max-w-md mx-4 z-10">
            <CardHeader>
              <CardTitle>New Course</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  createMutation.mutate(Object.fromEntries(fd));
                }}
                className="space-y-4"
              >
                <Input label="Course Title" name="title" required />
                <Input label="Description" name="description" />
                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" loading={createMutation.isPending}>
                    Create Course
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
