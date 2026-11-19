"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/component/Header";
import Footer from "@/component/Footer";
import NewsletterBox from "@/component/NewsletterBox";
import { useSiteLanguage } from "@/context/SiteLanguageContext";
import {
  Calendar,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Layers,
  MapPin,
  Share2,
  FileText,
  X,
  ExternalLink,
  Edit,
  Sparkles,
} from "lucide-react";

export default function EPaperClient({
  categories = [],
  breakingNews = [],
  initialEditions = [],
}) {
  const { isUrdu, isEnglish, dir } = useSiteLanguage();
  const [editions, setEditions] = useState(initialEditions || []);
  const [selectedDate, setSelectedDate] = useState(
    initialEditions?.[0]?.edition_date || new Date().toISOString().split("T")[0]
  );
  const [selectedCity, setSelectedCity] = useState("islamabad");
  const [activePage, setActivePage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [activeClip, setActiveClip] = useState(null);

  const cities = [
    { key: "islamabad", name_ur: "اسلام آباد / راولپنڈی", name_en: "Islamabad" },
    { key: "lahore", name_ur: "لاہور ایڈیشن", name_en: "Lahore" },
    { key: "karachi", name_ur: "کراچی ایڈیشن", name_en: "Karachi" },
    { key: "quetta", name_ur: "کوئٹہ ایڈیشن", name_en: "Quetta" },
    { key: "international", name_ur: "انٹرنیشنل ایڈیشن", name_en: "International" },
  ];

  // Available pages for current city/date or default 1..4
  const pagesList = [
    { num: 1, title_ur: "صفحۂ اول (اہم سرخیاں)", title_en: "Front Page" },
    { num: 2, title_ur: "قومی و علاقائی خبریں", title_en: "National News" },
    { num: 3, title_ur: "اداریہ، کالم و تجارت", title_en: "Editorial & Business" },
    { num: 4, title_ur: "بین الاقوامی و کھیل", title_en: "World & Sports" },
  ];

  // Find edition matching page and city, or fallback to first matching page
  const activeEdition =
    editions.find(
      (e) =>
        e.page_number === activePage &&
        (e.city_slug === selectedCity || !e.city_slug)
    ) ||
    editions.find((e) => e.page_number === activePage) ||
    editions[0] ||
    null;

  // Extract stories on this page
  const stories = activeEdition?.stories || [];
  const leadStory =
    stories.find((s) => s.position === "lead") ||
    stories[0] || {
      headline_ur: "ڈیلی افادیت ڈیجیٹل اور پرنٹ ایڈیشن کا شاندار آغاز: سچائی اور فوری باخبر رہنے کا نیا عہد",
      headline_en: "Daily Afadiat Digital & Print Edition Historic Launch: A New Era of Integrity and Speed",
      excerpt_ur: "جدید ترین پرنٹنگ ٹیکنالوجی اور ڈیجیٹل سروسز کے ساتھ ملکی صحافت میں ایک نئے باب کا اضافہ۔",
      excerpt_en: "Marking a transformative milestone in Pakistani journalism with state-of-the-art broadsheet printing and digital accessibility.",
      content_ur: "اسلام آباد (خصوصی نامہ نگار) روزنامہ افادیت نے جدید ترین پرنٹنگ ٹیکنالوجی اور ڈیجیٹل سروسز کے ساتھ ملکی صحافت میں ایک نئے باب کا اضافہ کر دیا ہے۔ ادارتی بورڈ کا کہنا ہے کہ ہمارا مقصد قاری تک بلاخوف و خطر اور تصدیق شدہ اطلاعات پہنچانا ہے۔",
      content_en: "Islamabad (Special Correspondent) Daily Afadiat has inaugurated its multi-edition print publication and digital broadsheet ecosystem today. The editorial governing board reiterated its core pledge to deliver uncompromising, rigorously verified news.",
      byline_ur: "اسلام آباد (خصوصی نامہ نگار)",
      byline_en: "Islamabad (Special Correspondent)",
      image_url: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop",
    };

  const secTop =
    stories.find((s) => s.position === "secondary_top") ||
    stories[1] || {
      headline_ur: "اسٹیٹ بینک کی مانیٹری پالیسی کا اعلان، شرح سود میں استحکام برقرار",
      headline_en: "State Bank of Pakistan Announces Monetary Policy, Retaining Benchmark Rates",
      excerpt_ur: "مرکزی بینک نے ملکی معاشی استحکام اور زرمبادلہ ذخائر میں بہتری کے پیش نظر نئی ہدایات جاری کر دیں۔",
      excerpt_en: "Central bank highlights fiscal stabilization, export expansion, and foreign reserve resilience.",
      content_ur: "کراچی (بزنس رپورٹر) اسٹیٹ بینک آف پاکستان نے اپنی تازہ مانیٹری پالیسی کا اعلان کرتے ہوئے شرح سود میں استحکام برقرار رکھنے کی توثیق کی ہے۔",
      content_en: "Karachi (Business Desk) The State Bank of Pakistan announced its latest benchmark policy stance today, affirming stability in discount rates.",
      byline_ur: "کراچی (بزنس رپورٹر)",
      byline_en: "Karachi (Business Desk)",
      image_url: "",
    };

  const secBottom =
    stories.find((s) => s.position === "secondary_bottom") ||
    stories[2] || {
      headline_ur: "ملک بھر میں موسم سرما کی بارشیں اور پہاڑوں پر برفباری کی نئی لہر",
      headline_en: "Winter Weather Alert: Widespread Rain Across Plains and Snowfall Over Northern Peaks",
      excerpt_ur: "محکمہ موسمیات نے سردی کی نئی لہر کی پیش گوئی کر دی، سیاحوں کا شمالی علاقوں میں رش۔",
      excerpt_en: "Meteorological Department issues advisories as cold spell intensifies across the country.",
      content_ur: "مری، گلگت بلتستان اور وادی نیلم میں برفباری کا سلسلہ شروع ہو گیا ہے جس کے بعد سردی کی شدت میں غیر معمولی اضافہ ریکارڈ کیا گیا ہے۔",
      content_en: "Murree, Gilgit-Baltistan, and Neelum Valley experienced fresh winter snowfall today. Weather authorities anticipate the active westerly wave to persist.",
      byline_ur: "موسمی ڈیسک",
      byline_en: "Weather Desk",
      image_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop",
    };

  const handleZoom = (delta) => {
    setZoomLevel((prev) => Math.max(75, Math.min(175, prev + delta)));
  };

  const handleDownloadPDF = () => {
    if (activeEdition?.pdf_url) {
      window.open(activeEdition.pdf_url, "_blank");
    } else {
      alert(
        isUrdu
          ? `روزنامہ افادیت (${selectedDate}) مکمل ایڈیشن ڈاؤنلوڈ شروع ہو گیا ہے۔`
          : `Daily Afadiat (${selectedDate}) full broadsheet edition download initiated.`
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f6f3] flex flex-col font-sans" dir={dir}>
      <Header categories={categories} breakingNews={breakingNews} />

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-5 space-y-6">
        
        {/* Top Control Bar: City Edition + Date + Zoom + PDF Download + CMS Direct Link */}
        <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-none p-3 sm:p-4 shadow-xs space-y-3">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            
            {/* Left: City Selector Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 lg:pb-0">
              <span className="text-xs font-bold text-gray-700 flex items-center gap-1 shrink-0 px-1">
                <MapPin size={14} className="text-emerald-700" />
                <span>{isUrdu ? "شہر منتخب کریں:" : "Edition:"}</span>
              </span>
              {cities.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setSelectedCity(c.key)}
                  className={`text-xs px-3 py-1.5 rounded-none font-bold whitespace-nowrap transition cursor-pointer ${
                    selectedCity === c.key
                      ? "bg-emerald-800 text-white shadow-xs"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-[#dcd8cd]"
                  }`}
                >
                  {isUrdu ? c.name_ur : c.name_en}
                </button>
              ))}
            </div>

            {/* Right: Date Picker, CMS Story Link & PDF Download */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 bg-white border border-[#dcd8cd] rounded-none px-2.5 py-1 text-xs shadow-xs">
                <Calendar size={14} className="text-emerald-700" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="outline-none bg-transparent font-sans text-xs text-gray-800 cursor-pointer"
                />
              </div>

              <Link
                href="/admin/epaper"
                className="bg-zinc-800 hover:bg-zinc-900 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-none flex items-center gap-1.5 transition shadow-xs"
                title={isUrdu ? "ای پیپر مضامین اور صفحات ایڈٹ کریں" : "Manage ePaper stories in CMS"}
              >
                <Edit size={13} />
                <span>{isUrdu ? "مضامین ایڈٹ کریں (CMS)" : "Edit in CMS"}</span>
              </Link>

              <button
                type="button"
                onClick={handleDownloadPDF}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-1.5 rounded-none flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <Download size={13} />
                <span>{isUrdu ? "مکمل اخبار PDF ڈاؤنلوڈ" : "Download PDF"}</span>
              </button>
            </div>

          </div>

          {/* Page Switcher & Zoom Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-[#dcd8cd]">
            
            {/* Page Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <span className="text-xs font-bold text-gray-700 flex items-center gap-1 shrink-0 px-1">
                <Layers size={14} className="text-emerald-700" />
                <span>{isUrdu ? "صفحات:" : "Pages:"}</span>
              </span>
              {pagesList.map((p) => (
                <button
                  key={p.num}
                  onClick={() => setActivePage(p.num)}
                  className={`text-xs px-3 py-1 rounded-none font-bold transition cursor-pointer whitespace-nowrap ${
                    activePage === p.num
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-[#dcd8cd]"
                  }`}
                >
                  <span>{isUrdu ? `صفحہ ${p.num}` : `Page ${p.num}`}</span>
                </button>
              ))}
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <div className="flex items-center bg-white border border-[#dcd8cd] rounded-none p-0.5 shadow-2xs">
                <button
                  onClick={() => handleZoom(-15)}
                  className="p-1.5 text-gray-600 hover:text-emerald-800 hover:bg-gray-100 rounded-none transition"
                  title="Zoom Out"
                >
                  <ZoomOut size={15} />
                </button>
                <span className="text-[11px] font-mono font-bold px-2 text-gray-700">
                  {zoomLevel}%
                </span>
                <button
                  onClick={() => handleZoom(15)}
                  className="p-1.5 text-gray-600 hover:text-emerald-800 hover:bg-gray-100 rounded-none transition"
                  title="Zoom In"
                >
                  <ZoomIn size={15} />
                </button>
              </div>

              <button
                onClick={() => setZoomLevel(100)}
                className="text-[11px] font-semibold bg-white border border-[#dcd8cd] text-gray-700 px-2.5 py-1.5 rounded-none hover:bg-gray-50 transition"
              >
                Reset
              </button>
            </div>

          </div>

        </div>

        {/* Newspaper Broadsheet Sheet Viewer (Classic sharp non-round edge broadsheet) */}
        <div className="w-full overflow-x-auto pb-4 scrollbar-thin">
          <div
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
            className="transition-transform duration-200 mx-auto min-w-[760px] max-w-[1020px] bg-white border-2 border-gray-400 rounded-none shadow-2xl p-6 sm:p-10 space-y-6 text-gray-900"
          >
            {/* Authentic Newspaper Masthead Header */}
            <div className="border-b-4 border-black pb-3 text-center space-y-2">
              <div className="flex items-center justify-between text-[11px] text-gray-700 font-sans border-b border-gray-300 pb-1">
                <span>{isUrdu ? "جلد نمبر: ۰۱ • شمارہ نمبر: ۲۴۵" : "Volume: 01 • Issue: 245"}</span>
                <span>
                  {isUrdu
                    ? `${selectedDate} • باقاعدہ رجسٹرڈ پرنٹ ایڈیشن`
                    : `${selectedDate} • Registered Broadsheet Print Edition`}
                </span>
                <span>{isUrdu ? "قیمت: ۲۰ روپے • صفحات: ۰۸" : "Price: Rs 20 • Pages: 08"}</span>
              </div>

              {/* Masthead Title */}
              <div className="py-2">
                {isEnglish ? (
                  <h1 className="text-4xl sm:text-6xl font-black font-serif text-black tracking-tight uppercase">
                    Daily Afadiat
                  </h1>
                ) : (
                  <h1 className="text-4xl sm:text-6xl font-black urdu-headline text-black tracking-tight">
                    روزنامہ افادیت
                  </h1>
                )}
                <p className="text-[11px] font-sans font-bold tracking-widest uppercase text-gray-700 mt-1">
                  DAILY AFADIAT — PAKISTAN'S PREMIER TRUSTED BROADSHEET NEWSPAPER
                </p>
              </div>

              {/* Tagline stripe */}
              <div className="bg-black text-white text-[11px] py-1 font-bold flex items-center justify-around font-sans">
                <span>{isUrdu ? "سچ کے ساتھ، ہر لمحہ باخبر" : "TRUTH • INTEGRITY • GLOBAL JOURNALISM"}</span>
                <span>•</span>
                <span>{isUrdu ? "اسلام آباد • لاہور • کراچی • کوئٹہ" : "ISLAMABAD • LAHORE • KARACHI • QUETTA"}</span>
                <span>•</span>
                <span>www.dailyafadiat.com</span>
              </div>
            </div>

            {/* Broadsheet Columns Layout (Mirrors real print page 1) */}
            <div className="grid grid-cols-12 gap-4">
              
              {/* Column 1: Lead Super Headline (8 Cols) */}
              <div
                onClick={() =>
                  setActiveClip({
                    title: isEnglish ? leadStory.headline_en : leadStory.headline_ur,
                    excerpt: isEnglish ? leadStory.excerpt_en : leadStory.excerpt_ur,
                    content: isEnglish ? leadStory.content_en : leadStory.content_ur,
                    byline: isEnglish ? leadStory.byline_en : leadStory.byline_ur,
                    image_url: leadStory.image_url,
                  })
                }
                className="col-span-12 md:col-span-8 p-3.5 border-r border-gray-300 cursor-pointer hover:bg-emerald-50/40 transition group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold bg-black text-white px-2 py-0.5 rounded-none font-sans uppercase">
                    {isUrdu ? "لیڈ اسٹوری" : "LEAD STORY"}
                  </span>
                  <span className="text-[11px] text-gray-500 font-bold">
                    {isEnglish ? leadStory.byline_en : leadStory.byline_ur}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold leading-tight mt-1 group-hover:text-emerald-900 urdu-headline">
                  {isEnglish ? leadStory.headline_en || leadStory.headline_ur : leadStory.headline_ur}
                </h2>

                {leadStory.image_url && (
                  <div className="relative aspect-[16/9] w-full my-3 border border-gray-300 bg-gray-100 overflow-hidden">
                    <Image
                      src={leadStory.image_url}
                      alt={leadStory.headline_en || "Lead story image"}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <p className="text-sm leading-relaxed text-gray-800 text-justify font-sans">
                  {isEnglish ? leadStory.content_en || leadStory.content_ur : leadStory.content_ur}
                </p>

                <div className="mt-3 pt-2 border-t border-gray-200 flex items-center justify-between text-[11px] text-emerald-700 font-bold">
                  <span>{isUrdu ? "[مکمل خبر کا کلپ پڑھنے کے لیے کلک کریں]" : "[Click to read full story clipping]"}</span>
                  <span className="flex items-center gap-1 font-sans">
                    <ExternalLink size={12} />
                    <span>{isUrdu ? "کلپنگ ویو" : "Clipping View"}</span>
                  </span>
                </div>
              </div>

              {/* Column 2: Side Secondary Headlines (4 Cols) */}
              <div className="col-span-12 md:col-span-4 space-y-4">
                
                {/* Secondary Story 1 */}
                <div
                  onClick={() =>
                    setActiveClip({
                      title: isEnglish ? secTop.headline_en : secTop.headline_ur,
                      excerpt: isEnglish ? secTop.excerpt_en : secTop.excerpt_ur,
                      content: isEnglish ? secTop.content_en : secTop.content_ur,
                      byline: isEnglish ? secTop.byline_en : secTop.byline_ur,
                      image_url: secTop.image_url,
                    })
                  }
                  className="p-3 border-b border-gray-300 cursor-pointer hover:bg-emerald-50/40 transition group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-bold bg-emerald-800 text-white px-1.5 py-0.2 rounded-none font-sans uppercase">
                      {isUrdu ? "اہم خبر" : "HIGHLIGHT"}
                    </span>
                    <span className="text-[10px] text-gray-500 font-bold">
                      {isEnglish ? secTop.byline_en : secTop.byline_ur}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold leading-snug group-hover:text-emerald-900 urdu-headline">
                    {isEnglish ? secTop.headline_en || secTop.headline_ur : secTop.headline_ur}
                  </h3>
                  <p className="text-xs text-gray-700 mt-1 line-clamp-3 leading-relaxed font-sans">
                    {isEnglish ? secTop.excerpt_en || secTop.excerpt_ur : secTop.excerpt_ur}
                  </p>
                </div>

                {/* Secondary Story 2 */}
                <div
                  onClick={() =>
                    setActiveClip({
                      title: isEnglish ? secBottom.headline_en : secBottom.headline_ur,
                      excerpt: isEnglish ? secBottom.excerpt_en : secBottom.excerpt_ur,
                      content: isEnglish ? secBottom.content_en : secBottom.content_ur,
                      byline: isEnglish ? secBottom.byline_en : secBottom.byline_ur,
                      image_url: secBottom.image_url,
                    })
                  }
                  className="p-3 border-b border-gray-300 cursor-pointer hover:bg-emerald-50/40 transition group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-bold bg-zinc-800 text-white px-1.5 py-0.2 rounded-none font-sans uppercase">
                      {isUrdu ? "موسمی رپورٹ" : "WEATHER & METRO"}
                    </span>
                    <span className="text-[10px] text-gray-500 font-bold">
                      {isEnglish ? secBottom.byline_en : secBottom.byline_ur}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold leading-snug group-hover:text-emerald-900 urdu-headline">
                    {isEnglish ? secBottom.headline_en || secBottom.headline_ur : secBottom.headline_ur}
                  </h3>
                  {secBottom.image_url && (
                    <div className="relative aspect-[16/10] w-full my-2 border border-gray-200">
                      <Image
                        src={secBottom.image_url}
                        alt={secBottom.headline_en || "Report image"}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <p className="text-xs text-gray-700 line-clamp-2 leading-relaxed font-sans">
                    {isEnglish ? secBottom.excerpt_en || secBottom.excerpt_ur : secBottom.excerpt_ur}
                  </p>
                </div>

                {/* Daily Rates Box (Sharp Non-round Edge Broadsheet Box) */}
                <div className="p-3 bg-[#f7f6f3] border border-gray-300 rounded-none text-xs space-y-1">
                  <h4 className="font-bold text-black border-b border-gray-300 pb-1">
                    {isUrdu ? "آج کے صرافہ و کرنسی ریٹس" : "Daily Bullion & Currency Rates"}
                  </h4>
                  <div className="flex justify-between text-[11px]">
                    <span>{isUrdu ? "سونا فی تولہ ۲۴K:" : "Gold 24K (Tola):"}</span>
                    <strong className="font-mono">₨ 422,095</strong>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>{isUrdu ? "امریکی ڈالر (USD):" : "US Dollar (USD):"}</span>
                    <strong className="font-mono">₨ 277.50</strong>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>{isUrdu ? "سعودی ریال (SAR):" : "Saudi Riyal (SAR):"}</span>
                    <strong className="font-mono">₨ 73.95</strong>
                  </div>
                </div>

              </div>

            </div>

            {/* Lower Deck: Additional Stories / Columns (If 4 or more stories exist on this page) */}
            {stories.length > 3 && (
              <div className="pt-4 border-t-2 border-gray-300 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {stories.slice(3).map((extraStory, extraIdx) => (
                  <div
                    key={extraStory.id || extraIdx}
                    onClick={() =>
                      setActiveClip({
                        title: isEnglish ? extraStory.headline_en || extraStory.headline_ur : extraStory.headline_ur,
                        excerpt: isEnglish ? extraStory.excerpt_en || extraStory.excerpt_ur : extraStory.excerpt_ur,
                        content: isEnglish ? extraStory.content_en || extraStory.content_ur : extraStory.content_ur,
                        byline: isEnglish ? extraStory.byline_en || extraStory.byline_ur : extraStory.byline_ur,
                        image_url: extraStory.image_url,
                      })
                    }
                    className="p-3 border border-gray-300 bg-[#fcfbf9] hover:bg-emerald-50/50 cursor-pointer transition group"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-bold text-emerald-800 uppercase block font-sans">
                        {isUrdu ? "کالم و خصوصی تجزیہ" : "COLUMN & ANALYSIS"}
                      </span>
                      <span className="text-[10px] text-gray-500 font-bold">
                        {isEnglish ? extraStory.byline_en : extraStory.byline_ur}
                      </span>
                    </div>
                    <h4 className="font-bold text-xs sm:text-sm urdu-headline group-hover:text-emerald-900 leading-snug">
                      {isEnglish ? extraStory.headline_en || extraStory.headline_ur : extraStory.headline_ur}
                    </h4>
                    <p className="text-[11px] text-gray-600 line-clamp-2 mt-1 font-sans">
                      {isEnglish ? extraStory.excerpt_en || extraStory.excerpt_ur : extraStory.excerpt_ur}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Bottom Footer Stripe */}
            <div className="border-t-2 border-black pt-2 flex items-center justify-between text-[11px] text-gray-600 font-sans">
              <span>
                {isUrdu
                  ? `صفحہ نمبر: ${activePage} • روزنامہ افادیت ڈیجیٹل ای پیپر`
                  : `Page Number: ${activePage} • Daily Afadiat Digital ePaper Broadsheet`}
              </span>
              <span>
                {isUrdu
                  ? "تمام حقوق بحق ادارہ روزنامہ افادیت محفوظ ہیں © 2026"
                  : "All Rights Reserved © 2026 Daily Afadiat Group"}
              </span>
            </div>

          </div>
        </div>

        {/* Newspaper Page Thumbnails Reel at bottom */}
        <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-none p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <Layers size={14} className="text-emerald-700" />
              <span>{isUrdu ? "آج کے تمام صفحات کا پیش منظر" : "All Newspaper Pages Preview"}</span>
            </h3>
            <span className="text-[11px] text-gray-500 font-sans">
              {isUrdu ? "صفحہ منتخب کرنے کے لیے کلک کریں" : "Click to view page"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {pagesList.map((p) => {
              const pageEdition = editions.find(
                (e) =>
                  e.page_number === p.num &&
                  (e.city_slug === selectedCity || !e.city_slug)
              ) || editions.find((e) => e.page_number === p.num);

              return (
                <button
                  key={p.num}
                  onClick={() => {
                    setActivePage(p.num);
                    window.scrollTo({ top: 180, behavior: "smooth" });
                  }}
                  className={`p-2 rounded-none border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                    activePage === p.num
                      ? "bg-white border-emerald-700 shadow-md ring-2 ring-emerald-600"
                      : "bg-white/80 border-[#dcd8cd] hover:bg-white"
                  }`}
                >
                  <div className="w-full aspect-[3/4] bg-gray-100 border border-gray-300 rounded-none flex items-center justify-center text-xs font-bold text-gray-500 font-mono shadow-inner overflow-hidden relative">
                    {pageEdition?.page_image ? (
                      <Image
                        src={pageEdition.page_image}
                        alt={`Page ${p.num}`}
                        fill
                        className="object-cover opacity-80 group-hover:opacity-100"
                      />
                    ) : (
                      <span>Page {p.num}</span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-gray-800">
                    {isUrdu ? p.title_ur : p.title_en}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Clipping Detail Modal (Bilingual & Sharp Edges) */}
        {activeClip && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white border-2 border-gray-800 rounded-none max-w-2xl w-full p-6 shadow-2xl relative space-y-4">
              <button
                onClick={() => setActiveClip(null)}
                className="absolute top-3 right-3 text-gray-400 hover:text-black p-1 transition"
                title="Close"
              >
                <X size={20} />
              </button>

              <div className="border-b-2 border-emerald-900 pb-2">
                <div className="flex items-center justify-between text-[11px] text-gray-500 font-sans mb-1">
                  <span className="font-bold text-emerald-800 uppercase tracking-wider">
                    {isUrdu ? "روزنامہ افادیت پرنٹ کلپنگ ریڈر" : "Daily Afadiat ePaper Clipping Reader"}
                  </span>
                  <span>{activeClip.byline}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold urdu-headline text-gray-900 mt-1">
                  {activeClip.title}
                </h2>
              </div>

              {activeClip.image_url && (
                <div className="relative aspect-[16/9] w-full border border-gray-300 bg-gray-100 overflow-hidden">
                  <Image
                    src={activeClip.image_url}
                    alt={activeClip.title || "Clip image"}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {activeClip.excerpt && (
                <p className="text-xs font-bold text-emerald-900 bg-emerald-50/60 p-2.5 border-l-4 border-emerald-800">
                  {activeClip.excerpt}
                </p>
              )}

              <p className="text-sm leading-relaxed text-gray-800 font-sans text-justify max-h-[50vh] overflow-y-auto pr-1">
                {activeClip.content}
              </p>

              <div className="pt-3 border-t border-gray-200 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      alert(
                        isUrdu
                          ? "کلپ تصویر کے طور پر محفوظ ہو گیا!"
                          : "Clipping image saved to your downloads!"
                      )
                    }
                    className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1.5"
                  >
                    <Download size={13} />
                    <span>{isUrdu ? "کلپ محفوظ کریں (Save Clip)" : "Save Story Clipping"}</span>
                  </button>

                  <Link
                    href="/admin/epaper"
                    className="text-xs font-bold text-gray-700 hover:text-emerald-800 flex items-center gap-1 border border-gray-300 bg-gray-50 px-2.5 py-1"
                  >
                    <Edit size={12} />
                    <span>{isUrdu ? "اس خبر میں ترمیم کریں (Studio)" : "Edit in Studio"}</span>
                  </Link>
                </div>

                <button
                  onClick={() => setActiveClip(null)}
                  className="bg-gray-800 hover:bg-black text-white text-xs font-semibold px-4 py-1.5 rounded-none transition"
                >
                  {isUrdu ? "بند کریں" : "Close"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Newsletter Box */}
        <NewsletterBox />

      </main>

      <Footer categories={categories} />
    </div>
  );
}
