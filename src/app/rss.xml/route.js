import { supabaseAdmin } from "@/lib/supabaseServer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function escapeXml(unsafe) {
  if (!unsafe) return "";
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function cdata(str) {
  if (!str) return "";
  // Ensure CDATA closing tag is safely escaped if present
  const safe = String(str).replace(/]]>/g, "]]]]><![CDATA[>");
  return `<![CDATA[${safe}]]>`;
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const lang = searchParams.get("lang"); // optional 'en' or 'ur'
    const limit = Math.min(Number(searchParams.get("limit")) || 50, 100);

    // Determine base site URL dynamically
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "localhost:3000";
    const protocol = req.headers.get("x-forwarded-proto") || (host.startsWith("localhost") ? "http" : "https");
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${protocol}://${host}`;

    let query = supabaseAdmin
      .from("articles")
      .select("*, categories(*)")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (category) {
      query = query.eq("categories.slug", category);
    }

    const { data: articles, error } = await query;
    if (error) {
      console.error("RSS feed query error:", error);
      throw error;
    }

    const items = articles || [];
    const latestDate = items.length > 0
      ? new Date(items[0].created_at).toUTCString()
      : new Date().toUTCString();

    const itemsXml = items
      .map((article) => {
        const isEn = lang === "en";
        const title = isEn && article.title_en ? article.title_en : article.title_ur;
        const description = (isEn && article.content_en)
          ? (article.content_en.slice(0, 300) + "...")
          : (article.summary_ur || article.content_ur?.slice(0, 300) + "...");
        const articleUrl = `${siteUrl}/story/${article.id}`;
        const pubDate = new Date(article.created_at || Date.now()).toUTCString();
        const categoryName = isEn
          ? (article.categories?.name_en || article.categories?.name_ur || "General")
          : (article.categories?.name_ur || "پاکستان");
        const author = article.author_name || "ایڈمن ڈیلی افادیت";

        const enclosureTag = article.cover_image
          ? `\n      <enclosure url="${escapeXml(article.cover_image)}" type="image/jpeg" length="0" />`
          : "";

        return `    <item>
      <title>${cdata(title)}</title>
      <link>${articleUrl}</link>
      <guid isPermaLink="true">${articleUrl}</guid>
      <description>${cdata(description)}</description>
      <pubDate>${pubDate}</pubDate>
      <dc:creator>${cdata(author)}</dc:creator>
      <category>${cdata(categoryName)}</category>${enclosureTag}
    </item>`;
      })
      .join("\n");

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
  xmlns:atom="http://www.w3.org/2005/Atom" 
  xmlns:dc="http://purl.org/dc/elements/1.1/"
  xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title><![CDATA[ڈیلی افادیت | Daily Afadiat]]></title>
    <link>${siteUrl}</link>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml"/>
    <description><![CDATA[پاکستان اور دنیا بھر کی تازہ ترین خبریں، بریکنگ نیوز، کھیل، بزنس اور باوثوق تجزیے۔ سچ کے ساتھ، ہر لمحہ باخبر۔]]></description>
    <language>ur</language>
    <lastBuildDate>${latestDate}</lastBuildDate>
    <copyright><![CDATA[© ${new Date().getFullYear()} Daily Afadiat. All rights reserved.]]></copyright>
    <image>
      <url>${siteUrl}/logo-light.webp</url>
      <title><![CDATA[ڈیلی افادیت]]></title>
      <link>${siteUrl}</link>
    </image>
${itemsXml}
  </channel>
</rss>`;

    return new Response(rssXml, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    console.error("RSS generation error:", err);
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Daily Afadiat</title><description>Error generating feed</description></channel></rss>`,
      {
        status: 500,
        headers: { "Content-Type": "application/xml; charset=utf-8" },
      }
    );
  }
}
