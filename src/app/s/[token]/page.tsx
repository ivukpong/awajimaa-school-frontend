"use client";

import React, { useState, useRef } from "react";
import { useParams } from "next/navigation";
import {
  GraduationCap,
  DollarSign,
  CheckCircle,
  Download,
  CreditCard,
  Building2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { usePublicFees, usePublicPay } from "@/hooks/useFees";
import type {
  InvoiceWithFee,
  ReceiptData,
  PublicPayPayload,
} from "@/types/finance";

const statusVariant: Record<string, "green" | "yellow" | "red" | "gray"> = {
  paid: "green",
  partial: "yellow",
  unpaid: "red",
  waived: "gray",
};

function formatCurrency(n: number) {
  return `₦${Number(n).toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

function ReceiptCard({
  receipt,
  onClose,
}: {
  receipt: ReceiptData;
  onClose: () => void;
}) {
  const printRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    if (!printRef.current) return;
    const win = window.open("", "_blank", "width=800,height=600");
    if (!win) return;
    win.document.write(`
      <html><head><title>Payment Receipt</title>
      <style>
        body { font-family: sans-serif; padding: 32px; color: #111; }
        h1 { margin-bottom: 4px; font-size: 1.4rem; }
        h2 { margin-bottom: 16px; font-size: 1rem; color: #555; }
        table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        td { padding: 6px 0; border-bottom: 1px solid #eee; }
        td:last-child { text-align: right; font-weight: 600; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; }
        .badge { background: #d1fae5; color: #065f46; padding: 2px 10px; border-radius: 999px; font-size: 0.75rem; }
      </style></head><body>
      ${printRef.current.innerHTML}
      </body></html>
    `);
    win.document.close();
    win.print();
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div ref={printRef} className="p-6">
          {/* School header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              {receipt.school_logo ? (
                <img
                  src={receipt.school_logo}
                  alt="logo"
                  className="h-12 w-12 object-contain rounded-lg"
                />
              ) : (
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 size={24} className="text-blue-600" />
                </div>
              )}
              <div>
                <p className="font-bold text-gray-900 dark:text-white">
                  {receipt.school_name}
                </p>
                <p className="text-xs text-gray-500">{receipt.school_email}</p>
                <p className="text-xs text-gray-500">{receipt.school_phone}</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-green-700 bg-green-100 rounded-full px-3 py-1">
              RECEIPT
            </span>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-500">Receipt No.</p>
              <p className="font-bold text-gray-900 dark:text-white">
                {receipt.receipt_number}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500">Date</p>
              <p className="font-bold text-gray-900 dark:text-white">
                {new Date(receipt.paid_at).toLocaleDateString("en-NG", {
                  dateStyle: "long",
                })}
              </p>
            </div>
          </div>

          <table className="w-full text-sm mb-4">
            <tbody>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <td className="py-2 text-gray-500">Payer Name</td>
                <td className="py-2 font-semibold text-right text-gray-900 dark:text-white">
                  {receipt.payer_name ?? "—"}
                </td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <td className="py-2 text-gray-500">Payer Email</td>
                <td className="py-2 font-semibold text-right text-gray-900 dark:text-white">
                  {receipt.payer_email ?? "—"}
                </td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <td className="py-2 text-gray-500">Payer Phone</td>
                <td className="py-2 font-semibold text-right text-gray-900 dark:text-white">
                  {receipt.payer_phone ?? "—"}
                </td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <td className="py-2 text-gray-500">Student</td>
                <td className="py-2 font-semibold text-right text-gray-900 dark:text-white">
                  {receipt.student_name}
                </td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <td className="py-2 text-gray-500">Admission No.</td>
                <td className="py-2 font-semibold text-right text-gray-900 dark:text-white">
                  {receipt.student_number}
                </td>
              </tr>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <td className="py-2 text-gray-500">Fee</td>
                <td className="py-2 font-semibold text-right text-gray-900 dark:text-white">
                  {receipt.fee_name}
                </td>
              </tr>
              {receipt.academic_year && (
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-2 text-gray-500">Academic Year</td>
                  <td className="py-2 font-semibold text-right text-gray-900 dark:text-white">
                    {receipt.academic_year}
                  </td>
                </tr>
              )}
              {receipt.term && (
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-2 text-gray-500">Term</td>
                  <td className="py-2 font-semibold text-right text-gray-900 dark:text-white">
                    {receipt.term}
                  </td>
                </tr>
              )}
              {receipt.narration && (
                <tr className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-2 text-gray-500">Narration</td>
                  <td className="py-2 font-semibold text-right text-gray-900 dark:text-white">
                    {receipt.narration}
                  </td>
                </tr>
              )}
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <td className="py-2 text-gray-500">Reference</td>
                <td className="py-2 font-mono text-xs text-right text-gray-900 dark:text-white">
                  {receipt.reference}
                </td>
              </tr>
              <tr>
                <td className="py-3 font-bold text-gray-900 dark:text-white text-base">
                  Amount Paid
                </td>
                <td className="py-3 font-bold text-green-600 text-right text-base">
                  {formatCurrency(receipt.amount)}
                </td>
              </tr>
            </tbody>
          </table>

          <p className="text-center text-xs text-gray-400 mt-4">
            Thank you for your payment · {receipt.school_address}
          </p>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={handlePrint}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2.5 text-sm font-medium transition-colors"
          >
            <Download size={16} /> Download / Print
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-lg py-2.5 text-sm font-medium border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

interface PaymentFormProps {
  token: string;
  invoices: InvoiceWithFee[];
  onSuccess: (receipt: ReceiptData) => void;
}

function PaymentForm({ token, invoices, onSuccess }: PaymentFormProps) {
  const unpaid = invoices.filter(
    (i) => i.status !== "paid" && i.status !== "waived",
  );
  const { mutate, isPending, error } = usePublicPay(token);

  const [form, setForm] = useState<PublicPayPayload>({
    invoice_id: unpaid[0]?.id ?? 0,
    amount: 0,
    payer_name: "",
    payer_email: "",
    payer_phone: "",
    narration: "",
  });

  const selectedInvoice = unpaid.find((i) => i.id === Number(form.invoice_id));

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "invoice_id" || name === "amount" ? Number(value) : value,
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutate(form, {
      onSuccess: (res) => onSuccess(res.receipt),
    });
  }

  if (unpaid.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle size={48} className="text-green-500" />
        <p className="font-semibold text-gray-700 dark:text-gray-300">
          All fees are fully paid!
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg px-4 py-2">
          {(error as any)?.message ?? "Payment failed. Please try again."}
        </p>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Select Fee
        </label>
        <select
          name="invoice_id"
          value={form.invoice_id}
          onChange={handleChange}
          required
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {unpaid.map((inv) => (
            <option key={inv.id} value={inv.id}>
              {inv.fee?.name ?? `Invoice #${inv.id}`} — Balance:{" "}
              {formatCurrency(inv.balance)}
            </option>
          ))}
        </select>
        {selectedInvoice && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Max payable: {formatCurrency(selectedInvoice.balance)}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Amount (₦)
        </label>
        <input
          type="number"
          name="amount"
          min={100}
          max={selectedInvoice?.balance ?? undefined}
          step={1}
          value={form.amount || ""}
          onChange={handleChange}
          required
          placeholder="Enter amount"
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Your Full Name
          </label>
          <input
            type="text"
            name="payer_name"
            value={form.payer_name}
            onChange={handleChange}
            required
            placeholder="e.g. Chukwuemeka Obi"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email Address
          </label>
          <input
            type="email"
            name="payer_email"
            value={form.payer_email}
            onChange={handleChange}
            required
            placeholder="you@example.com"
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Phone Number
        </label>
        <input
          type="tel"
          name="payer_phone"
          value={form.payer_phone}
          onChange={handleChange}
          required
          placeholder="+234 800 000 0000"
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Narration (optional)
        </label>
        <textarea
          name="narration"
          value={form.narration}
          onChange={handleChange}
          rows={2}
          placeholder="e.g. Third term school fees payment"
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg py-3 text-sm font-semibold transition-colors"
      >
        {isPending ? (
          "Processing…"
        ) : (
          <>
            <CreditCard size={16} /> Pay{" "}
            {form.amount > 0 ? formatCurrency(form.amount) : "Now"}
          </>
        )}
      </button>
    </form>
  );
}

export default function PublicStudentFeesPage() {
  const { token } = useParams<{ token: string }>();
  const { data, isLoading, isError } = usePublicFees(token);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400">Loading…</p>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center gap-3 p-8 text-center">
        <GraduationCap size={48} className="text-gray-300" />
        <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">
          Student not found.
        </p>
        <p className="text-gray-400 dark:text-gray-500 text-sm">
          The payment link may be invalid or expired.
        </p>
      </div>
    );
  }

  const { student, school, summary, grouped } = data;
  const allInvoices = grouped.flatMap((g) => g.invoices);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {receipt && (
        <ReceiptCard receipt={receipt} onClose={() => setReceipt(null)} />
      )}

      {/* Hero */}
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white py-10 px-4">
        <div className="mx-auto max-w-2xl flex flex-col sm:flex-row items-center sm:items-start gap-4">
          <div className="h-16 w-16 shrink-0 flex items-center justify-center rounded-2xl bg-white/20 text-xl font-bold">
            {student.name.charAt(0)}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold">{student.name}</h1>
            <p className="text-white/80 text-sm">
              {student.admission_number}
              {student.current_class ? ` · ${student.current_class}` : ""}
            </p>
            <p className="text-white/80 text-sm">{school.name}</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        {/* Fee summary */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Total Fees",
              value: formatCurrency(summary.total),
              color: "text-gray-900 dark:text-white",
            },
            {
              label: "Amount Paid",
              value: formatCurrency(summary.paid),
              color: "text-green-600 dark:text-green-400",
            },
            {
              label: "Outstanding",
              value: formatCurrency(summary.balance),
              color: "text-red-600 dark:text-red-400",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white dark:bg-gray-900 rounded-xl shadow-sm p-4 text-center"
            >
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {s.label}
              </p>
              <p className={`font-bold text-sm mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Fee breakdown */}
        {grouped.map((group) => (
          <Card key={group.academic_year}>
            <CardHeader>
              <CardTitle className="text-base">{group.academic_year}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {group.invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="flex items-center justify-between text-sm py-2 border-b border-gray-100 dark:border-gray-700 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {inv.fee?.name ?? `Invoice #${inv.id}`}
                    </p>
                    {inv.fee?.term?.name && (
                      <p className="text-xs text-gray-500">
                        {inv.fee.term.name}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={statusVariant[inv.status] ?? "gray"}>
                      {inv.status}
                    </Badge>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(inv.balance)}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}

        {/* Payment form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign size={18} />
              Make a Payment
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PaymentForm
              token={token}
              invoices={allInvoices}
              onSuccess={(r) => setReceipt(r)}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
