import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function POST(req, { params }) {
  try {
    const id = parseInt(params.id, 10);
    if (!id || isNaN(id)) {
      return NextResponse.json({ error: "Invalid article ID" }, { status: 400 });
    }

    // Fetch current views
    const { data: art, error: fetchErr } = await supabaseAdmin
      .from("articles")
      .select("id, views_count")
      .eq("id", id)
      .single();

    if (fetchErr || !art) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const nextViews = (art.views_count || 0) + 1;

    // Increment views_count
    await supabaseAdmin
      .from("articles")
      .update({ views_count: nextViews })
      .eq("id", id);

    return NextResponse.json({ success: true, views_count: nextViews });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
