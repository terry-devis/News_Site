import { NextResponse } from "next/server";
import { trackAdEvent } from "@/lib/cmsDb";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const type = body.type === "click" ? "click" : "impression";
    const creativeId = body.creativeId || null;
    const slotKey = body.slotKey || null;

    if (!creativeId && !slotKey) {
      return NextResponse.json(
        { error: "creativeId or slotKey is required" },
        { status: 400 }
      );
    }

    const result = await trackAdEvent({ creativeId, slotKey, type });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
