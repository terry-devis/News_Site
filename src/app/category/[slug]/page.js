import { supabase } from "@/lib/supabase";
import { filterPublishedArticles } from "@/lib/articleMeta";
import CategoryClient from "@/component/CategoryClient";

export const revalidate = 60;

export default async function CategoryPage({ params }) {
  const slug = params.slug;
  let category = null;
  let articles = [];
  let categories = [];

  try {
    const [catRes, allCatsRes] = await Promise.all([
      supabase.from("categories").select("*").eq("slug", slug).single(),
      supabase.from("categories").select("*").order("display_order"),
    ]);

    if (catRes.data) category = catRes.data;
    if (allCatsRes.data) categories = allCatsRes.data;

    let artQuery = supabase
      .from("articles")
      .select("*, categories(*)")
      .order("created_at", { ascending: false });

    if (category?.id) {
      artQuery = artQuery.eq("category_id", category.id);
    }
    const { data: artData } = await artQuery.limit(30);
    if (artData) articles = filterPublishedArticles(artData).slice(0, 18);
  } catch (err) {
    console.error("Category fetch error:", err);
  }

  // Fallback category if database is empty
  if (!category) {
    const slugMap = {
      pakistan: { name_ur: "پاکستان", name_en: "Pakistan" },
      world: { name_ur: "انٹرنیشنل", name_en: "World" },
      sports: { name_ur: "کھیل", name_en: "Sports" },
      business: { name_ur: "بزنس", name_en: "Business" },
      tech: { name_ur: "سائنس و ٹیکنالوجی", name_en: "Science & Tech" },
      health: { name_ur: "صحت", name_en: "Health" },
      weird: { name_ur: "دلچسپ و عجیب", name_en: "Odd & Curious" },
    };
    category = {
      id: 99,
      slug,
      name_ur: slugMap[slug]?.name_ur || slug,
      name_en: slugMap[slug]?.name_en || slug.toUpperCase(),
    };
  }

  return (
    <CategoryClient
      slug={slug}
      category={category}
      articles={articles}
      categories={categories}
    />
  );
}
