"use client";

import React, { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Mail, ArrowLeft } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { post } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const mutation = useMutation({
    mutationFn: (payload: { email: string }) =>
      post("/auth/forgot-password", payload),
    onSuccess: () => {
      setSent(true);
    },
    onError: (err: any) =>
      toast.error(
        err?.response?.data?.message ??
          "Something went wrong. Please try again.",
      ),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    mutation.mutate({ email });
  };

  if (sent) {
    return (
      <Card>
        <div className="flex flex-col items-center gap-4 py-4 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/10">
            <Mail className="h-7 w-7 text-brand" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Check your inbox
            </h2>
            <p className="mt-2 text-sm text-gray-500 leading-relaxed">
              If an account exists for{" "}
              <span className="font-medium text-gray-700 dark:text-gray-300">
                {email}
              </span>
              , a password reset link has been sent. Check your spam folder if
              you don&apos;t see it within a few minutes.
            </p>
          </div>
          <Link
            href="/login"
            className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Forgot your password?
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@school.edu.ng"
          leftIcon={<Mail className="h-4 w-4" />}
          required
          autoFocus
        />

        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={mutation.isPending}
        >
          Send reset link
        </Button>

        <p className="text-center text-sm text-gray-500">
          Remembered it?{" "}
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
