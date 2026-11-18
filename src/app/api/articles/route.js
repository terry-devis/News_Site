import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const limit = Number(searchParams.get("limit")) || 50;

    let query = supabaseAdmin
      .from("articles")
      .select("*, categories(*)")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (category) {
      query = query.eq("categories.slug", category);
    }

    const { data, error } = await query;
    if (error) throw error;

    return NextResponse.json({ articles: data || [] });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      title_ur,
      title_en,
      slug,
      summary_ur,
      content_ur,
      content_en,
      category_id,
      cover_image,
      is_breaking,
      is_featured,
      author_name,
    } = body;

    if (!title_ur || !content_ur) {
      return NextResponse.json(
        { error: "اردو عنوان اور تفصیلی متن لازمی ہیں" },
        { status: 400 }
      );
    }

    const generatedSlug = slug
      ? slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-")
      : `news-${Date.now()}`;

    const newArticle = {
      title_ur,
      title_en: title_en || null,
      slug: generatedSlug,
      summary_ur: summary_ur || title_ur.substring(0, 150),
      content_ur,
      content_en: content_en || null,
      category_id: category_id ? Number(category_id) : null,
      cover_image: cover_image || null,
      is_breaking: Boolean(is_breaking),
      is_featured: Boolean(is_featured),
      author_name: author_name || "ایڈیٹر ڈیلی افادیت",
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin.from("articles").insert(newArticle).select();
    if (error) throw error;

    // If marked as breaking, also add to breaking_news ticker
    if (is_breaking) {
      try {
        await supabaseAdmin.from("breaking_news").insert({
          text_ur: title_ur,
          text_en: title_en || null,
          priority: 1,
          is_active: true,
        });
      } catch (tickerErr) {
        console.error("Failed to add to ticker:", tickerErr);
      }
    }

    return NextResponse.json({ success: true, article: data[0] });
  } catch (error) {
    console.error("Create article error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
