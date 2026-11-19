"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Menu, X, Globe, Tv, Newspaper, Flame, Home, Video, PhoneCall, Megaphone, ArrowUp, Lock } from "lucide-react";
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
              <Link href="/live" className="hover:text-emerald-700 transition flex items-center gap-1.5 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                <span>{t("liveTv")}</span>
              </Link>
              <Link href="/video" className="hover:text-emerald-600 transition flex items-center gap-1 whitespace-nowrap">
                <Video size={13} />
                <span>{t("videos")}</span>
              </Link>
              <Link href="/epaper" className="hover:text-emerald-600 transition flex items-center gap-1 whitespace-nowrap">
                <Newspaper size={13} />
                <span>{t("epaper")}</span>
              </Link>
              <Link href="/advertise" className="hover:text-emerald-600 transition flex items-center gap-1 whitespace-nowrap">
                <Megaphone size={13} />
                <span>{t("advertise")}</span>
              </Link>
              <Link href="/contact" className="hover:text-emerald-600 transition flex items-center gap-1 whitespace-nowrap">
                <PhoneCall size={13} />
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

      {/* 3. STICKY CATEGORY NAVBAR */}
      <nav className="border-y-2 border-[#1a1a1a] bg-[#f7f6f3] sticky top-0 z-40 shadow-sm">
        <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between">
          
          {/* Main Category Links */}
          <ul className="hidden lg:flex items-center gap-0 py-0 overflow-x-auto scrollbar-none text-sm font-semibold">
            <li>
              <Link
                href="/"
                className="px-3 py-2.5 text-gray-800 hover:text-emerald-600 transition block border-b-2 border-transparent hover:border-emerald-600"
                aria-label={t("home")}
              >
                <Home size={17} />
              </Link>
            </li>
            <li>
              <Link
                href="/latest"
                className="px-3 py-2.5 text-gray-800 hover:text-emerald-600 transition whitespace-nowrap block border-b-2 border-transparent hover:border-emerald-600"
              >
                {t("latest")}
              </Link>
            </li>
            {activeCategories.map((cat) => {
              const displayName = isEnglish ? (cat.name_en || cat.name_ur) : (cat.name_ur || cat.name_en);
              return (
                <li key={cat.id}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="px-3 py-2.5 text-gray-800 hover:text-emerald-600 transition whitespace-nowrap block border-b-2 border-transparent hover:border-emerald-600"
                  >
                    {displayName}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Search Button */}
          <div className="flex items-center">
            {searchOpen ? (
              <div className="flex items-center gap-1 border border-emerald-600 rounded px-2.5 py-1 bg-[#f7f6f3] my-1 shadow-sm">
                <input
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`text-xs outline-none bg-transparent w-32 sm:w-44 ${isUrdu ? "text-right font-sans" : "text-left font-sans"}`}
                  autoFocus
                />
                <button onClick={() => setSearchOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="size-9 grid place-items-center text-gray-700 hover:text-emerald-600 transition"
                aria-label={t("searchAria")}
              >
                <Search size={18} />
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
          
          {/* Animated Marquee Currency & Gold Rates (Flows opposite to breaking news) */}
          <div className="overflow-hidden whitespace-nowrap py-1 flex-1">
            <div className="animate-marquee-reverse text-xs text-gray-700 font-sans cursor-pointer hover:text-emerald-800 transition">
              <span className="mx-3">{isUrdu ? "سونا ۲۴K/تولہ:" : "Gold 24K/tola:"} <strong className="text-gray-950 font-bold">₨422,095</strong></span>
              <span className="text-gray-400">·</span>
              <span className="mx-3">{isUrdu ? "سونا ۲۲K/تولہ:" : "Gold 22K/tola:"} <strong className="text-gray-950 font-bold">₨389,402</strong></span>
              <span className="text-gray-400">·</span>
              <span className="mx-3">USD / PKR: <strong className="text-gray-950 font-bold">₨277.50</strong></span>
              <span className="text-gray-400">·</span>
              <span className="mx-3">AED / PKR: <strong className="text-gray-950 font-bold">₨75.45</strong></span>
              <span className="text-gray-400">·</span>
              <span className="mx-3">SAR / PKR: <strong className="text-gray-950 font-bold">₨74.35</strong></span>
              <span className="text-gray-400">·</span>
              <span className="mx-3">GBP / PKR: <strong className="text-gray-950 font-bold">₨375.50</strong></span>
              <span className="text-gray-400">·</span>
              <span className="mx-3">EUR / PKR: <strong className="text-gray-950 font-bold">₨312.40</strong></span>
              <span className="text-gray-400">·</span>
              <span className="mx-3">CNY / PKR: <strong className="text-gray-950 font-bold">₨41.65</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. BREAKING NEWS RED TICKER: FULL WIDTH & FLUSH */}
      <div className="w-full bg-red-700 text-white flex items-center overflow-hidden border-b border-red-800">
        <div className="bg-red-900 px-3.5 py-1.5 font-bold text-xs sm:text-sm flex items-center gap-1.5 shrink-0 z-10 shadow-md font-sans">
          <Flame size={15} className="text-yellow-300 animate-bounce" />
          <span>{t("breakingBadge")}</span>
        </div>
        <div className="overflow-hidden whitespace-nowrap py-1.5 text-xs sm:text-sm flex-1">
          <div className="animate-marquee text-yellow-100 font-medium inline-flex items-center gap-4">
            {breakingList.map((b, idx) => {
              const text = isEnglish ? (b.text_en || b.text_ur) : (b.text_ur || b.text_en);
              return (
                <span key={b.id || idx} className="inline-flex items-center gap-3">
                  {b.link_url || b.article_id ? (
                    <Link
                      href={b.link_url || `/story/${b.article_id}`}
                      className="hover:underline hover:text-white transition font-medium"
                    >
                      {text}
                    </Link>
                  ) : (
                    <span>{text}</span>
                  )}
                  <span className="text-yellow-400 font-bold opacity-80">★</span>
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
                <span>{t("liveTv")}</span>
              </Link>
              <Link href="/video" onClick={() => setMobileDrawerOpen(false)} className="flex items-center gap-1.5 p-1 hover:text-emerald-700 hover:bg-white rounded-lg transition">
                <Video size={13} />
                <span>{t("videos")}</span>
              </Link>
              <Link href="/epaper" onClick={() => setMobileDrawerOpen(false)} className="flex items-center gap-1.5 p-1 hover:text-emerald-700 hover:bg-white rounded-lg transition">
                <Newspaper size={13} />
                <span>{t("epaper")}</span>
              </Link>
              <Link href="/advertise" onClick={() => setMobileDrawerOpen(false)} className="flex items-center gap-1.5 p-1 hover:text-emerald-700 hover:bg-white rounded-lg transition">
                <Megaphone size={13} />
                <span>{t("advertise")}</span>
              </Link>
            </div>

          </aside>
        </div>
      )}
    </header>
  );
}
