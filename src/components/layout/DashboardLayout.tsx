"use client";
import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useAuthStore } from "@/store/authStore";
import { getMe, getToken } from "@/lib/auth";

const IDLE_TIMEOUT_MS = 1000 * 60 * 60;
const LAST_ACTIVITY_KEY = "awajimaa:last-activity";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function DashboardLayout({
  children,
  title,
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated, clearAuth, setAuth } =
    useAuthStore();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isRestoringSession, setIsRestoringSession] = useState(false);
  const restorationAttempted = useRef(false);

  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!hasHydrated) return;

    const token = getToken();

    // No token — send to login
    if (!token) {
      router.replace("/login");
      return;
    }

    // Fully authenticated — nothing to do
    if (isAuthenticated && user) return;

    // Has token but store is missing user — restore once
    if (!restorationAttempted.current) {
      restorationAttempted.current = true;
      setIsRestoringSession(true);

      getMe()
        .then((restoredUser) => {
          setAuth(token, restoredUser);
        })
        .catch(() => {
          // Don't clearAuth() — just redirect, let login page handle state
          router.replace("/login");
        })
        .finally(() => {
          setIsRestoringSession(false);
        });
    }
  }, [hasHydrated, isAuthenticated, user, setAuth, router]);

  // Idle timeout
  useEffect(() => {
    if (!hasHydrated || !isAuthenticated || isRestoringSession) return;

    const touchActivity = () => {
      localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
    };

    const hasExpired = () => {
      const raw = localStorage.getItem(LAST_ACTIVITY_KEY);
      if (!raw) return false;
      return Date.now() - Number(raw) > IDLE_TIMEOUT_MS;
    };

    if (hasExpired()) {
      clearAuth();
      router.replace("/login");
      return;
    }

    touchActivity();

    const events: Array<keyof WindowEventMap> = [
      "click",
      "keydown",
      "mousemove",
      "scroll",
      "touchstart",
    ];
    events.forEach((e) =>
      window.addEventListener(e, touchActivity, { passive: true }),
    );

    const intervalId = window.setInterval(() => {
      if (hasExpired()) {
        clearAuth();
        router.replace("/login");
      }
    }, 60_000);

    return () => {
      window.clearInterval(intervalId);
      events.forEach((e) => window.removeEventListener(e, touchActivity));
    };
  }, [clearAuth, hasHydrated, isAuthenticated, isRestoringSession, router]);

  if (!hasHydrated || isRestoringSession) return null;
  if (!isAuthenticated || !user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Topbar title={title} onMenuClick={() => setMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
