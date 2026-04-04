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
  Package,
  Building2,
  UserPlus,
  DollarSign,
  CalendarDays,
  Globe,
  FileCheck,
  ShoppingCart,
  CalendarOff,
  Wallet,
  Mail,
  Upload,
  Briefcase,
  ShieldCheck,
} from "lucide-react";
import { cn, getInitials } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import type { UserRole } from "@/types";
import { Logo, LogoIcon } from "@/components/ui/Logo";

const dashboardHomeByRole: Record<UserRole, string> = {
  super_admin: "/super-admin",
  regulator: "/regulator",
  state_regulator: "/regulator",
  lga_regulator: "/regulator",
  school_admin: "/school-admin",
  branch_admin: "/admin",
  teacher: "/teacher",
  student: "/student",
  parent: "/parent",
  sponsor: "/sponsor",
  revenue_collector: "/revenue",
  affiliate: "/affiliate",
  freelancer_teacher: "/freelancer-teacher",
  security: "/security",
  insurance_operator: "/insurance-operator",
  platform_accountant: "/platform-accountant",
  school_accountant: "/school-accountant",
};

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

const navByRole: Record<UserRole, NavGroup[]> = {
  super_admin: [
    {
      group: "Platform",
      items: [
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
          label: "Subscription Plans",
          href: "/super-admin/subscriptions",
          icon: <CreditCard className="h-4 w-4" />,
        },
        {
          label: "Settings",
          href: "/super-admin/settings",
          icon: <Settings className="h-4 w-4" />,
        },
      ],
    },
  ],
  state_regulator: [
    {
      group: "Overview",
      items: [
        {
          label: "Overview",
          href: "/regulator",
          icon: <LayoutDashboard className="h-4 w-4" />,
        },
      ],
    },
    {
      group: "Compliance",
      items: [
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
          label: "Approvals",
          href: "/regulator/approvals",
          icon: <FileCheck className="h-4 w-4" />,
        },
      ],
    },
    {
      group: "Programs",
      items: [
        {
          label: "Programs",
          href: "/regulator/programs",
          icon: <Globe className="h-4 w-4" />,
        },
        {
          label: "Events",
          href: "/regulator/events",
          icon: <CalendarDays className="h-4 w-4" />,
        },
      ],
    },
    {
      group: "Engagement",
      items: [
        {
          label: "Teacher Postings",
          href: "/regulator/teacher-postings",
          icon: <UserPlus className="h-4 w-4" />,
        },
        {
          label: "Platform Recruitment",
          href: "/regulator/platform-jobs",
          icon: <Briefcase className="h-4 w-4" />,
        },
        {
          label: "Messages",
          href: "/regulator/messages",
          icon: <MessageSquare className="h-4 w-4" />,
        },
        {
          label: "Broadcast",
          href: "/regulator/broadcast",
          icon: <Mail className="h-4 w-4" />,
        },
      ],
    },
  ],
  lga_regulator: [
    {
      group: "Overview",
      items: [
        {
          label: "Overview",
          href: "/regulator",
          icon: <LayoutDashboard className="h-4 w-4" />,
        },
      ],
    },
    {
      group: "Compliance",
      items: [
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
          label: "Approvals",
          href: "/regulator/approvals",
          icon: <FileCheck className="h-4 w-4" />,
        },
      ],
    },
    {
      group: "Engagement",
      items: [
        {
          label: "Teacher Postings",
          href: "/regulator/teacher-postings",
          icon: <UserPlus className="h-4 w-4" />,
        },
        {
          label: "Platform Recruitment",
          href: "/regulator/platform-jobs",
          icon: <Briefcase className="h-4 w-4" />,
        },
        {
          label: "Messages",
          href: "/regulator/messages",
          icon: <MessageSquare className="h-4 w-4" />,
        },
        {
          label: "Broadcast",
          href: "/regulator/broadcast",
          icon: <Mail className="h-4 w-4" />,
        },
      ],
    },
  ],
  regulator: [
    {
      group: "Overview",
      items: [
        {
          label: "Overview",
          href: "/regulator",
          icon: <LayoutDashboard className="h-4 w-4" />,
        },
      ],
    },
    {
      group: "Compliance",
      items: [
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
          label: "Approvals",
          href: "/regulator/approvals",
          icon: <FileCheck className="h-4 w-4" />,
        },
        {
          label: "Gov Fees",
          href: "/regulator/government-fees",
          icon: <CreditCard className="h-4 w-4" />,
        },
      ],
    },
    {
      group: "Programs",
      items: [
        {
          label: "Programs",
          href: "/regulator/programs",
          icon: <Globe className="h-4 w-4" />,
        },
        {
          label: "Events",
          href: "/regulator/events",
          icon: <CalendarDays className="h-4 w-4" />,
        },
        {
          label: "Meetings",
          href: "/regulator/meetings",
          icon: <Video className="h-4 w-4" />,
        },
      ],
    },
    {
      group: "Engagement",
      items: [
        {
          label: "Teacher Postings",
          href: "/regulator/teacher-postings",
          icon: <UserPlus className="h-4 w-4" />,
        },
        {
          label: "Platform Recruitment",
          href: "/regulator/platform-jobs",
          icon: <Briefcase className="h-4 w-4" />,
        },
        {
          label: "Messages",
          href: "/regulator/messages",
          icon: <MessageSquare className="h-4 w-4" />,
        },
        {
          label: "Broadcast",
          href: "/regulator/broadcast",
          icon: <Mail className="h-4 w-4" />,
        },
      ],
    },
  ],
  school_admin: [
    {
      group: "Administration",
      items: [
        {
          label: "Dashboard",
          href: "/school-admin",
          icon: <LayoutDashboard className="h-4 w-4" />,
        },
        {
          label: "Setup Guide",
          href: "/school-admin/onboarding",
          icon: <ClipboardList className="h-4 w-4" />,
        },
        {
          label: "Branches",
          href: "/school-admin/branches",
          icon: <MapPin className="h-4 w-4" />,
        },
        {
          label: "Departments",
          href: "/school-admin/departments",
          icon: <Building2 className="h-4 w-4" />,
        },
        {
          label: "Recruitment",
          href: "/school-admin/recruitment",
          icon: <UserPlus className="h-4 w-4" />,
        },
        {
          label: "Leave",
          href: "/school-admin/leave",
          icon: <CalendarOff className="h-4 w-4" />,
        },
        {
          label: "Settings",
          href: "/school-admin/settings",
          icon: <Settings className="h-4 w-4" />,
        },
      ],
    },
    {
      group: "Academics",
      items: [
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
          label: "Bulk Upload",
          href: "/school-admin/bulk-upload",
          icon: <Upload className="h-4 w-4" />,
        },
        {
          label: "Classes",
          href: "/school-admin/classes",
          icon: <BookOpen className="h-4 w-4" />,
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
          label: "Admissions",
          href: "/school-admin/admissions",
          icon: <ClipboardList className="h-4 w-4" />,
        },
      ],
    },
    {
      group: "Finance",
      items: [
        {
          label: "Fees & Payments",
          href: "/school-admin/fees",
          icon: <Banknote className="h-4 w-4" />,
        },
        {
          label: "Payroll",
          href: "/school-admin/payroll",
          icon: <DollarSign className="h-4 w-4" />,
        },
        {
          label: "Store",
          href: "/school-admin/store",
          icon: <ShoppingCart className="h-4 w-4" />,
        },
        {
          label: "Inventory",
          href: "/school-admin/inventory",
          icon: <Package className="h-4 w-4" />,
        },
        {
          label: "Purchase Orders",
          href: "/school-admin/purchase-orders",
          icon: <ShoppingCart className="h-4 w-4" />,
        },
        {
          label: "Subscription",
          href: "/school-admin/subscription",
          icon: <Banknote className="h-4 w-4" />,
        },
        {
          label: "Gov Fees",
          href: "/school-admin/government-fees",
          icon: <CreditCard className="h-4 w-4" />,
        },
      ],
    },
    {
      group: "External Relations",
      items: [
        {
          label: "Gov Programs",
          href: "/school-admin/government-programs",
          icon: <Globe className="h-4 w-4" />,
        },
        {
          label: "Regulators",
          href: "/school-admin/regulators",
          icon: <Shield className="h-4 w-4" />,
        },
        {
          label: "Sponsors",
          href: "/school-admin/sponsors",
          icon: <HeartHandshake className="h-4 w-4" />,
        },
        {
          label: "Scholarships",
          href: "/school-admin/scholarships",
          icon: <GraduationCap className="h-4 w-4" />,
        },
        {
          label: "Insurance",
          href: "/school-admin/insurance",
          icon: <ShieldCheck className="h-4 w-4" />,
        },
        {
          label: "Reports",
          href: "/school-admin/reports",
          icon: <BarChart3 className="h-4 w-4" />,
        },
        {
          label: "Approvals",
          href: "/school-admin/approvals",
          icon: <FileCheck className="h-4 w-4" />,
        },
        {
          label: "Messages",
          href: "/school-admin/messages",
          icon: <MessageSquare className="h-4 w-4" />,
        },
      ],
    },
  ],
  branch_admin: [
    {
      group: "Administration",
      items: [
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
    },
  ],
  teacher: [
    {
      group: "Academics",
      items: [
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
      ],
    },
    {
      group: "HR",
      items: [
        {
          label: "My Salary",
          href: "/teacher/salary",
          icon: <DollarSign className="h-4 w-4" />,
        },
        {
          label: "Leave",
          href: "/teacher/leave",
          icon: <CalendarOff className="h-4 w-4" />,
        },
        {
          label: "Messages",
          href: "/teacher/messages",
          icon: <MessageSquare className="h-4 w-4" />,
        },
      ],
    },
  ],
  student: [
    {
      group: "Learning",
      items: [
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
          label: "Schedule",
          href: "/student/schedule",
          icon: <Calendar className="h-4 w-4" />,
        },
      ],
    },
    {
      group: "Personal",
      items: [
        {
          label: "School Fees",
          href: "/student/fees",
          icon: <DollarSign className="h-4 w-4" />,
        },
        {
          label: "Profile",
          href: "/student/profile",
          icon: <GraduationCap className="h-4 w-4" />,
        },
        {
          label: "Messages",
          href: "/student/messages",
          icon: <MessageSquare className="h-4 w-4" />,
        },
      ],
    },
  ],
  parent: [
    {
      group: "Children",
      items: [
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
          label: "Reports",
          href: "/parent/reports",
          icon: <BarChart3 className="h-4 w-4" />,
        },
        {
          label: "Pickup Codes",
          href: "/parent/pickup",
          icon: <Shield className="h-4 w-4" />,
        },
      ],
    },
    {
      group: "Finance",
      items: [
        {
          label: "Fees & Payments",
          href: "/parent/fees",
          icon: <CreditCard className="h-4 w-4" />,
        },
      ],
    },
    {
      group: "Services",
      items: [
        {
          label: "Hire a Teacher",
          href: "/parent/engagements",
          icon: <GraduationCap className="h-4 w-4" />,
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
    },
  ],
  sponsor: [
    {
      group: "Sponsorship",
      items: [
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
    },
  ],
  revenue_collector: [
    {
      group: "Revenue",
      items: [
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
    },
  ],
  affiliate: [
    {
      group: "Affiliate",
      items: [
        {
          label: "Dashboard",
          href: "/affiliate",
          icon: <LayoutDashboard className="h-4 w-4" />,
        },
        {
          label: "My Schools",
          href: "/affiliate/schools",
          icon: <School className="h-4 w-4" />,
        },
        {
          label: "Wallet",
          href: "/affiliate/wallet",
          icon: <Wallet className="h-4 w-4" />,
        },
        {
          label: "Messages",
          href: "/affiliate/messages",
          icon: <MessageSquare className="h-4 w-4" />,
        },
      ],
    },
  ],
  freelancer_teacher: [
    {
      group: "Overview",
      items: [
        {
          label: "Dashboard",
          href: "/freelancer-teacher",
          icon: <LayoutDashboard className="h-4 w-4" />,
        },
        {
          label: "My Profile",
          href: "/freelancer-teacher/profile",
          icon: <Users className="h-4 w-4" />,
        },
        {
          label: "Engagements",
          href: "/freelancer-teacher/engagements",
          icon: <HeartHandshake className="h-4 w-4" />,
        },
        {
          label: "Wallet",
          href: "/freelancer-teacher/wallet",
          icon: <Wallet className="h-4 w-4" />,
        },
      ],
    },
    {
      group: "Opportunities",
      items: [
        {
          label: "Browse Jobs",
          href: "/freelancer-teacher/recruitment",
          icon: <Briefcase className="h-4 w-4" />,
        },
      ],
    },
  ],
  security: [
    {
      group: "Security",
      items: [
        {
          label: "Dashboard",
          href: "/security",
          icon: <LayoutDashboard className="h-4 w-4" />,
        },
        {
          label: "Help Messages",
          href: "/security",
          icon: <MessageSquare className="h-4 w-4" />,
        },
      ],
    },
  ],
  insurance_operator: [
    {
      group: "Insurance",
      items: [
        {
          label: "Dashboard",
          href: "/insurance-operator",
          icon: <LayoutDashboard className="h-4 w-4" />,
        },
        {
          label: "Packages",
          href: "/insurance-operator/packages",
          icon: <ShieldCheck className="h-4 w-4" />,
        },
        {
          label: "Claims",
          href: "/insurance-operator/claims",
          icon: <FileText className="h-4 w-4" />,
        },
      ],
    },
  ],
  platform_accountant: [
    {
      group: "Finance",
      items: [
        {
          label: "Dashboard",
          href: "/platform-accountant",
          icon: <LayoutDashboard className="h-4 w-4" />,
        },
        {
          label: "Subscriptions",
          href: "/platform-accountant",
          icon: <CreditCard className="h-4 w-4" />,
        },
        {
          label: "Offline Payments",
          href: "/platform-accountant",
          icon: <Upload className="h-4 w-4" />,
        },
      ],
    },
  ],
  school_accountant: [
    {
      group: "Finance",
      items: [
        {
          label: "Dashboard",
          href: "/school-accountant",
          icon: <LayoutDashboard className="h-4 w-4" />,
        },
        {
          label: "Fee Invoices",
          href: "/school-accountant",
          icon: <Banknote className="h-4 w-4" />,
        },
        {
          label: "Payments",
          href: "/school-accountant",
          icon: <CreditCard className="h-4 w-4" />,
        },
        {
          label: "Payroll",
          href: "/school-accountant",
          icon: <DollarSign className="h-4 w-4" />,
        },
      ],
    },
  ],
};

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout, hasHydrated } = useAuthStore();
  const role = user?.role as UserRole | undefined;
  const navGroups = role ? (navByRole[role] ?? []) : [];

  const SCHOOL_ROLES = new Set<UserRole>([
    "school_admin",
    "branch_admin",
    "teacher",
    "student",
    "parent",
    "school_accountant",
    "security",
  ]);
  const isSchoolRole = role ? SCHOOL_ROLES.has(role) : false;
  const school = user?.school;
  const sidebarStyle =
    isSchoolRole && school?.primary_color
      ? { backgroundColor: school.primary_color }
      : undefined;

  if (!hasHydrated || !user || !role) {
    return null;
  }

  return (
    <aside
      className={cn(
        "flex flex-col transition-all duration-200 shrink-0",
        "bg-brand text-white",
        collapsed ? "w-16" : "w-64",
      )}
      style={sidebarStyle}
    >
      {/* Logo */}
      <div
        className={cn(
          "flex h-16 items-center border-b border-white/10 px-4",
          collapsed ? "justify-center" : "justify-between",
        )}
      >
        <Link href={role ? dashboardHomeByRole[role] : "/"}>
          {!collapsed &&
            (school?.logo ? (
              <img
                src={school.logo}
                alt={school.name ?? "School logo"}
                className="h-8 max-w-[136px] w-auto object-contain"
              />
            ) : (
              <Logo height={34} onDark />
            ))}
          {collapsed &&
            (school?.logo ? (
              <img
                src={school.logo}
                alt=""
                className="h-7 w-7 object-contain rounded"
              />
            ) : (
              <LogoIcon size={26} onDark />
            ))}
        </Link>
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* School branding strip */}
      {!collapsed && isSchoolRole && (
        <div className="px-4 py-3 border-b border-white/10 bg-black/15">
          <p className="text-[9px] font-semibold uppercase tracking-widest text-white/50 mb-0.5">
            Awajimaa
          </p>
          <p className="font-extrabold text-white text-sm leading-tight uppercase tracking-wide truncate">
            {school?.name ?? "Your School"}
          </p>
          {school?.slogan && (
            <p className="text-[11px] text-white/60 mt-0.5 italic leading-tight truncate">
              {school.slogan}
            </p>
          )}
        </div>
      )}

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
        <ul className="space-y-0.5 px-2">
          {navGroups.map((group, gi) => (
            <li key={gi}>
              {/* Group header (only when expanded) */}
              {!collapsed && (
                <p className="px-3 pt-4 pb-1 text-[10px] font-semibold uppercase tracking-widest text-white/40 first:pt-1">
                  {group.group}
                </p>
              )}
              {collapsed && gi > 0 && (
                <div className="mx-2 my-2 border-t border-white/10" />
              )}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
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
                        {!collapsed && (
                          <span className="truncate">{item.label}</span>
                        )}
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
            </li>
          ))}
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
