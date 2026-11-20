import { NextResponse } from "next/server";
import { getNotificationLog } from "@/lib/cmsDb";
import { requirePermission } from "@/lib/auth";

export async function GET(req) {
  const { errorResponse } = await requirePermission("notification.view");
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Number(searchParams.get("limit")) || 25, 100);
    const logs = await getNotificationLog(limit);
    return NextResponse.json({ success: true, logs });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
