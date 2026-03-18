"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import { Table } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";

interface School {
  id: number;
  name: string;
  email: string;
  [key: string]: unknown;
}

interface ReferralRow {
  id: number;
  school: School;
  subscription_amount: string;
  commission_amount: string;
  period_start: string;
  period_end: string;
  status: "pending" | "paid";
  [key: string]: unknown;
}

interface Paginated {
  data: ReferralRow[];
  current_page: number;
  last_page: number;
  total: number;
}

export default function AffiliateSchoolsPage() {
  const { data, isLoading } = useQuery<Paginated>({
    queryKey: ["affiliate-schools"],
    queryFn: () => get<Paginated>("/affiliate/schools").then((r) => r.data),
  });

  const rows = data?.data ?? [];

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">My Referred Schools</h1>
        <p className="text-sm text-gray-500 mt-1">
          Schools that signed up using your referral link — {data?.total ?? 0}{" "}
          total
        </p>
      </div>

      <Table<ReferralRow>
        loading={isLoading}
        keyField="id"
        columns={[
          {
            key: "school",
            header: "School",
            render: (r) => (
              <div>
                <p className="font-medium text-gray-900">{r.school.name}</p>
                <p className="text-xs text-gray-400">{r.school.email}</p>
              </div>
            ),
          },
          {
            key: "subscription_amount",
            header: "Subscription",
            render: (r) => `₦${Number(r.subscription_amount).toLocaleString()}`,
          },
          {
            key: "commission_amount",
            header: "Your Commission",
            render: (r) => (
              <span className="font-semibold text-green-700">
                ₦{Number(r.commission_amount).toLocaleString()}
              </span>
            ),
          },
          {
            key: "period_start",
            header: "Period",
            render: (r) => (
              <span className="text-xs text-gray-500">
                {r.period_start} → {r.period_end}
              </span>
            ),
          },
          {
            key: "status",
            header: "Status",
            render: (r) => (
              <Badge variant={r.status === "paid" ? "green" : "yellow"}>
                {r.status}
              </Badge>
            ),
          },
        ]}
        data={rows}
        emptyMessage="No referred schools yet. Share your referral link to get started."
      />
    </div>
  );
}
