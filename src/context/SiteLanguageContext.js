"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const SiteLanguageContext = createContext();

export const siteTranslations = {
  en: {
    langCode: "en",
    dir: "ltr",
    toggleLabel: "اردو",
    toggleTitle: "اردو میں دیکھیں",
    todayDateFormat: "en-US",

    // Header Links
    liveTv: "Live TV",
    videos: "Videos",
    epaper: "ePaper",
    todayPaper: "Today's Paper",
    services: "Services",
    aboutUs: "About Us",
    editorialPolicy: "Editorial Policy",
    marketRatesNav: "Market Rates",
    advertise: "Advertise",
    contact: "Contact",
    admin: "Admin",

    // Search
    searchPlaceholder: "Search news...",
    searchAria: "Search news",

    // Breaking & Ticker
    breakingBadge: "BREAKING NEWS :",
    breakingDefault: "Daily Afadiat digital portal is live — Real-time verified global news at your fingertips.",
    marketRatesBadge: "MARKET RATES",
    gold24k: "Gold 24K",
    gold22k: "Gold 22K",
    silverTola: "Silver",

    // Categories
    home: "Home",
    latest: "Latest",
    pakistan: "Pakistan",
    world: "World",
    sports: "Sports",
    business: "Business",
    tech: "Science & Tech",
    health: "Health",
    weird: "Odd & Curious",

    // Sections
    topStory: "Lead Story",
    trendingNews: "Top Stories",
    latestUpdates: "Latest Updates",
    liveUpdates: "Live Updates",
    viewMore: "More ←",
    entertainment: "Entertainment",
    otherHeadlines: "Other Major Headlines",
    allSections: "All Departments",
    readFullStory: "Read full story",
    bylineDefault: "Editorial Board",

    // Promo banner
    promoTitle: "Daily Afadiat ePaper & Live Digital Services",
    promoTagline: "TRUST • FACTS • GLOBAL NEWS — Unbiased, 24/7 Verified Coverage",
    readTodayPaper: "Read Today's Paper",

    // Story Detail
    breadcrumbHome: "Home",
    shareStory: "Share:",
    latestStoriesSidebar: "Latest Stories",

    // Comments
    commentsTitle: "Reader Comments & Feedback",
    commentsSubtitle: "Checked & Balanced: All submissions are reviewed by editors before publication.",
    nameLabel: "Your Name",
    namePlaceholder: "Enter your full name",
    emailLabel: "Email Address",
    emailPlaceholder: "name@example.com (kept private)",
    commentLabel: "Your Comment",
    commentPlaceholder: "Share your perspective respectfully...",
    submitComment: "Submit for Approval",
    commentSubmitting: "Submitting...",
    commentPendingNotice: "✓ Thank you! Your comment has been submitted and will appear once approved by our moderator.",
    noCommentsYet: "No comments on this article yet. Be the first to share your thoughts!",
    approvedBadge: "Approved Reader Comment",

    // Contact
    contactTitle: "Contact Us",
    contactSubtitle: "Get in touch with the Daily Afadiat editorial, reporting, or advertising team.",
    fullName: "Full Name",
    emailAddress: "Email Address",
    phoneNumber: "Phone Number",
    subject: "Subject",
    message: "Message",
    sendMessage: "Send Message",
    sendingMessage: "Sending...",
    officeHeadquarters: "Headquarters & Bureau",
    contactInfo: "Contact Information",
    phone: "Phone",
    email: "Email",
    whatsapp: "WhatsApp",
    officeHours: "Office Hours",
    hoursVal: "Monday – Saturday: 9:00 AM – 7:00 PM (PKT)",
    addressVal: "Daily Afadiat Media Complex, Press Club Road, Islamabad, Pakistan",

    // Newsletter
    newsletterTitle: "Daily Afadiat Newsletter",
    newsletterSubtitle: "Receive verified top stories, market movements, and breaking alerts directly in your inbox every morning.",
    newsletterPlaceholder: "Enter your email address...",
    subscribeBtn: "Subscribe",
    subscribing: "Subscribing...",
    subscribedSuccess: "✓ Thank you for subscribing! You will receive our next morning edition.",

    // Footer
    tagline: "TRUST • FACTS • GLOBAL NEWS — Dedicated to Truthful & Independent Journalism",
    followUs: "Follow Us",
    quickLinks: "Quick Links",
    aboutUs: "About Us",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    editorialPolicy: "Editorial Policy",
    copyright: "© 2026 Daily Afadiat Media Group. All rights reserved. Reproduction of editorial material without written consent is strictly prohibited.",
    backToTop: "Back to Top",
  },
  ur: {
    langCode: "ur",
    dir: "rtl",
    toggleLabel: "English",
    toggleTitle: "Switch to English",
    todayDateFormat: "ur-PK",

    // Header Links
    liveTv: "لائیو ٹی وی",
    videos: "ویڈیوز",
    epaper: "ای پیپر",
    todayPaper: "آج کا اخبار",
    services: "سروسز",
    aboutUs: "ہمارے بارے میں",
    editorialPolicy: "ادارتی پالیسی",
    marketRatesNav: "مارکیٹ ریٹس",
    advertise: "اشتہار دیں",
    contact: "رابطہ",
    admin: "ایڈمن",

    // Search
    searchPlaceholder: "خبر تلاش کریں...",
    searchAria: "خبروں میں تلاش کریں",

    // Breaking & Ticker
    breakingBadge: "بریکنگ نیوز :",
    breakingDefault: "ڈیلی افادیت کا نیا ڈیجیٹل پورٹل باقاعدہ فعال ہو گیا — پل پل کی باخبر اور مصدقہ خبریں اب آپ کی انگلیوں پر",
    marketRatesBadge: "مارکیٹ ریٹس",
    gold24k: "سونا ۲۴K",
    gold22k: "سونا ۲۲K",
    silverTola: "چاندی",

    // Categories
    home: "صفحۂ اول",
    latest: "تازہ ترین",
    pakistan: "پاکستان",
    world: "انٹرنیشنل",
    sports: "کھیل",
    business: "بزنس",
    tech: "سائنس و ٹیکنالوجی",
    health: "صحت",
    weird: "دلچسپ و عجیب",

    // Sections
    topStory: "اہم خبر",
    trendingNews: "اہم خبریں",
    latestUpdates: "تازہ ترین",
    liveUpdates: "لائیو اپڈیٹس",
    viewMore: "مزید ←",
    entertainment: "انٹرٹینمنٹ",
    otherHeadlines: "دیگر اہم خبریں",
    allSections: "تمام شعبہ جات",
    readFullStory: "مکمل خبر پڑھیے",
    bylineDefault: "ایڈیٹوریل بورڈ",

    // Promo banner
    promoTitle: "ڈیلی افادیت ای پیپر اور لائیو ڈیجیٹل سروسز",
    promoTagline: "سچ کے ساتھ، ہر لمحہ باخبر — TRUST • FACTS • GLOBAL NEWS",
    readTodayPaper: "آج کا اخبار پڑھیں",

    // Story Detail
    breadcrumbHome: "صفحہ اول",
    shareStory: "شیئر کریں:",
    latestStoriesSidebar: "تازہ ترین خبریں",

    // Comments
    commentsTitle: "قارئین کی آراء اور تبصرے",
    commentsSubtitle: "تصدیق شدہ اور محفوظ: تمام تبصرے مانیٹرنگ اور ادارتی منظوری کے بعد شائع ہوتے ہیں۔",
    nameLabel: "آپ کا نام",
    namePlaceholder: "اپنا پورا نام درج کریں",
    emailLabel: "ای میل ایڈریس",
    emailPlaceholder: "name@example.com (شائع نہیں کیا جائے گا)",
    commentLabel: "آپ کی رائے / تبصرہ",
    commentPlaceholder: "اپنی شائستہ اور تعمیری رائے درج کریں...",
    submitComment: "تبصرہ ارسال کریں",
    commentSubmitting: "ارسال ہو رہا ہے...",
    commentPendingNotice: "✓ آپ کا تبصرہ موصول ہو گیا ہے! ادارتی جائزے کے بعد فوری شائع کر دیا جائے گا۔",
    noCommentsYet: "اس خبر پر ابھی تک کوئی تبصرہ نہیں ہوا۔ پہلی رائے آپ دیجیے!",
    approvedBadge: "تصدیق شدہ قاری",

    // Contact
    contactTitle: "ہم سے رابطہ کریں",
    contactSubtitle: "ادارتی ٹیم، رپورٹرز یا اشتہارات کے شعبے سے رابطہ کے لیے درج ذیل فارم کا استعمال کریں۔",
    fullName: "پورا نام",
    emailAddress: "ای میل ایڈریس",
    phoneNumber: "فون نمبر",
    subject: "موضوع",
    message: "پیغام",
    sendMessage: "پیغام ارسال کریں",
    sendingMessage: "ارسال ہو رہا ہے...",
    officeHeadquarters: "مرکزی دفتر",
    contactInfo: "رابطے کی تفصیلات",
    phone: "فون نمبر",
    email: "ای میل",
    whatsapp: "واٹس ایپ",
    officeHours: "دفتری اوقات",
    hoursVal: "پیر تا ہفتہ: صبح 9 تا شام 7 بجے",
    addressVal: "ڈیلی افادیت میڈیا کمپلیکس، پریس کلب روڈ، اسلام آباد، پاکستان",

    // Newsletter
    newsletterTitle: "ڈیلی افادیت نیوز لیٹر",
    newsletterSubtitle: "روزانہ کی اہم ترین، مصدقہ اور بریکنگ خبریں صبح سویرے اپنے ای میل ان باکس میں حاصل کریں۔",
    newsletterPlaceholder: "اپنا ای میل درج کریں...",
    subscribeBtn: "سبسکرائب کریں",
    subscribing: "سبسکرائب ہو رہا ہے...",
    subscribedSuccess: "✓ آپ کا شکریہ! باقاعدہ نیوز لیٹر جلد آپ کو موصول ہوگا۔",

    // Footer
    tagline: "سچ کے ساتھ، ہر خبر — TRUST • FACTS • GLOBAL NEWS",
    followUs: "ہمیں فالو کریں",
    quickLinks: "اہم لنکس",
    aboutUs: "ہمارے بارے میں",
    privacyPolicy: "پرائیویسی پالیسی",
    termsOfService: "شرائط و ضوابط",
    editorialPolicy: "ادارتی پالیسی",
    copyright: "© 2026 ڈیلی افادیت میڈیا گروپ۔ جملہ حقوق محفوظ ہیں۔ ادارتی مواد کی بغیر اجازت نقل ممنوع ہے۔",
    backToTop: "اوپر جائیں",
  },
};

export function SiteLanguageProvider({ children, initialLang = "ur" }) {
  const [lang, setLangState] = useState(initialLang === "en" ? "en" : "ur");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Sync from cookie first, then localStorage fallback
    try {
      const cookieMatch = document.cookie.match(/(?:^|;\s*)site_lang=(en|ur)/);
      if (cookieMatch) {
        setLangState(cookieMatch[1]);
      } else {
        const savedLang = localStorage.getItem("site_lang");
        if (savedLang === "en" || savedLang === "ur") {
          setLangState(savedLang);
        }
      }
    } catch (e) {}
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const isEn = lang === "en";
    const dir = isEn ? "ltr" : "rtl";

    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
    try {
      localStorage.setItem("site_lang", lang);
      document.cookie = `site_lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    } catch (e) {}
  }, [lang, mounted]);

  const toggleLanguage = () => {
    setLangState((prev) => (prev === "ur" ? "en" : "ur"));
  };

  const setLanguage = (newLang) => {
    if (newLang === "en" || newLang === "ur") {
      setLangState(newLang);
    }
  };

  const t = (key) => {
    const dict = siteTranslations[lang] || siteTranslations.ur;
    return dict[key] !== undefined ? dict[key] : (siteTranslations.en[key] || key);
  };

  const value = {
    lang,
    isUrdu: lang === "ur",
    isEnglish: lang === "en",
    dir: lang === "en" ? "ltr" : "rtl",
    toggleLanguage,
    setLanguage,
    t,
  };

  return (
    <SiteLanguageContext.Provider value={value}>
      {children}
    </SiteLanguageContext.Provider>
  );
}

export function useSiteLanguage() {
  const context = useContext(SiteLanguageContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      lang: "ur",
      isUrdu: true,
      isEnglish: false,
      dir: "rtl",
      toggleLanguage: () => {},
      setLanguage: () => {},
      t: (key) => (siteTranslations.ur[key] !== undefined ? siteTranslations.ur[key] : key),
    };
  }
  return context;
}
