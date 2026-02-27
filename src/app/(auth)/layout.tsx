import React from "react";
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-[#1B4F72] p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white font-bold text-lg">
            A
          </div>
          <span className="text-xl font-bold">Awajimaa School</span>
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
        <div className="mb-8 flex items-center gap-2.5 lg:hidden">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1B4F72] text-white font-bold text-lg">
            A
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">
              Awajimaa School
            </p>
            <p className="text-xs text-gray-500">Unified School Management</p>
          </div>
        </div>

        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
