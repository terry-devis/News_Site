import { supabase } from "@/lib/supabase";
import { getVideos, getSiteSetting } from "@/lib/cmsDb";
import { filterPublishedArticles } from "@/lib/articleMeta";
import { resolvePublicSiteUrl } from "@/lib/seoUrl";
import HomeClient from "@/component/HomeClient";

export const revalidate = 60;

export async function generateMetadata() {
  const baseUrl = resolvePublicSiteUrl();
  return {
    title: "Daily Afadiat — Truth, Integrity & Global News (English Edition)",
    description:
      "Daily Afadiat English Edition: Latest verified news from Pakistan, World, Business, Sports, Science & Technology, and ePaper.",
    alternates: {
      canonical: `${baseUrl}/en`,
      languages: {
        ur: `${baseUrl}/`,
        en: `${baseUrl}/en`,
        "x-default": `${baseUrl}/`,
      },
    },
    openGraph: {
      type: "website",
      url: `${baseUrl}/en`,
      title: "Daily Afadiat — English Edition",
      description:
        "Latest verified news from Pakistan, World, Business, Sports, and Science & Technology.",
      locale: "en_US",
      siteName: "Daily Afadiat",
    },
  };
}

export default async function EnglishHomePage() {
  let categories = [];
  let breakingNews = [];
  let articles = [];
  let videos = [];
  let socialLinks = null;

  try {
    const [catRes, breakRes, artRes, fetchedVideos, fetchedSocial] = await Promise.all([
      supabase.from("categories").select("*").order("display_order"),
      supabase.from("breaking_news").select("*").eq("is_active", true).order("priority"),
      supabase
        .from("articles")
        .select("*, categories(*)")
        .order("created_at", { ascending: false })
        .limit(60),
      getVideos().catch(() => []),
      getSiteSetting("social_links").catch(() => null),
    ]);

    if (catRes.data?.length) categories = catRes.data;
    if (breakRes.data?.length) breakingNews = breakRes.data;
    if (artRes.data?.length) articles = filterPublishedArticles(artRes.data);
    videos = fetchedVideos || [];
    socialLinks = fetchedSocial || null;
  } catch (err) {
    console.error("English homepage fetch error:", err);
  }

  const newsList = articles.map((art) => ({
    ...art,
    cover_image:
      art.cover_image && typeof art.cover_image === "string" && art.cover_image.trim()
        ? art.cover_image
        : "/logo-light.webp",
    title_ur: art.title_ur || "",
    title_en: art.title_en || "",
    summary_ur: art.summary_ur || "",
    summary_en: art.summary_en || "",
    author_name: art.author_name || "ایڈیٹوریل بورڈ",
    author_name_en: art.author_name_en || art.author_name || "Editorial Board",
    category: art.categories || art.category || { name_ur: "پاکستان", name_en: "Pakistan", slug: "pakistan" },
    views_count: Number(art.views_count) || 0,
  }));

  const articleBreaking = articles
    .filter((a) => a.is_breaking && a.title_en && a.title_en.trim())
    .map((a) => ({
      id: `art-${a.id}`,
      text_ur: a.title_ur,
      text_en: a.title_en,
      link_url: `/en/story/${a.slug || a.id}`,
      article_id: a.id,
      priority: 0,
      is_active: true,
    }));

  const allBreaking = [...articleBreaking];
  for (const b of breakingNews) {
    if (!b.text_en) continue;
    if (!allBreaking.some((item) => item.text_en?.trim() === b.text_en?.trim())) {
      allBreaking.push(b);
    }
  }

  return (
    <HomeClient
      articles={newsList}
      categories={categories}
      breakingNews={allBreaking}
      videos={videos}
      socialLinks={socialLinks}
      initialLang="en"
    />
  );
}
