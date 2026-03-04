"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import {
  DollarSign,
  AlertCircle,
  CheckCircle2,
  PlusCircle,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { Table, Column } from "@/components/ui/Table";

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

export default function FeesPage() {
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["invoices", statusFilter],
    queryFn: () =>
      get<{ data: Invoice[] }>(
        "/invoices",
        statusFilter ? { params: { status: statusFilter } } : undefined,
      ),
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
        <Button leftIcon={<PlusCircle size={16} />}>Create Fee</Button>
      </div>

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
