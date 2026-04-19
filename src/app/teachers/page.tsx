"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { User, MapPin, BookOpen, Star, ChevronRight } from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://awajimaa-school-backend-main-cbnbuh.laravel.cloud/api";

interface FreelancerProfile {
  id: number;
  user: {
    id: number;
    name: string;
    avatar: string | null;
  };
  subjects: string[];
  bio: string | null;
  state: string | null;
  rating_avg: number | null;
  hourly_rate: number | null;
  is_available: boolean;
}

function usePublicTeachers() {
  return useQuery<FreelancerProfile[]>({
    queryKey: ["public-teachers"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/freelancers`);
      if (!res.ok) throw new Error("Failed to fetch teachers");
      const json = await res.json();
      return json.data ?? json;
    },
    retry: 1,
  });
}

export default function TeachersPage() {
  const { data: teachers, isLoading, isError } = usePublicTeachers();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Nav */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/">
            <Logo height={32} />
          </Link>
          <Link href="/register?role=freelancer_teacher">
            <Button size="sm">Join as a Teacher</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-brand-navy text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1 text-sm mb-4">
            <User size={14} />
            Teachers Directory
          </div>
          <h1 className="text-4xl font-extrabold mb-3">
            Browse Qualified Teachers
          </h1>
          <p className="text-gray-300 text-lg">
            Find experienced educators across Nigeria available for school
            postings, tutoring, and remote teaching engagements.
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        {isLoading && (
          <div className="text-center py-20 text-gray-500">
            Loading teachers...
          </div>
        )}

        {isError && (
          <div className="text-center py-20 text-gray-500">
            Unable to load teachers right now. Please try again later.
          </div>
        )}

        {!isLoading && !isError && (!teachers || teachers.length === 0) && (
          <div className="text-center py-20">
            <User size={48} className="mx-auto mb-4 text-gray-300" />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              No teachers listed yet
            </h2>
            <p className="text-gray-500 mb-6">
              Be among the first educators to join our growing directory.
            </p>
            <Link href="/register?role=freelancer_teacher">
              <Button>Register as a Teacher</Button>
            </Link>
          </div>
        )}

        {teachers && teachers.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {teachers.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-3"
              >
                <div className="flex items-center gap-3">
                  {t.user.avatar ? (
                    <img
                      src={t.user.avatar}
                      alt={t.user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-brand-navy/10 flex items-center justify-center text-brand-navy font-bold text-lg">
                      {t.user.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{t.user.name}</p>
                    {t.state && (
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin size={11} /> {t.state}
                      </p>
                    )}
                  </div>
                </div>

                {t.subjects && t.subjects.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {t.subjects.slice(0, 4).map((s) => (
                      <span
                        key={s}
                        className="text-xs bg-blue-50 text-blue-700 rounded-full px-2 py-0.5"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}

                {t.bio && (
                  <p className="text-sm text-gray-600 line-clamp-2">{t.bio}</p>
                )}

                <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                  {t.rating_avg ? (
                    <span className="flex items-center gap-1 text-xs text-yellow-600">
                      <Star size={12} fill="currentColor" />
                      {t.rating_avg.toFixed(1)}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">New</span>
                  )}
                  <span
                    className={`text-xs font-medium ${t.is_available ? "text-green-600" : "text-gray-400"}`}
                  >
                    {t.is_available ? "Available" : "Not available"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* CTA */}
      <section className="bg-brand-navy text-white py-12 px-4 text-center">
        <h2 className="text-2xl font-bold mb-2">
          Are you a qualified teacher?
        </h2>
        <p className="text-gray-300 mb-6">
          Join thousands of educators connecting with schools on Awajimaa.
        </p>
        <Link href="/register?role=freelancer_teacher">
          <Button
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-brand-navy"
          >
            Register as a Teacher <ChevronRight size={16} />
          </Button>
        </Link>
      </section>
    </div>
  );
}
