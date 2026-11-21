import { NextResponse } from "next/server";
import {
  getMediaAssets,
  createMediaAsset,
  updateMediaAsset,
  deleteMediaAsset,
} from "@/lib/cmsDb";
import { requirePermission } from "@/lib/auth";

export async function GET() {
  try {
    const assets = await getMediaAssets();
    return NextResponse.json({ success: true, assets });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  const { errorResponse } = await requirePermission("media.upload");
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const newAsset = await createMediaAsset(body);
    return NextResponse.json({ success: true, asset: newAsset });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  const { errorResponse } = await requirePermission("media.upload");
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ error: "Media asset ID is required" }, { status: 400 });
    }
    const updated = await updateMediaAsset(id, updates);
    return NextResponse.json({ success: true, asset: updated });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  return PUT(req);
}

export async function DELETE(req) {
  const { errorResponse } = await requirePermission("media.delete");
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");
    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body.id;
    }
    if (!id) {
      return NextResponse.json({ error: "Media asset ID is required" }, { status: 400 });
    }
    await deleteMediaAsset(id);
    return NextResponse.json({ success: true, message: "Media asset deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
