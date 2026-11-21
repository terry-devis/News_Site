import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/authEdge";

const PUBLIC_POST_API_PREFIXES = [
  "/api/auth/",
  "/api/comments",
  "/api/contact",
  "/api/poll",
  "/api/newsletter",
];

const ADMIN_ONLY_API_PREFIXES = [
  "/api/auth/",
  "/api/users",
  "/api/upload",
  "/api/dashboard",
  "/api/roles",
  "/api/inquiries",
  "/api/notifications",
  "/api/media",
  "/api/settings/email",
];

function isPublicPostApi(pathname) {
  if (PUBLIC_POST_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return true;
  }
  // Reader view counter: /api/articles/[id]/view
  if (/^\/api\/articles\/[^/]+\/view$/.test(pathname)) {
    return true;
  }
  return false;
}

export async function middleware(req) {
  const { pathname, search } = req.nextUrl;
  const appRole = (process.env.NEXT_PUBLIC_APP_ROLE || "all").toLowerCase();

  // Mode 1: Public News Site deployment — block /admin and admin-only APIs
  if (appRole === "public") {
    if (pathname.startsWith("/admin")) {
      const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL;
      if (adminUrl) {
        return NextResponse.redirect(new URL(`${pathname}${search}`, adminUrl));
      }
      return new NextResponse("Not Found", { status: 404 });
    }

    if (pathname.startsWith("/api/")) {
      const method = req.method.toUpperCase();
      if (pathname === "/api/revalidate") {
        return NextResponse.next();
      }
      if (ADMIN_ONLY_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
        return NextResponse.json({ error: "Not Found" }, { status: 404 });
      }
      if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
        if (method === "POST" && isPublicPostApi(pathname) && !pathname.startsWith("/api/auth/")) {
          return NextResponse.next();
        }
        return NextResponse.json({ error: "Forbidden on public deployment" }, { status: 403 });
      }
    }

    return NextResponse.next();
  }

  // Mode 2: Admin Panel deployment — redirect root / to /admin
  if (appRole === "admin" && pathname === "/") {
    return NextResponse.redirect(new URL("/admin", req.url));
  }

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySessionToken(token);

  // 1. Admin UI pages
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      if (session) {
        return NextResponse.redirect(new URL("/admin", req.url));
      }
      return NextResponse.next();
    }

    if (!session) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("next", `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // 2. Admin / Mutating API routes
  if (pathname.startsWith("/api/")) {
    const method = req.method.toUpperCase();

    // Protect sensitive GET endpoints (staff list)
    if (method === "GET" && pathname.startsWith("/api/users")) {
      if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      return NextResponse.next();
    }

    // Protect all mutating methods unless explicitly public
    if (["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
      if (method === "POST" && isPublicPostApi(pathname)) {
        return NextResponse.next();
      }
      if (!session) {
        return NextResponse.json({ error: "Unauthorized — please sign in" }, { status: 401 });
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/admin/:path*", "/api/:path*"],
};
