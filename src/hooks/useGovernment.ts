import { useState, useEffect, useCallback } from "react";
import { get, post, patch, del } from "@/lib/api";
import type {
    GovernmentProgram, ProgramApplication,
    GovernmentEvent, EventRegistration,
    SchoolApprovalRequest,
    GovernmentFeeType, GovernmentFeePayment,
    AppNotification,
} from "@/types/government";
import type { PaginatedResponse } from "@/types";

// ── Government Programs ───────────────────────────────────────────────────────
export function useGovernmentPrograms(params?: Record<string, string>) {
    const [programs, setPrograms] = useState<PaginatedResponse<GovernmentProgram> | null>(null);
    const [myApplications, setMyApplications] = useState<PaginatedResponse<ProgramApplication> | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchPrograms = useCallback(async () => {
        setLoading(true);
        try {
            const query = params ? `?${new URLSearchParams(params)}` : "";
            const res = await get<PaginatedResponse<GovernmentProgram>>(`/government-programs${query}`);
            setPrograms(res.data);
        } finally {
            setLoading(false);
        }
    }, [JSON.stringify(params)]);

    const fetchMyApplications = useCallback(async () => {
        const res = await get<PaginatedResponse<ProgramApplication>>("/my-program-applications");
        setMyApplications(res.data);
    }, []);

    useEffect(() => {
        fetchPrograms();
        fetchMyApplications();
    }, [fetchPrograms, fetchMyApplications]);

    const createProgram = async (data: Partial<GovernmentProgram>) => {
        const res = await post<GovernmentProgram>("/government-programs", data);
        await fetchPrograms();
        return res.data;
    };

    const updateProgram = async (id: number, data: Partial<GovernmentProgram>) => {
        const res = await patch<GovernmentProgram>(`/government-programs/${id}`, data);
        await fetchPrograms();
        return res.data;
    };

    const deleteProgram = async (id: number) => {
        await del(`/government-programs/${id}`);
        await fetchPrograms();
    };

    const applyToProgram = async (programId: number, data: Record<string, unknown>) => {
        const res = await post<ProgramApplication>(`/government-programs/${programId}/apply`, data);
        await fetchMyApplications();
        return res.data;
    };

    const reviewApplication = async (appId: number, data: Record<string, unknown>) => {
        const res = await patch<ProgramApplication>(`/program-applications/${appId}/review`, data);
        return res.data;
    };

    const disburseApplication = async (appId: number, amount_disbursed: number) => {
        const res = await post<unknown>(`/program-applications/${appId}/disburse`, { amount_disbursed });
        return res.data;
    };

    return { programs, myApplications, loading, fetchPrograms, fetchMyApplications, createProgram, updateProgram, deleteProgram, applyToProgram, reviewApplication, disburseApplication };
}

// ── Government Events ─────────────────────────────────────────────────────────
export function useGovernmentEvents(params?: Record<string, string>) {
    const [events, setEvents] = useState<PaginatedResponse<GovernmentEvent> | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchEvents = useCallback(async () => {
        setLoading(true);
        try {
            const query = params ? `?${new URLSearchParams(params)}` : "";
            const res = await get<PaginatedResponse<GovernmentEvent>>(`/government-events${query}`);
            setEvents(res.data);
        } finally {
            setLoading(false);
        }
    }, [JSON.stringify(params)]);

    useEffect(() => { fetchEvents(); }, [fetchEvents]);

    const createEvent = async (data: Partial<GovernmentEvent>) => {
        const res = await post<GovernmentEvent>("/government-events", data);
        await fetchEvents();
        return res.data;
    };

    const updateEvent = async (id: number, data: Partial<GovernmentEvent>) => {
        const res = await patch<GovernmentEvent>(`/government-events/${id}`, data);
        await fetchEvents();
        return res.data;
    };

    const deleteEvent = async (id: number) => {
        await del(`/government-events/${id}`);
        await fetchEvents();
    };

    const registerForEvent = async (eventId: number, data: Record<string, unknown>) => {
        const res = await post<EventRegistration>(`/government-events/${eventId}/register`, data);
        await fetchEvents();
        return res.data;
    };

    return { events, loading, fetchEvents, createEvent, updateEvent, deleteEvent, registerForEvent };
}

// ── School Approvals ──────────────────────────────────────────────────────────
export function useSchoolApprovals(params?: Record<string, string>) {
    const [requests, setRequests] = useState<PaginatedResponse<SchoolApprovalRequest> | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        try {
            const query = params ? `?${new URLSearchParams(params)}` : "";
            const res = await get<PaginatedResponse<SchoolApprovalRequest>>(`/approval-requests${query}`);
            setRequests(res.data);
        } finally {
            setLoading(false);
        }
    }, [JSON.stringify(params)]);

    useEffect(() => { fetchRequests(); }, [fetchRequests]);

    const createRequest = async (data: Partial<SchoolApprovalRequest>) => {
        const res = await post<SchoolApprovalRequest>("/approval-requests", data);
        await fetchRequests();
        return res.data;
    };

    const reviewRequest = async (id: number, data: Record<string, unknown>) => {
        const res = await patch<SchoolApprovalRequest>(`/approval-requests/${id}/review`, data);
        await fetchRequests();
        return res.data;
    };

    return { requests, loading, fetchRequests, createRequest, reviewRequest };
}

// ── Government Fees ───────────────────────────────────────────────────────────
export function useGovernmentFees() {
    const [feeTypes, setFeeTypes] = useState<GovernmentFeeType[]>([]);
    const [payments, setPayments] = useState<PaginatedResponse<GovernmentFeePayment> | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchFeeTypes = useCallback(async () => {
        const res = await get<GovernmentFeeType[]>("/government-fee-types");
        setFeeTypes(res.data);
    }, []);

    const fetchPayments = useCallback(async (params?: Record<string, string>) => {
        setLoading(true);
        try {
            const query = params ? `?${new URLSearchParams(params)}` : "";
            const res = await get<PaginatedResponse<GovernmentFeePayment>>(`/government-fee-payments${query}`);
            setPayments(res.data);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFeeTypes();
        fetchPayments();
    }, []);

    const payFee = async (data: Record<string, unknown>) => {
        const res = await post<GovernmentFeePayment>("/government-fee-payments", data);
        await fetchPayments();
        return res.data;
    };

    const confirmPayment = async (id: number, status: "confirmed" | "failed") => {
        await patch(`/government-fee-payments/${id}/confirm`, { status });
        await fetchPayments();
    };

    return { feeTypes, payments, loading, fetchFeeTypes, fetchPayments, payFee, confirmPayment };
}

// ── Notifications ─────────────────────────────────────────────────────────────
export function useNotifications() {
    const [notifications, setNotifications] = useState<PaginatedResponse<AppNotification> | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        setLoading(true);
        try {
            const res = await get<PaginatedResponse<AppNotification>>("/notifications");
            setNotifications(res.data);
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchUnreadCount = useCallback(async () => {
        const res = await get<{ count: number }>("/notifications/unread-count");
        setUnreadCount(res.data.count);
    }, []);

    useEffect(() => {
        fetchNotifications();
        fetchUnreadCount();
    }, []);

    const markRead = async (id: number) => {
        await patch(`/notifications/${id}/read`);
        await fetchNotifications();
        await fetchUnreadCount();
    };

    const markAllRead = async () => {
        await post("/notifications/mark-all-read");
        await fetchNotifications();
        setUnreadCount(0);
    };

    const deleteNotification = async (id: number) => {
        await del(`/notifications/${id}`);
        await fetchNotifications();
    };

    return { notifications, unreadCount, loading, fetchNotifications, fetchUnreadCount, markRead, markAllRead, deleteNotification };
}
