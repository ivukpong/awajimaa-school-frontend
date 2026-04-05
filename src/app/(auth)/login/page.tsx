"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Mail, Lock, ArrowLeft, User as UserIcon } from "lucide-react";
import Cookies from "js-cookie";
import { useAuthStore } from "@/store/authStore";
import {
  roleDashboardPath,
  login as apiLogin,
  checkDevice,
  verifyDeviceOtp,
  pinLogin as apiPinLogin,
  getDeviceId,
  OtpRequiredError,
} from "@/lib/auth";
import type { User } from "@/types";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { PinInput } from "@/components/ui/PinInput";

// ── Form schema ───────────────────────────────────────────────────────────────

const schema = z.object({
  identifier: z.string().min(1, "Please enter your email or matric number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
type FormData = z.infer<typeof schema>;

type Screen = "password" | "otp" | "pin";

// ── Page ──────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [screen, setScreen] = useState<Screen>("password");
  const [isLoading, setIsLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [deviceId, setDeviceId] = useState("");
  const [trustedUser, setTrustedUser] = useState<{
    name: string;
    avatar?: string;
  } | null>(null);
  const [pin, setPin] = useState("");
  const [otp, setOtp] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  // On mount: load device ID and check if this is a trusted device
  // DEVICE VERIFICATION TEMPORARILY DISABLED
  useEffect(() => {
    const id = getDeviceId();
    setDeviceId(id);

    const storedEmail = localStorage.getItem("awajimaa_last_email");
    if (!storedEmail || !id) return;
    setValue("identifier", storedEmail);
    setPendingEmail(storedEmail);

    // checkDevice(storedEmail, id)
    //   .then((result) => {
    //     if (result.trusted && result.pin_set && result.user) {
    //       setTrustedUser(result.user);
    //       setScreen("pin");
    //     }
    //   })
    //   .catch(() => {
    //     /* silently ignore — show password form */
    //   });
  }, [setValue]);

  // After any successful auth, persist session and redirect
  const finalizeLogin = useCallback(
    (token: string, user: User | undefined | null) => {
      Cookies.set("auth_token", token, {
        expires: 7,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });
      if (user && user.email) {
        setAuth(token, user);
        localStorage.setItem("awajimaa_last_email", user.email);
        const path = roleDashboardPath[user.role ?? "student"] ?? "/";
        router.push(path);
        toast.success("Welcome back!");
      } else {
        toast.error("Login failed: user information missing.");
      }
    },
    [router, setAuth],
  );

  // ── Password form submit ──────────────────────────────────────────────────

  async function onPasswordSubmit(data: FormData) {
    setIsLoading(true);
    try {
      const result = await apiLogin(data);
      console.log(result.token);
      finalizeLogin(result.token, result.user);
    } catch (err) {
      // DEVICE VERIFICATION TEMPORARILY DISABLED
      // if (err instanceof OtpRequiredError) {
      //   setPendingEmail(data.identifier);
      //   setScreen("otp");
      //   setOtp("");
      //   toast.success("Verification code sent to your email.");
      // } else {
      toast.error(
        (err as Error).message || "Invalid credentials. Please try again.",
      );
      // }
    } finally {
      setIsLoading(false);
    }
  }

  // ── OTP submit ────────────────────────────────────────────────────────────

  async function onOtpSubmit() {
    if (otp.length !== 6) return;
    setIsLoading(true);
    try {
      const result = await verifyDeviceOtp(pendingEmail, deviceId, otp);
      finalizeLogin(result.token, result.user);
    } catch (err) {
      toast.error((err as Error).message || "Invalid verification code.");
    } finally {
      setIsLoading(false);
    }
  }

  // ── PIN submit ────────────────────────────────────────────────────────────

  async function onPinSubmit() {
    if (pin.length !== 6) return;
    setIsLoading(true);
    try {
      const result = await apiPinLogin(deviceId, pin);
      finalizeLogin(result.token, result.user);
    } catch (err) {
      setPin("");
      toast.error((err as Error).message || "Incorrect PIN.");
    } finally {
      setIsLoading(false);
    }
  }

  // Auto-submit when all digits entered
  // DEVICE VERIFICATION TEMPORARILY DISABLED
  // useEffect(() => {
  //   if (screen === "pin" && pin.length === 6) onPinSubmit();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [pin]);

  // useEffect(() => {
  //   if (screen === "otp" && otp.length === 6) onOtpSubmit();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [otp]);

  // ── PIN screen ────────────────────────────────────────────────────────────

  // DEVICE VERIFICATION TEMPORARILY DISABLED
  // if (screen === "pin") { ... }

  // ── OTP screen ────────────────────────────────────────────────────────────

  // DEVICE VERIFICATION TEMPORARILY DISABLED
  // if (screen === "otp") { ... }

  // ── Password screen (default) ─────────────────────────────────────────────

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
      <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4">
        <Input
          label="Email or Matric Number"
          type="text"
          placeholder="email@school.ng or MAT/2024/001"
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
