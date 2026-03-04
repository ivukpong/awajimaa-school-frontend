import { useState, useEffect, useCallback } from "react";
import { get, post, patch, del } from "@/lib/api";
import type { Department, TeacherProfile, SalaryStructure, PayrollRun, PayrollItem, LeaveType, LeaveRequest, JobPosting, JobApplication } from "@/types/hr";
import type { PaginatedResponse } from "@/types";

// ── Departments ───────────────────────────────────────────────────────────────
export function useDepartments() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDepartments = useCallback(async () => {
        setLoading(true);
        try {
            const res = await get<Department[]>("/departments");
            setDepartments(res.data);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchDepartments(); }, [fetchDepartments]);

    const createDepartment = async (data: Partial<Department>) => {
        const res = await post<Department>("/departments", data);
        await fetchDepartments();
        return res.data;
    };

    const updateDepartment = async (id: number, data: Partial<Department>) => {
        const res = await patch<Department>(`/departments/${id}`, data);
        await fetchDepartments();
        return res.data;
    };

    const deleteDepartment = async (id: number) => {
        await del(`/departments/${id}`);
        await fetchDepartments();
    };

    return { departments, loading, fetchDepartments, createDepartment, updateDepartment, deleteDepartment };
}

// ── Teacher Profiles ──────────────────────────────────────────────────────────
export function useTeacherProfiles(params?: Record<string, string>) {
    const [teachers, setTeachers] = useState<PaginatedResponse<TeacherProfile> | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchTeachers = useCallback(async () => {
        setLoading(true);
        try {
            const query = new URLSearchParams(params).toString();
            const res = await get<PaginatedResponse<TeacherProfile>>(`/teacher-profiles?${query}`);
            setTeachers(res.data);
        } finally {
            setLoading(false);
        }
    }, [JSON.stringify(params)]);

    useEffect(() => { fetchTeachers(); }, [fetchTeachers]);

    const createTeacher = async (data: Record<string, unknown>) => {
        const res = await post<TeacherProfile>("/teacher-profiles", data);
        await fetchTeachers();
        return res.data;
    };

    const updateTeacher = async (id: number, data: Partial<TeacherProfile>) => {
        const res = await patch<TeacherProfile>(`/teacher-profiles/${id}`, data);
        await fetchTeachers();
        return res.data;
    };

    const assignSalaryStructure = async (id: number, data: Record<string, unknown>) => {
        const res = await post<unknown>(`/teacher-profiles/${id}/salary`, data);
        return res.data;
    };

    return { teachers, loading, fetchTeachers, createTeacher, updateTeacher, assignSalaryStructure };
}

// ── Salary Structures ─────────────────────────────────────────────────────────
export function useSalaryStructures() {
    const [structures, setStructures] = useState<SalaryStructure[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchStructures = useCallback(async () => {
        setLoading(true);
        try {
            const res = await get<SalaryStructure[]>("/salary-structures");
            setStructures(res.data);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchStructures(); }, [fetchStructures]);

    const createStructure = async (data: Partial<SalaryStructure>) => {
        const res = await post<SalaryStructure>("/salary-structures", data);
        await fetchStructures();
        return res.data;
    };

    const updateStructure = async (id: number, data: Partial<SalaryStructure>) => {
        const res = await patch<SalaryStructure>(`/salary-structures/${id}`, data);
        await fetchStructures();
        return res.data;
    };

    return { structures, loading, fetchStructures, createStructure, updateStructure };
}

// ── Payroll Runs ──────────────────────────────────────────────────────────────
export function usePayroll() {
    const [runs, setRuns] = useState<PaginatedResponse<PayrollRun> | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchRuns = useCallback(async () => {
        setLoading(true);
        try {
            const res = await get<PaginatedResponse<PayrollRun>>("/payroll-runs");
            setRuns(res.data);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchRuns(); }, [fetchRuns]);

    const generateRun = async (month: string) => {
        const res = await post<PayrollRun>("/payroll-runs/generate", { month });
        await fetchRuns();
        return res.data;
    };

    const approveRun = async (id: number) => {
        await post(`/payroll-runs/${id}/approve`);
        await fetchRuns();
    };

    const markPaid = async (id: number) => {
        await post(`/payroll-runs/${id}/mark-paid`);
        await fetchRuns();
    };

    const getRunDetails = async (id: number) => {
        const res = await get<PayrollRun & { items: PayrollItem[] }>(`/payroll-runs/${id}`);
        return res.data;
    };

    return { runs, loading, fetchRuns, generateRun, approveRun, markPaid, getRunDetails };
}

// ── Leave Types & Requests ────────────────────────────────────────────────────
export function useLeave() {
    const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
    const [requests, setRequests] = useState<PaginatedResponse<LeaveRequest> | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchLeaveTypes = useCallback(async () => {
        const res = await get<LeaveType[]>("/leave-types");
        setLeaveTypes(res.data);
    }, []);

    const fetchRequests = useCallback(async (params?: Record<string, string>) => {
        setLoading(true);
        try {
            const query = new URLSearchParams(params).toString();
            const res = await get<PaginatedResponse<LeaveRequest>>(`/leave-requests?${query}`);
            setRequests(res.data);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLeaveTypes();
        fetchRequests();
    }, []);

    const applyLeave = async (data: Record<string, unknown>) => {
        const res = await post<LeaveRequest>("/leave-requests", data);
        await fetchRequests();
        return res.data;
    };

    const approveLeave = async (id: number, note?: string) => {
        await post(`/leave-requests/${id}/approve`, { note });
        await fetchRequests();
    };

    const rejectLeave = async (id: number, note: string) => {
        await post(`/leave-requests/${id}/reject`, { note });
        await fetchRequests();
    };

    const cancelLeave = async (id: number) => {
        await post(`/leave-requests/${id}/cancel`);
        await fetchRequests();
    };

    return { leaveTypes, requests, loading, fetchLeaveTypes, fetchRequests, applyLeave, approveLeave, rejectLeave, cancelLeave };
}

// ── Recruitment ───────────────────────────────────────────────────────────────
export function useRecruitment() {
    const [postings, setPostings] = useState<PaginatedResponse<JobPosting> | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchPostings = useCallback(async () => {
        setLoading(true);
        try {
            const res = await get<PaginatedResponse<JobPosting>>("/job-postings");
            setPostings(res.data);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchPostings(); }, [fetchPostings]);

    const createPosting = async (data: Partial<JobPosting>) => {
        const res = await post<JobPosting>("/job-postings", data);
        await fetchPostings();
        return res.data;
    };

    const updatePosting = async (id: number, data: Partial<JobPosting>) => {
        const res = await patch<JobPosting>(`/job-postings/${id}`, data);
        await fetchPostings();
        return res.data;
    };

    const deletePosting = async (id: number) => {
        await del(`/job-postings/${id}`);
        await fetchPostings();
    };

    const getApplications = async (postingId: number) => {
        const res = await get<PaginatedResponse<JobApplication>>(`/job-postings/${postingId}/applications`);
        return res.data;
    };

    const updateApplicationStatus = async (appId: number, status: string, notes?: string) => {
        const res = await patch<JobApplication>(`/job-applications/${appId}/status`, { status, review_notes: notes });
        return res.data;
    };

    return { postings, loading, fetchPostings, createPosting, updatePosting, deletePosting, getApplications, updateApplicationStatus };
}
