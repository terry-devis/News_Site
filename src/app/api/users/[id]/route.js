import { NextResponse } from "next/server";
import { updateNewsroomUser, deleteNewsroomUser } from "@/lib/cmsDb";
import { requirePermission } from "@/lib/auth";
import {
  SESSION_COOKIE_NAME,
  SESSION_TTL_SECONDS,
  signSessionToken,
} from "@/lib/authEdge";

export const dynamic = "force-dynamic";

export async function PUT(req, context) {
  const { user: sessionUser, errorResponse } = await requirePermission("user.manage");
  if (errorResponse) return errorResponse;

  try {
    const { id } = await context.params;
    const body = await req.json();
    const updates = body?.updates || body || {};

    const updated = await updateNewsroomUser(id, updates);
    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const res = NextResponse.json({ success: true, user: updated });
    if (sessionUser && String(sessionUser.id) === String(updated.id)) {
      const token = await signSessionToken({
        id: updated.id,
        email: updated.email,
        full_name_en: updated.full_name_en,
        full_name_ur: updated.full_name_ur,
        byline_name: updated.byline_name,
        designation_en: updated.designation_en,
        roles: updated.roles,
        desk_scope: updated.desk_scope,
      });
      res.cookies.set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: SESSION_TTL_SECONDS,
      });
    }
    return res;
  } catch (error) {
    console.error("User PUT error:", error);
    const status = error?.statusCode || 500;
    return NextResponse.json({ error: error?.message || "Failed to update user" }, { status });
  }
}

export async function DELETE(_req, context) {
  const { errorResponse } = await requirePermission("user.manage");
  if (errorResponse) return errorResponse;

  try {
    const { id } = await context.params;
    await deleteNewsroomUser(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("User DELETE error:", error);
    const status = error?.statusCode || 500;
    return NextResponse.json({ error: error?.message || "Failed to delete user" }, { status });
  }
}
