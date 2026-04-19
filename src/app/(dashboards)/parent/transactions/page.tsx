"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import { Receipt, ArrowDownLeft, ArrowUpRight, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

interface Transaction {
  id: number;
  type: "payment" | "refund" | "waiver" | "charge";
  description: string;
  reference?: string;
  amount: number;
  status: "completed" | "refunded" | "canceled" | "waived" | "pending";
  created_at: string;
  student_name?: string;
}

const statusVariant: Record<
  Transaction["status"],
  "green" | "red" | "yellow" | "purple" | "blue"
> = {
  completed: "green",
  refunded: "blue",
  canceled: "red",
  waived: "purple",
  pending: "yellow",
};

const statusLabel: Record<Transaction["status"], string> = {
  completed: "Completed",
  refunded: "Refunded",
  canceled: "Canceled",
  waived: "Waived",
  pending: "Pending",
};

const demoTransactions: Transaction[] = [
  {
    id: 1,
    type: "payment",
    description: "First Term School Fees – Chidinma",
    reference: "TXN-2024-001",
    amount: 45000,
    status: "completed",
    created_at: "2024-09-05T10:30:00Z",
    student_name: "Chidinma",
  },
  {
    id: 2,
    type: "refund",
    description: "Overpayment Refund – Chidinma",
    reference: "TXN-2024-002",
    amount: 3000,
    status: "refunded",
    created_at: "2024-09-08T14:00:00Z",
    student_name: "Chidinma",
  },
  {
    id: 3,
    type: "payment",
    description: "Second Term School Fees – Emeka",
    reference: "TXN-2024-003",
    amount: 38000,
    status: "completed",
    created_at: "2024-11-01T09:15:00Z",
    student_name: "Emeka",
  },
  {
    id: 4,
    type: "waiver",
    description: "PTA Development Levy Waiver",
    reference: "TXN-2024-004",
    amount: 5000,
    status: "waived",
    created_at: "2024-11-10T11:00:00Z",
    student_name: "Emeka",
  },
  {
    id: 5,
    type: "charge",
    description: "Excursion Fee – Chidinma",
    reference: "TXN-2024-005",
    amount: 7500,
    status: "canceled",
    created_at: "2024-12-01T08:00:00Z",
    student_name: "Chidinma",
  },
  {
    id: 6,
    type: "payment",
    description: "Third Term School Fees – Chidinma",
    reference: "TXN-2025-001",
    amount: 45000,
    status: "pending",
    created_at: "2025-01-10T10:00:00Z",
    student_name: "Chidinma",
  },
];

function formatCurrency(n: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(n);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function ParentTransactionsPage() {
  const { data, isLoading } = useQuery<Transaction[]>({
    queryKey: ["parent-transactions"],
    queryFn: async () => {
      const res = await get<Transaction[]>("/finance/transactions");
      return res.data ?? [];
    },
  });

  const transactions = data ?? demoTransactions;

  const totalPaid = transactions
    .filter((t) => t.status === "completed" && t.type === "payment")
    .reduce((s, t) => s + t.amount, 0);

  const totalRefunded = transactions
    .filter((t) => t.status === "refunded")
    .reduce((s, t) => s + t.amount, 0);

  const totalWaived = transactions
    .filter((t) => t.status === "waived")
    .reduce((s, t) => s + t.amount, 0);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Transaction History
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            All financial transactions for your wards
          </p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          {
            label: "Total Paid",
            value: formatCurrency(totalPaid),
            color: "text-green-600",
            bg: "bg-green-50 dark:bg-green-900/20",
          },
          {
            label: "Total Refunded",
            value: formatCurrency(totalRefunded),
            color: "text-blue-600",
            bg: "bg-blue-50 dark:bg-blue-900/20",
          },
          {
            label: "Total Waived",
            value: formatCurrency(totalWaived),
            color: "text-purple-600",
            bg: "bg-purple-50 dark:bg-purple-900/20",
          },
        ].map((s) => (
          <Card key={s.label} className={`${s.bg} border-0`}>
            <CardContent className="p-4 text-center">
              <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Transactions list */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Receipt className="h-4 w-4 text-gray-500" />
            All Transactions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 text-center text-sm text-gray-500">
              Loading transactions…
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-6 text-center text-sm text-gray-500">
              No transactions yet.
            </div>
          ) : (
            <ul className="divide-y dark:divide-gray-800">
              {transactions.map((tx) => {
                const isDebit = tx.type === "payment" || tx.type === "charge";
                return (
                  <li key={tx.id} className="flex items-center gap-4 px-5 py-4">
                    {/* Icon bubble */}
                    <div
                      className={`h-9 w-9 flex-shrink-0 rounded-full flex items-center justify-center ${
                        isDebit
                          ? "bg-red-50 dark:bg-red-900/20"
                          : "bg-green-50 dark:bg-green-900/20"
                      }`}
                    >
                      {isDebit ? (
                        <ArrowUpRight className="h-4 w-4 text-red-500" />
                      ) : (
                        <ArrowDownLeft className="h-4 w-4 text-green-500" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                        {tx.description}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        {tx.reference && (
                          <span className="text-xs text-gray-400 font-mono">
                            #{tx.reference}
                          </span>
                        )}
                        {tx.student_name && (
                          <span className="text-xs text-gray-400">
                            · {tx.student_name}
                          </span>
                        )}
                        <span className="text-xs text-gray-400">
                          · {formatDate(tx.created_at)}
                        </span>
                      </div>
                    </div>

                    {/* Amount + status */}
                    <div className="flex flex-col items-end gap-1">
                      <p
                        className={`text-sm font-bold ${
                          isDebit ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {isDebit ? "−" : "+"}
                        {formatCurrency(tx.amount)}
                      </p>
                      <Badge variant={statusVariant[tx.status]}>
                        {statusLabel[tx.status]}
                      </Badge>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
