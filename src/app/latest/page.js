import { supabase } from "@/lib/supabase";
import { filterPublishedArticles } from "@/lib/articleMeta";
import CategoryClient from "@/component/CategoryClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "تازہ ترین خبریں — ڈیلی افادیت | Latest News",
  description: "ڈیلی افادیت پر پاکستان اور دنیا بھر کی تازہ ترین اور مصدقہ خبریں۔",
};

export default async function LatestPage() {
  let categories = [];
  let breakingNews = [];
  let articles = [];

  try {
    const [catRes, breakRes, artRes] = await Promise.all([
      supabase.from("categories").select("*").order("display_order"),
      supabase.from("breaking_news").select("*").eq("is_active", true).order("priority"),
      supabase
        .from("articles")
        .select("*, categories(*)")
        .order("created_at", { ascending: false })
        .limit(40),
    ]);

    if (catRes.data) categories = catRes.data;
    if (breakRes.data) breakingNews = breakRes.data;
    if (artRes.data) {
      articles = filterPublishedArticles(artRes.data).slice(0, 24);
    }
  } catch (err) {
    console.error("Latest page fetch error:", err);
  }

  const latestCategory = {
    id: "latest",
    slug: "latest",
    name_ur: "تازہ ترین",
    name_en: "Latest News",
  };

  return (
    <CategoryClient
      category={latestCategory}
      articles={articles}
      categories={categories}
      breakingNews={breakingNews}
    />
  );
}
