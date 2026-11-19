export const MOCK_NEWS_IMAGES = [
  {
    id: "archaeology",
    title_ur: "آثارِ قدیمہ و عجیب دریافت",
    title_en: "Archaeology & Ancient Ruins",
    category: "weird",
    url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop",
  },
  {
    id: "stock_market",
    title_ur: "اسٹاک ایکسچینج و معیشت",
    title_en: "Stock Market & Economy",
    category: "business",
    url: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&auto=format&fit=crop",
  },
  {
    id: "health",
    title_ur: "طبی تحقیق و امراضِ قلب",
    title_en: "Health & Cardiovascular Science",
    category: "health",
    url: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&auto=format&fit=crop",
  },
  {
    id: "weather_snow",
    title_ur: "موسم سرما، بارش و برف باری",
    title_en: "Winter Weather, Snow & Rain",
    category: "pakistan",
    url: "https://images.unsplash.com/photo-1517495306984-f84210f9daa8?w=800&auto=format&fit=crop",
  },
  {
    id: "education_tech",
    title_ur: "تعلیم، ڈیجیٹل اسکلز و یوتھ",
    title_en: "Digital Education & Youth",
    category: "tech",
    url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop",
  },
  {
    id: "ai_robotics",
    title_ur: "مصنوعی ذہانت و روبوٹکس",
    title_en: "Artificial Intelligence & Robotics",
    category: "tech",
    url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop",
  },
  {
    id: "cricket_sports",
    title_ur: "کرکٹ و کھیل",
    title_en: "Cricket & Sports Match",
    category: "sports",
    url: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&auto=format&fit=crop",
  },
  {
    id: "pakistan_press",
    title_ur: "قومی پریس کانفرنس و سیاست",
    title_en: "National Press & Governance",
    category: "pakistan",
    url: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop",
  },
  {
    id: "global_economy",
    title_ur: "عالمی منڈی و توانائی",
    title_en: "Global Markets & Energy",
    category: "world",
    url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop",
  },
  {
    id: "banking_finance",
    title_ur: "مرکزی بینک و مالیات",
    title_en: "Central Bank & Monetary Policy",
    category: "business",
    url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop",
  },
  {
    id: "entertainment_showbiz",
    title_ur: "شوبز و فلم انڈسٹری",
    title_en: "Entertainment & Cinema",
    category: "entertainment",
    url: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&auto=format&fit=crop",
  },
  {
    id: "broadsheet_lead",
    title_ur: "ڈیلی افادیت ہیڈ کوارٹر و پریس",
    title_en: "Daily Afadiat Broadsheet Press",
    category: "special",
    url: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop",
  },
];

export function getFallbackImageForStory(story) {
  if (story?.cover_image && typeof story.cover_image === "string" && story.cover_image.trim()) {
    return story.cover_image.trim();
  }
  const slug = (story?.category?.slug || story?.category_slug || "").toLowerCase();
  const matched = MOCK_NEWS_IMAGES.find((m) => m.category === slug);
  if (matched) return matched.url;
  return "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop";
}
