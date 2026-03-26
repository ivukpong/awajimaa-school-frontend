import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post } from "@/lib/api";
import type { Wallet, WalletTransaction, WalletPayout, PaginatedResponse } from "@/types";

interface TransactionFilters {
    currency?: "usd" | "ngn";
    type?: "credit" | "debit";
    page?: number;
}

export function useWalletBalance() {
    return useQuery({
        queryKey: ["wallet-balance"],
        queryFn: () => get<{ usd: Wallet; ngn: Wallet }>("/wallet/balance"),
    });
}

export function useWalletTransactions(params: TransactionFilters = {}) {
    return useQuery({
        queryKey: ["wallet-transactions", params],
        queryFn: () =>
            get<PaginatedResponse<WalletTransaction>>("/wallet/transactions", { params }),
    });
}

export function useWalletPayouts() {
    return useQuery({
        queryKey: ["wallet-payouts"],
        queryFn: () => get<WalletPayout[]>("/wallet/payouts"),
    });
}

export function useRequestPayout() {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (data: {
            currency: "usd" | "ngn";
            amount: number;
            bank_name: string;
            account_number: string;
            account_name: string;
        }) => post<WalletPayout>("/wallet/payout", data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["wallet-balance"] });
            qc.invalidateQueries({ queryKey: ["wallet-payouts"] });
        },
    });
}
