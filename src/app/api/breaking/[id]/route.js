import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { requirePermission } from "@/lib/auth";

export async function PATCH(req, { params }) {
  const { errorResponse } = await requirePermission("breaking.manage");
  if (errorResponse) return errorResponse;

  try {
    const { id } = params;
    const body = await req.json();
    const updates = {};

    if (body.is_active !== undefined) updates.is_active = Boolean(body.is_active);
    if (body.isActive !== undefined) updates.is_active = Boolean(body.isActive);
    if (body.priority !== undefined) updates.priority = Number(body.priority);
    if (body.text_ur !== undefined) updates.text_ur = body.text_ur;
    if (body.text_en !== undefined) updates.text_en = body.text_en;
    if (body.link_url !== undefined) updates.link_url = body.link_url || null;

    const { data, error } = await supabaseAdmin
      .from("breaking_news")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    try {
      revalidatePath("/");
      revalidatePath("/live");
    } catch {}

    return NextResponse.json({ success: true, item: data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  const { errorResponse } = await requirePermission("breaking.manage");
  if (errorResponse) return errorResponse;

  try {
    const { id } = params;
    const { error } = await supabaseAdmin.from("breaking_news").delete().eq("id", id);
    if (error) throw error;

    try {
      revalidatePath("/");
      revalidatePath("/live");
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
