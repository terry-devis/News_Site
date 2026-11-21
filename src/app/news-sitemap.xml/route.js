import { supabaseAdmin } from "@/lib/supabaseServer";
import { unpackArticleMeta } from "@/lib/articleMeta";
import { resolvePublicSiteUrl } from "@/lib/seoUrl";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function escapeXml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(req) {
  const baseUrl = resolvePublicSiteUrl(req);
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();

  try {
    const { data: articles, error } = await supabaseAdmin
      .from("articles")
      .select("id, slug, title_ur, title_en, content_en, created_at, categories(name_ur, name_en)")
      .gte("created_at", twoDaysAgo)
      .order("created_at", { ascending: false })
      .limit(1000);

    if (error) throw error;

    const validItems = (articles || []).filter((art) => {
      const { status, meta } = unpackArticleMeta(art.content_en);
      return status === "published" && !meta.robotsNoindex && !meta.excludeFromNewsSitemap;
    });

    const urlEntries = [];
    for (const art of validItems) {
      const { meta } = unpackArticleMeta(art.content_en);
      const slugOrId = art.slug || art.id;
      const pubDate = new Date(art.created_at || Date.now()).toISOString();

      if (art.title_ur && art.title_ur.trim()) {
        const kwUr = [
          meta.focusKeywordUr || meta.focusKeyword,
          ...(Array.isArray(meta.tagsUr) ? meta.tagsUr : []),
          art.categories?.name_ur || art.categories?.name_en || "News",
        ]
          .filter(Boolean)
          .join(", ");

        urlEntries.push(`  <url>
    <loc>${escapeXml(`${baseUrl}/story/${slugOrId}`)}</loc>
    <news:news>
      <news:publication>
        <news:name>Daily Afadiat</news:name>
        <news:language>ur</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${escapeXml(art.title_ur)}</news:title>
      <news:keywords>${escapeXml(kwUr)}</news:keywords>
    </news:news>
  </url>`);
      }

      if (art.title_en && art.title_en.trim()) {
        const kwEn = [
          meta.focusKeywordEn,
          ...(Array.isArray(meta.tagsEn) ? meta.tagsEn : []),
          art.categories?.name_en || "News",
        ]
          .filter(Boolean)
          .join(", ");

        urlEntries.push(`  <url>
    <loc>${escapeXml(`${baseUrl}/en/story/${slugOrId}`)}</loc>
    <news:news>
      <news:publication>
        <news:name>Daily Afadiat</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${escapeXml(art.title_en)}</news:title>
      <news:keywords>${escapeXml(kwEn)}</news:keywords>
    </news:news>
  </url>`);
      }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urlEntries.join("\n")}
</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      },
    });
  } catch (err) {
    console.error("News sitemap generation error:", err);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      { status: 500, headers: { "Content-Type": "application/xml" } }
    );
  }
}
