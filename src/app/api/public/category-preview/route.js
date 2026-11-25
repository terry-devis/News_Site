import { NextResponse } from "next/server";
import { getCategories } from "@/lib/cmsDb";
import { filterPublishedArticles } from "@/lib/articleMeta";
import { supabaseAdmin } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = (searchParams.get("slug") || "").trim();
    const lang = (searchParams.get("lang") || "").trim().toLowerCase();
    const limit = Math.min(8, Math.max(1, Number(searchParams.get("limit")) || 4));

    if (!slug) {
      return NextResponse.json({ articles: [] });
    }

    const allCats = await getCategories();
    const cat = (allCats || []).find((c) => c.slug === slug);

    if (!cat) {
      return NextResponse.json({ articles: [] });
    }

    const childIds = (allCats || [])
      .filter((c) => c.parent_id === cat.id)
      .map((c) => c.id);
    const targetIds = [cat.id, ...childIds];

    let query = supabaseAdmin
      .from("articles")
      .select("id, title_ur, title_en, slug, cover_image, content_en, created_at")
      .in("category_id", targetIds);

    if (lang === "en") {
      query = query.not("title_en", "is", null).neq("title_en", "");
    } else if (lang === "ur") {
      query = query.not("title_ur", "is", null).neq("title_ur", "");
    }

    const { data: articles, error } = await query
      .order("created_at", { ascending: false })
      .limit(limit * 4);

    if (error) throw error;

    const publishedArticles = filterPublishedArticles(articles || [])
      .filter((a) => {
        if (lang === "en") return Boolean(a.title_en && a.title_en.trim());
        if (lang === "ur") return Boolean(a.title_ur && a.title_ur.trim());
        return true;
      })
      .slice(0, limit);

    return NextResponse.json({
      category: cat,
      articles: publishedArticles.map((a) => ({
        id: a.id,
        title_ur: a.title_ur,
        title_en: a.title_en,
        slug: a.slug,
        thumb: a.cover_image || "",
        created_at: a.created_at,
      })),
    });
  } catch (err) {
    console.error("category-preview error:", err);
    return NextResponse.json({ articles: [] }, { status: 200 });
  }
}
