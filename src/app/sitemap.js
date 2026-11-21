import { supabaseAdmin } from "@/lib/supabaseServer";
import { unpackArticleMeta } from "@/lib/articleMeta";
import { resolvePublicSiteUrl } from "@/lib/seoUrl";

export const dynamic = "force-dynamic";

export default async function sitemap() {
  const baseUrl = resolvePublicSiteUrl();

  // 1. Static Core Pages (Urdu + English Homepage)
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 1.0,
      alternates: {
        languages: {
          ur: baseUrl,
          en: `${baseUrl}/en`,
        },
      },
    },
    {
      url: `${baseUrl}/en`,
      lastModified: new Date(),
      changeFrequency: "always",
      priority: 0.95,
      alternates: {
        languages: {
          ur: baseUrl,
          en: `${baseUrl}/en`,
        },
      },
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
      url: `${baseUrl}/staff`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
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

    // 3. Dynamic Published Articles (both Urdu & English URLs with hreflang alternates)
    const { data: articles } = await supabaseAdmin
      .from("articles")
      .select("id, slug, title_ur, title_en, content_en, created_at, updated_at")
      .order("created_at", { ascending: false });

    const articleRoutes = [];
    for (const art of articles || []) {
      const { status, meta } = unpackArticleMeta(art.content_en);
      if (status !== "published" || meta.robotsNoindex) continue;

      const slugOrId = art.slug || art.id;
      const urUrl = `${baseUrl}/story/${slugOrId}`;
      const enUrl = `${baseUrl}/en/story/${slugOrId}`;
      const hasUr = Boolean(art.title_ur && art.title_ur.trim());
      const hasEn = Boolean(art.title_en && art.title_en.trim());
      const lastModified = new Date(art.updated_at || art.created_at || Date.now());

      const languages = {};
      if (hasUr) languages.ur = urUrl;
      if (hasEn) languages.en = enUrl;

      if (hasUr || !hasEn) {
        articleRoutes.push({
          url: urUrl,
          lastModified,
          changeFrequency: "weekly",
          priority: 0.75,
          alternates: Object.keys(languages).length > 1 ? { languages } : undefined,
        });
      }

      if (hasEn) {
        articleRoutes.push({
          url: enUrl,
          lastModified,
          changeFrequency: "weekly",
          priority: 0.75,
          alternates: Object.keys(languages).length > 1 ? { languages } : undefined,
        });
      }
    }

    return [...staticRoutes, ...categoryRoutes, ...articleRoutes];
  } catch (error) {
    console.error("Error generating dynamic sitemap:", error);
    return staticRoutes;
  }
}
