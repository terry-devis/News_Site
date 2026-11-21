import { NextResponse } from "next/server";
import { saveEpaperEdition, deleteEpaperEdition } from "@/lib/cmsDb";
import { requirePermission } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function PUT(req, { params }) {
  const { errorResponse } = await requirePermission("epaper.manage");
  if (errorResponse) return errorResponse;

  try {
    const { id } = params;
    const body = await req.json();
    const updated = await saveEpaperEdition({ ...body, id });
    return NextResponse.json({ success: true, edition: updated });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  const { errorResponse } = await requirePermission("epaper.manage");
  if (errorResponse) return errorResponse;

  try {
    const { id } = params;
    await deleteEpaperEdition(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
