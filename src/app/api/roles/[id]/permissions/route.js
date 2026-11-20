import { NextResponse } from "next/server";
import { updateNewsroomRolePermissions } from "@/lib/cmsDb";
import { requirePermission } from "@/lib/auth";

export async function PUT(req, context) {
  const { errorResponse } = await requirePermission("role.manage");
  if (errorResponse) return errorResponse;

  try {
    const { id } = await context.params;
    const body = await req.json();
    const permissionKeys = Array.isArray(body?.permissionKeys) ? body.permissionKeys : [];

    const result = await updateNewsroomRolePermissions(id, permissionKeys);
    if (!result) {
      return NextResponse.json({ error: "Role not found" }, { status: 404 });
    }
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, role: result });
  } catch (error) {
    console.error("Role permissions PUT error:", error);
    return NextResponse.json({ error: "Failed to update role permissions" }, { status: 500 });
  }
}
