"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Menu, X, Globe, Tv, Newspaper, Flame, Home, Video, PhoneCall, Megaphone, ArrowUp, Lock, ChevronLeft, ChevronRight, Briefcase, Info, ShieldCheck, TrendingUp } from "lucide-react";
import AdSlot from "@/component/AdSlot";
import { useSiteLanguage } from "@/context/SiteLanguageContext";

export default function Header({ categories = [], breakingNews = [] }) {
  const { lang, isUrdu, isEnglish, dir, toggleLanguage, t } = useSiteLanguage();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileDrawerOpen]);

  const defaultCategories = [
    { id: 1, name_ur: "پاکستان", name_en: "Pakistan", slug: "pakistan" },
    { id: 2, name_ur: "انٹرنیشنل", name_en: "World", slug: "world" },
    { id: 3, name_ur: "کھیل", name_en: "Sports", slug: "sports" },
    { id: 4, name_ur: "بزنس", name_en: "Business", slug: "business" },
    { id: 5, name_ur: "سائنس و ٹیکنالوجی", name_en: "Science & Tech", slug: "tech" },
    { id: 6, name_ur: "صحت", name_en: "Health", slug: "health" },
    { id: 7, name_ur: "دلچسپ و عجیب", name_en: "Odd & Curious", slug: "weird" },
  ];

  const activeCategories = categories.length > 0 ? categories : defaultCategories;

  // Format today's date in current locale
  const todayDate = new Intl.DateTimeFormat(isUrdu ? "ur-PK" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const breakingList = breakingNews.length > 0 ? breakingNews : [
    { text_ur: t("breakingDefault"), text_en: t("breakingDefault") }
  ];

  // Prepare items for seamless continuous marquee (starts immediately at 0% with ZERO replay delay)
  const tickerItems =
    breakingList.length === 1
      ? [...breakingList, ...breakingList, ...breakingList, ...breakingList]
      : breakingList.length === 2
      ? [...breakingList, ...breakingList]
      : breakingList;

  const ratesList = [
    { ur: "سونا ۲۴K/تولہ:", en: "Gold 24K/tola:", val: "₨422,095" },
    { ur: "سونا ۲۲K/تولہ:", en: "Gold 22K/tola:", val: "₨389,402" },
    { ur: "USD / PKR:", en: "USD / PKR:", val: "₨277.50" },
    { ur: "AED / PKR:", en: "AED / PKR:", val: "₨75.45" },
    { ur: "SAR / PKR:", en: "SAR / PKR:", val: "₨74.35" },
    { ur: "GBP / PKR:", en: "GBP / PKR:", val: "₨375.50" },
    { ur: "EUR / PKR:", en: "EUR / PKR:", val: "₨312.40" },
    { ur: "CNY / PKR:", en: "CNY / PKR:", val: "₨41.65" },
  ];
  const seamlessRatesList = [...ratesList, ...ratesList];

  return (
    <header className="w-full bg-[#f7f6f3]" dir={dir}>
      {/* 1. TOP UTILITY BAR (Clean, tight edge padding) */}
      <div className="bg-[#efeee9]/90 border-b border-[#dcd8cd] text-gray-700 text-[13px] py-1.5">
        <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          
          {/* Right/Start side: Date + Secondary Links */}
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-none py-0.5">
            <span className="text-gray-700 font-sans font-medium whitespace-nowrap">{todayDate}</span>
            <span className="hidden sm:inline text-gray-300">|</span>
            <nav className="hidden md:flex items-center gap-4 text-gray-600 font-medium text-[13px]">
              <Link href="/live" className="text-red-700 hover:text-red-800 transition flex items-center gap-1.5 whitespace-nowrap font-bold">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                <span>{t("liveTv")}</span>
              </Link>
              <Link href="/services" className="hover:text-emerald-700 transition flex items-center gap-1 whitespace-nowrap">
                <Briefcase size={13} className="text-emerald-800" />
                <span>{t("services")}</span>
              </Link>
              <Link href="/p/about-us" className="hover:text-emerald-700 transition flex items-center gap-1 whitespace-nowrap">
                <Info size={13} className="text-emerald-800" />
                <span>{t("aboutUs")}</span>
              </Link>
              <Link href="/p/editorial-policy" className="hover:text-emerald-700 transition flex items-center gap-1 whitespace-nowrap">
                <ShieldCheck size={13} className="text-emerald-800" />
                <span>{t("editorialPolicy")}</span>
              </Link>
              <Link href="/contact" className="hover:text-emerald-700 transition flex items-center gap-1 whitespace-nowrap">
                <PhoneCall size={13} className="text-emerald-800" />
                <span>{t("contact")}</span>
              </Link>
            </nav>
          </div>

          {/* Left/End side: Admin + Interactive Language Switcher */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 border border-[#dcd8cd] bg-[#f7f6f3] rounded px-2 py-0.5 text-xs font-semibold text-emerald-800 hover:border-emerald-600 transition"
              title="ایڈمن CMS پینل"
            >
              <Lock size={11} />
              <span>{t("admin")}</span>
            </Link>

            {/* Language Toggle Button (Simple, clean neutral style) */}
            <button
              onClick={toggleLanguage}
              className="inline-flex items-center gap-1.5 border border-[#dcd8cd] bg-[#f7f6f3] rounded px-2.5 py-0.5 text-xs font-bold text-gray-700 hover:border-emerald-600 hover:text-emerald-700 transition font-sans cursor-pointer"
              title={isUrdu ? "Switch entire site to English" : "تمام ویب سائٹ اردو میں بدلیں"}
            >
              <Globe size={13} />
              <span>{isUrdu ? "English" : "اردو"}</span>
            </button>
          </div>

        </div>
      </div>

      {/* 2. PROMINENT CENTERED BRANDING BAR & OPTIONAL TOP AD */}
      <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 flex flex-col items-center justify-center relative">
        {/* Mobile menu hamburger button */}
        <div className={`lg:hidden absolute ${isUrdu ? "right-3 sm:right-6" : "left-3 sm:left-6"} top-5`}>
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="p-1.5 text-gray-800 hover:text-emerald-600 focus:outline-none"
            aria-label={isUrdu ? "مینو کھولیں" : "Open Menu"}
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Centered Brand Logo */}
        <Link href="/" className="inline-block">
          <div className="relative h-14 w-52 sm:h-16 sm:w-64 lg:h-20 lg:w-72 transition-transform hover:scale-[1.01] duration-200">
            <Image
              src="/logo-light.webp"
              alt="ڈیلی افادیت / Daily Afadiat"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* Top Header Ad Slot (728x90) */}
        <AdSlot slotKey="top_banner_728x90" className="w-full max-w-[728px] mx-auto mt-2" />
      </div>

      {/* Express News style Broad Utility Bar (آج کا اخبار | مارکیٹ ریٹس | ویڈیوز | اشتہار دیں) */}
      <div className="w-full bg-[#eceae3] border-y border-[#dcd8cd] px-3 sm:px-6 py-2 flex items-center justify-around sm:justify-center sm:gap-8 text-xs sm:text-[13px] font-bold text-gray-800">
        <Link href="/epaper" className="hover:text-emerald-700 flex items-center gap-1.5 shrink-0 transition">
          <Newspaper size={14} className="text-emerald-800" />
          <span>{isUrdu ? "آج کا اخبار" : "ePaper"}</span>
        </Link>
        <span className="text-gray-300 select-none">|</span>
        <Link href="/rates" className="hover:text-emerald-700 flex items-center gap-1.5 shrink-0 transition">
          <TrendingUp size={14} className="text-emerald-800" />
          <span>{t("marketRatesNav")}</span>
        </Link>
        <span className="text-gray-300 select-none">|</span>
        <Link href="/video" className="hover:text-emerald-700 flex items-center gap-1.5 shrink-0 transition">
          <Video size={14} className="text-emerald-800" />
          <span>{t("videos")}</span>
        </Link>
        <span className="text-gray-300 select-none">|</span>
        <Link href="/advertise" className="hover:text-emerald-700 flex items-center gap-1.5 shrink-0 transition">
          <Megaphone size={14} className="text-emerald-800" />
          <span>{t("advertise")}</span>
        </Link>
      </div>

      {/* 3. STICKY CATEGORY NAVBAR (Both Desktop & Mobile with Horizontal Swipe & Search) */}
      <nav className="border-y-2 border-[#1a1a1a] bg-[#f7f6f3] sticky top-0 z-40 shadow-xs">
        <div className="w-full max-w-[1440px] mx-auto px-2 sm:px-6 lg:px-8 flex items-center justify-between gap-2">
          
          {/* Main Category Links: Smooth Horizontal Scroll on Mobile, Full on Desktop */}
          <div className="flex items-center overflow-x-auto scrollbar-none flex-1 py-0 text-xs sm:text-sm font-semibold select-none">
            <Link
              href="/"
              className="px-2.5 sm:px-3 py-2 sm:py-2.5 text-gray-900 hover:text-emerald-700 transition shrink-0 border-b-2 border-transparent hover:border-emerald-600 flex items-center"
              aria-label={t("home")}
            >
              <Home size={16} />
            </Link>

            <Link
              href="/latest"
              className="px-2.5 sm:px-3 py-2 sm:py-2.5 text-gray-900 hover:text-emerald-700 transition whitespace-nowrap shrink-0 border-b-2 border-transparent hover:border-emerald-600 font-bold"
            >
              {t("latest")}
            </Link>

            {activeCategories.map((cat) => {
              const displayName = isEnglish ? (cat.name_en || cat.name_ur) : (cat.name_ur || cat.name_en);
              return (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="px-2.5 sm:px-3 py-2 sm:py-2.5 text-gray-900 hover:text-emerald-700 transition whitespace-nowrap shrink-0 border-b-2 border-transparent hover:border-emerald-600 font-bold"
                >
                  {displayName}
                </Link>
              );
            })}
          </div>

          {/* Search Button & Expandable Box */}
          <div className="flex items-center shrink-0">
            {searchOpen ? (
              <div className="flex items-center gap-1 border border-emerald-600 rounded-none px-2 py-1 bg-white my-1 shadow-sm">
                <input
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`text-xs outline-none bg-transparent w-28 sm:w-44 ${isUrdu ? "text-right font-sans" : "text-left font-sans"}`}
                  autoFocus
                />
                <button onClick={() => setSearchOpen(false)} className="text-gray-400 hover:text-gray-600 p-0.5">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="size-8 sm:size-9 grid place-items-center text-gray-800 hover:text-emerald-700 transition border-l rtl:border-r rtl:border-l-0 border-[#dcd8cd] pl-2 rtl:pr-2 rtl:pl-0"
                aria-label={t("searchAria")}
                title={isUrdu ? "تلاش کریں" : "Search"}
              >
                <Search size={16} />
              </button>
            )}
          </div>

        </div>
      </nav>

      {/* 4. MARKET RATES BAR: FULL WIDTH & FLUSH */}
      <div className="w-full bg-[#efeee9] border-b border-[#dcd8cd] text-gray-700 text-xs">
        <div className="w-full flex items-center h-10 px-0">
          {/* Flush Market Rates Badge */}
          <Link
            href="/rates"
            className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-extrabold text-[11px] px-3.5 h-full flex items-center gap-1.5 uppercase tracking-wide shrink-0 transition font-sans"
          >
            <span className="w-1.5 h-1.5 bg-black rounded-full inline-block"></span>
            <span>{t("marketRatesBadge")}</span>
          </Link>
          
          {/* Animated Marquee Currency & Gold Rates (Starts immediately from start with ZERO replay delay) */}
          <div className="overflow-hidden whitespace-nowrap py-1 flex-1">
            <div
              dir="ltr"
              className="marquee-group overflow-hidden whitespace-nowrap flex items-center flex-1 h-full cursor-pointer"
            >
              <div className="marquee-track-reverse flex shrink-0 items-center gap-6 pr-6 text-xs text-gray-700 font-sans hover:text-emerald-800 transition">
                {ratesList.map((r, idx) => (
                  <span key={`r1-${idx}`} className="inline-flex items-center gap-2 shrink-0">
                    <span dir={isUrdu ? "rtl" : "ltr"}>{isUrdu ? r.ur : r.en}</span>
                    <strong className="text-gray-950 font-bold">{r.val}</strong>
                    <span className="text-gray-400">·</span>
                  </span>
                ))}
              </div>

              <div className="marquee-track-reverse flex shrink-0 items-center gap-6 pr-6 text-xs text-gray-700 font-sans hover:text-emerald-800 transition" aria-hidden="true">
                {ratesList.map((r, idx) => (
                  <span key={`r2-${idx}`} className="inline-flex items-center gap-2 shrink-0">
                    <span dir={isUrdu ? "rtl" : "ltr"}>{isUrdu ? r.ur : r.en}</span>
                    <strong className="text-gray-950 font-bold">{r.val}</strong>
                    <span className="text-gray-400">·</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 5. BREAKING NEWS RED TICKER: CONTINUOUS HORIZONTAL MARQUEE (Starts from start, zero delay, zero replay delay) */}
      <div className="w-full bg-[#b91c1c] text-white flex items-center overflow-hidden border-b border-red-900 h-9 sm:h-10">
        {/* Flame Badge */}
        <div className="bg-[#881337] px-3.5 sm:px-4 h-full font-bold text-xs sm:text-sm flex items-center gap-1.5 shrink-0 z-10 shadow-sm font-sans">
          <Flame size={15} className="text-yellow-300 animate-bounce shrink-0" />
          <span className="tracking-wide font-black">{t("breakingBadge")}</span>
        </div>

        {/* Seamless Dual-Track Continuous Marquee */}
        <div
          dir="ltr"
          className="marquee-group overflow-hidden whitespace-nowrap flex items-center flex-1 h-full select-none cursor-pointer"
        >
          {/* Track 1: Starts immediately from the start (translate3d(0,0,0)) */}
          <div className="marquee-track flex shrink-0 items-center gap-8 pr-8">
            {tickerItems.map((b, idx) => {
              const text = isEnglish ? (b.text_en || b.text_ur) : (b.text_ur || b.text_en);
              return (
                <span key={`trk1-${b.id || idx}`} className="inline-flex items-center gap-3 shrink-0">
                  {b.link_url || b.article_id ? (
                    <Link
                      href={b.link_url || `/story/${b.article_id}`}
                      dir={isUrdu ? "rtl" : "ltr"}
                      className="urdu-headline font-bold text-xs sm:text-[14px] text-yellow-100 hover:text-white hover:underline transition leading-snug tracking-tight"
                    >
                      {text}
                    </Link>
                  ) : (
                    <span dir={isUrdu ? "rtl" : "ltr"} className="urdu-headline font-bold text-xs sm:text-[14px] text-yellow-100">
                      {text}
                    </span>
                  )}
                  <span className="text-yellow-400 font-bold opacity-80 text-xs select-none">★</span>
                </span>
              );
            })}
          </div>

          {/* Track 2: Seamless clone, directly behind Track 1, eliminating replay delay completely */}
          <div className="marquee-track flex shrink-0 items-center gap-8 pr-8" aria-hidden="true">
            {tickerItems.map((b, idx) => {
              const text = isEnglish ? (b.text_en || b.text_ur) : (b.text_ur || b.text_en);
              return (
                <span key={`trk2-${b.id || idx}`} className="inline-flex items-center gap-3 shrink-0">
                  {b.link_url || b.article_id ? (
                    <Link
                      href={b.link_url || `/story/${b.article_id}`}
                      dir={isUrdu ? "rtl" : "ltr"}
                      className="urdu-headline font-bold text-xs sm:text-[14px] text-yellow-100 hover:text-white hover:underline transition leading-snug tracking-tight"
                    >
                      {text}
                    </Link>
                  ) : (
                    <span dir={isUrdu ? "rtl" : "ltr"} className="urdu-headline font-bold text-xs sm:text-[14px] text-yellow-100">
                      {text}
                    </span>
                  )}
                  <span className="text-yellow-400 font-bold opacity-80 text-xs select-none">★</span>
                </span>
              );
            })}
          </div>
        </div>
      </div>

      {/* 6. SLIDE-OUT MOBILE SIDEBAR DRAWER */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" dir={dir}>
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Off-Canvas Slide Drawer */}
          <aside className={`fixed inset-y-0 ${isUrdu ? "right-0 slide-in-from-right" : "left-0 slide-in-from-left"} w-80 max-w-[85vw] bg-[#f7f6f3] shadow-2xl flex flex-col z-50 animate-in duration-300`}>
            
            {/* Drawer Header */}
            <div className="bg-emerald-800 text-white p-4 flex items-center justify-between shadow-sm">
              <span className="font-bold text-base">{isUrdu ? "مینو" : "Menu"}</span>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 rounded-full hover:bg-emerald-700 text-white transition"
                aria-label={isUrdu ? "بند کریں" : "Close"}
              >
                <X size={22} />
              </button>
            </div>

            {/* In-Drawer Search Input */}
            <div className="p-3 border-b border-[#dcd8cd] bg-[#efeee9]">
              <div className="flex items-center gap-2 bg-[#f7f6f3] border border-[#dcd8cd] rounded px-3 py-1.5 shadow-inner">
                <Search size={16} className="text-gray-400" />
                <input
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  className={`w-full text-xs outline-none bg-transparent ${isUrdu ? "text-right" : "text-left"} font-sans`}
                />
              </div>
            </div>

            {/* Scrollable Categories List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#dcd8cd] py-2">
              <Link
                href="/"
                onClick={() => setMobileDrawerOpen(false)}
                className="block px-5 py-2.5 text-emerald-700 font-bold text-sm hover:bg-emerald-50 transition"
              >
                {t("home")}
              </Link>
              <Link
                href="/latest"
                onClick={() => setMobileDrawerOpen(false)}
                className="block px-5 py-2.5 text-gray-800 font-medium text-sm hover:bg-[#efeee9] transition"
              >
                {t("latest")}
              </Link>
              {activeCategories.map((cat) => {
                const displayName = isEnglish ? (cat.name_en || cat.name_ur) : (cat.name_ur || cat.name_en);
                return (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    onClick={() => setMobileDrawerOpen(false)}
                    className="block px-5 py-2.5 text-gray-800 font-medium text-sm hover:bg-[#efeee9] transition"
                  >
                    {displayName}
                  </Link>
                );
              })}
            </div>

            {/* Drawer Secondary Services Footer */}
            <div className="p-3 border-t border-[#dcd8cd] bg-[#efeee9] grid grid-cols-2 gap-2 text-xs text-gray-700 font-medium">
              <Link href="/live" onClick={() => setMobileDrawerOpen(false)} className="flex items-center gap-1.5 p-1 hover:text-emerald-700 hover:bg-white rounded-lg transition">
                <span className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></span>
                <span className="font-bold text-red-700">{t("liveTv")}</span>
              </Link>
              <Link href="/epaper" onClick={() => setMobileDrawerOpen(false)} className="flex items-center gap-1.5 p-1 hover:text-emerald-700 hover:bg-white rounded-lg transition">
                <Newspaper size={13} className="text-emerald-800" />
                <span>{isUrdu ? "آج کا اخبار" : "ePaper"}</span>
              </Link>
              <Link href="/rates" onClick={() => setMobileDrawerOpen(false)} className="flex items-center gap-1.5 p-1 hover:text-emerald-700 hover:bg-white rounded-lg transition">
                <TrendingUp size={13} className="text-emerald-800" />
                <span>{t("marketRatesNav")}</span>
              </Link>
              <Link href="/video" onClick={() => setMobileDrawerOpen(false)} className="flex items-center gap-1.5 p-1 hover:text-emerald-700 hover:bg-white rounded-lg transition">
                <Video size={13} className="text-emerald-800" />
                <span>{t("videos")}</span>
              </Link>
              <Link href="/services" onClick={() => setMobileDrawerOpen(false)} className="flex items-center gap-1.5 p-1 hover:text-emerald-700 hover:bg-white rounded-lg transition">
                <Briefcase size={13} className="text-emerald-800" />
                <span>{t("services")}</span>
              </Link>
              <Link href="/advertise" onClick={() => setMobileDrawerOpen(false)} className="flex items-center gap-1.5 p-1 hover:text-emerald-700 hover:bg-white rounded-lg transition">
                <Megaphone size={13} className="text-emerald-800" />
                <span>{t("advertise")}</span>
              </Link>
              <Link href="/p/about-us" onClick={() => setMobileDrawerOpen(false)} className="flex items-center gap-1.5 p-1 hover:text-emerald-700 hover:bg-white rounded-lg transition">
                <Info size={13} className="text-emerald-800" />
                <span>{t("aboutUs")}</span>
              </Link>
              <Link href="/contact" onClick={() => setMobileDrawerOpen(false)} className="flex items-center gap-1.5 p-1 hover:text-emerald-700 hover:bg-white rounded-lg transition">
                <PhoneCall size={13} className="text-emerald-800" />
                <span>{t("contact")}</span>
              </Link>
            </div>

          </aside>
        </div>
      )}
    </header>
  );
}
