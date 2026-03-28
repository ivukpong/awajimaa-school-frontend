"use client";
import React from "react";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  HeartHandshake,
  GraduationCap,
  CreditCard,
  BarChart3,
  BookOpen,
  MessageSquare,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const sponsoredStudents = [
  {
    id: 1,
    name: "Mercy Udo",
    class: "SS 2A",
    school: "Greenfield Academy",
    scholarship: "Full Scholarship",
    amount_due: 350000,
    amount_paid: 200000,
    avg_score: 78,
    needs: ["New school uniform", "Biology textbook"],
  },
  {
    id: 2,
    name: "Daniel Obi",
    class: "JSS 3B",
    school: "Govt. Secondary, Uyo",
    scholarship: "Partial Scholarship",
    amount_due: 180000,
    amount_paid: 180000,
    avg_score: 84,
    needs: [],
  },
];

import { withRoleGuard } from "@/lib/withRoleGuard";

function SponsorDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Sponsor Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Empowering students through your scholarship support
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Sponsored Students"
          value="2"
          icon={<GraduationCap className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Total Committed"
          value={formatCurrency(530000)}
          icon={<HeartHandshake className="h-5 w-5" />}
          color="purple"
        />
        <StatCard
          title="Paid This Term"
          value={formatCurrency(380000)}
          icon={<CreditCard className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          title="Outstanding"
          value={formatCurrency(150000)}
          icon={<CreditCard className="h-5 w-5" />}
          color="yellow"
        />
      </div>

      {/* Student Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {sponsoredStudents.map((s) => (
          <Card key={s.id}>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand font-bold shrink-0">
                {s.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {s.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {s.class} · {s.school}
                    </p>
                  </div>
                  <Badge variant="purple">{s.scholarship}</Badge>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-2">
                    <p className="text-gray-500">Amount Due</p>
                    <p className="font-bold text-gray-900 dark:text-white mt-0.5">
                      {formatCurrency(s.amount_due)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-2">
                    <p className="text-gray-500">Paid</p>
                    <p className="font-bold text-green-600 mt-0.5">
                      {formatCurrency(s.amount_paid)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-2">
                    <p className="text-gray-500">Avg Score</p>
                    <p className="font-bold text-brand mt-0.5">
                      {s.avg_score}%
                    </p>
                  </div>
                </div>

                {s.needs.length > 0 && (
                  <div className="mt-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 p-2">
                    <p className="text-xs font-medium text-yellow-800 dark:text-yellow-400 mb-1">
                      Needs
                    </p>
                    <ul className="space-y-0.5">
                      {s.needs.map((n, i) => (
                        <li
                          key={i}
                          className="text-xs text-yellow-700 dark:text-yellow-500 flex items-center gap-1"
                        >
                          <span className="h-1 w-1 rounded-full bg-yellow-500 inline-block shrink-0" />
                          {n}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                leftIcon={<BarChart3 className="h-4 w-4" />}
              >
                Reports
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                leftIcon={<MessageSquare className="h-4 w-4" />}
              >
                Message
              </Button>
              <Button
                size="sm"
                className="flex-1"
                leftIcon={<CreditCard className="h-4 w-4" />}
              >
                Donate
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Scholarship breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Scholarship Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { category: "School Fees", due: 350000, paid: 280000 },
              { category: "Books", due: 80000, paid: 80000 },
              { category: "School Uniforms", due: 45000, paid: 20000 },
              { category: "Upkeep Allowance", due: 55000, paid: 0 },
            ].map((item) => {
              const pct = Math.round((item.paid / item.due) * 100);
              return (
                <div key={item.category} className="flex items-center gap-4">
                  <div className="w-32 shrink-0 text-sm text-gray-700 dark:text-gray-300">
                    {item.category}
                  </div>
                  <div className="flex-1">
                    <div className="h-2 rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-brand"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-24 text-right text-xs text-gray-500">
                    {formatCurrency(item.paid)} / {formatCurrency(item.due)}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default withRoleGuard(SponsorDashboard, ["sponsor"]);
