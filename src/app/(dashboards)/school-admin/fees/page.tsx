"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import {
  DollarSign,
  AlertCircle,
  CheckCircle2,
  PlusCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { Table, Column } from "@/components/ui/Table";
import toast from "react-hot-toast";
import { useAuthStore } from "@/store/authStore";

interface Invoice extends Record<string, unknown> {
  id: number;
  invoice_number: string;
  student: { user: { name: string } };
  fee: { name: string };
  amount: number;
  amount_paid: number;
  status: "unpaid" | "partial" | "paid" | "cancelled";
  due_date: string;
}

const statusVariant: Record<string, "green" | "yellow" | "red" | "gray"> = {
  paid: "green",
  partial: "yellow",
  unpaid: "red",
  cancelled: "gray",
};

interface ClassRoom {
  id: number;
  name: string;
}
interface Term {
  id: number;
  name: string;
}
interface AcademicYear {
  id: number;
  name: string;
  terms: Term[];
}

const emptyFeeForm = {
  name: "",
  amount: "",
  due_date: "",
  class_room_id: "",
  term_id: "",
  is_compulsory: false,
  description: "",
};

export default function FeesPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyFeeForm);
  const qc = useQueryClient();
  const { user } = useAuthStore();

  const { data, isLoading } = useQuery({
    queryKey: ["invoices", statusFilter],
    queryFn: () =>
      get<{ data: Invoice[] }>(
        "/invoices",
        statusFilter ? { params: { status: statusFilter } } : undefined,
      ),
  });

  const { data: classesData } = useQuery({
    queryKey: ["classes"],
    queryFn: () => get<ClassRoom[]>("/classes"),
  });
  const classes: ClassRoom[] = classesData?.data ?? [];

  const { data: yearsData } = useQuery({
    queryKey: ["academic-years"],
    queryFn: () => get<AcademicYear[]>("/academic-years"),
  });
  const terms: Term[] = (yearsData?.data ?? []).flatMap((y) => y.terms ?? []);

  const createFee = useMutation({
    mutationFn: (f: typeof emptyFeeForm) =>
      post("/fees", {
        school_id: user?.school_id,
        name: f.name,
        amount: Number(f.amount),
        due_date: f.due_date,
        class_room_id: Number(f.class_room_id),
        term_id: Number(f.term_id),
        is_compulsory: f.is_compulsory,
        description: f.description || undefined,
      }),
    onSuccess: () => {
      toast.success("Fee created");
      qc.invalidateQueries({ queryKey: ["invoices"] });
      setShowForm(false);
      setForm(emptyFeeForm);
    },
    onError: () => toast.error("Failed to create fee"),
  });

  const invoices = data?.data.data ?? [];

  const totalRevenue = invoices.reduce((s, i) => s + Number(i.amount_paid), 0);
  const totalOutstanding = invoices
    .filter((i) => i.status !== "paid")
    .reduce((s, i) => s + (Number(i.amount) - Number(i.amount_paid)), 0);
  const paidCount = invoices.filter((i) => i.status === "paid").length;
  const unpaidCount = invoices.filter((i) => i.status === "unpaid").length;

  const columns: Column<Invoice>[] = [
    {
      key: "invoice_number",
      header: "Invoice #",
      render: (i) => <code className="text-xs">{i.invoice_number}</code>,
    },
    {
      key: "student",
      header: "Student",
      render: (i) => i.student?.user?.name ?? "—",
    },
    { key: "fee", header: "Fee", render: (i) => i.fee?.name ?? "—" },
    {
      key: "amount",
      header: "Amount",
      render: (i) => formatCurrency(i.amount),
    },
    {
      key: "paid",
      header: "Paid",
      render: (i) => formatCurrency(i.amount_paid),
    },
    {
      key: "due_date",
      header: "Due",
      render: (i) => new Date(i.due_date).toLocaleDateString(),
    },
    {
      key: "status",
      header: "Status",
      render: (i) => (
        <Badge variant={statusVariant[i.status]}>{i.status}</Badge>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Fees &amp; Invoices
        </h1>
        <Button
          leftIcon={<PlusCircle size={16} />}
          onClick={() => setShowForm(true)}
        >
          Create Fee
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Fee Structure</CardTitle>
            <button
              onClick={() => setShowForm(false)}
              className="ml-auto p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X size={16} />
            </button>
          </CardHeader>
          <CardContent>
            <form
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                createFee.mutate(form);
              }}
            >
              <Input
                label="Fee Name"
                required
                value={form.name}
                onChange={(e) =>
                  setForm((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="e.g. School Fees – Term 1"
              />
              <Input
                label="Amount (₦)"
                type="number"
                required
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(e) =>
                  setForm((p) => ({ ...p, amount: e.target.value }))
                }
              />
              <Input
                label="Due Date"
                type="date"
                required
                value={form.due_date}
                onChange={(e) =>
                  setForm((p) => ({ ...p, due_date: e.target.value }))
                }
              />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Class *
                </label>
                <select
                  required
                  value={form.class_room_id}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, class_room_id: e.target.value }))
                  }
                  className="h-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm"
                >
                  <option value="">— Select class —</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Term *
                </label>
                <select
                  required
                  value={form.term_id}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, term_id: e.target.value }))
                  }
                  className="h-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm"
                >
                  <option value="">— Select term —</option>
                  {terms.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                label="Description (optional)"
                value={form.description}
                onChange={(e) =>
                  setForm((p) => ({ ...p, description: e.target.value }))
                }
              />
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="compulsory"
                  checked={form.is_compulsory}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, is_compulsory: e.target.checked }))
                  }
                  className="h-4 w-4 rounded"
                />
                <label
                  htmlFor="compulsory"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Compulsory fee
                </label>
              </div>
              <div className="sm:col-span-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={createFee.isPending}>
                  Create Fee
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Collected"
          value={formatCurrency(totalRevenue)}
          icon={<DollarSign size={20} />}
          color="green"
        />
        <StatCard
          title="Outstanding"
          value={formatCurrency(totalOutstanding)}
          icon={<AlertCircle size={20} />}
          color="red"
        />
        <StatCard
          title="Paid Invoices"
          value={String(paidCount)}
          icon={<CheckCircle2 size={20} />}
          color="blue"
        />
        <StatCard
          title="Unpaid Invoices"
          value={String(unpaidCount)}
          icon={<AlertCircle size={20} />}
          color="yellow"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Invoices</CardTitle>
          <div className="flex gap-2">
            {["", "unpaid", "partial", "paid"].map((s) => (
              <Button
                key={s}
                size="sm"
                variant={statusFilter === s ? "primary" : "outline"}
                onClick={() => setStatusFilter(s)}
              >
                {s || "All"}
              </Button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <Table
            keyField="id"
            columns={columns}
            data={invoices}
            loading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
