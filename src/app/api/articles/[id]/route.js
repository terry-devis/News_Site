import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function GET(req, { params }) {
  try {
    const { id } = params;
    const { data, error } = await supabaseAdmin
      .from("articles")
      .select("*, categories(*)")
      .eq("id", id)
      .single();

    if (error) throw error;
    return NextResponse.json({ article: data });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();

    const updates = {
      ...body,
      updated_at: new Date().toISOString(),
    };

    if (updates.id) delete updates.id;
    if (updates.categories) delete updates.categories;

    const { data, error } = await supabaseAdmin
      .from("articles")
      .update(updates)
      .eq("id", id)
      .select();

    if (error) throw error;

    // Automatic synchronization with breaking_news ticker
    if (updates.is_breaking !== undefined) {
      const titleUr = updates.title_ur || data[0]?.title_ur;
      const titleEn = updates.title_en || data[0]?.title_en || titleUr;

      if (updates.is_breaking && titleUr) {
        // Find existing ticker item
        const { data: existing } = await supabaseAdmin
          .from("breaking_news")
          .select("id")
          .eq("text_ur", titleUr)
          .maybeSingle();

        if (existing) {
          await supabaseAdmin
            .from("breaking_news")
            .update({ is_active: true, text_ur: titleUr, text_en: titleEn })
            .eq("id", existing.id);
        } else {
          await supabaseAdmin
            .from("breaking_news")
            .insert({ text_ur: titleUr, text_en: titleEn, priority: 1, is_active: true });
        }
      } else if (!updates.is_breaking && titleUr) {
        // Deactivate from ticker
        await supabaseAdmin
          .from("breaking_news")
          .update({ is_active: false })
          .eq("text_ur", titleUr);
      }
    }

    return NextResponse.json({ success: true, article: data[0] });
  } catch (error) {
    console.error("PUT article error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    // Get title before delete to clean up ticker
    const { data: art } = await supabaseAdmin.from("articles").select("title_ur").eq("id", id).maybeSingle();

    const { error } = await supabaseAdmin.from("articles").delete().eq("id", id);
    if (error) throw error;

    if (art?.title_ur) {
      await supabaseAdmin.from("breaking_news").delete().eq("text_ur", art.title_ur);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
