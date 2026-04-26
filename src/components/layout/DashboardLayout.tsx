"use client";
import React, { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { useAuthStore } from "@/store/authStore";
import { getMe, getToken } from "@/lib/auth";

const IDLE_TIMEOUT_MS = 1000 * 60 * 60; // 60 minutes
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

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    const token = getToken();

    if ((!isAuthenticated || !user) && token) {
      setIsRestoringSession(true);

      getMe()
        .then((user) => {
          setAuth(token, user);
        })
        .catch(() => {
          clearAuth();
          router.replace("/login");
        })
        .finally(() => {
          setIsRestoringSession(false);
        });

      return;
    }

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }
  }, [clearAuth, hasHydrated, isAuthenticated, router, setAuth, user]);

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated || isRestoringSession) {
      return;
    }

    const touchActivity = () => {
      localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
    };

    const hasExpired = () => {
      const lastActivityRaw = localStorage.getItem(LAST_ACTIVITY_KEY);
      if (!lastActivityRaw) {
        return false;
      }
      const lastActivity = Number(lastActivityRaw);
      return Date.now() - lastActivity > IDLE_TIMEOUT_MS;
    };

    if (hasExpired()) {
      clearAuth();
      router.replace("/login");
      return;
    }

    touchActivity();

    const activityEvents: Array<keyof WindowEventMap> = [
      "click",
      "keydown",
      "mousemove",
      "scroll",
      "touchstart",
    ];

    activityEvents.forEach((eventName) => {
      window.addEventListener(eventName, touchActivity, { passive: true });
    });

    const intervalId = window.setInterval(() => {
      if (hasExpired()) {
        clearAuth();
        router.replace("/login");
      }
    }, 60000);

    return () => {
      window.clearInterval(intervalId);
      activityEvents.forEach((eventName) => {
        window.removeEventListener(eventName, touchActivity);
      });
    };
  }, [clearAuth, hasHydrated, isAuthenticated, isRestoringSession, router]);

  if (!hasHydrated || isRestoringSession || !isAuthenticated) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-gray-950">
      {/* Mobile overlay backdrop */}
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
