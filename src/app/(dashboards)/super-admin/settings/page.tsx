"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Settings, Shield, Bell, Palette, Database, Globe } from "lucide-react";
import toast from "react-hot-toast";

type Tab = "general" | "security" | "notifications" | "appearance";

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "general", label: "General", icon: <Settings className="h-4 w-4" /> },
  { id: "security", label: "Security", icon: <Shield className="h-4 w-4" /> },
  {
    id: "notifications",
    label: "Notifications",
    icon: <Bell className="h-4 w-4" />,
  },
  {
    id: "appearance",
    label: "Appearance",
    icon: <Palette className="h-4 w-4" />,
  },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("general");
  const [saving, setSaving] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success("Settings saved");
    }, 800);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage platform-wide configuration
        </p>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Tabs */}
        <nav className="w-48 shrink-0 space-y-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${
                  activeTab === t.id
                    ? "bg-brand text-white"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                }`}
            >
              {t.icon}
              {t.label}
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <form onSubmit={handleSave}>
            {activeTab === "general" && (
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    label="Platform Name"
                    defaultValue="Awajimaa School"
                    name="platform_name"
                  />
                  <Input
                    label="Support Email"
                    type="email"
                    defaultValue="support@awajimaa.ng"
                    name="support_email"
                  />
                  <Input
                    label="Support Phone"
                    defaultValue="+234 000 000 0000"
                    name="support_phone"
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Default Country
                    </label>
                    <select
                      name="country"
                      defaultValue="NG"
                      className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="NG">Nigeria</option>
                    </select>
                  </div>
                  <div className="pt-2">
                    <Button type="submit" loading={saving}>
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "security" && (
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Two-Factor Authentication
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Require 2FA for admin accounts
                      </p>
                    </div>
                    <Badge variant="red">Disabled</Badge>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Session Timeout
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Auto logout after inactivity
                      </p>
                    </div>
                    <select
                      name="session_timeout"
                      defaultValue="60"
                      className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    >
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="120">2 hours</option>
                      <option value="480">8 hours</option>
                    </select>
                  </div>
                  <Input
                    label="Minimum Password Length"
                    type="number"
                    defaultValue="8"
                    min="6"
                    max="32"
                    name="min_password_length"
                  />
                  <div className="pt-2">
                    <Button type="submit" loading={saving}>
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "notifications" && (
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      label: "New school registration",
                      desc: "Notify when a new school is added",
                    },
                    {
                      label: "Payment received",
                      desc: "Notify on successful school charge payments",
                    },
                    {
                      label: "Verification form submitted",
                      desc: "Notify regulators of new submissions",
                    },
                    {
                      label: "User flagged",
                      desc: "Notify when a user account is flagged",
                    },
                  ].map((item) => (
                    <label
                      key={item.label}
                      className="flex items-start gap-3 py-3 border-b border-gray-100 dark:border-gray-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        defaultChecked
                        className="mt-0.5 rounded border-gray-300 accent-brand"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.label}
                        </p>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                    </label>
                  ))}
                  <div className="pt-2">
                    <Button type="submit" loading={saving}>
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {activeTab === "appearance" && (
              <Card>
                <CardHeader>
                  <CardTitle>Appearance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Brand Color
                    </p>
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg border border-gray-200"
                        style={{ background: "#1B4F72" }}
                      />
                      <Input
                        defaultValue="#1B4F72"
                        name="brand_color"
                        wrapperClassName="w-40"
                      />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Default Theme
                    </p>
                    <div className="flex gap-3">
                      {["Light", "Dark", "System"].map((t) => (
                        <label
                          key={t}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="default_theme"
                            value={t.toLowerCase()}
                            defaultChecked={t === "Light"}
                            className="accent-brand"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {t}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button type="submit" loading={saving}>
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
