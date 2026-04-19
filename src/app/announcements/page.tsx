"use client";

import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { Bell, Lock, Users, School, BookOpen } from "lucide-react";

export default function AnnouncementsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Nav */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/">
            <Logo height={32} />
          </Link>
          <Link href="/login">
            <Button size="sm" variant="outline">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-brand-navy text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1 text-sm mb-4">
            <Bell size={14} />
            Announcements
          </div>
          <h1 className="text-4xl font-extrabold mb-3">Stay Informed</h1>
          <p className="text-gray-300 text-lg">
            Announcements from schools, ministries, and the Awajimaa platform
            keep parents, students, and staff in the loop.
          </p>
        </div>
      </section>

      {/* Access gate */}
      <main className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-brand-navy/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <Lock size={28} className="text-brand-navy" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Sign in to view announcements
          </h2>
          <p className="text-gray-500 mb-6">
            Announcements are visible to members of your school or institution.
            Sign in to see what&apos;s relevant to you.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login">
              <Button className="w-full sm:w-auto">Sign In</Button>
            </Link>
            <Link href="/register?role=parent">
              <Button variant="outline" className="w-full sm:w-auto">
                Register as Parent
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Features strip */}
      <section className="bg-white border-t border-gray-100 py-12 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          {[
            {
              icon: Bell,
              title: "Real-Time Alerts",
              desc: "Get notified instantly when your school posts an important update.",
            },
            {
              icon: Users,
              title: "Role-Targeted",
              desc: "Announcements are delivered to the right audience — parents, teachers, or all staff.",
            },
            {
              icon: School,
              title: "School & Ministry Updates",
              desc: "Hear from both your school and the Ministry of Education on a single feed.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center gap-2">
              <Icon size={28} className="text-brand-gold" />
              <p className="font-semibold text-gray-900">{title}</p>
              <p className="text-sm text-gray-500">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
