"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, post } from "@/lib/api";
import {
  AlertTriangle,
  MessageCircle,
  CheckCircle2,
  Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { StatCard } from "@/components/ui/StatCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Table, Column } from "@/components/ui/Table";
import { formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface HelpMessage {
  id: number;
  type: "emergency" | "help" | "general";
  subject: string;
  body: string;
  location?: string;
  status: "open" | "acknowledged" | "resolved";
  created_at: string;
  sender?: { id: number; name: string; role: string };
}

const typeBadge: Record<HelpMessage["type"], "red" | "yellow" | "blue"> = {
  emergency: "red",
  help: "yellow",
  general: "blue",
};

const statusBadge: Record<HelpMessage["status"], "red" | "yellow" | "green"> = {
  open: "red",
  acknowledged: "yellow",
  resolved: "green",
};

export default function SecurityDashboard() {
  const qc = useQueryClient();
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("open");

  const { data, isLoading } = useQuery({
    queryKey: ["help-messages"],
    queryFn: () =>
      get<any>("/help-messages").then((r) => r.data?.data ?? r.data ?? []),
    refetchInterval: 30_000, // auto-refresh every 30s
  });

  const { data: dashData } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => get<any>("/dashboard").then((r) => r.data ?? {}),
  });

  const messages: HelpMessage[] = Array.isArray(data) ? data : [];

  const filtered = messages.filter((m) => {
    const matchType = typeFilter === "all" || m.type === typeFilter;
    const matchStatus = statusFilter === "all" || m.status === statusFilter;
    return matchType && matchStatus;
  });

  const acknowledgeMutation = useMutation({
    mutationFn: (id: number) => post(`/help-messages/${id}/acknowledge`, {}),
    onSuccess: () => {
      toast.success("Message acknowledged");
      qc.invalidateQueries({ queryKey: ["help-messages"] });
    },
    onError: () => toast.error("Failed to acknowledge"),
  });

  const resolveMutation = useMutation({
    mutationFn: (id: number) => post(`/help-messages/${id}/resolve`, {}),
    onSuccess: () => {
      toast.success("Message resolved");
      qc.invalidateQueries({ queryKey: ["help-messages"] });
    },
    onError: () => toast.error("Failed to resolve"),
  });

  const d = dashData ?? {};
  const openCount =
    d.open_messages ?? messages.filter((m) => m.status === "open").length;
  const acknowledgedCount =
    d.acknowledged_messages ??
    messages.filter((m) => m.status === "acknowledged").length;
  const emergencyOpen =
    d.emergency_messages ??
    messages.filter((m) => m.type === "emergency" && m.status === "open")
      .length;

  const columns: Column<HelpMessage>[] = [
    {
      key: "type",
      header: "Type",
      render: (row) => (
        <Badge variant={typeBadge[row.type]}>
          {row.type.charAt(0).toUpperCase() + row.type.slice(1)}
        </Badge>
      ),
    },
    {
      key: "subject",
      header: "Subject / Sender",
      render: (row) => (
        <div>
          <p className="font-medium text-gray-900 dark:text-white text-sm">
            {row.subject}
          </p>
          <p className="text-xs text-gray-500">
            {row.sender?.name ?? "Unknown"}
            {row.location ? ` · ${row.location}` : ""}
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <Badge variant={statusBadge[row.status]}>
          {row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "Sent",
      render: (row) => (
        <span className="text-sm text-gray-500">
          {formatDate(row.created_at)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      render: (row) => (
        <div className="flex items-center gap-2 justify-end">
          {row.status === "open" && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => acknowledgeMutation.mutate(row.id)}
              loading={acknowledgeMutation.isPending}
            >
              Acknowledge
            </Button>
          )}
          {row.status === "acknowledged" && (
            <Button
              size="sm"
              onClick={() => resolveMutation.mutate(row.id)}
              loading={resolveMutation.isPending}
            >
              Resolve
            </Button>
          )}
          {row.status === "resolved" && (
            <span className="text-xs text-gray-400 italic">Resolved</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Security Dashboard
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Monitor and respond to help &amp; emergency messages
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Open Messages"
          value={openCount}
          icon={<MessageCircle className="h-5 w-5 text-yellow-500" />}
        />
        <StatCard
          title="Emergency (Open)"
          value={emergencyOpen}
          icon={<AlertTriangle className="h-5 w-5 text-red-500" />}
        />
        <StatCard
          title="Acknowledged"
          value={acknowledgedCount}
          icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="all">All Types</option>
          <option value="emergency">Emergency</option>
          <option value="help">Help</option>
          <option value="general">General</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        >
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {/* Messages table */}
      <Card padding={false}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-red-500" /> Help &amp; Emergency
            Messages
          </CardTitle>
        </CardHeader>
        <Table
          keyField="id"
          columns={columns}
          data={filtered}
          loading={isLoading}
          emptyMessage="No messages found."
        />
      </Card>
    </div>
  );
}
