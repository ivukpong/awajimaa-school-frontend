"use client";
import React from "react";
import {
  Users,
  BookOpen,
  DollarSign,
  Star,
  HeartHandshake,
} from "lucide-react";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useFreelancerProfile } from "@/hooks/useFreelancer";
import { useEngagements } from "@/hooks/useEngagements";
import { formatDate } from "@/lib/utils";

const STATUS_VARIANT: Record<
  string,
  "green" | "blue" | "yellow" | "red" | "gray"
> = {
  pending: "yellow",
  accepted: "blue",
  ongoing: "blue",
  completed: "green",
  declined: "red",
  cancelled: "gray",
};

export default function FreelancerDashboardPage() {
  const { data: profileRes } = useFreelancerProfile();
  const { data: engagementsRes } = useEngagements({ page: 1 });

  const profile = profileRes?.data;
  const recentEngagements = engagementsRes?.data?.data?.slice(0, 5) ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Freelancer Dashboard
      </h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          title="Sessions"
          value={profile?.total_sessions ?? 0}
          icon={<BookOpen size={20} />}
          color="blue"
        />
        <StatCard
          title="Students"
          value={profile?.total_students ?? 0}
          icon={<Users size={20} />}
          color="purple"
        />
        <StatCard
          title="Revenue (USD)"
          value={`$${(profile?.total_revenue_usd ?? 0).toFixed(2)}`}
          icon={<DollarSign size={20} />}
          color="green"
        />
        <StatCard
          title="Revenue (NGN)"
          value={`₦${(profile?.total_revenue_ngn ?? 0).toLocaleString()}`}
          icon={<DollarSign size={20} />}
          color="yellow"
        />
        <StatCard
          title="Avg Rating"
          value={
            profile?.average_rating
              ? `${profile.average_rating.toFixed(1)} / 5`
              : "N/A"
          }
          icon={<Star size={20} />}
          color="yellow"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Status</CardTitle>
          </CardHeader>
          <CardContent>
            {!profile ? (
              <p className="text-sm text-gray-400 text-center py-6">
                No profile set up yet. Visit{" "}
                <a
                  href="/freelancer-teacher/profile"
                  className="text-blue-600 underline"
                >
                  My Profile
                </a>{" "}
                to get started.
              </p>
            ) : (
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Availability</dt>
                  <dd>
                    <Badge variant={profile.is_available ? "green" : "red"}>
                      {profile.is_available ? "Available" : "Unavailable"}
                    </Badge>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Rate (USD/hr)</dt>
                  <dd className="font-medium">${profile.hourly_rate_usd}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Rate (NGN/hr)</dt>
                  <dd className="font-medium">
                    ₦{profile.hourly_rate_ngn?.toLocaleString()}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Subjects</dt>
                  <dd className="font-medium text-right">
                    {(profile.subjects ?? []).join(", ") || "—"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Ratings</dt>
                  <dd className="font-medium">
                    {profile.ratings_count} review(s)
                  </dd>
                </div>
              </dl>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HeartHandshake className="h-4 w-4" />
              Recent Engagements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentEngagements.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                No engagements yet
              </p>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {recentEngagements.map((eng) => (
                  <li
                    key={eng.id}
                    className="py-3 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium text-sm">{eng.subject}</p>
                      <p className="text-xs text-gray-400">
                        {eng.parent?.name} · {formatDate(eng.scheduled_at)}
                      </p>
                    </div>
                    <Badge
                      variant={STATUS_VARIANT[eng.status] ?? "gray"}
                      size="sm"
                    >
                      {eng.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
