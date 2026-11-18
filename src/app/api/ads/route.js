import { NextResponse } from "next/server";
import { getAdSlots, getAdSlot, updateAdSlot } from "@/lib/cmsDb";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const slotKey = searchParams.get("slot");

    if (slotKey) {
      const slot = await getAdSlot(slotKey);
      return NextResponse.json({ slot });
    }

    const slots = await getAdSlots();
    return NextResponse.json({ slots });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const body = await req.json();
    const { slot_key, ...updates } = body;

    if (!slot_key) {
      return NextResponse.json({ error: "Missing slot_key" }, { status: 400 });
    }

    const updated = await updateAdSlot(slot_key, updates);
    return NextResponse.json({ success: true, slot: updated });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
