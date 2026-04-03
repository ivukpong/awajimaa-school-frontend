"use client";
import React, { useState } from "react";
import {
  TrendingUp,
  Banknote,
  CreditCard,
  Users,
  RefreshCw,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import { useInvoices, usePayments, useVerifyPayment } from "@/hooks/useFees";
import { usePayroll } from "@/hooks/useHR";

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            {label}
          </p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`rounded-lg p-2 ${color}`}>{icon}</div>
      </div>
    </div>
  );
}

function paymentStatusBadge(status: string) {
  const map: Record<string, string> = {
    verified: "bg-green-50 text-green-700",
    pending: "bg-yellow-50 text-yellow-700",
    rejected: "bg-red-50 text-red-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
        map[status] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

function invoiceStatusBadge(status: string) {
  const map: Record<string, string> = {
    paid: "bg-green-50 text-green-700",
    partial: "bg-blue-50 text-blue-700",
    unpaid: "bg-red-50 text-red-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
        map[status] ?? "bg-gray-100 text-gray-600"
      }`}
    >
      {status}
    </span>
  );
}

export default function SchoolAccountantPage() {
  const [activeTab, setActiveTab] = useState<"fees" | "payments" | "payroll">(
    "fees",
  );

  const { data: invoicesRes } = useInvoices();
  const { data: paymentsRes } = usePayments();
  const { runs, loading: payrollLoading } = usePayroll();
  const verifyPayment = useVerifyPayment();

  const invoices = invoicesRes?.data?.data ?? [];
  const payments = paymentsRes?.data?.data ?? [];
  const payrollRuns = runs?.data ?? [];

  // Compute stats from invoices
  const totalBilled = invoices.reduce(
    (s, inv) => s + Number(inv.amount_due ?? 0),
    0,
  );
  const totalCollected = invoices.reduce(
    (s, inv) => s + Number(inv.amount_paid ?? 0),
    0,
  );
  const paidCount = invoices.filter((i) => i.status === "paid").length;
  const pendingPayments = payments.filter((p) => p.status === "pending").length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">School Accounting</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Fees, payments, payroll and financial overview
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Billed"
          value={`₦${totalBilled.toLocaleString()}`}
          icon={<Banknote className="h-5 w-5 text-blue-600" />}
          color="bg-blue-50"
        />
        <StatCard
          label="Total Collected"
          value={`₦${totalCollected.toLocaleString()}`}
          icon={<TrendingUp className="h-5 w-5 text-green-600" />}
          color="bg-green-50"
        />
        <StatCard
          label="Paid Invoices"
          value={paidCount}
          icon={<CheckCircle2 className="h-5 w-5 text-purple-600" />}
          color="bg-purple-50"
        />
        <StatCard
          label="Pending Payments"
          value={pendingPayments}
          icon={<Clock className="h-5 w-5 text-yellow-600" />}
          color="bg-yellow-50"
        />
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          {(
            [
              { key: "fees", label: "Fee Invoices" },
              { key: "payments", label: "Payments" },
              { key: "payroll", label: "Payroll" },
            ] as { key: typeof activeTab; label: string }[]
          ).map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === t.key
                  ? "border-brand text-brand"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Fee Invoices */}
      {activeTab === "fees" && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {invoices.length === 0 ? (
            <div className="py-12 text-center">
              <Banknote className="mx-auto h-8 w-8 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No fee invoices found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Invoice #
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Student
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Amount Due
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Amount Paid
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Balance
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Due Date
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">
                        {inv.invoice_number}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {inv.student?.full_name ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        ₦{Number(inv.amount_due).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        ₦{Number(inv.amount_paid).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        ₦{Number(inv.balance).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        {invoiceStatusBadge(inv.status)}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {inv.due_date
                          ? new Date(inv.due_date).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Payments */}
      {activeTab === "payments" && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {payments.length === 0 ? (
            <div className="py-12 text-center">
              <CreditCard className="mx-auto h-8 w-8 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No payments found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Reference
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Invoice
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Method
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Date
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {payments.map((pmt) => (
                    <tr key={pmt.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">
                        {pmt.reference}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-xs">
                        {pmt.invoice?.invoice_number ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        ₦{Number(pmt.amount).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 capitalize text-gray-600">
                        {pmt.payment_method}
                      </td>
                      <td className="px-4 py-3">
                        {paymentStatusBadge(pmt.status)}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(pmt.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {pmt.status === "pending" && (
                          <button
                            onClick={() => verifyPayment.mutate(pmt.id)}
                            disabled={verifyPayment.isPending}
                            className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-60"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            Verify
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Payroll */}
      {activeTab === "payroll" && (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {payrollLoading ? (
            <p className="px-5 py-8 text-sm text-gray-500">Loading payroll…</p>
          ) : payrollRuns.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="mx-auto h-8 w-8 text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No payroll runs found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Month
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Total Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Generated
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {payrollRuns.map((run: any) => (
                    <tr key={run.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {run.month}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        ₦{Number(run.total_amount ?? 0).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
                            run.status === "paid"
                              ? "bg-green-50 text-green-700"
                              : run.status === "approved"
                                ? "bg-blue-50 text-blue-700"
                                : "bg-yellow-50 text-yellow-700"
                          }`}
                        >
                          {run.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {run.created_at
                          ? new Date(run.created_at).toLocaleDateString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
