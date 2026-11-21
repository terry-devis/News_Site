import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { filterPublishedArticles } from "@/lib/articleMeta";
import CategoryClient from "@/component/CategoryClient";

export const revalidate = 60;

export default async function CategoryPage({ params }) {
  const slug = params.slug;
  if (slug === "staff") {
    redirect("/staff");
  }
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
    const { data: artData } = await artQuery.limit(60);
    if (artData) {
      const published = filterPublishedArticles(artData);
      if (category?.id) {
        articles = published.slice(0, 18);
      } else {
        const typeFilterMap = {
          factcheck: ["fact_check"],
          "fact-check": ["fact_check"],
          blog: ["blog"],
          blogs: ["blog"],
          column: ["column"],
          opinion: ["column", "blog"],
          video: ["video"],
          gallery: ["gallery"],
          "live-blog": ["live_blog"],
          "web-story": ["web_story"],
          infographic: ["infographic"],
        };
        const targetTypes = typeFilterMap[slug.toLowerCase()];
        if (targetTypes) {
          articles = published
            .filter(
              (a) =>
                targetTypes.includes(a.meta?.articleType) ||
                a.categories?.slug === slug
            )
            .slice(0, 18);
        } else {
          articles = published
            .filter((a) => a.categories?.slug === slug)
            .slice(0, 18);
        }
      }
    }
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
      factcheck: { name_ur: "فیکٹ چیک", name_en: "Fact Check" },
      "fact-check": { name_ur: "فیکٹ چیک", name_en: "Fact Check" },
      opinion: { name_ur: "رائے و کالم", name_en: "Opinion & Columns" },
      column: { name_ur: "کالم", name_en: "Columns" },
      blog: { name_ur: "بلاگ", name_en: "Blogs" },
      blogs: { name_ur: "بلاگ", name_en: "Blogs" },
      crime: { name_ur: "جرائم", name_en: "Crime" },
      religion: { name_ur: "دین و دنیا", name_en: "Religion & World" },
      gallery: { name_ur: "فوٹو گیلری", name_en: "Photo Gallery" },
      "live-blog": { name_ur: "لائیو بلاگ", name_en: "Live Blog" },
      "web-story": { name_ur: "ویب اسٹوریز", name_en: "Web Stories" },
      infographic: { name_ur: "انفوگرافکس", name_en: "Infographics" },
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
