import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  getLayout,
  saveLayoutBlocks,
  saveLayoutZones,
  createLayoutBlock,
  updateLayoutBlock,
  deleteLayoutBlock,
} from "@/lib/cmsDb";
import { requirePermission } from "@/lib/auth";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || "home";
    const edition = searchParams.get("edition") || "ur";

    const layout = await getLayout(page, edition);
    return NextResponse.json({ success: true, ...layout });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  const { errorResponse } = await requirePermission("layout.manage");
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();

    if (body.action === "save_blocks") {
      const saved = await saveLayoutBlocks(body.blocks || []);
      try { revalidatePath("/"); revalidatePath("/en"); } catch {}
      return NextResponse.json({ success: true, blocks: saved });
    }

    if (body.action === "save_zones") {
      const saved = await saveLayoutZones(body.zones || []);
      try { revalidatePath("/"); revalidatePath("/en"); } catch {}
      return NextResponse.json({ success: true, zones: saved });
    }

    // Default create single block
    const newBlock = await createLayoutBlock(body);
    try { revalidatePath("/"); revalidatePath("/en"); } catch {}
    return NextResponse.json({ success: true, block: newBlock });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req) {
  const { errorResponse } = await requirePermission("layout.manage");
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ error: "Block ID is required" }, { status: 400 });
    }
    const updated = await updateLayoutBlock(id, updates);
    return NextResponse.json({ success: true, block: updated });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  return PUT(req);
}

export async function DELETE(req) {
  const { errorResponse } = await requirePermission("layout.manage");
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");
    if (!id) {
      const body = await req.json().catch(() => ({}));
      id = body.id;
    }
    if (!id) {
      return NextResponse.json({ error: "Block ID is required" }, { status: 400 });
    }
    await deleteLayoutBlock(id);
    return NextResponse.json({ success: true, message: "Block deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
