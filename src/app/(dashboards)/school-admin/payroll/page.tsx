"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, type Column } from "@/components/ui/Table";
import { usePayroll, useSalaryStructures } from "@/hooks/useHR";
import type { PayrollRun, PayrollItem } from "@/types/hr";
import { Plus, CheckCircle, DollarSign, Eye } from "lucide-react";
import toast from "react-hot-toast";

const statusColors: Record<
  string,
  "gray" | "yellow" | "green" | "blue" | "red"
> = {
  draft: "gray",
  approved: "blue",
  paid: "green",
};

export default function PayrollPage() {
  const { runs, loading, generateRun, approveRun, markPaid, getRunDetails } =
    usePayroll();
  const { structures, createStructure } = useSalaryStructures();
  const [month, setMonth] = useState(() =>
    new Date().toISOString().slice(0, 7),
  );
  const [generating, setGenerating] = useState(false);
  const [runDetail, setRunDetail] = useState<
    (PayrollRun & { items: PayrollItem[] }) | null
  >(null);
  const [showStructModal, setShowStructModal] = useState(false);
  const [sForm, setSForm] = useState({
    name: "",
    basic_salary: "",
    housing_allowance: "",
    transport_allowance: "",
    medical_allowance: "",
  });

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generateRun(month);
      toast.success("Payroll run generated");
    } catch (e: unknown) {
      toast.error(
        (e as { message?: string })?.message ?? "Failed to generate payroll",
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleView = async (id: number) => {
    try {
      const detail = await getRunDetails(id);
      setRunDetail(detail);
    } catch {
      toast.error("Could not load details");
    }
  };

  const handleCreateStructure = async () => {
    try {
      await createStructure({
        name: sForm.name,
        basic_salary: Number(sForm.basic_salary),
        housing_allowance: Number(sForm.housing_allowance) || 0,
        transport_allowance: Number(sForm.transport_allowance) || 0,
        medical_allowance: Number(sForm.medical_allowance) || 0,
      });
      toast.success("Salary structure created");
      setShowStructModal(false);
    } catch {
      toast.error("Failed");
    }
  };

  const runColumns: Column<PayrollRun>[] = [
    {
      key: "month",
      header: "Month",
      sortable: true,
      render: (r) => <span className="font-medium">{r.month}</span>,
    },
    {
      key: "total_gross",
      header: "Gross",
      render: (r) => `₦${Number(r.total_gross).toLocaleString()}`,
    },
    {
      key: "total_deductions",
      header: "Deductions",
      render: (r) => `₦${Number(r.total_deductions).toLocaleString()}`,
    },
    {
      key: "total_net",
      header: "Net Pay",
      render: (r) => (
        <span className="font-semibold text-green-600">
          ₦{Number(r.total_net).toLocaleString()}
        </span>
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
      key: "id" as keyof PayrollRun,
      header: "Actions",
      render: (r) => (
        <div className="flex gap-1">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => handleView(r.id)}
          >
            <Eye className="h-3 w-3" />
          </Button>
          {r.status === "draft" && (
            <Button
              size="sm"
              onClick={() =>
                approveRun(r.id)
                  .then(() => toast.success("Approved"))
                  .catch(() => toast.error("Failed"))
              }
            >
              <CheckCircle className="h-3 w-3" />
            </Button>
          )}
          {r.status === "approved" && (
            <Button
              size="sm"
              onClick={() =>
                markPaid(r.id)
                  .then(() => toast.success("Marked paid"))
                  .catch(() => toast.error("Failed"))
              }
            >
              <DollarSign className="h-3 w-3" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const itemColumns: Column<PayrollItem>[] = [
    {
      key: "teacher_profile_id",
      header: "Teacher",
      render: (r) => (
        <span>
          {r.teacher_profile?.staff_id ?? `ID ${r.teacher_profile_id}`}
        </span>
      ),
    },
    {
      key: "basic_salary",
      header: "Basic",
      render: (r) => `₦${Number(r.basic_salary).toLocaleString()}`,
    },
    {
      key: "total_allowances",
      header: "Allowances",
      render: (r) => `₦${Number(r.total_allowances).toLocaleString()}`,
    },
    {
      key: "pension_deduction",
      header: "Pension",
      render: (r) => `₦${Number(r.pension_deduction).toLocaleString()}`,
    },
    {
      key: "tax_deduction",
      header: "Tax",
      render: (r) => `₦${Number(r.tax_deduction).toLocaleString()}`,
    },
    {
      key: "net_salary",
      header: "Net",
      render: (r) => (
        <span className="font-semibold text-green-600">
          ₦{Number(r.net_salary).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Payroll
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage salary structures and monthly payroll runs
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setShowStructModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Salary Structure
          </Button>
          <div className="flex gap-2 items-center">
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <Button onClick={handleGenerate} disabled={generating}>
              {generating ? "Generating…" : "Generate Payroll"}
            </Button>
          </div>
        </div>
      </div>

      {/* Salary Structures */}
      {structures.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900 dark:text-white">
              Salary Structures
            </h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {structures.map((s) => (
                <div key={s.id} className="rounded-lg border p-3 space-y-1">
                  <p className="font-medium text-sm">{s.name}</p>
                  <p className="text-xs text-gray-500">
                    Basic: ₦{Number(s.basic_salary).toLocaleString()}
                  </p>
                  <p className="text-xs text-green-600 font-semibold">
                    Gross: ₦
                    {Number(
                      s.basic_salary +
                        (s.housing_allowance ?? 0) +
                        (s.transport_allowance ?? 0) +
                        (s.medical_allowance ?? 0),
                    ).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payroll Runs */}
      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900 dark:text-white">
            Payroll Runs
          </h2>
        </CardHeader>
        <CardContent>
          <Table
            keyField="id"
            columns={runColumns}
            data={
              (runs?.data ?? []) as unknown as (PayrollRun &
                Record<string, unknown>)[]
            }
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Run Detail Modal */}
      {runDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-4xl rounded-xl bg-white dark:bg-gray-900 p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">
                Payroll Detail — {runDetail.month}
              </h2>
              <Button variant="secondary" onClick={() => setRunDetail(null)}>
                Close
              </Button>
            </div>
            <Table
              keyField="id"
              columns={itemColumns}
              data={
                (runDetail.items ?? []) as unknown as (PayrollItem &
                  Record<string, unknown>)[]
              }
            />
          </div>
        </div>
      )}

      {showStructModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl bg-white dark:bg-gray-900 p-6 shadow-2xl space-y-4">
            <h2 className="text-lg font-bold">New Salary Structure</h2>
            <div className="space-y-3">
              {[
                ["name", "Structure Name *"],
                ["basic_salary", "Basic Salary (₦)"],
                ["housing_allowance", "Housing Allowance (₦)"],
                ["transport_allowance", "Transport Allowance (₦)"],
                ["medical_allowance", "Medical Allowance (₦)"],
              ].map(([key, label]) => (
                <div key={key}>
                  <label className="text-sm font-medium">{label}</label>
                  <input
                    className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    value={sForm[key as keyof typeof sForm]}
                    onChange={(e) =>
                      setSForm({ ...sForm, [key]: e.target.value })
                    }
                    type={key === "name" ? "text" : "number"}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => setShowStructModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateStructure}>Save Structure</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
