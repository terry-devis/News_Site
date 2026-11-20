import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { requirePermission } from "@/lib/auth";

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from("breaking_news")
      .select("*")
      .order("priority", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json({ breakingNews: data || [] });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  const { errorResponse } = await requirePermission("breaking.manage");
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const { id, text_ur, text_en, link_url, is_active, priority } = body;

    if (!text_ur && !text_en) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    if (id) {
      // Update existing
      const { data, error } = await supabaseAdmin
        .from("breaking_news")
        .update({
          text_ur,
          text_en,
          link_url: link_url || null,
          is_active: is_active !== undefined ? is_active : true,
          priority: priority !== undefined ? Number(priority) : 2,
        })
        .eq("id", id)
        .select();

      if (error) throw error;
      try {
        revalidatePath("/");
      } catch (e) {}

      return NextResponse.json({ success: true, item: data?.[0] });
    } else {
      // Insert new
      const { data, error } = await supabaseAdmin
        .from("breaking_news")
        .insert([
          {
            text_ur: text_ur || text_en,
            text_en: text_en || text_ur,
            link_url: link_url || null,
            is_active: is_active !== undefined ? is_active : true,
            priority: priority !== undefined ? Number(priority) : 2,
          },
        ])
        .select();

      if (error) throw error;
      try {
        revalidatePath("/");
      } catch (e) {}

      return NextResponse.json({ success: true, item: data?.[0] });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  const { errorResponse } = await requirePermission("breaking.manage");
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("breaking_news")
      .delete()
      .eq("id", id);

    if (error) throw error;
    try {
      revalidatePath("/");
    } catch (e) {}

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
