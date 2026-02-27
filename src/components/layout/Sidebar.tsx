"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  School,
  Users,
  BookOpen,
  BarChart3,
  FileText,
  CreditCard,
  MessageSquare,
  Video,
  Settings,
  ChevronLeft,
  ChevronRight,
  Bell,
  Calendar,
  Shield,
  GraduationCap,
  ClipboardList,
  HeartHandshake,
  Banknote,
  MapPin,
  LogOut,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import type { UserRole } from "@/types";

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  children?: NavItem[];
}

const navByRole: Record<UserRole, NavItem[]> = {
  super_admin: [
    {
      label: "Dashboard",
      href: "/super-admin",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      label: "Schools",
      href: "/super-admin/schools",
      icon: <School className="h-4 w-4" />,
    },
    {
      label: "Users",
      href: "/super-admin/users",
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: "Settings",
      href: "/super-admin/settings",
      icon: <Settings className="h-4 w-4" />,
    },
  ],
  regulator: [
    {
      label: "Overview",
      href: "/regulator",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      label: "Schools",
      href: "/regulator/schools",
      icon: <School className="h-4 w-4" />,
    },
    {
      label: "Charges",
      href: "/regulator/charges",
      icon: <CreditCard className="h-4 w-4" />,
    },
    {
      label: "Forms & Verification",
      href: "/regulator/forms",
      icon: <FileText className="h-4 w-4" />,
    },
    {
      label: "Meetings",
      href: "/regulator/meetings",
      icon: <Video className="h-4 w-4" />,
    },
    {
      label: "Messages",
      href: "/regulator/messages",
      icon: <MessageSquare className="h-4 w-4" />,
    },
  ],
  school_admin: [
    {
      label: "Dashboard",
      href: "/school-admin",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      label: "Branches",
      href: "/school-admin/branches",
      icon: <MapPin className="h-4 w-4" />,
    },
    {
      label: "Students",
      href: "/school-admin/students",
      icon: <GraduationCap className="h-4 w-4" />,
    },
    {
      label: "Teachers",
      href: "/school-admin/teachers",
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: "Classes",
      href: "/school-admin/classes",
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      label: "Fees & Payments",
      href: "/school-admin/fees",
      icon: <Banknote className="h-4 w-4" />,
    },
    {
      label: "Examinations",
      href: "/school-admin/exams",
      icon: <ClipboardList className="h-4 w-4" />,
    },
    {
      label: "E-Learning",
      href: "/school-admin/e-learning",
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      label: "Announcements",
      href: "/school-admin/announcements",
      icon: <Bell className="h-4 w-4" />,
    },
    {
      label: "Reports",
      href: "/school-admin/reports",
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      label: "Messages",
      href: "/school-admin/messages",
      icon: <MessageSquare className="h-4 w-4" />,
    },
    {
      label: "Settings",
      href: "/school-admin/settings",
      icon: <Settings className="h-4 w-4" />,
    },
  ],
  branch_admin: [
    {
      label: "Dashboard",
      href: "/school-admin",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      label: "Students",
      href: "/school-admin/students",
      icon: <GraduationCap className="h-4 w-4" />,
    },
    {
      label: "Teachers",
      href: "/school-admin/teachers",
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: "Classes",
      href: "/school-admin/classes",
      icon: <BookOpen className="h-4 w-4" />,
    },
  ],
  teacher: [
    {
      label: "Dashboard",
      href: "/teacher",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      label: "My Classes",
      href: "/teacher/classes",
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      label: "Attendance",
      href: "/teacher/attendance",
      icon: <ClipboardList className="h-4 w-4" />,
    },
    {
      label: "Results",
      href: "/teacher/results",
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      label: "E-Learning",
      href: "/teacher/e-learning",
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      label: "Messages",
      href: "/teacher/messages",
      icon: <MessageSquare className="h-4 w-4" />,
    },
  ],
  student: [
    {
      label: "Dashboard",
      href: "/student",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      label: "My Results",
      href: "/student/results",
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      label: "E-Learning",
      href: "/student/e-learning",
      icon: <BookOpen className="h-4 w-4" />,
    },
    {
      label: "Profile",
      href: "/student/profile",
      icon: <GraduationCap className="h-4 w-4" />,
    },
    {
      label: "Schedule",
      href: "/student/schedule",
      icon: <Calendar className="h-4 w-4" />,
    },
    {
      label: "Messages",
      href: "/student/messages",
      icon: <MessageSquare className="h-4 w-4" />,
    },
  ],
  parent: [
    {
      label: "Dashboard",
      href: "/parent",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      label: "My Children",
      href: "/parent/children",
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: "Pickup Codes",
      href: "/parent/pickup",
      icon: <Shield className="h-4 w-4" />,
    },
    {
      label: "Fees & Payments",
      href: "/parent/fees",
      icon: <CreditCard className="h-4 w-4" />,
    },
    {
      label: "Reports",
      href: "/parent/reports",
      icon: <BarChart3 className="h-4 w-4" />,
    },
    {
      label: "Messages",
      href: "/parent/messages",
      icon: <MessageSquare className="h-4 w-4" />,
    },
    {
      label: "Meetings",
      href: "/parent/meetings",
      icon: <Video className="h-4 w-4" />,
    },
  ],
  sponsor: [
    {
      label: "Dashboard",
      href: "/sponsor",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      label: "My Students",
      href: "/sponsor/students",
      icon: <GraduationCap className="h-4 w-4" />,
    },
    {
      label: "Scholarships",
      href: "/sponsor/scholarships",
      icon: <HeartHandshake className="h-4 w-4" />,
    },
    {
      label: "Payments",
      href: "/sponsor/payments",
      icon: <CreditCard className="h-4 w-4" />,
    },
    {
      label: "Messages",
      href: "/sponsor/messages",
      icon: <MessageSquare className="h-4 w-4" />,
    },
  ],
  revenue_collector: [
    {
      label: "Dashboard",
      href: "/revenue",
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      label: "Payments",
      href: "/revenue/payments",
      icon: <CreditCard className="h-4 w-4" />,
    },
    {
      label: "Reports",
      href: "/revenue/reports",
      icon: <BarChart3 className="h-4 w-4" />,
    },
  ],
};

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const role = (user?.role ?? "student") as UserRole;
  const navItems = navByRole[role] ?? [];

  return (
    <aside
      className={cn(
        "flex flex-col transition-all duration-200 shrink-0",
        "bg-[#1B4F72] text-white",
        collapsed ? "w-16" : "w-64",
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-white/10 px-4",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 font-bold text-white text-sm shrink-0">
              A
            </div>
            <span className="text-sm font-bold text-white leading-tight">
              Awajimaa
              <br />
              <span className="font-normal text-white/70 text-xs">School</span>
            </span>
          </div>
        )}
        {collapsed && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 font-bold text-white text-sm">
            A
          </div>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="mx-auto mt-2 rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}

      {/* User pill (when expanded) */}
      {!collapsed && user && (
        <div className="mx-3 mt-4 flex items-center gap-2.5 rounded-xl bg-white/10 px-3 py-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-xs font-bold text-white shrink-0">
            {getInitials(user.name)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white leading-tight">
              {user.name}
            </p>
            <p className="truncate text-xs text-white/60 capitalize">
              {user.role?.replace(/_/g, " ")}
            </p>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4">
        {!collapsed && (
          <p className="px-5 pb-2 text-[10px] font-semibold uppercase tracking-widest text-white/40">
            Navigation
          </p>
        )}
        <ul className="space-y-0.5 px-2">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href + "/"));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-white/20 text-white"
                      : "text-white/70 hover:bg-white/10 hover:text-white",
                    collapsed && "justify-center",
                  )}
                  title={collapsed ? item.label : undefined}
                >
                  <span className="shrink-0">{item.icon}</span>
                  {!collapsed && <span className="truncate">{item.label}</span>}
                  {!collapsed && item.badge && item.badge > 0 && (
                    <span className="ml-auto rounded-full bg-white/30 px-1.5 py-0.5 text-xs text-white">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="border-t border-white/10 p-3">
        <button
          onClick={() => logout()}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-white/60 hover:bg-white/10 hover:text-red-300 transition-colors",
            collapsed && "justify-center",
          )}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && "Log out"}
        </button>
      </div>
    </aside>
  );
}
