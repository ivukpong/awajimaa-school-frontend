"use client";
import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import { StatCard } from "@/components/ui/StatCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  Package,
  AlertTriangle,
  ShoppingCart,
  Layers,
  ArrowRight,
  PackageCheck,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { InventoryItem, PurchaseOrder } from "@/types/inventory";

const PO_PIPELINE: {
  status: string;
  label: string;
  color: "gray" | "yellow" | "blue" | "green" | "red";
  icon: React.ReactNode;
}[] = [
  {
    status: "draft",
    label: "Draft",
    color: "gray",
    icon: <FileText className="h-3.5 w-3.5" />,
  },
  {
    status: "submitted",
    label: "Submitted",
    color: "yellow",
    icon: <Clock className="h-3.5 w-3.5" />,
  },
  {
    status: "approved",
    label: "Approved",
    color: "blue",
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
  },
  {
    status: "received",
    label: "Received",
    color: "green",
    icon: <PackageCheck className="h-3.5 w-3.5" />,
  },
  {
    status: "cancelled",
    label: "Cancelled",
    color: "red",
    icon: <XCircle className="h-3.5 w-3.5" />,
  },
];

const poStatusVariant: Record<
  string,
  "gray" | "yellow" | "blue" | "green" | "red"
> = {
  draft: "gray",
  submitted: "yellow",
  approved: "blue",
  received: "green",
  cancelled: "red",
};

export default function StoreDashboardPage() {
  const { data: summaryRaw } = useQuery({
    queryKey: ["inventory-summary"],
    queryFn: () =>
      get<any>("/inventory/summary").then((r) => r.data?.data ?? {}),
  });

  const { data: lowStockRaw } = useQuery({
    queryKey: ["inventory-low-stock"],
    queryFn: () =>
      get<any>("/inventory?low_stock=1&per_page=10").then(
        (r) => r.data?.data?.data ?? [],
      ),
  });

  const { data: poRaw } = useQuery({
    queryKey: ["purchase-orders-store"],
    queryFn: () =>
      get<any>("/purchase-orders?per_page=20").then(
        (r) => r.data?.data ?? { data: [] },
      ),
  });

  const summary = (summaryRaw ?? {}) as Record<string, unknown>;
  const lowStockItems: InventoryItem[] = Array.isArray(lowStockRaw)
    ? lowStockRaw
    : [];
  const allOrders: PurchaseOrder[] = Array.isArray((poRaw as any)?.data)
    ? (poRaw as any).data
    : [];
  const recentOrders = allOrders.slice(0, 6);

  const pipelineCounts = PO_PIPELINE.map((p) => ({
    ...p,
    count: allOrders.filter((o) => o.status === p.status).length,
  }));

  const categories = Array.isArray(summary.categories)
    ? (summary.categories as {
        id: number;
        name: string;
        items_count?: number;
      }[])
    : [];

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Store &amp; Inventory
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time overview of school assets and procurement
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/school-admin/inventory">
            <Button variant="outline" size="sm">
              <Package className="h-4 w-4 mr-2" />
              Manage Items
            </Button>
          </Link>
          <Link href="/school-admin/purchase-orders">
            <Button size="sm">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Purchase Orders
            </Button>
          </Link>
        </div>
      </div>

      {/* ── Summary Stats ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Items"
          value={(summary.total_items as number) ?? 0}
          icon={<Package className="h-5 w-5" />}
          color="blue"
        />
        <StatCard
          title="Stock Value"
          value={formatCurrency((summary.total_value as number) ?? 0)}
          icon={<Layers className="h-5 w-5" />}
          color="green"
        />
        <StatCard
          title="Low Stock"
          value={(summary.low_stock as number) ?? 0}
          icon={<AlertTriangle className="h-5 w-5" />}
          color="yellow"
        />
        <StatCard
          title="Categories"
          value={categories.length}
          icon={<Layers className="h-5 w-5" />}
          color="purple"
        />
      </div>

      {/* ── Purchase Order Pipeline ─────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Order Pipeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-stretch gap-2 overflow-x-auto">
            {pipelineCounts.map((p, i) => (
              <React.Fragment key={p.status}>
                <div className="flex-1 min-w-[100px] flex flex-col items-center gap-2 p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
                  <Badge variant={p.color}>
                    <span className="flex items-center gap-1">
                      {p.icon}
                      {p.label}
                    </span>
                  </Badge>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {p.count}
                  </p>
                </div>
                {i < pipelineCounts.length - 1 && (
                  <div className="flex items-center text-gray-300 dark:text-gray-600 shrink-0">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Two-column section ──────────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
                Low Stock Alerts
              </CardTitle>
              <Link href="/school-admin/inventory">
                <Button variant="ghost" size="sm">
                  View all
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {lowStockItems.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">
                All items are adequately stocked ✓
              </p>
            ) : (
              <div className="space-y-2">
                {lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg border border-yellow-100 dark:border-yellow-900/30 bg-yellow-50 dark:bg-yellow-900/10 px-3 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {item.category?.name ?? "—"} · {item.unit}
                      </p>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-sm font-bold text-red-600">
                        {item.quantity_in_stock} left
                      </p>
                      <p className="text-xs text-gray-500">
                        min {item.reorder_level}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Purchase Orders */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Purchase Orders</CardTitle>
              <Link href="/school-admin/purchase-orders">
                <Button variant="ghost" size="sm">
                  View all
                  <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">
                No purchase orders yet
              </p>
            ) : (
              <div className="space-y-2">
                {recentOrders.map((po) => (
                  <div
                    key={po.id}
                    className="flex items-center justify-between rounded-lg border border-gray-100 dark:border-gray-700 px-3 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
                        {po.po_number}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {po.supplier_name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-4">
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(po.total_amount)}
                      </span>
                      <Badge variant={poStatusVariant[po.status] ?? "gray"}>
                        {po.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Category Breakdown ──────────────────────────────────────────────── */}
      {categories.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Inventory by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 text-center"
                >
                  <p className="text-xs font-medium text-gray-500 truncate">
                    {cat.name}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                    {cat.items_count ?? 0}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">items</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
