import React from "react";
import { Logo } from "@/components/ui/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-brand p-12 text-white">
        <div className="flex items-center">
          <Logo height={44} onDark />
        </div>

        <div className="space-y-6">
          <h2 className="text-4xl font-bold leading-tight">
            Unified School
            <br />
            Management System
          </h2>
          <p className="text-white/70 text-lg leading-relaxed">
            One platform for schools, teachers, students, parents, sponsors, and
            regulators.
          </p>
          <p className="text-sm font-medium tracking-widest text-white/50 uppercase">
            Stay Safe, Do More, and Be More
          </p>
          <div className="flex flex-wrap gap-3">
            {[
              "Schools",
              "E-Learning",
              "Fees",
              "Results",
              "Attendance",
              "Messaging",
            ].map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/80 border border-white/20"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <p className="text-sm text-white/40">
          © {new Date().getFullYear()} Awajimaa School. All rights reserved.
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        {/* Mobile logo */}
        <div className="mb-8 lg:hidden">
          <Logo height={40} />
        </div>

        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
