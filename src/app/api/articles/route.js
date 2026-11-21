import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { unpackArticleMeta, packArticleMeta } from "@/lib/articleMeta";
import { enforceMaxFeaturedLimit } from "@/lib/featuredLimit";
import { requirePermission } from "@/lib/auth";
import { generateSeoSlug } from "@/lib/slugify";

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

    const formatted = (data || []).map((art) => {
      const { status, excerptEn, meta, cleanContentEn } = unpackArticleMeta(art.content_en);
      return {
        ...art,
        status,
        excerpt_en: excerptEn,
        meta,
        content_en: cleanContentEn,
      };
    });

    return NextResponse.json({ articles: formatted });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  const { errorResponse } = await requirePermission("article.create");
  if (errorResponse) return errorResponse;

  try {
    const body = await req.json();
    const {
      title_ur,
      title_en,
      slug,
      summary_ur,
      excerpt_en,
      content_ur,
      content_en,
      category_id,
      cover_image,
      is_breaking,
      is_featured,
      author_name,
      meta,
    } = body;

    if (!title_ur || !content_ur) {
      return NextResponse.json(
        { error: "اردو عنوان اور تفصیلی متن لازمی ہیں" },
        { status: 400 }
      );
    }

    const generatedSlug = slug
      ? slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-")
      : `${generateSeoSlug({ titleEn: title_en, titleUr: title_ur, focusKeyword: meta?.focusKeyword })}-${Date.now().toString(36)}`;

    const targetStatus = body.status || "published";
    const finalContentEn = packArticleMeta({
      status: targetStatus,
      excerptEn: excerpt_en || "",
      meta: meta || null,
      contentEn: content_en || "",
    });

    const isRedAlertBreaking = Boolean(is_breaking) && Number(meta?.breakingPriority || 1) === 1;
    const newArticle = {
      title_ur,
      title_en: title_en || null,
      slug: generatedSlug,
      summary_ur: summary_ur || title_ur.substring(0, 150),
      content_ur,
      content_en: finalContentEn || null,
      category_id: category_id ? Number(category_id) : null,
      cover_image: cover_image || null,
      is_breaking: Boolean(is_breaking),
      is_featured: Boolean(is_featured) || isRedAlertBreaking,
      author_name: author_name || "ایڈیٹر ڈیلی افادیت",
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseAdmin.from("articles").insert(newArticle).select();
    if (error) throw error;

    if (newArticle.is_featured && data?.[0]?.id) {
      await enforceMaxFeaturedLimit(data[0].id);
    }

    // If marked as breaking, also add to breaking_news ticker
    if (is_breaking) {
      try {
        await supabaseAdmin.from("breaking_news").insert({
          text_ur: title_ur,
          text_en: title_en || null,
          link_url: `/story/${data[0].id}`,
          priority: 0,
          is_active: true,
        });
      } catch (tickerErr) {
        console.error("Failed to add to ticker:", tickerErr);
      }
    }

    try {
      revalidatePath("/");
      revalidatePath("/rss.xml");
      revalidatePath("/sitemap.xml");
    } catch (e) {}

    return NextResponse.json({ success: true, article: data[0] });
  } catch (error) {
    console.error("Create article error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
