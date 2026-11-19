"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUp, Mail, Lock } from "lucide-react";
import AdSlot from "@/component/AdSlot";
import { useSiteLanguage } from "@/context/SiteLanguageContext";

export default function Footer({ categories = [] }) {
  const { isUrdu, isEnglish, dir, t } = useSiteLanguage();
  const [socialLinks, setSocialLinks] = useState({
    youtube: "https://youtube.com/@dailyafadiat",
    whatsapp: "https://whatsapp.com",
    facebook: "https://facebook.com/dailyafadiat",
    instagram: "https://instagram.com/dailyafadiat",
    twitter: "https://x.com/dailyafadiat",
    tiktok: "https://tiktok.com/@dailyafadiat",
    threads: "https://threads.net/@dailyafadiat",
  });
  const [tagline, setTagline] = useState("سچ کے ساتھ، ہر لمحہ باخبر — TRUST • FACTS • GLOBAL NEWS");

  useEffect(() => {
    let isMounted = true;
    async function loadSocial() {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (isMounted) {
          if (data.social_links) setSocialLinks(data.social_links);
          if (data.site_info?.tagline_ur) setTagline(data.site_info.tagline_ur);
        }
      } catch (e) {}
    }
    loadSocial();
    return () => {
      isMounted = false;
    };
  }, []);

  const scrollToTop = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const defaultCategories = [
    { id: 1, name_ur: "پاکستان", name_en: "Pakistan", slug: "pakistan" },
    { id: 2, name_ur: "انٹرنیشنل", name_en: "World", slug: "world" },
    { id: 3, name_ur: "کھیل", name_en: "Sports", slug: "sports" },
    { id: 4, name_ur: "بزنس", name_en: "Business", slug: "business" },
    { id: 5, name_ur: "سائنس و ٹیکنالوجی", name_en: "Science & Tech", slug: "tech" },
    { id: 6, name_ur: "صحت", name_en: "Health", slug: "health" },
    { id: 7, name_ur: "دلچسپ و عجیب", name_en: "Odd & Curious", slug: "weird" },
  ];

  // Extra footer-only nav items (matching Daily Insaaf style)
  const extraNavItems = [
    { name_ur: "استافل", name_en: "Staff", slug: "staff" },
    { name_ur: "جرائم", name_en: "Crime", slug: "crime" },
    { name_ur: "دین و دنیا", name_en: "Religion & World", slug: "religion" },
    { name_ur: "رائے", name_en: "Opinion", slug: "opinion" },
    { name_ur: "بلاگ", name_en: "Blog", slug: "blog" },
    { name_ur: "فیکٹ چیک", name_en: "Fact Check", slug: "factcheck" },
  ];

  const activeCategories = categories.length > 0 ? categories : defaultCategories;

  // Icon size for social media
  const iconSize = 15;
  const btnClasses = "border border-gray-700 text-gray-400 hover:text-white inline-flex size-8 items-center justify-center rounded-full bg-gray-900/50 transition-colors";

  return (
    <footer className="w-full bg-[#07130c] border-t border-gray-800 text-gray-300 mt-14 pt-6 pb-4 font-sans" dir={dir}>
      <div className="u-shell">
        
        {/* Footer Top Ad Slot (Controllable from CMS) */}
        <AdSlot slotKey="footer_banner" className="mb-5 max-w-4xl mx-auto" />

        {/* ========================================================== */}
        {/* TIER 1: BRAND IDENTITY & OFFICIAL SOCIAL MEDIA ICONS      */}
        {/* ========================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5 pb-5">
          
          {/* Brand Logo & Tagline */}
          <div className="flex flex-col items-start gap-1.5">
            <Link href="/" className="inline-block">
              <div className="relative h-12 w-44 sm:h-14 sm:w-52">
                <Image
                  src="/logo.webp"
                  alt="ڈیلی افادیت / Daily Afadiat"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
            <p className={`text-gray-400 text-[11px] sm:text-xs font-medium ${isUrdu ? "font-nastaliq" : "font-sans"}`}>
              {isEnglish ? "TRUST • FACTS • GLOBAL NEWS — Dedicated to Truthful & Independent Journalism" : tagline}
            </p>
          </div>

          {/* Social Icons & Contact Link */}
          <div className={`flex flex-col gap-2.5 ${isUrdu ? "sm:items-end" : "sm:items-start"}`}>
            <div className={`flex flex-col gap-1.5 ${isUrdu ? "sm:items-end" : "sm:items-start"}`}>
              <p className="text-gray-400 text-[10px] font-bold tracking-widest uppercase">
                {t("followUs")}
              </p>
              
              {/* Social Icons — Compact, matching Daily Insaaf */}
              <ul className="flex items-center gap-1.5">
                {/* YouTube */}
                <li>
                  <a
                    href={socialLinks.youtube || "https://youtube.com"}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                    title="YouTube"
                    className={btnClasses}
                  >
                    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </a>
                </li>

                {/* WhatsApp */}
                <li>
                  <a
                    href={socialLinks.whatsapp || "https://whatsapp.com"}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp"
                    title="WhatsApp"
                    className={btnClasses}
                  >
                    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.885 3.488"/>
                    </svg>
                  </a>
                </li>

                {/* Facebook */}
                <li>
                  <a
                    href={socialLinks.facebook || "https://facebook.com"}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                    title="Facebook"
                    className={btnClasses}
                  >
                    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                </li>

                {/* Instagram */}
                <li>
                  <a
                    href={socialLinks.instagram || "https://instagram.com"}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    title="Instagram"
                    className={btnClasses}
                  >
                    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </a>
                </li>

                {/* X / Twitter */}
                <li>
                  <a
                    href={socialLinks.twitter || "https://x.com"}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="X (Twitter)"
                    title="X (Twitter)"
                    className={btnClasses}
                  >
                    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                </li>

                {/* TikTok */}
                <li>
                  <a
                    href={socialLinks.tiktok || "https://tiktok.com"}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="TikTok"
                    title="TikTok"
                    className={btnClasses}
                  >
                    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                    </svg>
                  </a>
                </li>

                {/* Threads (matching Daily Insaaf) */}
                <li>
                  <a
                    href={socialLinks.threads || "https://threads.net"}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Threads"
                    title="Threads"
                    className={btnClasses}
                  >
                    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.086.718 5.496 2.057 7.164 1.432 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.187.408-2.26 1.33-3.017.88-.723 2.082-1.138 3.477-1.2 1.027-.046 1.986.046 2.876.274-.034-.816-.188-1.497-.46-2.03-.375-.735-1.012-1.128-1.893-1.168-.652-.03-1.26.127-1.724.449-.41.284-.695.676-.826 1.134l-2.07-.46c.247-.9.776-1.68 1.519-2.249.858-.658 1.98-1.012 3.244-.97 1.494.067 2.645.67 3.422 1.794.595.86.937 1.95 1.02 3.236l.013.26c1.117.584 1.99 1.395 2.552 2.398.826 1.472.95 3.97-.838 5.717C17.633 22.985 15.413 23.96 12.186 24zm.082-8.856c-1.396.062-2.398.56-2.476 1.98-.04.724.302 1.247.838 1.595.588.381 1.372.52 2.145.483 1.082-.06 1.904-.46 2.443-1.191.388-.525.65-1.21.776-2.054-.8-.19-1.646-.293-2.527-.293-.38 0-.776.023-1.199.058v-.578z"/>
                    </svg>
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Link — Full visible text like Daily Insaaf "ہم سے رابطہ کریں" */}
            <Link
              href="/contact"
              className="text-gray-400 hover:text-gray-200 inline-flex items-center gap-1.5 text-xs font-semibold transition-colors whitespace-nowrap"
            >
              <Mail size={13} className="text-gray-400" />
              <span>{t("contactTitle")}</span>
            </Link>
          </div>

        </div>

        {/* ========================================================== */}
        {/* TIER 2: CATEGORIES & SERVICES HORIZONTAL STRIP            */}
        {/* ========================================================== */}
        <nav aria-label="Sections" className="border-t border-gray-800 pt-3 pb-3">
          <ul className="text-gray-400 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] sm:text-xs font-medium">
            <li>
              <Link href="/" className="hover:text-gray-200 font-bold transition-colors">
                {t("home")}
              </Link>
            </li>
            <li>
              <Link href="/latest" className="hover:text-gray-200 transition-colors">
                {t("latest")}
              </Link>
            </li>
            {activeCategories.map((cat) => {
              const displayName = isEnglish ? (cat.name_en || cat.name_ur) : (cat.name_ur || cat.name_en);
              return (
                <li key={cat.id}>
                  <Link href={`/category/${cat.slug}`} className="hover:text-gray-200 transition-colors">
                    {displayName}
                  </Link>
                </li>
              );
            })}
            {/* Extra nav items matching Daily Insaaf */}
            {extraNavItems.map((item) => (
              <li key={item.slug}>
                <Link href={`/category/${item.slug}`} className="hover:text-gray-200 transition-colors">
                  {isEnglish ? item.name_en : item.name_ur}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/live" className="text-red-400 hover:text-red-300 font-semibold transition-colors flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                <span>{t("liveTv")}</span>
              </Link>
            </li>
            <li>
              <Link href="/video" className="hover:text-gray-200 transition-colors">
                {t("videos")}
              </Link>
            </li>
            <li>
              <Link href="/epaper" className="hover:text-gray-200 transition-colors">
                {t("epaper")}
              </Link>
            </li>
          </ul>
          {/* Second row for services */}
          <ul className="text-gray-400 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] sm:text-xs font-medium mt-1.5">
            <li>
              <Link href="/rates" className="hover:text-gray-200 transition-colors">
                {t("marketRatesBadge")}
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-gray-200 transition-colors">
                {t("contact")}
              </Link>
            </li>
            <li>
              <Link href="/advertise" className="hover:text-gray-200 transition-colors">
                {t("advertise")}
              </Link>
            </li>
          </ul>
        </nav>

        {/* ========================================================== */}
        {/* TIER 3: COPYRIGHT NOTICE & BACK TO TOP BUTTON              */}
        {/* ========================================================== */}
        <div className="border-t border-gray-800 pt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[11px] text-gray-500">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} Daily Afadiat (ڈیلی افادیت)</span>
            <span aria-hidden="true" className="text-gray-700">|</span>
            <Link href="/contact" className="hover:text-gray-300 transition-colors">
              {t("contact")}
            </Link>
            <span aria-hidden="true" className="text-gray-700">|</span>
            <Link href="/admin" className="hover:text-gray-300 transition-colors flex items-center gap-1">
              <Lock size={10} />
              <span>{t("admin")}</span>
            </Link>
          </div>

          <div>
            <button
              onClick={scrollToTop}
              className="hover:text-gray-300 inline-flex items-center gap-1 text-[11px] text-gray-400 transition-colors cursor-pointer"
            >
              <ArrowUp size={12} />
              <span>{t("backToTop")}</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
