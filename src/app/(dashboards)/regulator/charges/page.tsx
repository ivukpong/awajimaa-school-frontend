"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Table, type Column } from "@/components/ui/Table";
import { Plus, CreditCard, AlertCircle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface ChargeRow extends Record<string, unknown> {
  id: number;
  name: string;
  amount: number;
  charge_type: string;
  applies_to: string;
  due_date: string;
  schools_paid: number;
  schools_total: number;
  is_active: boolean;
}

const mockCharges: ChargeRow[] = [
  {
    id: 1,
    name: "Annual School Registration Levy",
    amount: 50000,
    charge_type: "registration",
    applies_to: "All schools",
    due_date: "2025-12-31",
    schools_paid: 210,
    schools_total: 248,
    is_active: true,
  },
  {
    id: 2,
    name: "Education Development Tax",
    amount: 25000,
    charge_type: "tax",
    applies_to: "Private schools",
    due_date: "2025-10-31",
    schools_paid: 88,
    schools_total: 140,
    is_active: true,
  },
  {
    id: 3,
    name: "Annual Inspection Fee",
    amount: 15000,
    charge_type: "inspection",
    applies_to: "All schools",
    due_date: "2026-02-28",
    schools_paid: 45,
    schools_total: 248,
    is_active: true,
  },
  {
    id: 4,
    name: "School Renewal (2023/2024)",
    amount: 30000,
    charge_type: "renewal",
    applies_to: "All schools",
    due_date: "2024-08-31",
    schools_paid: 248,
    schools_total: 248,
    is_active: false,
  },
];

const columns: Column<ChargeRow>[] = [
  {
    key: "name",
    header: "Charge Name",
    sortable: true,
    render: (r) => (
      <span className="font-medium text-gray-900 dark:text-white">
        {r.name}
      </span>
    ),
  },
  {
    key: "amount",
    header: "Amount",
    sortable: true,
    render: (r) => formatCurrency(r.amount),
  },
  {
    key: "charge_type",
    header: "Type",
    render: (r) => <Badge variant="blue">{r.charge_type}</Badge>,
  },
  { key: "applies_to", header: "Applies To" },
  {
    key: "due_date",
    header: "Due Date",
    render: (r) => formatDate(r.due_date),
  },
  {
    key: "schools_paid",
    header: "Collection",
    render: (r) => {
      const pct = Math.round((r.schools_paid / r.schools_total) * 100);
      return (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>
              {r.schools_paid}/{r.schools_total} schools
            </span>
            <span className="font-medium">{pct}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-gray-200">
            <div
              className="h-1.5 rounded-full bg-brand"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      );
    },
  },
  {
    key: "is_active",
    header: "Status",
    render: (r) => (
      <Badge variant={r.is_active ? "green" : "gray"}>
        {r.is_active ? "Active" : "Closed"}
      </Badge>
    ),
  },
];

export default function RegulatorChargesPage() {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            School Charges
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and track levies, taxes, and fees for schools
          </p>
        </div>
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setShowModal(true)}
        >
          New Charge
        </Button>
      </div>

      {/* Alert */}
      <div className="flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900/30 dark:bg-yellow-900/10">
        <AlertCircle className="h-5 w-5 text-yellow-600 shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-yellow-800 dark:text-yellow-400">
            38 schools have not paid the Annual Inspection Fee
          </p>
          <p className="text-yellow-700 dark:text-yellow-500">
            Payment is due on 28 Feb 2026. Send reminders to defaulters.
          </p>
        </div>
        <Button variant="outline" size="sm" className="ml-auto shrink-0">
          Send Reminder
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        {[
          {
            label: "Total Charges",
            value: formatCurrency(1_200_000_000),
            color: "text-gray-900 dark:text-white",
          },
          {
            label: "Collected",
            value: formatCurrency(820_000_000),
            color: "text-green-600",
          },
          {
            label: "Outstanding",
            value: formatCurrency(380_000_000),
            color: "text-red-600",
          },
        ].map((s) => (
          <Card key={s.label} className="py-4">
            <p className="text-xs text-gray-500">{s.label}</p>
            <p className={`mt-1 text-xl font-bold ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      <Table columns={columns} data={mockCharges} keyField="id" />

      {/* Create Charge Modal placeholder */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Create New Charge</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <Input
                  label="Charge Name"
                  placeholder="e.g. Annual Registration Levy"
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Amount (₦)"
                    type="number"
                    placeholder="50000"
                    required
                  />
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Charge Type
                    </label>
                    <select className="h-10 rounded-lg border border-gray-300 px-3 text-sm dark:border-gray-700 dark:bg-gray-800">
                      <option value="levy">Levy</option>
                      <option value="tax">Tax</option>
                      <option value="registration">Registration</option>
                      <option value="renewal">Renewal</option>
                      <option value="inspection">Inspection</option>
                    </select>
                  </div>
                </div>
                <Input label="Due Date" type="date" />
                <div className="flex flex-col gap-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <textarea
                    className="min-h-[80px] rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    placeholder="Optional description..."
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create Charge</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
