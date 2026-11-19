import { NextResponse } from "next/server";
import { saveEpaperEdition, deleteEpaperEdition } from "@/lib/cmsDb";

export const dynamic = "force-dynamic";

export async function PUT(req, { params }) {
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
  try {
    const { id } = params;
    await deleteEpaperEdition(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
