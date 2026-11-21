import { revalidatePath } from "next/cache";

/**
 * Revalidate paths on the current deployment AND (when running as separate admin
 * deployment) trigger on-demand revalidation on the public Vercel site.
 */
export async function revalidateAll(paths = ["/"]) {
  const uniquePaths = [...new Set(paths.filter((p) => typeof p === "string" && p.startsWith("/")))];

  for (const p of uniquePaths) {
    try {
      revalidatePath(p);
    } catch {}
  }

  const publicUrl = process.env.PUBLIC_SITE_REVALIDATE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  const secret = process.env.REVALIDATE_SECRET;
  const appRole = (process.env.NEXT_PUBLIC_APP_ROLE || "all").toLowerCase();

  if (appRole === "admin" && publicUrl && secret) {
    const endpoint = `${publicUrl.replace(/\/$/, "")}/api/revalidate`;
    try {
      await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-revalidate-secret": secret,
        },
        body: JSON.stringify({ paths: uniquePaths }),
        signal: AbortSignal.timeout(4000),
      });
    } catch (err) {
      console.warn("Public site revalidation webhook failed:", err?.message || err);
    }
  }
}
