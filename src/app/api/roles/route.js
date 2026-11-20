import { NextResponse } from "next/server";
import { getNewsroomRoles, createNewsroomRole } from "@/lib/cmsDb";
import { PERMISSION_GROUPS, PERMISSION_GROUP_LABELS } from "@/lib/permissions";
import { requirePermission } from "@/lib/auth";

export async function GET() {
  const { errorResponse } = await requirePermission("role.view");
  if (errorResponse) return errorResponse;

  try {
    const roles = await getNewsroomRoles();
    return NextResponse.json({
      success: true,
      roles,
      permissionGroups: PERMISSION_GROUPS,
      groupLabels: PERMISSION_GROUP_LABELS,
    });
  } catch (error) {
    console.error("Roles GET error:", error);
    return NextResponse.json({ error: "Failed to load roles" }, { status: 500 });
  }
}

export async function POST(req) {
  const { errorResponse } = await requirePermission("role.manage");
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const result = await createNewsroomRole(body || {});
    if (result?.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, role: result }, { status: 201 });
  } catch (error) {
    console.error("Roles POST error:", error);
    return NextResponse.json({ error: "Failed to create role" }, { status: 500 });
  }
}
