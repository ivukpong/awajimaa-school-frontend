import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistance, parseISO } from "date-fns";

export function cn(...inputs: ClassValue[]): string {
    return twMerge(clsx(inputs));
}

export function formatCurrency(
    amount: number,
    currency = "NGN",
    locale = "en-NG"
): string {
    return new Intl.NumberFormat(locale, {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
    }).format(amount);
}

export function formatDate(dateStr: string, fmt = "dd MMM yyyy"): string {
    try {
        return format(parseISO(dateStr), fmt);
    } catch {
        return dateStr;
    }
}

export function timeAgo(dateStr: string): string {
    try {
        return formatDistance(parseISO(dateStr), new Date(), { addSuffix: true });
    } catch {
        return dateStr;
    }
}

export function getInitials(name: string): string {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
}

export function generateOTP(length = 6): string {
    return Array.from({ length }, () => Math.floor(Math.random() * 10)).join("");
}

export function statusColor(
    status: string
): "green" | "red" | "yellow" | "blue" | "gray" {
    const map: Record<string, "green" | "red" | "yellow" | "blue" | "gray"> = {
        paid: "green",
        active: "green",
        approved: "green",
        completed: "green",
        present: "green",
        unpaid: "red",
        rejected: "red",
        suspended: "red",
        absent: "red",
        partial: "yellow",
        under_review: "yellow",
        late: "yellow",
        pending: "yellow",
        submitted: "blue",
        scheduled: "blue",
        draft: "gray",
        withdrawn: "gray",
    };
    return map[status] ?? "gray";
}

export function truncate(str: string, maxLen = 60): string {
    return str.length > maxLen ? `${str.slice(0, maxLen)}...` : str;
}

export function buildStudentPublicUrl(token: string): string {
    const base =
        typeof window !== "undefined"
            ? window.location.origin
            : process.env.NEXT_PUBLIC_APP_URL ?? "";
    return `${base}/s/${token}`;
}

export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Convert snake_case role to Title Case display string, e.g. "school_admin" → "School Admin" */
export function formatRole(role: string): string {
    return role
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
}
