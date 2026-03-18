"use client";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Copy,
  ExternalLink,
  TrendingUp,
  School,
  Wallet,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import { get } from "@/lib/api";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface AffiliateDashboard {
  referral_code: string;
  commission_rate: number;
  total_schools: number;
  total_earned: string;
  total_paid: string;
  wallet_balance: string;
  pending_earnings: string;
  pending_withdrawal: string;
  status: "active" | "suspended";
}

export default function AffiliateDashboardPage() {
  const { data, isLoading } = useQuery<AffiliateDashboard>({
    queryKey: ["affiliate-dashboard"],
    queryFn: () =>
      get<AffiliateDashboard>("/affiliate/dashboard").then((r) => r.data),
  });

  const referralLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/register?ref=${data?.referral_code ?? ""}`
      : "";

  function copyLink() {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied!");
  }

  if (isLoading) {
    return (
      <div className="p-6 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="My Schools"
          value={data?.total_schools ?? 0}
          icon={<School className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Total Earned"
          value={`₦${Number(data?.total_earned ?? 0).toLocaleString()}`}
          icon={<TrendingUp className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          title="Wallet Balance"
          value={`₦${Number(data?.wallet_balance ?? 0).toLocaleString()}`}
          icon={<Wallet className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Pending Earnings"
          value={`₦${Number(data?.pending_earnings ?? 0).toLocaleString()}`}
          icon={<Clock className="h-5 w-5" />}
          color="yellow"
        />
      </div>

      {/* Referral Link */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-500 mb-1">
              Your Referral Link
            </p>
            <p className="text-sm font-mono bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 truncate text-gray-800">
              {referralLink || "Loading…"}
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={copyLink}>
              <Copy className="h-4 w-4 mr-1" /> Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(referralLink, "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-1" /> Preview
            </Button>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-3 text-sm text-gray-500">
          <span>
            Code:{" "}
            <span className="font-mono font-semibold text-brand">
              {data?.referral_code}
            </span>
          </span>
          <span>·</span>
          <span>
            Commission rate: <strong>{data?.commission_rate}%</strong>
          </span>
          <span>·</span>
          <span>
            Status:{" "}
            <span
              className={
                data?.status === "active"
                  ? "text-green-600 font-medium"
                  : "text-red-500 font-medium"
              }
            >
              {data?.status}
            </span>
          </span>
        </div>
      </Card>
    </div>
  );
}
