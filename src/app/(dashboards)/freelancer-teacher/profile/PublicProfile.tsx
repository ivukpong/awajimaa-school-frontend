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
  profile: {
    id: number;
    name: string;
    avatar?: string;
    subjects: string[];
    qualification?: string;
    specialization?: string;
    bio?: string;
    state?: string;
    lga?: string;
    google_scholar_url?: string;
    publons_url?: string;
    researchgate_url?: string;
    orcid_url?: string;
    scopus_url?: string;
    hourly_rate_usd: number;
    hourly_rate_ngn: number;
    average_rating: number;
    ratings_count: number;
    is_available: boolean;
    students_taught: number;
    total_revenue_usd: number;
    total_revenue_ngn: number;
    wallets: Wallet[];
    gigs: TeacherEngagement[];
    schools: TeacherPosting[];
    current_school?: TeacherPosting;
    certificates: any[];
  };
}

export default function PublicProfile({ profile }: PublicProfileProps) {
  return (
    <div className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            {profile.avatar ? (
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-16 h-16 rounded-full"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-brand flex items-center justify-center text-white text-2xl font-bold">
                {profile.name.charAt(0)}
              </div>
            )}
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {profile.name}
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
              <strong>Students Taught:</strong> {profile.students_taught ?? "—"}
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
            <div>
              <strong>Current School:</strong>{" "}
              {profile.current_school?.school?.name || "—"}
            </div>
            <div>
              <strong>Schools Taught:</strong>{" "}
              {profile.schools
                ?.map((s) => s?.name)
                .filter(Boolean)
                .join(", ") || "—"}
            </div>
          </div>
          <div className="mt-4">
            <strong>Bio:</strong>
            <div className="text-gray-700 dark:text-gray-300 whitespace-pre-line mt-1">
              {profile.bio || "—"}
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <strong>Academic Links:</strong>
              <ul className="list-disc ml-5 mt-1">
                {profile.google_scholar_url && (
                  <li>
                    <a
                      href={profile.google_scholar_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Google Scholar
                    </a>
                  </li>
                )}
                {profile.publons_url && (
                  <li>
                    <a
                      href={profile.publons_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Publons
                    </a>
                  </li>
                )}
                {profile.researchgate_url && (
                  <li>
                    <a
                      href={profile.researchgate_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      ResearchGate
                    </a>
                  </li>
                )}
                {profile.orcid_url && (
                  <li>
                    <a
                      href={profile.orcid_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      ORCID
                    </a>
                  </li>
                )}
                {profile.scopus_url && (
                  <li>
                    <a
                      href={profile.scopus_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Scopus
                    </a>
                  </li>
                )}
                {!profile.google_scholar_url &&
                  !profile.publons_url &&
                  !profile.researchgate_url &&
                  !profile.orcid_url &&
                  !profile.scopus_url && <li>—</li>}
              </ul>
            </div>
            <div>
              <strong>Certificates:</strong>
              <ul className="list-disc ml-5 mt-1">
                {profile.certificates?.length ? (
                  profile.certificates.map((c, i) => <li key={i}>{c.title}</li>)
                ) : (
                  <li>—</li>
                )}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recent Gigs / Engagements</CardTitle>
        </CardHeader>
        <CardContent>
          {profile.gigs?.length ? (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {profile.gigs.map((gig) => (
                <li key={gig.id} className="py-2">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <strong>{gig.subject}</strong> ({gig.status})<br />
                      <span className="text-xs text-gray-500">
                        {gig.start_date} - {gig.end_date}
                      </span>
                    </div>
                    <div className="text-sm mt-2 sm:mt-0">
                      <span className="font-semibold">
                        {gig.currency === "usd" ? "$" : "₦"}
                        {gig.total_amount}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-gray-400">No gigs yet.</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
