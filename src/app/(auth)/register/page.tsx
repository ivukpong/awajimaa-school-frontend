"use client";

import { useState, useEffect } from "react";
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

const ROLES = [
  { value: "school_admin", label: "School Administrator" },
  { value: "teacher", label: "Teacher" },
  { value: "parent", label: "Parent / Guardian" },
  { value: "sponsor", label: "Sponsor" },
  { value: "revenue_collector", label: "Revenue Collector" },
  { value: "state_regulator", label: "Regulator — State Agency" },
  { value: "lga_regulator", label: "Regulator — LGA Agency" },
];

const SELECT_CLS =
  "block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 " +
  "focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent " +
  "dark:border-gray-600 dark:bg-gray-800 dark:text-white";

const SELECT_WITH_ICON_CLS = cn(SELECT_CLS, "pl-10");

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

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [show, setShow] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    dial_code: NIGERIA.dialCode, // "+234"
    country: NIGERIA.name, // pre-select Nigeria
    state_id: "", // Nigeria state
    state_province: "", // non-Nigeria free text
    lga_id: "",
    ward_id: "",
    unit_id: "",
    role: "",
    password: "",
    password_confirmation: "",
  });

  const isNigeria = form.country === "Nigeria";

  // Fetch Nigeria states (only when Nigeria selected)
  const { data: statesData } = useQuery<NigeriaState[]>({
    queryKey: ["ng-states"],
    queryFn: () => get<NigeriaState[]>("/states").then((r) => r.data),
    staleTime: Infinity,
  });

  // Fetch LGAs whenever a state is chosen
  const { data: lgasData } = useQuery<NigeriaLga[]>({
    queryKey: ["ng-lgas", form.state_id],
    queryFn: () =>
      get<NigeriaLga[]>(`/lgas?state_id=${form.state_id}`).then((r) => r.data),
    enabled: isNigeria && !!form.state_id,
    staleTime: Infinity,
  });

  // Fetch wards when LGA is selected
  const { data: wardsData } = useQuery<NigeriaWard[]>({
    queryKey: ["ng-wards", form.lga_id],
    queryFn: () =>
      get<NigeriaWard[]>(`/wards?lga_id=${form.lga_id}`).then((r) => r.data),
    enabled: isNigeria && !!form.lga_id,
    staleTime: Infinity,
  });

  // Fetch units when ward is selected
  const { data: unitsData } = useQuery<NigeriaUnit[]>({
    queryKey: ["ng-units", form.ward_id],
    queryFn: () =>
      get<NigeriaUnit[]>(`/units?ward_id=${form.ward_id}`).then((r) => r.data),
    enabled: isNigeria && !!form.ward_id,
    staleTime: Infinity,
  });

  // Reset location fields when country changes
  useEffect(() => {
    setForm((f) => ({ ...f, state_id: "", state_province: "", lga_id: "", ward_id: "", unit_id: "" }));
  }, [form.country]);

  // Reset LGA/ward/unit when state changes
  useEffect(() => {
    setForm((f) => ({ ...f, lga_id: "", ward_id: "", unit_id: "" }));
  }, [form.state_id]);

  // Reset ward/unit when LGA changes
  useEffect(() => {
    setForm((f) => ({ ...f, ward_id: "", unit_id: "" }));
  }, [form.lga_id]);

  // Reset unit when ward changes
  useEffect(() => {
    setForm((f) => ({ ...f, unit_id: "" }));
  }, [form.ward_id]);

  const registerMutation = useMutation({
    mutationFn: (payload: Record<string, string>) =>
      post<{ token: string; user: any }>("/auth/register", payload),
    onSuccess: (res) => {
      // Backend returns flat { token, user } — not wrapped in ApiResponse.data
      const result = res as unknown as { token: string; user: any };
      Cookies.set("auth_token", result.token, {
        expires: 7,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });
      setAuth(result.token, result.user);
      toast.success("Account created!");
      router.replace(
        `/${result.user.role?.replaceAll("_", "-") ?? "dashboard"}`,
      );
    },
    onError: (err: any) =>
      toast.error(err?.response?.data?.message ?? "Registration failed"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, string> = {
      name: form.name,
      email: form.email,
      phone: form.dial_code + form.phone,
      country_code: form.dial_code,
      country: form.country,
      role: form.role,
      password: form.password,
      password_confirmation: form.password_confirmation,
    };
    if (isNigeria) {
      if (form.state_id) payload.state_id = form.state_id;
      if (form.lga_id) payload.lga_id = form.lga_id;
      if (form.ward_id) payload.ward_id = form.ward_id;
      if (form.unit_id) payload.unit_id = form.unit_id;
    } else if (form.state_province) {
      payload.state_province = form.state_province;
    }
    const { name: deviceName, type: deviceType } = getDeviceInfo();
    payload.device_id = getDeviceId();
    payload.device_name = deviceName;
    payload.device_type = deviceType;
    registerMutation.mutate(payload);
  };

  const set =
    (k: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [k]: e.target.value }));

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

      <form className="space-y-4" onSubmit={handleSubmit}>
        {/* Full Name */}
        <Input
          label="Full Name"
          type="text"
          value={form.name}
          onChange={set("name")}
          placeholder="John Doe"
          leftIcon={<User className="h-4 w-4" />}
          required
        />

        {/* Email */}
        <Input
          label="Email Address"
          type="email"
          value={form.email}
          onChange={set("email")}
          placeholder="john@example.com"
          leftIcon={<Mail className="h-4 w-4" />}
          required
        />

        {/* Phone + Dial Code */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Phone Number
          </label>
          <div className="flex gap-2">
            {/* Country dial-code picker */}
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
            {/* Phone number */}
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

        {/* ── Location ───────────────────────────────────────────────────── */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Location
          </p>

          {/* Country */}
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
                value={form.country}
                onChange={set("country")}
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

          {/* State / Province */}
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
                  value={form.state_id}
                  onChange={set("state_id")}
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
                  value={form.state_province}
                  onChange={set("state_province")}
                  placeholder="e.g. California"
                  className={cn(SELECT_CLS, "pl-10")}
                />
              )}
            </div>
          </div>

          {/* LGA (Nigeria only) */}
          {isNigeria && form.state_id && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Local Government Area (LGA)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                  <MapPin className="h-4 w-4" />
                </div>
                <select
                  value={form.lga_id}
                  onChange={set("lga_id")}
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

          {/* Ward (Nigeria only — shown when LGA selected and wards exist) */}
          {isNigeria && form.lga_id && (wardsData ?? []).length > 0 && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Ward
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                  <MapPin className="h-4 w-4" />
                </div>
                <select
                  value={form.ward_id}
                  onChange={set("ward_id")}
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

          {/* Polling Unit (Nigeria only — shown when ward selected and units exist) */}
          {isNigeria && form.ward_id && (unitsData ?? []).length > 0 && (
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Polling Unit
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 pointer-events-none">
                  <MapPin className="h-4 w-4" />
                </div>
                <select
                  value={form.unit_id}
                  onChange={set("unit_id")}
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

        {/* Password */}
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

        <Button
          type="submit"
          className="w-full"
          size="lg"
          loading={registerMutation.isPending}
        >
          Create Account
        </Button>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
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
