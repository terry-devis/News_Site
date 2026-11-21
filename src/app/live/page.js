import React from "react";
import { supabase } from "@/lib/supabase";
import { getSiteSetting } from "@/lib/cmsDb";
import LiveClient from "./LiveClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "لائیو ٹی وی — ڈیلی افادیت | Live TV 24/7 Transmission",
  description: "ڈیلی افادیت کی ۲۴ گھنٹے لائیو نشریات، پل پل کی مصدقہ بریکنگ نیوز اور خصوصی تجزیاتی پروگرامز۔",
};

export default async function LivePage() {
  let categories = [];
  let breakingNews = [];
  let liveStreams = null;

  try {
    const [catRes, breakRes, breakingArtsRes, storedStreams] = await Promise.all([
      supabase.from("categories").select("*").order("display_order"),
      supabase.from("breaking_news").select("*").eq("is_active", true),
      supabase.from("articles").select("id, title_ur, title_en, slug, is_breaking").eq("is_breaking", true),
      getSiteSetting("live_streams").catch(() => null),
    ]);

    if (catRes.data) categories = catRes.data;
    if (Array.isArray(storedStreams) && storedStreams.length > 0) liveStreams = storedStreams;

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
    console.error("Live page fetch error:", err);
  }

  return (
    <LiveClient
      categories={categories}
      breakingNews={breakingNews}
      initialChannels={liveStreams}
    />
  );
}
