"use client";
import React from "react";
import {
  useInsuranceOperatorStats,
  useInsuranceClaims,
} from "@/hooks/useInsurance";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { formatCurrency } from "@/lib/utils";
import {
  Package,
  ShieldCheck,
  AlertTriangle,
  Banknote,
  Clock,
} from "lucide-react";

const CLAIM_STATUS_VARIANTS: Record<
  string,
  "blue" | "yellow" | "green" | "red" | "gray"
> = {
  pending: "yellow",
  under_review: "blue",
  approved: "green",
  rejected: "red",
  paid: "green",
};

export default function InsuranceOperatorDashboard() {
  const { data: statsData } = useInsuranceOperatorStats();
  const { data: claimsData } = useInsuranceClaims();

  const stats = statsData?.data;
  const recentClaims =
    (claimsData?.data as any[] | undefined)?.slice(0, 5) ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Insurance Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage your packages, subscriptions, and school claims
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Total Packages"
          value={stats?.total_packages ?? 0}
          icon={<Package className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Active Subscriptions"
          value={stats?.active_subscriptions ?? 0}
          icon={<ShieldCheck className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          title="Pending Claims"
          value={stats?.pending_claims ?? 0}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="yellow"
        />
        <StatCard
          title="Total Premium Collected"
          value={formatCurrency(stats?.total_premium_collected ?? 0)}
          icon={<Banknote className="h-5 w-5" />}
          color="purple"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Claims
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentClaims.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">
              No claims yet.
            </p>
          ) : (
            <div className="space-y-3">
              {recentClaims.map((claim: any) => (
                <div
                  key={claim.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {claim.school?.name ?? "—"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {claim.claim_type} · {claim.scheme?.name}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm font-semibold">
                      {formatCurrency(claim.amount_claimed)}
                    </p>
                    <Badge
                      variant={CLAIM_STATUS_VARIANTS[claim.status] ?? "gray"}
                    >
                      {claim.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
