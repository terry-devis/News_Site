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
