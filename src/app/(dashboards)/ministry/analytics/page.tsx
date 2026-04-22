"use client";

import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  GraduationCap,
  HandCoins,
  School,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { get } from "@/lib/api";

type Period = "week" | "month" | "year";

type TrendDirection = "up" | "down";

interface TrendMetric {
  key: string;
  label: string;
  value: number;
  changePercent: number;
  direction: TrendDirection;
}

interface RankedItem {
  name: string;
  value: number;
}

interface MinistryAnalyticsResponse {
  metrics: TrendMetric[];
  topSchools: RankedItem[];
  topStudents: RankedItem[];
  topSponsors: RankedItem[];
  topMinistries: RankedItem[];
}

const PERIOD_LABEL: Record<Period, string> = {
  week: "this week",
  month: "this month",
  year: "this year",
};

const COLOR_SCALE = ["#d946ef", "#c026d3", "#a21caf", "#86198f", "#701a75"];

const DEMO_ANALYTICS: Record<Period, MinistryAnalyticsResponse> = {
  week: {
    metrics: [
      {
        key: "schools",
        label: "Schools",
        value: 428,
        changePercent: 3.2,
        direction: "up",
      },
      {
        key: "students",
        label: "Students",
        value: 12840,
        changePercent: 2.8,
        direction: "up",
      },
      {
        key: "sponsors",
        label: "Sponsors",
        value: 934,
        changePercent: 1.1,
        direction: "down",
      },
      {
        key: "ministries",
        label: "Ministries",
        value: 28,
        changePercent: 0.9,
        direction: "up",
      },
    ],
    topSchools: [
      { name: "Bright Future College", value: 94 },
      { name: "City Light Academy", value: 86 },
      { name: "Royal Crest High", value: 80 },
      { name: "Rivergate School", value: 76 },
      { name: "Unity Scholars Academy", value: 72 },
    ],
    topStudents: [
      { name: "Miriam Eze", value: 98 },
      { name: "Daniel Okoro", value: 95 },
      { name: "Aisha Bako", value: 93 },
      { name: "David Udo", value: 91 },
      { name: "Grace Nwosu", value: 89 },
    ],
    topSponsors: [
      { name: "EduLift Foundation", value: 81 },
      { name: "Hope Path Initiative", value: 78 },
      { name: "BuildTheFuture NGO", value: 74 },
      { name: "NextGen Trust", value: 70 },
      { name: "Glow Community", value: 66 },
    ],
    topMinistries: [
      { name: "Rivers Ministry", value: 92 },
      { name: "Lagos Ministry", value: 88 },
      { name: "Abuja Ministry", value: 84 },
      { name: "Delta Ministry", value: 80 },
      { name: "Enugu Ministry", value: 75 },
    ],
  },
  month: {
    metrics: [
      {
        key: "schools",
        label: "Schools",
        value: 435,
        changePercent: 4.6,
        direction: "up",
      },
      {
        key: "students",
        label: "Students",
        value: 13112,
        changePercent: 3.4,
        direction: "up",
      },
      {
        key: "sponsors",
        label: "Sponsors",
        value: 952,
        changePercent: 2.2,
        direction: "up",
      },
      {
        key: "ministries",
        label: "Ministries",
        value: 29,
        changePercent: 0.7,
        direction: "up",
      },
    ],
    topSchools: [
      { name: "Bright Future College", value: 96 },
      { name: "City Light Academy", value: 90 },
      { name: "Royal Crest High", value: 88 },
      { name: "Rivergate School", value: 83 },
      { name: "Unity Scholars Academy", value: 80 },
    ],
    topStudents: [
      { name: "Miriam Eze", value: 99 },
      { name: "Daniel Okoro", value: 97 },
      { name: "Aisha Bako", value: 95 },
      { name: "David Udo", value: 94 },
      { name: "Grace Nwosu", value: 92 },
    ],
    topSponsors: [
      { name: "EduLift Foundation", value: 86 },
      { name: "Hope Path Initiative", value: 82 },
      { name: "BuildTheFuture NGO", value: 79 },
      { name: "NextGen Trust", value: 74 },
      { name: "Glow Community", value: 71 },
    ],
    topMinistries: [
      { name: "Rivers Ministry", value: 95 },
      { name: "Lagos Ministry", value: 91 },
      { name: "Abuja Ministry", value: 88 },
      { name: "Delta Ministry", value: 84 },
      { name: "Enugu Ministry", value: 82 },
    ],
  },
  year: {
    metrics: [
      {
        key: "schools",
        label: "Schools",
        value: 462,
        changePercent: 8.9,
        direction: "up",
      },
      {
        key: "students",
        label: "Students",
        value: 14890,
        changePercent: 10.2,
        direction: "up",
      },
      {
        key: "sponsors",
        label: "Sponsors",
        value: 1021,
        changePercent: 7.4,
        direction: "up",
      },
      {
        key: "ministries",
        label: "Ministries",
        value: 31,
        changePercent: 3.4,
        direction: "up",
      },
    ],
    topSchools: [
      { name: "Bright Future College", value: 99 },
      { name: "City Light Academy", value: 95 },
      { name: "Royal Crest High", value: 93 },
      { name: "Rivergate School", value: 90 },
      { name: "Unity Scholars Academy", value: 88 },
    ],
    topStudents: [
      { name: "Miriam Eze", value: 100 },
      { name: "Daniel Okoro", value: 99 },
      { name: "Aisha Bako", value: 97 },
      { name: "David Udo", value: 96 },
      { name: "Grace Nwosu", value: 95 },
    ],
    topSponsors: [
      { name: "EduLift Foundation", value: 92 },
      { name: "Hope Path Initiative", value: 89 },
      { name: "BuildTheFuture NGO", value: 86 },
      { name: "NextGen Trust", value: 82 },
      { name: "Glow Community", value: 78 },
    ],
    topMinistries: [
      { name: "Rivers Ministry", value: 98 },
      { name: "Lagos Ministry", value: 95 },
      { name: "Abuja Ministry", value: 93 },
      { name: "Delta Ministry", value: 89 },
      { name: "Enugu Ministry", value: 86 },
    ],
  },
};

function TrendCard({ metric }: { metric: TrendMetric }) {
  const positive = metric.direction === "up";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">
          {metric.label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {metric.value.toLocaleString()}
        </p>
        <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-xs dark:bg-gray-800">
          {positive ? (
            <ArrowUpRight className="h-3.5 w-3.5 text-green-600" />
          ) : (
            <ArrowDownRight className="h-3.5 w-3.5 text-red-600" />
          )}
          <span className={positive ? "text-green-700" : "text-red-700"}>
            {metric.changePercent}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function RankingChart({
  title,
  items,
}: {
  title: string;
  items: RankedItem[];
}) {
  const chartData = items.slice(0, 5).map((item) => ({
    label: item.name.length > 18 ? `${item.name.slice(0, 18)}…` : item.name,
    value: item.value,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[260px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ left: 8, right: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
              <YAxis
                dataKey="label"
                type="category"
                width={120}
                tick={{ fontSize: 11 }}
              />
              <Tooltip />
              <Bar dataKey="value" radius={[6, 6, 6, 6]}>
                {chartData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={COLOR_SCALE[index % COLOR_SCALE.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MinistryAnalyticsPage() {
  const [period, setPeriod] = useState<Period>("week");

  const { data } = useQuery<MinistryAnalyticsResponse>({
    queryKey: ["ministry-analytics", period],
    queryFn: async () => {
      const response = await get<MinistryAnalyticsResponse>(
        `/ministry/analytics?period=${period}`,
      );
      return response.data;
    },
  });

  const analytics = useMemo(
    () => data ?? DEMO_ANALYTICS[period],
    [data, period],
  );

  const periodButtons: Period[] = ["week", "month", "year"];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Analytics Overview
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Compare trends by week, month, or year and spot movement at a
            glance.
          </p>
        </div>

        <div className="inline-flex rounded-xl border border-gray-200 p-1 dark:border-gray-700">
          {periodButtons.map((value) => (
            <Button
              key={value}
              size="sm"
              variant={period === value ? "primary" : "ghost"}
              onClick={() => setPeriod(value)}
              className="capitalize"
            >
              {value}
            </Button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center gap-3 py-4">
          <Badge variant="blue" className="inline-flex items-center gap-1">
            <Activity className="h-3.5 w-3.5" /> Insights for{" "}
            {PERIOD_LABEL[period]}
          </Badge>
          <span className="text-sm text-gray-500">
            Top performers and trend direction are refreshed for the selected
            period.
          </span>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {analytics.metrics.map((metric) => (
          <TrendCard key={metric.key} metric={metric} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <RankingChart title="Top Schools" items={analytics.topSchools} />
        <RankingChart title="Top Students" items={analytics.topStudents} />
        <RankingChart title="Top Sponsors" items={analytics.topSponsors} />
        <RankingChart title="Top Ministries" items={analytics.topMinistries} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top 20 Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[
            {
              label: "Schools",
              icon: <School className="h-4 w-4" />,
              items: analytics.topSchools,
            },
            {
              label: "Students",
              icon: <GraduationCap className="h-4 w-4" />,
              items: analytics.topStudents,
            },
            {
              label: "Sponsors",
              icon: <HandCoins className="h-4 w-4" />,
              items: analytics.topSponsors,
            },
            {
              label: "Ministries",
              icon: <Building2 className="h-4 w-4" />,
              items: analytics.topMinistries,
            },
          ].map((group) => (
            <div
              key={group.label}
              className="rounded-xl border border-gray-200 p-4 dark:border-gray-700"
            >
              <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                {group.icon} Top 20 {group.label}
              </p>
              <div className="space-y-2">
                {group.items.slice(0, 5).map((item, index) => (
                  <div key={item.name}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="truncate pr-2 text-gray-600 dark:text-gray-300">
                        {index + 1}. {item.name}
                      </span>
                      <span className="font-semibold text-gray-800 dark:text-gray-100">
                        {item.value}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-800">
                      <div
                        className="h-2 rounded-full bg-fuchsia-500"
                        style={{
                          width: `${Math.max(4, Math.min(item.value, 100))}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
