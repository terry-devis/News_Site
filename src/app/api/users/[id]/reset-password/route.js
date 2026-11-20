import { NextResponse } from "next/server";
import { resetNewsroomUserPassword } from "@/lib/cmsDb";
import { requirePermission } from "@/lib/auth";

export async function POST(req, context) {
  const { errorResponse } = await requirePermission("user.reset_password");
  if (errorResponse) return errorResponse;

  try {
    const { id } = await context.params;
    const body = await req.json();
    const newPassword = body?.newPassword;

    if (!newPassword || String(newPassword).length < 10) {
      return NextResponse.json(
        { error: "Password must be at least 10 characters" },
        { status: 400 }
      );
    }

    const result = await resetNewsroomUserPassword(id, newPassword);
    if (!result) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    console.error("Reset password POST error:", error);
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
