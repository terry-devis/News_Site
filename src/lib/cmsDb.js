import { supabaseAdmin } from "./supabaseServer.js";
import fs from "fs";
import path from "path";

const localStorePath = path.join(process.cwd(), "data", "cms_store.json");

function ensureLocalStore() {
  const dir = path.dirname(localStorePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(localStorePath)) {
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
    fs.writeFileSync(localStorePath, JSON.stringify(defaultData, null, 2));
  }
  const currentData = JSON.parse(fs.readFileSync(localStorePath, "utf-8"));
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
    fs.writeFileSync(localStorePath, JSON.stringify(currentData, null, 2));
  }
  return currentData;
}

function writeLocalStore(data) {
  ensureLocalStore();
  fs.writeFileSync(localStorePath, JSON.stringify(data, null, 2));
}

// ==========================================
// 1. AD SLOTS & CREATIVES API (Daily Insaaf Parity)
// ==========================================

const DEFAULT_AD_SLOTS = [
  { id: 1, slot_key: "footer-strip", name: "Footer · strip (all pages)", sizes: "728x90, 320x50", pages: ["all"], is_active: true },
  { id: 2, slot_key: "home-leaderboard", name: "Home leaderboard", sizes: "728x90, 320x50", pages: ["home"], is_active: true },
  { id: 3, slot_key: "home-infeed-1", name: "Home · in-feed #1", sizes: "728x90, 300x250", pages: ["home"], is_active: true },
  { id: 4, slot_key: "home-infeed-2", name: "Home · in-feed #2", sizes: "728x90, 300x250", pages: ["home"], is_active: true },
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
// ==========================================
export async function getSiteSetting(key) {
  try {
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("setting_value")
      .eq("setting_key", key)
      .maybeSingle();
    if (!error && data) return data.setting_value;
  } catch (e) {}

  const local = ensureLocalStore();
  return local.site_settings?.[key] || null;
}

export async function updateSiteSetting(key, value) {
  try {
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .upsert({ setting_key: key, setting_value: value, updated_at: new Date().toISOString() })
      .select();
    if (!error && data) return data[0].setting_value;
  } catch (e) {}

  const local = ensureLocalStore();
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
export async function getEpaperEditions(date = null, city = null) {
  try {
    let q = supabaseAdmin.from("epaper_editions").select("*").order("page_number", { ascending: true });
    if (date) q = q.eq("edition_date", date);
    if (city && city !== "all") q = q.eq("city_slug", city);
    const { data, error } = await q;
    if (!error && data && data.length > 0) return data;
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
