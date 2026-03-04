"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, type Column } from "@/components/ui/Table";
import { useGovernmentFees } from "@/hooks/useGovernment";
import type {
  GovernmentFeePayment,
  GovernmentFeeType,
} from "@/types/government";
import { CreditCard } from "lucide-react";
import toast from "react-hot-toast";

const statusColors: Record<string, "gray" | "yellow" | "green" | "red"> = {
  pending: "yellow",
  confirmed: "green",
  failed: "red",
};

export default function SchoolGovernmentFeesPage() {
  const { feeTypes, payments, loading, payFee } = useGovernmentFees();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    fee_type_id: "",
    amount: "",
    payment_method: "bank_transfer",
    reference_number: "",
  });
  const [saving, setSaving] = useState(false);

  const selectedFeeType = feeTypes.find(
    (f) => f.id === Number(form.fee_type_id),
  );

  const handlePay = async () => {
    if (!form.fee_type_id || !form.amount)
      return toast.error("Fee type and amount required");
    setSaving(true);
    try {
      await payFee({
        fee_type_id: Number(form.fee_type_id),
        amount: Number(form.amount),
        payment_method: form.payment_method,
        reference_number: form.reference_number || undefined,
      });
      toast.success("Payment recorded");
      setShowModal(false);
    } catch {
      toast.error("Payment failed");
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<GovernmentFeePayment>[] = [
    {
      key: "payment_reference",
      header: "Reference",
      render: (r) => (
        <span className="font-mono text-sm">{r.payment_reference}</span>
      ),
    },
    {
      key: "government_fee_type_id",
      header: "Fee Type",
      render: (r) => (
        <span>
          {feeTypes.find((f) => f.id === r.government_fee_type_id)?.name ??
            r.government_fee_type_id}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (r) => (
        <span className="font-semibold">
          ₦{Number(r.amount).toLocaleString()}
        </span>
      ),
    },
    {
      key: "payment_method",
      header: "Method",
      render: (r) => (
        <Badge variant="gray">
          {r.payment_method?.replace(/_/g, " ") ?? "—"}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge variant={statusColors[r.status] ?? "gray"}>{r.status}</Badge>
      ),
    },
    {
      key: "created_at",
      header: "Date",
      render: (r) =>
        r.created_at ? new Date(r.created_at).toLocaleDateString() : "—",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Government Fees
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Pay and track regulatory fees
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <CreditCard className="h-4 w-4 mr-2" />
          Record Payment
        </Button>
      </div>

      {/* Fee Types Reference */}
      {feeTypes.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {feeTypes.map((f: GovernmentFeeType) => (
            <Card key={f.id} className="border">
              <CardContent className="pt-3 pb-3">
                <p className="text-sm font-medium">{f.name}</p>
                {f.amount && (
                  <p className="text-lg font-bold text-blue-600 mt-1">
                    ₦{Number(f.amount).toLocaleString()}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {f.frequency?.replace(/_/g, " ")}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Payment History</h2>
        </CardHeader>
        <CardContent>
          <Table
            columns={columns}
            data={
              (payments?.data ?? []) as unknown as (GovernmentFeePayment &
                Record<string, unknown>)[]
            }
            loading={loading}
          />
        </CardContent>
      </Card>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-900 p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold">Record Fee Payment</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Fee Type *</label>
                <select
                  value={form.fee_type_id}
                  onChange={(e) => {
                    const ft = feeTypes.find(
                      (f) => f.id === Number(e.target.value),
                    );
                    setForm({
                      ...form,
                      fee_type_id: e.target.value,
                      amount: ft?.amount?.toString() ?? "",
                    });
                  }}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Select fee type…</option>
                  {feeTypes.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Amount (₦) *</label>
                <input
                  type="number"
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Payment Method</label>
                <select
                  value={form.payment_method}
                  onChange={(e) =>
                    setForm({ ...form, payment_method: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="online">Online</option>
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">
                  Bank Reference / Receipt No.
                </label>
                <input
                  value={form.reference_number}
                  onChange={(e) =>
                    setForm({ ...form, reference_number: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Optional"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" onClick={() => setShowModal(false)}>
                Cancel
              </Button>
              <Button onClick={handlePay} disabled={saving}>
                {saving ? "Processing…" : "Record Payment"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
