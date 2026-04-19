"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import {
  School,
  MapPin,
  GraduationCap,
  Users,
  ChevronRight,
} from "lucide-react";

const HIGHLIGHTS = [
  {
    icon: School,
    title: "Accredited Institutions",
    desc: "All schools on the platform have been verified and accredited through our onboarding process.",
  },
  {
    icon: GraduationCap,
    title: "Multi-Level Education",
    desc: "Browse nursery, primary, secondary, and tertiary institutions across Nigeria.",
  },
  {
    icon: Users,
    title: "Community-Driven",
    desc: "Parents, teachers, and schools all connect on a single platform.",
  },
  {
    icon: MapPin,
    title: "Find Schools Near You",
    desc: "Filter by state, city, or education level to find the right school.",
  },
];

export default function SchoolsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Nav */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/">
            <Logo height={32} />
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/admissions">
              <Button size="sm" variant="outline">
                Schools Admitting
              </Button>
            </Link>
            <Link href="/register?role=school_admin">
              <Button size="sm">Register a School</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-brand-navy text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1 text-sm mb-4">
            <School size={14} />
            Schools Directory
          </div>
          <h1 className="text-4xl font-extrabold mb-3">Schools on Awajimaa</h1>
          <p className="text-gray-300 text-lg">
            Discover verified schools across Nigeria — browse, compare, and
            connect with the right institution for your child.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/admissions">
              <Button className="bg-brand-gold hover:bg-brand-gold/90 text-brand-navy font-semibold w-full sm:w-auto">
                View Schools Currently Admitting
              </Button>
            </Link>
            <Link href="/register?role=school_admin">
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white hover:text-brand-navy w-full sm:w-auto"
              >
                Register Your School
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature highlights */}
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
          Why join the Awajimaa Schools Network?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {HIGHLIGHTS.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex gap-4"
            >
              <div className="w-10 h-10 bg-brand-navy/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <Icon size={20} className="text-brand-navy" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 mb-1">{title}</p>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* CTA */}
      <section className="bg-brand-navy text-white py-12 px-4 text-center">
        <h2 className="text-2xl font-bold mb-2">Is your school on Awajimaa?</h2>
        <p className="text-gray-300 mb-6">
          Register now and connect with parents, teachers, and regulators.
        </p>
        <Link href="/register?role=school_admin">
          <Button className="bg-brand-gold hover:bg-brand-gold/90 text-brand-navy font-semibold">
            Register a School <ChevronRight size={16} className="inline" />
          </Button>
        </Link>
      </section>
    </div>
  );
}
