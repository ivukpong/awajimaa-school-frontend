"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import {
  PlayCircle,
  Clock,
  Users,
  Award,
  BookOpen,
  ChevronRight,
} from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://awajimaa-school-backend-main-cbnbuh.laravel.cloud/api";

interface ElearningProgram {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  thumbnail: string | null;
  amount: number;
  currency: string;
  is_free: boolean;
  duration_days: number | null;
  enrollments_count?: number;
  modules_count?: number;
  instructor?: { name: string; avatar: string | null };
}

function usePublicPrograms() {
  return useQuery<ElearningProgram[]>({
    queryKey: ["public-elearning-programs"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/public/elearning/programs`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      return json.data ?? json;
    },
    retry: 1,
  });
}

const FMT = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

export default function ElearningPage() {
  const { data: programs, isLoading, isError } = usePublicPrograms();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Nav */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/">
            <Logo height={32} />
          </Link>
          <Link href="/login">
            <Button size="sm">Sign In to Enroll</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-brand-navy text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1 text-sm mb-4">
            <PlayCircle size={14} />
            E-Learning Platform
          </div>
          <h1 className="text-4xl font-extrabold mb-3">
            Learn at Your Own Pace
          </h1>
          <p className="text-gray-300 text-lg">
            Explore video-based courses, earn certificates, and upskill with
            programs designed for the African classroom.
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Available Programs
        </h2>

        {isLoading && (
          <div className="text-center py-20 text-gray-500">
            Loading programs...
          </div>
        )}

        {isError && (
          <div className="text-center py-20 text-gray-500">
            Unable to load programs. Please try again later.
          </div>
        )}

        {!isLoading && !isError && (!programs || programs.length === 0) && (
          <div className="text-center py-20">
            <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No programs published yet
            </h3>
            <p className="text-gray-500">
              Check back soon — new programs are being added regularly.
            </p>
          </div>
        )}

        {programs && programs.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col"
              >
                {p.thumbnail ? (
                  <img
                    src={p.thumbnail}
                    alt={p.name}
                    className="h-40 w-full object-cover"
                  />
                ) : (
                  <div className="h-40 bg-brand-navy/10 flex items-center justify-center">
                    <PlayCircle size={40} className="text-brand-navy/30" />
                  </div>
                )}
                <div className="p-5 flex flex-col gap-2 flex-1">
                  <h3 className="font-semibold text-gray-900 line-clamp-2">
                    {p.name}
                  </h3>
                  {p.instructor && (
                    <p className="text-xs text-gray-500">
                      by {p.instructor.name}
                    </p>
                  )}
                  {p.description && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {p.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-auto pt-3 border-t border-gray-50">
                    {p.duration_days && (
                      <span className="flex items-center gap-1">
                        <Clock size={11} /> {p.duration_days}d access
                      </span>
                    )}
                    {(p.enrollments_count ?? 0) > 0 && (
                      <span className="flex items-center gap-1">
                        <Users size={11} /> {p.enrollments_count} enrolled
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className={`font-semibold ${p.is_free ? "text-green-600" : "text-brand-navy"}`}
                    >
                      {p.is_free ? "Free" : FMT.format(p.amount)}
                    </span>
                    <Link href="/login">
                      <Button size="sm">Enroll</Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* CTA */}
      <section className="bg-brand-navy text-white py-12 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <Award size={36} className="mx-auto mb-3 text-brand-gold" />
          <h2 className="text-2xl font-bold mb-2">
            Earn Recognised Certificates
          </h2>
          <p className="text-gray-300 mb-6">
            Complete a program and receive a verifiable digital certificate.
          </p>
          <Link href="/login">
            <Button className="bg-brand-gold hover:bg-brand-gold/90 text-brand-navy font-semibold">
              Get Started <ChevronRight size={16} className="inline" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
