import { NextResponse } from "next/server";
import { getNotificationPrefs, saveNotificationPrefs } from "@/lib/cmsDb";
import { requirePermission } from "@/lib/auth";

export async function GET() {
  const { errorResponse } = await requirePermission("notification.view");
  if (errorResponse) return errorResponse;

  try {
    const data = await getNotificationPrefs();
    return NextResponse.json({ success: true, ...data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  const { errorResponse } = await requirePermission("notification.manage");
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const prefs = Array.isArray(body?.prefs) ? body.prefs : [];
    await saveNotificationPrefs(prefs);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
