"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { post } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import { Eye, EyeOff, User, Mail, Phone, Briefcase, Lock } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const ROLES = [
  { value: "school_admin", label: "School Administrator" },
  { value: "teacher", label: "Teacher" },
  { value: "parent", label: "Parent / Guardian" },
  { value: "sponsor", label: "Sponsor" },
  { value: "revenue_collector", label: "Revenue Collector" },
];

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    password: "",
    password_confirmation: "",
  });

  const registerMutation = useMutation({
    mutationFn: (payload: typeof form) =>
      post<{ token: string; user: any }>("/auth/register", payload),
    onSuccess: (data) => {
      setAuth(data.token, data.user);
      toast.success("Account created!");
      router.replace(`/${data.user.role?.replaceAll("_", "-") ?? "dashboard"}`);
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? "Registration failed"),
  });

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <Card>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create an account
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Join Awajimaa School Management
        </p>
      </div>

      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          registerMutation.mutate(form);
        }}
      >
        <Input
          label="Full Name"
          type="text"
          value={form.name}
          onChange={set("name")}
          placeholder="John Doe"
          leftIcon={<User className="h-4 w-4" />}
          required
        />

        <Input
          label="Email Address"
          type="email"
          value={form.email}
          onChange={set("email")}
          placeholder="john@example.com"
          leftIcon={<Mail className="h-4 w-4" />}
          required
        />

        <Input
          label="Phone Number"
          type="tel"
          value={form.phone}
          onChange={set("phone")}
          placeholder="+234 800 000 0000"
          leftIcon={<Phone className="h-4 w-4" />}
        />

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Role <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
              <Briefcase className="h-4 w-4" />
            </div>
            <select
              required
              value={form.role}
              onChange={set("role")}
              className="block w-full rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Select your role</option>
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Input
          label="Password"
          type={show ? "text" : "password"}
          value={form.password}
          onChange={set("password")}
          placeholder="Min. 8 characters"
          leftIcon={<Lock className="h-4 w-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="text-gray-400 hover:text-gray-600"
            >
              {show ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          }
          required
        />

        <Input
          label="Confirm Password"
          type={show ? "text" : "password"}
          value={form.password_confirmation}
          onChange={set("password_confirmation")}
          placeholder="Re-enter password"
          leftIcon={<Lock className="h-4 w-4" />}
          required
        />

        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={registerMutation.isPending}
        >
          Create Account
        </Button>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-brand hover:underline"
          >
            Sign in
          </Link>
        </p>
      </form>
    </Card>
  );
}

const ROLES = [
  { value: "school_admin", label: "School Administrator" },
  { value: "teacher", label: "Teacher" },
  { value: "parent", label: "Parent / Guardian" },
  { value: "sponsor", label: "Sponsor" },
  { value: "revenue_collector", label: "Revenue Collector" },
];
