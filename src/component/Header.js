"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Search, Menu, X, Globe, Tv, Newspaper, Flame, Home, Video, PhoneCall, Megaphone, ArrowUp, Lock, ChevronLeft, ChevronRight, ChevronDown, Briefcase, Info, ShieldCheck, TrendingUp } from "lucide-react";
import AdSlot from "@/component/AdSlot";
import { useSiteLanguage } from "@/context/SiteLanguageContext";

export default function Header({ categories = [], breakingNews = [] }) {
  const pathname = usePathname();
  const { lang, isUrdu, isEnglish, dir, toggleLanguage, t } = useSiteLanguage();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tickerEnabled, setTickerEnabled] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/settings?public=1")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active && data && typeof data.breaking_ticker_enabled === "boolean") {
          setTickerEnabled(data.breaking_ticker_enabled);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  const [hoveredCat, setHoveredCat] = useState(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [megaCache, setMegaCache] = useState({});
  const fetchedSlugsRef = useRef(new Set());
  const closeTimerRef = useRef(null);
  const navContainerRef = useRef(null);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const closeAllMenus = useCallback(() => {
    clearCloseTimer();
    setHoveredCat(null);
    setMoreMenuOpen(false);
  }, [clearCloseTimer]);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setHoveredCat(null);
      setMoreMenuOpen(false);
    }, 120);
  }, [clearCloseTimer]);

  const loadCategoryPreview = useCallback((slug) => {
    if (!slug || fetchedSlugsRef.current.has(slug)) return;
    fetchedSlugsRef.current.add(slug);
    setMegaCache((prev) => ({ ...prev, [slug]: { status: "loading", articles: [] } }));
    fetch(`/api/public/category-preview?slug=${encodeURIComponent(slug)}&limit=4`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        setMegaCache((prev) => ({
          ...prev,
          [slug]: { status: "ready", articles: (data.articles || []).slice(0, 4) },
        }));
      })
      .catch(() => {
        fetchedSlugsRef.current.delete(slug);
        setMegaCache((prev) => ({ ...prev, [slug]: { status: "error", articles: [] } }));
      });
  }, []);

  const handleCatHover = useCallback(
    (cat) => {
      clearCloseTimer();
      setMoreMenuOpen(false);
      setHoveredCat(cat);
      if (cat?.slug) loadCategoryPreview(cat.slug);
    },
    [clearCloseTimer, loadCategoryPreview]
  );

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") closeAllMenus();
    };
    const onPointerDown = (e) => {
      if (navContainerRef.current && !navContainerRef.current.contains(e.target)) {
        closeAllMenus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [closeAllMenus]);

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

  const [ratesList, setRatesList] = useState([
    { ur: "سونا ۲۴K / تولہ", en: "Gold 24K / Tola", val: "₨422,095" },
    { ur: "سونا ۲۲K / تولہ", en: "Gold 22K / Tola", val: "₨389,402" },
    { ur: "چاندی / تولہ", en: "Silver / Tola", val: "₨5,350" },
    { ur: "USD / PKR", en: "USD / PKR", val: "₨277.50" },
    { ur: "AED / PKR", en: "AED / PKR", val: "₨75.45" },
    { ur: "SAR / PKR", en: "SAR / PKR", val: "₨74.35" },
    { ur: "GBP / PKR", en: "GBP / PKR", val: "₨375.50" },
    { ur: "EUR / PKR", en: "EUR / PKR", val: "₨312.40" },
    { ur: "CNY / PKR", en: "CNY / PKR", val: "₨41.65" },
  ]);

  // Live Forex Rates Fetcher with 60-minute Shared Cache (Protects free API quotas)
  useEffect(() => {
    let isMounted = true;
    const CACHE_KEY = "daily_afadiat_forex_cache";
    const TTL = 3600000; // 60 minutes

    function applyRates(rates) {
      const usdPkr = rates.PKR || 276.75;
      const sarUsd = rates.SAR || 3.75;
      const aedUsd = rates.AED || 3.67;
      const gbpUsd = rates.GBP || 0.76;
      const eurUsd = rates.EUR || 0.91;
      const cnyUsd = rates.CNY || 7.24;

      setRatesList([
        { ur: "سونا ۲۴K / تولہ", en: "Gold 24K / Tola", val: "₨422,095" },
        { ur: "سونا ۲۲K / تولہ", en: "Gold 22K / Tola", val: "₨389,402" },
        { ur: "چاندی / تولہ", en: "Silver / Tola", val: "₨5,350" },
        { ur: "USD / PKR", en: "USD / PKR", val: `₨${usdPkr.toFixed(2)}` },
        { ur: "AED / PKR", en: "AED / PKR", val: `₨${(usdPkr / aedUsd).toFixed(2)}` },
        { ur: "SAR / PKR", en: "SAR / PKR", val: `₨${(usdPkr / sarUsd).toFixed(2)}` },
        { ur: "GBP / PKR", en: "GBP / PKR", val: `₨${(usdPkr / gbpUsd).toFixed(2)}` },
        { ur: "EUR / PKR", en: "EUR / PKR", val: `₨${(usdPkr / eurUsd).toFixed(2)}` },
        { ur: "CNY / PKR", en: "CNY / PKR", val: `₨${(usdPkr / cnyUsd).toFixed(2)}` },
      ]);
    }

    // 1. Check if fresh valid cache already exists in browser session
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.rates && Date.now() - parsed.fetchedAt < TTL) {
          if (isMounted) applyRates(parsed.rates);
          // Return early to save API quota!
          return;
        }
      }
    } catch (e) {}

    // 2. Fetch fresh rates only when cache is expired or missing
    async function fetchLiveForex() {
      try {
        const res = await fetch("https://open.er-api.com/v6/latest/USD");
        const data = await res.json();
        if (isMounted && data.result === "success" && data.rates) {
          applyRates(data.rates);
          try {
            sessionStorage.setItem(
              CACHE_KEY,
              JSON.stringify({ rates: data.rates, fetchedAt: Date.now() })
            );
          } catch (e) {}
        }
      } catch (e) {
        // Safe fallback
      }
    }

    fetchLiveForex();
    const interval = setInterval(fetchLiveForex, TTL); // Gentle 60-minute refetch
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);
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
            {process.env.NEXT_PUBLIC_APP_ROLE !== "public" && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1 border border-[#dcd8cd] bg-[#f7f6f3] rounded px-2 py-0.5 text-xs font-semibold text-emerald-800 hover:border-emerald-600 transition"
                title="ایڈمن CMS پینل"
              >
                <Lock size={11} />
                <span>{t("admin")}</span>
              </Link>
            )}

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

      {/* 3. STICKY CATEGORY NAVBAR WITH HOVER MEGA-MENU (Matches Daily Insaf NavMegaMenu) */}
      <nav
        ref={navContainerRef}
        onMouseLeave={scheduleClose}
        onMouseEnter={clearCloseTimer}
        className="border-y-2 border-[#1a1a1a] bg-[#f7f6f3] sticky top-0 z-40 shadow-xs"
      >
        <div className="w-full max-w-[1440px] mx-auto px-2 sm:px-6 lg:px-8 flex items-center justify-center gap-1 relative">
          
          {/* Main Category Links + Inline Search Icon (Centered on Desktop like Daily Insaf) */}
          <div
            className={`flex items-center justify-start lg:justify-center overflow-x-auto lg:overflow-visible scrollbar-none py-0 select-none ${
              isEnglish ? "font-sans text-[12px] font-semibold uppercase tracking-wide" : "text-xs sm:text-sm font-bold"
            }`}
          >
            <Link
              href="/"
              onMouseEnter={closeAllMenus}
              className={`relative px-2.5 sm:px-3 py-2.5 transition shrink-0 flex items-center ${
                pathname === "/" ? "text-[#184e2d]" : "text-gray-900 hover:text-[#184e2d]"
              }`}
              aria-label={t("home")}
            >
              <Home size={17} />
              {pathname === "/" && (
                <span aria-hidden="true" className="bg-[#184e2d] absolute inset-x-2 bottom-0 h-0.5 rounded-full" />
              )}
            </Link>

            <Link
              href="/latest"
              onMouseEnter={closeAllMenus}
              className={`relative px-2.5 sm:px-3 py-2.5 transition whitespace-nowrap shrink-0 ${
                pathname === "/latest" ? "text-[#184e2d]" : "text-gray-900 hover:text-[#184e2d]"
              }`}
            >
              {t("latest")}
              {pathname === "/latest" && (
                <span aria-hidden="true" className="bg-[#184e2d] absolute inset-x-2 bottom-0 h-0.5 rounded-full" />
              )}
            </Link>

            {activeCategories.slice(0, 10).map((cat) => {
              const displayName = isEnglish ? (cat.name_en || cat.name_ur) : (cat.name_ur || cat.name_en);
              const isHovered = hoveredCat?.id === cat.id;
              const isCurrent = pathname?.startsWith(`/category/${cat.slug}`);
              return (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  onMouseEnter={() => handleCatHover(cat)}
                  onFocus={() => handleCatHover(cat)}
                  onClick={closeAllMenus}
                  aria-expanded={isHovered}
                  className={`relative px-2.5 sm:px-3 py-2.5 transition whitespace-nowrap shrink-0 ${
                    isHovered || isCurrent ? "text-[#184e2d]" : "text-gray-900 hover:text-[#184e2d]"
                  }`}
                >
                  {displayName}
                  {(isHovered || isCurrent) && (
                    <span
                      aria-hidden="true"
                      className="bg-[#184e2d] absolute inset-x-2 bottom-0 h-0.5 rounded-full"
                    />
                  )}
                </Link>
              );
            })}

            {activeCategories.length > 10 && (
              <div className="relative shrink-0 hidden lg:block">
                <button
                  type="button"
                  onClick={() => {
                    setHoveredCat(null);
                    setMoreMenuOpen((prev) => !prev);
                  }}
                  onMouseEnter={() => {
                    clearCloseTimer();
                    setHoveredCat(null);
                    setMoreMenuOpen(true);
                  }}
                  aria-expanded={moreMenuOpen}
                  aria-haspopup="true"
                  className={`flex items-center gap-1 whitespace-nowrap px-2.5 sm:px-3 py-2.5 transition cursor-pointer ${
                    moreMenuOpen ? "text-[#184e2d]" : "text-gray-900 hover:text-[#184e2d]"
                  } ${isEnglish ? "uppercase tracking-wide font-semibold text-[12px]" : "font-bold"}`}
                >
                  <span>{isUrdu ? "مزید" : "More"}</span>
                  <ChevronDown
                    size={13}
                    className={`transition-transform duration-200 ${moreMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {moreMenuOpen && (
                  <ul className="border-[#dcd8cd] bg-[#f7f6f3] absolute end-0 top-full z-50 mt-px min-w-52 rounded-b border py-1 shadow-[0_18px_40px_-14px_rgba(0,0,0,0.4)]">
                    {activeCategories.slice(10).map((cat) => {
                      const displayName = isEnglish ? (cat.name_en || cat.name_ur) : (cat.name_ur || cat.name_en);
                      return (
                        <li key={cat.id}>
                          <Link
                            href={`/category/${cat.slug}`}
                            onClick={closeAllMenus}
                            className="hover:bg-[#efeee9] hover:text-[#184e2d] block whitespace-nowrap px-4 py-2.5 text-sm font-semibold text-gray-800 transition-colors normal-case"
                          >
                            {displayName}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            )}

            {/* Inline Search Button & Expandable Box (Right next to nav items like Daily Insaf) */}
            <div className="flex items-center shrink-0 ms-1">
              {searchOpen ? (
                <div className="flex items-center gap-1 border border-[#184e2d] rounded-none px-2 py-1 bg-white my-1 shadow-sm">
                  <input
                    id="header-search-input"
                    name="search"
                    type="text"
                    aria-label={t("searchPlaceholder")}
                    placeholder={t("searchPlaceholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`text-xs outline-none bg-transparent w-28 sm:w-44 normal-case font-normal ${isUrdu ? "text-right font-sans" : "text-left font-sans"}`}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setSearchOpen(false)}
                    className="text-gray-400 hover:text-gray-600 p-0.5 cursor-pointer"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="size-9 grid place-items-center text-gray-800 hover:text-[#184e2d] transition cursor-pointer"
                  aria-label={t("searchAria")}
                  title={isUrdu ? "تلاش کریں" : "Search"}
                >
                  <Search size={17} />
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Expanding Mega-Menu Panel on Category Hover (Desktop) */}
        {hoveredCat && (
          <div
            role="region"
            aria-label={isEnglish ? hoveredCat.name_en || hoveredCat.name_ur : hoveredCat.name_ur}
            onMouseEnter={clearCloseTimer}
            className="hidden lg:block border-[#184e2d] bg-[#f7f6f3] absolute inset-x-0 top-full z-50 mt-px border-t-2 border-b border-b-[#dcd8cd] shadow-[0_28px_56px_-18px_rgba(0,0,0,0.45)]"
          >
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 grid gap-6 py-5 lg:grid-cols-[2fr_1fr]">
              {/* Left 2fr: Latest 4 Posts in Hovered Category */}
              <div>
                <p className="text-gray-500 mb-3 text-[0.6875rem] font-bold tracking-wider uppercase font-sans">
                  {isUrdu ? "تازہ ترین خبریں" : "Latest News"}
                </p>

                {!megaCache[hoveredCat.slug] || megaCache[hoveredCat.slug].status === "loading" ? (
                  <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2" aria-busy="true">
                    {[0, 1, 2, 3].map((idx) => (
                      <li key={idx} className="flex gap-3">
                        <span className="bg-[#efeee9] block h-14 w-20 shrink-0 animate-pulse rounded" />
                        <span className="flex-1 space-y-2 py-1">
                          <span className="bg-[#efeee9] block h-3 w-full animate-pulse rounded" />
                          <span className="bg-[#efeee9] block h-3 w-2/3 animate-pulse rounded" />
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : megaCache[hoveredCat.slug].articles.length === 0 ? (
                  <p className="text-gray-500 py-4 text-sm">—</p>
                ) : (
                  <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                    {megaCache[hoveredCat.slug].articles.map((art) => (
                      <li key={art.id}>
                        <Link
                          href={`/story/${art.slug || art.id}`}
                          onClick={closeAllMenus}
                          className="group flex gap-3 items-start"
                        >
                          <div className="relative w-20 aspect-[16/10] shrink-0 rounded overflow-hidden bg-[#efeee9] border border-[#dcd8cd]">
                            {art.thumb ? (
                              <Image
                                src={art.thumb}
                                alt={isEnglish ? art.title_en || art.title_ur : art.title_ur}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-[#184e2d]">
                                AFADIAT
                              </div>
                            )}
                          </div>
                          <span className="group-hover:text-[#184e2d] line-clamp-3 flex-1 text-sm font-bold leading-snug text-gray-900 transition-colors urdu-headline">
                            {isEnglish ? art.title_en || art.title_ur : art.title_ur}
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Right 1fr: Section Summary & View All Link */}
              <div className="border-[#dcd8cd] ltr:border-l rtl:border-r ltr:pl-6 rtl:pr-6 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <p className="text-gray-500 text-[0.6875rem] font-bold tracking-wider uppercase font-sans">
                    {isUrdu ? "سیکشن" : "Section"}
                  </p>
                  <h3 className="text-lg font-black text-gray-900 urdu-headline">
                    {isEnglish ? hoveredCat.name_en || hoveredCat.name_ur : hoveredCat.name_ur}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {isUrdu
                      ? `${hoveredCat.name_ur} کی تازہ ترین اور مصدقہ خبریں، رپورٹس اور تجزیے پڑھیں۔`
                      : `Read the latest verified news, reports, and analysis from ${hoveredCat.name_en || hoveredCat.name_ur}.`}
                  </p>
                </div>

                <div>
                  <Link
                    href={`/category/${hoveredCat.slug}`}
                    onClick={closeAllMenus}
                    className="text-[#184e2d] inline-flex items-center gap-1.5 text-sm font-bold hover:underline"
                  >
                    <span>{isUrdu ? "مزید خبریں" : "More News"}</span>
                    {isUrdu ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
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

      {/* 5. BREAKING NEWS RED TICKER: CONTINUOUS HORIZONTAL MARQUEE (Controlled by Master Portal Ticker) */}
      {tickerEnabled && (
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
                      tabIndex={-1}
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
                      tabIndex={-1}
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
      )}

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
                  id="mobile-drawer-search-input"
                  name="mobileSearch"
                  type="text"
                  aria-label={t("searchPlaceholder")}
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
