"use client";
import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, type Column } from "@/components/ui/Table";
import { usePayroll } from "@/hooks/useHR";
import type { PayrollItem } from "@/types/hr";
import { DollarSign, FileText } from "lucide-react";
import toast from "react-hot-toast";

export default function TeacherSalaryPage() {
  const { runs, loading, getRunDetails } = usePayroll();
  const [payslip, setPayslip] = useState<PayrollItem | null>(null);

  const handleViewPayslip = async (runId: number) => {
    try {
      const detail = await getRunDetails(runId);
      if (detail.items?.length) {
        setPayslip(detail.items[0]);
      } else {
        toast("No payslip found for this run");
      }
    } catch {
      toast.error("Could not load payslip");
    }
  };

  const statusColors: Record<string, "gray" | "yellow" | "green" | "blue"> = {
    draft: "gray",
    approved: "blue",
    paid: "green",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          My Salary
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          View your payslips and payment history
        </p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-500" />
          <h2 className="font-semibold">Payroll History</h2>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-gray-500 py-8 text-center">Loading…</p>
          ) : (
            <div className="space-y-3">
              {(runs?.data ?? []).map((run) => (
                <div
                  key={run.id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {run.month}
                    </p>
                    <Badge
                      variant={statusColors[run.status] ?? "gray"}
                      className="mt-1"
                    >
                      {run.status}
                    </Badge>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleViewPayslip(run.id)}
                  >
                    <FileText className="h-3 w-3 mr-1" />
                    View Payslip
                  </Button>
                </div>
              ))}
              {!runs?.data?.length && (
                <p className="text-sm text-gray-500 py-8 text-center">
                  No payroll records yet
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {payslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl bg-white dark:bg-gray-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Payslip</h2>
              <button
                onClick={() => setPayslip(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                &times;
              </button>
            </div>
            <div className="space-y-2 text-sm">
              {[
                ["Basic Salary", payslip.basic_salary],
                ["Total Allowances", payslip.total_allowances],
                [
                  "Gross Salary",
                  (
                    Number(payslip.basic_salary) +
                    Number(payslip.total_allowances)
                  ).toFixed(2),
                ],
                ["Pension (8%)", payslip.pension_deduction],
                ["Tax (PAYE)", payslip.tax_deduction],
                ["Other Deductions", payslip.other_deductions ?? 0],
              ].map(([label, val]) => (
                <div
                  key={String(label)}
                  className="flex justify-between py-1 border-b border-gray-100"
                >
                  <span className="text-gray-600">{label}</span>
                  <span className="font-medium">
                    ₦{Number(val).toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="flex justify-between py-2 text-base font-bold text-green-600">
                <span>Net Pay</span>
                <span>₦{Number(payslip.net_salary).toLocaleString()}</span>
              </div>
            </div>
            <Button className="w-full" onClick={() => setPayslip(null)}>
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
