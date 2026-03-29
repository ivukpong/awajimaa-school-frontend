"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@tanstack/react-query";
import { post, get } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Phone,
  Briefcase,
  Lock,
  MapPin,
  Globe,
  Building2,
  FileText,
  Link as LinkIcon,
  CheckCircle2,
  CircleDot,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { COUNTRIES, NIGERIA } from "@/lib/countries";
import { cn } from "@/lib/utils";
import Cookies from "js-cookie";
import { getDeviceId, getDeviceInfo } from "@/lib/auth";

// ── Constants ─────────────────────────────────────────────────────────────────

const ROLES = [
  { value: "school_admin", label: "School Administrator" },
  { value: "teacher", label: "Teacher" },
  { value: "parent", label: "Parent / Guardian" },
  { value: "sponsor", label: "Sponsor" },
  { value: "revenue_collector", label: "Revenue Collector" },
  { value: "state_regulator", label: "Regulator — State Agency" },
  { value: "lga_regulator", label: "Regulator — LGA Agency" },
];

const SCHOOL_TYPES = [
  { value: "nursery", label: "Nursery / Creche" },
  { value: "primary", label: "Primary School" },
  { value: "secondary", label: "Secondary School" },
  { value: "tertiary", label: "Tertiary Institution" },
  { value: "combined", label: "Combined (Multi-level)" },
];

const OWNERSHIPS = [
  { value: "private", label: "Private" },
  { value: "public", label: "Government / Public" },
  { value: "mission", label: "Mission / Faith-based" },
];

const APP_DOMAIN = "awajimaa.com";

const SELECT_CLS =
  "block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 " +
  "focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent " +
  "dark:border-gray-600 dark:bg-gray-800 dark:text-white";

const SELECT_WITH_ICON_CLS = cn(SELECT_CLS, "pl-10");

// ── Types ─────────────────────────────────────────────────────────────────────

interface NigeriaState {
  id: number;
  name: string;
}
interface NigeriaLga {
  id: number;
  name: string;
}
interface NigeriaWard {
  id: number;
  name: string;
}
interface NigeriaUnit {
  id: number;
  name: string;
}

interface NinResult {
  verified: boolean;
  first_name: string;
  last_name: string;
  middle_name: string;
  gender: string;
  dob: string;
  phone: string;
}

// ── Step system ───────────────────────────────────────────────────────────────

type StepId = "account" | "location" | "nin" | "school" | "password";

interface StepDef {
  id: StepId;
  label: string;
  icon: React.ReactNode;
  onlyFor?: string[];
}

const ALL_STEPS: StepDef[] = [
  { id: "account", label: "Account", icon: <User className="h-4 w-4" /> },
  { id: "location", label: "Location", icon: <MapPin className="h-4 w-4" /> },
  {
    id: "nin",
    label: "Identity",
    icon: <ShieldCheck className="h-4 w-4" />,
    onlyFor: ["school_admin", "state_regulator", "lga_regulator"],
  },
  {
    id: "school",
    label: "School",
    icon: <Building2 className="h-4 w-4" />,
    onlyFor: ["school_admin"],
  },
  { id: "password", label: "Password", icon: <Lock className="h-4 w-4" /> },
];

// ── Form state ────────────────────────────────────────────────────────────────

interface FormState {
  // Step 1 — Account
  name: string;
  email: string;
  phone: string;
  dial_code: string;
  role: string;
  // Step 2 — Location
  country: string;
  address: string;
  state_id: string;
  lga_id: string;
  ward_id: string;
  unit_id: string;
  state_province: string;
  // Step 3 — NIN / Identity
  nin: string;
  nin_verified: boolean;
  nin_first_name: string;
  nin_last_name: string;
  nin_middle_name: string;
  gender: string;
  date_of_birth: string;
  cac_number: string;
  cac_document_url: string;
  // Step 4 — School
  school_name: string;
  school_email: string;
  school_phone: string;
  school_address: string;
  school_type: string;
  school_ownership: string;
  school_state_id: string;
  school_lga_id: string;
  school_subdomain: string;
  school_reg_number: string;
  // Step 5 — Password
  password: string;
  password_confirmation: string;
}

const INITIAL_FORM: FormState = {
  name: "",
  email: "",
  phone: "",
  dial_code: NIGERIA.dialCode,
  role: "",
  country: NIGERIA.name,
  address: "",
  state_id: "",
  lga_id: "",
  ward_id: "",
  unit_id: "",
  state_province: "",
  nin: "",
  nin_verified: false,
  nin_first_name: "",
  nin_last_name: "",
  nin_middle_name: "",
  gender: "",
  date_of_birth: "",
  cac_number: "",
  cac_document_url: "",
  school_name: "",
  school_email: "",
  school_phone: "",
  school_address: "",
  school_type: "",
  school_ownership: "private",
  school_state_id: "",
  school_lga_id: "",
  school_subdomain: "",
  school_reg_number: "",
  password: "",
  password_confirmation: "",
};

// ── Step progress indicator ───────────────────────────────────────────────────

function StepProgress({
  steps,
  currentIdx,
}: {
  steps: StepDef[];
  currentIdx: number;
}) {
  return (
    <div className="flex items-center gap-1 mb-8">
      {steps.map((step, i) => {
        const done = i < currentIdx;
        const active = i === currentIdx;
        return (
          <div key={step.id} className="flex items-center gap-1 flex-1 min-w-0">
            <div className="flex flex-col items-center gap-1 flex-shrink-0">
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors text-xs font-bold",
                  done && "border-brand bg-brand text-white",
                  active && "border-brand bg-white text-brand dark:bg-gray-900",
                  !done &&
                    !active &&
                    "border-gray-300 bg-white text-gray-400 dark:border-gray-600 dark:bg-gray-800",
                )}
              >
                {done ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : active ? (
                  <CircleDot className="h-4 w-4" />
                ) : (
                  i + 1
                )}
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium whitespace-nowrap",
                  active || done ? "text-brand" : "text-gray-400",
                )}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "flex-1 h-0.5 mb-4 mx-1 rounded-full transition-colors",
                  done ? "bg-brand" : "bg-gray-200 dark:bg-gray-700",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Subdomain input with live availability check ──────────────────────────────

function SubdomainInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [availability, setAvailability] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "")
      .replace(/--+/g, "-");
    onChange(raw);
    if (timer) clearTimeout(timer);
    if (!raw || raw.length < 3) {
      setAvailability("idle");
      return;
    }
    setAvailability("checking");
    const t = setTimeout(async () => {
      try {
        const res = await get<{ available: boolean }>(
          `/kyc/check-subdomain?subdomain=${raw}`,
        );
        setAvailability((res as any).available ? "available" : "taken");
      } catch {
        setAvailability("idle");
      }
    }, 600);
    setTimer(t);
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        School Subdomain <span className="text-red-500 ml-1">*</span>
      </label>
      <div className="flex items-center">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
            <LinkIcon className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={value}
            onChange={handleChange}
            placeholder="kings-college"
            maxLength={60}
            className={cn(
              SELECT_CLS,
              "pl-10 rounded-r-none border-r-0",
              availability === "available" &&
                "border-green-500 focus:ring-green-500",
              availability === "taken" && "border-red-500 focus:ring-red-500",
            )}
          />
        </div>
        <span className="flex items-center px-3 h-10 rounded-r-lg border border-gray-300 bg-gray-50 text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400 whitespace-nowrap">
          .{APP_DOMAIN}
        </span>
      </div>
      <div className="flex items-center gap-1.5 mt-0.5 min-h-[1.1rem]">
        {availability === "checking" && (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin text-gray-400" />
            <span className="text-xs text-gray-400">Checking…</span>
          </>
        )}
        {availability === "available" && (
          <>
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
            <span className="text-xs text-green-600">
              {value}.{APP_DOMAIN} is available
            </span>
          </>
        )}
        {availability === "taken" && (
          <>
            <AlertCircle className="h-3.5 w-3.5 text-red-500" />
            <span className="text-xs text-red-600">
              This subdomain is already taken
            </span>
          </>
        )}
        {availability === "idle" && value.length > 0 && value.length < 3 && (
          <span className="text-xs text-gray-400">Minimum 3 characters</span>
        )}
      </div>
      {value && availability !== "idle" && (
        <p className="text-xs text-gray-400">
          Your school dashboard will be at{" "}
          <span className="font-medium text-gray-600 dark:text-gray-300">
            {value}.{APP_DOMAIN}
          </span>
        </p>
      )}
    </div>
  );
}

// ── Reusable cascading location block ─────────────────────────────────────────

function LocationFields({
  isNigeria,
  statesData,
  lgasData,
  wardsData,
  unitsData,
  stateId,
  lgaId,
  wardId,
  unitId,
  stateProvince,
  country,
  address,
  onStateChange,
  onLgaChange,
  onWardChange,
  onUnitChange,
  onStateProvinceChange,
  onCountryChange,
  onAddressChange,
  showCountry = true,
  showAddress = true,
  label = "Location",
}: {
  isNigeria: boolean;
  statesData?: NigeriaState[];
  lgasData?: NigeriaLga[];
  wardsData?: NigeriaWard[];
  unitsData?: NigeriaUnit[];
  stateId: string;
  lgaId: string;
  wardId: string;
  unitId: string;
  stateProvince: string;
  country: string;
  address: string;
  onStateChange: (v: string) => void;
  onLgaChange: (v: string) => void;
  onWardChange: (v: string) => void;
  onUnitChange: (v: string) => void;
  onStateProvinceChange: (v: string) => void;
  onCountryChange?: (v: string) => void;
  onAddressChange?: (v: string) => void;
  showCountry?: boolean;
  showAddress?: boolean;
  label?: string;
}) {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
      {label && (
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
          {label}
        </p>
      )}

      {showCountry && onCountryChange && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Country <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
              <Globe className="h-4 w-4" />
            </div>
            <select
              required
              value={country}
              onChange={(e) => onCountryChange(e.target.value)}
              className={SELECT_WITH_ICON_CLS}
            >
              <option value="">Select country</option>
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.name}>
                  {c.flag} {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {showAddress && onAddressChange && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Street Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
              <MapPin className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={address}
              onChange={(e) => onAddressChange(e.target.value)}
              placeholder="12 School Road, Victoria Island"
              className={cn(SELECT_CLS, "pl-10")}
            />
          </div>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {isNigeria ? "State" : "State / Province"}
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
            <MapPin className="h-4 w-4" />
          </div>
          {isNigeria ? (
            <select
              value={stateId}
              onChange={(e) => onStateChange(e.target.value)}
              className={SELECT_WITH_ICON_CLS}
            >
              <option value="">Select state</option>
              {(statesData ?? []).map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              value={stateProvince}
              onChange={(e) => onStateProvinceChange(e.target.value)}
              placeholder="e.g. California"
              className={cn(SELECT_CLS, "pl-10")}
            />
          )}
        </div>
      </div>

      {isNigeria && stateId && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Local Government Area (LGA){" "}
            <span className="text-red-500 ml-1">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
              <MapPin className="h-4 w-4" />
            </div>
            <select
              value={lgaId}
              onChange={(e) => onLgaChange(e.target.value)}
              className={SELECT_WITH_ICON_CLS}
            >
              <option value="">Select LGA</option>
              {(lgasData ?? []).map((l) => (
                <option key={l.id} value={String(l.id)}>
                  {l.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {isNigeria && lgaId && (wardsData ?? []).length > 0 && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Ward
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
              <MapPin className="h-4 w-4" />
            </div>
            <select
              value={wardId}
              onChange={(e) => onWardChange(e.target.value)}
              className={SELECT_WITH_ICON_CLS}
            >
              <option value="">Select Ward</option>
              {(wardsData ?? []).map((w) => (
                <option key={w.id} value={String(w.id)}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {isNigeria && wardId && (unitsData ?? []).length > 0 && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Polling Unit
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
              <MapPin className="h-4 w-4" />
            </div>
            <select
              value={unitId}
              onChange={(e) => onUnitChange(e.target.value)}
              className={SELECT_WITH_ICON_CLS}
            >
              <option value="">Select Polling Unit</option>
              {(unitsData ?? []).map((u) => (
                <option key={u.id} value={String(u.id)}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [agreed, setAgreed] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);

  // NIN
  const [ninLoading, setNinLoading] = useState(false);
  const [ninResult, setNinResult] = useState<NinResult | null>(null);

  // CAC upload
  const [cacFile, setCacFile] = useState<File | null>(null);
  const [cacUploading, setCacUploading] = useState(false);

  const isNigeria = form.country === "Nigeria";

  // Visible steps depend on chosen role
  const steps = ALL_STEPS.filter(
    (s) => !s.onlyFor || !form.role || s.onlyFor.includes(form.role),
  );
  const currentStep = steps[stepIdx];
  const isLastStep = stepIdx === steps.length - 1;

  // ── Location queries ────────────────────────────────────────────────────────

  const { data: statesData } = useQuery<NigeriaState[]>({
    queryKey: ["ng-states"],
    queryFn: () => get<NigeriaState[]>("/states").then((r: any) => r.data ?? r),
    staleTime: Infinity,
  });

  const { data: lgasData } = useQuery<NigeriaLga[]>({
    queryKey: ["ng-lgas", form.state_id],
    queryFn: () =>
      get<NigeriaLga[]>(`/lgas?state_id=${form.state_id}`).then(
        (r: any) => r.data ?? r,
      ),
    enabled: isNigeria && !!form.state_id,
    staleTime: Infinity,
  });

  const { data: wardsData } = useQuery<NigeriaWard[]>({
    queryKey: ["ng-wards", form.lga_id],
    queryFn: () =>
      get<NigeriaWard[]>(`/wards?lga_id=${form.lga_id}`).then(
        (r: any) => r.data ?? r,
      ),
    enabled: isNigeria && !!form.lga_id,
    staleTime: Infinity,
  });

  const { data: unitsData } = useQuery<NigeriaUnit[]>({
    queryKey: ["ng-units", form.ward_id],
    queryFn: () =>
      get<NigeriaUnit[]>(`/units?ward_id=${form.ward_id}`).then(
        (r: any) => r.data ?? r,
      ),
    enabled: isNigeria && !!form.ward_id,
    staleTime: Infinity,
  });

  // School LGAs (separate query key to avoid collision with user LGA)
  const { data: schoolLgasData } = useQuery<NigeriaLga[]>({
    queryKey: ["ng-lgas-school", form.school_state_id],
    queryFn: () =>
      get<NigeriaLga[]>(`/lgas?state_id=${form.school_state_id}`).then(
        (r: any) => r.data ?? r,
      ),
    enabled: !!form.school_state_id,
    staleTime: Infinity,
  });

  // ── Reset cascading fields on parent change ─────────────────────────────────

  useEffect(() => {
    setForm((f) => ({
      ...f,
      state_id: "",
      lga_id: "",
      ward_id: "",
      unit_id: "",
      state_province: "",
    }));
  }, [form.country]);
  useEffect(() => {
    setForm((f) => ({ ...f, lga_id: "", ward_id: "", unit_id: "" }));
  }, [form.state_id]);
  useEffect(() => {
    setForm((f) => ({ ...f, ward_id: "", unit_id: "" }));
  }, [form.lga_id]);
  useEffect(() => {
    setForm((f) => ({ ...f, unit_id: "" }));
  }, [form.ward_id]);
  useEffect(() => {
    setForm((f) => ({ ...f, school_lga_id: "" }));
  }, [form.school_state_id]);

  // Re-start wizard when role changes (step list may change)
  useEffect(() => {
    setStepIdx(0);
  }, [form.role]);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const set = useCallback(
    (k: keyof FormState) =>
      (
        e: React.ChangeEvent<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >,
      ) =>
        setForm((f) => ({ ...f, [k]: e.target.value })),
    [],
  );

  const setVal = useCallback((k: keyof FormState, v: string | boolean) => {
    setForm((f) => ({ ...f, [k]: v }));
  }, []);

  // ── NIN verify ──────────────────────────────────────────────────────────────

  const handleVerifyNin = async () => {
    if (!/^\d{11}$/.test(form.nin)) {
      toast.error("NIN must be exactly 11 digits");
      return;
    }
    setNinLoading(true);
    try {
      const res = await post<NinResult>("/kyc/verify-nin", { nin: form.nin });
      const data = (res as any).data ?? (res as any);
      if (!data.verified) throw new Error("NIN could not be verified");
      setNinResult(data);
      setForm((f) => ({
        ...f,
        nin_verified: true,
        nin_first_name: data.first_name,
        nin_last_name: data.last_name,
        nin_middle_name: data.middle_name ?? "",
        gender: data.gender,
        date_of_birth: data.dob,
      }));
      toast.success("NIN verified successfully!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "NIN verification failed");
    } finally {
      setNinLoading(false);
    }
  };

  const resetNin = () => {
    setNinResult(null);
    setForm((f) => ({
      ...f,
      nin: "",
      nin_verified: false,
      nin_first_name: "",
      nin_last_name: "",
      nin_middle_name: "",
      gender: "",
      date_of_birth: "",
    }));
  };

  // ── CAC upload ──────────────────────────────────────────────────────────────

  const handleCacUpload = async (file: File) => {
    setCacFile(file);
    setCacUploading(true);
    try {
      const fd = new FormData();
      fd.append("document", file);
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api"}/kyc/upload-cac`,
        { method: "POST", body: fd },
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json.message ?? "Upload failed");
      setVal("cac_document_url", json.url);
      toast.success("CAC document uploaded");
    } catch (err: any) {
      toast.error(err.message ?? "Upload failed");
      setCacFile(null);
    } finally {
      setCacUploading(false);
    }
  };

  // ── Final submit ─────────────────────────────────────────────────────────────

  const registerMutation = useMutation({
    mutationFn: (payload: Record<string, string | boolean>) =>
      post<{ token: string; user: any }>("/auth/register", payload),
    onSuccess: (res) => {
      const result = res as unknown as { token: string; user: any };
      Cookies.set("auth_token", result.token, {
        expires: 7,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });
      setAuth(result.token, result.user);
      toast.success("Account created!");
      const role = result.user.role as string | undefined;
      const destination =
        role === "school_admin"
          ? "/school-admin/onboarding"
          : `/${role?.replaceAll("_", "-") ?? "dashboard"}`;
      router.replace(destination);
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? "Registration failed"),
  });

  const handleFinalSubmit = () => {
    const { name: deviceName, type: deviceType } = getDeviceInfo();
    const payload: Record<string, string | boolean> = {
      name: form.name,
      email: form.email,
      phone: form.dial_code + form.phone,
      country_code: form.dial_code,
      country: form.country,
      address: form.address,
      role: form.role,
      password: form.password,
      password_confirmation: form.password_confirmation,
      device_id: getDeviceId(),
      device_name: deviceName,
      device_type: deviceType,
    };

    if (isNigeria) {
      if (form.state_id) payload.state_id = form.state_id;
      if (form.lga_id) payload.lga_id = form.lga_id;
      if (form.ward_id) payload.ward_id = form.ward_id;
      if (form.unit_id) payload.unit_id = form.unit_id;
    } else if (form.state_province) {
      payload.state_province = form.state_province;
    }

    if (form.nin_verified) {
      payload.nin = form.nin;
      payload.nin_verified = true;
      payload.nin_first_name = form.nin_first_name;
      payload.nin_last_name = form.nin_last_name;
      payload.nin_middle_name = form.nin_middle_name;
      payload.gender = form.gender;
      payload.date_of_birth = form.date_of_birth;
    }
    if (form.cac_number) payload.cac_number = form.cac_number;
    if (form.cac_document_url) payload.cac_document_url = form.cac_document_url;

    if (form.role === "school_admin") {
      payload.school_name = form.school_name;
      payload.school_email = form.school_email;
      payload.school_phone = form.school_phone;
      payload.school_address = form.school_address;
      payload.school_type = form.school_type;
      payload.school_ownership = form.school_ownership;
      payload.school_subdomain = form.school_subdomain;
      payload.school_reg_number = form.school_reg_number;
      if (form.school_state_id) payload.school_state_id = form.school_state_id;
      if (form.school_lga_id) payload.school_lga_id = form.school_lga_id;
    }

    registerMutation.mutate(payload);
  };

  // ── Step validation ──────────────────────────────────────────────────────────

  const canGoNext = (): boolean => {
    if (!currentStep) return false;
    switch (currentStep.id) {
      case "account":
        return !!(form.name && form.email && form.role);
      case "location":
        return !!(
          form.country &&
          (!isNigeria || (form.state_id && form.lga_id))
        );
      case "nin":
        return form.role === "school_admin" ? form.nin_verified : true;
      case "school":
        return !!(
          form.school_name &&
          form.school_subdomain &&
          form.school_type
        );
      case "password":
        return !!(
          form.password &&
          form.password === form.password_confirmation &&
          form.password.length >= 8
        );
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!canGoNext()) {
      toast.error("Please complete all required fields before continuing");
      return;
    }
    // On last step, require agreement to privacy/terms
    if (isLastStep && !agreed) {
      toast.error(
        "You must agree to the Privacy Policy and Terms & Conditions",
      );
      return;
    }
    if (stepIdx < steps.length - 1) setStepIdx((i) => i + 1);
    else handleFinalSubmit();
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <Card>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Create an account
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Join Awajimaa School Management
        </p>
      </div>

      <StepProgress steps={steps} currentIdx={stepIdx} />

      {/* ── Step 1: Account ───────────────────────────────────────────────── */}
      {currentStep?.id === "account" && (
        <div className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            value={form.name}
            onChange={set("name")}
            placeholder="John Doe"
            leftIcon={<User className="h-4 w-4" />}
            required
          />
          <Input
            label="Email Address"
            type="email"
            value={form.email}
            onChange={set("email")}
            placeholder="john@example.com"
            leftIcon={<Mail className="h-4 w-4" />}
            required
          />

          {/* Phone + dial code */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone Number
            </label>
            <div className="flex gap-2">
              <select
                value={form.dial_code}
                onChange={set("dial_code")}
                aria-label="Country dial code"
                className={cn(
                  "shrink-0 rounded-lg border border-gray-300 bg-white py-2 pl-2 pr-6 text-sm text-gray-900",
                  "focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent",
                  "dark:border-gray-600 dark:bg-gray-800 dark:text-white",
                )}
                style={{ minWidth: "6.5rem" }}
              >
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.dialCode}>
                    {c.flag} {c.dialCode}
                  </option>
                ))}
              </select>
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                  <Phone className="h-4 w-4" />
                </div>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={set("phone")}
                  placeholder="800 000 0000"
                  className={cn(SELECT_CLS, "pl-10")}
                />
              </div>
            </div>
          </div>

          {/* Role */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Role <span className="text-red-500 ml-1">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                <Briefcase className="h-4 w-4" />
              </div>
              <select
                required
                value={form.role}
                onChange={set("role")}
                className={SELECT_WITH_ICON_CLS}
              >
                <option value="">Select your role</option>
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ── Step 2: Location ──────────────────────────────────────────────── */}
      {currentStep?.id === "location" && (
        <LocationFields
          isNigeria={isNigeria}
          statesData={statesData}
          lgasData={lgasData}
          wardsData={wardsData}
          unitsData={unitsData}
          stateId={form.state_id}
          lgaId={form.lga_id}
          wardId={form.ward_id}
          unitId={form.unit_id}
          stateProvince={form.state_province}
          country={form.country}
          address={form.address}
          onStateChange={(v) => setVal("state_id", v)}
          onLgaChange={(v) => setVal("lga_id", v)}
          onWardChange={(v) => setVal("ward_id", v)}
          onUnitChange={(v) => setVal("unit_id", v)}
          onStateProvinceChange={(v) => setVal("state_province", v)}
          onCountryChange={(v) => setVal("country", v)}
          onAddressChange={(v) => setVal("address", v)}
          label="Your Location"
        />
      )}

      {/* ── Step 3: Identity / NIN ─────────────────────────────────────────── */}
      {currentStep?.id === "nin" && (
        <div className="space-y-5">
          <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3">
            <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
              As required by the Federal Government, registration requires NIN
              (National Identification Number) verification. Your identity
              details will be pre-filled from NIMC records.
            </p>
          </div>

          {/* NIN input */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              NIN (National Identification Number)
              {form.role === "school_admin" && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={11}
                  value={form.nin}
                  onChange={(e) => {
                    setVal("nin", e.target.value.replace(/\D/g, ""));
                    if (form.nin_verified) resetNin();
                  }}
                  placeholder="12345678901"
                  disabled={form.nin_verified}
                  className={cn(
                    SELECT_CLS,
                    "pl-10",
                    form.nin_verified && "border-green-500",
                  )}
                />
              </div>
              <Button
                type="button"
                variant={form.nin_verified ? "secondary" : "primary"}
                onClick={form.nin_verified ? resetNin : handleVerifyNin}
                loading={ninLoading}
                disabled={!form.nin_verified && form.nin.length !== 11}
              >
                {form.nin_verified ? "Change" : "Verify"}
              </Button>
            </div>
            <p className="text-xs text-gray-400">
              Enter your 11-digit NIN as printed on your NIMC slip or National
              ID card
            </p>
          </div>

          {/* Verified result */}
          {ninResult && form.nin_verified && (
            <div className="rounded-lg border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20 p-4 space-y-3">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-sm font-semibold">Identity Verified</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-500">First Name</p>
                  <p className="font-medium capitalize">
                    {ninResult.first_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Last Name</p>
                  <p className="font-medium capitalize">
                    {ninResult.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Gender</p>
                  <p className="font-medium capitalize">{ninResult.gender}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Date of Birth</p>
                  <p className="font-medium">{ninResult.dob}</p>
                </div>
              </div>
            </div>
          )}

          {/* CAC — only for school_admin (not state/LGA regulators) */}
          {form.role === "school_admin" && (
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Business / CAC Details (Optional)
              </p>
              <Input
                label="CAC Registration Number"
                type="text"
                value={form.cac_number}
                onChange={set("cac_number")}
                placeholder="RC 123456"
                leftIcon={<FileText className="h-4 w-4" />}
              />
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  CAC Certificate / Document
                </label>
                <div
                  className={cn(
                    "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center cursor-pointer transition-colors",
                    "border-gray-300 dark:border-gray-600 hover:border-brand hover:bg-brand/5",
                    form.cac_document_url &&
                      "border-green-400 bg-green-50 dark:bg-green-900/20",
                  )}
                  onClick={() =>
                    document.getElementById("cac-file-input")?.click()
                  }
                >
                  {cacUploading ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400 mb-1" />
                      <p className="text-sm text-gray-500">Uploading…</p>
                    </>
                  ) : form.cac_document_url ? (
                    <>
                      <CheckCircle2 className="h-6 w-6 text-green-500 mb-1" />
                      <p className="text-sm text-green-700 dark:text-green-400">
                        {cacFile?.name ?? "Document uploaded"}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Click to replace
                      </p>
                    </>
                  ) : (
                    <>
                      <FileText className="h-6 w-6 text-gray-400 mb-1" />
                      <p className="text-sm text-gray-500">
                        Click to upload PDF, JPG or PNG
                      </p>
                      <p className="text-xs text-gray-400">Max 5 MB</p>
                    </>
                  )}
                  <input
                    id="cac-file-input"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleCacUpload(f);
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Step 4: School setup ──────────────────────────────────────────── */}
      {currentStep?.id === "school" && (
        <div className="space-y-4">
          <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3">
            <p className="text-xs text-amber-700 dark:text-amber-300 leading-relaxed">
              Your school will be reviewed and approved before going live.
              You&#39;ll receive a confirmation email once approved.
            </p>
          </div>

          <Input
            label="School Name"
            type="text"
            value={form.school_name}
            onChange={set("school_name")}
            placeholder="Kings College Lagos"
            leftIcon={<Building2 className="h-4 w-4" />}
            required
          />

          <SubdomainInput
            value={form.school_subdomain}
            onChange={(v) => setVal("school_subdomain", v)}
          />

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                School Type <span className="text-red-500 ml-1">*</span>
              </label>
              <select
                required
                value={form.school_type}
                onChange={set("school_type")}
                className={SELECT_CLS}
              >
                <option value="">Select type</option>
                {SCHOOL_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Ownership
              </label>
              <select
                value={form.school_ownership}
                onChange={set("school_ownership")}
                className={SELECT_CLS}
              >
                {OWNERSHIPS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input
            label="School Email"
            type="email"
            value={form.school_email}
            onChange={set("school_email")}
            placeholder="admin@kingscollegelagos.edu.ng"
            leftIcon={<Mail className="h-4 w-4" />}
          />
          <Input
            label="School Phone"
            type="tel"
            value={form.school_phone}
            onChange={set("school_phone")}
            placeholder="+234 800 000 0000"
            leftIcon={<Phone className="h-4 w-4" />}
          />
          <Input
            label="Registration Number (RC / SUBEB)"
            type="text"
            value={form.school_reg_number}
            onChange={set("school_reg_number")}
            placeholder="RC 789012"
            leftIcon={<FileText className="h-4 w-4" />}
          />

          <LocationFields
            isNigeria
            showCountry={false}
            statesData={statesData}
            lgasData={schoolLgasData}
            wardsData={[]}
            unitsData={[]}
            stateId={form.school_state_id}
            lgaId={form.school_lga_id}
            wardId=""
            unitId=""
            stateProvince=""
            country="Nigeria"
            address={form.school_address}
            onStateChange={(v) => setVal("school_state_id", v)}
            onLgaChange={(v) => setVal("school_lga_id", v)}
            onWardChange={() => {}}
            onUnitChange={() => {}}
            onStateProvinceChange={() => {}}
            onAddressChange={(v) => setVal("school_address", v)}
            label="School Location"
          />
        </div>
      )}

      {/* ── Step 5: Password ──────────────────────────────────────────────── */}
      {currentStep?.id === "password" && (
        <div className="space-y-4">
          <Input
            label="Password"
            type={show ? "text" : "password"}
            value={form.password}
            onChange={set("password")}
            placeholder="Min. 8 characters"
            leftIcon={<Lock className="h-4 w-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="text-gray-400 hover:text-gray-600"
              >
                {show ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            }
            required
          />
          <Input
            label="Confirm Password"
            type={show ? "text" : "password"}
            value={form.password_confirmation}
            onChange={set("password_confirmation")}
            placeholder="Re-enter password"
            leftIcon={<Lock className="h-4 w-4" />}
            required
          />

          {form.password &&
            form.password_confirmation &&
            form.password !== form.password_confirmation && (
              <div className="flex items-center gap-1.5 text-red-600 text-xs">
                <AlertCircle className="h-3.5 w-3.5" />
                Passwords do not match
              </div>
            )}

          {/* Summary */}
          <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-2 text-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              Summary
            </p>
            <div className="flex justify-between">
              <span className="text-gray-500">Name</span>
              <span className="font-medium">{form.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Role</span>
              <span className="font-medium capitalize">
                {form.role.replace(/_/g, " ")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Country</span>
              <span className="font-medium">{form.country}</span>
            </div>
            {form.nin_verified && (
              <div className="flex justify-between">
                <span className="text-gray-500">NIN</span>
                <span className="font-medium text-green-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Verified
                </span>
              </div>
            )}
            {form.school_name && (
              <div className="flex justify-between">
                <span className="text-gray-500">School</span>
                <span className="font-medium">{form.school_name}</span>
              </div>
            )}
            {form.school_subdomain && (
              <div className="flex justify-between">
                <span className="text-gray-500">Subdomain</span>
                <span className="font-medium text-brand">
                  {form.school_subdomain}.{APP_DOMAIN}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Privacy Policy & Terms Agreement (only on last step) */}
      {isLastStep && (
        <div className="mt-6 flex items-start gap-2">
          <input
            id="privacy-terms-agree"
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1 accent-brand h-4 w-4 border-gray-300 rounded"
            required
          />
          <label
            htmlFor="privacy-terms-agree"
            className="text-sm text-gray-600 dark:text-gray-300 select-none"
          >
            By signing up, you agree to our{" "}
            <Link
              href="/privacy-policy"
              target="_blank"
              className="text-brand underline"
            >
              Privacy Policy
            </Link>{" "}
            and{" "}
            <Link
              href="/terms-and-conditions"
              target="_blank"
              className="text-brand underline"
            >
              Terms &amp; Conditions
            </Link>
            .
          </label>
        </div>
      )}

      {/* Navigation */}
      <div
        className={cn(
          "flex gap-3 mt-8",
          stepIdx === 0 ? "justify-end" : "justify-between",
        )}
      >
        {stepIdx > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setStepIdx((i) => i - 1)}
            leftIcon={<ChevronLeft className="h-4 w-4" />}
          >
            Back
          </Button>
        )}
        <Button
          type="button"
          onClick={handleNext}
          loading={registerMutation.isPending}
          rightIcon={
            isLastStep ? undefined : <ChevronRight className="h-4 w-4" />
          }
          className={cn(!isLastStep && "ml-auto")}
        >
          {isLastStep ? "Create Account" : "Continue"}
        </Button>
      </div>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </Card>
  );
}
