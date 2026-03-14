import { sanitizeUrl } from '@braintree/sanitize-url';

export function sanitizeHref(u?: string | null): string | null {
    if (!u) return null;
    try {
        const cleaned = sanitizeUrl(u);
        if (!cleaned) return null;
        // sanitize-url may return 'about:blank' for unsafe values; ensure http/https
        const parsed = new URL(cleaned);
        const proto = parsed.protocol.toLowerCase();
        if (proto === 'http:' || proto === 'https:') return parsed.toString();
        return null;
    } catch {
        return null;
    }
}

export function isSafeHref(u?: string | null): boolean {
    return sanitizeHref(u) !== null;
}
