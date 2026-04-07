import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import type { ApiResponse } from "@/types";

export interface TranscriptResult {
    id: number;
    subject: { id: number; name: string; code: string };
    term: { id: number; name: string };
    academicYear: { id: number; name: string };
    ca1: number | null;
    ca2: number | null;
    ca3: number | null;
    exam: number | null;
    total: number | null;
    grade: string | null;
    remark: string | null;
    position: number | null;
    out_of: number | null;
    teacher_comment: string | null;
}

export interface TranscriptSummary {
    total_subjects: number;
    average: number;
    passed: number;
    failed: number;
}

export interface TranscriptData {
    success: boolean;
    student: {
        id: number;
        admission_number: string;
        user: { id: number; name: string };
        currentClass: { id: number; name: string } | null;
        school: { id: number; name: string };
    };
    results: TranscriptResult[];
    summary: TranscriptSummary;
}

export function useTranscript(
    studentId: number | null,
    filters: { academic_year_id?: number; term_id?: number }
) {
    return useQuery<TranscriptData>({
        queryKey: ["transcript", studentId, filters],
        queryFn: async () => {
            const params = new URLSearchParams();
            if (filters.academic_year_id)
                params.set("academic_year_id", String(filters.academic_year_id));
            if (filters.term_id) params.set("term_id", String(filters.term_id));
            const res = await get<TranscriptData>(`/students/${studentId}/transcript?${params.toString()}`);
            return res.data;
        },
        enabled: !!studentId,
    });
}
