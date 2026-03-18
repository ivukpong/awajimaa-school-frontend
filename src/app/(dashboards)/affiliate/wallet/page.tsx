"use client";
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Wallet, ArrowDownToLine } from "lucide-react";
import toast from "react-hot-toast";
import { get, post } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Table } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";

interface Withdrawal {
  id: number;
  amount: string;
  bank_name: string;
  account_number: string;
  account_name: string;
  status: "pending" | "approved" | "paid";
  requested_at: string;
  paid_at: string | null;
  [key: string]: unknown;
}

interface WalletData {
  balance: string;
  total_earned: string;
  total_paid: string;
  withdrawals: { data: Withdrawal[] };
}

export default function AffiliateWalletPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({
    amount: "",
    bank_name: "",
    account_number: "",
    account_name: "",
  });

  const { data, isLoading } = useQuery<WalletData>({
    queryKey: ["affiliate-wallet"],
    queryFn: () => get<WalletData>("/affiliate/wallet").then((r) => r.data),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: typeof form) =>
      post("/affiliate/withdraw", {
        ...payload,
        amount: Number(payload.amount),
      }),
    onSuccess: () => {
      toast.success("Withdrawal requested! We'll process it shortly.");
      setForm({
        amount: "",
        bank_name: "",
        account_number: "",
        account_name: "",
      });
      qc.invalidateQueries({ queryKey: ["affiliate-wallet"] });
      qc.invalidateQueries({ queryKey: ["affiliate-dashboard"] });
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Request failed.");
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (
      !form.amount ||
      !form.bank_name ||
      !form.account_number ||
      !form.account_name
    ) {
      toast.error("Please fill in all fields.");
      return;
    }
    mutate(form);
  }

  const withdrawals = data?.withdrawals?.data ?? [];

  return (
    <div className="p-6 space-y-6">
      {/* Balance summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          {
            label: "Wallet Balance",
            value: `₦${Number(data?.balance ?? 0).toLocaleString()}`,
            highlight: true,
          },
          {
            label: "Total Earned",
            value: `₦${Number(data?.total_earned ?? 0).toLocaleString()}`,
          },
          {
            label: "Total Paid Out",
            value: `₦${Number(data?.total_paid ?? 0).toLocaleString()}`,
          },
        ].map((s) => (
          <Card key={s.label}>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {s.label}
            </p>
            <p
              className={`text-2xl font-bold mt-1 ${s.highlight ? "text-brand" : "text-gray-900"}`}
            >
              {isLoading ? "—" : s.value}
            </p>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Withdrawal request form */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <ArrowDownToLine className="h-5 w-5 text-brand" />
            <h2 className="text-base font-semibold text-gray-900">
              Request Withdrawal
            </h2>
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input
              label="Amount (₦)"
              type="number"
              placeholder="e.g. 5000"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              required
            />
            <Input
              label="Bank Name"
              placeholder="e.g. Access Bank"
              value={form.bank_name}
              onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
              required
            />
            <Input
              label="Account Number"
              placeholder="10-digit account number"
              value={form.account_number}
              onChange={(e) =>
                setForm({ ...form, account_number: e.target.value })
              }
              required
            />
            <Input
              label="Account Name"
              placeholder="Name on bank account"
              value={form.account_name}
              onChange={(e) =>
                setForm({ ...form, account_name: e.target.value })
              }
              required
            />
            <Button type="submit" className="w-full" loading={isPending}>
              <Wallet className="h-4 w-4 mr-2" />
              Request Withdrawal
            </Button>
          </form>
        </Card>

        {/* Withdrawal history */}
        <Card>
          <h2 className="text-base font-semibold text-gray-900 mb-4">
            Withdrawal History
          </h2>
          <Table<Withdrawal>
            loading={isLoading}
            keyField="id"
            columns={[
              {
                key: "amount",
                header: "Amount",
                render: (w) => (
                  <span className="font-semibold">
                    ₦{Number(w.amount).toLocaleString()}
                  </span>
                ),
              },
              {
                key: "bank_name",
                header: "Bank",
                render: (w) => (
                  <div>
                    <p className="text-sm font-medium">{w.bank_name}</p>
                    <p className="text-xs text-gray-400">{w.account_number}</p>
                  </div>
                ),
              },
              {
                key: "status",
                header: "Status",
                render: (w) => (
                  <Badge
                    variant={
                      w.status === "paid"
                        ? "green"
                        : w.status === "approved"
                          ? "blue"
                          : "yellow"
                    }
                  >
                    {w.status}
                  </Badge>
                ),
              },
              {
                key: "requested_at",
                header: "Requested",
                render: (w) => (
                  <span className="text-xs text-gray-500">
                    {new Date(w.requested_at).toLocaleDateString()}
                  </span>
                ),
              },
            ]}
            data={withdrawals}
            emptyMessage="No withdrawals yet."
          />
        </Card>
      </div>
    </div>
  );
}
