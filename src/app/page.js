import { supabase } from "@/lib/supabase";
import Header from "@/component/Header";
import Footer from "@/component/Footer";
import Link from "next/link";
import Image from "next/image";
import { Clock, TrendingUp } from "lucide-react";
import AdSlot from "@/component/AdSlot";
import NewsletterBox from "@/component/NewsletterBox";

export const revalidate = 60; // Refresh every 60 seconds

// Fallback seed articles in case Supabase tables are still being set up
const fallbackArticles = [
  {
    id: 1,
    title_ur: "ڈیلی افادیت نیوز پورٹل کا باضابطہ آغاز: سچائی اور فوری خبروں کا نیا دور",
    summary_ur: "ڈیلی افادیت کا نیا ڈیجیٹل پورٹل جدید ترین ٹیکنالوجی، شفاف رپورٹنگ اور برق رفتار لائیو اپڈیٹس کے ساتھ قارئین کے لیے پیش کر دیا گیا ہے۔",
    slug: "daily-afadiat-official-launch",
    cover_image: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop",
    created_at: new Date().toISOString(),
    category: { name_ur: "پاکستان", slug: "pakistan" },
    author_name: "ایڈیٹوریل بورڈ",
  },
  {
    id: 2,
    title_ur: "اسٹیٹ بینک آف پاکستان کا مانیٹری پالیسی کا اعلان، شرح سود میں استحکام",
    summary_ur: "مرکزی بینک کے مطابق ملکی معیشت میں بتدریج بہتری اور برآمدات میں اضافے کے مثبت اشارے مل رہے ہیں۔",
    slug: "sbp-monetary-policy-announcement",
    cover_image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    category: { name_ur: "بزنس", slug: "business" },
    author_name: "بزنس ڈیسک",
  },
  {
    id: 3,
    title_ur: "پاکستان کرکٹ ٹیم نے ون ڈے سیریز اپنے نام کر لی، شائقین کا جشن",
    summary_ur: "سنسنی خیز مقابلے کے بعد قومی کھلاڑیوں کی شاندار کارکردگی پر شائقین کرکٹ کا جوش و خروش دیدنی تھا۔",
    slug: "pakistan-cricket-team-series-win",
    cover_image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&auto=format&fit=crop",
    created_at: new Date(Date.now() - 7200000).toISOString(),
    category: { name_ur: "کھیل", slug: "sports" },
    author_name: "اسپورٹس ڈیسک",
  },
  {
    id: 4,
    title_ur: "عالمی منڈی میں تیل اور خام مال کی قیمتوں میں غیر معمولی اتار چڑھاؤ",
    summary_ur: "بین الاقوامی معاشی ماہرین نے توانائی کے بحران اور سپلائی چین پر اہم پیشگوئی کر دی۔",
    slug: "global-oil-market-fluctuations",
    cover_image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop",
    created_at: new Date(Date.now() - 10800000).toISOString(),
    category: { name_ur: "انٹرنیشنل", slug: "world" },
    author_name: "عالمی نمائندہ",
  },
  {
    id: 5,
    title_ur: "مصنوعی ذہانت اور جدید ٹیکنالوجی کے شعبے میں بڑی پیش رفت کا اعلان",
    summary_ur: "نئی ٹیکنالوجیز صحت اور تعلیم کے شعبوں میں انقلابی تبدیلیاں لانے کے لیے تیار ہیں۔",
    slug: "artificial-intelligence-new-breakthrough",
    cover_image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop",
    created_at: new Date(Date.now() - 14400000).toISOString(),
    category: { name_ur: "سائنس و ٹیکنالوجی", slug: "tech" },
    author_name: "ٹیک ڈیسک",
  },
];

export default async function Home() {
  let categories = [];
  let breakingNews = [];
  let articles = [];

  try {
    const [catRes, breakRes, artRes] = await Promise.all([
      supabase.from("categories").select("*").order("display_order"),
      supabase.from("breaking_news").select("*").eq("is_active", true).order("priority"),
      supabase.from("articles").select("*, categories(*)").order("created_at", { ascending: false }).limit(20),
    ]);

    if (catRes.data && catRes.data.length > 0) categories = catRes.data;
    if (breakRes.data && breakRes.data.length > 0) breakingNews = breakRes.data;
    if (artRes.data && artRes.data.length > 0) articles = artRes.data;
  } catch (err) {
    console.error("Supabase fetch error, using fallback data:", err);
  }

  // If database has fewer articles than slots, merge with fallbacks so the grid remains rich
  const newsList = articles.length >= 8 
    ? articles 
    : [...articles, ...fallbackArticles.slice(articles.length)];
  const leadStory = newsList[0];
  const secondaryStories = newsList.slice(1, 5);
  const remainingStories = newsList.slice(5);

  return (
    <div className="min-h-screen text-gray-900">
      {/* HEADER */}
      <Header categories={categories} breakingNews={breakingNews} />

      {/* MAIN CONTENT AREA: 88% CONTAINER MATCHING DAILY INSAAF */}
      <main className="u-shell py-5">
        
        {/* 1. HERO SECTION: SLEEK SUBTLE CARD (MATCHING DAILY INSAAF EXACT PADDING & RATIOS) */}
        <section className="bg-[#efeee9] border border-[#dcd8cd] rounded p-4 sm:p-5 mb-6 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Lead Featured Story (7 Cols on Desktop) */}
            <article className="lg:col-span-7 flex flex-col justify-between group">
              <div>
                <div className="relative w-full aspect-[16/10] overflow-hidden rounded bg-[#dcd8cd]/40 mb-3 shadow-inner">
                  <Image
                    src={leadStory.cover_image || "/logo-light.webp"}
                    alt={leadStory.title_ur}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-500"
                    priority
                  />
                  <span className="absolute top-2.5 right-2.5 bg-emerald-700 text-white text-[11px] px-2 py-0.5 rounded font-sans font-semibold shadow-sm">
                    {leadStory.category?.name_ur || "اہم خبر"}
                  </span>
                </div>
                
                <Link href={`/story/${leadStory.id || leadStory.slug}`}>
                  <h1 className="text-xl sm:text-2xl font-bold urdu-headline text-gray-900 group-hover:text-emerald-700 transition leading-snug mb-2">
                    {leadStory.title_ur}
                  </h1>
                </Link>

                <p className="text-gray-600 text-[14px] urdu-body line-clamp-3 mb-3">
                  {leadStory.summary_ur}
                </p>
              </div>

              <div className="flex items-center gap-2.5 text-xs text-gray-500 font-sans border-t border-[#dcd8cd] pt-2.5">
                <span className="font-semibold text-gray-700">{leadStory.author_name}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {new Date(leadStory.created_at).toLocaleDateString("ur-PK")}
                </span>
              </div>
            </article>

            {/* Secondary Top Stories (5 Cols on Desktop - Like Daily Insaaf) */}
            <div className="lg:col-span-5 flex flex-col divide-y divide-[#dcd8cd]">
              <div className="pb-2 mb-1 flex items-center justify-between border-b-2 border-emerald-600">
                <h2 className="text-base font-bold text-gray-900 flex items-center gap-1.5">
                  <TrendingUp size={16} className="text-emerald-600" />
                  <span>اہم خبریں</span>
                </h2>
                <span className="text-xs text-gray-500 font-sans">تازہ ترین</span>
              </div>

              {secondaryStories.map((story) => (
                <article key={story.id} className="py-2.5 flex items-start gap-3 group">
                  <div className="relative w-24 h-18 sm:w-28 sm:h-20 shrink-0 overflow-hidden rounded bg-[#dcd8cd]/40">
                    <Image
                      src={story.cover_image || "/logo-light.webp"}
                      alt={story.title_ur}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-300"
                    />
                  </div>
                  <div className="flex-1">
                    <span className="text-[11px] text-emerald-700 font-bold">
                      {story.category?.name_ur || "خبر"}
                    </span>
                    <Link href={`/story/${story.id || story.slug}`}>
                      <h3 className="text-[14px] font-bold text-gray-800 group-hover:text-emerald-600 transition leading-snug line-clamp-2">
                        {story.title_ur}
                      </h3>
                    </Link>
                    <span className="text-[11px] text-gray-400 font-sans mt-0.5 block">
                      {new Date(story.created_at).toLocaleTimeString("ur-PK", { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </article>
              ))}
            </div>

          </div>
        </section>

        {/* Home Mid-Feed Ad Slot (Controllable from CMS) */}
        <AdSlot slotKey="home_mid_banner" className="my-6 max-w-4xl mx-auto" />

        {/* 2. PROMOTIONAL SLATE BANNER */}
        <section className="my-6 py-3.5 px-5 bg-[#0a1f13] rounded text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm border-t-2 border-emerald-500">
          <div className="flex items-center gap-3">
            <div className="h-10 w-36 relative">
              <Image src="/logo.webp" alt="Daily Afadiat Logo" fill className="object-contain" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-emerald-400">ڈیلی افادیت ای پیپر اور لائیو ڈیجیٹل سروسز</h4>
              <p className="text-xs text-gray-300 font-sans">سچ کے ساتھ، ہر لمحہ باخبر — TRUST • FACTS • GLOBAL NEWS</p>
            </div>
          </div>
          <Link
            href="/epaper"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-1.5 rounded transition whitespace-nowrap"
          >
            آج کا اخبار پڑھیں
          </Link>
        </section>

        {/* 3. MULTI-CATEGORY NEWS GRID (Pakistan & World) */}
        <div className="mb-3 flex items-center justify-between border-b-2 border-[#1a1a1a] pb-1.5">
          <h2 className="text-lg font-bold text-gray-900">دیگر اہم خبریں</h2>
          <span className="text-xs text-gray-500 font-sans">تمام شعبہ جات</span>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-4">
          {remainingStories.length > 0 ? (
            remainingStories.map((story) => (
              <article key={story.id} className="border border-[#dcd8cd] rounded overflow-hidden hover:border-emerald-600 transition group bg-[#efeee9]/70 hover:bg-[#efeee9] shadow-sm">
                <div className="relative w-full h-40 bg-[#dcd8cd]/40">
                  <Image
                    src={story.cover_image || "/logo-light.webp"}
                    alt={story.title_ur}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-500"
                  />
                  <span className="absolute top-2 right-2 bg-black/75 text-white text-[11px] px-2 py-0.5 rounded font-sans">
                    {story.category?.name_ur || "تازہ خبر"}
                  </span>
                </div>
                <div className="p-3.5">
                  <Link href={`/story/${story.id || story.slug}`}>
                    <h3 className="text-[15px] font-bold text-gray-900 group-hover:text-emerald-700 transition leading-snug line-clamp-2 mb-1.5">
                      {story.title_ur}
                    </h3>
                  </Link>
                  <p className="text-xs text-gray-500 line-clamp-2 urdu-body">
                    {story.summary_ur}
                  </p>
                </div>
              </article>
            ))
          ) : (
            fallbackArticles.slice(1, 4).map((story) => (
              <article key={story.id} className="border border-[#dcd8cd] rounded overflow-hidden hover:border-emerald-600 transition group bg-[#efeee9]/70 hover:bg-[#efeee9] shadow-sm">
                <div className="relative w-full h-40 bg-[#dcd8cd]/40">
                  <Image
                    src={story.cover_image}
                    alt={story.title_ur}
                    fill
                    className="object-cover group-hover:scale-105 transition duration-500"
                  />
                  <span className="absolute top-2 right-2 bg-emerald-700 text-white text-[11px] px-2 py-0.5 rounded font-sans">
                    {story.category?.name_ur || "خبر"}
                  </span>
                </div>
                <div className="p-3.5">
                  <Link href={`/story/${story.slug}`}>
                    <h3 className="text-[15px] font-bold text-gray-900 group-hover:text-emerald-700 transition leading-snug line-clamp-2 mb-1.5">
                      {story.title_ur}
                    </h3>
                  </Link>
                  <p className="text-xs text-gray-500 line-clamp-2 urdu-body">
                    {story.summary_ur}
                  </p>
                </div>
              </article>
            ))
          )}
        </section>

        {/* 4. NEWSLETTER SUBSCRIPTION RIBBON */}
        <section className="my-10 w-full">
          <NewsletterBox variant="dark" />
        </section>

      </main>

      {/* ========================================================== */}
      {/* 4. MODULAR DAILY INSAAF-STYLE 3-TIER FOOTER                */}
      {/* ========================================================== */}
      <Footer categories={categories} />
    </div>
  );
}
