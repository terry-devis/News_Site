import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = (searchParams.get("slug") || "").trim();
    const limit = Math.min(8, Math.max(1, Number(searchParams.get("limit")) || 4));

    if (!slug) {
      return NextResponse.json({ articles: [] });
    }

    const { data: cat } = await supabaseAdmin
      .from("categories")
      .select("id, slug, name_ur, name_en")
      .eq("slug", slug)
      .maybeSingle();

    if (!cat) {
      return NextResponse.json({ articles: [] });
    }

    const { data: articles, error } = await supabaseAdmin
      .from("articles")
      .select("id, title_ur, title_en, slug, featured_image, created_at")
      .eq("category_id", cat.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return NextResponse.json({
      category: cat,
      articles: (articles || []).map((a) => ({
        id: a.id,
        title_ur: a.title_ur,
        title_en: a.title_en,
        slug: a.slug,
        thumb: a.featured_image || "",
        created_at: a.created_at,
      })),
    });
  } catch (err) {
    console.error("category-preview error:", err);
    return NextResponse.json({ articles: [] }, { status: 200 });
  }
}
