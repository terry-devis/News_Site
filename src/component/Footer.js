"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUp, Mail, Lock } from "lucide-react";
import AdSlot from "@/component/AdSlot";
import { useSiteLanguage } from "@/context/SiteLanguageContext";

let footerSettingsCache = { data: null, ts: 0 };
let footerSettingsPromise = null;

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
        const now = Date.now();
        if (footerSettingsCache.data && now - footerSettingsCache.ts < 60_000) {
          const data = footerSettingsCache.data;
          if (isMounted) {
            if (data.social_links) setSocialLinks(data.social_links);
            if (data.site_info?.tagline_ur) setTagline(data.site_info.tagline_ur);
          }
          return;
        }
        if (!footerSettingsPromise) {
          footerSettingsPromise = fetch("/api/settings?public=1")
            .then((r) => r.json())
            .then((data) => {
              footerSettingsCache = { data, ts: Date.now() };
              footerSettingsPromise = null;
              return data;
            })
            .catch((err) => {
              footerSettingsPromise = null;
              throw err;
            });
        }
        const data = await footerSettingsPromise;
        if (isMounted && data) {
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
  const iconSize = 17;
  const btnClasses = "border border-white/25 text-white/85 hover:text-white hover:border-white hover:bg-white/10 inline-flex size-9 items-center justify-center rounded-none transition-colors";

  return (
    <>
      {/* Footer Top Ad Slot placed cleanly above the green footer on light canvas */}
      <div className="u-shell mt-12 mb-6" dir={dir}>
        <AdSlot slotKey="footer-strip" className="max-w-[970px] mx-auto" />
      </div>

      <footer className="w-full bg-[#0d542f] border-t border-[#0a4224] text-white pt-7 pb-5 font-sans" dir={dir}>
        <div className="u-shell">

        {/* ========================================================== */}
        {/* TIER 1: BRAND IDENTITY & OFFICIAL SOCIAL MEDIA ICONS      */}
        {/* ========================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 pb-6">
          
          {/* Brand Logo & Tagline */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <Link href="/" className="inline-block shrink-0">
              <div className="relative h-14 w-44 sm:h-16 sm:w-52">
                <Image
                  src="/logo.webp"
                  alt="ڈیلی افادیت / Daily Afadiat"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
            <p className={`text-white/85 max-w-xs text-xs sm:text-[13px] font-medium leading-relaxed ${isUrdu ? "font-nastaliq" : "font-sans"}`}>
              {isEnglish ? "TRUST • FACTS • GLOBAL NEWS — Dedicated to Truthful & Independent Journalism" : tagline}
            </p>
          </div>

          {/* Social Icons & Contact Link */}
          <div className={`flex flex-col gap-3 ${isUrdu ? "sm:items-end" : "sm:items-start"}`}>
            <div className={`flex flex-col gap-2 ${isUrdu ? "sm:items-end" : "sm:items-start"}`}>
              <p className="text-white/75 text-[11px] font-bold tracking-widest uppercase">
                {t("followUs")}
              </p>
              
              {/* Social Icons — Crisp square boxes matching Daily Insaf */}
              <ul className="flex flex-wrap items-center gap-2">
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
                    <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.781 3.631 2.695 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.324.145 1.52.715 2.631 1.796 3.21 3.128.809 1.86.884 4.893-1.582 7.312-1.885 1.847-4.173 2.681-7.317 2.703zm1.276-11.63c-.244 0-.492.008-.744.023-1.842.104-2.98.952-2.916 2.15.067 1.256 1.452 1.84 2.784 1.768 1.224-.066 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.21-.229z" />
                    </svg>
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Link — Full visible text like Daily Insaaf "ہم سے رابطہ کریں" */}
            <Link
              href="/contact"
              className="text-white/90 hover:text-white inline-flex items-center gap-2 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap"
            >
              <Mail size={14} className="text-white/80" />
              <span>{t("contactTitle")}</span>
            </Link>
          </div>

        </div>

        {/* ========================================================== */}
        {/* TIER 2: CATEGORIES & SERVICES HORIZONTAL STRIP            */}
        {/* ========================================================== */}
        <nav aria-label="Sections" className="border-t border-white/15 pt-4 pb-4">
          <ul className="text-white/85 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-medium">
            <li>
              <Link href="/" className="hover:text-white font-bold transition-colors">
                {t("home")}
              </Link>
            </li>
            <li>
              <Link href="/latest" className="hover:text-white transition-colors">
                {t("latest")}
              </Link>
            </li>
            {activeCategories.map((cat) => {
              const displayName = isEnglish ? (cat.name_en || cat.name_ur) : (cat.name_ur || cat.name_en);
              return (
                <li key={cat.id}>
                  <Link href={`/category/${cat.slug}`} className="hover:text-white transition-colors">
                    {displayName}
                  </Link>
                </li>
              );
            })}
            {/* Extra nav items matching Daily Insaaf */}
            {extraNavItems.map((item) => (
              <li key={item.slug}>
                <Link href={`/category/${item.slug}`} className="hover:text-white transition-colors">
                  {isEnglish ? item.name_en : item.name_ur}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/live" className="hover:text-white transition-colors flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"></span>
                <span>{t("liveTv")}</span>
              </Link>
            </li>
            <li>
              <Link href="/video" className="hover:text-white transition-colors">
                {t("videos")}
              </Link>
            </li>
            <li>
              <Link href="/epaper" className="hover:text-white transition-colors">
                {t("epaper")}
              </Link>
            </li>
            <li>
              <Link href="/rates" className="hover:text-white transition-colors">
                {t("marketRatesBadge")}
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-white transition-colors">
                {t("contact")}
              </Link>
            </li>
            <li>
              <Link href="/advertise" className="hover:text-white transition-colors">
                {t("advertise")}
              </Link>
            </li>
            <li>
              <a href="/rss.xml" target="_blank" rel="noopener noreferrer" className="hover:text-amber-300 transition-colors">
                {isEnglish ? "RSS Feed" : "آر ایس ایس فیڈ"}
              </a>
            </li>
          </ul>
        </nav>

        {/* ========================================================== */}
        {/* TIER 3: COPYRIGHT NOTICE & BACK TO TOP BUTTON              */}
        {/* ========================================================== */}
        <div className="border-t border-white/15 pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-white/75">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} Daily Afadiat (ڈیلی افادیت)</span>
            <span aria-hidden="true" className="text-white/35">|</span>
            <Link href="/contact" className="hover:text-white transition-colors">
              {t("contact")}
            </Link>
          </div>

          <div>
            <button
              onClick={scrollToTop}
              className="hover:text-white inline-flex items-center gap-1 text-xs text-white/85 transition-colors cursor-pointer"
            >
              <ArrowUp size={12} />
              <span>{t("backToTop")}</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
    </>
  );
}
