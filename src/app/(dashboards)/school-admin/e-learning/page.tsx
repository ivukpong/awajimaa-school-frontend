"use client";

import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import { BookOpen, Play, FileText, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

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

export default function ELearningPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: () => get<Course[]>("/courses"),
  });

  const courses = data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          E-Learning
        </h1>
        <Button leftIcon={<PlusCircle size={16} />}>Create Course</Button>
      </div>

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
