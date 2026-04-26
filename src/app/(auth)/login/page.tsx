"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Lock, User as UserIcon } from "lucide-react";
import Cookies from "js-cookie";
import { useAuthStore } from "@/store/authStore";
import { getDashboardPathForRole } from "@/lib/routeAccess";
import { getMe, getToken, login as apiLogin } from "@/lib/auth";
import type { User } from "@/types";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

// ── Form schema ──────────────────────────────────────────────────────────────

const schema = z.object({
  identifier: z.string().min(1, "Please enter your email or matric number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type FormData = z.infer<typeof schema>;

// ── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();
  const { setAuth, clearAuth, isAuthenticated, user, hasHydrated } =
    useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isRestoringSession, setIsRestoringSession] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const getNextPath = useCallback(() => {
    if (typeof window === "undefined") return null;

    const nextPath = new URLSearchParams(window.location.search).get("next");
    if (
      !nextPath ||
      !nextPath.startsWith("/") ||
      nextPath.startsWith("//") ||
      nextPath === "/login" ||
      nextPath.startsWith("/login?") ||
      nextPath === "/register" ||
      nextPath.startsWith("/register?") ||
      nextPath === "/forgot-password" ||
      nextPath.startsWith("/forgot-password?") ||
      nextPath === "/reset-password" ||
      nextPath.startsWith("/reset-password?")
    ) {
      return null;
    }

    return nextPath;
  }, []);

  const navigateToPath = useCallback(
    (path: string) => {
      router.replace(path);
    },
    [router],
  );

  // Only runs once on hydration — handles:
  // 1. Already fully authenticated (e.g. user navigated back to /login)
  // 2. Token exists but user missing — restore session from API
  useEffect(() => {
    if (!hasHydrated) return;

    const token = getToken();

    // Case 1: Fully authenticated, redirect away from login
    if (isAuthenticated && user?.role) {
      const nextPath = getNextPath();
      navigateToPath(nextPath || getDashboardPathForRole(user.role));
      return;
    }

    // Case 2: Authenticated flag set but user object missing — restore from API
    if (isAuthenticated && !user && token) {
      setIsRestoringSession(true);
      getMe()
        .then((restoredUser) => {
          setAuth(token, restoredUser);
          const nextPath = getNextPath();
          navigateToPath(
            nextPath || getDashboardPathForRole(restoredUser.role),
          );
        })
        .catch(() => {
          clearAuth();
        })
        .finally(() => {
          setIsRestoringSession(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasHydrated]); // Intentionally only fires on hydration

  const finalizeLogin = useCallback(
    (token: string, user: User | undefined | null) => {
      if (!user) {
        toast.error("Login failed: user information missing.");
        return;
      }

      // Cookie is already set in auth.ts login()
      // localStorage token is already set in auth.ts login()
      setAuth(token, user);

      const nextPath = getNextPath();
      const path = nextPath || getDashboardPathForRole(user.role);

      toast.success("Welcome back!");
      setTimeout(() => navigateToPath(path), 0);
    },
    [getNextPath, navigateToPath, setAuth],
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
          {isRestoringSession ? "Restoring session..." : "Sign In"}
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
