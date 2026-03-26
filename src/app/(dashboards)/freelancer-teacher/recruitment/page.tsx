"use client";
import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/utils";
import { Briefcase, MapPin, Calendar } from "lucide-react";

interface PlatformJob {
  id: number;
  title: string;
  description: string;
  location?: string;
  deadline?: string;
  school?: { id: number; name: string };
  regulator?: { id: number; name: string };
  created_at: string;
  has_applied?: boolean;
}

export default function FreelancerRecruitmentPage() {
  const qc = useQueryClient();

  const { data: res, isLoading } = useQuery({
    queryKey: ["platform-jobs"],
    queryFn: () =>
      get<{ data: PlatformJob[] }>("/platform-jobs").then((r) => r.data),
  });

  const apply = useMutation({
    mutationFn: (jobId: number) => post(`/platform-jobs/${jobId}/apply`, {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["platform-jobs"] });
      toast.success("Application submitted!");
    },
    onError: () =>
      toast.error("Failed to apply. You may have already applied."),
  });

  const jobs: PlatformJob[] = (res as unknown as PlatformJob[]) ?? [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        Platform Job Listings
      </h1>
      <p className="text-sm text-gray-500">
        Browse open recruitment postings from regulators across the platform.
      </p>

      {isLoading && (
        <p className="text-sm text-gray-400 text-center py-12">Loading jobs…</p>
      )}

      {!isLoading && jobs.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-gray-400 text-sm">
            No open job postings at the moment. Check back later.
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.map((job) => (
          <Card key={job.id}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Briefcase className="h-4 w-4 text-blue-500" />
                {job.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-3">
                {job.description}
              </p>
              <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                {job.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {job.location}
                  </span>
                )}
                {job.deadline && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Deadline:{" "}
                    {formatDate(job.deadline)}
                  </span>
                )}
                {job.school && <span>School: {job.school.name}</span>}
                {job.regulator && <span>Posted by: {job.regulator.name}</span>}
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-gray-400">
                  {formatDate(job.created_at)}
                </span>
                {job.has_applied ? (
                  <Badge variant="green" size="sm">
                    Applied
                  </Badge>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => apply.mutate(job.id)}
                    disabled={apply.isPending}
                  >
                    Apply
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
