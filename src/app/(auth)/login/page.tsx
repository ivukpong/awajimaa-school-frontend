"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Mail, Lock } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { roleDashboardPath } from "@/lib/auth";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormData) {
    try {
      const loggedInUser = await login(data);
      const path = roleDashboardPath[loggedInUser?.role ?? "student"] ?? "/";
      router.push(path);
      toast.success("Welcome back!");
    } catch {
      toast.error("Invalid credentials. Please try again.");
    }
  }

  return (
    <Card>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Welcome back
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Sign in to your Awajimaa account
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email Address"
          type="email"
          placeholder="you@school.edu.ng"
          leftIcon={<Mail className="h-4 w-4" />}
          error={errors.email?.message}
          required
          {...register("email")}
        />
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          leftIcon={<Lock className="h-4 w-4" />}
          error={errors.password?.message}
          required
          {...register("password")}
        />
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" className="rounded border-gray-300" />
            <span className="text-gray-600 dark:text-gray-400">
              Remember me
            </span>
          </label>
          <Link
            href="/forgot-password"
            className="text-brand font-medium hover:underline"
          >
            Forgot password?
          </Link>
        </div>
        <Button type="submit" className="w-full" size="lg" loading={isLoading}>
          Sign In
        </Button>
        <p className="text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-brand hover:underline"
          >
            Create one
          </Link>
        </p>
      </form>
    </Card>
  );
}
