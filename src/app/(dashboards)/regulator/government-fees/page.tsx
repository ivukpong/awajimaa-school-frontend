"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Table, type Column } from "@/components/ui/Table";
import { useGovernmentFees } from "@/hooks/useGovernment";
import type {
  GovernmentFeeType,
  GovernmentFeePayment,
} from "@/types/government";
import { Plus, CheckCircle, XCircle } from "lucide-react";
import toast from "react-hot-toast";

const statusColors: Record<string, "gray" | "yellow" | "green" | "red"> = {
  pending: "yellow",
  confirmed: "green",
  failed: "red",
};
const feeCategories = ["registration", "renewal", "levy", "inspection", "other"] as const;

export default function RegulatorGovernmentFeesPage() {
  const { feeTypes, payments, loading, confirmPayment } = useGovernmentFees();
  const [showFeeTypeModal, setShowFeeTypeModal] = useState(false);
  const [ftForm, setFtForm] = useState({
    name: "",
    amount: "",
    category: "registration",
    description: "",
  });
  const [saving, setSaving] = useState(false);

  const handleConfirm = async (id: number, status: "confirmed" | "failed") => {
    try {
      await confirmPayment(id, status);
      toast.success(`Payment ${status}`);
    } catch {
      toast.error("Update failed");
    }
  };

  const feeTypeColumns: Column<GovernmentFeeType>[] = [
    {
      key: "name",
      header: "Fee Name",
      render: (r) => <span className="font-medium">{r.name}</span>,
    },
    {
      key: "amount",
      header: "Amount",
      render: (r) =>
        r.amount ? `₦${Number(r.amount).toLocaleString()}` : "Variable",
    },
    {
      key: "category",
      header: "Category",
      render: (r) => (
        <Badge variant="gray">{r.category}</Badge>
      ),
    },
    {
      key: "is_mandatory",
      header: "Mandatory",
      render: (r) => (
        <Badge variant={r.is_mandatory ? "red" : "gray"}>
          {r.is_mandatory ? "Yes" : "No"}
        </Badge>
      ),
    },
  ];

  const paymentColumns: Column<GovernmentFeePayment>[] = [
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
          {feeTypes.find((f) => f.id === r.government_fee_type_id)?.name ?? r.government_fee_type_id}
        </span>
      ),
    },
    {
      key: "school_id" as keyof GovernmentFeePayment,
      header: "School",
      render: (r) => (
        <span>
          {(r as GovernmentFeePayment & { school?: { name: string } }).school
            ?.name ?? `School ${r.school_id}`}
        </span>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (r) => `₦${Number(r.amount).toLocaleString()}`,
    },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <Badge variant={statusColors[r.status] ?? "gray"}>{r.status}</Badge>
      ),
    },
    { key: "created_at", header: "Date", render: (r) => r.created_at ? new Date(r.created_at).toLocaleDateString() : "—" },
    {
      key: "id" as keyof GovernmentFeePayment,
      header: "Actions",
      render: (r) =>
        r.status === "pending" ? (
          <div className="flex gap-1">
            <Button size="sm" onClick={() => handleConfirm(r.id, "confirmed")}>
              <CheckCircle className="h-3 w-3" />
            </Button>
            <Button
              size="sm"
              variant="danger"
              onClick={() => handleConfirm(r.id, "failed")}
            >
              <XCircle className="h-3 w-3" />
            </Button>
          </div>
        ) : null,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Government Fee Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage fee types and confirm school payments
          </p>
        </div>
        <Button onClick={() => setShowFeeTypeModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Fee Type
        </Button>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold">Fee Types</h2>
        </CardHeader>
        <CardContent>
          <Table
            columns={feeTypeColumns}
            data={
              feeTypes as unknown as (GovernmentFeeType &
                Record<string, unknown>)[]
            }
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold">School Payments</h2>
        </CardHeader>
        <CardContent>
          <Table
            columns={paymentColumns}
            data={
              (payments?.data ?? []) as unknown as (GovernmentFeePayment &
                Record<string, unknown>)[]
            }
            loading={loading}
          />
        </CardContent>
      </Card>

      {showFeeTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-900 p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold">New Fee Type</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Name *</label>
                <Input
                  value={ftForm.name}
                  onChange={(e) =>
                    setFtForm({ ...ftForm, name: e.target.value })
                  }
                  placeholder="e.g. Annual License Fee"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Amount (₦)</label>
                <Input
                  type="number"
                  value={ftForm.amount}
                  onChange={(e) =>
                    setFtForm({ ...ftForm, amount: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Frequency</label>
                <select
                  value={ftForm.frequency}
                  onChange={(e) =>
                    setFtForm({ ...ftForm, frequency: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                >
                  {frequencies.map((f) => (
                    <option key={f} value={f}>
                      {f.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={ftForm.description}
                  onChange={(e) =>
                    setFtForm({ ...ftForm, description: e.target.value })
                  }
                  className="mt-1"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => setShowFeeTypeModal(false)}
              >
                Cancel
              </Button>
              <Button
                disabled={saving}
                onClick={async () => {
                  setSaving(true);
                  try {
                    toast.success("Fee type created");
                    setShowFeeTypeModal(false);
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                {saving ? "Saving…" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
