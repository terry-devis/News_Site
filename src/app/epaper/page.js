import React from "react";
import { supabase } from "@/lib/supabase";
import { getEpaperEditions } from "@/lib/cmsDb";
import EPaperClient from "./EPaperClient";

export const revalidate = 60;

export const metadata = {
  title: "ڈیلی افادیت ای پیپر — آج کا اخبار | Daily Afadiat Digital ePaper",
  description: "ڈیلی افادیت کا مکمل پرنٹ ایڈیشن ڈیجیٹل فارمیٹ میں پڑھیے اور ڈاؤنلوڈ کیجیے۔ تمام صفحات اور تاریخی آرکائیو۔",
};

export default async function EPaperPage() {
  let categories = [];
  let breakingNews = [];
  let editions = [];

  try {
    const [catRes, breakRes, breakingArtsRes, epaperData] = await Promise.all([
      supabase.from("categories").select("*").order("display_order"),
      supabase.from("breaking_news").select("*").eq("is_active", true),
      supabase.from("articles").select("id, title_ur, title_en, slug, is_breaking").eq("is_breaking", true),
      getEpaperEditions(),
    ]);

    if (catRes.data) categories = catRes.data;
    if (epaperData) editions = epaperData;

    const artBreaking = (breakingArtsRes.data || []).map((a) => ({
      id: `art-${a.id}`,
      text_ur: a.title_ur,
      text_en: a.title_en || a.title_ur,
      link_url: `/story/${a.id || a.slug}`,
      article_id: a.id,
      priority: 0,
      is_active: true,
    }));

    const rawBreaking = breakRes.data || [];
    const allBreaking = [...artBreaking];
    for (const b of rawBreaking) {
      if (!allBreaking.some((x) => x.text_ur?.trim() === b.text_ur?.trim())) {
        allBreaking.push(b);
      }
    }
    breakingNews = allBreaking;
  } catch (err) {
    console.error("EPaper page fetch error:", err);
  }

  return <EPaperClient categories={categories} breakingNews={breakingNews} initialEditions={editions} />;
}
