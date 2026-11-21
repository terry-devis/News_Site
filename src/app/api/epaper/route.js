import { NextResponse } from "next/server";
import {
  getEpaperEditionsV2,
  createEpaperEditionV2,
  updateEpaperEditionV2,
  deleteEpaperEditionV2,
  saveEpaperPageRegions,
  getEpaperEditions,
  saveEpaperEdition,
} from "@/lib/cmsDb";
import { requirePermission } from "@/lib/auth";
import { revalidateAll } from "@/lib/revalidatePublic";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get("date");
    const paper = searchParams.get("paper");
    const city = searchParams.get("city");

    const editions = await getEpaperEditionsV2(date, paper);
    const legacyEditions = await getEpaperEditions(date, city);

    return NextResponse.json({
      success: true,
      editions,
      legacyEditions,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    // 1. Save Clickable Regions
    if (body.action === "save_regions") {
      const { errorResponse } = await requirePermission("epaper.clip");
      if (errorResponse) return errorResponse;
      const { editionId, pageNumber, regions } = body;
      const res = await saveEpaperPageRegions(editionId, pageNumber, regions || []);
      return NextResponse.json(res);
    }

    const { errorResponse } = await requirePermission("epaper.manage");
    if (errorResponse) return errorResponse;

    // 2. Upload / Create Edition (V2)
    if (body.action === "upload_edition" || body.paper || body.pdf_url) {
      const edition = await createEpaperEditionV2(body);
      await revalidateAll(["/epaper", "/"]);
      return NextResponse.json({ success: true, edition });
    }

    // 3. Fallback Legacy
    const edition = await saveEpaperEdition(body);
    await revalidateAll(["/epaper", "/"]);
    return NextResponse.json({ success: true, edition });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  const { errorResponse } = await requirePermission("epaper.manage");
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ error: "Edition ID is required" }, { status: 400 });
    }
    const updated = await updateEpaperEditionV2(id, updates);
    await revalidateAll(["/epaper", "/"]);
    return NextResponse.json({ success: true, edition: updated });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  return PUT(req);
}

export async function DELETE(req) {
  const { errorResponse } = await requirePermission("epaper.manage");
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");
    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body.id;
    }
    if (!id) {
      return NextResponse.json({ error: "Edition ID is required" }, { status: 400 });
    }
    await deleteEpaperEditionV2(id);
    await revalidateAll(["/epaper", "/"]);
    return NextResponse.json({ success: true, message: "Edition deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
