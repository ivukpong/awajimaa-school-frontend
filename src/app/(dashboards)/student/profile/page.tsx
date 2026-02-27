"use client";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAuthStore } from "@/store/authStore";

export default function StudentProfilePage() {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery({
    queryKey: ["me"],
    queryFn: () => get<any>("/auth/me"),
  });
  const me = data ?? user;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
        My Profile
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Profile card */}
        <Card className="md:col-span-1 flex flex-col items-center text-center py-8">
          <div className="w-24 h-24 rounded-full bg-brand flex items-center justify-center text-white text-3xl font-bold mb-4">
            {me?.name?.charAt(0) ?? "S"}
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {me?.name ?? "—"}
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">{me?.email}</p>
          <div className="mt-3">
            <Badge variant="blue">Student</Badge>
          </div>
          {isLoading && <p className="text-sm text-gray-400 mt-4">Loading…</p>}
        </Card>

        {/* Details */}
        <Card className="md:col-span-2">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
              Personal Information
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: User, label: "Full Name", value: me?.name },
                { icon: Mail, label: "Email", value: me?.email },
                { icon: Phone, label: "Phone", value: me?.phone ?? "—" },
                {
                  icon: GraduationCap,
                  label: "Role",
                  value: me?.role?.replace(/_/g, " "),
                },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-brand" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wide">
                      {label}
                    </p>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mt-0.5">
                      {value ?? "—"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
