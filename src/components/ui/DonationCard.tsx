"use client";

import Link from "next/link";
import { Heart, TrendingUp, Users, HandHeart } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useDonationStats } from "@/hooks/useDonation";

function StatTile({
  label,
  value,
  sub,
  icon,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-white/60 backdrop-blur-sm border border-white/80 shadow-sm">
      <div
        className={`h-10 w-10 rounded-xl ${accent} flex items-center justify-center shrink-0`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-500 font-medium leading-tight">
          {label}
        </p>
        <p className="text-xl font-extrabold text-gray-900 leading-tight mt-0.5">
          {value}
        </p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

const fmtCount = (n?: number) =>
  n == null
    ? "—"
    : n >= 1_000_000
      ? `${(n / 1_000_000).toFixed(1)}M`
      : n >= 1_000
        ? `${(n / 1_000).toFixed(1)}k`
        : String(n);

export function DonationCard() {
  const { data: stats, isLoading } = useDonationStats();

  const fmt = (n?: number) =>
    n == null
      ? "—"
      : n >= 1_000_000
        ? `$${(n / 1_000_000).toFixed(1)}M`
        : n >= 1_000
          ? `$${(n / 1_000).toFixed(1)}k`
          : `$${n.toLocaleString()}`;

  const tiles = [
    {
      label: "Total Donated",
      value: isLoading ? "..." : fmt(stats?.data?.total_donated),
      sub: "received in full",
      icon: <TrendingUp className="h-5 w-5 text-white" />,
      accent: "bg-brand",
    },
    {
      label: "Available Balance",
      value: isLoading ? "..." : fmt(stats?.data?.balance_remaining),
      sub: "ready to be used",
      icon: <Heart className="h-5 w-5 text-white" />,
      accent: "bg-brand-dark",
    },
    {
      label: "Students Supported",
      value: isLoading ? "..." : fmtCount(stats?.data?.students_paid),
      sub: "fees paid so far",
      icon: <Users className="h-5 w-5 text-white" />,
      accent: "bg-blue-500",
    },
    {
      label: "Total Donations",
      value: isLoading ? "..." : fmtCount(stats?.data?.sponsors_count),
      sub: "individual contributions",
      icon: <HandHeart className="h-5 w-5 text-white" />,
      accent: "bg-purple-500",
    },
  ];

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand/5 via-white to-brand/10 border border-brand/20 shadow-md p-6 sm:p-8">
      {/* Decorative blobs */}
      <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-brand/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-brand/10 blur-3xl" />

      <div className="relative">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Heart className="h-5 w-5 text-brand fill-brand" />
              <span className="text-brand font-semibold text-sm uppercase tracking-wider">
                Donation Wallet
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">
              Donate &amp; Change a Life
            </h2>
            <p className="text-gray-500 text-sm mt-1 max-w-md">
              Every donation goes directly toward paying school fees for
              students who can't afford it. 100% transparent — you can see
              exactly where your contribution goes.
            </p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link href="/donate">
              <Button className="bg-brand hover:bg-brand-dark text-white shadow-sm">
                Donate Now →
              </Button>
            </Link>
            <Link href="/donate#donors">
              <Button
                variant="outline"
                className="border-brand/30 text-brand hover:bg-brand/5"
              >
                View All
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {tiles.map((t) => (
            <StatTile key={t.label} {...t} />
          ))}
        </div>
      </div>
    </div>
  );
}
