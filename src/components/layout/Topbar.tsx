"use client";
import React from "react";
import { Bell, Sun, Moon, Search, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/store/authStore";
import { getInitials } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useUnreadCount } from "@/hooks/useNotifications";

interface TopbarProps {
  title?: string;
  onMenuClick?: () => void;
}

export function Topbar({ title, onMenuClick }: TopbarProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const { user, hasHydrated } = useAuthStore();
  const { data: unreadData } = useUnreadCount();
  const unreadCount = unreadData?.count ?? 0;

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6 dark:border-gray-800 dark:bg-gray-900 shadow-sm">
      {/* Left: hamburger (mobile) + Title / Search */}
      <div className="flex items-center gap-3">
        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuClick}
          className="lg:hidden rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        {title && (
          <h1 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white truncate max-w-[160px] sm:max-w-none">
            {title}
          </h1>
        )}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search..."
            className={cn(
              "h-9 w-64 rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm",
              "focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent",
              "dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-500",
            )}
          />
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-1">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
        >
          {resolvedTheme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>

        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </button>

        {/* Divider */}
        <div className="mx-2 h-6 w-px bg-gray-200 dark:bg-gray-700" />

        {/* Avatar */}
        <div className="flex items-center gap-2.5 cursor-pointer rounded-lg px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1B4F72] text-xs font-semibold text-white shrink-0">
            {hasHydrated && user ? getInitials(user.name) : "?"}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-gray-900 dark:text-white leading-none">
              {hasHydrated ? (user?.name ?? "Guest") : "Loading..."}
            </p>
            <p className="text-xs text-gray-500 capitalize mt-0.5">
              {hasHydrated ? user?.role?.replace(/_/g, " ") : ""}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
