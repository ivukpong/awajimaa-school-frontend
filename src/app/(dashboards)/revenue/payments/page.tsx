"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post } from "@/lib/api";
import { Filter, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

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

const statusVariant: Record<string, "green" | "yellow" | "red"> = {
  verified: "green",
  pending: "yellow",
  rejected: "red",
};

export default function RevenuePaymentsPage() {
  const [status, setStatus] = useState("");
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["payments", status],
    queryFn: () =>
      get<{ data: Payment[] }>(
        `/finance/payments${status ? `?status=${status}` : ""}`,
      ),
  });

  const verify = useMutation({
    mutationFn: (id: number) => post(`/finance/payments/${id}/verify`, {}),
    onSuccess: () => {
      toast.success("Payment verified");
      qc.invalidateQueries({ queryKey: ["payments"] });
    },
  });

  const payments = data?.data.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Payments
        </h1>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-400" />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-700"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                {[
                  "Reference",
                  "Invoice",
                  "Payer",
                  "Method",
                  "Amount",
                  "Date",
                  "Status",
                  "Action",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading && (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center">
                    <div className="inline-block w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                  </td>
                </tr>
              )}
              {!isLoading &&
                payments.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-4 py-3 font-mono text-xs">
                      {p.reference}
                    </td>
                    <td className="px-4 py-3 text-brand text-xs">
                      {p.invoice?.invoice_number}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {p.payer_name ?? "--"}
                    </td>
                    <td className="px-4 py-3 capitalize">{p.payment_method}</td>
                    <td className="px-4 py-3 font-semibold">
                      ₦{p.amount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatDate(p.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant[p.status]} size="sm">
                        {p.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {p.status === "pending" && (
                        <Button
                          size="sm"
                          leftIcon={<CheckCircle size={12} />}
                          loading={verify.isPending}
                          onClick={() => verify.mutate(p.id)}
                        >
                          Verify
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              {!isLoading && payments.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-gray-400"
                  >
                    No payments found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
