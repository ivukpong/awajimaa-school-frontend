"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post } from "@/lib/api";
import { Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import toast from "react-hot-toast";

interface Student {
  id: number;
  full_name: string;
  admission_number: string;
}

interface ScoreRow {
  student_id: number;
  ca1: string;
  ca2: string;
  ca3: string;
  exam: string;
}

export default function TeacherResultsPage() {
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [termId, setTermId] = useState("");
  const [scores, setScores] = useState<Record<number, ScoreRow>>({});
  const qc = useQueryClient();

  const { data: classes } = useQuery({
    queryKey: ["my-classes"],
    queryFn: () => get<any>("/academic/classes"),
  });
  const { data: subjects } = useQuery({
    queryKey: ["subjects"],
    queryFn: () => get<any>("/academic/subjects"),
  });
  const { data: terms } = useQuery({
    queryKey: ["terms"],
    queryFn: () => get<any>("/academic/terms"),
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
    mutationFn: (payload: any) => post("/results/batch", payload),
    onSuccess: () => {
      toast.success("Results saved");
    },
  });

  const setScore = (id: number, field: keyof ScoreRow, val: string) =>
    setScores((s) => ({
      ...s,
      [id]: {
        ...(s[id] ?? { student_id: id, ca1: "", ca2: "", ca3: "", exam: "" }),
        [field]: val,
      },
    }));

  const handleSubmit = () => {
    const results = students.map((s) => ({
      student_id: s.id,
      subject_id: Number(subjectId),
      term_id: Number(termId),
      ca1: Number(scores[s.id]?.ca1 ?? 0),
      ca2: Number(scores[s.id]?.ca2 ?? 0),
      ca3: Number(scores[s.id]?.ca3 ?? 0),
      exam: Number(scores[s.id]?.exam ?? 0),
    }));
    batch.mutate({ results });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Enter Results
      </h1>

      <Card>
        <CardContent className="p-4 flex gap-4 flex-wrap">
          {[
            {
              label: "Class",
              val: classId,
              set: setClassId,
              items: classes?.data.data ?? [],
              key: "name",
            },
            {
              label: "Subject",
              val: subjectId,
              set: setSubjectId,
              items: subjects?.data.data ?? [],
              key: "name",
            },
            {
              label: "Term",
              val: termId,
              set: setTermId,
              items: terms?.data.data ?? [],
              key: "name",
            },
          ].map(({ label, val, set, items, key }) => (
            <div key={label}>
              <label className="text-xs font-medium text-gray-500 block mb-1">
                {label}
              </label>
              <select
                value={val}
                onChange={(e) => set(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700"
              >
                <option value="">Select {label.toLowerCase()}</option>
                {items.map((it: any) => (
                  <option key={it.id} value={it.id}>
                    {it[key]}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </CardContent>
      </Card>

      {students.length > 0 && classId && subjectId && termId && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Students ({students.length})</CardTitle>
            <Button
              size="sm"
              leftIcon={<Save size={14} />}
              onClick={handleSubmit}
              loading={batch.isPending}
            >
              Save Results
            </Button>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b dark:border-gray-700">
                  <th className="text-left py-2 font-medium text-gray-500">
                    Student
                  </th>
                  {["CA1 /30", "CA2 /30", "CA3 /10", "Exam /100"].map((h) => (
                    <th
                      key={h}
                      className="text-center py-2 font-medium text-gray-500 w-24"
                    >
                      {h}
                    </th>
                  ))}
                  <th className="text-center py-2 font-medium text-gray-500">
                    Grade
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {students.map((s) => {
                  const row = scores[s.id] ?? {
                    ca1: "",
                    ca2: "",
                    ca3: "",
                    exam: "",
                  };
                  const total = [row.ca1, row.ca2, row.ca3, row.exam].reduce(
                    (a, v) => a + (Number(v) || 0),
                    0,
                  );
                  const grade =
                    total >= 70
                      ? "A"
                      : total >= 60
                        ? "B"
                        : total >= 50
                          ? "C"
                          : total >= 45
                            ? "D"
                            : total >= 40
                              ? "E"
                              : "F";
                  return (
                    <tr key={s.id}>
                      <td className="py-2">
                        <p className="font-medium">{s.full_name}</p>
                        <p className="text-xs text-gray-400">
                          {s.admission_number}
                        </p>
                      </td>
                      {(["ca1", "ca2", "ca3", "exam"] as const).map((f) => (
                        <td key={f} className="py-2 px-1 text-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={row[f]}
                            onChange={(e) => setScore(s.id, f, e.target.value)}
                            className="w-20 text-center border rounded px-2 py-1 text-sm dark:bg-gray-800 dark:border-gray-700"
                          />
                        </td>
                      ))}
                      <td className="py-2 text-center">
                        <Badge
                          variant={
                            grade === "A"
                              ? "green"
                              : grade === "B"
                                ? "blue"
                                : grade === "C"
                                  ? "yellow"
                                  : "red"
                          }
                          size="sm"
                        >
                          {grade}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
