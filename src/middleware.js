import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/authEdge";

const PUBLIC_POST_API_PREFIXES = [
  "/api/auth/",
  "/api/comments",
  "/api/contact",
  "/api/poll",
  "/api/newsletter",
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
  matcher: ["/admin/:path*", "/api/:path*"],
};
