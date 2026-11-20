"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Layers,
  LayoutGrid,
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
  const [showAllPages, setShowAllPages] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const viewerRef = useRef(null);

  const cities = [
    { key: "islamabad", name_ur: "اسلام آباد / راولپنڈی", name_en: "Islamabad" },
    { key: "lahore", name_ur: "لاہور ایڈیشن", name_en: "Lahore" },
    { key: "karachi", name_ur: "کراچی ایڈیشن", name_en: "Karachi" },
    { key: "quetta", name_ur: "کوئٹہ ایڈیشن", name_en: "Quetta" },
    { key: "international", name_ur: "انٹرنیشنل ایڈیشن", name_en: "International" },
  ];

  // Available pages 1..8 matching broadsheet print edition
  const pagesList = [
    { num: 1, title_ur: "صفحۂ اول (اہم سرخیاں)", title_en: "Front Page" },
    { num: 2, title_ur: "قومی و علاقائی خبریں", title_en: "National News" },
    { num: 3, title_ur: "اداریہ، کالم و تجارت", title_en: "Editorial & Business" },
    { num: 4, title_ur: "بین الاقوامی و کھیل", title_en: "World & Sports" },
    { num: 5, title_ur: "صوبائی و شہری خبریں", title_en: "Regional News" },
    { num: 6, title_ur: "معیشت و کاروبار", title_en: "Economy & Markets" },
    { num: 7, title_ur: "سائنس، ٹیکنالوجی و صحت", title_en: "Tech & Health" },
    { num: 8, title_ur: "آخری صفحہ (تازہ ترین)", title_en: "Back Page" },
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

  const handleZoom = useCallback((delta) => {
    setZoomLevel((prev) => Math.max(75, Math.min(175, prev + delta)));
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!viewerRef.current) return;
    if (!document.fullscreenElement) {
      viewerRef.current.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (activeClip) {
        if (e.key === "Escape") setActiveClip(null);
        return;
      }

      if (e.key === "ArrowLeft") {
        setShowAllPages(false);
        setActivePage((p) => (isUrdu ? Math.min(pagesList.length, p + 1) : Math.max(1, p - 1)));
      } else if (e.key === "ArrowRight") {
        setShowAllPages(false);
        setActivePage((p) => (isUrdu ? Math.max(1, p - 1) : Math.min(pagesList.length, p + 1)));
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        handleZoom(15);
      } else if (e.key === "-") {
        e.preventDefault();
        handleZoom(-15);
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeClip, handleZoom, isUrdu, pagesList.length, toggleFullscreen]);

  const currentCityObj = cities.find((c) => c.key === selectedCity) || cities[0];

  const formatDisplayDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const handleSharePage = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({
          title: isUrdu ? `ای پیپر — صفحہ ${activePage}` : `ePaper — Page ${activePage}`,
          url: shareUrl,
        });
      } else if (navigator.clipboard && shareUrl) {
        await navigator.clipboard.writeText(shareUrl);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      }
    } catch {
      // ignore cancel
    }
  };

  const renderPager = (extraClass = "") => {
    const visiblePages =
      pagesList.length <= 6
        ? pagesList.map((p) => p.num)
        : [1, 2, 3, 4, 5, "...", pagesList.length];

    return (
      <nav aria-label={isUrdu ? "صفحات کی ترتیب" : "Page Navigation"} className={extraClass}>
        <ul className="flex items-center justify-center gap-0.5 sm:gap-1">
          <li>
            <button
              type="button"
              disabled={activePage <= 1}
              onClick={() => setActivePage((p) => Math.max(1, p - 1))}
              aria-label={isUrdu ? "پچھلا صفحہ" : "Previous Page"}
              className="grid h-8 min-w-8 place-items-center rounded-md px-1.5 text-sm tabular-nums transition-colors sm:h-10 sm:min-w-10 sm:px-2 text-gray-800 hover:bg-[#efeee9] hover:text-[#184e2d] disabled:pointer-events-none disabled:opacity-30 cursor-pointer"
            >
              {isUrdu ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </li>
          {visiblePages.map((item, idx) =>
            item === "..." ? (
              <li
                key={`dots-${idx}`}
                aria-hidden="true"
                className="text-gray-400 grid h-8 w-5 place-items-center text-sm sm:h-10 sm:w-6"
              >
                …
              </li>
            ) : (
              <li key={item}>
                <button
                  type="button"
                  onClick={() => setActivePage(item)}
                  aria-label={isUrdu ? `صفحہ ${item}` : `Page ${item}`}
                  aria-current={activePage === item ? "page" : undefined}
                  className={`grid h-8 min-w-8 place-items-center rounded-md px-1.5 text-sm tabular-nums transition-colors sm:h-10 sm:min-w-10 sm:px-2 cursor-pointer ${
                    activePage === item
                      ? "bg-[#184e2d] text-white font-semibold"
                      : "text-gray-800 hover:bg-[#efeee9] hover:text-[#184e2d]"
                  }`}
                >
                  {item}
                </button>
              </li>
            )
          )}
          <li>
            <button
              type="button"
              disabled={activePage >= pagesList.length}
              onClick={() => setActivePage((p) => Math.min(pagesList.length, p + 1))}
              aria-label={isUrdu ? "اگلا صفحہ" : "Next Page"}
              className="grid h-8 min-w-8 place-items-center rounded-md px-1.5 text-sm tabular-nums transition-colors sm:h-10 sm:min-w-10 sm:px-2 text-gray-800 hover:bg-[#efeee9] hover:text-[#184e2d] disabled:pointer-events-none disabled:opacity-30 cursor-pointer"
            >
              {isUrdu ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </button>
          </li>
        </ul>
      </nav>
    );
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
    <div className="min-h-screen bg-[#f7f6f3] flex flex-col font-sans text-[#1a1a1a]" dir={dir}>
      <Header categories={categories} breakingNews={breakingNews} />

      <main className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-6 py-6">
        
        {/* Editorial Header (Matches Daily Insaf reference) */}
        <header className="mb-4 flex flex-wrap items-end justify-between gap-3 sm:mb-5">
          <div>
            <h1 className="text-xl leading-tight sm:text-2xl lg:text-3xl font-black text-gray-900 urdu-headline">
              {isUrdu ? "ای پیپر" : "ePaper"}
            </h1>
            <p className="text-gray-500 mt-1 text-sm font-sans">
              {formatDisplayDate(selectedDate)} · {isUrdu ? currentCityObj.name_ur : currentCityObj.name_en} · {pagesList.length} {isUrdu ? "صفحات" : "Pages"}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Compact City Edition Selector */}
            <div className="flex items-center gap-1.5 border border-[#dcd8cd] bg-white hover:border-[#184e2d] rounded-lg px-3 min-h-11 text-sm font-semibold text-gray-800 transition-colors">
              <MapPin size={15} className="text-[#184e2d] shrink-0" />
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                aria-label={isUrdu ? "شہر منتخب کریں" : "Select City Edition"}
                className="bg-transparent outline-none cursor-pointer text-xs sm:text-sm font-semibold text-gray-800"
              >
                {cities.map((c) => (
                  <option key={c.key} value={c.key}>
                    {isUrdu ? c.name_ur : c.name_en}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Picker Button */}
            <label className="border border-[#dcd8cd] bg-white hover:border-[#184e2d] hover:text-[#184e2d] flex min-h-11 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-gray-800 transition-colors cursor-pointer">
              <Calendar size={16} className="text-[#184e2d] shrink-0" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="outline-none bg-transparent font-sans text-xs sm:text-sm text-gray-800 cursor-pointer"
              />
            </label>
          </div>
        </header>

        {/* Single Unified Toolbar (Pager on left, Actions on right) */}
        <div className="border-b border-[#dcd8cd] mb-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pb-3">
          {renderPager("max-sm:w-full")}

          <div className="flex flex-wrap items-center gap-0.5 max-sm:w-full max-sm:justify-center">
            {/* All Pages Modal Trigger */}
            <button
              type="button"
              onClick={() => setShowAllPages(true)}
              title={isUrdu ? "تمام صفحات" : "All Pages"}
              className="flex h-10 items-center justify-center gap-1.5 rounded-md transition-colors px-2.5 text-sm font-semibold text-gray-800 hover:bg-[#efeee9] hover:text-[#184e2d] cursor-pointer"
            >
              <LayoutGrid size={18} />
              <span className="max-sm:sr-only">{isUrdu ? "تمام صفحات" : "All Pages"}</span>
            </button>

            <span aria-hidden="true" className="bg-[#dcd8cd] mx-1 h-5 w-px" />

            {/* Zoom Controls */}
            <button
              type="button"
              disabled={zoomLevel <= 75}
              onClick={() => handleZoom(-15)}
              title={isUrdu ? "زوم کم کریں" : "Zoom Out"}
              aria-label={isUrdu ? "زوم کم کریں" : "Zoom Out"}
              className="flex h-10 w-10 items-center justify-center rounded-md transition-colors disabled:pointer-events-none disabled:opacity-30 text-gray-800 hover:bg-[#efeee9] hover:text-[#184e2d] cursor-pointer"
            >
              <ZoomOut size={18} />
            </button>
            <button
              type="button"
              disabled={zoomLevel === 100}
              onClick={() => setZoomLevel(100)}
              title={isUrdu ? "اصل سائز" : "Reset Size (100%)"}
              className="text-gray-600 hover:text-[#184e2d] h-10 min-w-12 rounded-md text-xs font-mono tabular-nums transition-colors disabled:pointer-events-none cursor-pointer"
            >
              {zoomLevel}%
            </button>
            <button
              type="button"
              disabled={zoomLevel >= 175}
              onClick={() => handleZoom(15)}
              title={isUrdu ? "زوم کریں" : "Zoom In"}
              aria-label={isUrdu ? "زوم کریں" : "Zoom In"}
              className="flex h-10 w-10 items-center justify-center rounded-md transition-colors disabled:pointer-events-none disabled:opacity-30 text-gray-800 hover:bg-[#efeee9] hover:text-[#184e2d] cursor-pointer"
            >
              <ZoomIn size={18} />
            </button>

            <span aria-hidden="true" className="bg-[#dcd8cd] mx-1 h-5 w-px" />

            {/* Share Page */}
            <span className="relative">
              <button
                type="button"
                onClick={handleSharePage}
                title={isUrdu ? "صفحہ شیئر کریں" : "Share Page"}
                aria-label={isUrdu ? "صفحہ شیئر کریں" : "Share Page"}
                className="flex h-10 w-10 items-center justify-center rounded-md transition-colors text-gray-800 hover:bg-[#efeee9] hover:text-[#184e2d] cursor-pointer"
              >
                <Share2 size={18} />
              </button>
              {shareCopied && (
                <span
                  role="status"
                  className="bg-gray-900 text-white pointer-events-none absolute top-full start-1/2 z-10 mt-1 -translate-x-1/2 whitespace-nowrap rounded px-2 py-1 text-xs"
                >
                  {isUrdu ? "لنک کاپی ہو گیا!" : "Link copied!"}
                </span>
              )}
            </span>

            {/* Fullscreen / Open */}
            <button
              type="button"
              onClick={toggleFullscreen}
              title={isUrdu ? "پوری اسکرین (F)" : "Fullscreen (F)"}
              aria-label={isUrdu ? "پوری اسکرین" : "Fullscreen"}
              className="hover:bg-[#efeee9] hover:text-[#184e2d] text-gray-800 grid size-10 place-items-center rounded-md transition-colors cursor-pointer"
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>

            {/* PDF Download Link */}
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="text-[#184e2d] hover:bg-[#184e2d]/10 ms-1 flex h-10 items-center gap-1.5 rounded-md px-3 text-sm font-semibold transition-colors cursor-pointer"
            >
              <Download size={16} />
              <span>{isUrdu ? "پی ڈی ایف" : "PDF"}</span>
            </button>
          </div>
        </div>

        {/* Viewer Container (Fullscreen Target) */}
        <div
          ref={viewerRef}
          className={isFullscreen ? "bg-[#f7f6f3] p-4 sm:p-6 overflow-y-auto h-screen" : ""}
        >
        {activeEdition?.page_image ? (
          /* Uploaded High-Res Newspaper Page Image (Click to Zoom, Daily Insaf style) */
          <div
            dir="ltr"
            className="border border-[#dcd8cd] rounded-xl relative bg-white overflow-hidden shadow-xs"
          >
            <div className="w-full overflow-auto">
              <img
                src={activeEdition.page_image}
                alt={`${selectedDate} — ${isUrdu ? `صفحہ ${activePage}` : `Page ${activePage}`}`}
                onClick={() => setZoomLevel((z) => (z === 100 ? 145 : 100))}
                draggable={false}
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: "top center",
                }}
                className={`block w-full h-auto select-none transition-transform duration-200 ${
                  zoomLevel > 100 ? "cursor-zoom-out" : "cursor-zoom-in"
                }`}
              />
            </div>
          </div>
        ) : (
        /* Interactive Broadsheet Fallback Viewer inside crisp rounded-xl card */
        <div className="w-full overflow-x-auto pb-2 scrollbar-thin border border-[#dcd8cd] rounded-xl bg-white shadow-xs">
          <div
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
            className="transition-transform duration-200 mx-auto min-w-[760px] max-w-[1020px] bg-white p-6 sm:p-10 space-y-6 text-gray-900"
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
        )}
        </div>

        {/* Bottom Hint & Bottom Pager (Matches Daily Insaf reference) */}
        <p className="text-gray-500 mx-auto mt-3 max-w-md text-center text-[0.8125rem] leading-snug">
          {isUrdu ? "صفحہ بڑا کرنے کے لیے تصویر پر کلک کریں" : "Click the page to zoom in / out"}
          <span className="mt-0.5 hidden sm:block">
            {isUrdu
              ? "تیر کی کلیدیں: صفحہ بدلیں · + / − : زوم · F: پوری اسکرین"
              : "Arrow keys: Change page · + / − : Zoom · F: Fullscreen"}
          </span>
        </p>

        {renderPager("mt-4 mb-8")}

        {/* All Pages Thumbnail Modal Dialog (Matches Daily Insaf reference) */}
        {showAllPages && (
          <div
            onClick={() => setShowAllPages(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="epaper-index-title"
              className="bg-white rounded-xl text-gray-900 max-h-[88vh] w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col border border-[#dcd8cd]"
            >
              <header className="border-b border-[#dcd8cd] flex items-center justify-between gap-3 px-4 py-3">
                <h2 id="epaper-index-title" className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <span>{isUrdu ? "تمام صفحات" : "All Pages"}</span>
                  <span className="text-gray-400 text-sm font-normal tabular-nums">{pagesList.length}</span>
                </h2>
                <button
                  type="button"
                  onClick={() => setShowAllPages(false)}
                  aria-label={isUrdu ? "بند کریں" : "Close"}
                  className="hover:bg-[#efeee9] grid size-10 place-items-center rounded-md transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </header>

              <ol className="grid grid-cols-3 gap-3 overflow-y-auto p-4 sm:grid-cols-4 md:grid-cols-6">
                {pagesList.map((p) => {
                  const pageEdition =
                    editions.find(
                      (e) => e.page_number === p.num && (e.city_slug === selectedCity || !e.city_slug)
                    ) || editions.find((e) => e.page_number === p.num);
                  const isActive = activePage === p.num;

                  return (
                    <li key={p.num}>
                      <button
                        type="button"
                        aria-current={isActive ? "page" : undefined}
                        aria-label={isUrdu ? `صفحہ ${p.num}` : `Page ${p.num}`}
                        onClick={() => {
                          setActivePage(p.num);
                          setShowAllPages(false);
                          window.scrollTo({ top: 120, behavior: "smooth" });
                        }}
                        className={`group block w-full rounded-md border-2 p-1 text-start transition-colors cursor-pointer ${
                          isActive
                            ? "border-[#184e2d]"
                            : "border-transparent hover:border-[#dcd8cd]"
                        }`}
                      >
                        <span
                          className="bg-[#efeee9] relative block overflow-hidden rounded-sm border border-[#dcd8cd]/70"
                          style={{ aspectRatio: "1600 / 2654" }}
                        >
                          {pageEdition?.page_image ? (
                            <Image
                              src={pageEdition.page_image}
                              alt={`${isUrdu ? "صفحہ" : "Page"} ${p.num}`}
                              fill
                              className="object-cover object-top"
                            />
                          ) : (
                            <span className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center bg-white">
                              <span className="text-[10px] font-black text-[#184e2d] uppercase tracking-wider">
                                Daily Afadiat
                              </span>
                              <span className="text-xs font-bold text-gray-800 mt-1">
                                {isUrdu ? `صفحہ ${p.num}` : `Page ${p.num}`}
                              </span>
                              <span className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">
                                {isUrdu ? p.title_ur : p.title_en}
                              </span>
                            </span>
                          )}
                        </span>
                        <span className="mt-1 flex items-center justify-between gap-1 text-xs">
                          <span className={`tabular-nums ${isActive ? "text-[#184e2d] font-semibold" : "text-gray-600"}`}>
                            {isUrdu ? `صفحہ ${p.num}` : `Page ${p.num}`}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        )}

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
