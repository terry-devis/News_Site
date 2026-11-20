import { supabaseAdmin } from "@/lib/supabaseServer";
import { unpackArticleMeta } from "@/lib/articleMeta";

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

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dailyafadiat.com";
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

    const urlsXml = validItems
      .map((art) => {
        const title = art.title_ur || art.title_en || "";
        const lang = art.title_ur ? "ur" : "en";
        const pubDate = new Date(art.created_at || Date.now()).toISOString();
        const loc = `${baseUrl}/story/${art.slug || art.id}`;
        const keywords = art.categories?.name_en || art.categories?.name_ur || "News";

        return `  <url>
    <loc>${escapeXml(loc)}</loc>
    <news:news>
      <news:publication>
        <news:name>Daily Afadiat</news:name>
        <news:language>${lang}</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${escapeXml(title)}</news:title>
      <news:keywords>${escapeXml(keywords)}</news:keywords>
    </news:news>
  </url>`;
      })
      .join("\n");

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urlsXml}
</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    console.error("News sitemap error:", err);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      { status: 500, headers: { "Content-Type": "application/xml; charset=utf-8" } }
    );
  }
}
