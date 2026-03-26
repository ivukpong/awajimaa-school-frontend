"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import toast from "react-hot-toast";
import {
  useWalletBalance,
  useWalletTransactions,
  useWalletPayouts,
  useRequestPayout,
} from "@/hooks/useWallet";
import { formatDate } from "@/lib/utils";
import type { WalletPayout } from "@/types";

const PAYOUT_STATUS_VARIANT: Record<
  string,
  "green" | "blue" | "yellow" | "red" | "gray"
> = {
  pending: "yellow",
  approved: "blue",
  paid: "green",
  rejected: "red",
};

function PayoutStatusBadge({ status }: { status: WalletPayout["status"] }) {
  return (
    <Badge
      variant={PAYOUT_STATUS_VARIANT[status] ?? "gray"}
      size="sm"
      className="capitalize"
    >
      {status}
    </Badge>
  );
}

export default function FreelancerWalletPage() {
  const { data: balanceRes } = useWalletBalance();
  const { data: txRes } = useWalletTransactions();
  const { data: payoutsRes } = useWalletPayouts();
  const requestPayout = useRequestPayout();

  const usdWallet = balanceRes?.data?.usd;
  const ngnWallet = balanceRes?.data?.ngn;
  const transactions = txRes?.data?.data ?? [];
  const payouts: WalletPayout[] =
    (payoutsRes?.data as unknown as WalletPayout[]) ?? [];

  const [showPayoutForm, setShowPayoutForm] = useState(false);
  const [payoutForm, setPayoutForm] = useState({
    currency: "ngn" as "usd" | "ngn",
    amount: "",
    bank_name: "",
    account_number: "",
    account_name: "",
  });

  async function handlePayoutRequest(e: React.FormEvent) {
    e.preventDefault();
    if (!payoutForm.amount || parseFloat(payoutForm.amount) <= 0) {
      toast.error("Enter a valid amount.");
      return;
    }
    try {
      await requestPayout.mutateAsync({
        ...payoutForm,
        amount: parseFloat(payoutForm.amount),
      });
      toast.success("Payout request submitted!");
      setShowPayoutForm(false);
      setPayoutForm({
        currency: "ngn",
        amount: "",
        bank_name: "",
        account_number: "",
        account_name: "",
      });
    } catch {
      toast.error("Failed to submit payout request.");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        My Wallet
      </h1>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-blue-600 text-white">
          <CardContent className="pt-6 space-y-1">
            <p className="text-sm text-blue-100">USD Balance</p>
            <p className="text-3xl font-bold">
              ${(usdWallet?.balance ?? 0).toFixed(2)}
            </p>
            <p className="text-xs text-blue-200">
              Earned: ${(usdWallet?.total_earned ?? 0).toFixed(2)} · Withdrawn:
              ${(usdWallet?.total_withdrawn ?? 0).toFixed(2)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-green-600 text-white">
          <CardContent className="pt-6 space-y-1">
            <p className="text-sm text-green-100">NGN Balance</p>
            <p className="text-3xl font-bold">
              ₦{(ngnWallet?.balance ?? 0).toLocaleString()}
            </p>
            <p className="text-xs text-green-200">
              Earned: ₦{(ngnWallet?.total_earned ?? 0).toLocaleString()} ·
              Withdrawn: ₦{(ngnWallet?.total_withdrawn ?? 0).toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setShowPayoutForm((v) => !v)}>
          {showPayoutForm ? "Cancel" : "Request Payout"}
        </Button>
      </div>

      {/* Payout Request Form */}
      {showPayoutForm && (
        <Card>
          <CardHeader>
            <CardTitle>Request Payout</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handlePayoutRequest}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Currency
                </label>
                <select
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                  value={payoutForm.currency}
                  onChange={(e) =>
                    setPayoutForm((p) => ({
                      ...p,
                      currency: e.target.value as "usd" | "ngn",
                    }))
                  }
                >
                  <option value="ngn">NGN</option>
                  <option value="usd">USD</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  required
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                  value={payoutForm.amount}
                  onChange={(e) =>
                    setPayoutForm((p) => ({ ...p, amount: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Bank Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                  value={payoutForm.bank_name}
                  onChange={(e) =>
                    setPayoutForm((p) => ({ ...p, bank_name: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Account Number
                </label>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                  value={payoutForm.account_number}
                  onChange={(e) =>
                    setPayoutForm((p) => ({
                      ...p,
                      account_number: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  required
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
                  value={payoutForm.account_name}
                  onChange={(e) =>
                    setPayoutForm((p) => ({
                      ...p,
                      account_name: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="sm:col-span-2 flex justify-end">
                <Button type="submit" disabled={requestPayout.isPending}>
                  {requestPayout.isPending ? "Submitting…" : "Submit Request"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              No transactions yet.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {transactions.map((tx) => (
                <li
                  key={tx.id}
                  className="py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">{tx.description}</p>
                    <p className="text-xs text-gray-400">
                      {formatDate(tx.created_at)}
                    </p>
                  </div>
                  <span
                    className={`text-sm font-bold ${tx.type === "credit" ? "text-green-600" : "text-red-500"}`}
                  >
                    {tx.type === "credit" ? "+" : "-"}
                    {tx.wallet?.currency === "usd" ? "$" : "₦"}
                    {tx.amount.toLocaleString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle>Payout Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">
              No payout requests yet.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100 dark:divide-gray-800">
              {payouts.map((p) => (
                <li
                  key={p.id}
                  className="py-3 flex items-center justify-between gap-2"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {p.wallet?.currency?.toUpperCase()}{" "}
                      {p.amount.toLocaleString()} → {p.bank_name} (
                      {p.account_number})
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatDate(p.created_at)}
                    </p>
                  </div>
                  <PayoutStatusBadge status={p.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
