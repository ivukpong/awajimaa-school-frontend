"use client";
import React, { useState } from "react";
import { Save, School, Bell, Lock, Palette } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import toast from "react-hot-toast";

type Tab = "school" | "notifications" | "security" | "appearance";

export default function SchoolAdminSettingsPage() {
  const [tab, setTab] = useState<Tab>("school");

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "school", label: "School Info", icon: School },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Lock },
    { id: "appearance", label: "Appearance", icon: Palette },
  ];

  const save = () => toast.success("Settings saved");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          School Settings
        </h1>
        <p className="text-sm text-gray-500">
          Configure your school branch preferences
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        <nav className="space-y-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${tab === id ? "bg-brand text-white" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </button>
          ))}
        </nav>

        <div className="lg:col-span-3">
          {tab === "school" && (
            <Card>
              <CardHeader>
                <CardTitle>School Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "School Name", placeholder: "Greenfield Academy" },
                  { label: "Branch Name", placeholder: "Main Campus" },
                  { label: "Phone Number", placeholder: "+234 800 000 0000" },
                  {
                    label: "Email Address",
                    placeholder: "admin@school.edu.ng",
                  },
                  {
                    label: "Physical Address",
                    placeholder: "12 Education Road, Lagos",
                  },
                  { label: "Website", placeholder: "https://school.edu.ng" },
                ].map(({ label, placeholder }) => (
                  <div key={label}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                      {label}
                    </label>
                    <Input placeholder={placeholder} />
                  </div>
                ))}
                <Button onClick={save} leftIcon={<Save className="h-4 w-4" />}>
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          )}

          {tab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    label: "Email notifications for new enrolments",
                    default: true,
                  },
                  {
                    label: "SMS alerts for fee payment received",
                    default: true,
                  },
                  { label: "Daily attendance summary email", default: false },
                  { label: "Weekly academic report digest", default: true },
                  {
                    label: "Alert when student is marked absent 3+ days",
                    default: true,
                  },
                ].map(({ label, default: d }) => {
                  const [checked, setChecked] = useState(d);
                  return (
                    <label
                      key={label}
                      className="flex items-center justify-between cursor-pointer"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {label}
                      </span>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => setChecked(!checked)}
                        className="rounded text-brand"
                      />
                    </label>
                  );
                })}
                <Button onClick={save} leftIcon={<Save className="h-4 w-4" />}>
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          )}

          {tab === "security" && (
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Current Password
                  </label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    New Password
                  </label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Confirm New Password
                  </label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <Button onClick={save} leftIcon={<Lock className="h-4 w-4" />}>
                  Update Password
                </Button>
              </CardContent>
            </Card>
          )}

          {tab === "appearance" && (
            <Card>
              <CardHeader>
                <CardTitle>Appearance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Theme
                  </label>
                  <div className="flex gap-3">
                    {["System", "Light", "Dark"].map((t) => (
                      <button
                        key={t}
                        className="flex-1 border-2 border-gray-200 dark:border-gray-700 rounded-lg p-3 text-sm font-medium hover:border-brand transition-colors"
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Language
                  </label>
                  <select className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm">
                    <option>English (Nigeria)</option>
                    <option>Yoruba</option>
                    <option>Igbo</option>
                    <option>Hausa</option>
                  </select>
                </div>
                <Button onClick={save} leftIcon={<Save className="h-4 w-4" />}>
                  Save Changes
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
