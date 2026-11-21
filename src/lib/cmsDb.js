import { supabaseAdmin } from "./supabaseServer.js";
import { hashPassword, verifyPassword, sanitizeUser } from "./auth.js";
import { DEFAULT_ROLES, ALL_PERMISSIONS } from "./permissions.js";
import fs from "fs";
import path from "path";

const localStorePath = path.join(process.cwd(), "data", "cms_store.json");
const tmpStorePath = "/tmp/daily_afadiat_cms_store.json";
let memoryStoreCache = null;

function isReadOnlyFsError(err) {
  return err && ["EROFS", "EACCES", "EPERM"].includes(err.code);
}

function safeWriteStoreFile(data) {
  memoryStoreCache = data;
  const serialized = JSON.stringify(data, null, 2);
  try {
    const dir = path.dirname(localStorePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(localStorePath, serialized);
  } catch (err) {
    if (isReadOnlyFsError(err)) {
      try {
        fs.writeFileSync(tmpStorePath, serialized);
      } catch {}
      return;
    }
    throw err;
  }
}

function getReadableStorePath() {
  if (fs.existsSync(tmpStorePath)) return tmpStorePath;
  if (fs.existsSync(localStorePath)) return localStorePath;
  return null;
}

function ensureLocalStore() {
  if (memoryStoreCache) return memoryStoreCache;
  const readablePath = getReadableStorePath();
  if (!readablePath) {
    const defaultData = {
      ad_slots: [
        {
          id: 1,
          slot_key: "top_banner_728x90",
          title: "اوپری ہیڈر بینر (728x90)",
          ad_type: "image",
          image_url: "",
          target_url: "https://dailyafadiat.com",
          code_snippet: "",
          is_active: true,
        },
        {
          id: 2,
          slot_key: "home_mid_banner",
          title: "صفحۂ اول درمیانی بینر (970x90)",
          ad_type: "image",
          image_url: "",
          target_url: "https://dailyafadiat.com",
          code_snippet: "",
          is_active: true,
        },
        {
          id: 3,
          slot_key: "article_sidebar_300x250",
          title: "آرٹیکل سائیڈ بار بینر (300x250)",
          ad_type: "image",
          image_url: "",
          target_url: "https://dailyafadiat.com",
          code_snippet: "",
          is_active: true,
        },
        {
          id: 4,
          slot_key: "article_inline_banner",
          title: "آرٹیکل کے اندر بینر (728x90)",
          ad_type: "image",
          image_url: "",
          target_url: "https://dailyafadiat.com",
          code_snippet: "",
          is_active: true,
        },
        {
          id: 5,
          slot_key: "footer_banner",
          title: "فوٹر کے اوپر بینر (970x90)",
          ad_type: "image",
          image_url: "",
          target_url: "https://dailyafadiat.com",
          code_snippet: "",
          is_active: false,
        },
      ],
      comments: [
        {
          id: 1,
          article_id: 1,
          author_name: "محمد بلال",
          author_email: "bilal@example.com",
          content: "بہت ہی شاندار اور تیز رفتار نیوز پورٹل ہے۔ ڈیلی افادیت کی ادارتی ٹیم کو مبارکباد!",
          status: "approved",
          created_at: new Date().toISOString(),
        },
      ],
      site_settings: {
        social_links: {
          youtube: "https://youtube.com/@dailyafadiat",
          whatsapp: "https://whatsapp.com/channel/dailyafadiat",
          facebook: "https://facebook.com/dailyafadiat",
          instagram: "https://instagram.com/dailyafadiat",
          twitter: "https://x.com/dailyafadiat",
          tiktok: "https://tiktok.com/@dailyafadiat",
        },
        contact_info: {
          address_ur: "شاہراہِ قائدین، صدر، کراچی، پاکستان",
          address_en: "Shahrah-e-Quaideen, Saddar, Karachi, Pakistan",
          phone: "+92 300 1234567",
          whatsapp: "+92 300 1234567",
          editorial_email: "editor@dailyafadiat.com",
          ads_email: "ads@dailyafadiat.com",
          timing_ur: "پیر تا ہفتہ: صبح ۹ تا شام ۶ بجے",
          timing_en: "Mon to Sat: 9:00 AM to 6:00 PM",
        },
        site_info: {
          title_ur: "ڈیلی افادیت",
          tagline_ur: "سچ کے ساتھ، ہر لمحہ باخبر — TRUST • FACTS • GLOBAL NEWS",
          contact_email: "editor@dailyafadiat.com",
          contact_phone: "+92 300 1234567",
        },
        smtp_config: {
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          user: "",
          pass: "",
          from: "ڈیلی افادیت <newsletter@dailyafadiat.com>",
        },
      },
      newsletter_subscribers: [
        {
          id: 1,
          email: "reader@example.com",
          is_active: true,
          created_at: new Date().toISOString(),
        },
      ],
      videos: [],
      epaper_editions: [],
      pages: [],
    };
    safeWriteStoreFile(defaultData);
  }
  const activePath = getReadableStorePath();
  const currentData = activePath ? JSON.parse(fs.readFileSync(activePath, "utf-8")) : memoryStoreCache || {};
  let modified = false;

  if (!currentData.videos || currentData.videos.length === 0) {
    currentData.videos = [
      {
        id: 1,
        title_ur: "خصوصی ڈاکومنٹری: پاکستان کی معدنی دولت اور عالمی سرمایہ کاری کے نئے مواقع",
        title_en: "Special Documentary: Pakistan Mineral Wealth and Novel Global Investment Routes",
        summary_ur: "بلوچستان اور شمالی علاقہ جات کے قدرتی وسائل، ریکوڈک منصوبہ اور جدید ٹیکنالوجی سے معاشی کایا پلٹ کا جامع جائزہ۔",
        summary_en: "In-depth investigation exploring natural reserves, Reko Diq copper-gold deposits, and national transformation.",
        category: "special",
        video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duration: "18:45",
        views_count: "125K",
        cover_image: "https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?w=800&auto=format&fit=crop",
        author_name: "تحقیقاتی ڈیسک",
        is_featured: true,
        is_active: true,
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: 2,
        title_ur: "ڈیلی افادیت 9 PM بلیٹن: قومی معیشت میں استحکام اور نئے ترقیاتی منصوبوں کی منظوری",
        title_en: "Daily Afadiat 9 PM Bulletin: Economic Stabilization and Major Infrastructure Approvals",
        summary_ur: "ملک بھر کے تمام اہم واقعات کا لمحہ بہ لمحہ احوال اور مستند تجزیہ۔",
        summary_en: "Nightly comprehensive broadcast covering fiscal metrics, cabinet decisions, and regional developments.",
        category: "bulletin",
        video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duration: "34:20",
        views_count: "88K",
        cover_image: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop",
        author_name: "نیوز روم",
        is_featured: false,
        is_active: true,
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 3,
        title_ur: "معاشی تجزیہ: اسٹاک ایکسچینج میں ریکارڈ تیزی، روپے کی قدر اور آئندہ مالیاتی پالیسی",
        title_en: "Market Outlook: KSE-100 Historic Highs, Rupee Stability, and Upcoming Monetary Policy",
        summary_ur: "معاشی ماہرین اور فنانشل تجزیہ کاروں کے ساتھ خصوصی تبادلہ خیال۔",
        summary_en: "Dialogue with seasoned market strategists regarding interest rate trajectory and foreign inflows.",
        category: "economy",
        video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duration: "14:10",
        views_count: "42K",
        cover_image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&auto=format&fit=crop",
        author_name: "بزنس ڈیسک",
        is_featured: false,
        is_active: true,
        created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
      {
        id: 4,
        title_ur: "کرکٹ فیور: دورۂ پاکستان کے دوران کھلاڑیوں کی ٹریننگ اور کیمپ سے خصوصی رپورٹ",
        title_en: "Cricket Fever: Exclusive Practice Session Coverage and Head Coach Press Conference",
        summary_ur: "قومی ٹیم کی حکمت عملی اور شائقینِ کرکٹ کے پرجوش تاثرات۔",
        summary_en: "Inside training camp footage and fan interviews ahead of the decisive clash.",
        category: "sports",
        video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duration: "08:35",
        views_count: "210K",
        cover_image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&auto=format&fit=crop",
        author_name: "اسپورٹس ڈیسک",
        is_featured: false,
        is_active: true,
        created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
      },
    ];
    modified = true;
  }

  if (!currentData.epaper_editions || currentData.epaper_editions.length === 0) {
    const today = new Date().toISOString().split("T")[0];
    currentData.epaper_editions = [
      {
        id: 1,
        edition_date: today,
        city_slug: "islamabad",
        city_name_ur: "اسلام آباد / راولپنڈی",
        city_name_en: "Islamabad / Rawalpindi",
        page_number: 1,
        page_title_ur: "صفحۂ اول (اہم سرخیاں)",
        page_title_en: "Front Page",
        page_image: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop",
        pdf_url: "",
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 2,
        edition_date: today,
        city_slug: "islamabad",
        city_name_ur: "اسلام آباد / راولپنڈی",
        city_name_en: "Islamabad / Rawalpindi",
        page_number: 2,
        page_title_ur: "قومی و علاقائی خبریں",
        page_title_en: "National News",
        page_image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=1200&auto=format&fit=crop",
        pdf_url: "",
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 3,
        edition_date: today,
        city_slug: "islamabad",
        city_name_ur: "اسلام آباد / راولپنڈی",
        city_name_en: "Islamabad / Rawalpindi",
        page_number: 3,
        page_title_ur: "اداریہ، کالم و تجارت",
        page_title_en: "Editorial & Business",
        page_image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=1200&auto=format&fit=crop",
        pdf_url: "",
        is_active: true,
        created_at: new Date().toISOString(),
      },
      {
        id: 4,
        edition_date: today,
        city_slug: "islamabad",
        city_name_ur: "اسلام آباد / راولپنڈی",
        city_name_en: "Islamabad / Rawalpindi",
        page_number: 4,
        page_title_ur: "بین الاقوامی و کھیل",
        page_title_en: "World & Sports",
        page_image: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200&auto=format&fit=crop",
        pdf_url: "",
        is_active: true,
        created_at: new Date().toISOString(),
      },
    ];
    modified = true;
  }

  if (!currentData.pages || currentData.pages.length === 0) {
    currentData.pages = [
      {
        id: 1,
        slug: "about-us",
        title_ur: "ہمارے بارے میں",
        title_en: "About Daily Afadiat",
        summary_ur: "ڈیلی افادیت پاکستان کا معتبر، غیر جانبدار اور تیز رفتار ڈیجیٹل و پرنٹ نیوز نیٹ ورک ہے۔",
        summary_en: "Daily Afadiat is Pakistan's premier authentic, non-partisan digital and broadsheet news media network.",
        content_ur: `<p>روزنامہ افادیت (Daily Afadiat) پاکستان کے صحافتی افق پر سچائی، دیانت داری اور عوامی فلاح کا علمبردار ہے۔ ہمارا مقصد قارئین کو بروقت، مصدقہ اور غیر جانبدارانہ خبریں فراہم کرنا ہے۔</p>
<h3>ہمارا مشن</h3>
<p>ہم پاکستان اور دنیا بھر کے تازہ ترین حالات و واقعات، اقتصادی تجزیات، کھیل، سائنس اور ٹیکنالوجی کی خبریں بغیر کسی سنسنی خیزی کے پیش کرتے ہیں۔ صحافتی اقدار کی پاسداری اور عوامی اعتماد ہمارا بنیادی سرمایہ ہے۔</p>
<h3>ہماری تحقیقاتی ٹیم</h3>
<p>ملک بھر میں ہمارے سینئر صحافیوں، فیلڈ رپورٹرز اور محققین کا وسیع نیٹ ورک ہر لمحہ متحرک رہتا ہے تاکہ آپ تک مستند خبریں سب سے پہلے پہنچ سکیں۔</p>`,
        content_en: `<p>Daily Afadiat is a prominent Pakistani digital news organization and broadsheet newspaper committed to truth, journalistic integrity, and civic empowerment.</p>
<h3>Our Editorial Mission</h3>
<p>We deliver timely, verified, and objective coverage spanning national politics, global diplomacy, business economics, scientific breakthroughs, sports, and cultural affairs without sensationalism.</p>
<h3>Our Investigative Network</h3>
<p>With bureau correspondents across major metropolitan hubs and regional districts, our newsroom provides rigorous fact-checking and deep analytical reporting.</p>`,
        is_published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 2,
        slug: "editorial-policy",
        title_ur: "ادارتی پالیسی اور صحافتی ضابطۂ اخلاق",
        title_en: "Editorial Policy & Code of Ethics",
        summary_ur: "ڈیلی افادیت کی ادارتی آزادی، حقائق کی جانچ پڑتال اور رپورٹنگ کے رہنما اصول۔",
        summary_en: "Core journalistic principles, rigorous verification criteria, and conflict of interest standards.",
        content_ur: `<p>ڈیلی افادیت کے تمام صحافی اور کالم نگار عالمی معیار کے صحافتی ضابطۂ اخلاق کے پابند ہیں۔</p>
<ul>
<li><strong>حقائق کی تصدیق:</strong> کسی بھی خبر کی اشاعت سے قبل کم از کم دو آزاد ذرائع سے تصدیق کی جاتی ہے۔</li>
<li><strong>غیر جانبداری:</strong> خبروں میں ذاتی رائے یا سیاسی وابستگی سے مکمل گریز کیا جاتا ہے۔ رائے اور اداریہ کے لیے الگ حصے مختص ہیں۔</li>
<li><strong>تصحیح اور شفافیت:</strong> اگر کسی رپورٹ میں سہواً غلطی ہو جائے تو شفافیت کے ساتھ فوری تصحیح جاری کی جاتی ہے۔</li>
</ul>`,
        content_en: `<p>All journalists, editors, and contributors at Daily Afadiat adhere strictly to internationally recognized journalistic ethics.</p>
<ul>
<li><strong>Dual Verification:</strong> Sensitive news events require independent verification from at least two reputable sources before dissemination.</li>
<li><strong>Impartiality:</strong> News coverage remains strictly separate from editorial opinion and commentary.</li>
<li><strong>Corrections Policy:</strong> We uphold transparent accountability; factual inaccuracies are corrected promptly and conspicuously.</li>
</ul>`,
        is_published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 3,
        slug: "privacy-policy",
        title_ur: "پرائیویسی پالیسی",
        title_en: "Privacy Policy",
        summary_ur: "قارئین کے ذاتی ڈیٹا کے تحفظ، کوکیز اور معلومات کے استعمال سے متعلق ہماری پالیسی۔",
        summary_en: "Information collection standards, cookies policy, and reader privacy protection frameworks.",
        content_ur: `<p>ڈیلی افادیت اپنے تمام قارئین کی پرائیویسی کا احترام کرتا ہے۔ ہم آپ کی ذاتی معلومات کو کسی بھی تیسرے فریق کے ساتھ فروخت یا شیئر نہیں کرتے۔</p>
<p>ہماری ویب سائٹ بہتر کارکردگی اور اینالیٹکس کے لیے کوکیز کا محدود استعمال کرتی ہے تاکہ قارئین کو معیاری تجربہ فراہم کیا جا سکے۔</p>`,
        content_en: `<p>Daily Afadiat respects and protects reader privacy. We never sell, lease, or distribute personal information to third parties.</p>
<p>We use standard analytics and functional cookies strictly to enhance reading speed, user experience, and delivery of targeted breaking notifications.</p>`,
        is_published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    modified = true;
  }

  if (modified) {
    safeWriteStoreFile(currentData);
  } else {
    memoryStoreCache = currentData;
  }
  return currentData;
}

function writeLocalStore(data) {
  safeWriteStoreFile(data);
}

// ==========================================
// 1. AD SLOTS & CREATIVES API (Daily Insaaf Parity)
// ==========================================

const DEFAULT_AD_SLOTS = [
  { id: 1, slot_key: "footer-strip", name: "Footer · strip (all pages)", sizes: "728x90, 320x50", pages: ["all"], is_active: true },
  { id: 2, slot_key: "home-leaderboard", name: "Home leaderboard", sizes: "728x90, 320x50", pages: ["home"], is_active: true },
  { id: 3, slot_key: "home-infeed-1", name: "Home · in-feed #1", sizes: "728x90, 300x250", pages: ["home"], is_active: true },
  { id: 4, slot_key: "home-infeed-2", name: "Home · in-feed #2", sizes: "728x90, 300x250", pages: ["home"], is_active: true },
  { id: 13, slot_key: "home-infeed-3", name: "Home · in-feed #3", sizes: "728x90, 300x250", pages: ["home"], is_active: true },
  { id: 5, slot_key: "home-mpu", name: "Home MPU", sizes: "300x250", pages: ["home"], is_active: true },
  { id: 6, slot_key: "home-sidebar", name: "Home · sidebar", sizes: "300x600, 300x250", pages: ["home"], is_active: true },
  { id: 7, slot_key: "section-leaderboard", name: "Section · leaderboard (top)", sizes: "728x90, 320x50", pages: ["section"], is_active: true },
  { id: 8, slot_key: "section-infeed", name: "Section · in-feed", sizes: "728x90, 300x250", pages: ["section"], is_active: true },
  { id: 9, slot_key: "section-sidebar", name: "Section · sidebar", sizes: "300x600, 300x250", pages: ["section"], is_active: true },
  { id: 10, slot_key: "article-mpu", name: "Article MPU", sizes: "300x250", pages: ["story", "article"], is_active: true },
  { id: 11, slot_key: "story-inline", name: "Story · inline (in-body)", sizes: "728x90, 300x250", pages: ["story", "article"], is_active: true },
  { id: 12, slot_key: "story-mpu", name: "Story · MPU (sidebar / in-body)", sizes: "300x250, 300x600", pages: ["story", "article"], is_active: true },
];

const DEFAULT_AD_CREATIVES = [
  {
    id: 101,
    slot_key: "footer-strip",
    name: "AD: Meezan Bank — Apna Ghar — Footer · strip (all pages)",
    type: "direct",
    runs_on: "both",
    weight: 1,
    image_url: "",
    image_alt: "میزان بینک اپنا گھر آسان ہوم فنانسنگ اسکیم",
    click_url: "https://www.meezanbank.com",
    status: "run",
    impressions: 412,
    clicks: 14,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 102,
    slot_key: "home-leaderboard",
    name: "State Life Insurance — Digital Health Takaful",
    type: "direct",
    runs_on: "ur",
    weight: 2,
    image_url: "",
    image_alt: "اسٹیٹ لائف انشورنس ڈیجیٹل ہیلتھ تکافل پلان",
    click_url: "https://statelife.com.pk",
    status: "run",
    impressions: 680,
    clicks: 22,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 103,
    slot_key: "home-infeed-1",
    name: "HBL Mobile App — Digital Banking Freedom",
    type: "direct",
    runs_on: "both",
    weight: 1,
    image_url: "",
    image_alt: "ایچ بی ایل موبائل ایپ آسان بینکاری",
    click_url: "https://hbl.com",
    status: "run",
    impressions: 530,
    clicks: 17,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 104,
    slot_key: "home-infeed-2",
    name: "National Bank of Pakistan — Kamyab Jawan Financing",
    type: "direct",
    runs_on: "ur",
    weight: 1,
    image_url: "",
    image_alt: "نیشنل بینک آف پاکستان کامیاب نوجوان اسکیم",
    click_url: "https://nbp.com.pk",
    status: "run",
    impressions: 310,
    clicks: 8,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 105,
    slot_key: "home-mpu",
    name: "PTCL Flash Fiber — Ultra High Speed Internet",
    type: "direct",
    runs_on: "both",
    weight: 1,
    image_url: "",
    image_alt: "پی ٹی سی ایل فلیش فائبر تیز رفتار انٹرنیٹ",
    click_url: "https://ptcl.com.pk",
    status: "run",
    impressions: 275,
    clicks: 11,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 106,
    slot_key: "home-sidebar",
    name: "Afadiat Digital Edition — Mobile App Subscription",
    type: "house",
    runs_on: "both",
    weight: 1,
    image_url: "",
    image_alt: "ڈیلی افادیت ڈیجیٹل موبائل ایپ ابھی ڈاؤنلوڈ کریں",
    click_url: "https://dailyafadiat.com/apps",
    status: "run",
    impressions: 190,
    clicks: 6,
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
  {
    id: 107,
    slot_key: "section-leaderboard",
    name: "Pak Suzuki — Hybrid Sedan Special Financing Offer",
    type: "direct",
    runs_on: "en",
    weight: 1,
    image_url: "",
    image_alt: "Pak Suzuki Hybrid Sedan Financing Scheme",
    click_url: "https://suzukipakistan.com",
    status: "run",
    impressions: 240,
    clicks: 7,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 108,
    slot_key: "section-infeed",
    name: "Jazz Super 4G — Corporate Data Packages",
    type: "direct",
    runs_on: "both",
    weight: 1,
    image_url: "",
    image_alt: "جاز سپر فور جی کارپوریٹ ڈیٹا پیکجز",
    click_url: "https://jazz.com.pk",
    status: "run",
    impressions: 185,
    clicks: 5,
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 109,
    slot_key: "article-mpu",
    name: "article-mpu-house",
    type: "house",
    runs_on: "both",
    weight: 1,
    image_url: "",
    image_alt: "اشتہار دینے کے لیے رابطہ کریں — 0300-1234567",
    click_url: "https://dailyafadiat.com/advertise",
    status: "run",
    impressions: 345,
    clicks: 12,
    created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: 110,
    slot_key: "story-inline",
    name: "Faysal Bank — Noor Islamic Digital Cards",
    type: "direct",
    runs_on: "both",
    weight: 1,
    image_url: "",
    image_alt: "فیصل بینک نور اسلامک ڈیجیٹل کارڈز",
    click_url: "https://faysalbank.com",
    status: "run",
    impressions: 290,
    clicks: 9,
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 111,
    slot_key: "story-mpu",
    name: "Ufone 4G — Super Card Gold Subscription",
    type: "direct",
    runs_on: "both",
    weight: 1,
    image_url: "",
    image_alt: "یو فون سپر کارڈ گولڈ سبسکربشن",
    click_url: "https://ufone.com",
    status: "run",
    impressions: 210,
    clicks: 6,
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
];

export async function getAdSlots() {
  const local = ensureLocalStore();
  if (!local.ad_slots_v2 || !Array.isArray(local.ad_slots_v2) || local.ad_slots_v2.length === 0) {
    local.ad_slots_v2 = DEFAULT_AD_SLOTS;
    if (!local.ad_creatives || local.ad_creatives.length === 0) {
      local.ad_creatives = DEFAULT_AD_CREATIVES;
    }
    writeLocalStore(local);
  }
  return local.ad_slots_v2;
}

export async function getAdCreatives(slotKey = null) {
  const local = ensureLocalStore();
  if (!local.ad_creatives || !Array.isArray(local.ad_creatives) || local.ad_creatives.length === 0) {
    local.ad_creatives = DEFAULT_AD_CREATIVES;
    writeLocalStore(local);
  }
  if (slotKey) {
    return local.ad_creatives.filter((c) => c.slot_key === slotKey);
  }
  return local.ad_creatives;
}

export async function createAdSlot(slotData) {
  const local = ensureLocalStore();
  const slots = await getAdSlots();
  const newSlot = {
    id: Date.now(),
    slot_key: (slotData.slot_key || "").toLowerCase().trim().replace(/[^a-z0-9_-]/g, "-"),
    name: slotData.name || slotData.slot_key,
    sizes: slotData.sizes || "728x90, 300x250",
    pages: Array.isArray(slotData.pages) ? slotData.pages : (slotData.pages || "all").split(",").map((s) => s.trim()),
    is_active: slotData.is_active !== false,
    created_at: new Date().toISOString(),
  };
  slots.push(newSlot);
  local.ad_slots_v2 = slots;
  writeLocalStore(local);
  return newSlot;
}

export async function updateAdSlot(slotKey, updates) {
  const local = ensureLocalStore();
  const slots = await getAdSlots();
  const idx = slots.findIndex((s) => s.slot_key === slotKey);
  if (idx >= 0) {
    slots[idx] = { ...slots[idx], ...updates, updated_at: new Date().toISOString() };
    local.ad_slots_v2 = slots;
    writeLocalStore(local);
    return slots[idx];
  }
  return null;
}

export async function deleteAdSlot(slotKey) {
  const local = ensureLocalStore();
  let slots = await getAdSlots();
  slots = slots.filter((s) => s.slot_key !== slotKey);
  local.ad_slots_v2 = slots;
  if (local.ad_creatives) {
    local.ad_creatives = local.ad_creatives.filter((c) => c.slot_key !== slotKey);
  }
  writeLocalStore(local);
  return { success: true };
}

export async function createAdCreative(creativeData) {
  const local = ensureLocalStore();
  const creatives = await getAdCreatives();
  const newCreative = {
    id: Date.now(),
    slot_key: creativeData.slot_key,
    name: creativeData.name,
    type: creativeData.type || "direct",
    runs_on: creativeData.runs_on || "both",
    weight: Number(creativeData.weight) || 1,
    image_url: creativeData.image_url || "",
    image_alt: creativeData.image_alt || "",
    html_code: creativeData.html_code || "",
    click_url: creativeData.click_url || "",
    starts_at: creativeData.starts_at || null,
    ends_at: creativeData.ends_at || null,
    status: creativeData.status || "run",
    impressions: 0,
    clicks: 0,
    created_at: new Date().toISOString(),
  };
  creatives.unshift(newCreative);
  local.ad_creatives = creatives;
  writeLocalStore(local);
  return newCreative;
}

export async function updateAdCreative(id, updates) {
  const local = ensureLocalStore();
  const creatives = await getAdCreatives();
  const idx = creatives.findIndex((c) => c.id === Number(id));
  if (idx >= 0) {
    creatives[idx] = { ...creatives[idx], ...updates, updated_at: new Date().toISOString() };
    local.ad_creatives = creatives;
    writeLocalStore(local);
    return creatives[idx];
  }
  return null;
}

export async function deleteAdCreative(id) {
  const local = ensureLocalStore();
  let creatives = await getAdCreatives();
  creatives = creatives.filter((c) => c.id !== Number(id));
  local.ad_creatives = creatives;
  writeLocalStore(local);
  return { success: true };
}

export async function getAdSlot(slotKey) {
  const slots = await getAdSlots();
  return slots.find((s) => s.slot_key === slotKey && s.is_active);
}

// ==========================================
// 2. COMMENTS API (Admin Verified / Check & Balance)
// ==========================================
export async function getComments(articleId = null, includeAll = false) {
  try {
    let query = supabaseAdmin.from("comments").select("*, articles(title_ur)").order("created_at", { ascending: false });
    if (articleId) query = query.eq("article_id", articleId);
    if (!includeAll) query = query.eq("status", "approved");

    const { data, error } = await query;
    if (!error && data) return data;
  } catch (e) {}

  const local = ensureLocalStore();
  let list = local.comments || [];
  if (articleId) list = list.filter((c) => c.article_id === Number(articleId));
  if (!includeAll) list = list.filter((c) => c.status === "approved");
  return list;
}

export async function addComment({ article_id, author_name, author_email, content }) {
  const newComment = {
    article_id: Number(article_id),
    author_name,
    author_email,
    content,
    status: "pending", // requires admin approval!
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabaseAdmin.from("comments").insert(newComment).select();
    if (!error && data) return data[0];
  } catch (e) {}

  const local = ensureLocalStore();
  newComment.id = Date.now();
  local.comments.unshift(newComment);
  writeLocalStore(local);
  return newComment;
}

export async function updateCommentStatus(commentId, status) {
  try {
    const { data, error } = await supabaseAdmin
      .from("comments")
      .update({ status })
      .eq("id", commentId)
      .select();
    if (!error && data) return data[0];
  } catch (e) {}

  const local = ensureLocalStore();
  const c = local.comments.find((item) => item.id === Number(commentId));
  if (c) {
    c.status = status;
    writeLocalStore(local);
  }
  return c;
}

export async function deleteComment(commentId) {
  try {
    await supabaseAdmin.from("comments").delete().eq("id", commentId);
  } catch (e) {}

  const local = ensureLocalStore();
  local.comments = local.comments.filter((item) => item.id !== Number(commentId));
  writeLocalStore(local);
  return { success: true };
}

// ==========================================
// 3. SITE SETTINGS API (Social Media & Info)
// Backed by existing Supabase `ad_slots` table using `__cms_kv__:<key>` rows
// ==========================================
const KV_SLOT_PREFIX = "__cms_kv__:";

export async function getSiteSetting(key) {
  const slotKey = `${KV_SLOT_PREFIX}${key}`;
  try {
    const { data, error } = await supabaseAdmin
      .from("ad_slots")
      .select("target_url")
      .eq("slot_key", slotKey)
      .order("id", { ascending: false })
      .limit(1);
    if (!error && Array.isArray(data) && data.length > 0 && data[0].target_url) {
      return JSON.parse(data[0].target_url);
    }
  } catch (e) {}

  const local = ensureLocalStore();
  return local.site_settings?.[key] ?? null;
}

export async function updateSiteSetting(key, value) {
  const slotKey = `${KV_SLOT_PREFIX}${key}`;
  const serialized = JSON.stringify(value);
  try {
    const { data: existing, error: selErr } = await supabaseAdmin
      .from("ad_slots")
      .select("id")
      .eq("slot_key", slotKey)
      .order("id", { ascending: false });

    if (!selErr) {
      if (Array.isArray(existing) && existing.length > 0) {
        const latestId = existing[0].id;
        const { error: updErr } = await supabaseAdmin
          .from("ad_slots")
          .update({ target_url: serialized, title: key, is_active: false })
          .eq("id", latestId);
        if (existing.length > 1) {
          const duplicateIds = existing.slice(1).map((r) => r.id);
          await supabaseAdmin.from("ad_slots").delete().in("id", duplicateIds);
        }
        if (!updErr) {
          const local = ensureLocalStore();
          if (!local.site_settings) local.site_settings = {};
          local.site_settings[key] = value;
          writeLocalStore(local);
          return value;
        }
      } else {
        const { error: insErr } = await supabaseAdmin
          .from("ad_slots")
          .insert({
            slot_key: slotKey,
            title: key,
            target_url: serialized,
            is_active: false,
          });
        if (!insErr) {
          const local = ensureLocalStore();
          if (!local.site_settings) local.site_settings = {};
          local.site_settings[key] = value;
          writeLocalStore(local);
          return value;
        }
      }
    }
  } catch (e) {}

  const local = ensureLocalStore();
  if (!local.site_settings) local.site_settings = {};
  local.site_settings[key] = value;
  writeLocalStore(local);
  return value;
}

// ==========================================
// 4. NEWSLETTER & SUBSCRIBERS API
// ==========================================
export async function getSubscribers() {
  try {
    const { data, error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) return data;
  } catch (e) {}

  const local = ensureLocalStore();
  return local.newsletter_subscribers || [];
}

export async function addSubscriber(email) {
  const cleanEmail = email.trim().toLowerCase();
  try {
    const { data, error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .insert({ email: cleanEmail, is_active: true })
      .select();
    if (!error && data) return { success: true, subscriber: data[0] };
  } catch (e) {}

  const local = ensureLocalStore();
  const exists = local.newsletter_subscribers.find((s) => s.email === cleanEmail);
  if (!exists) {
    const sub = { id: Date.now(), email: cleanEmail, is_active: true, created_at: new Date().toISOString() };
    local.newsletter_subscribers.push(sub);
    writeLocalStore(local);
    return { success: true, subscriber: sub };
  }
  return { success: true, message: "Already subscribed" };
}

// ==========================================
// 5. CONTACT MESSAGES API
// ==========================================
export async function getContactMessages() {
  try {
    const { data, error } = await supabaseAdmin
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) return data;
  } catch (e) {}

  const local = ensureLocalStore();
  return local.contact_messages || [];
}

export async function addContactMessage({ name, email, phone, subject, message }) {
  const newMsg = {
    name,
    email,
    phone: phone || null,
    subject: subject || "عام استفسار (General Inquiry)",
    message,
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabaseAdmin.from("contact_messages").insert(newMsg).select();
    if (!error && data) return data[0];
  } catch (e) {}

  const local = ensureLocalStore();
  if (!local.contact_messages) local.contact_messages = [];
  newMsg.id = Date.now();
  local.contact_messages.unshift(newMsg);
  writeLocalStore(local);
  return newMsg;
}

export async function deleteContactMessage(id) {
  try {
    await supabaseAdmin.from("contact_messages").delete().eq("id", id);
  } catch (e) {}

  const local = ensureLocalStore();
  if (local.contact_messages) {
    local.contact_messages = local.contact_messages.filter((m) => m.id !== Number(id));
    writeLocalStore(local);
  }
  return { success: true };
}

// ==========================================
// 6. VIDEOS API
// ==========================================
export async function getVideos(category = null) {
  try {
    let q = supabaseAdmin.from("videos").select("*").order("created_at", { ascending: false });
    if (category && category !== "all") {
      q = q.eq("category", category);
    }
    const { data, error } = await q;
    if (!error && data && data.length > 0) return data;
  } catch (e) {}

  const local = ensureLocalStore();
  let list = local.videos || [];
  if (category && category !== "all") {
    list = list.filter((v) => v.category === category);
  }
  return list;
}

export async function getVideoById(id) {
  try {
    const { data, error } = await supabaseAdmin.from("videos").select("*").eq("id", id).maybeSingle();
    if (!error && data) return data;
  } catch (e) {}

  const local = ensureLocalStore();
  return (local.videos || []).find((v) => String(v.id) === String(id));
}

export async function saveVideo(videoData) {
  const isUpdate = Boolean(videoData.id);
  const now = new Date().toISOString();

  if (isUpdate) {
    const id = videoData.id;
    try {
      const { data, error } = await supabaseAdmin
        .from("videos")
        .update({ ...videoData, updated_at: now })
        .eq("id", id)
        .select();
      if (!error && data) return data[0];
    } catch (e) {}

    const local = ensureLocalStore();
    const idx = (local.videos || []).findIndex((v) => String(v.id) === String(id));
    if (idx !== -1) {
      local.videos[idx] = { ...local.videos[idx], ...videoData, updated_at: now };
      writeLocalStore(local);
      return local.videos[idx];
    }
  }

  // Create new
  const newVideo = {
    ...videoData,
    id: videoData.id || Date.now(),
    created_at: now,
    updated_at: now,
  };

  try {
    const { data, error } = await supabaseAdmin.from("videos").insert(newVideo).select();
    if (!error && data) return data[0];
  } catch (e) {}

  const local = ensureLocalStore();
  if (!local.videos) local.videos = [];
  local.videos.unshift(newVideo);
  writeLocalStore(local);
  return newVideo;
}

export async function deleteVideo(id) {
  try {
    await supabaseAdmin.from("videos").delete().eq("id", id);
  } catch (e) {}

  const local = ensureLocalStore();
  if (local.videos) {
    local.videos = local.videos.filter((v) => String(v.id) !== String(id));
    writeLocalStore(local);
  }
  return { success: true };
}

// ==========================================
// 7. EPAPER API
// ==========================================
const SAMPLE_EPAPER_PDF_URL =
  "https://pub-afe682c6e960401f9f06ea1705e8db77.r2.dev/_________________1795264182825.pdf";
const REAL_EPAPER_BASE =
  "https://pub-afe682c6e960401f9f06ea1705e8db77.r2.dev/epaper-pages";

function getRealNewspaperPageUrl(pageNumber = 1, isThumb = false) {
  const n = Math.max(1, ((Number(pageNumber) || 1) - 1) % 39 + 1);
  return `${REAL_EPAPER_BASE}/issue-2026-11-21-p${n}${isThumb ? "-thumb" : ""}.jpg`;
}

function isStockPhotoUrl(url) {
  if (!url) return true;
  const s = String(url);
  return s.includes("images.unsplash.com") || s.includes("digitaloceanspaces.com");
}

function normalizePdfUrl(url) {
  if (!url || String(url).includes("digitaloceanspaces.com")) {
    return SAMPLE_EPAPER_PDF_URL;
  }
  return url;
}

function normalizeCitySlug(rawCity) {
  const c = String(rawCity || "islamabad").toLowerCase();
  if (c.includes("lahore") || c.includes("لاہور")) return "lahore";
  if (c.includes("karachi") || c.includes("کراچی")) return "karachi";
  if (c.includes("quetta") || c.includes("کوئٹہ")) return "quetta";
  if (c.includes("international") || c.includes("انٹرنیشنل")) return "international";
  return "islamabad";
}

export async function getEpaperEditions(date = null, city = null) {
  try {
    const v2Issues = await loadEpaperIssuesV2();
    const liveIssues = (v2Issues || []).filter((issue) => issue && issue.is_live !== false);
    if (liveIssues.length > 0) {
      const flattened = [];
      for (const issue of liveIssues) {
        const citySlug = normalizeCitySlug(issue.city || issue.title);
        const pdfUrl = normalizePdfUrl(issue.pdf_url);
        for (const p of issue.pages || []) {
          flattened.push({
            id: `${issue.id}_p${p.page_number}`,
            issue_id: issue.id,
            edition_date: issue.edition_date,
            paper: issue.paper || "ur",
            city_slug: citySlug,
            city_name_ur: issue.title || issue.city || "اسلام آباد / راولپنڈی",
            city_name_en: issue.city || issue.title || "Islamabad",
            page_number: Number(p.page_number) || 1,
            page_title_ur: p.title || `صفحہ ${p.page_number}`,
            page_title_en: p.title || `Page ${p.page_number}`,
            page_image: p.image_url || "",
            thumbnail_url: p.thumbnail_url || p.image_url || "",
            pdf_url: pdfUrl,
            regions: Array.isArray(p.regions) ? p.regions : [],
            is_active: true,
          });
        }
      }
      let filtered = flattened;
      if (date) filtered = filtered.filter((e) => e.edition_date === date);
      if (city && city !== "all") filtered = filtered.filter((e) => e.city_slug === city);
      if (filtered.length > 0) {
        return filtered.sort((a, b) => (Number(a.page_number) || 1) - (Number(b.page_number) || 1));
      }
      return flattened.sort((a, b) => (Number(a.page_number) || 1) - (Number(b.page_number) || 1));
    }
  } catch (e) {}

  const local = ensureLocalStore();
  let list = local.epaper_editions || [];
  if (date) list = list.filter((e) => e.edition_date === date);
  if (city && city !== "all") list = list.filter((e) => e.city_slug === city);
  return list.sort((a, b) => (Number(a.page_number) || 1) - (Number(b.page_number) || 1));
}

export async function saveEpaperEdition(editionData) {
  const isUpdate = Boolean(editionData.id);
  const now = new Date().toISOString();

  if (isUpdate) {
    const id = editionData.id;
    try {
      const { data, error } = await supabaseAdmin
        .from("epaper_editions")
        .update({ ...editionData, updated_at: now })
        .eq("id", id)
        .select();
      if (!error && data) return data[0];
    } catch (e) {}

    const local = ensureLocalStore();
    const idx = (local.epaper_editions || []).findIndex((e) => String(e.id) === String(id));
    if (idx !== -1) {
      local.epaper_editions[idx] = { ...local.epaper_editions[idx], ...editionData, updated_at: now };
      writeLocalStore(local);
      return local.epaper_editions[idx];
    }
  }

  // Create new
  const newEdition = {
    ...editionData,
    id: editionData.id || Date.now(),
    page_number: Number(editionData.page_number) || 1,
    created_at: now,
    updated_at: now,
  };

  try {
    const { data, error } = await supabaseAdmin.from("epaper_editions").insert(newEdition).select();
    if (!error && data) return data[0];
  } catch (e) {}

  const local = ensureLocalStore();
  if (!local.epaper_editions) local.epaper_editions = [];
  local.epaper_editions.push(newEdition);
  writeLocalStore(local);
  return newEdition;
}

export async function deleteEpaperEdition(id) {
  try {
    await supabaseAdmin.from("epaper_editions").delete().eq("id", id);
  } catch (e) {}

  const local = ensureLocalStore();
  if (local.epaper_editions) {
    local.epaper_editions = local.epaper_editions.filter((e) => String(e.id) !== String(id));
    writeLocalStore(local);
  }
  return { success: true };
}

// ----------------------------------------------------
// DAILY INSAAF EPAPER V2 (Multi-page Edition Pipeline & Hot-Zones)
// ----------------------------------------------------

const DEFAULT_EPAPER_ISSUES = [
  {
    id: 1,
    edition_date: "2026-11-20",
    paper: "ur",
    city: "Islamabad",
    title: "Islamabad",
    status: "ready",
    is_live: true,
    file_size: "15.6 MB",
    pdf_url: SAMPLE_EPAPER_PDF_URL,
    published_at: "2026-11-20T09:30:00.000Z",
    pages: Array.from({ length: 8 }, (_, idx) => {
      const pageNum = idx + 1;
      return {
        page_number: pageNum,
        title: `Page ${pageNum}`,
        image_url: getRealNewspaperPageUrl(pageNum, false),
        thumbnail_url: getRealNewspaperPageUrl(pageNum, true),
        regions:
          pageNum === 1
            ? [
                {
                  id: "reg_1",
                  headline: "ڈیلی افادیت ڈیجیٹل اور پرنٹ ایڈیشن کا شاندار آغاز",
                  body: "جدید ترین پرنٹنگ ٹیکنالوجی اور ڈیجیٹل سروسز کے ساتھ ملکی صحافت میں ایک نئے دور کا آغاز۔",
                  article_id: "1",
                  coordinates: { x: 20, y: 20, width: 35, height: 25 },
                },
              ]
            : [],
      };
    }),
  },
];

function healEditionPages(issue) {
  let healed = false;
  const cleanPdf = normalizePdfUrl(issue.pdf_url);
  if (cleanPdf !== issue.pdf_url) healed = true;
  const rawPages = Array.isArray(issue.pages) && issue.pages.length > 0 ? issue.pages : [];
  const nextPages = rawPages.map((p, idx) => {
    const pageNum = Number(p.page_number) || idx + 1;
    let img = p.image_url;
    let thumb = p.thumbnail_url;
    if (isStockPhotoUrl(img)) {
      img = getRealNewspaperPageUrl(pageNum, false);
      healed = true;
    }
    if (isStockPhotoUrl(thumb)) {
      thumb = getRealNewspaperPageUrl(pageNum, true);
      healed = true;
    }
    return {
      ...p,
      page_number: pageNum,
      title: p.title || `Page ${pageNum}`,
      image_url: img,
      thumbnail_url: thumb || img,
      regions: Array.isArray(p.regions) ? p.regions : [],
    };
  });
  return {
    healed,
    issue: {
      ...issue,
      pdf_url: cleanPdf,
      pages: nextPages,
    },
  };
}

async function loadEpaperIssuesV2() {
  const remote = await getSiteSetting("epaper_issues_v2");
  if (Array.isArray(remote) && remote.length > 0) {
    let anyHealed = false;
    const normalized = remote.map((issue) => {
      const res = healEditionPages(issue);
      if (res.healed) anyHealed = true;
      return res.issue;
    });
    if (anyHealed) {
      await updateSiteSetting("epaper_issues_v2", normalized);
    }
    return normalized;
  }
  const local = ensureLocalStore();
  const rawSeed =
    Array.isArray(local.epaper_issues_v2) && local.epaper_issues_v2.length > 0
      ? local.epaper_issues_v2
      : DEFAULT_EPAPER_ISSUES;
  const seed = rawSeed.map((issue) => healEditionPages(issue).issue);
  await updateSiteSetting("epaper_issues_v2", seed);
  return seed;
}

async function saveEpaperIssuesV2(list) {
  await updateSiteSetting("epaper_issues_v2", list);
  const local = ensureLocalStore();
  local.epaper_issues_v2 = list;
  writeLocalStore(local);
}

export async function getEpaperEditionsV2(date = null, paper = null) {
  let list = await loadEpaperIssuesV2();
  if (date) list = list.filter((e) => e.edition_date === date);
  if (paper && paper !== "both") list = list.filter((e) => e.paper === paper);
  return list;
}

export async function createEpaperEditionV2(data) {
  const list = [...(await loadEpaperIssuesV2())];

  let finalPages = [];
  if (Array.isArray(data.pages) && data.pages.length > 0) {
    finalPages = data.pages.map((p, idx) => {
      const pageNum = Number(p.page_number) || idx + 1;
      const img = p.image_url || getRealNewspaperPageUrl(pageNum, false);
      const thumb = p.thumbnail_url || p.image_url || getRealNewspaperPageUrl(pageNum, true);
      return {
        page_number: pageNum,
        title: p.title || `Page ${pageNum}`,
        image_url: img,
        thumbnail_url: thumb,
        regions: Array.isArray(p.regions) ? p.regions : [],
      };
    });
  } else {
    const numPages = Number(data.page_count) > 0 ? Number(data.page_count) : 8;
    for (let i = 1; i <= numPages; i++) {
      finalPages.push({
        page_number: i,
        title: `Page ${i}`,
        image_url: getRealNewspaperPageUrl(i, false),
        thumbnail_url: getRealNewspaperPageUrl(i, true),
        regions: [],
      });
    }
  }

  const newIssue = {
    id: Date.now(),
    edition_date: data.edition_date || new Date().toISOString().split("T")[0],
    paper: data.paper || "ur",
    city: data.city || data.title || "Islamabad",
    title: data.title || "Islamabad",
    status: "ready",
    is_live: true,
    file_size: data.file_size || "15.6 MB",
    pdf_url: normalizePdfUrl(data.pdf_url),
    published_at: new Date().toISOString(),
    pages: finalPages,
  };

  list.unshift(newIssue);
  await saveEpaperIssuesV2(list);
  return newIssue;
}

export async function updateEpaperEditionV2(id, updates) {
  const list = [...(await loadEpaperIssuesV2())];
  const idx = list.findIndex((e) => String(e.id) === String(id));
  if (idx >= 0) {
    list[idx] = { ...list[idx], ...updates, updated_at: new Date().toISOString() };
    await saveEpaperIssuesV2(list);
    return list[idx];
  }
  return null;
}

export async function deleteEpaperEditionV2(id) {
  let list = await loadEpaperIssuesV2();
  list = list.filter((e) => String(e.id) !== String(id));
  await saveEpaperIssuesV2(list);
  return { success: true };
}

export async function saveEpaperPageRegions(editionId, pageNumber, regions) {
  const list = [...(await loadEpaperIssuesV2())];
  const edition = list.find((e) => String(e.id) === String(editionId));
  if (!edition) return { error: "Edition not found" };

  const page = (edition.pages || []).find((p) => Number(p.page_number) === Number(pageNumber));
  if (!page) return { error: "Page not found" };

  page.regions = regions;
  await saveEpaperIssuesV2(list);
  return { success: true, page };
}

// ==========================================
// 8. PAGES API (Standalone CMS Pages)
// ==========================================
export async function getPages() {
  try {
    const { data, error } = await supabaseAdmin.from("pages").select("*").order("created_at", { ascending: false });
    if (!error && data && data.length > 0) return data;
  } catch (e) {}

  const local = ensureLocalStore();
  return local.pages || [];
}

export async function getPageBySlug(slug) {
  try {
    const { data, error } = await supabaseAdmin.from("pages").select("*").eq("slug", slug).maybeSingle();
    if (!error && data) return data;
  } catch (e) {}

  const local = ensureLocalStore();
  return (local.pages || []).find((p) => p.slug === slug);
}

export async function savePage(pageData) {
  const isUpdate = Boolean(pageData.id);
  const now = new Date().toISOString();

  if (isUpdate) {
    const id = pageData.id;
    try {
      const { data, error } = await supabaseAdmin
        .from("pages")
        .update({ ...pageData, updated_at: now })
        .eq("id", id)
        .select();
      if (!error && data) return data[0];
    } catch (e) {}

    const local = ensureLocalStore();
    const idx = (local.pages || []).findIndex((p) => String(p.id) === String(id));
    if (idx !== -1) {
      local.pages[idx] = { ...local.pages[idx], ...pageData, updated_at: now };
      writeLocalStore(local);
      return local.pages[idx];
    }
  }

  // Create new
  const cleanSlug = pageData.slug
    ? pageData.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, "-")
    : `page-${Date.now()}`;

  const newPage = {
    ...pageData,
    slug: cleanSlug,
    id: pageData.id || Date.now(),
    is_published: pageData.is_published !== undefined ? Boolean(pageData.is_published) : true,
    created_at: now,
    updated_at: now,
  };

  try {
    const { data, error } = await supabaseAdmin.from("pages").insert(newPage).select();
    if (!error && data) return data[0];
  } catch (e) {}

  const local = ensureLocalStore();
  if (!local.pages) local.pages = [];
  local.pages.unshift(newPage);
  writeLocalStore(local);
  return newPage;
}

export async function deletePage(id) {
  try {
    await supabaseAdmin.from("pages").delete().eq("id", id);
  } catch (e) {}

  const local = ensureLocalStore();
  if (local.pages) {
    local.pages = local.pages.filter((p) => String(p.id) !== String(id));
    writeLocalStore(local);
  }
  return { success: true };
}

// ----------------------------------------------------
// DAILY VOTING POLL (رائے شماری) FUNCTIONS
// ----------------------------------------------------

export async function getAllPolls() {
  const local = ensureLocalStore();
  if (!local.polls || !Array.isArray(local.polls) || local.polls.length === 0) {
    local.polls = [
      {
        id: 1,
        question_ur: "کیا حالیہ معاشی و مالیاتی اصلاحات سے ملک میں مہنگائی میں کمی اور عوام کو حقیقی ریلیف ملے گا؟",
        question_en: "Do you believe current macroeconomic reforms will provide genuine relief from inflation to the public?",
        options: [
          { id: "opt_1", label_ur: "ہاں، بہتری آئے گی", label_en: "Yes, definitely", votes: 384 },
          { id: "opt_2", label_ur: "نہیں، ریلیف نہیں ملے گا", label_en: "No, unlikely", votes: 142 },
          { id: "opt_3", label_ur: "کہہ نہیں سکتے / قبل از وقت", label_en: "Undecided / Too early", votes: 48 },
        ],
        total_votes: 574,
        status: "open",
        is_active: true,
        target_stories: [],
        created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
      },
      {
        id: 2,
        question_ur: "کیا مصنوعی ذہانت (AI) کا صحافت میں بڑھتا ہوا استعمال خبروں کی ساکھ کو متاثر کرے گا؟",
        question_en: "Will the increasing adoption of AI in newsrooms impact editorial credibility?",
        options: [
          { id: "opt_1", label_ur: "ہاں، ساکھ متاثر ہو سکتی ہے", label_en: "Yes, credibility risk", votes: 215 },
          { id: "opt_2", label_ur: "نہیں، تحقیق اور تصدیق تیز ہوگی", label_en: "No, aids verification", votes: 180 },
          { id: "opt_3", label_ur: "مدیران کی اخلاقی نگرانی پر منحصر ہے", label_en: "Depends on editorial oversight", votes: 95 },
        ],
        total_votes: 490,
        status: "closed",
        is_active: false,
        target_stories: [],
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
    ];
    local.daily_poll = local.polls[0];
    writeLocalStore(local);
  }
  return local.polls;
}

export async function getActivePoll(storyId = null) {
  const polls = await getAllPolls();
  if (storyId) {
    const storyPoll = polls.find(
      (p) => (p.status === "open" || p.is_active) && p.target_stories && p.target_stories.includes(Number(storyId))
    );
    if (storyPoll) return storyPoll;
  }
  const generalPoll = polls.find((p) => p.status === "open" || p.is_active);
  return generalPoll || polls[0] || null;
}

export async function createPoll(pollData) {
  const local = ensureLocalStore();
  const polls = await getAllPolls();
  const newPoll = {
    id: Date.now(),
    question_ur: pollData.question_ur || "",
    question_en: pollData.question_en || "",
    options: (pollData.options || []).map((opt, idx) => ({
      id: opt.id || `opt_${idx + 1}`,
      label_ur: opt.label_ur || "",
      label_en: opt.label_en || "",
      votes: 0,
    })),
    total_votes: 0,
    status: pollData.status || "open",
    is_active: pollData.status === "open" || pollData.is_active !== false,
    target_stories: pollData.target_stories || [],
    target_story_title: pollData.target_story_title || null,
    created_at: new Date().toISOString(),
  };

  // If new poll is open, close others or keep as active
  polls.unshift(newPoll);
  local.polls = polls;
  local.daily_poll = newPoll;
  writeLocalStore(local);
  return newPoll;
}

export async function voteOnPoll(optionId, pollId = null) {
  const local = ensureLocalStore();
  const polls = await getAllPolls();
  let poll = null;
  if (pollId) {
    poll = polls.find((p) => p.id === Number(pollId));
  }
  if (!poll) {
    poll = polls.find((p) => p.status === "open" || p.is_active) || polls[0];
  }
  if (!poll) return { error: "No poll found" };

  const opt = poll.options.find((o) => o.id === optionId);
  if (!opt) return { error: "Option not found" };

  opt.votes = (opt.votes || 0) + 1;
  poll.total_votes = (poll.total_votes || 0) + 1;

  local.polls = polls;
  if (local.daily_poll && local.daily_poll.id === poll.id) {
    local.daily_poll = poll;
  }
  writeLocalStore(local);
  return poll;
}

export async function updatePoll(pollIdOrData, maybeData = null) {
  const local = ensureLocalStore();
  const polls = await getAllPolls();

  let targetId = null;
  let updateData = {};

  if (typeof pollIdOrData === "object" && pollIdOrData !== null) {
    targetId = pollIdOrData.id;
    updateData = pollIdOrData;
  } else {
    targetId = pollIdOrData;
    updateData = maybeData || {};
  }

  let index = targetId ? polls.findIndex((p) => p.id === Number(targetId)) : 0;
  if (index === -1) index = 0;

  polls[index] = {
    ...polls[index],
    ...updateData,
    updated_at: new Date().toISOString(),
  };

  if (updateData.status) {
    polls[index].is_active = updateData.status === "open";
  }

  local.polls = polls;
  if (local.daily_poll && local.daily_poll.id === polls[index].id) {
    local.daily_poll = polls[index];
  }
  writeLocalStore(local);
  return polls[index];
}

export async function resetPollVotes(pollId) {
  const local = ensureLocalStore();
  const polls = await getAllPolls();
  const poll = polls.find((p) => p.id === Number(pollId));
  if (!poll) return { error: "Poll not found" };

  poll.options.forEach((opt) => {
    opt.votes = 0;
  });
  poll.total_votes = 0;
  local.polls = polls;
  if (local.daily_poll && local.daily_poll.id === poll.id) {
    local.daily_poll = poll;
  }
  writeLocalStore(local);
  return poll;
}

export async function deletePoll(pollId) {
  const local = ensureLocalStore();
  let polls = await getAllPolls();
  polls = polls.filter((p) => p.id !== Number(pollId));
  local.polls = polls;
  if (local.daily_poll && local.daily_poll.id === Number(pollId)) {
    local.daily_poll = polls[0] || null;
  }
  writeLocalStore(local);
  return { success: true };
}

// ----------------------------------------------------
// SECTIONS & CATEGORIES TAXONOMY API
// ----------------------------------------------------

const DEFAULT_CATEGORIES = [
  {
    id: 1,
    name_en: "Pakistan",
    name_ur: "پاکستان",
    slug: "pakistan",
    url_path: "/pakistan",
    parent_id: null,
    articles_count: 65,
    show_in_header: true,
    show_in_mobile: true,
    show_in_footer: true,
    is_active: true,
    sort_order: 1,
    layout: "Grid",
  },
  {
    id: 2,
    name_en: "Punjab",
    name_ur: "پنجاب",
    slug: "punjab",
    url_path: "/pakistan/punjab",
    parent_id: 1,
    parent_name_en: "Pakistan",
    articles_count: 172,
    show_in_header: true,
    show_in_mobile: true,
    show_in_footer: false,
    is_active: true,
    sort_order: 2,
    layout: "Grid",
  },
  {
    id: 3,
    name_en: "Sindh",
    name_ur: "سندھ",
    slug: "sindh",
    url_path: "/pakistan/sindh",
    parent_id: 1,
    parent_name_en: "Pakistan",
    articles_count: 12,
    show_in_header: true,
    show_in_mobile: true,
    show_in_footer: false,
    is_active: true,
    sort_order: 3,
    layout: "Grid",
  },
  {
    id: 4,
    name_en: "Islamabad",
    name_ur: "اسلام آباد",
    slug: "islamabad",
    url_path: "/pakistan/islamabad",
    parent_id: 1,
    parent_name_en: "Pakistan",
    articles_count: 17,
    show_in_header: true,
    show_in_mobile: true,
    show_in_footer: false,
    is_active: true,
    sort_order: 4,
    layout: "Grid",
  },
  {
    id: 5,
    name_en: "Khyber Pakhtunkhwa",
    name_ur: "خیبر پختونخوا",
    slug: "kpk",
    url_path: "/pakistan/kpk",
    parent_id: 1,
    parent_name_en: "Pakistan",
    articles_count: 12,
    show_in_header: true,
    show_in_mobile: true,
    show_in_footer: false,
    is_active: true,
    sort_order: 5,
    layout: "Grid",
  },
  {
    id: 6,
    name_en: "Balochistan",
    name_ur: "بلوچستان",
    slug: "balochistan",
    url_path: "/pakistan/balochistan",
    parent_id: 1,
    parent_name_en: "Pakistan",
    articles_count: 10,
    show_in_header: true,
    show_in_mobile: true,
    show_in_footer: false,
    is_active: true,
    sort_order: 6,
    layout: "Grid",
  },
  {
    id: 7,
    name_en: "Azad Kashmir",
    name_ur: "آزاد کشمیر",
    slug: "kashmir",
    url_path: "/pakistan/kashmir",
    parent_id: 1,
    parent_name_en: "Pakistan",
    articles_count: 6,
    show_in_header: true,
    show_in_mobile: true,
    show_in_footer: false,
    is_active: true,
    sort_order: 7,
    layout: "Grid",
  },
  {
    id: 8,
    name_en: "World",
    name_ur: "انٹرنیشنل",
    slug: "world",
    url_path: "/world",
    parent_id: null,
    articles_count: 43,
    show_in_header: true,
    show_in_mobile: true,
    show_in_footer: true,
    is_active: true,
    sort_order: 8,
    layout: "Grid",
  },
  {
    id: 9,
    name_en: "Sports",
    name_ur: "کھیل",
    slug: "sports",
    url_path: "/sports",
    parent_id: null,
    articles_count: 33,
    show_in_header: true,
    show_in_mobile: true,
    show_in_footer: true,
    is_active: true,
    sort_order: 9,
    layout: "Grid",
  },
  {
    id: 10,
    name_en: "Business",
    name_ur: "بزنس",
    slug: "business",
    url_path: "/business",
    parent_id: null,
    articles_count: 28,
    show_in_header: true,
    show_in_mobile: true,
    show_in_footer: true,
    is_active: true,
    sort_order: 10,
    layout: "Grid",
  },
  {
    id: 11,
    name_en: "Entertainment",
    name_ur: "انٹرٹینمنٹ",
    slug: "entertainment",
    url_path: "/entertainment",
    parent_id: null,
    articles_count: 24,
    show_in_header: true,
    show_in_mobile: true,
    show_in_footer: true,
    is_active: true,
    sort_order: 11,
    layout: "Grid",
  },
  {
    id: 12,
    name_en: "Science & Technology",
    name_ur: "سائنس و ٹیکنالوجی",
    slug: "tech",
    url_path: "/tech",
    parent_id: null,
    articles_count: 19,
    show_in_header: true,
    show_in_mobile: true,
    show_in_footer: true,
    is_active: true,
    sort_order: 12,
    layout: "Grid",
  },
  {
    id: 13,
    name_en: "Health",
    name_ur: "صحت",
    slug: "health",
    url_path: "/health",
    parent_id: null,
    articles_count: 14,
    show_in_header: true,
    show_in_mobile: true,
    show_in_footer: true,
    is_active: true,
    sort_order: 13,
    layout: "Grid",
  },
  {
    id: 14,
    name_en: "Opinion",
    name_ur: "اداریہ و کالم",
    slug: "opinion",
    url_path: "/opinion",
    parent_id: null,
    articles_count: 21,
    show_in_header: true,
    show_in_mobile: true,
    show_in_footer: true,
    is_active: true,
    sort_order: 14,
    layout: "Grid",
  },
  {
    id: 15,
    name_en: "Fact Check",
    name_ur: "حقائق نامہ (فیکٹ چیک)",
    slug: "fact-check",
    url_path: "/fact-check",
    parent_id: null,
    articles_count: 7,
    show_in_header: false,
    show_in_mobile: true,
    show_in_footer: true,
    is_active: true,
    sort_order: 15,
    layout: "Grid",
  },
  {
    id: 16,
    name_en: "Special Reports",
    name_ur: "خصوصی رپورٹ",
    slug: "special",
    url_path: "/special",
    parent_id: null,
    articles_count: 8,
    show_in_header: true,
    show_in_mobile: true,
    show_in_footer: true,
    is_active: true,
    sort_order: 16,
    layout: "Grid",
  },
];

export async function getCategories() {
  const local = ensureLocalStore();
  if (!local.categories_v2 || !Array.isArray(local.categories_v2) || local.categories_v2.length === 0) {
    local.categories_v2 = DEFAULT_CATEGORIES;
    writeLocalStore(local);
  }
  return local.categories_v2;
}

export async function createCategory(catData) {
  const local = ensureLocalStore();
  const categories = await getCategories();

  const cleanSlug = (catData.slug || catData.name_en || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, "-");

  let parentName = null;
  let urlPath = `/${cleanSlug}`;

  if (catData.parent_id) {
    const parent = categories.find((c) => String(c.id) === String(catData.parent_id));
    if (parent) {
      parentName = parent.name_en;
      urlPath = `${parent.url_path || `/${parent.slug}`}/${cleanSlug}`;
    }
  }

  const newCat = {
    id: Date.now(),
    name_en: catData.name_en || "",
    name_ur: catData.name_ur || "",
    slug: cleanSlug,
    url_path: urlPath,
    parent_id: catData.parent_id ? Number(catData.parent_id) : null,
    parent_name_en: parentName,
    description_ur: catData.description_ur || "",
    description_en: catData.description_en || "",
    articles_count: 0,
    show_in_header: catData.show_in_header !== false,
    show_in_mobile: catData.show_in_mobile !== false,
    show_in_footer: Boolean(catData.show_in_footer),
    is_active: catData.is_active !== false,
    sort_order: Number(catData.sort_order) || categories.length + 1,
    layout: catData.layout || "Grid",
    seo_title: catData.seo_title || "",
    meta_description: catData.meta_description || "",
    no_index: Boolean(catData.no_index),
    created_at: new Date().toISOString(),
  };

  categories.push(newCat);
  local.categories_v2 = categories;
  writeLocalStore(local);
  return newCat;
}

export async function updateCategory(id, updates) {
  const local = ensureLocalStore();
  const categories = await getCategories();
  const idx = categories.findIndex((c) => String(c.id) === String(id));
  if (idx >= 0) {
    const existing = categories[idx];
    const cleanSlug = updates.slug
      ? updates.slug.toLowerCase().trim().replace(/[^a-z0-9_-]/g, "-")
      : existing.slug;

    let parentName = existing.parent_name_en;
    let urlPath = updates.url_path || existing.url_path;

    if (updates.parent_id !== undefined) {
      if (updates.parent_id) {
        const parent = categories.find((c) => String(c.id) === String(updates.parent_id));
        if (parent) {
          parentName = parent.name_en;
          urlPath = `${parent.url_path || `/${parent.slug}`}/${cleanSlug}`;
        }
      } else {
        parentName = null;
        urlPath = `/${cleanSlug}`;
      }
    }

    categories[idx] = {
      ...existing,
      ...updates,
      slug: cleanSlug,
      url_path: urlPath,
      parent_name_en: parentName,
      updated_at: new Date().toISOString(),
    };
    local.categories_v2 = categories;
    writeLocalStore(local);
    return categories[idx];
  }
  return null;
}

export async function deleteCategory(id) {
  const local = ensureLocalStore();
  let categories = await getCategories();
  categories = categories.filter((c) => String(c.id) !== String(id));
  local.categories_v2 = categories;
  writeLocalStore(local);
  return { success: true };
}

// ----------------------------------------------------
// LAYOUT BUILDER & HOMEPAGE ZONES API
// ----------------------------------------------------

const DEFAULT_LAYOUT_ZONES = [
  {
    key: "top",
    label: "Top",
    max_blocks: 2,
    allowed_types: ["Hero", "Ticker"],
  },
  {
    key: "body",
    label: "Body",
    max_blocks: null,
    allowed_types: ["Grid", "List", "Carousel", "Video rail", "Opinion", "Widget", "Ad"],
  },
  {
    key: "bottom",
    label: "Bottom",
    max_blocks: null,
    allowed_types: ["List", "Opinion", "Ad", "Widget"],
  },
];

const DEFAULT_LAYOUT_BLOCKS = [
  {
    id: "blk_top_1",
    zone: "top",
    title_ur: "",
    title_en: "Untitled block",
    style: "Hero",
    fill_mode: "auto",
    category_slug: null,
    limit: 5,
    order_by: "featured",
    featured_only: true,
    is_active: true,
  },
  {
    id: "blk_body_1",
    zone: "body",
    title_ur: "بزنس",
    title_en: "Business",
    style: "List",
    fill_mode: "auto",
    category_slug: "business",
    limit: 6,
    order_by: "recent",
    featured_only: false,
    is_active: true,
  },
  {
    id: "blk_body_2",
    zone: "body",
    title_ur: "پاکستان",
    title_en: "Pakistan",
    style: "Grid",
    fill_mode: "auto",
    category_slug: "pakistan",
    limit: 10,
    order_by: "recent",
    featured_only: false,
    is_active: true,
  },
  {
    id: "blk_body_3",
    zone: "body",
    title_ur: "اہم خبریں",
    title_en: "Top stories",
    style: "Grid",
    fill_mode: "auto",
    category_slug: null,
    limit: 8,
    order_by: "recent",
    featured_only: false,
    is_active: true,
  },
  {
    id: "blk_body_4",
    zone: "body",
    title_ur: "انٹرنیشنل",
    title_en: "World",
    style: "Grid",
    fill_mode: "auto",
    category_slug: "world",
    limit: 6,
    order_by: "recent",
    featured_only: false,
    is_active: true,
  },
  {
    id: "blk_body_5",
    zone: "body",
    title_ur: "کھیل",
    title_en: "Sports",
    style: "Grid",
    fill_mode: "auto",
    category_slug: "sports",
    limit: 6,
    order_by: "recent",
    featured_only: false,
    is_active: true,
  },
  {
    id: "blk_body_6",
    zone: "body",
    title_ur: "انٹرٹینمنٹ",
    title_en: "Entertainment",
    style: "Grid",
    fill_mode: "auto",
    category_slug: "entertainment",
    limit: 6,
    order_by: "recent",
    featured_only: false,
    is_active: true,
  },
  {
    id: "blk_body_7",
    zone: "body",
    title_ur: "▶ ویڈیوز",
    title_en: "Videos",
    style: "Video rail",
    fill_mode: "auto",
    category_slug: "videos",
    limit: 8,
    order_by: "recent",
    featured_only: false,
    is_active: true,
  },
  {
    id: "blk_body_8",
    zone: "body",
    title_ur: "سائنس و ٹیکنالوجی",
    title_en: "Science & Technology",
    style: "Grid",
    fill_mode: "auto",
    category_slug: "tech",
    limit: 6,
    order_by: "recent",
    featured_only: false,
    is_active: true,
  },
  {
    id: "blk_body_9",
    zone: "body",
    title_ur: "مقبول خبریں",
    title_en: "Most read",
    style: "List",
    fill_mode: "auto",
    category_slug: null,
    limit: 10,
    order_by: "views",
    featured_only: false,
    is_active: true,
  },
  {
    id: "blk_body_10",
    zone: "body",
    title_ur: "صحت",
    title_en: "Health",
    style: "Grid",
    fill_mode: "auto",
    category_slug: "health",
    limit: 6,
    order_by: "recent",
    featured_only: false,
    is_active: true,
  },
  {
    id: "blk_body_11",
    zone: "body",
    title_ur: "جرائم",
    title_en: "Crime",
    style: "Grid",
    fill_mode: "auto",
    category_slug: "crime",
    limit: 6,
    order_by: "recent",
    featured_only: false,
    is_active: true,
  },
  {
    id: "blk_body_12",
    zone: "body",
    title_ur: "لائف اسٹائل",
    title_en: "Lifestyle",
    style: "Grid",
    fill_mode: "auto",
    category_slug: "lifestyle",
    limit: 6,
    order_by: "recent",
    featured_only: false,
    is_active: true,
  },
  {
    id: "blk_body_13",
    zone: "body",
    title_ur: "دلچسپ و عجیب",
    title_en: "Weird News",
    style: "Grid",
    fill_mode: "auto",
    category_slug: "weird",
    limit: 6,
    order_by: "recent",
    featured_only: false,
    is_active: true,
  },
  {
    id: "blk_bottom_1",
    zone: "bottom",
    title_ur: "رائے و کالم",
    title_en: "Opinion",
    style: "Opinion",
    fill_mode: "auto",
    category_slug: "opinion",
    limit: 4,
    order_by: "recent",
    featured_only: false,
    is_active: true,
  },
];

export async function getLayout(pageKey = "home", edition = "ur") {
  const local = ensureLocalStore();
  if (!local.layout_config) {
    local.layout_config = {
      zones: DEFAULT_LAYOUT_ZONES,
      blocks: DEFAULT_LAYOUT_BLOCKS,
    };
    writeLocalStore(local);
  }
  return {
    zones: local.layout_config.zones || DEFAULT_LAYOUT_ZONES,
    blocks: local.layout_config.blocks || DEFAULT_LAYOUT_BLOCKS,
  };
}

export async function saveLayoutBlocks(blocks) {
  const local = ensureLocalStore();
  if (!local.layout_config) local.layout_config = { zones: DEFAULT_LAYOUT_ZONES, blocks: [] };
  local.layout_config.blocks = blocks;
  writeLocalStore(local);
  return local.layout_config.blocks;
}

export async function saveLayoutZones(zones) {
  const local = ensureLocalStore();
  if (!local.layout_config) local.layout_config = { zones: DEFAULT_LAYOUT_ZONES, blocks: DEFAULT_LAYOUT_BLOCKS };
  local.layout_config.zones = zones;
  writeLocalStore(local);
  return local.layout_config.zones;
}

export async function createLayoutBlock(blockData) {
  const local = ensureLocalStore();
  const { blocks } = await getLayout();
  const newBlock = {
    id: `blk_${Date.now()}`,
    zone: blockData.zone || "body",
    title_ur: blockData.title_ur || "",
    title_en: blockData.title_en || "Untitled block",
    subtitle_ur: blockData.subtitle_ur || "",
    subtitle_en: blockData.subtitle_en || "",
    style: blockData.style || "Grid",
    fill_mode: blockData.fill_mode || "auto",
    category_slug: blockData.category_slug || null,
    limit: Number(blockData.limit) || 6,
    order_by: blockData.order_by || "recent",
    featured_only: Boolean(blockData.featured_only),
    is_active: blockData.is_active !== false,
    created_at: new Date().toISOString(),
  };
  blocks.push(newBlock);
  local.layout_config.blocks = blocks;
  writeLocalStore(local);
  return newBlock;
}

export async function updateLayoutBlock(blockId, updates) {
  const local = ensureLocalStore();
  const { blocks } = await getLayout();
  const idx = blocks.findIndex((b) => b.id === blockId);
  if (idx >= 0) {
    blocks[idx] = { ...blocks[idx], ...updates, updated_at: new Date().toISOString() };
    local.layout_config.blocks = blocks;
    writeLocalStore(local);
    return blocks[idx];
  }
  return null;
}

export async function deleteLayoutBlock(blockId) {
  const local = ensureLocalStore();
  let { blocks } = await getLayout();
  blocks = blocks.filter((b) => b.id !== blockId);
  local.layout_config.blocks = blocks;
  writeLocalStore(local);
  return { success: true };
}

// ----------------------------------------------------
// MEDIA LIBRARY & CLOUD ASSET MANAGEMENT API
// ----------------------------------------------------

const DEFAULT_MEDIA_ASSETS = [
  {
    id: 1,
    filename: "pm_shehbaz_address_un_general_assembly.webp",
    url: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=800&auto=format&fit=crop",
    size: "142 KB",
    size_bytes: 145408,
    alt_text: "وزیراعظم شہباز شریف کا اقوام متحدہ کی جنرل اسمبلی کے اجلاس سے خصوصی خطاب",
    caption: "وزیراعظم کا عالمی فورم پر موسمیاتی انصاف اور معاشی خود انحصاری پر زور",
    credit: "پی آئی ڈی / شفقات راؤ",
    focal_point: { x: 50, y: 35 },
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 2,
    filename: "pakistan_stock_exchange_kse100_rally.webp",
    url: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop",
    size: "88 KB",
    size_bytes: 90112,
    alt_text: "پاکستان اسٹاک ایکسچینج میں ریکارڈ تیزی، 100 انڈیکس میں تاریخی اضافہ",
    caption: "پی ایس ایکس ٹریڈنگ فلور پر بروکرز اور سرمایہ کاروں کا غیر معمولی جوش و خروش",
    credit: "رائٹرز بزنس سروس",
    focal_point: { x: 50, y: 50 },
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
  {
    id: 3,
    filename: "cpec_western_route_inauguration_highway.jpg",
    url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&auto=format&fit=crop",
    size: "210 KB",
    size_bytes: 215040,
    alt_text: "",
    caption: "",
    credit: "",
    focal_point: { x: 50, y: 50 },
    created_at: new Date(Date.now() - 3600000 * 14).toISOString(),
  },
  {
    id: 4,
    filename: "gaddafi_stadium_champions_trophy_preparations.webp",
    url: "https://images.unsplash.com/photo-1531415074868-036b107e775a?w=800&auto=format&fit=crop",
    size: "165 KB",
    size_bytes: 168960,
    alt_text: "قذافی اسٹیڈیم لاہور میں آئی سی سی چیمپئنز ٹرافی 2025 کے لیے فلڈ لائٹس اور پویلین کی اپ گریڈیشن",
    caption: "لاہور میں جاری بین الاقوامی کرکٹ سہولیات کے تزئین و آرائش کے کام کا فضائی منظر",
    credit: "پی سی بی میڈیا ونگ",
    focal_point: { x: 52, y: 40 },
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 5,
    filename: "karachi_port_terminal_container_export.webp",
    url: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=800&auto=format&fit=crop",
    size: "128 KB",
    size_bytes: 131072,
    alt_text: "",
    caption: "",
    credit: "",
    focal_point: { x: 50, y: 50 },
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 6,
    filename: "islamabad_supreme_court_bench_hearing.jpg",
    url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop",
    size: "195 KB",
    size_bytes: 199680,
    alt_text: "سپریم کورٹ آف پاکستان، شاہراہ دستور اسلام آباد کا سامنے کا منظر",
    caption: "آئینی بینچ کے اہم فیصلوں کے موقع پر عدالت عظمیٰ کا مرکزی ہال",
    credit: "اے پی پی",
    focal_point: { x: 50, y: 30 },
    created_at: new Date(Date.now() - 86400000 * 2.5).toISOString(),
  },
  {
    id: 7,
    filename: "digital_pakistan_software_technology_park.webp",
    url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop",
    size: "115 KB",
    size_bytes: 117760,
    alt_text: "پاکستانی نوجوان سافٹ ویئر انجینئرز اور آئی ٹی ماہرین جدید اے آئی پروجیکٹ پر کام کرتے ہوئے",
    caption: "قومی آئی ٹی برآمدات میں 35 فیصد سالانہ اضافے کے اہداف پر پیش رفت",
    credit: "آئی ٹی منسٹری پاکستان",
    focal_point: { x: 45, y: 45 },
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 8,
    filename: "lahore_smog_environmental_green_initiative.jpg",
    url: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=800&auto=format&fit=crop",
    size: "240 KB",
    size_bytes: 245760,
    alt_text: "",
    caption: "",
    credit: "",
    focal_point: { x: 50, y: 50 },
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: 9,
    filename: "babur_azam_shaheen_afridi_training_session.webp",
    url: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=800&auto=format&fit=crop",
    size: "178 KB",
    size_bytes: 182272,
    alt_text: "بابر اعظم اور شاہین شاہ آفریدی نیٹ پریکٹس کے دوران گیند بازی کی مشق کرتے ہوئے",
    caption: "آسٹریلیا اور زمبابوے کے خلاف وائٹ بال سیریز کے لیے قومی کیمپ",
    credit: "گیٹی اسپورٹس",
    focal_point: { x: 50, y: 40 },
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 10,
    filename: "gold_bullion_foreign_exchange_reserves.webp",
    url: "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&auto=format&fit=crop",
    size: "92 KB",
    size_bytes: 94208,
    alt_text: "اسٹیٹ بینک آف پاکستان کے غیر ملکی زرمبادلہ اور سونے کے ذخائر",
    caption: "مرکزی بینک کے زرمبادلہ کے ذخائر میں مسلسل استحکام کی رپورٹ",
    credit: "بلومبرگ نیوز",
    focal_point: { x: 50, y: 50 },
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
];

export async function getMediaAssets() {
  const local = ensureLocalStore();
  if (!local.media_assets || !Array.isArray(local.media_assets) || local.media_assets.length === 0) {
    local.media_assets = DEFAULT_MEDIA_ASSETS;
    writeLocalStore(local);
  }
  return local.media_assets;
}

export async function createMediaAsset(assetData) {
  const local = ensureLocalStore();
  const assets = await getMediaAssets();
  const newAsset = {
    id: Date.now(),
    filename: assetData.filename || `upload_${Date.now()}.jpg`,
    url: assetData.url || "",
    size: assetData.size || "100 KB",
    size_bytes: assetData.size_bytes || 102400,
    alt_text: assetData.alt_text || "",
    caption: assetData.caption || "",
    credit: assetData.credit || "",
    focal_point: assetData.focal_point || { x: 50, y: 50 },
    created_at: new Date().toISOString(),
  };
  assets.unshift(newAsset);
  local.media_assets = assets;
  writeLocalStore(local);
  return newAsset;
}

export async function updateMediaAsset(id, updates) {
  const local = ensureLocalStore();
  const assets = await getMediaAssets();
  const idx = assets.findIndex((a) => String(a.id) === String(id));
  if (idx >= 0) {
    assets[idx] = { ...assets[idx], ...updates, updated_at: new Date().toISOString() };
    local.media_assets = assets;
    writeLocalStore(local);
    return assets[idx];
  }
  return null;
}

export async function deleteMediaAsset(id) {
  const local = ensureLocalStore();
  let assets = await getMediaAssets();
  assets = assets.filter((a) => String(a.id) !== String(id));
  local.media_assets = assets;
  writeLocalStore(local);
  return { success: true };
}

// ==========================================
// 10. SERVICES DATA & WIDGETS API
// ==========================================
const DEFAULT_CITIES_PRAYER = [
  { id: "Karachi", name_ur: "کراچی", name_en: "Karachi", baseFajr: "05:32", baseSunrise: "06:51", baseDhuhr: "12:18", baseAsrShafi: "15:32", baseAsrHanafi: "16:15", baseMaghrib: "17:45", baseIsha: "19:04" },
  { id: "Lahore", name_ur: "لاہور", name_en: "Lahore", baseFajr: "05:14", baseSunrise: "06:38", baseDhuhr: "11:58", baseAsrShafi: "15:08", baseAsrHanafi: "15:52", baseMaghrib: "17:18", baseIsha: "18:42" },
  { id: "Islamabad", name_ur: "اسلام آباد", name_en: "Islamabad", baseFajr: "05:16", baseSunrise: "06:43", baseDhuhr: "11:53", baseAsrShafi: "15:01", baseAsrHanafi: "15:47", baseMaghrib: "17:03", baseIsha: "18:29" },
  { id: "Rawalpindi", name_ur: "راولپنڈی", name_en: "Rawalpindi", baseFajr: "05:17", baseSunrise: "06:44", baseDhuhr: "11:54", baseAsrShafi: "15:02", baseAsrHanafi: "15:48", baseMaghrib: "17:04", baseIsha: "18:30" },
  { id: "Faisalabad", name_ur: "فیصل آباد", name_en: "Faisalabad", baseFajr: "05:19", baseSunrise: "06:43", baseDhuhr: "12:03", baseAsrShafi: "15:13", baseAsrHanafi: "15:57", baseMaghrib: "17:23", baseIsha: "18:47" },
  { id: "Multan", name_ur: "ملتان", name_en: "Multan", baseFajr: "05:25", baseSunrise: "06:47", baseDhuhr: "12:10", baseAsrShafi: "15:21", baseAsrHanafi: "16:04", baseMaghrib: "17:33", baseIsha: "18:55" },
  { id: "Peshawar", name_ur: "پشاور", name_en: "Peshawar", baseFajr: "05:23", baseSunrise: "06:50", baseDhuhr: "12:00", baseAsrShafi: "15:08", baseAsrHanafi: "15:54", baseMaghrib: "17:10", baseIsha: "18:37" },
  { id: "Quetta", name_ur: "کوئٹہ", name_en: "Quetta", baseFajr: "05:38", baseSunrise: "07:01", baseDhuhr: "12:21", baseAsrShafi: "15:28", baseAsrHanafi: "16:11", baseMaghrib: "17:41", baseIsha: "19:04" },
  { id: "Hyderabad", name_ur: "حیدرآباد", name_en: "Hyderabad", baseFajr: "05:30", baseSunrise: "06:49", baseDhuhr: "12:16", baseAsrShafi: "15:30", baseAsrHanafi: "16:13", baseMaghrib: "17:43", baseIsha: "19:02" },
];

function generate31DaysPrayer(cityId, overrides = {}) {
  const city = DEFAULT_CITIES_PRAYER.find((c) => c.id === cityId) || DEFAULT_CITIES_PRAYER[0];
  const list = [];
  const baseDate = new Date();

  for (let i = 0; i < 31; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const key = `${cityId}_${dateStr}`;
    const override = overrides[key];

    // Compute slight seasonal minute drift (approx 1 min per 2-3 days)
    const drift = Math.floor(i / 3);
    const addMinutes = (timeStr, mins) => {
      const [h, m] = timeStr.split(":").map(Number);
      const total = h * 60 + m + mins;
      const newH = Math.floor(total / 60) % 24;
      const newM = total % 60;
      return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
    };

    const hijriDay = 11 + i;
    const hijriMonth = "Jumada II";
    const hijriYear = 1448;
    const hijriDate = `${hijriMonth} ${hijriDay}, ${hijriYear} AH`;

    if (override && override.locked) {
      list.push({
        date: dateStr,
        city: cityId,
        fajr: override.fajr,
        sunrise: override.sunrise,
        dhuhr: override.dhuhr,
        asrShafi: override.asrShafi,
        asrHanafi: override.asrHanafi,
        maghrib: override.maghrib,
        isha: override.isha,
        hijri: override.hijri || hijriDate,
        locked: true,
        updatedAt: override.updatedAt,
      });
    } else {
      list.push({
        date: dateStr,
        city: cityId,
        fajr: addMinutes(city.baseFajr, drift),
        sunrise: addMinutes(city.baseSunrise, drift),
        dhuhr: city.baseDhuhr,
        asrShafi: addMinutes(city.baseAsrShafi, -drift),
        asrHanafi: addMinutes(city.baseAsrHanafi, -drift),
        maghrib: addMinutes(city.baseMaghrib, -drift),
        isha: addMinutes(city.baseIsha, -drift),
        hijri: hijriDate,
        locked: false,
      });
    }
  }
  return list;
}

const DEFAULT_CURRENCY_RATES = [
  { code: "AED", name_ur: "اماراتی درہم", name_en: "UAE Dirham", buy: "75.40", sell: "75.95", source: "Manual · 20 Nov 2026, 09:30" },
  { code: "CNY", name_ur: "چینی یوان", name_en: "Chinese Yuan", buy: "38.20", sell: "38.65", source: "Manual · 20 Nov 2026, 09:30" },
  { code: "EUR", name_ur: "یورو", name_en: "Euro", buy: "308.80", sell: "312.40", source: "Manual · 20 Nov 2026, 09:30" },
  { code: "GBP", name_ur: "برطانوی پاؤنڈ", name_en: "British Pound", buy: "373.20", sell: "376.50", source: "Manual · 20 Nov 2026, 09:30" },
  { code: "SAR", name_ur: "سعودی ریال", name_en: "Saudi Riyal", buy: "73.85", sell: "74.50", source: "Manual · 20 Nov 2026, 09:30" },
  { code: "USD", name_ur: "امریکی ڈالر", name_en: "US Dollar", buy: "277.50", sell: "279.00", source: "Manual · 20 Nov 2026, 09:30" },
];

const DEFAULT_WEATHER_CITIES = [
  { city: "Faisalabad", name_ur: "فیصل آباد", temp: 24, feels: 24, humidity: 45, wind: 8, condition: "Clear — صاف", icon: "☀️", source: "Manual · 20 Nov 2026, 09:30" },
  { city: "Hyderabad", name_ur: "حیدرآباد", temp: 29, feels: 30, humidity: 58, wind: 12, condition: "Mostly clear — جزوی مطلع صاف", icon: "🌤️", source: "Manual · 20 Nov 2026, 09:30" },
  { city: "Islamabad", name_ur: "اسلام آباد", temp: 21, feels: 20, humidity: 50, wind: 7, condition: "Clear — صاف", icon: "☀️", source: "Manual · 20 Nov 2026, 09:30" },
  { city: "Karachi", name_ur: "کراچی", temp: 28, feels: 29, humidity: 62, wind: 14, condition: "Clear — صاف", icon: "☀️", source: "Manual · 20 Nov 2026, 09:30" },
  { city: "Lahore", name_ur: "لاہور", temp: 23, feels: 23, humidity: 55, wind: 6, condition: "Haze — دھند/گرد", icon: "🌫️", source: "Manual · 20 Nov 2026, 09:30" },
  { city: "Multan", name_ur: "ملتان", temp: 26, feels: 26, humidity: 42, wind: 9, condition: "Clear — صاف", icon: "☀️", source: "Manual · 20 Nov 2026, 09:30" },
  { city: "Peshawar", name_ur: "پشاور", temp: 22, feels: 21, humidity: 48, wind: 8, condition: "Clear — صاف", icon: "☀️", source: "Manual · 20 Nov 2026, 09:30" },
  { city: "Quetta", name_ur: "کوئٹہ", temp: 16, feels: 15, humidity: 32, wind: 11, condition: "Sunny & dry — سرد و خشک", icon: "☀️", source: "Manual · 20 Nov 2026, 09:30" },
  { city: "Rawalpindi", name_ur: "راولپنڈی", temp: 21, feels: 20, humidity: 52, wind: 7, condition: "Clear — صاف", icon: "☀️", source: "Manual · 20 Nov 2026, 09:30" },
];

export async function getWidgetsData(selectedCity = "Karachi") {
  const local = ensureLocalStore();
  if (!local.widgets) {
    local.widgets = {
      prayer: {
        showOnWebsite: true,
        asrShown: "both", // "both" | "hanafi" | "shafi"
        hijriAdjustment: 0, // -1 | 0 | 1
        calculationMethod: "University of Islamic Sciences, Karachi (Fajr & Isha 18°)",
        overrides: {},
      },
      currency: {
        showOnWebsite: true,
        mode: "manual", // "manual" | "auto"
        rates: DEFAULT_CURRENCY_RATES,
      },
      gold: {
        showOnWebsite: true,
        mode: "manual",
        premium: 0,
        gold24k: 422095,
        gold22k: 389402,
        updatedAt: "Manual · 20 Nov 2026, 09:30",
      },
      weather: {
        showOnWebsite: true,
        mode: "manual",
        cities: DEFAULT_WEATHER_CITIES,
      },
    };
    writeLocalStore(local);
  }

  const overrides = local.widgets.prayer?.overrides || {};
  const timetable = generate31DaysPrayer(selectedCity, overrides);

  return {
    prayer: {
      ...local.widgets.prayer,
      cities: DEFAULT_CITIES_PRAYER,
      timetable,
    },
    currency: local.widgets.currency,
    gold: local.widgets.gold,
    weather: local.widgets.weather,
  };
}

export async function updatePrayerSettings(settings) {
  const local = ensureLocalStore();
  if (!local.widgets) await getWidgetsData();
  local.widgets.prayer = {
    ...local.widgets.prayer,
    ...settings,
    updatedAt: new Date().toISOString(),
  };
  writeLocalStore(local);
  return local.widgets.prayer;
}

export async function savePrayerDayOverride(city, date, data) {
  const local = ensureLocalStore();
  if (!local.widgets) await getWidgetsData();
  if (!local.widgets.prayer.overrides) local.widgets.prayer.overrides = {};

  const key = `${city}_${date}`;
  local.widgets.prayer.overrides[key] = {
    ...data,
    locked: true,
    updatedAt: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
  };
  writeLocalStore(local);
  return local.widgets.prayer.overrides[key];
}

export async function resetPrayerDayOverride(city, date) {
  const local = ensureLocalStore();
  if (!local.widgets) await getWidgetsData();
  if (local.widgets.prayer?.overrides) {
    const key = `${city}_${date}`;
    delete local.widgets.prayer.overrides[key];
    writeLocalStore(local);
  }
  return { success: true };
}

export async function updateCurrencyRates(rates, mode = "manual", showOnWebsite = true) {
  const local = ensureLocalStore();
  if (!local.widgets) await getWidgetsData();
  const timeStr = `Manual · ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}, ${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;

  const updatedRates = rates.map((r) => ({
    ...r,
    source: timeStr,
  }));

  local.widgets.currency = {
    showOnWebsite,
    mode,
    rates: updatedRates,
    updatedAt: timeStr,
  };
  writeLocalStore(local);
  return local.widgets.currency;
}

export async function updateGoldSettings(goldData) {
  const local = ensureLocalStore();
  if (!local.widgets) await getWidgetsData();
  const timeStr = `Manual · ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}, ${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;

  local.widgets.gold = {
    ...local.widgets.gold,
    ...goldData,
    updatedAt: timeStr,
  };
  writeLocalStore(local);
  return local.widgets.gold;
}

export async function updateWeatherSettings(cities, mode = "manual", showOnWebsite = true) {
  const local = ensureLocalStore();
  if (!local.widgets) await getWidgetsData();
  const timeStr = `Manual · ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}, ${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;

  local.widgets.weather = {
    showOnWebsite,
    mode,
    cities: cities.map((c) => ({ ...c, source: timeStr })),
    updatedAt: timeStr,
  };
  writeLocalStore(local);
  return local.widgets.weather;
}

export async function fetchLiveServiceData(serviceType) {
  const local = ensureLocalStore();
  if (!local.widgets) await getWidgetsData();
  const timeStr = `Auto · ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}, ${new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;

  if (serviceType === "currency") {
    local.widgets.currency.mode = "auto";
    local.widgets.currency.updatedAt = timeStr;
    local.widgets.currency.rates = local.widgets.currency.rates.map((r) => ({
      ...r,
      source: `Interbank · ${timeStr}`,
    }));
  } else if (serviceType === "gold") {
    local.widgets.gold.mode = "auto";
    local.widgets.gold.updatedAt = timeStr;
  } else if (serviceType === "weather") {
    local.widgets.weather.mode = "auto";
    local.widgets.weather.updatedAt = timeStr;
    local.widgets.weather.cities = local.widgets.weather.cities.map((c) => ({
      ...c,
      source: `MET Norway · ${timeStr}`,
    }));
  }
  writeLocalStore(local);
  return local.widgets;
}

// ==========================================
// 11. NEWSROOM USERS & ROLES API
// ==========================================
const DEFAULT_NEWSROOM_USERS = [
  {
    id: "usr_admin",
    email: "admin@dailyafadiat.com",
    starting_password: "••••••••••••",
    full_name_ur: "ایڈمن",
    full_name_en: "System Administrator",
    byline_name: "ادارتی بورڈ",
    designation_ur: "چیف سسٹم ایڈمنسٹریٹر",
    designation_en: "Chief System Administrator",
    bio_ur: "ڈیلی افادات کا مرکزی ادارتی اور تکنیکی نظام۔ تمام خبروں، ایڈیشنز اور ڈیسک کی نگرانی۔",
    bio_en: "Central editorial and technical administration. Oversees all newsroom operations, desk workflows and editions.",
    roles: ["Super Admin"],
    desk_scope: [],
    is_public_author: false,
    status: "Active",
    last_active: "12 hours ago",
    created_at: "2026-08-01T10:00:00Z",
  },
  {
    id: "usr_reporter_1",
    email: "reporter@dailyafadiat.com",
    starting_password: "••••••••••••",
    full_name_ur: "ٹیسٹ رپورٹر",
    full_name_en: "Staff Reporter",
    byline_name: "اسٹاف رپورٹر",
    designation_ur: "سینئر رپورٹر",
    designation_en: "Senior Reporter",
    bio_ur: "قومی اور بین الاقوامی امور، پارلیمانی کارروائی اور قانونی رپورٹنگ میں دس سالہ تجربہ۔",
    bio_en: "Over a decade of experience covering national, parliamentary and international affairs.",
    roles: ["Reporter"],
    desk_scope: ["Pakistan", "World"],
    is_public_author: true,
    status: "Active",
    last_active: "13 Aug 2026",
    created_at: "2026-08-10T12:00:00Z",
  },
  {
    id: "usr_columnist_1",
    email: "bilal@dailyafadiat.com",
    starting_password: "••••••••••••",
    full_name_ur: "بلال حسین",
    full_name_en: "Bilal Hussain",
    byline_name: "بلال حسین",
    designation_ur: "معروف کالم نگار",
    designation_en: "Senior Columnist",
    bio_ur: "سیاسی تجزیہ کار اور مصنف۔ ملکی معیشت، خارجہ پالیسی اور سماجی رجحانات پر باقاعدہ کالم نگاری۔",
    bio_en: "Political analyst and author. Regular columns on national economics, foreign policy, and social trends.",
    roles: ["Columnist"],
    desk_scope: ["Opinion", "Blogs"],
    is_public_author: true,
    status: "Active",
    last_active: "31 Aug 2026",
    created_at: "2026-08-15T09:00:00Z",
  },
  {
    id: "usr_subeditor_1",
    email: "ayesha@dailyafadiat.com",
    starting_password: "••••••••••••",
    full_name_ur: "عائشہ نور",
    full_name_en: "Ayesha Noor",
    byline_name: "عائشہ نور",
    designation_ur: "سب ایڈیٹر",
    designation_en: "Sub-Editor",
    bio_ur: "ڈیجیٹل نیوز ڈیسک، کاپی ایڈیٹنگ اور اردو مضامین کی لسانی تدوین۔",
    bio_en: "Digital news desk curation, copy-editing and Urdu linguistic proofing.",
    roles: ["Sub-Editor"],
    desk_scope: [],
    is_public_author: true,
    status: "Active",
    last_active: "never signed in",
    created_at: "2026-09-01T14:00:00Z",
  },
  {
    id: "usr_columnist_2",
    email: "zain@yopmail.com",
    starting_password: "••••••••••••",
    full_name_ur: "زین عباس",
    full_name_en: "Zain Abbas",
    byline_name: "زین عباس",
    designation_ur: "کالم نگار و فیچر رائٹر",
    designation_en: "Columnist & Feature Writer",
    bio_ur: "ماحولیات، انسانی حقوق اور ماحولیاتی تبدیلی پر خصوصی مضامین۔",
    bio_en: "Special features on ecology, human rights, and climate justice.",
    roles: ["Columnist"],
    desk_scope: ["Opinion", "Special Reports"],
    is_public_author: true,
    status: "Active",
    last_active: "never signed in",
    created_at: "2026-09-05T11:00:00Z",
  },
  {
    id: "usr_reporter_2",
    email: "fsdfsa@yopmail.com",
    starting_password: "••••••••••••",
    full_name_ur: "22wr242",
    full_name_en: "Desk Reporter",
    byline_name: "Desk Reporter",
    designation_ur: "رپورٹر",
    designation_en: "Reporter",
    bio_ur: "",
    bio_en: "",
    roles: ["Reporter"],
    desk_scope: ["Sports"],
    is_public_author: false,
    status: "Disabled",
    last_active: "never signed in",
    created_at: "2026-09-12T16:00:00Z",
  },
];

async function loadNewsroomUsers() {
  const remoteUsers = await getSiteSetting("newsroom_users");
  if (Array.isArray(remoteUsers) && remoteUsers.length > 0) {
    return remoteUsers;
  }
  const local = ensureLocalStore();
  const seed =
    Array.isArray(local.newsroom_users) && local.newsroom_users.length > 0
      ? local.newsroom_users
      : DEFAULT_NEWSROOM_USERS;
  await updateSiteSetting("newsroom_users", seed);
  return seed;
}

async function saveNewsroomUsers(users) {
  await updateSiteSetting("newsroom_users", users);
  const local = ensureLocalStore();
  local.newsroom_users = users;
  writeLocalStore(local);
}

export async function getNewsroomUsers() {
  const users = await loadNewsroomUsers();
  return users.map((u) => ({
    ...u,
    starting_password: "••••••••••••",
  }));
}

export async function authenticateNewsroomUser(email, password) {
  if (!email || !password) return { error: "Email and password are required" };
  const users = [...(await loadNewsroomUsers())];
  const idx = users.findIndex(
    (u) => String(u.email).toLowerCase() === String(email).trim().toLowerCase()
  );
  if (idx < 0) {
    return { error: "Invalid email or password" };
  }
  const user = users[idx];
  if (String(user.status || "Active").toLowerCase() !== "active") {
    return { error: "Account is disabled. Contact Super Admin." };
  }
  const valid = verifyPassword(password, user.starting_password);
  if (!valid) {
    return { error: "Invalid email or password" };
  }
  users[idx] = {
    ...user,
    last_active: new Date().toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
  await saveNewsroomUsers(users);
  return { user: sanitizeUser(users[idx]) };
}

export async function createNewsroomUser(userData) {
  const users = [...(await loadNewsroomUsers())];
  const hashedPassword = userData.starting_password
    ? hashPassword(userData.starting_password)
    : "••••••••••••";
  const newUser = {
    ...userData,
    starting_password: hashedPassword,
    id: userData.id || `usr_${Date.now()}`,
    status: userData.status || "Active",
    last_active: "never signed in",
    created_at: new Date().toISOString(),
  };
  users.unshift(newUser);
  await saveNewsroomUsers(users);
  return { ...newUser, starting_password: "••••••••••••" };
}

export async function updateNewsroomUser(idOrEmail, updates) {
  const users = [...(await loadNewsroomUsers())];
  const idx = users.findIndex(
    (u) => String(u.id) === String(idOrEmail) || String(u.email).toLowerCase() === String(idOrEmail).toLowerCase()
  );
  if (idx >= 0) {
    const safeUpdates = { ...updates };
    if (safeUpdates.email !== undefined) {
      const normalizedEmail = String(safeUpdates.email).trim().toLowerCase();
      if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
        const err = new Error("Please enter a valid email address");
        err.statusCode = 400;
        throw err;
      }
      const duplicate = users.find(
        (u, i) => i !== idx && String(u.email).trim().toLowerCase() === normalizedEmail
      );
      if (duplicate) {
        const err = new Error("Another user already uses this email address");
        err.statusCode = 409;
        throw err;
      }
      safeUpdates.email = normalizedEmail;
    }
    if (safeUpdates.starting_password && safeUpdates.starting_password !== "••••••••••••") {
      safeUpdates.starting_password = hashPassword(safeUpdates.starting_password);
    } else {
      delete safeUpdates.starting_password;
    }
    users[idx] = {
      ...users[idx],
      ...safeUpdates,
      updated_at: new Date().toISOString(),
    };
    await saveNewsroomUsers(users);
    return { ...users[idx], starting_password: "••••••••••••" };
  }
  return null;
}

export async function resetNewsroomUserPassword(idOrEmail, newPassword) {
  const users = [...(await loadNewsroomUsers())];
  const idx = users.findIndex(
    (u) => String(u.id) === String(idOrEmail) || String(u.email).toLowerCase() === String(idOrEmail).toLowerCase()
  );
  if (idx >= 0) {
    users[idx] = {
      ...users[idx],
      starting_password: hashPassword(newPassword),
      last_active: "Password reset · signed out",
      updated_at: new Date().toISOString(),
    };
    await saveNewsroomUsers(users);
    return { success: true, email: users[idx].email };
  }
  return null;
}

export async function deleteNewsroomUser(idOrEmail) {
  const users = (await loadNewsroomUsers()).filter(
    (u) => String(u.id) !== String(idOrEmail) && String(u.email).toLowerCase() !== String(idOrEmail).toLowerCase()
  );
  await saveNewsroomUsers(users);
  return { success: true };
}

// ==========================================
// 12. NEWSROOM ROLES & PERMISSIONS API
// ==========================================
function ensureRolesStore(local) {
  if (!local.newsroom_roles || !Array.isArray(local.newsroom_roles) || local.newsroom_roles.length === 0) {
    local.newsroom_roles = DEFAULT_ROLES;
    writeLocalStore(local);
  }
  if (!local.newsroom_users) {
    local.newsroom_users = DEFAULT_NEWSROOM_USERS;
    writeLocalStore(local);
  }
  return local.newsroom_roles;
}

export async function getNewsroomRoles() {
  const local = ensureLocalStore();
  const roles = ensureRolesStore(local);
  const users = await loadNewsroomUsers();

  return roles.map((role) => {
    const userCount = users.filter(
      (u) => Array.isArray(u.roles) && (u.roles.includes(role.nameEn) || u.roles.includes(role.key))
    ).length;
    return {
      ...role,
      permissions: role.key === "super_admin" ? [...ALL_PERMISSIONS] : role.permissions || [],
      userCount,
    };
  });
}

export async function getRolePermissionMap() {
  const roles = await getNewsroomRoles();
  const map = {};
  for (const r of roles) {
    map[r.nameEn] = r.permissions;
    map[r.key] = r.permissions;
  }
  return map;
}

export async function updateNewsroomRolePermissions(idOrKey, permissionKeys) {
  const local = ensureLocalStore();
  const roles = ensureRolesStore(local);
  const idx = roles.findIndex(
    (r) => String(r.id) === String(idOrKey) || String(r.key) === String(idOrKey)
  );
  if (idx < 0) return null;
  if (roles[idx].key === "super_admin") {
    return { error: "Super Admin permissions cannot be modified" };
  }

  const validSet = new Set(ALL_PERMISSIONS);
  const cleaned = Array.from(new Set((permissionKeys || []).filter((k) => validSet.has(k))));

  roles[idx] = {
    ...roles[idx],
    permissions: cleaned,
    updated_at: new Date().toISOString(),
  };
  local.newsroom_roles = roles;
  writeLocalStore(local);
  return roles[idx];
}

export async function createNewsroomRole({ nameEn, nameUr = "", description = "" }) {
  const local = ensureLocalStore();
  const roles = ensureRolesStore(local);
  const key = String(nameEn || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  if (!key) return { error: "Role name is required" };
  if (roles.some((r) => r.key === key || r.nameEn.toLowerCase() === nameEn.trim().toLowerCase())) {
    return { error: "A role with this name already exists" };
  }

  const newRole = {
    id: `role_${Date.now()}`,
    key,
    nameEn: nameEn.trim(),
    nameUr: nameUr.trim(),
    description: description.trim(),
    isSystem: false,
    permissions: ["article.view"],
    created_at: new Date().toISOString(),
  };
  roles.push(newRole);
  local.newsroom_roles = roles;
  writeLocalStore(local);
  return newRole;
}

// ==========================================
// 13. EMAIL ALERTS & NOTIFICATION LOG API
// ==========================================
const DEFAULT_NOTIFICATION_ACTIVITIES = [
  {
    group: "Editorial",
    activityType: "article.submitted",
    label: "Story submitted for review",
    description: "When a reporter or columnist moves a draft to In review",
    defaultPriority: 20,
  },
  {
    group: "Editorial",
    activityType: "article.published",
    label: "Article published",
    description: "When any story goes live on Daily Afadiat",
    defaultPriority: 30,
  },
  {
    group: "Editorial",
    activityType: "breaking.created",
    label: "Breaking news alert",
    description: "When a breaking ticker item or flash story is pushed live",
    defaultPriority: 10,
  },
  {
    group: "Moderation & Audience",
    activityType: "comment.received",
    label: "New reader comment",
    description: "When a reader submits a comment awaiting moderation",
    defaultPriority: 50,
  },
  {
    group: "Moderation & Audience",
    activityType: "inquiry.received",
    label: "New contact / ad inquiry",
    description: "When someone submits the Contact or Advertise form",
    defaultPriority: 25,
  },
  {
    group: "System",
    activityType: "user.password_reset",
    label: "Staff password reset",
    description: "When an administrator resets a staff member's password",
    defaultPriority: 15,
  },
  {
    group: "System",
    activityType: "epaper.published",
    label: "Daily e-paper published",
    description: "When a new daily e-paper edition is uploaded and set live",
    defaultPriority: 40,
  },
];

export async function getNotificationPrefs() {
  const local = ensureLocalStore();
  const roles = await getNewsroomRoles();
  const saved = Array.isArray(local.notification_prefs) ? local.notification_prefs : [];

  const prefMap = new Map();
  for (const p of saved) {
    prefMap.set(`${p.activityType}:${p.role}`, p);
  }

  const activities = DEFAULT_NOTIFICATION_ACTIVITIES.map((act) => ({
    ...act,
    cells: roles.map((r) => {
      const hit = prefMap.get(`${act.activityType}:${r.key}`);
      if (hit) {
        return {
          role: r.key,
          emailEnabled: Boolean(hit.emailEnabled),
          priority: Number(hit.priority ?? act.defaultPriority),
        };
      }
      const defaultEnabled = r.key === "super_admin" || r.key === "editor_in_chief";
      return {
        role: r.key,
        emailEnabled: defaultEnabled,
        priority: act.defaultPriority,
      };
    }),
  }));

  return {
    roles: roles.map((r) => ({ key: r.key, nameEn: r.nameEn })),
    activities,
  };
}

export async function saveNotificationPrefs(prefs = []) {
  const local = ensureLocalStore();
  local.notification_prefs = Array.isArray(prefs) ? prefs : [];
  writeLocalStore(local);
  return { success: true };
}

export async function getNotificationLog(limit = 25) {
  const local = ensureLocalStore();
  const log = Array.isArray(local.notification_log) ? local.notification_log : [];
  return log.slice(0, limit);
}

export async function appendNotificationLog(entry) {
  const local = ensureLocalStore();
  const log = Array.isArray(local.notification_log) ? local.notification_log : [];
  const item = {
    id: `nlog_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    createdAt: new Date().toISOString(),
    ...entry,
  };
  local.notification_log = [item, ...log].slice(0, 100);
  writeLocalStore(local);
  return item;
}
