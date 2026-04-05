"use client";
import React, { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Lock, User as UserIcon } from "lucide-react";
import Cookies from "js-cookie";
import { useAuthStore } from "@/store/authStore";
import { roleDashboardPath, login as apiLogin } from "@/lib/auth";
import type { User } from "@/types";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

// ── Form schema ─────────────────────────────────────────────────────────────────

const schema = z.object({
  identifier: z.string().min(1, "Please enter your email or matric number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type FormData = z.infer<typeof schema>;

// ── Page ───────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const finalizeLogin = useCallback(
    (token: string, user: User | undefined | null) => {
      Cookies.set("auth_token", token, {
        expires: 7,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });
      if (user && user.email) {
        setAuth(token, user);
        const path = roleDashboardPath[user.role ?? "student"] ?? "/";
        router.push(path);
        toast.success("Welcome back!");
      } else {
        toast.error("Login failed: user information missing.");
      }
    },
    [router, setAuth],
  );

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    try {
      const result = await apiLogin(data);
      finalizeLogin(result.token, result.user);
    } catch (err) {
      toast.error(
        (err as Error).message || "Invalid credentials. Please try again.",
      );
    } finally {
      setIsLoading(false);
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
          label="Email or Matric Number"
          type="text"
          placeholder="email@school.com or MAT/2024/001"
          leftIcon={<UserIcon className="h-4 w-4" />}
          error={errors.identifier?.message}
          required
          {...register("identifier")}
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
