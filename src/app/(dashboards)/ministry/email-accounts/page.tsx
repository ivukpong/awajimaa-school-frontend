"use client";
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { StatCard } from "@/components/ui/StatCard";
import { Table, type Column } from "@/components/ui/Table";
import {
  AtSign,
  Plus,
  ShieldOff,
  ShieldCheck,
  Trash2,
  X,
  Mail,
  Users,
  User,
  Shield,
} from "lucide-react";
import {
  useEmailAccounts,
  useCreateEmailAccount,
  useUpdateEmailAccount,
  useDeleteEmailAccount,
  type SchoolEmailAccount,
  type EmailAccountType,
  type EmailAccountStatus,
} from "@/hooks/useEmailAccounts";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { get, patch } from "@/lib/api";
import toast from "react-hot-toast";

const typeColors: Record<EmailAccountType, string> = {
  admin: "bg-red-100 text-red-800",
  staff: "bg-blue-100 text-blue-800",
  student: "bg-green-100 text-green-800",
};

const typeIcons: Record<EmailAccountType, React.ReactNode> = {
  admin: <Shield className="h-4 w-4" />,
  staff: <Users className="h-4 w-4" />,
  student: <User className="h-4 w-4" />,
};

const emptyForm = {
  email_address: "",
  account_type: "staff" as EmailAccountType,
  user_id: "",
};

type FilterTab = "all" | EmailAccountType;

export default function EmailAccountsPage() {
  const [tab, setTab] = useState<FilterTab>("all");
  const [showModal, setShowModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SchoolEmailAccount | null>(
    null,
  );
  const [form, setForm] = useState(emptyForm);
  const [emailDomain, setEmailDomain] = useState("");
  const [domainInput, setDomainInput] = useState("");
  const [emailUsername, setEmailUsername] = useState("");

  const queryClient = useQueryClient();

  const { data: domainData } = useQuery({
    queryKey: ["ministry-domain"],
    queryFn: () => get("/ministry/domain"),
  });

  useEffect(() => {
    const domain = (domainData as any)?.email_domain ?? "";
    if (domain) {
      setEmailDomain(domain);
      setDomainInput(domain);
    }
  }, [domainData]);

  const domainMutation = useMutation({
    mutationFn: (domain: string) =>
      patch("/ministry/domain", { email_domain: domain }),
    onSuccess: (data: any) => {
      const saved = data?.email_domain ?? domainInput;
      setEmailDomain(saved);
      toast.success("Domain saved");
      queryClient.invalidateQueries({ queryKey: ["ministry-domain"] });
    },
    onError: () => toast.error("Failed to save domain"),
  });

  const filters = tab !== "all" ? { account_type: tab } : undefined;
  const { data: response, isLoading } = useEmailAccounts(filters);
  const createAccount = useCreateEmailAccount();
  const updateAccount = useUpdateEmailAccount();
  const deleteAccount = useDeleteEmailAccount();

  const accounts: SchoolEmailAccount[] = (response as any)?.data?.data ?? [];

  // Stats derived from all accounts (no filter applied)
  const { data: allResponse } = useEmailAccounts();
  const allAccounts: SchoolEmailAccount[] =
    (allResponse as any)?.data?.data ?? [];
  const totalCount = allAccounts.length;
  const activeCount = allAccounts.filter((a) => a.status === "active").length;
  const suspendedCount = allAccounts.filter(
    (a) => a.status === "suspended",
  ).length;
  const adminCount = allAccounts.filter(
    (a) => a.account_type === "admin",
  ).length;

  function openCreate() {
    setForm(emptyForm);
    setEmailUsername("");
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setForm(emptyForm);
    setEmailUsername("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const emailAddress = emailDomain
      ? `${emailUsername}@${emailDomain}`
      : form.email_address;
    const payload: Parameters<typeof createAccount.mutateAsync>[0] = {
      email_address: emailAddress,
      account_type: form.account_type,
    };
    if (form.user_id) payload.user_id = Number(form.user_id);
    try {
      await createAccount.mutateAsync(payload);
      toast.success("Email account created");
      closeModal();
    } catch {
      toast.error("Failed to create email account");
    }
  }

  async function toggleStatus(account: SchoolEmailAccount) {
    const newStatus: EmailAccountStatus =
      account.status === "active" ? "suspended" : "active";
    try {
      await updateAccount.mutateAsync({ id: account.id, status: newStatus });
      toast.success(
        newStatus === "active" ? "Account activated" : "Account suspended",
      );
    } catch {
      toast.error("Failed to update status");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteAccount.mutateAsync(deleteTarget.id);
      toast.success("Email account deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete email account");
    }
  }

  const columns: Column<SchoolEmailAccount>[] = [
    {
      key: "email_address",
      header: "Email Address",
      render: (a) => (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-gray-400 shrink-0" />
          <span className="font-medium">{a.email_address}</span>
        </div>
      ),
    },
    {
      key: "account_type",
      header: "Type",
      render: (a) => (
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-0.5 ${typeColors[a.account_type]}`}
        >
          {typeIcons[a.account_type]}
          {a.account_type.charAt(0).toUpperCase() + a.account_type.slice(1)}
        </span>
      ),
    },
    {
      key: "user_id",
      header: "Linked User",
      render: (a) => (
        <span className="text-sm text-gray-600">
          {a.user?.name ?? <span className="text-gray-400 italic">—</span>}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (a) => (
        <Badge
          className={
            a.status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-gray-100 text-gray-600"
          }
        >
          {a.status === "active" ? "Active" : "Suspended"}
        </Badge>
      ),
    },
    {
      key: "created_at",
      header: "Created",
      render: (a) =>
        new Date(a.created_at).toLocaleDateString("en-NG", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
    },
    {
      key: "id",
      header: "Actions",
      render: (a) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleStatus(a)}
            title={a.status === "active" ? "Suspend" : "Activate"}
            className="p-1.5 rounded hover:bg-gray-100 transition-colors"
          >
            {a.status === "active" ? (
              <ShieldOff className="h-4 w-4 text-amber-500" />
            ) : (
              <ShieldCheck className="h-4 w-4 text-green-600" />
            )}
          </button>
          <button
            onClick={() => setDeleteTarget(a)}
            title="Delete"
            className="p-1.5 rounded hover:bg-gray-100 transition-colors"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </button>
        </div>
      ),
    },
  ];

  const tabs: { value: FilterTab; label: string }[] = [
    { value: "all", label: "All" },
    { value: "admin", label: "Admin" },
    { value: "staff", label: "Staff" },
    { value: "student", label: "Student" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AtSign className="h-6 w-6 text-brand" />
            Email Accounts
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Manage school email accounts for staff, students, and administrators
          </p>
        </div>
        <Button onClick={openCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Account
        </Button>
      </div>

      {/* Domain Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle>Email Domain Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-3">
            Set the email domain for ministry email accounts (e.g.
            cross-river.edu.ng).
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 font-medium">@</span>
            <input
              className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm"
              placeholder="cross-river.edu.ng"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
            />
            <Button
              onClick={() => domainMutation.mutate(domainInput)}
              disabled={domainMutation.isPending || !domainInput.trim()}
            >
              {domainMutation.isPending ? "Saving..." : "Save Domain"}
            </Button>
          </div>
          {emailDomain && (
            <p className="text-xs text-green-600 mt-2">
              Active domain: @{emailDomain}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Accounts"
          value={totalCount}
          icon={<AtSign className="h-5 w-5" />}
        />
        <StatCard
          title="Active"
          value={activeCount}
          icon={<ShieldCheck className="h-5 w-5" />}
        />
        <StatCard
          title="Suspended"
          value={suspendedCount}
          icon={<ShieldOff className="h-5 w-5" />}
        />
        <StatCard
          title="Admin Accounts"
          value={adminCount}
          icon={<Shield className="h-5 w-5" />}
        />
      </div>

      {/* Table Card */}
      <Card>
        <CardHeader>
          <CardTitle>Email Accounts</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filter tabs */}
          <div className="flex gap-1 mb-4 border-b">
            {tabs.map((t) => (
              <button
                key={t.value}
                onClick={() => setTab(t.value)}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  tab === t.value
                    ? "border-brand text-brand"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <Table<SchoolEmailAccount>
            keyField="id"
            columns={columns}
            data={accounts}
            loading={isLoading}
            emptyMessage="No email accounts found"
          />
        </CardContent>
      </Card>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold">New Email Account</h2>
              <button onClick={closeModal}>
                <X className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                {emailDomain ? (
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 text-sm focus:outline-none"
                      placeholder="username"
                      value={emailUsername}
                      onChange={(e) => setEmailUsername(e.target.value)}
                      required
                    />
                    <span className="px-3 py-2 text-sm bg-gray-50 border-l border-gray-300 text-gray-500">
                      @{emailDomain}
                    </span>
                  </div>
                ) : (
                  <Input
                    type="email"
                    value={form.email_address}
                    onChange={(e) =>
                      setForm({ ...form, email_address: e.target.value })
                    }
                    placeholder="user@school.edu.ng"
                    required
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Account Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.account_type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      account_type: e.target.value as EmailAccountType,
                    })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
                  required
                >
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                  <option value="student">Student</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Linked User ID{" "}
                  <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <Input
                  type="number"
                  value={form.user_id}
                  onChange={(e) =>
                    setForm({ ...form, user_id: e.target.value })
                  }
                  placeholder="Leave blank if not linking to a user"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={createAccount.isPending}
                >
                  {createAccount.isPending ? "Creating…" : "Create Account"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={closeModal}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6 space-y-4">
            <h2 className="text-lg font-semibold">Delete Email Account</h2>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete{" "}
              <span className="font-medium text-gray-900">
                {deleteTarget.email_address}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="danger"
                className="flex-1"
                onClick={handleDelete}
                disabled={deleteAccount.isPending}
              >
                {deleteAccount.isPending ? "Deleting…" : "Delete"}
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
