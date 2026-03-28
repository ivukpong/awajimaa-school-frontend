"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type {
  FreelancerProfile,
  TeacherEngagement,
  TeacherPosting,
  Wallet,
} from "@/types";

interface PublicProfileProps {
  profile: FreelancerProfile;
}

export default function PublicProfile({ profile }: PublicProfileProps) {
  const name = profile.user?.name || "-";
  const avatar = profile.user?.avatar;
  return (
    <div className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            {avatar ? (
              <img src={avatar} alt={name} className="w-16 h-16 rounded-full" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-brand flex items-center justify-center text-white text-2xl font-bold">
                {name.charAt(0)}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {name}
              </h2>
              <div className="flex gap-2 mt-1">
                <Badge variant="blue">Freelancer Teacher</Badge>
                {profile.is_available && (
                  <Badge variant="green">Available</Badge>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <strong>Subjects:</strong> {profile.subjects?.join(", ") || "—"}
            </div>
            <div>
              <strong>Qualification:</strong> {profile.qualification || "—"}
            </div>
            <div>
              <strong>Specialization:</strong> {profile.specialization || "—"}
            </div>
            <div>
              <strong>Students Taught:</strong>{" "}
              {profile.total_students ?? profile.total_sessions ?? "—"}
            </div>
            <div>
              <strong>Average Rating:</strong>{" "}
              {profile.average_rating?.toFixed(2) ?? "—"} (
              {profile.ratings_count} ratings)
            </div>
            <div>
              <strong>Hourly Rate:</strong> ${profile.hourly_rate_usd} / ₦
              {profile.hourly_rate_ngn}
            </div>
            <div>
              <strong>Total Revenue:</strong> ${profile.total_revenue_usd} / ₦
              {profile.total_revenue_ngn}
            </div>
            {/* Current School and Schools Taught omitted as not in FreelancerProfile */}
          </div>
          <div className="mt-4">
            <strong>Bio:</strong>
            <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line mt-1">
              {profile.bio || "—"}
            </div>
          </div>
          {/* Additional fields can be added here if needed */}
        </CardContent>
      </Card>
    </div>
  );
}
