"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Shield, CheckCircle, Clock, Users, ChevronRight } from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://awajimaa-school-backend-main-cbnbuh.laravel.cloud/api";

interface InsuranceScheme {
  id: number;
  name: string;
  description?: string;
  premium: number;
  subscription_type: "one_time" | "recurring";
  duration_months?: number;
  coverage_type: "school" | "student" | "both";
  benefits?: string[];
  provider?: string;
  is_active: boolean;
}

const FMT = new Intl.NumberFormat("en-NG", {
  style: "currency",
  currency: "NGN",
  maximumFractionDigits: 0,
});

function useSchemes() {
  return useQuery<InsuranceScheme[]>({
    queryKey: ["public-insurance-schemes"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/insurance/schemes`);
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      return json.data ?? json;
    },
    retry: 1,
  });
}

const COVERAGE_LABEL: Record<string, string> = {
  school: "School",
  student: "Student",
  both: "School & Student",
};

export default function SchoolsInsurancePage() {
  const { data: schemes, isLoading, isError } = useSchemes();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Nav */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/">
            <Logo height={32} />
          </Link>
          <Link href="/login">
            <Button size="sm">Get a Policy</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-brand-navy text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1 text-sm mb-4">
            <Shield size={14} />
            Schools Insurance
          </div>
          <h1 className="text-4xl font-extrabold mb-3">
            Protect Your School &amp; Students
          </h1>
          <p className="text-gray-300 text-lg">
            Browse insurance schemes designed for Nigerian schools — cover your
            institution, staff, and students in a few clicks.
          </p>
        </div>
      </section>

      {/* Schemes */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Available Insurance Schemes
        </h2>

        {isLoading && (
          <div className="text-center py-20 text-gray-500">
            Loading schemes...
          </div>
        )}

        {isError && (
          <div className="text-center py-20 text-gray-500">
            Unable to load schemes right now. Please try again later.
          </div>
        )}

        {!isLoading && !isError && (!schemes || schemes.length === 0) && (
          <div className="text-center py-20">
            <Shield size={48} className="mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No schemes available yet
            </h3>
            <p className="text-gray-500">
              New insurance schemes will be listed here as they are published.
            </p>
          </div>
        )}

        {schemes && schemes.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {schemes.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col gap-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 bg-brand-navy/10 rounded-lg flex items-center justify-center">
                    <Shield size={18} className="text-brand-navy" />
                  </div>
                  <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full font-medium">
                    {COVERAGE_LABEL[s.coverage_type] ?? s.coverage_type}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 text-lg">
                  {s.name}
                </h3>
                {s.description && (
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {s.description}
                  </p>
                )}
                {s.benefits && s.benefits.length > 0 && (
                  <ul className="space-y-1">
                    {s.benefits.slice(0, 3).map((b, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-gray-600"
                      >
                        <CheckCircle
                          size={14}
                          className="text-green-500 mt-0.5 flex-shrink-0"
                        />
                        {b}
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-auto pt-3 border-t border-gray-50">
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {s.subscription_type === "one_time"
                      ? "One-time"
                      : `${s.duration_months ?? "?"} mo`}
                  </span>
                  {s.provider && (
                    <span className="flex items-center gap-1">
                      <Users size={11} /> {s.provider}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-bold text-brand-navy text-lg">
                    {FMT.format(s.premium)}
                  </p>
                  <Link href="/login">
                    <Button size="sm">Get Policy</Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* CTA */}
      <section className="bg-brand-navy text-white py-12 px-4 text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">Is your school covered?</h2>
          <p className="text-gray-300 mb-6">
            Sign in or register your school to subscribe to a scheme and protect
            your entire institution.
          </p>
          <Link href="/register?role=school_admin">
            <Button className="bg-brand-gold hover:bg-brand-gold/90 text-brand-navy font-semibold">
              Register a School <ChevronRight size={16} className="inline" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
