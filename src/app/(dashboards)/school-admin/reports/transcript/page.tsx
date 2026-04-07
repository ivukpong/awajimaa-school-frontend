"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Table, type Column } from "@/components/ui/Table";
import { StatCard } from "@/components/ui/StatCard";
import {
  ScrollText,
  Search,
  Printer,
  GraduationCap,
  TrendingUp,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useStudents } from "@/hooks/useStudents";
import { useTranscript, type TranscriptResult } from "@/hooks/useTranscript";
import { get } from "@/lib/api";

interface AcademicYear {
  id: number;
  name: string;
}

interface Term {
  id: number;
  name: string;
}

const gradeColor: Record<string, string> = {
  A: "bg-green-100 text-green-800",
  B: "bg-blue-100 text-blue-800",
  C: "bg-yellow-100 text-yellow-800",
  D: "bg-orange-100 text-orange-800",
  E: "bg-red-100 text-red-800",
  F: "bg-red-200 text-red-900",
};

const resultColumns: Column<TranscriptResult>[] = [
  { key: "subject", header: "Subject", render: (r) => r.subject?.name ?? "—" },
  { key: "ca1", header: "CA1", render: (r) => r.ca1 ?? "—" },
  { key: "ca2", header: "CA2", render: (r) => r.ca2 ?? "—" },
  { key: "ca3", header: "CA3", render: (r) => r.ca3 ?? "—" },
  { key: "exam", header: "Exam", render: (r) => r.exam ?? "—" },
  { key: "total", header: "Total", render: (r) => r.total ?? "—" },
  {
    key: "grade",
    header: "Grade",
    render: (r) =>
      r.grade ? (
        <span
          className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${gradeColor[r.grade] ?? "bg-gray-100 text-gray-700"}`}
        >
          {r.grade}
        </span>
      ) : (
        "—"
      ),
  },
  { key: "remark", header: "Remark", render: (r) => r.remark ?? "—" },
  {
    key: "position",
    header: "Position",
    render: (r) =>
      r.position && r.out_of ? `${r.position} / ${r.out_of}` : "—",
  },
];

export default function TranscriptsPage() {
  const [search, setSearch] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null,
  );
  const [academicYearId, setAcademicYearId] = useState<number | undefined>();
  const [termId, setTermId] = useState<number | undefined>();

  const { data: studentsData } = useStudents({});
  const allStudents = studentsData?.data?.data ?? [];

  const { data: yearsData } = useQuery({
    queryKey: ["academic-years"],
    queryFn: () => get<unknown>("/academic-years"),
  });
  const years: AcademicYear[] = (yearsData as any)?.data ?? [];

  const { data: termsData } = useQuery({
    queryKey: ["terms"],
    queryFn: () => get<unknown>("/terms"),
    retry: false,
  });
  const terms: Term[] = (termsData as any)?.data ?? [];

  const { data: transcript, isLoading } = useTranscript(selectedStudentId, {
    academic_year_id: academicYearId,
    term_id: termId,
  });

  const filteredStudents = allStudents.filter((s: any) =>
    s.full_name?.toLowerCase().includes(search.toLowerCase()),
  );

  const selectedStudent = allStudents.find(
    (s: any) => s.id === selectedStudentId,
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <ScrollText className="h-6 w-6 text-brand" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Student Transcripts
          </h1>
          <p className="text-sm text-gray-500">
            View and print academic transcripts for any student
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Select Student</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search student name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            <select
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand min-w-[180px]"
              value={selectedStudentId ?? ""}
              onChange={(e) =>
                setSelectedStudentId(
                  e.target.value ? Number(e.target.value) : null,
                )
              }
            >
              <option value="">— Pick a student —</option>
              {filteredStudents.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.full_name} ({s.admission_number})
                </option>
              ))}
            </select>

            <select
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand min-w-[150px]"
              value={academicYearId ?? ""}
              onChange={(e) =>
                setAcademicYearId(
                  e.target.value ? Number(e.target.value) : undefined,
                )
              }
            >
              <option value="">All Years</option>
              {years.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.name}
                </option>
              ))}
            </select>

            <select
              className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand min-w-[130px]"
              value={termId ?? ""}
              onChange={(e) =>
                setTermId(e.target.value ? Number(e.target.value) : undefined)
              }
            >
              <option value="">All Terms</option>
              {terms.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Transcript viewer */}
      {selectedStudentId && (
        <>
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">
              Loading transcript…
            </div>
          ) : transcript?.success ? (
            <div className="space-y-6" id="transcript-print">
              {/* Student info */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5 text-brand" />
                    {transcript.student.user?.name}
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.print()}
                    className="print:hidden"
                  >
                    <Printer className="h-4 w-4 mr-1" />
                    Print
                  </Button>
                </CardHeader>
                <CardContent>
                  <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
                    <div>
                      <dt className="text-gray-500">Admission No.</dt>
                      <dd className="font-medium">
                        {transcript.student.admission_number}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">Class</dt>
                      <dd className="font-medium">
                        {transcript.student.currentClass?.name ?? "N/A"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-gray-500">School</dt>
                      <dd className="font-medium">
                        {transcript.student.school?.name}
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>

              {/* Summary stats */}
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <StatCard
                  title="Subjects"
                  value={transcript.summary.total_subjects}
                  icon={<ScrollText className="h-5 w-5" />}
                />
                <StatCard
                  title="Average Score"
                  value={`${transcript.summary.average}%`}
                  icon={<TrendingUp className="h-5 w-5" />}
                />
                <StatCard
                  title="Passed"
                  value={transcript.summary.passed}
                  icon={<CheckCircle2 className="h-5 w-5 text-green-600" />}
                />
                <StatCard
                  title="Failed"
                  value={transcript.summary.failed}
                  icon={<XCircle className="h-5 w-5 text-red-500" />}
                />
              </div>

              {/* Results table */}
              <Card>
                <CardHeader>
                  <CardTitle>Subject Results</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table
                    keyField="id"
                    columns={resultColumns}
                    data={transcript.results}
                  />
                </CardContent>
              </Card>

              {/* Comments */}
              {transcript.results.some(
                (r: TranscriptResult) => r.teacher_comment || r.remark,
              ) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Comments</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {transcript.results
                      .filter((r: TranscriptResult) => r.teacher_comment)
                      .map((r: TranscriptResult) => (
                        <div key={r.id} className="flex gap-2">
                          <Badge variant="gray">{r.subject?.name}</Badge>
                          <span className="text-gray-700">
                            {r.teacher_comment}
                          </span>
                        </div>
                      ))}
                  </CardContent>
                </Card>
              )}
            </div>
          ) : (
            <div className="text-center py-16 text-gray-500">
              No results found for this student with the selected filters.
            </div>
          )}
        </>
      )}

      {!selectedStudentId && (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <ScrollText className="h-12 w-12 mb-4 opacity-30" />
          <p className="text-lg font-medium">
            Select a student to view their transcript
          </p>
        </div>
      )}
    </div>
  );
}
