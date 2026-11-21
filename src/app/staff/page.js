import React from "react";
import { supabase } from "@/lib/supabase";
import { getPublicStaffMembers } from "@/lib/cmsDb";
import StaffClient from "./StaffClient";

export const revalidate = 60;

export const metadata = {
  title: "ادارتی عملہ و اسٹاف — روزنامہ افادیت | Daily Afadiat Staff Directory",
  description:
    "روزنامہ افادیت کا ادارتی بورڈ، بیورو چیفس، رپورٹرز اور نیوز روم عملے کی مکمل تفصیلات اور رابطہ نمبرز۔",
};

export default async function StaffPage() {
  let categories = [];
  let breakingNews = [];
  let staff = [];

  try {
    const [catRes, breakRes, breakingArtsRes, staffData] = await Promise.all([
      supabase.from("categories").select("*").order("display_order"),
      supabase.from("breaking_news").select("*").eq("is_active", true),
      supabase
        .from("articles")
        .select("id, title_ur, title_en, slug, is_breaking")
        .eq("is_breaking", true),
      getPublicStaffMembers({ includeInactive: false }),
    ]);

    if (catRes.data) categories = catRes.data;
    if (Array.isArray(staffData)) staff = staffData;

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
    console.error("Staff page fetch error:", err);
  }

  return (
    <StaffClient
      categories={categories}
      breakingNews={breakingNews}
      initialStaff={staff}
    />
  );
}
