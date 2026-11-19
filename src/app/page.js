import { supabase } from "@/lib/supabase";
import HomeClient from "@/component/HomeClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
  {
    id: 6,
    title_ur: "ملک بھر میں موسم سرما کی پہلی بارش اور برف باری، سردی کی لہر میں اضافہ",
    title_en: "First Winter Rain and Snowfall Across the Country, Temperature Drops Noticeably",
    summary_ur: "محکمہ موسمیات نے شمالی علاقہ جات اور بالائی علاقوں میں بارش اور برف باری کی پیشگوئی کی ہے۔",
    summary_en: "Meteorological department forecasts widespread rain and snowfall across northern regions and mountainous valleys.",
    slug: "winter-rain-snowfall-forecast",
    cover_image: "https://images.unsplash.com/photo-1517495306984-f84210f9daa8?w=800&auto=format&fit=crop",
    created_at: new Date(Date.now() - 18000000).toISOString(),
    category: { name_ur: "پاکستان", name_en: "Pakistan", slug: "pakistan" },
    author_name: "موسمیات ڈیسک",
    author_name_en: "Weather Desk",
  },
  {
    id: 7,
    title_ur: "صحت کے شعبے میں بڑی کامیابی: دل کے امراض کے علاج کے لیے نئی تحقیق",
    title_en: "Cardiovascular Medical Breakthrough: Landmark Clinical Trial Shows Promising Results",
    summary_ur: "طبی ماہرین نے دل کے دورے کے خطرے کو نصف تک کم کرنے کے لیے نئی احتیاطی تدابیر دریافت کر لیں۔",
    summary_en: "Cardiologists and research teams discover novel therapeutic pathways to substantially reduce heart attack risks.",
    slug: "cardiovascular-health-breakthrough",
    cover_image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop",
    created_at: new Date(Date.now() - 21600000).toISOString(),
    category: { name_ur: "صحت", name_en: "Health", slug: "health" },
    author_name: "ہیلتھ ڈیسک",
    author_name_en: "Health Desk",
  },
  {
    id: 8,
    title_ur: "پاکستان اسٹاک ایکسچینج میں زبردست تیزی، ہنڈریڈ انڈیکس میں تاریخی ریکارڈ اضافہ",
    title_en: "Pakistan Stock Exchange Surges to Historic All-Time Highs with Heavy Trading Volumes",
    summary_ur: "سرمایہ کاروں کے اعتماد میں اضافے کے باعث مارکیٹ میں مثبت رجحان برقرار رہا۔",
    summary_en: "Surging investor confidence and macroeconomic stability propel the benchmark index to record territory.",
    slug: "psx-historic-record-surge",
    cover_image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop",
    created_at: new Date(Date.now() - 25200000).toISOString(),
    category: { name_ur: "بزنس", name_en: "Business", slug: "business" },
    author_name: "مارکیٹ رپورٹر",
    author_name_en: "Market Reporter",
  },
  {
    id: 9,
    title_ur: "تعلیمی اداروں میں ڈیجیٹل اسکلز پروگرام کا آغاز، طلباء کے لیے شاندار مواقع",
    title_en: "Nationwide Digital Skills Initiative Launched to Empower Youth and Modernize Classrooms",
    summary_ur: "حکومت کا نوجوانوں کو جدید آئی ٹی اور فری لانسنگ ہنر سکھانے کے لیے نیا پراجیکٹ۔",
    summary_en: "Government unveils nationwide program equipping youth with in-demand software engineering and IT freelancing skills.",
    slug: "digital-skills-program-launch",
    cover_image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop",
    created_at: new Date(Date.now() - 28800000).toISOString(),
    category: { name_ur: "سائنس و ٹیکنالوجی", name_en: "Science & Tech", slug: "tech" },
    author_name: "ایجوکیشن ڈیسک",
    author_name_en: "Education Desk",
  },
  {
    id: 10,
    title_ur: "غاروں میں چھپے قدیم شہر کا انکشاف، ماہرین آثار قدیمہ حیران رہ گئے",
    title_en: "Centuries-Old Underground City Discovered by International Archaeologists",
    summary_ur: "صدیوں پرانی تہذیب کے نوادرات اور حیرت انگیز تعمیراتی نمونے دریافت۔",
    summary_en: "Remarkable relics and subterranean engineering uncover a lost civilization dating back over a thousand years.",
    slug: "ancient-underground-city-discovery",
    cover_image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop",
    created_at: new Date(Date.now() - 32400000).toISOString(),
    category: { name_ur: "دلچسپ و عجیب", name_en: "Odd & Curious", slug: "weird" },
    author_name: "فیچر ڈیسک",
    author_name_en: "Feature Desk",
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
  const mergedList = articles.length >= 10 
    ? articles 
    : [...articles, ...fallbackArticles.slice(articles.length)];

  // Ensure every article is fully bilingual with complete English translations
  const newsList = mergedList.map((art, idx) => {
    const fallbackMatch = fallbackArticles.find(f => f.id === art.id || f.slug === art.slug) || fallbackArticles[idx % fallbackArticles.length];
    return {
      ...fallbackMatch,
      ...art,
      title_ur: art.title_ur || fallbackMatch.title_ur,
      title_en: art.title_en || fallbackMatch.title_en || "Daily Afadiat Verified News Report",
      summary_ur: art.summary_ur || fallbackMatch.summary_ur,
      summary_en: art.summary_en || fallbackMatch.summary_en || "Read verified in-depth coverage and real-time updates on this developing story from Daily Afadiat.",
      author_name: art.author_name || fallbackMatch.author_name || "ایڈیٹوریل بورڈ",
      author_name_en: art.author_name_en || fallbackMatch.author_name_en || "Editorial Board",
      category: art.categories || art.category || fallbackMatch.category,
    };
  });

  // Extract breaking news directly from articles with is_breaking = true
  const articleBreaking = articles
    .filter((a) => a.is_breaking)
    .map((a) => ({
      id: `art-${a.id}`,
      text_ur: a.title_ur,
      text_en: a.title_en || a.title_ur,
      link_url: `/story/${a.id || a.slug}`,
      article_id: a.id,
      priority: 0,
      is_active: true,
    }));

  // Combine with breaking_news table, putting live article breaking headlines first
  const allBreaking = [...articleBreaking];
  for (const b of breakingNews) {
    const exists = allBreaking.some(
      (item) => item.text_ur?.trim() === b.text_ur?.trim() || (b.link_url && item.link_url === b.link_url)
    );
    if (!exists) {
      allBreaking.push({
        ...b,
        text_en: b.text_en || b.text_ur,
      });
    }
  }

  return (
    <HomeClient
      articles={newsList}
      categories={categories}
      breakingNews={allBreaking}
    />
  );
}
