"use client";
import React, { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  HeartHandshake,
  GraduationCap,
  CreditCard,
  BarChart3,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Download,
  MapPin,
  ArrowDownLeft,
  ArrowUpRight,
  BookOpen,
  Shirt,
  Building2,
  Wallet,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { withRoleGuard } from "@/lib/withRoleGuard";

// ── Wallet Card ───────────────────────────────────────────────────────────────
function WalletCard({
  balance,
  studentCount,
}: {
  balance: number;
  studentCount: number;
}) {
  return (
    <div
      className="rounded-2xl p-5 text-white"
      style={{
        background: "linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)",
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Wallet className="h-4 w-4 opacity-80" />
            <span className="text-xs font-semibold uppercase tracking-widest opacity-80">
              Sponsor Wallet
            </span>
          </div>
          <p className="text-3xl font-extrabold tracking-tight">
            {formatCurrency(balance)}
          </p>
          <p className="mt-1 text-xs opacity-75">
            Supports {studentCount} student{studentCount !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          size="sm"
          className="bg-white/20 hover:bg-white/30 text-white border-0 gap-1.5"
          leftIcon={<PlusCircle className="h-4 w-4" />}
        >
          Add Funds
        </Button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-white/15 p-3">
          <p className="text-[10px] font-semibold uppercase opacity-75">
            Allocated
          </p>
          <p className="text-sm font-bold mt-0.5">
            {formatCurrency(balance * 0.72)}
          </p>
        </div>
        <div className="rounded-xl bg-white/15 p-3">
          <p className="text-[10px] font-semibold uppercase opacity-75">
            Available
          </p>
          <p className="text-sm font-bold mt-0.5">
            {formatCurrency(balance * 0.28)}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Supported Institutions ────────────────────────────────────────────────────
interface Institution {
  id: number;
  name: string;
  location: string;
  student_count: number;
}

const demoInstitutions: Institution[] = [
  {
    id: 1,
    name: "Greenfield Academy",
    location: "Uyo, Akwa Ibom",
    student_count: 1,
  },
  {
    id: 2,
    name: "Govt. Secondary, Uyo",
    location: "Uyo, Akwa Ibom",
    student_count: 1,
  },
];

function SupportedInstitutions({
  institutions,
}: {
  institutions: Institution[];
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Building2 className="h-4 w-4 text-gray-500" />
          Supported Institutions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y dark:divide-gray-800">
          {institutions.map((inst) => (
            <li
              key={inst.id}
              className="flex items-center gap-3 px-5 py-3 border-l-4 border-yellow-400"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-50 dark:bg-yellow-900/20 shrink-0">
                <Building2 className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {inst.name}
                </p>
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-500">{inst.location}</span>
                </div>
              </div>
              <Badge variant="yellow">
                {inst.student_count} student
                {inst.student_count !== 1 ? "s" : ""}
              </Badge>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

// ── Financial Ledger ──────────────────────────────────────────────────────────
interface LedgerEntry {
  id: number;
  icon: "credit" | "debit";
  title: string;
  reference: string;
  amount: number;
  date: string;
}

const demoLedger: LedgerEntry[] = [
  {
    id: 1,
    icon: "credit",
    title: "Wallet Top-Up",
    reference: "TXN-WLT-001",
    amount: 500000,
    date: "2024-09-01",
  },
  {
    id: 2,
    icon: "debit",
    title: "Term Fees – Mercy Udo",
    reference: "TXN-SCH-003",
    amount: 200000,
    date: "2024-09-10",
  },
  {
    id: 3,
    icon: "debit",
    title: "Books & Stationery",
    reference: "TXN-MTR-005",
    amount: 45000,
    date: "2024-09-15",
  },
  {
    id: 4,
    icon: "credit",
    title: "Stripe Top-Up",
    reference: "TXN-STR-007",
    amount: 250000,
    date: "2024-10-01",
  },
  {
    id: 5,
    icon: "debit",
    title: "Term Fees – Daniel Obi",
    reference: "TXN-SCH-008",
    amount: 180000,
    date: "2024-11-01",
  },
];

function FinancialLedger({ entries }: { entries: LedgerEntry[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-gray-500" />
            Financial Ledger
          </CardTitle>
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y dark:divide-gray-800">
          {entries.map((e) => (
            <li key={e.id} className="flex items-center gap-4 px-5 py-3">
              <div
                className={`h-8 w-8 flex-shrink-0 rounded-full flex items-center justify-center ${
                  e.icon === "credit"
                    ? "bg-green-50 dark:bg-green-900/20"
                    : "bg-red-50 dark:bg-red-900/20"
                }`}
              >
                {e.icon === "credit" ? (
                  <ArrowDownLeft className="h-3.5 w-3.5 text-green-600" />
                ) : (
                  <ArrowUpRight className="h-3.5 w-3.5 text-red-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {e.title}
                </p>
                <p className="text-[11px] font-mono text-gray-400">
                  #{e.reference} ·{" "}
                  {new Date(e.date).toLocaleDateString("en-NG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>
              <p
                className={`text-sm font-bold ${
                  e.icon === "credit" ? "text-green-600" : "text-red-600"
                }`}
              >
                {e.icon === "credit" ? "+" : "−"}
                {formatCurrency(e.amount)}
              </p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

// ── Upkeep Allocation ─────────────────────────────────────────────────────────
function UpkeepAllocation() {
  const items = [
    {
      label: "Books & Stationery",
      amount: 45000,
      icon: BookOpen,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20",
    },
    {
      label: "Uniform & Shoes",
      amount: 80000,
      icon: Shirt,
      color: "text-purple-600",
      bg: "bg-purple-50 dark:bg-purple-900/20",
    },
  ];
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Upkeep Allocation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {items.map(({ label, amount, icon: Icon, color, bg }) => (
            <div key={label} className={`rounded-xl ${bg} p-4`}>
              <Icon className={`h-5 w-5 ${color} mb-2`} />
              <p className="text-[11px] text-gray-500 font-medium">{label}</p>
              <p className={`text-base font-bold ${color} mt-0.5`}>
                {formatCurrency(amount)}
              </p>
            </div>
          ))}
        </div>
        <Button
          className="mt-4 w-full"
          size="sm"
          leftIcon={<HeartHandshake className="h-4 w-4" />}
        >
          Distribute Material
        </Button>
      </CardContent>
    </Card>
  );
}
function NeedyStudentSlider({ students }: { students: any[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scroll = (dir: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "right" ? 260 : -260, behavior: "smooth" });
  };

  useEffect(() => {
    intervalRef.current = setInterval(() => scroll("right"), 3500);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  if (!students.length) return null;

  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Students Who Need Help
          </h2>
          <p className="text-xs text-gray-500">
            Scroll to see students looking for sponsors
          </p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => scroll("left")}
            className="rounded-full border border-gray-200 dark:border-gray-700 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="rounded-full border border-gray-200 dark:border-gray-700 p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: "none" }}
      >
        {students.map((s: any) => (
          <div
            key={s.id}
            className="snap-start shrink-0 w-60 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 shadow-sm flex flex-col gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand/10 text-brand font-bold shrink-0">
                {s.user?.name
                  ? s.user.name
                      .split(" ")
                      .map((n: string) => n[0])
                      .join("")
                      .slice(0, 2)
                  : "S"}
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white leading-tight">
                  {s.user?.name ?? "Student"}
                </p>
                <p className="text-xs text-gray-500">
                  {s.school?.name ?? s.class_room?.name ?? ""}
                </p>
              </div>
            </div>

            {s.needy_reason && (
              <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-3">
                {s.needy_reason}
              </p>
            )}

            <Button
              size="sm"
              className="mt-auto w-full"
              leftIcon={<HeartHandshake className="h-4 w-4" />}
            >
              Sponsor
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
const sponsoredStudents = [
  {
    id: 1,
    name: "Mercy Udo",
    class: "SS 2A",
    school: "Greenfield Academy",
    scholarship: "Full Scholarship",
    amount_due: 350000,
    amount_paid: 200000,
    avg_score: 78,
    needs: ["New school uniform", "Biology textbook"],
  },
  {
    id: 2,
    name: "Daniel Obi",
    class: "JSS 3B",
    school: "Govt. Secondary, Uyo",
    scholarship: "Partial Scholarship",
    amount_due: 180000,
    amount_paid: 180000,
    avg_score: 84,
    needs: [],
  },
];

function SponsorDashboard() {
  const { data: needyData } = useQuery({
    queryKey: ["needy-students"],
    queryFn: () => get<any>("/students/needy").then((r) => r.data?.data ?? []),
  });

  const { data: walletData } = useQuery({
    queryKey: ["sponsor-wallet"],
    queryFn: () =>
      get<any>("/sponsor/wallet").then((r) => r.data?.data ?? null),
  });

  const { data: institutionsData } = useQuery({
    queryKey: ["sponsor-institutions"],
    queryFn: () =>
      get<any>("/sponsor/institutions").then((r) => r.data?.data ?? []),
  });

  const { data: ledgerData } = useQuery({
    queryKey: ["sponsor-ledger"],
    queryFn: () =>
      get<any>("/sponsor/transactions").then((r) => r.data?.data ?? []),
  });

  const needyStudents: any[] = Array.isArray(needyData) ? needyData : [];
  const walletBalance: number = walletData?.balance ?? 325000;
  const institutions: Institution[] =
    Array.isArray(institutionsData) && institutionsData.length > 0
      ? institutionsData
      : demoInstitutions;
  const ledgerEntries: LedgerEntry[] =
    Array.isArray(ledgerData) && ledgerData.length > 0
      ? ledgerData
      : demoLedger;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Sponsor Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Empowering students through your scholarship support
        </p>
      </div>

      {/* Wallet Card */}
      <WalletCard
        balance={walletBalance}
        studentCount={sponsoredStudents.length}
      />

      {/* Featured needy students slider */}
      {needyStudents.length > 0 && (
        <NeedyStudentSlider students={needyStudents} />
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          title="Sponsored Students"
          value="2"
          icon={<GraduationCap className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Total Committed"
          value={formatCurrency(530000)}
          icon={<HeartHandshake className="h-5 w-5" />}
          color="purple"
        />
        <StatCard
          title="Paid This Term"
          value={formatCurrency(380000)}
          icon={<CreditCard className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          title="Outstanding"
          value={formatCurrency(150000)}
          icon={<CreditCard className="h-5 w-5" />}
          color="yellow"
        />
      </div>

      {/* Student Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {sponsoredStudents.map((s) => (
          <Card key={s.id}>
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand font-bold shrink-0">
                {s.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {s.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {s.class} · {s.school}
                    </p>
                  </div>
                  <Badge variant="purple">{s.scholarship}</Badge>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-2">
                    <p className="text-gray-500">Amount Due</p>
                    <p className="font-bold text-gray-900 dark:text-white mt-0.5">
                      {formatCurrency(s.amount_due)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-2">
                    <p className="text-gray-500">Paid</p>
                    <p className="font-bold text-green-600 mt-0.5">
                      {formatCurrency(s.amount_paid)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-2">
                    <p className="text-gray-500">Avg Score</p>
                    <p className="font-bold text-brand mt-0.5">
                      {s.avg_score}%
                    </p>
                  </div>
                </div>

                {s.needs.length > 0 && (
                  <div className="mt-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/10 p-2">
                    <p className="text-xs font-medium text-yellow-800 dark:text-yellow-400 mb-1">
                      Needs
                    </p>
                    <ul className="space-y-0.5">
                      {s.needs.map((n, i) => (
                        <li
                          key={i}
                          className="text-xs text-yellow-700 dark:text-yellow-500 flex items-center gap-1"
                        >
                          <span className="h-1 w-1 rounded-full bg-yellow-500 inline-block shrink-0" />
                          {n}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                leftIcon={<BarChart3 className="h-4 w-4" />}
              >
                Reports
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                leftIcon={<MessageSquare className="h-4 w-4" />}
              >
                Message
              </Button>
              <Button
                size="sm"
                className="flex-1"
                leftIcon={<CreditCard className="h-4 w-4" />}
              >
                Donate
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Scholarship breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Scholarship Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { category: "School Fees", due: 350000, paid: 280000 },
              { category: "Books", due: 80000, paid: 80000 },
              { category: "School Uniforms", due: 45000, paid: 20000 },
              { category: "Upkeep Allowance", due: 55000, paid: 0 },
            ].map((item) => {
              const pct = Math.round((item.paid / item.due) * 100);
              return (
                <div key={item.category} className="flex items-center gap-4">
                  <div className="w-32 shrink-0 text-sm text-gray-700 dark:text-gray-300">
                    {item.category}
                  </div>
                  <div className="flex-1">
                    <div className="h-2 rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-brand"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-24 text-right text-xs text-gray-500">
                    {formatCurrency(item.paid)} / {formatCurrency(item.due)}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upkeep Allocation */}
      <UpkeepAllocation />

      {/* Two column: institutions + ledger */}
      <div className="grid gap-6 lg:grid-cols-2">
        <SupportedInstitutions institutions={institutions} />
        <FinancialLedger entries={ledgerEntries} />
      </div>
    </div>
  );
}

export default withRoleGuard(SponsorDashboard, ["sponsor"]);
