import React from "react";
import { supabase } from "@/lib/supabase";
import VideoClient from "./VideoClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "ویڈیوز — ڈیلی افادیت | Daily Afadiat Video Portal",
  description: "ڈیلی افادیت کے خصوصی ویڈیو پیکجز، فیلڈ رپورٹس، ڈاکومنٹریز اور لائیو تجزیات۔",
};

export default async function VideoPage() {
  let categories = [];
  let breakingNews = [];

  try {
    const [catRes, breakRes, breakingArtsRes] = await Promise.all([
      supabase.from("categories").select("*").order("display_order"),
      supabase.from("breaking_news").select("*").eq("is_active", true),
      supabase.from("articles").select("id, title_ur, title_en, slug, is_breaking").eq("is_breaking", true),
    ]);

    if (catRes.data) categories = catRes.data;

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
    console.error("Video page fetch error:", err);
  }

  return <VideoClient categories={categories} breakingNews={breakingNews} />;
}
