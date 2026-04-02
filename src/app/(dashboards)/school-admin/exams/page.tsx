"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post } from "@/lib/api";
import { Calendar, Clock, MapPin, PlusCircle, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

interface ExamSchedule extends Record<string, unknown> {
  id: number;
  title: string;
  exam_date: string;
  start_time: string;
  end_time: string;
  venue?: string;
  subject: { name: string };
  class_room: { name: string };
  term: { name: string };
}

interface ClassRoom {
  id: number;
  name: string;
}
interface Subject {
  id: number;
  name: string;
}
interface Term {
  id: number;
  name: string;
}
interface AcademicYear {
  id: number;
  name: string;
  terms: Term[];
}

const emptyForm = {
  title: "",
  class_room_id: "",
  subject_id: "",
  term_id: "",
  exam_date: "",
  start_time: "",
  end_time: "",
  venue: "",
  notes: "",
};

export default function ExamsPage() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading } = useQuery({
    queryKey: ["exam-schedules"],
    queryFn: () => get<ExamSchedule[]>("/exam-schedules"),
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

  const { data: yearsData } = useQuery({
    queryKey: ["academic-years"],
    queryFn: () => get<AcademicYear[]>("/academic-years"),
  });
  const terms: Term[] = (yearsData?.data ?? []).flatMap((y) => y.terms ?? []);

  const scheduleExam = useMutation({
    mutationFn: (f: typeof emptyForm) =>
      post("/exam-schedules", {
        school_id: user?.school_id,
        title: f.title,
        class_room_id: Number(f.class_room_id),
        subject_id: Number(f.subject_id),
        term_id: Number(f.term_id),
        exam_date: f.exam_date,
        start_time: f.start_time,
        end_time: f.end_time,
        venue: f.venue || undefined,
        notes: f.notes || undefined,
      }),
    onSuccess: () => {
      toast.success("Exam scheduled");
      qc.invalidateQueries({ queryKey: ["exam-schedules"] });
      setShowForm(false);
      setForm(emptyForm);
    },
    onError: () => toast.error("Failed to schedule exam"),
  });

  const exams = data?.data ?? [];

  const grouped = exams.reduce<Record<string, ExamSchedule[]>>((acc, exam) => {
    const date = exam.exam_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(exam);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Exam Schedules
        </h1>
        <Button
          leftIcon={<PlusCircle size={16} />}
          onClick={() => setShowForm(true)}
        >
          Schedule Exam
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Schedule New Exam</CardTitle>
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
                scheduleExam.mutate(form);
              }}
            >
              <Input
                label="Exam Title"
                required
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
                placeholder="e.g. Mid-Term Mathematics"
              />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Class *
                </label>
                <select
                  required
                  value={form.class_room_id}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, class_room_id: e.target.value }))
                  }
                  className="h-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm"
                >
                  <option value="">— Select class —</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Subject *
                </label>
                <select
                  required
                  value={form.subject_id}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, subject_id: e.target.value }))
                  }
                  className="h-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm"
                >
                  <option value="">— Select subject —</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Term *
                </label>
                <select
                  required
                  value={form.term_id}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, term_id: e.target.value }))
                  }
                  className="h-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm"
                >
                  <option value="">— Select term —</option>
                  {terms.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Exam Date"
                type="date"
                required
                value={form.exam_date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, exam_date: e.target.value }))
                }
              />
              <Input
                label="Start Time"
                type="time"
                required
                value={form.start_time}
                onChange={(e) =>
                  setForm((p) => ({ ...p, start_time: e.target.value }))
                }
              />
              <Input
                label="End Time"
                type="time"
                required
                value={form.end_time}
                onChange={(e) =>
                  setForm((p) => ({ ...p, end_time: e.target.value }))
                }
              />
              <Input
                label="Venue (optional)"
                value={form.venue}
                onChange={(e) =>
                  setForm((p) => ({ ...p, venue: e.target.value }))
                }
                placeholder="e.g. Main Hall"
              />
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={scheduleExam.isPending}>
                  Schedule Exam
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse"
            />
          ))}
        </div>
      )}

      {Object.entries(grouped)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, items]) => (
          <div key={date} className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-brand" />
              <h3 className="font-semibold text-gray-700 dark:text-gray-300">
                {new Date(date).toLocaleDateString("en-NG", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-6">
              {items.map((exam) => (
                <Card key={exam.id}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-semibold">{exam.subject?.name}</p>
                        <p className="text-xs text-gray-500">{exam.title}</p>
                      </div>
                      <Badge variant="blue">{exam.class_room?.name}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {exam.start_time} – {exam.end_time}
                      </span>
                      {exam.venue && (
                        <span className="flex items-center gap-1">
                          <MapPin size={12} /> {exam.venue}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{exam.term?.name}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

      {!isLoading && exams.length === 0 && (
        <Card>
          <CardContent className="text-center py-12 text-gray-400">
            No exams scheduled yet. Click "Schedule Exam" to add one.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
