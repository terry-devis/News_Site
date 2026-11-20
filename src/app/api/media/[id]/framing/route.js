import { NextResponse } from "next/server";
import { updateMediaAsset } from "@/lib/cmsDb";
import { requirePermission } from "@/lib/auth";

export async function PUT(req, context) {
  const { errorResponse } = await requirePermission("media.framing");
  if (errorResponse) return errorResponse;

  try {
    const { id } = await context.params;
    const body = await req.json();
    const framing = body?.framing || body;

    const updated = await updateMediaAsset(id, {
      framing,
      focal_point: framing?.focal || undefined,
    });
    if (!updated) {
      return NextResponse.json({ error: "Media asset not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, asset: updated });
  } catch (error) {
    console.error("Media framing PUT error:", error);
    return NextResponse.json({ error: "Failed to save framing" }, { status: 500 });
  }
}
