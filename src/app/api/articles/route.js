import { NextResponse } from "next/server";
import { revalidateAll } from "@/lib/revalidatePublic";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { unpackArticleMeta, packArticleMeta } from "@/lib/articleMeta";
import { enforceMaxFeaturedLimit } from "@/lib/featuredLimit";
import { requirePermission } from "@/lib/auth";
import { generateSeoSlug } from "@/lib/slugify";
import { resolveValidCategoryId } from "@/lib/cmsDb";

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

    const safeTitleUr = title_ur ? String(title_ur).trim() : "";
    const safeTitleEn = title_en ? String(title_en).trim() : "";
    const safeContentUr = content_ur ? String(content_ur).trim() : "";
    const safeContentEn = content_en ? String(content_en).trim() : "";

    const hasUrdu = Boolean(safeTitleUr) && Boolean(safeContentUr);
    const hasEnglish = Boolean(safeTitleEn) && Boolean(safeContentEn);

    if (!hasUrdu && !hasEnglish) {
      return NextResponse.json(
        { error: "At least one edition (Urdu or English) headline and body are required" },
        { status: 400 }
      );
    }

    const generatedSlug = slug
      ? slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-")
      : `${generateSeoSlug({ titleEn: safeTitleEn, titleUr: safeTitleUr, focusKeyword: meta?.focusKeyword })}-${Date.now().toString(36)}`;

    const targetStatus = body.status || "published";
    const finalContentEn = packArticleMeta({
      status: targetStatus,
      excerptEn: excerpt_en || "",
      meta: meta || null,
      contentEn: safeContentEn,
    });

    const resolvedCategoryId = category_id ? await resolveValidCategoryId(category_id) : null;

    const isRedAlertBreaking = Boolean(is_breaking) && Number(meta?.breakingPriority || 1) === 1;
    const newArticle = {
      title_ur: safeTitleUr,
      title_en: safeTitleEn || null,
      slug: generatedSlug,
      summary_ur: summary_ur ? String(summary_ur).trim() : (safeTitleUr ? safeTitleUr.substring(0, 150) : ""),
      content_ur: safeContentUr,
      content_en: finalContentEn || null,
      category_id: resolvedCategoryId,
      cover_image: cover_image || null,
      is_breaking: Boolean(is_breaking),
      is_featured: Boolean(is_featured) || isRedAlertBreaking,
      author_name: author_name || (safeTitleUr ? "ایڈیٹر ڈیلی افادیت" : "Daily Afadiat Desk"),
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
          text_ur: safeTitleUr,
          text_en: safeTitleEn || null,
          link_url: safeTitleUr ? `/story/${data[0].id}` : `/en/story/${data[0].id}`,
          priority: 0,
          is_active: true,
        });
      } catch (tickerErr) {
        console.error("Failed to add to ticker:", tickerErr);
      }
    }

    await revalidateAll(["/", "/rss.xml", "/sitemap.xml"]);

    return NextResponse.json({ success: true, article: data[0] });
  } catch (error) {
    console.error("Create article error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
