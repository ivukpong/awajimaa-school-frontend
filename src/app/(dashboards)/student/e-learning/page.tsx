"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post } from "@/lib/api";
import { BookOpen, PlayCircle, FileText, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

interface Lesson {
  id: number;
  title: string;
  type: string;
  order: number;
  progress?: { completed_at: string | null };
}
interface Course {
  id: number;
  title: string;
  description: string;
  thumbnail?: string;
  teacher: { name: string };
  lessons: Lesson[];
  progress_pct?: number;
}

const typeIcon: Record<string, JSX.Element> = {
  video: <PlayCircle size={14} className="text-blue-500" />,
  document: <FileText size={14} className="text-orange-500" />,
  text: <FileText size={14} className="text-gray-500" />,
};

export default function StudentELearningPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: () => get<{ data: Course[] }>("/e-learning/courses"),
  });

  const markDone = useMutation({
    mutationFn: (lessonId: number) =>
      post(`/e-learning/lessons/${lessonId}/progress`, { completed: true }),
    onSuccess: () => {
      toast.success("Progress saved");
      qc.invalidateQueries({ queryKey: ["courses"] });
    },
  });

  const courses = data?.data.data ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        E-Learning
      </h1>

      {isLoading && (
        <div className="grid md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
            />
          ))}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {courses.map((c) => (
          <Card key={c.id}>
            <CardHeader>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center flex-shrink-0">
                  <BookOpen size={20} className="text-brand" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{c.title}</h3>
                  <p className="text-xs text-gray-400">By {c.teacher?.name}</p>
                </div>
              </div>
              {/* Progress bar */}
              <div className="mt-3">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Progress</span>
                  <span>{c.progress_pct ?? 0}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                  <div
                    className="bg-brand h-1.5 rounded-full transition-all"
                    style={{ width: `${c.progress_pct ?? 0}%` }}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {c.lessons?.map((l) => {
                  const done = !!l.progress?.completed_at;
                  return (
                    <li
                      key={l.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        {typeIcon[l.type] ?? typeIcon.text}
                        <span
                          className={`text-sm ${done ? "text-gray-400 line-through" : ""}`}
                        >
                          {l.title}
                        </span>
                      </div>
                      {done ? (
                        <CheckCircle size={16} className="text-green-500" />
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => markDone.mutate(l.id)}
                        >
                          Mark done
                        </Button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {!isLoading && courses.length === 0 && (
        <Card>
          <CardContent className="text-center py-12 text-gray-400">
            No courses available
          </CardContent>
        </Card>
      )}
    </div>
  );
}
