"use client";
import React from "react";
import { useParams } from "next/navigation";
import { usePublicFreelancerProfile } from "@/hooks/useFreelancer";
import PublicProfile from "./PublicProfile";

export default function PublicFreelancerProfilePage() {
  const params = useParams();
  const userId = Number(params.userId);
  const { data, isLoading, error } = usePublicFreelancerProfile(userId);
  const profile = data?.data;

  if (isLoading)
    return <div className="py-12 text-center text-gray-400">Loading…</div>;
  if (error || !profile)
    return (
      <div className="py-12 text-center text-red-500">Profile not found.</div>
    );

  return <PublicProfile profile={profile} />;
}
