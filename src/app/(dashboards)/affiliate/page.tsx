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
  Trophy,
  Medal,
  Calendar,
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

interface LeaderboardEntry {
  rank: number;
  name: string;
  school_count: number;
  total_commission: number;
}

interface PayoutSchedule {
  options: string[];
  note: string;
  top_rewarded: number;
}

interface LeaderboardResponse {
  leaderboard: LeaderboardEntry[];
  payout_schedule: PayoutSchedule;
}

const RANK_COLORS: Record<number, string> = {
  1: "text-yellow-500",
  2: "text-gray-400",
  3: "text-amber-600",
};

const RANK_ICONS: Record<number, React.ReactNode> = {
  1: <Trophy className="h-4 w-4 text-yellow-500" />,
  2: <Medal className="h-4 w-4 text-gray-400" />,
  3: <Medal className="h-4 w-4 text-amber-600" />,
};

export default function AffiliateDashboardPage() {
  const { data, isLoading } = useQuery<AffiliateDashboard>({
    queryKey: ["affiliate-dashboard"],
    queryFn: () =>
      get<AffiliateDashboard>("/affiliate/dashboard").then((r) => r.data),
  });

  const { data: leaderboardData } = useQuery<LeaderboardResponse>({
    queryKey: ["affiliate-leaderboard"],
    queryFn: () =>
      get<LeaderboardResponse>("/affiliate/leaderboard").then((r) => r.data),
    staleTime: 5 * 60 * 1000,
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

  const leaderboard = leaderboardData?.leaderboard ?? [];
  const payoutSchedule = leaderboardData?.payout_schedule;

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
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
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

      {/* Payout Schedule Info */}
      {payoutSchedule && (
        <Card>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 p-2 rounded-lg bg-brand/10">
              <Calendar className="h-5 w-5 text-brand" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Payout Schedule
              </h3>
              <p className="text-sm text-gray-500 mb-2">
                {payoutSchedule.note}
              </p>
              <div className="flex gap-2">
                {payoutSchedule.options.map((opt) => (
                  <span
                    key={opt}
                    className="inline-flex items-center rounded-full bg-green-50 border border-green-200 px-3 py-1 text-xs font-medium text-green-700"
                  >
                    {opt}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Leaderboard */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-5 w-5 text-yellow-500" />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Affiliate Leaderboard
          </h3>
          <span className="ml-auto text-xs text-gray-400">
            Top {leaderboard.length} affiliates · rewarded annually
          </span>
        </div>

        {leaderboard.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">
            No affiliates ranked yet.
          </p>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {leaderboard.map((entry) => (
              <div
                key={entry.rank}
                className={`flex items-center gap-4 py-3 ${
                  entry.rank <= 5
                    ? "bg-yellow-50/40 dark:bg-yellow-900/5 -mx-4 px-4 first:-mt-1"
                    : ""
                }`}
              >
                {/* Rank badge */}
                <div className="w-8 flex justify-center">
                  {RANK_ICONS[entry.rank] ?? (
                    <span
                      className={`text-sm font-bold ${
                        RANK_COLORS[entry.rank] ?? "text-gray-400"
                      }`}
                    >
                      #{entry.rank}
                    </span>
                  )}
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {entry.name}
                    {entry.rank <= 5 && (
                      <span className="ml-2 text-xs text-yellow-600 font-semibold">
                        Top {payoutSchedule?.top_rewarded ?? 5}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400">
                    {entry.school_count}{" "}
                    {entry.school_count === 1 ? "school" : "schools"}
                  </p>
                </div>

                {/* Earnings */}
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    ₦{entry.total_commission.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400">total commission</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
