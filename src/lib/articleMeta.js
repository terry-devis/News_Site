// Utilities for packing & unpacking structured article status, excerpt, and SEO/framing metadata
// safely inside `articles.content_en` without requiring destructive DB migrations.

const STATUS_RE = /<!--status:([a-z_]+)-->\n?/g;
const EXCERPT_RE = /<!--excerpt:([\s\S]*?)-->\n?/g;
const META_RE = /<!--meta:([\s\S]*?)-->\n?/g;

export const DEFAULT_ARTICLE_META = {
  seoTitle: "",
  seoDescription: "",
  focusKeyword: "",
  robotsNoindex: false,
  excludeFromNewsSitemap: false,
  scheduledAt: "",
  isExclusive: false,
  allowComments: true,
  coverImageAlt: "",
  coverFraming: null, // { focal: { x, y }, crops: { "16:9": ..., "4:3": ..., "1:1": ..., "3:4": ..., og: ... } }
  breakingPriority: 1,
  bylineUr: "",
  bylineEn: "",
  deletedAt: null,
};

export function unpackArticleMeta(rawContentEn) {
  let text = String(rawContentEn || "");
  let status = "published";
  let excerptEn = "";
  let meta = { ...DEFAULT_ARTICLE_META };

  const statusMatch = text.match(/<!--status:([a-z_]+)-->/);
  if (statusMatch) status = statusMatch[1];

  const excerptMatch = text.match(/<!--excerpt:([\s\S]*?)-->/);
  if (excerptMatch) excerptEn = excerptMatch[1].trim();

  const metaMatch = text.match(/<!--meta:([\s\S]*?)-->/);
  if (metaMatch) {
    try {
      const parsed = JSON.parse(metaMatch[1]);
      meta = { ...DEFAULT_ARTICLE_META, ...parsed };
    } catch {
      // ignore malformed meta comment
    }
  }

  const cleanContentEn = text
    .replace(STATUS_RE, "")
    .replace(EXCERPT_RE, "")
    .replace(META_RE, "")
    .trim();

  return { status, excerptEn, meta, cleanContentEn };
}

export function packArticleMeta({ status = "published", excerptEn = "", meta = null, contentEn = "" }) {
  const cleanBody = String(contentEn || "")
    .replace(STATUS_RE, "")
    .replace(EXCERPT_RE, "")
    .replace(META_RE, "")
    .trim();

  const parts = [`<!--status:${status}-->`];
  if (excerptEn && excerptEn.trim()) {
    parts.push(`<!--excerpt:${excerptEn.trim()}-->`);
  }
  if (meta && typeof meta === "object") {
    const merged = { ...DEFAULT_ARTICLE_META, ...meta };
    parts.push(`<!--meta:${JSON.stringify(merged)}-->`);
  }
  if (cleanBody) {
    parts.push(cleanBody);
  }
  return parts.join("\n");
}

export function isArticlePubliclyPublished(article) {
  if (!article) return { published: false, unpacked: null };
  const unpacked = unpackArticleMeta(article.content_en);
  if (unpacked.meta?.deletedAt) return { published: false, unpacked };
  if (unpacked.status === "published") return { published: true, unpacked };
  if (unpacked.status === "scheduled" && unpacked.meta?.scheduledAt) {
    const due = new Date(unpacked.meta.scheduledAt).getTime();
    if (!Number.isNaN(due) && due <= Date.now()) {
      return { published: true, unpacked };
    }
  }
  return { published: false, unpacked };
}

export function filterPublishedArticles(rows = []) {
  const out = [];
  for (const art of rows || []) {
    const { published, unpacked } = isArticlePubliclyPublished(art);
    if (!published) continue;
    const { content_ur: rawUr, content_en: _rawEn, ...cardFields } = art;
    let fallbackEn = "";
    if (!art.summary_en && !unpacked.excerptEn && unpacked.cleanContentEn) {
      const plainEn = unpacked.cleanContentEn.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      if (plainEn) fallbackEn = plainEn.length > 150 ? `${plainEn.slice(0, 150)}...` : plainEn;
    }
    let fallbackUr = "";
    if (!art.summary_ur && rawUr) {
      const plainUr = String(rawUr).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      if (plainUr) fallbackUr = plainUr.length > 160 ? `${plainUr.slice(0, 160)}...` : plainUr;
    }
    out.push({
      ...cardFields,
      status: "published",
      summary_ur: art.summary_ur || fallbackUr || "",
      summary_en: art.summary_en || unpacked.excerptEn || fallbackEn || "",
      author_name: unpacked.meta?.bylineUr || art.author_name || "ایڈیٹوریل ڈیسک",
      author_name_en: unpacked.meta?.bylineEn || art.author_name_en || art.author_name || "Editorial Desk",
      meta: unpacked.meta,
    });
  }
  return out;
}
