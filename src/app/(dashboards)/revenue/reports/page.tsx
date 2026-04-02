"use client";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import {
  BarChart3,
  DollarSign,
  TrendingUp,
  CheckCircle,
  Clock,
  Filter,
} from "lucide-react";

interface Payment {
  id: number;
  reference: string;
  amount: number;
  status: "pending" | "verified" | "rejected";
  payment_method: string;
  payer_name?: string;
  invoice: { invoice_number: string };
  created_at: string;
}

interface PaymentsResponse {
  data: Payment[];
  total: number;
}

const statusVariant: Record<string, "green" | "yellow" | "red"> = {
  verified: "green",
  pending: "yellow",
  rejected: "red",
};

export default function RevenueReportsPage() {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["revenue-reports", dateFrom, dateTo],
    queryFn: () => {
      const params = new URLSearchParams();
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
      const qs = params.toString();
      return get<PaymentsResponse>(`/finance/payments${qs ? `?${qs}` : ""}`);
    },
  });

  const payments: Payment[] = data?.data?.data ?? [];

  const totalCollected = payments
    .filter((p) => p.status === "verified")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const totalPending = payments
    .filter((p) => p.status === "pending")
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const verifiedCount = payments.filter((p) => p.status === "verified").length;
  const pendingCount = payments.filter((p) => p.status === "pending").length;

  const byMethod: Record<string, number> = {};
  payments
    .filter((p) => p.status === "verified")
    .forEach((p) => {
      byMethod[p.payment_method] =
        (byMethod[p.payment_method] ?? 0) + Number(p.amount);
    });

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(amount);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Revenue Reports
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Summary of payment collections and receipts.
          </p>
        </div>

        {/* Date filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <Filter className="h-4 w-4 text-gray-400" />
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
          </div>
          {(dateFrom || dateTo) && (
            <button
              onClick={() => {
                setDateFrom("");
                setDateTo("");
              }}
              className="text-sm text-brand hover:underline"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2 dark:bg-green-900/30">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Collected</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatCurrency(totalCollected)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-yellow-100 p-2 dark:bg-yellow-900/30">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Pending Amount</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatCurrency(totalPending)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                <CheckCircle className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Verified</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {verifiedCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-orange-100 p-2 dark:bg-orange-900/30">
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Pending</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {pendingCount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Breakdown by method */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm">
              <BarChart3 className="h-4 w-4" />
              By Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {Object.keys(byMethod).length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-4">
                No verified payments
              </p>
            ) : (
              Object.entries(byMethod)
                .sort(([, a], [, b]) => b - a)
                .map(([method, amount]) => (
                  <div
                    key={method}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                      {method.replace(/_/g, " ")}
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                ))
            )}
          </CardContent>
        </Card>

        {/* Payment list */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Payment Records</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <p className="text-center text-sm text-gray-400 py-8">Loading…</p>
            ) : payments.length === 0 ? (
              <p className="text-center text-sm text-gray-400 py-8">
                No payments found for the selected period.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 dark:border-gray-700">
                      <th className="text-left pb-2 text-gray-500 font-medium">
                        Reference
                      </th>
                      <th className="text-left pb-2 text-gray-500 font-medium">
                        Payer
                      </th>
                      <th className="text-right pb-2 text-gray-500 font-medium">
                        Amount
                      </th>
                      <th className="text-left pb-2 text-gray-500 font-medium">
                        Status
                      </th>
                      <th className="text-left pb-2 text-gray-500 font-medium">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                    {payments.map((p) => (
                      <tr key={p.id}>
                        <td className="py-2 font-mono text-xs text-gray-600 dark:text-gray-400">
                          {p.reference}
                        </td>
                        <td className="py-2 text-gray-700 dark:text-gray-300">
                          {p.payer_name ?? "—"}
                        </td>
                        <td className="py-2 text-right font-medium text-gray-900 dark:text-white">
                          {formatCurrency(Number(p.amount))}
                        </td>
                        <td className="py-2">
                          <Badge variant={statusVariant[p.status]}>
                            {p.status}
                          </Badge>
                        </td>
                        <td className="py-2 text-gray-500">
                          {formatDate(p.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
