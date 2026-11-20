import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
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

    let status = "published";
    if (data?.content_en) {
      const match = data.content_en.match(/<!--status:([a-z_]+)-->/);
      if (match) status = match[1];
    }

    return NextResponse.json({ article: { ...data, status } });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}

export async function PUT(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();

    let targetStatus = body.status;

    const updates = {
      ...body,
      updated_at: new Date().toISOString(),
    };

    if (updates.id) delete updates.id;
    if (updates.categories) delete updates.categories;

    // Handle status persistence safely within schema
    if (updates.status !== undefined) {
      targetStatus = updates.status;
      delete updates.status;

      // Pack status into content_en
      let baseEn = updates.content_en;
      if (baseEn === undefined) {
        // Fetch current content_en
        const { data: cur } = await supabaseAdmin.from("articles").select("content_en").eq("id", id).single();
        baseEn = cur?.content_en || "";
      }
      const cleanEn = (baseEn || "").replace(/<!--status:[a-z_]+-->\n?/, "").trim();
      updates.content_en = `<!--status:${targetStatus}-->\n${cleanEn}`.trim();
    }

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
      const linkUrl = `/story/${id}`;

      if (updates.is_breaking && titleUr) {
        // Find existing ticker item by text_ur or link_url
        const { data: existing } = await supabaseAdmin
          .from("breaking_news")
          .select("id")
          .or(`text_ur.eq."${titleUr}",link_url.eq."${linkUrl}"`)
          .maybeSingle();

        if (existing) {
          await supabaseAdmin
            .from("breaking_news")
            .update({ is_active: true, text_ur: titleUr, text_en: titleEn, link_url: linkUrl, priority: 0 })
            .eq("id", existing.id);
        } else {
          await supabaseAdmin
            .from("breaking_news")
            .insert({ text_ur: titleUr, text_en: titleEn, link_url: linkUrl, priority: 0, is_active: true });
        }
      } else if (!updates.is_breaking) {
        // Deactivate from ticker
        const linkUrl = `/story/${id}`;
        if (titleUr) {
          await supabaseAdmin
            .from("breaking_news")
            .update({ is_active: false })
            .or(`text_ur.eq."${titleUr}",link_url.eq."${linkUrl}"`);
        } else {
          await supabaseAdmin
            .from("breaking_news")
            .update({ is_active: false })
            .eq("link_url", linkUrl);
        }
      }
    }

    try {
      revalidatePath("/");
      revalidatePath(`/story/${id}`);
      revalidatePath("/rss.xml");
      revalidatePath("/sitemap.xml");
    } catch (e) {
      // ignore
    }

    return NextResponse.json({
      success: true,
      article: data[0] ? { ...data[0], status: targetStatus || "published" } : null,
    });
  } catch (error) {
    console.error("PUT article error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    const linkUrl = `/story/${id}`;
    // Get title before delete to clean up ticker
    const { data: art } = await supabaseAdmin.from("articles").select("title_ur").eq("id", id).maybeSingle();

    const { error } = await supabaseAdmin.from("articles").delete().eq("id", id);
    if (error) throw error;

    if (art?.title_ur) {
      await supabaseAdmin.from("breaking_news").delete().or(`text_ur.eq."${art.title_ur}",link_url.eq."${linkUrl}"`);
    } else {
      await supabaseAdmin.from("breaking_news").delete().eq("link_url", linkUrl);
    }

    try {
      revalidatePath("/");
      revalidatePath("/rss.xml");
    } catch (e) {}

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
