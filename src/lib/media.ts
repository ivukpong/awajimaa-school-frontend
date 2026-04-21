const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

function getApiOrigin(): string {
    if (!API_URL) return "";
    try {
        return new URL(API_URL).origin;
    } catch {
        return "";
    }
}

// Normalizes asset URLs coming from the API so images render in local and deployed setups.
export function normalizeApiAssetUrl(input?: string | null): string | undefined {
    if (!input) return undefined;
    const value = input.trim();
    if (!value) return undefined;

    if (
        value.startsWith("data:") ||
        value.startsWith("blob:") ||
        value.startsWith("file:")
    ) {
        return value;
    }

    const apiOrigin = getApiOrigin();

    if (/^https?:\/\//i.test(value)) {
        if (!apiOrigin) return value;
        try {
            const current = new URL(value);
            if (current.hostname === "localhost" || current.hostname === "127.0.0.1") {
                const api = new URL(apiOrigin);
                return `${api.origin}${current.pathname}${current.search}${current.hash}`;
            }
            return value;
        } catch {
            return value;
        }
    }

    if (value.startsWith("/")) {
        return apiOrigin ? `${apiOrigin}${value}` : value;
    }

    return apiOrigin ? `${apiOrigin}/${value}` : value;
}
