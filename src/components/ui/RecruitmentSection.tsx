"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { Briefcase, MapPin, Calendar, Users } from "lucide-react";
import Link from "next/link";

interface OpenCampaign {
  id: number;
  title: string;
  description?: string;
  type?: "primary" | "post_primary" | "secondary" | "tertiary";
  target_slots?: number;
  application_start_date?: string;
  application_deadline?: string;
  status: string;
  state?: { id: number; name: string };
  banner_url?: string;
}

const TYPE_LABELS: Record<string, string> = {
  primary: "Primary",
  post_primary: "Post Primary",
  secondary: "Secondary",
  tertiary: "Tertiary",
};

const TYPE_VARIANT: Record<string, "blue" | "green" | "purple" | "yellow"> = {
  primary: "green",
  post_primary: "blue",
  secondary: "purple",
  tertiary: "yellow",
};

function CampaignSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
      <div className="h-4 w-1/4 bg-gray-200 rounded mb-3" />
      <div className="h-5 w-3/4 bg-gray-200 rounded mb-2" />
      <div className="h-3 w-full bg-gray-100 rounded mb-1" />
      <div className="h-3 w-5/6 bg-gray-100 rounded mb-4" />
      <div className="h-8 w-28 bg-gray-200 rounded" />
    </div>
  );
}

export function RecruitmentSection() {
  const { data, isLoading } = useQuery<{ data: OpenCampaign[] }>({
    queryKey: ["public-open-campaigns"],
    queryFn: () =>
      get<{ success: boolean; data: { data: OpenCampaign[] } }>(
        "/public/recruitment-campaigns",
      ).then((r) => r.data.data),
    staleTime: 5 * 60 * 1000,
  });

  const campaigns =
    data?.data ?? (Array.isArray(data) ? (data as OpenCampaign[]) : []);

  if (!isLoading && campaigns.length === 0) return null;

  return (
    <section className="py-12 md:py-20 bg-gray-50" id="recruitment">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatedSection className="text-center mb-12">
          <span className="text-brand font-semibold text-sm uppercase tracking-wider">
            Now Hiring
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mt-2">
            Open Recruitment Opportunities
          </h2>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto text-sm">
            State ministries of education are actively recruiting qualified
            teachers. Apply today and make a difference.
          </p>
        </AnimatedSection>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <CampaignSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((c, idx) => (
              <AnimatedSection key={c.id} delay={idx * 100}>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full overflow-hidden">
                  {c.banner_url && (
                    <div className="h-36 w-full overflow-hidden">
                      <img
                        src={c.banner_url}
                        alt={c.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      {c.type && (
                        <Badge variant={TYPE_VARIANT[c.type] ?? "blue"}>
                          {TYPE_LABELS[c.type] ?? c.type}
                        </Badge>
                      )}
                      {c.state?.name && (
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" />
                          {c.state.name}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-2">
                      {c.title}
                    </h3>
                    {c.description && (
                      <p className="text-gray-500 text-sm mb-3 line-clamp-2 flex-1">
                        {c.description}
                      </p>
                    )}
                    <div className="mt-auto space-y-1.5 mb-4">
                      {c.target_slots != null && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Users className="h-3.5 w-3.5" />
                          <span>{c.target_slots} slots available</span>
                        </div>
                      )}
                      {c.application_deadline && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>
                            Deadline:{" "}
                            {new Date(
                              c.application_deadline,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                    <Link href={`/freelancer-teacher/recruitment`}>
                      <Button className="w-full bg-brand hover:bg-brand-dark text-white text-sm">
                        <Briefcase className="h-3.5 w-3.5 mr-1.5" /> Apply Now
                      </Button>
                    </Link>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
