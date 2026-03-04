import { useState, useEffect, useCallback } from "react";
import { get, post, patch, del } from "@/lib/api";
import type { InventoryCategory, InventoryItem, InventoryTransaction, PurchaseOrder } from "@/types/inventory";
import type { AdmissionSession, AdmissionApplication } from "@/types/inventory";
import type { PaginatedResponse } from "@/types";

// ── Inventory Categories ──────────────────────────────────────────────────────
export function useInventoryCategories() {
    const [categories, setCategories] = useState<InventoryCategory[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchCategories = useCallback(async () => {
        setLoading(true);
        try {
            const res = await get<InventoryCategory[]>("/inventory/categories");
            setCategories(res.data);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchCategories(); }, [fetchCategories]);

    const createCategory = async (data: Partial<InventoryCategory>) => {
        await post("/inventory/categories", data);
        await fetchCategories();
    };
    const updateCategory = async (id: number, data: Partial<InventoryCategory>) => {
        await patch(`/inventory/categories/${id}`, data);
        await fetchCategories();
    };
    const deleteCategory = async (id: number) => {
        await del(`/inventory/categories/${id}`);
        await fetchCategories();
    };

    return { categories, loading, fetchCategories, createCategory, updateCategory, deleteCategory };
}

// ── Inventory Items ───────────────────────────────────────────────────────────
export function useInventory(params?: Record<string, string>) {
    const [items, setItems] = useState<PaginatedResponse<InventoryItem> | null>(null);
    const [summary, setSummary] = useState<Record<string, unknown> | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchItems = useCallback(async () => {
        setLoading(true);
        try {
            const query = params ? `?${new URLSearchParams(params)}` : "";
            const res = await get<PaginatedResponse<InventoryItem>>(`/inventory${query}`);
            setItems(res.data);
        } finally {
            setLoading(false);
        }
    }, [JSON.stringify(params)]);

    const fetchSummary = useCallback(async () => {
        const res = await get<Record<string, unknown>>("/inventory/summary");
        setSummary(res.data);
    }, []);

    useEffect(() => {
        fetchItems();
        fetchSummary();
    }, [fetchItems, fetchSummary]);

    const createItem = async (data: Partial<InventoryItem>) => {
        const res = await post<InventoryItem>("/inventory", data);
        await fetchItems();
        await fetchSummary();
        return res.data;
    };

    const updateItem = async (id: number, data: Partial<InventoryItem>) => {
        const res = await patch<InventoryItem>(`/inventory/${id}`, data);
        await fetchItems();
        return res.data;
    };

    const deleteItem = async (id: number) => {
        await del(`/inventory/${id}`);
        await fetchItems();
        await fetchSummary();
    };

    const recordTransaction = async (itemId: number, data: Record<string, unknown>) => {
        const res = await post<unknown>(`/inventory/${itemId}/transaction`, data);
        await fetchItems();
        await fetchSummary();
        return res.data;
    };

    const getTransactions = async (itemId: number) => {
        const res = await get<PaginatedResponse<InventoryTransaction>>(`/inventory/${itemId}/transactions`);
        return res.data;
    };

    return { items, summary, loading, fetchItems, fetchSummary, createItem, updateItem, deleteItem, recordTransaction, getTransactions };
}

// ── Purchase Orders ───────────────────────────────────────────────────────────
export function usePurchaseOrders(params?: Record<string, string>) {
    const [orders, setOrders] = useState<PaginatedResponse<PurchaseOrder> | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const query = params ? `?${new URLSearchParams(params)}` : "";
            const res = await get<PaginatedResponse<PurchaseOrder>>(`/purchase-orders${query}`);
            setOrders(res.data);
        } finally {
            setLoading(false);
        }
    }, [JSON.stringify(params)]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    const createOrder = async (data: Record<string, unknown>) => {
        const res = await post<PurchaseOrder>("/purchase-orders", data);
        await fetchOrders();
        return res.data;
    };
    const approveOrder = async (id: number) => { await post(`/purchase-orders/${id}/approve`); await fetchOrders(); };
    const receiveOrder = async (id: number, data: Record<string, unknown>) => { await post(`/purchase-orders/${id}/receive`, data); await fetchOrders(); };
    const cancelOrder = async (id: number) => { await post(`/purchase-orders/${id}/cancel`); await fetchOrders(); };

    return { orders, loading, fetchOrders, createOrder, approveOrder, receiveOrder, cancelOrder };
}

// ── Admissions ────────────────────────────────────────────────────────────────
export function useAdmissions() {
    const [sessions, setSessions] = useState<AdmissionSession[]>([]);
    const [applications, setApplications] = useState<PaginatedResponse<AdmissionApplication> | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchSessions = useCallback(async () => {
        const res = await get<AdmissionSession[]>("/admission-sessions");
        setSessions(res.data);
    }, []);

    const fetchApplications = useCallback(async (params?: Record<string, string>) => {
        setLoading(true);
        try {
            const query = params ? `?${new URLSearchParams(params)}` : "";
            const res = await get<PaginatedResponse<AdmissionApplication>>(`/admission-applications${query}`);
            setApplications(res.data);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSessions();
        fetchApplications();
    }, []);

    const createSession = async (data: Partial<AdmissionSession>) => {
        const res = await post<AdmissionSession>("/admission-sessions", data);
        await fetchSessions();
        return res.data;
    };

    const updateSession = async (id: number, data: Partial<AdmissionSession>) => {
        const res = await patch<AdmissionSession>(`/admission-sessions/${id}`, data);
        await fetchSessions();
        return res.data;
    };

    const updateApplicationStatus = async (id: number, data: Record<string, unknown>) => {
        const res = await patch<AdmissionApplication>(`/admission-applications/${id}/status`, data);
        await fetchApplications();
        return res.data;
    };

    const convertToStudent = async (id: number, data: Record<string, unknown>) => {
        const res = await post<unknown>(`/admission-applications/${id}/convert-student`, data);
        await fetchApplications();
        return res.data;
    };

    return { sessions, applications, loading, fetchSessions, fetchApplications, createSession, updateSession, updateApplicationStatus, convertToStudent };
}
