import { NextResponse } from "next/server";
import {
  getAdSlots,
  getAdCreatives,
  getAdSlot,
  createAdSlot,
  updateAdSlot,
  deleteAdSlot,
  createAdCreative,
  updateAdCreative,
  deleteAdCreative,
  clearAllAdCreatives,
  getAdNetworkConfig,
  saveAdNetworkConfig,
} from "@/lib/cmsDb";
import { requirePermission } from "@/lib/auth";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const slotKey = searchParams.get("slot");

    if (slotKey) {
      const [slot, creatives] = await Promise.all([
        getAdSlot(slotKey),
        getAdCreatives(slotKey),
      ]);
      return NextResponse.json({ slot, creatives });
    }

    const [slots, creatives, networkConfig] = await Promise.all([
      getAdSlots(),
      getAdCreatives(),
      getAdNetworkConfig(),
    ]);
    return NextResponse.json({ success: true, slots, creatives, networkConfig });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  const { errorResponse } = await requirePermission("ads.manage");
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();

    if (body.action === "save_network_config") {
      const networkConfig = await saveAdNetworkConfig(body.config || body);
      return NextResponse.json({ success: true, networkConfig });
    }

    if (body.action === "create_slot" || (!body.action && body.slot_key && !body.name)) {
      const slot = await createAdSlot(body);
      return NextResponse.json({ success: true, slot });
    }

    if (body.action === "create_creative" || (!body.action && body.slot_key && body.name)) {
      const creative = await createAdCreative(body);
      return NextResponse.json({ success: true, creative });
    }

    return NextResponse.json({ error: "Invalid action or parameters" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  const { errorResponse } = await requirePermission("ads.manage");
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();

    if (body.target === "creative" || body.creative_id || (body.id && !body.slot_key)) {
      const id = body.creative_id || body.id;
      const updated = await updateAdCreative(id, body);
      return NextResponse.json({ success: true, creative: updated });
    }

    const { slot_key, ...updates } = body;
    if (!slot_key) {
      return NextResponse.json({ error: "Missing slot_key or creative id" }, { status: 400 });
    }

    const updated = await updateAdSlot(slot_key, updates);
    return NextResponse.json({ success: true, slot: updated });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  return PATCH(req);
}

export async function DELETE(req) {
  const { errorResponse } = await requirePermission("ads.manage");
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const slotKey = searchParams.get("slot_key");
    const creativeId = searchParams.get("creative_id");
    const clearCreatives = searchParams.get("clear_creatives");

    if (clearCreatives === "1") {
      await clearAllAdCreatives();
      return NextResponse.json({ success: true, message: "All creatives cleared" });
    }

    if (creativeId) {
      await deleteAdCreative(creativeId);
      return NextResponse.json({ success: true, message: "Creative deleted successfully" });
    }

    if (slotKey) {
      const res = await deleteAdSlot(slotKey);
      if (res?.error) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }
      return NextResponse.json({ success: true, message: "Slot deleted successfully" });
    }

    return NextResponse.json({ error: "Missing slot_key or creative_id" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
