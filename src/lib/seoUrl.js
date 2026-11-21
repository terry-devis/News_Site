import { headers } from "next/headers";

const FALLBACK_PUBLIC_SITE = "https://daily-afadiat-site.vercel.app";

/**
 * Resolves the canonical public site origin for sitemaps, RSS, robots.txt,
 * canonical URLs, hreflang alternates, and JSON-LD schema.
 */
export function resolvePublicSiteUrl(req = null) {
  const envUrl = String(process.env.NEXT_PUBLIC_SITE_URL || "")
    .trim()
    .replace(/\/$/, "");
  if (
    envUrl &&
    !envUrl.includes("localhost") &&
    !envUrl.includes("127.0.0.1") &&
    !envUrl.includes("daily-insaaf")
  ) {
    return envUrl;
  }

  try {
    let host = "";
    let proto = "https";
    if (req?.headers) {
      host =
        req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
      proto =
        req.headers.get("x-forwarded-proto") ||
        (host.startsWith("localhost") ? "http" : "https");
    } else {
      const h = headers();
      host = h.get("x-forwarded-host") || h.get("host") || "";
      proto =
        h.get("x-forwarded-proto") ||
        (host.startsWith("localhost") ? "http" : "https");
    }
    if (host && !host.includes("admin")) {
      return `${proto}://${host}`;
    }
  } catch {
    // headers() is unavailable outside request context during static build
  }

  return FALLBACK_PUBLIC_SITE;
}
