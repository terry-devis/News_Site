import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseServer";
import { getSessionUser } from "@/lib/auth";
import { unpackArticleMeta } from "@/lib/articleMeta";

function extractStatus(article) {
  if (article?.content_en) {
    const match = String(article.content_en).match(/<!--status:([a-z_]+)-->/);
    if (match) return match[1];
  }
  return "published";
}

function getPktDateString(dateInput) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Karachi",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(dateInput));
}

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [{ data: rawArticles, error }, { data: breakingItems }] = await Promise.all([
      supabaseAdmin
        .from("articles")
        .select(
          "id, title_ur, title_en, slug, cover_image, content_en, views_count, is_breaking, created_at, updated_at, categories(id, name_ur, name_en, slug)"
        )
        .order("updated_at", { ascending: false })
        .limit(500),
      supabaseAdmin.from("breaking_news").select("id, is_active"),
    ]);

    if (error) throw error;

    const articles = (rawArticles || []).map((art) => {
      const unpacked = unpackArticleMeta(art.content_en);
      return {
        ...art,
        status: unpacked.status || extractStatus(art),
        meta: unpacked.meta,
      };
    });

    const todayPkt = getPktDateString(new Date());

    let publishedToday = 0;
    let drafts = 0;
    let inReview = 0;
    let scheduled = 0;
    let totalPublished = 0;
    let imagesMissingAltText = 0;

    for (const art of articles) {
      if (art.status === "trashed" || art.meta?.deletedAt) continue;

      if (art.status === "draft") drafts++;
      else if (art.status === "in_review") inReview++;
      else if (art.status === "scheduled") scheduled++;
      else if (art.status === "published") {
        totalPublished++;
        const refDate = art.created_at || art.updated_at;
        if (refDate && getPktDateString(refDate) === todayPkt) {
          publishedToday++;
        }
      }

      const hasAltText = Boolean(
        (art.meta?.coverImageAlt && art.meta.coverImageAlt.trim()) ||
          art.cover_image_alt ||
          art.lead_image_alt
      );
      if (art.cover_image && !hasAltText) {
        imagesMissingAltText++;
      }
    }

    const activeBreaking = (breakingItems || []).filter((b) => b.is_active !== false).length;

    const nonTrashed = articles.filter((a) => a.status !== "trashed");
    const recentActivity = nonTrashed.slice(0, 8);
    const topToday = nonTrashed
      .filter((a) => a.status === "published")
      .sort((a, b) => (b.views_count || 0) - (a.views_count || 0))
      .slice(0, 6);

    return NextResponse.json({
      success: true,
      counters: {
        publishedToday,
        drafts,
        inReview,
        scheduled,
        breaking: activeBreaking,
        totalArticles: totalPublished,
      },
      seoWarnings: {
        imagesMissingAltText,
      },
      recentActivity,
      topToday,
    });
  } catch (error) {
    console.error("Dashboard GET error:", error);
    return NextResponse.json({ error: "Failed to load dashboard" }, { status: 500 });
  }
}
