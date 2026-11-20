import { NextResponse } from "next/server";
import { authenticateNewsroomUser } from "@/lib/cmsDb";
import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
  signSessionToken,
} from "@/lib/authEdge";

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body || {};

    const result = await authenticateNewsroomUser(email, password);
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    const token = await signSessionToken({
      id: result.user.id,
      email: result.user.email,
      full_name_en: result.user.full_name_en,
      full_name_ur: result.user.full_name_ur,
      byline_name: result.user.byline_name,
      designation_en: result.user.designation_en,
      roles: result.user.roles,
      desk_scope: result.user.desk_scope,
    });

    const res = NextResponse.json({ success: true, user: result.user });
    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: SESSION_TTL_SECONDS,
    });
    return res;
  } catch (error) {
    console.error("Auth login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
