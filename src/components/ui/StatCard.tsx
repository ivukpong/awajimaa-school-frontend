import React from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    label?: string;
    direction: "up" | "down" | "neutral";
  };
  color?: "blue" | "green" | "red" | "yellow" | "purple" | "indigo";
  className?: string;
}

const colorMap: Record<string, { bg: string; text: string; icon: string }> = {
  blue: {
    bg: "bg-blue-50 dark:bg-blue-900/20",
    text: "text-blue-600 dark:text-blue-400",
    icon: "bg-blue-100 dark:bg-blue-900/40",
  },
  green: {
    bg: "bg-green-50 dark:bg-green-900/20",
    text: "text-green-600 dark:text-green-400",
    icon: "bg-green-100 dark:bg-green-900/40",
  },
  red: {
    bg: "bg-red-50 dark:bg-red-900/20",
    text: "text-red-600 dark:text-red-400",
    icon: "bg-red-100 dark:bg-red-900/40",
  },
  yellow: {
    bg: "bg-yellow-50 dark:bg-yellow-900/20",
    text: "text-yellow-600 dark:text-yellow-400",
    icon: "bg-yellow-100 dark:bg-yellow-900/40",
  },
  purple: {
    bg: "bg-purple-50 dark:bg-purple-900/20",
    text: "text-purple-600 dark:text-purple-400",
    icon: "bg-purple-100 dark:bg-purple-900/40",
  },
  indigo: {
    bg: "bg-indigo-50 dark:bg-indigo-900/20",
    text: "text-indigo-600 dark:text-indigo-400",
    icon: "bg-indigo-100 dark:bg-indigo-900/40",
  },
};

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = "blue",
  className,
}: StatCardProps) {
  const colors = colorMap[color];
  const TrendIcon =
    trend?.direction === "up"
      ? TrendingUp
      : trend?.direction === "down"
        ? TrendingDown
        : Minus;

  return (
    <div
      className={cn(
        "rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              colors.icon,
              colors.text,
            )}
          >
            {icon}
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1 text-xs">
          <TrendIcon
            className={cn(
              "h-3.5 w-3.5",
              trend.direction === "up"
                ? "text-green-500"
                : trend.direction === "down"
                  ? "text-red-500"
                  : "text-gray-400",
            )}
          />
          <span
            className={cn(
              "font-medium",
              trend.direction === "up"
                ? "text-green-600"
                : trend.direction === "down"
                  ? "text-red-600"
                  : "text-gray-500",
            )}
          >
            {trend.value > 0 ? "+" : ""}
            {trend.value}%
          </span>
          {trend.label && (
            <span className="text-gray-500 dark:text-gray-400">
              {trend.label}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
