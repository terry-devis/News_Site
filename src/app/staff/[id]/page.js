import React from "react";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getPublicStaffMembers } from "@/lib/cmsDb";
import { filterPublishedArticles } from "@/lib/articleMeta";
import StaffDetailClient from "./StaffDetailClient";

export const revalidate = 60;

export async function generateMetadata({ params }) {
  try {
    const staffList = await getPublicStaffMembers({ includeInactive: false });
    const member = staffList.find((m) => String(m.id) === String(params.id));
    if (!member) {
      return { title: "اسٹاف — روزنامہ افادیت | Daily Afadiat" };
    }
    const name = member.name_ur || member.name_en || "اسٹاف";
    const role = member.designation_ur || member.designation_en || "";
    const title = role ? `${name} (${role}) — روزنامہ افادیت` : `${name} — روزنامہ افادیت`;
    const description =
      member.bio_ur ||
      member.bio_en ||
      `${member.name_en || name} — ${member.designation_en || role || "Daily Afadiat Editorial Team"}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: member.image_url ? [{ url: member.image_url }] : undefined,
      },
    };
  } catch {
    return { title: "اسٹاف — روزنامہ افادیت | Daily Afadiat" };
  }
}

export default async function StaffDetailPage({ params }) {
  const memberId = params.id;
  let categories = [];
  let breakingNews = [];
  let staffList = [];
  let authoredArticles = [];

  try {
    const [catRes, breakRes, breakingArtsRes, fetchedStaff] = await Promise.all([
      supabase.from("categories").select("*").order("display_order"),
      supabase.from("breaking_news").select("*").eq("is_active", true),
      supabase
        .from("articles")
        .select("id, title_ur, title_en, slug, is_breaking")
        .eq("is_breaking", true),
      getPublicStaffMembers({ includeInactive: false }),
    ]);

    if (catRes.data) categories = catRes.data;
    if (Array.isArray(fetchedStaff)) staffList = fetchedStaff;

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
    console.error("Staff detail fetch error:", err);
  }

  const member = staffList.find((m) => String(m.id) === String(memberId));
  if (!member) {
    notFound();
  }

  const colleagues = staffList
    .filter((m) => String(m.id) !== String(member.id))
    .slice(0, 6);

  // Fetch recent published articles matching this staff member's name/byline
  try {
    const nameKeys = [member.name_ur, member.name_en]
      .map((s) => (s || "").trim())
      .filter(Boolean);
    if (nameKeys.length > 0) {
      const { data: artRows } = await supabase
        .from("articles")
        .select("id, title_ur, title_en, slug, author_name, content_en, created_at")
        .order("created_at", { ascending: false })
        .limit(40);
      if (artRows) {
        const published = filterPublishedArticles(artRows);
        authoredArticles = published
          .filter((a) => {
            const urByline = (a.author_name || "").trim().toLowerCase();
            const enByline = (a.author_name_en || a.meta?.bylineEn || "").trim().toLowerCase();
            return nameKeys.some((k) => {
              const lk = k.toLowerCase();
              return (urByline && urByline.includes(lk)) || (enByline && enByline.includes(lk));
            });
          })
          .slice(0, 8);
      }
    }
  } catch {
    // Non-fatal if articles query fails
  }

  return (
    <StaffDetailClient
      member={member}
      colleagues={colleagues}
      authoredArticles={authoredArticles}
      categories={categories}
      breakingNews={breakingNews}
    />
  );
}
