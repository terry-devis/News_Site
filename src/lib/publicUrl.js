const FALLBACK_PUBLIC_VERCEL_URL = "https://daily-afadiat-site.vercel.app";

export function getPublicSiteBaseUrl() {
  const raw = String(process.env.NEXT_PUBLIC_SITE_URL || "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\/$/, "");

  if (raw && !raw.includes("localhost") && !raw.includes("127.0.0.1")) {
    return raw;
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname || "";
    if (!host.includes("localhost") && !host.includes("127.0.0.1")) {
      return FALLBACK_PUBLIC_VERCEL_URL;
    }
  }

  if ((process.env.NEXT_PUBLIC_APP_ROLE || "").toLowerCase() === "admin") {
    return FALLBACK_PUBLIC_VERCEL_URL;
  }

  return "";
}

export function toPublicSiteUrl(path = "/") {
  if (!path) return getPublicSiteBaseUrl() || "/";
  if (/^https?:\/\//i.test(path)) return path;
  const base = getPublicSiteBaseUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return base ? `${base}${cleanPath}` : cleanPath;
}
