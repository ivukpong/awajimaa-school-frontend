"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post } from "@/lib/api";
import { CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/utils";

interface Student {
  id: number;
  full_name: string;
  admission_number: string;
}
interface ClassRoom {
  id: number;
  name: string;
}
interface AttendanceRecord {
  student_id: number;
  status: "present" | "absent" | "late";
}

export default function TeacherAttendancePage() {
  const today = new Date().toISOString().slice(0, 10);
  const [classId, setClassId] = useState("");
  const [date, setDate] = useState(today);
  const [records, setRecords] = useState<
    Record<number, "present" | "absent" | "late">
  >({});
  const qc = useQueryClient();

  const { data: classes } = useQuery({
    queryKey: ["my-classes"],
    queryFn: () => get<{ data: ClassRoom[] }>("/academic/classes"),
  });

  const { data: studentsData } = useQuery({
    queryKey: ["class-students", classId],
    queryFn: () =>
      get<{ data: Student[] }>(`/students`, {
        params: { class_room_id: classId },
      }),
    enabled: !!classId,
  });

  const students = studentsData?.data.data ?? [];

  const batch = useMutation({
    mutationFn: (payload: any) => post("/attendance/batch", payload),
    onSuccess: () => {
      toast.success("Attendance saved");
      qc.invalidateQueries({ queryKey: ["attendance"] });
    },
  });

  const setStatus = (id: number, status: "present" | "absent" | "late") =>
    setRecords((r) => ({ ...r, [id]: status }));

  const handleSubmit = () => {
    const data = students.map((s) => ({
      student_id: s.id,
      status: records[s.id] ?? "absent",
      date,
    }));
    batch.mutate({ class_room_id: classId, date, records: data });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Mark Attendance
      </h1>

      <Card>
        <CardContent className="p-4 flex gap-4 flex-wrap">
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">
              Class
            </label>
            <select
              className="border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700"
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
            >
              <option value="">Select class</option>
              {(classes?.data.data ?? []).map((c: ClassRoom) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700"
            />
          </div>
        </CardContent>
      </Card>

      {students.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Students ({students.length})</CardTitle>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  const all: Record<number, "present"> = {};
                  students.forEach((s) => {
                    all[s.id] = "present";
                  });
                  setRecords(all);
                }}
              >
                Mark All Present
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                loading={batch.isPending}
              >
                Save
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {students.map((s) => {
                const status = records[s.id];
                return (
                  <div
                    key={s.id}
                    className="py-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-sm">{s.full_name}</p>
                      <p className="text-xs text-gray-400">
                        {s.admission_number}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {(["present", "late", "absent"] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => setStatus(s.id, st)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors
                            ${
                              status === st
                                ? st === "present"
                                  ? "bg-green-500 text-white border-green-500"
                                  : st === "late"
                                    ? "bg-yellow-400 text-white border-yellow-400"
                                    : "bg-red-500 text-white border-red-500"
                                : "border-gray-200 dark:border-gray-700 text-gray-500"
                            }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
