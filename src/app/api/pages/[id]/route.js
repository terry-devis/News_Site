import { NextResponse } from "next/server";
import { savePage, deletePage, getPageBySlug } from "@/lib/cmsDb";

export const dynamic = "force-dynamic";

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();
    const updated = await savePage({ ...body, id });
    return NextResponse.json({ success: true, page: updated });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    await deletePage(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
