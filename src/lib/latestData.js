import { supabaseAdmin } from "@/lib/supabaseServer";
import { filterPublishedArticles } from "@/lib/articleMeta";
import { getSiteSetting, getBreakingTickerEnabled } from "@/lib/cmsDb";

const ARTICLE_SELECT =
  "id, title_ur, title_en, slug, summary_ur, cover_image, content_en, created_at, views_count, author_name, is_breaking, is_featured, category_id, categories(id, name_ur, name_en, slug)";

function hasEditionHeadline(article, lang) {
  if (!article) return false;
  if (lang === "en") {
    return Boolean(article.title_en && String(article.title_en).trim());
  }
  return Boolean(article.title_ur && String(article.title_ur).trim());
}

function normalizeLatestArticle(art) {
  return {
    id: art.id,
    slug: art.slug,
    title_ur: art.title_ur || "",
    title_en: art.title_en || "",
    summary_ur: art.summary_ur || "",
    summary_en: art.summary_en || "",
    cover_image:
      art.cover_image && typeof art.cover_image === "string" && art.cover_image.trim()
        ? art.cover_image.trim()
        : "",
    created_at: art.created_at,
    views_count: Number(art.views_count) || 0,
    is_breaking: Boolean(art.is_breaking),
    is_featured: Boolean(art.is_featured),
    category: art.categories || art.category || { name_ur: "پاکستان", name_en: "Pakistan", slug: "pakistan" },
    meta: art.meta || null,
  };
}

/**
 * Fetches paginated published articles for the /latest timeline in chronological order.
 */
export async function fetchLatestTimelinePage({ lang = "ur", offset = 0, limit = 20 } = {}) {
  const safeOffset = Math.max(0, Number(offset) || 0);
  const safeLimit = Math.min(50, Math.max(1, Number(limit) || 20));
  const targetCount = safeOffset + safeLimit + 1;
  const chunkSize = 60;

  const collected = [];
  let dbOffset = 0;

  for (let pass = 0; pass < 10 && collected.length < targetCount; pass++) {
    let query = supabaseAdmin.from("articles").select(ARTICLE_SELECT);

    if (lang === "en") {
      query = query.not("title_en", "is", null).neq("title_en", "");
    } else {
      query = query.not("title_ur", "is", null).neq("title_ur", "");
    }

    const { data, error } = await query
      .order("created_at", { ascending: false })
      .range(dbOffset, dbOffset + chunkSize - 1);

    if (error) throw error;
    const rows = data || [];
    if (rows.length === 0) break;

    const published = filterPublishedArticles(rows).filter((art) =>
      hasEditionHeadline(art, lang)
    );
    collected.push(...published.map(normalizeLatestArticle));

    if (rows.length < chunkSize) break;
    dbOffset += chunkSize;
  }

  const items = collected.slice(safeOffset, safeOffset + safeLimit);
  const hasMore = collected.length > safeOffset + safeLimit;

  return { articles: items, hasMore };
}

/**
 * Fetches top most-read published articles for the /latest sidebar.
 */
export async function fetchMostReadArticles({ lang = "ur", limit = 8 } = {}) {
  const safeLimit = Math.min(20, Math.max(1, Number(limit) || 8));

  let query = supabaseAdmin.from("articles").select(ARTICLE_SELECT);
  if (lang === "en") {
    query = query.not("title_en", "is", null).neq("title_en", "");
  } else {
    query = query.not("title_ur", "is", null).neq("title_ur", "");
  }

  const { data, error } = await query
    .order("views_count", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(safeLimit * 4);

  if (error) throw error;

  return filterPublishedArticles(data || [])
    .filter((art) => hasEditionHeadline(art, lang))
    .slice(0, safeLimit)
    .map(normalizeLatestArticle);
}

/**
 * Loads all initial SSR data needed by /latest and /en/latest.
 */
export async function loadLatestPageData({ lang = "ur", limit = 20 } = {}) {
  let categories = [];
  let breakingNews = [];
  let articles = [];
  let hasMore = false;
  let mostRead = [];
  let socialLinks = null;
  let breakingTickerEnabled = true;

  try {
    const [catRes, breakRes, timelineRes, topRes, fetchedSocial, tickerEnabled] = await Promise.all([
      supabaseAdmin.from("categories").select("*").order("display_order"),
      supabaseAdmin.from("breaking_news").select("*").eq("is_active", true).order("priority"),
      fetchLatestTimelinePage({ lang, offset: 0, limit }),
      fetchMostReadArticles({ lang, limit: 8 }),
      getSiteSetting("social_links").catch(() => null),
      getBreakingTickerEnabled({ fresh: true }).catch(() => true),
    ]);

    if (catRes.data) categories = catRes.data;
    if (breakRes.data) breakingNews = breakRes.data;
    articles = timelineRes.articles || [];
    hasMore = Boolean(timelineRes.hasMore);
    mostRead = topRes || [];
    socialLinks = fetchedSocial || null;
    breakingTickerEnabled = tickerEnabled;
  } catch (err) {
    console.error("Latest page fetch error:", err);
  }

  return {
    categories,
    breakingNews,
    articles,
    hasMore,
    mostRead,
    socialLinks,
    breakingTickerEnabled,
  };
}
