import { NextResponse } from "next/server";
import {
  getNewsroomUsers,
  createNewsroomUser,
  updateNewsroomUser,
  resetNewsroomUserPassword,
  deleteNewsroomUser,
} from "@/lib/cmsDb";
import { requirePermission } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const { errorResponse } = await requirePermission("user.view");
  if (errorResponse) return errorResponse;
  try {
    const users = await getNewsroomUsers();
    return NextResponse.json(
      { success: true, users },
      { headers: { "Cache-Control": "no-store, max-age=0" } }
    );
  } catch (error) {
    console.error("Users GET error:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    if (body.action === "reset_password") {
      const { errorResponse } = await requirePermission("user.reset_password");
      if (errorResponse) return errorResponse;
      const result = await resetNewsroomUserPassword(body.id || body.email, body.newPassword);
      if (result) {
        return NextResponse.json({ success: true, ...result });
      }
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { errorResponse } = await requirePermission("user.manage");
    if (errorResponse) return errorResponse;
    const created = await createNewsroomUser(body);
    return NextResponse.json({ success: true, user: created });
  } catch (error) {
    console.error("Users POST error:", error);
    return NextResponse.json({ error: "Failed to process user request" }, { status: 500 });
  }
}

export async function PUT(req) {
  const { errorResponse } = await requirePermission("user.manage");
  if (errorResponse) return errorResponse;
  try {
    const body = await req.json();
    const id = body.id || body.email;
    const updates = body.updates || body;
    const updated = await updateNewsroomUser(id, updates);
    if (updated) {
      return NextResponse.json({ success: true, user: updated });
    }
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  } catch (error) {
    console.error("Users PUT error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(req) {
  const { errorResponse } = await requirePermission("user.manage");
  if (errorResponse) return errorResponse;
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id") || searchParams.get("email");
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    await deleteNewsroomUser(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Users DELETE error:", error);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
