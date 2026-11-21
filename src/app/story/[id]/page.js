import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isArticlePubliclyPublished, filterPublishedArticles } from "@/lib/articleMeta";
import StoryClient from "@/component/StoryClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function StoryDetail({ params }) {
  const storyIdOrSlug = params.id;
  let article = null;
  let related = [];
  let categories = [];
  let breakingNews = [];
  let isHiddenDraft = false;

  try {
    const [catRes, breakRes, breakingArtsRes] = await Promise.all([
      supabase.from("categories").select("*").order("display_order"),
      supabase.from("breaking_news").select("*").eq("is_active", true),
      supabase.from("articles").select("id, title_ur, title_en, slug, is_breaking, content_en").eq("is_breaking", true),
    ]);
    if (catRes.data) categories = catRes.data;

    const artBreaking = filterPublishedArticles(breakingArtsRes.data || []).map((a) => ({
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

    // Fetch article by ID or slug
    let query = supabase.from("articles").select("*, categories(*)");
    if (!isNaN(storyIdOrSlug)) {
      query = query.eq("id", parseInt(storyIdOrSlug));
    } else {
      query = query.eq("slug", storyIdOrSlug);
    }

    const { data } = await query.single();
    if (data) {
      const { published, unpacked } = isArticlePubliclyPublished(data);
      if (!published) {
        isHiddenDraft = true;
      } else {
        article = {
          ...data,
          status: "published",
          summary_en: data.summary_en || unpacked.excerptEn || "",
          meta: unpacked.meta,
          content_en: unpacked.cleanContentEn,
        };
      }
    }

    // Fetch related/recent stories
    const { data: recents } = await supabase
      .from("articles")
      .select("*, categories(*)")
      .neq("id", article?.id || 0)
      .order("created_at", { ascending: false })
      .limit(10);

    if (recents) related = filterPublishedArticles(recents).slice(0, 5);
  } catch (err) {
    console.error("Story fetch error:", err);
  }

  if (isHiddenDraft) {
    notFound();
  }

  // Fallback article if Supabase tables are still empty
  if (!article) {
    article = {
      id: 1,
      title_ur: "ڈیلی افادیت نیوز پورٹل کا باضابطہ آغاز: سچائی اور فوری خبروں کا نیا دور",
      title_en: "Official Launch of Daily Afadiat Portal: A New Era of Truth and Instant News",
      summary_ur: "ڈیلی افادیت کا نیا ڈیجیٹل پورٹل جدید ترین ٹیکنالوجی، شفاف رپورٹنگ اور برق رفتار لائیو اپڈیٹس کے ساتھ قارئین کے لیے پیش کر دیا گیا ہے۔",
      summary_en: "Daily Afadiat's new digital portal has been launched, featuring state-of-the-art news reporting, editorial integrity, and rapid updates.",
      content_ur: `
        <p class="mb-4">ڈیلی افادیت کا مشن قارئین تک پل پل کی مصدقہ اور غیر جانبدارانہ خبریں پہنچانا ہے۔ آج کے ڈیجیٹل دور میں جہاں معلومات کا سیلاب ہے، وہاں سچ اور افواہ میں تفریق کرنا سب سے بڑی ذمہ داری ہے۔</p>
        <p class="mb-4">ہمارا ادارہ جدید ترین ٹیکنالوجی کے ذریعے پاکستان اور دنیا بھر کے اہم ترین واقعات، معیشت، سیاست، ٹیکنالوجی اور کھیل کے میدان کی خبریں آپ تک لمحہ بہ لمحہ پہنچاتا رہے گا۔</p>
        <p class="mb-4">قارئین ہماری لائیو نشریات اور ڈیجیٹل ای پیپر کے ذریعے بھی ہر خبر سے ہمہ وقت باخبر رہ سکتے ہیں۔</p>
      `,
      content_en: `
        <p class="mb-4">Daily Afadiat is committed to delivering verified, authentic, and unbiased news to readers across Pakistan and around the world. In an era saturated with unverified information, discerning truth from sensationalism is our foremost editorial duty.</p>
        <p class="mb-4">Through our dedicated newsrooms, bureau networks, and cutting-edge digital infrastructure, we provide moment-by-moment coverage of geopolitics, economics, science, sports, and human interest stories.</p>
        <p class="mb-4">Readers can also tune into our digital live broadcasting and download daily ePaper editions anytime, anywhere.</p>
      `,
      cover_image: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop",
      created_at: new Date().toISOString(),
      category: { name_ur: "پاکستان", name_en: "Pakistan", slug: "pakistan" },
      author_name: "ایڈیٹوریل بورڈ ڈیلی افادیت",
      author_name_en: "Daily Afadiat Editorial Board",
    };
  }

  // Fallback related if database has none
  if (related.length === 0) {
    related = [
      {
        id: 2,
        title_ur: "اسٹیٹ بینک آف پاکستان کا مانیٹری پالیسی کا اعلان، شرح سود میں استحکام",
        title_en: "State Bank of Pakistan Maintains Policy Rate in Latest Review",
        cover_image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop",
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 3,
        title_ur: "پاکستان کرکٹ ٹیم نے ون ڈے سیریز اپنے نام کر لی، شائقین کا جشن",
        title_en: "Pakistan Cricket Team Clinches ODI Series in Thrilling Victory",
        cover_image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&auto=format&fit=crop",
        created_at: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 4,
        title_ur: "عالمی منڈی میں تیل اور خام مال کی قیمتوں میں غیر معمولی اتار چڑھاؤ",
        title_en: "Fluctuations in Global Oil and Commodity Markets",
        cover_image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop",
        created_at: new Date(Date.now() - 10800000).toISOString(),
      },
    ];
  }

  return (
    <StoryClient
      article={article}
      related={related}
      categories={categories}
      breakingNews={breakingNews}
    />
  );
}
