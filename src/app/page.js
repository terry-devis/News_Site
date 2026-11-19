import { supabase } from "@/lib/supabase";
import HomeClient from "@/component/HomeClient";

export const revalidate = 60; // Refresh every 60 seconds

// Fallback seed articles with Urdu and English translations
const fallbackArticles = [
  {
    id: 1,
    title_ur: "ڈیلی افادیت نیوز پورٹل کا باضابطہ آغاز: سچائی اور فوری خبروں کا نیا دور",
    title_en: "Official Launch of Daily Afadiat Portal: A New Era of Truth and Instant News",
    summary_ur: "ڈیلی افادیت کا نیا ڈیجیٹل پورٹل جدید ترین ٹیکنالوجی، شفاف رپورٹنگ اور برق رفتار لائیو اپڈیٹس کے ساتھ قارئین کے لیے پیش کر دیا گیا ہے۔",
    summary_en: "Daily Afadiat's new digital portal is live, offering readers state-of-the-art reporting, transparency, and rapid live updates.",
    slug: "daily-afadiat-official-launch",
    cover_image: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop",
    created_at: new Date().toISOString(),
    category: { name_ur: "پاکستان", name_en: "Pakistan", slug: "pakistan" },
    author_name: "ایڈیٹوریل بورڈ",
    author_name_en: "Editorial Board",
  },
  {
    id: 2,
    title_ur: "اسٹیٹ بینک آف پاکستان کا مانیٹری پالیسی کا اعلان، شرح سود میں استحکام",
    title_en: "State Bank of Pakistan Announces Monetary Policy, Maintaining Interest Rate Stability",
    summary_ur: "مرکزی بینک کے مطابق ملکی معیشت میں بتدریج بہتری اور برآمدات میں اضافے کے مثبت اشارے مل رہے ہیں۔",
    summary_en: "According to the central bank, gradual economic recovery and growth in national exports show promising trends.",
    slug: "sbp-monetary-policy-announcement",
    cover_image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    category: { name_ur: "بزنس", name_en: "Business", slug: "business" },
    author_name: "بزنس ڈیسک",
    author_name_en: "Business Desk",
  },
  {
    id: 3,
    title_ur: "پاکستان کرکٹ ٹیم نے ون ڈے سیریز اپنے نام کر لی، شائقین کا جشن",
    title_en: "Pakistan Cricket Team Clinches ODI Series in Thrilling Final Victory",
    summary_ur: "سنسنی خیز مقابلے کے بعد قومی کھلاڑیوں کی شاندار کارکردگی پر شائقین کرکٹ کا جوش و خروش دیدنی تھا۔",
    summary_en: "Cricket fans erupted in celebration across the country following a sensational performance by the national squad.",
    slug: "pakistan-cricket-team-series-win",
    cover_image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&auto=format&fit=crop",
    created_at: new Date(Date.now() - 7200000).toISOString(),
    category: { name_ur: "کھیل", name_en: "Sports", slug: "sports" },
    author_name: "اسپورٹس ڈیسک",
    author_name_en: "Sports Desk",
  },
  {
    id: 4,
    title_ur: "عالمی منڈی میں تیل اور خام مال کی قیمتوں میں غیر معمولی اتار چڑھاؤ",
    title_en: "Unprecedented Fluctuations in Global Crude Oil and Commodity Markets",
    summary_ur: "بین الاقوامی معاشی ماہرین نے توانائی کے بحران اور سپلائی چین پر اہم پیشگوئی کر دی۔",
    summary_en: "International economic analysts release fresh forecasts on energy volatility and global supply chain impacts.",
    slug: "global-oil-market-fluctuations",
    cover_image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop",
    created_at: new Date(Date.now() - 10800000).toISOString(),
    category: { name_ur: "انٹرنیشنل", name_en: "World", slug: "world" },
    author_name: "عالمی نمائندہ",
    author_name_en: "Foreign Correspondent",
  },
  {
    id: 5,
    title_ur: "مصنوعی ذہانت اور جدید ٹیکنالوجی کے شعبے میں بڑی پیش رفت کا اعلان",
    title_en: "Major Technological Breakthrough Announced in Generative AI and Robotics",
    summary_ur: "نئی ٹیکنالوجیز صحت اور تعلیم کے شعبوں میں انقلابی تبدیلیاں لانے کے لیے تیار ہیں۔",
    summary_en: "Emerging technological developments are poised to transform healthcare, scientific research, and digital education.",
    slug: "artificial-intelligence-new-breakthrough",
    cover_image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop",
    created_at: new Date(Date.now() - 14400000).toISOString(),
    category: { name_ur: "سائنس و ٹیکنالوجی", name_en: "Science & Tech", slug: "tech" },
    author_name: "ٹیک ڈیسک",
    author_name_en: "Tech Desk",
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

  // Merge database articles with bilingual fallbacks
  const newsList = articles.length >= 8 
    ? articles 
    : [...articles, ...fallbackArticles.slice(articles.length)];

  return (
    <HomeClient
      articles={newsList}
      categories={categories}
      breakingNews={breakingNews}
    />
  );
}
