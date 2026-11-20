import { supabaseAdmin } from "@/lib/supabaseServer";
import { unpackArticleMeta } from "@/lib/articleMeta";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://dailyafadiat.com";

  // 1. Static Core Pages
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/latest`,
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/rates`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/video`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/epaper`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/live`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/advertise`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  try {
    // 2. Dynamic Categories
    const { data: categories } = await supabaseAdmin
      .from("categories")
      .select("slug, created_at");

    const categoryRoutes = (categories || []).map((cat) => ({
      url: `${baseUrl}/category/${cat.slug}`,
      lastModified: cat.created_at ? new Date(cat.created_at) : new Date(),
      changeFrequency: "hourly",
      priority: 0.8,
    }));

    // 3. Dynamic Published Articles (excluding drafts, trashed & robotsNoindex)
    const { data: articles } = await supabaseAdmin
      .from("articles")
      .select("id, slug, content_en, created_at, updated_at")
      .order("created_at", { ascending: false });

    const articleRoutes = (articles || [])
      .filter((art) => {
        const { status, meta } = unpackArticleMeta(art.content_en);
        return status === "published" && !meta.robotsNoindex;
      })
      .map((art) => ({
        url: `${baseUrl}/story/${art.slug || art.id}`,
        lastModified: new Date(art.updated_at || art.created_at || Date.now()),
        changeFrequency: "weekly",
        priority: 0.7,
      }));

    return [...staticRoutes, ...categoryRoutes, ...articleRoutes];
  } catch (error) {
    console.error("Error generating dynamic sitemap:", error);
    return staticRoutes;
  }
}
