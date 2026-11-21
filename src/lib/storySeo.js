import { supabase } from "@/lib/supabase";
import { isArticlePubliclyPublished, filterPublishedArticles } from "@/lib/articleMeta";
import { resolvePublicSiteUrl } from "@/lib/seoUrl";

export async function loadStoryPageData(storyIdOrSlug) {
  let article = null;
  let related = [];
  let categories = [];
  let breakingNews = [];
  let isHiddenDraft = false;

  try {
    const [catRes, breakRes, breakingArtsRes] = await Promise.all([
      supabase.from("categories").select("*").order("display_order"),
      supabase.from("breaking_news").select("*").eq("is_active", true),
      supabase
        .from("articles")
        .select("id, title_ur, title_en, slug, is_breaking, content_en")
        .eq("is_breaking", true),
    ]);
    if (catRes.data) categories = catRes.data;

    const artBreaking = filterPublishedArticles(breakingArtsRes.data || []).map((a) => ({
      id: `art-${a.id}`,
      text_ur: a.title_ur,
      text_en: a.title_en || a.title_ur,
      link_url: `/story/${a.id || a.slug}`,
      article_id: a.id,
      priority: 0,
      is_active: true,
    }));

    const rawBreaking = breakRes.data || [];
    const allBreaking = [...artBreaking];
    for (const b of rawBreaking) {
      if (!allBreaking.some((x) => x.text_ur?.trim() === b.text_ur?.trim())) {
        allBreaking.push(b);
      }
    }
    breakingNews = allBreaking;

    let query = supabase.from("articles").select("*, categories(*)");
    if (!isNaN(storyIdOrSlug)) {
      query = query.eq("id", parseInt(storyIdOrSlug, 10));
    } else {
      query = query.eq("slug", storyIdOrSlug);
    }

    const { data } = await query.single();
    if (data) {
      const { published, unpacked } = isArticlePubliclyPublished(data);
      if (!published) {
        isHiddenDraft = true;
      } else {
        article = {
          ...data,
          status: "published",
          summary_en: data.summary_en || unpacked.excerptEn || "",
          author_name: unpacked.meta?.bylineUr || data.author_name || "ایڈیٹوریل ڈیسک",
          author_name_en:
            unpacked.meta?.bylineEn || data.author_name_en || data.author_name || "Editorial Desk",
          meta: unpacked.meta,
          content_en: unpacked.cleanContentEn,
        };
      }
    }

    const { data: recents } = await supabase
      .from("articles")
      .select("*, categories(*)")
      .neq("id", article?.id || 0)
      .order("created_at", { ascending: false })
      .limit(10);

    if (recents) related = filterPublishedArticles(recents).slice(0, 5);
  } catch (err) {
    console.error("Story fetch error:", err);
  }

  return { article, related, categories, breakingNews, isHiddenDraft };
}

export async function buildStoryMetadata(storyIdOrSlug, lang = "ur") {
  const { article, isHiddenDraft } = await loadStoryPageData(storyIdOrSlug);
  const baseUrl = resolvePublicSiteUrl();
  const slugOrId = article?.slug || storyIdOrSlug;
  const urUrl = `${baseUrl}/story/${slugOrId}`;
  const enUrl = `${baseUrl}/en/story/${slugOrId}`;

  if (!article || isHiddenDraft) {
    return {
      title: lang === "en" ? "Story Not Found — Daily Afadiat" : "خبر دستیاب نہیں — ڈیلی افادیت",
      robots: { index: false, follow: false },
    };
  }

  const isEn = lang === "en";
  const hasEnglish = Boolean(article.title_en && article.title_en.trim());
  const meta = article.meta || {};

  const title = isEn
    ? meta.seoTitleEn || article.title_en || article.title_ur
    : meta.seoTitleUr || meta.seoTitle || article.title_ur || article.title_en;

  const description = isEn
    ? meta.seoDescriptionEn || article.summary_en || article.title_en || ""
    : meta.seoDescriptionUr || meta.seoDescription || article.summary_ur || article.title_ur || "";

  const tags = isEn
    ? Array.isArray(meta.tagsEn) ? meta.tagsEn : []
    : Array.isArray(meta.tagsUr) ? meta.tagsUr : [];
  const focusKw = isEn
    ? meta.focusKeywordEn || ""
    : meta.focusKeywordUr || meta.focusKeyword || "";
  const keywords = [focusKw, ...tags].filter(Boolean);

  const canonical = isEn && hasEnglish ? enUrl : urUrl;
  const languages = {
    ur: urUrl,
    "x-default": urUrl,
  };
  if (hasEnglish) {
    languages.en = enUrl;
  }

  const ogImages = article.cover_image
    ? [{ url: article.cover_image, width: 1200, height: 630, alt: meta.coverImageAlt || title }]
    : [{ url: `${baseUrl}/icon-192.png`, width: 192, height: 192, alt: "Daily Afadiat" }];

  return {
    title,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    robots: meta.robotsNoindex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      type: "article",
      url: canonical,
      title,
      description,
      siteName: isEn ? "Daily Afadiat" : "ڈیلی افادیت",
      locale: isEn ? "en_US" : "ur_PK",
      publishedTime: article.created_at,
      modifiedTime: article.updated_at || article.created_at,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImages.map((img) => img.url),
    },
  };
}

export function buildNewsArticleJsonLd(article, lang = "ur") {
  if (!article) return null;
  const baseUrl = resolvePublicSiteUrl();
  const isEn = lang === "en";
  const slugOrId = article.slug || article.id;
  const url = isEn ? `${baseUrl}/en/story/${slugOrId}` : `${baseUrl}/story/${slugOrId}`;
  const headline = isEn
    ? article.title_en || article.title_ur
    : article.title_ur || article.title_en;
  const description = isEn
    ? article.meta?.seoDescriptionEn || article.summary_en || headline
    : article.meta?.seoDescriptionUr || article.meta?.seoDescription || article.summary_ur || headline;
  const authorName = isEn
    ? article.author_name_en || "Daily Afadiat Editorial Board"
    : article.author_name || "ایڈیٹوریل بورڈ ڈیلی افادیت";

  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    headline,
    description,
    inLanguage: isEn ? "en" : "ur",
    image: article.cover_image ? [article.cover_image] : [`${baseUrl}/icon-192.png`],
    datePublished: article.created_at || new Date().toISOString(),
    dateModified: article.updated_at || article.created_at || new Date().toISOString(),
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "NewsMediaOrganization",
      name: isEn ? "Daily Afadiat" : "روزنامہ افادیت",
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/icon-192.png`,
      },
    },
  };
}
