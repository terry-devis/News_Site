import { NextResponse } from "next/server";
import { updateNewsroomUser, deleteNewsroomUser } from "@/lib/cmsDb";
import { requirePermission } from "@/lib/auth";

export async function PUT(req, context) {
  const { errorResponse } = await requirePermission("user.manage");
  if (errorResponse) return errorResponse;

  try {
    const { id } = await context.params;
    const body = await req.json();
    const updates = body?.updates || body || {};

    const updated = await updateNewsroomUser(id, updates);
    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, user: updated });
  } catch (error) {
    console.error("User PUT error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
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
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
