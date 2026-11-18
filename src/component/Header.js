"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Menu, X, Globe, Tv, Newspaper, Flame, Home, Video, PhoneCall, Megaphone, ArrowUp, Lock } from "lucide-react";
import AdSlot from "@/component/AdSlot";

export default function Header({ categories = [], breakingNews = [] }) {
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
    { id: 1, name_ur: "پاکستان", slug: "pakistan" },
    { id: 2, name_ur: "انٹرنیشنل", slug: "world" },
    { id: 3, name_ur: "کھیل", slug: "sports" },
    { id: 4, name_ur: "بزنس", slug: "business" },
    { id: 5, name_ur: "سائنس و ٹیکنالوجی", slug: "tech" },
    { id: 6, name_ur: "صحت", slug: "health" },
    { id: 7, name_ur: "دلچسپ و عجیب", slug: "weird" },
  ];

  const activeCategories = categories.length > 0 ? categories : defaultCategories;

  // Format today's date in Urdu
  const todayDate = new Intl.DateTimeFormat("ur-PK", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  const breakingText = breakingNews.length > 0 
    ? breakingNews.map(b => b.text_ur).join("  ★  ") 
    : "ڈیلی افادیت کا نیا ڈیجیٹل پورٹل باقاعدہ فعال ہو گیا — پل پل کی باخبر اور مصدقہ خبریں اب آپ کی انگلیوں پر";

  return (
    <header className="w-full bg-[#f7f6f3]">
      {/* 1. TOP UTILITY BAR (Clean, tight edge padding) */}
      <div className="bg-[#efeee9]/90 border-b border-[#dcd8cd] text-gray-700 text-[13px] py-1.5">
        <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          
          {/* Right side: Date + Secondary Links */}
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-none py-0.5">
            <span className="text-gray-700 font-sans font-medium whitespace-nowrap">{todayDate}</span>
            <span className="hidden sm:inline text-gray-300">|</span>
            <nav className="hidden md:flex items-center gap-4 text-gray-600 font-medium text-[13px]">
              <Link href="/live" className="hover:text-emerald-600 transition flex items-center gap-1.5 whitespace-nowrap">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
                <span>لائیو ٹی وی</span>
              </Link>
              <Link href="/video" className="hover:text-emerald-600 transition flex items-center gap-1 whitespace-nowrap">
                <Video size={13} />
                <span>ویڈیوز</span>
              </Link>
              <Link href="/epaper" className="hover:text-emerald-600 transition flex items-center gap-1 whitespace-nowrap">
                <Newspaper size={13} />
                <span>ای پیپر</span>
              </Link>
              <Link href="/advertise" className="hover:text-emerald-600 transition flex items-center gap-1 whitespace-nowrap">
                <Megaphone size={13} />
                <span>اشتہار دیں</span>
              </Link>
              <Link href="/contact" className="hover:text-emerald-600 transition flex items-center gap-1 whitespace-nowrap">
                <PhoneCall size={13} />
                <span>رابطہ</span>
              </Link>
            </nav>
          </div>

          {/* Left side: Admin + Language Switcher Badge */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1 border border-[#dcd8cd] bg-[#f7f6f3] rounded px-2 py-0.5 text-xs font-semibold text-emerald-800 hover:border-emerald-600 transition"
              title="ایڈمن CMS پینل"
            >
              <Lock size={11} />
              <span>ایڈمن</span>
            </Link>
            <Link
              href="/en"
              className="inline-flex items-center gap-1.5 border border-[#dcd8cd] bg-[#f7f6f3] rounded px-2.5 py-0.5 text-xs font-bold text-gray-700 hover:border-emerald-600 hover:text-emerald-700 transition font-sans"
            >
              <Globe size={13} />
              <span>English</span>
            </Link>
          </div>

        </div>
      </div>

      {/* 2. PROMINENT CENTERED BRANDING BAR & OPTIONAL TOP AD */}
      <div className="w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-4 flex flex-col items-center justify-center relative">
        {/* Mobile menu hamburger button on right (RTL) */}
        <div className="lg:hidden absolute right-3 sm:right-6 top-5">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="p-1.5 text-gray-800 hover:text-emerald-600 focus:outline-none"
            aria-label="مینو کھولیں"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Centered Brand Logo */}
        <Link href="/" className="inline-block">
          <div className="relative h-14 w-52 sm:h-16 sm:w-64 lg:h-20 lg:w-72 transition-transform hover:scale-[1.01] duration-200">
            <Image
              src="/logo-light.webp"
              alt="ڈیلی افادیت"
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
          
          {/* Main Category Links (Right to Left) */}
          <ul className="hidden lg:flex items-center gap-0 py-0 overflow-x-auto scrollbar-none text-sm font-semibold">
            <li>
              <Link
                href="/"
                className="px-3 py-2.5 text-gray-800 hover:text-emerald-600 transition block border-b-2 border-transparent hover:border-emerald-600"
                aria-label="صفحۂ اول"
              >
                <Home size={17} />
              </Link>
            </li>
            <li>
              <Link
                href="/latest"
                className="px-3 py-2.5 text-gray-800 hover:text-emerald-600 transition whitespace-nowrap block border-b-2 border-transparent hover:border-emerald-600"
              >
                تازہ ترین
              </Link>
            </li>
            {activeCategories.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/category/${cat.slug}`}
                  className="px-3 py-2.5 text-gray-800 hover:text-emerald-600 transition whitespace-nowrap block border-b-2 border-transparent hover:border-emerald-600"
                >
                  {cat.name_ur}
                </Link>
              </li>
            ))}
          </ul>

          {/* Search Button (Vertically aligned with English button with tight, clean gap) */}
          <div className="flex items-center">
            {searchOpen ? (
              <div className="flex items-center gap-1 border border-emerald-600 rounded px-2.5 py-1 bg-[#f7f6f3] my-1 shadow-sm">
                <input
                  type="text"
                  placeholder="خبر تلاش کریں..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="text-xs outline-none bg-transparent w-32 sm:w-44 text-right font-sans"
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
                aria-label="خبروں میں تلاش کریں"
              >
                <Search size={18} />
              </button>
            )}
          </div>

        </div>
      </nav>

      {/* 4. MARKET RATES BAR: FULL WIDTH & FLUSH (ZERO RIGHT-SIDE GAP!) */}
      <div className="w-full bg-[#efeee9] border-b border-[#dcd8cd] text-gray-700 text-xs">
        <div className="w-full flex items-center h-10 px-0">
          {/* Flush Market Rates Badge */}
          <Link
            href="/rates"
            className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-extrabold text-[11px] px-3.5 h-full flex items-center gap-1.5 uppercase tracking-wide shrink-0 transition"
          >
            <span className="w-1.5 h-1.5 bg-black rounded-full inline-block"></span>
            <span>مارکیٹ ریٹس</span>
          </Link>
          
          {/* Scrolling Currency & Gold Rates */}
          <div className="flex items-center overflow-x-auto scrollbar-none gap-4 whitespace-nowrap text-xs text-gray-700 font-sans py-1 px-3">
            <span>سونا ۲۴K/تولہ: <strong className="text-gray-900 font-semibold">₨422,095</strong></span>
            <span className="text-gray-300">·</span>
            <span>سونا ۲۲K/تولہ: <strong className="text-gray-900 font-semibold">₨389,402</strong></span>
            <span className="text-gray-300">·</span>
            <span>USD: <strong className="text-gray-900 font-semibold">₨277.50</strong></span>
            <span className="text-gray-300">·</span>
            <span>AED: <strong className="text-gray-900 font-semibold">₨75.45</strong></span>
            <span className="text-gray-300">·</span>
            <span>SAR: <strong className="text-gray-900 font-semibold">₨74.35</strong></span>
            <span className="text-gray-300">·</span>
            <span>GBP: <strong className="text-gray-900 font-semibold">₨375.50</strong></span>
          </div>
        </div>
      </div>

      {/* 5. BREAKING NEWS RED TICKER: FULL WIDTH & FLUSH */}
      <div className="w-full bg-red-700 text-white flex items-center overflow-hidden border-b border-red-800">
        <div className="bg-red-900 px-3.5 py-1.5 font-bold text-xs sm:text-sm flex items-center gap-1.5 shrink-0 z-10 shadow-md">
          <Flame size={15} className="text-yellow-300 animate-bounce" />
          <span>بریکنگ نیوز:</span>
        </div>
        <div className="overflow-hidden whitespace-nowrap py-1.5 text-xs sm:text-sm flex-1">
          <div className="animate-marquee text-yellow-100 font-medium">
            {breakingText}
          </div>
        </div>
      </div>

      {/* ========================================================== */}
      {/* 6. DAILY INSAAF-STYLE SLIDE-OUT MOBILE SIDEBAR DRAWER       */}
      {/* ========================================================== */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />

          {/* Off-Canvas Slide Drawer from Right (RTL) */}
          <aside className="fixed inset-y-0 right-0 w-80 max-w-[85vw] bg-[#f7f6f3] shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-300">
            
            {/* Drawer Header (Deep Emerald) */}
            <div className="bg-emerald-800 text-white p-4 flex items-center justify-between shadow-sm">
              <span className="font-bold text-base">مینو</span>
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1 rounded-full hover:bg-emerald-700 text-white transition"
                aria-label="بند کریں"
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
                  placeholder="تلاش کریں..."
                  className="w-full text-xs outline-none bg-transparent text-right font-sans"
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
                صفحۂ اول
              </Link>
              <Link
                href="/latest"
                onClick={() => setMobileDrawerOpen(false)}
                className="block px-5 py-2.5 text-gray-800 font-medium text-sm hover:bg-[#efeee9] transition"
              >
                تازہ ترین
              </Link>
              {activeCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  onClick={() => setMobileDrawerOpen(false)}
                  className="block px-5 py-2.5 text-gray-800 font-medium text-sm hover:bg-[#efeee9] transition"
                >
                  {cat.name_ur}
                </Link>
              ))}
            </div>

            {/* Drawer Secondary Services Footer */}
            <div className="p-4 border-t border-[#dcd8cd] bg-[#efeee9] flex items-center justify-around text-xs text-gray-600 font-medium">
              <Link href="/live" onClick={() => setMobileDrawerOpen(false)} className="flex items-center gap-1 text-red-600 font-bold">
                <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping"></span>
                <span>لائیو ٹی وی</span>
              </Link>
              <Link href="/epaper" onClick={() => setMobileDrawerOpen(false)} className="hover:text-emerald-700">
                ای پیپر
              </Link>
              <Link href="/contact" onClick={() => setMobileDrawerOpen(false)} className="hover:text-emerald-700">
                رابطہ
              </Link>
            </div>

          </aside>
        </div>
      )}
    </header>
  );
}
