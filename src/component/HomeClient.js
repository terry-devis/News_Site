"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Clock,
  TrendingUp,
  ArrowRight,
  Play,
} from "lucide-react";

function extractYouTubeId(url) {
  if (!url) return null;
  const m = String(url).match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return m ? m[1] : null;
}

const BrandIcons = {
  facebook: (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
      <circle cx="12" cy="12" r="11" fill="#1877F2" />
      <path d="M13.5 21v-7.2h2.4l.4-2.8h-2.8V9.2c0-.8.2-1.4 1.4-1.4h1.5V5.3c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2H8.2v2.8h2.3V21h3z" fill="#FFFFFF" />
    </svg>
  ),
  youtube: (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.8z" fill="#FF0000" />
      <path d="M9.6 15.6V8.4l6.3 3.6-6.3 3.6z" fill="#FFFFFF" />
    </svg>
  ),
  x: (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
      <rect x="1" y="1" width="22" height="22" rx="5" fill="#111111" />
      <path d="M16.9 6h2.2l-4.8 5.5L20 19h-4.4l-3.4-4.5L8.2 19H6l5.1-5.9L5.6 6h4.5l3.1 4.1L16.9 6zm-.8 11.7h1.2L9.9 7.2H8.6l7.5 10.5z" fill="#FFFFFF" />
    </svg>
  ),
  instagram: (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
      <defs>
        <linearGradient id="igGrad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F58529" />
          <stop offset="50%" stopColor="#DD2A7B" />
          <stop offset="100%" stopColor="#515BD4" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="22" height="22" rx="6" fill="url(#igGrad)" />
      <rect x="5.5" y="5.5" width="13" height="13" rx="4" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3.1" fill="none" stroke="#FFFFFF" strokeWidth="1.8" />
      <circle cx="16.2" cy="7.8" r="1" fill="#FFFFFF" />
    </svg>
  ),
  whatsapp: (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
      <circle cx="12" cy="12" r="11" fill="#25D366" />
      <path d="M16.5 14.3c-.2-.1-1.3-.6-1.5-.7-.2-.1-.3-.1-.5.1-.1.2-.5.7-.7.8-.1.1-.3.2-.5.1-.2-.1-.9-.3-1.7-1.1-.6-.6-1.1-1.3-1.2-1.5-.1-.2 0-.3.1-.4l.4-.4c.1-.1.1-.2.2-.3.1-.1 0-.3 0-.4s-.5-1.2-.7-1.6c-.2-.4-.4-.4-.5-.4h-.4c-.2 0-.4.1-.6.3-.2.2-.8.7-.8 1.8s.8 2.1.9 2.3c.1.1 1.5 2.4 3.7 3.3.5.2.9.4 1.3.5.5.2 1 .1 1.4.1.4-.1 1.3-.5 1.5-1 .2-.5.2-.9.1-1-.1-.1-.2-.2-.4-.3z" fill="#FFFFFF" />
    </svg>
  ),
  tiktok: (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
      <rect x="1" y="1" width="22" height="22" rx="5" fill="#111111" />
      <path d="M13.2 5.5v8.2a2.6 2.6 0 1 1-1.9-2.5V8.9a5 5 0 1 0 4.2 4.9V9.6a6 6 0 0 0 3.3 1V8.3a3.7 3.7 0 0 1-3.3-2.8h-2.3z" fill="#FFFFFF" />
    </svg>
  ),
};
import Header from "@/component/Header";
import Footer from "@/component/Footer";
import AdSlot from "@/component/AdSlot";
import NewsletterBox from "@/component/NewsletterBox";
import NamazWidget from "@/component/widgets/NamazWidget";
import CurrencyWidget from "@/component/widgets/CurrencyWidget";
import WeatherWidget from "@/component/widgets/WeatherWidget";
import PollWidget from "@/component/widgets/PollWidget";
import MostReadWidget from "@/component/widgets/MostReadWidget";
import { useSiteLanguage } from "@/context/SiteLanguageContext";
import { getFallbackImageForStory } from "@/lib/mockImages";
import { ARTICLE_TYPE_BADGES } from "@/lib/articleMeta";

export default function HomeClient({
  articles = [],
  categories = [],
  breakingNews = [],
  videos = [],
  socialLinks = null,
  initialLang = null,
  breakingTickerEnabled = null,
}) {
  const { lang, isUrdu: ctxIsUrdu, isEnglish: ctxIsEnglish, dir: ctxDir, t, setLanguage } = useSiteLanguage();

  useEffect(() => {
    if (initialLang && (initialLang === "en" || initialLang === "ur")) {
      setLanguage(initialLang);
    }
  }, [initialLang, setLanguage]);

  const effectiveLang = initialLang || lang;
  const isEnglish = effectiveLang === "en" || (!initialLang && ctxIsEnglish);
  const isUrdu = !isEnglish;
  const dir = isUrdu ? "rtl" : "ltr";

  const getTitle = (story) => {
    if (!story) return "";
    return isEnglish ? story.title_en || story.title_ur : story.title_ur || story.title_en;
  };

  const getSummary = (story) => {
    if (!story) return "";
    if (isEnglish) {
      if (story.summary_en) return story.summary_en;
      if (story.content_en) {
        const m = story.content_en.match(/<!--excerpt:([\s\S]*?)-->/);
        if (m) return m[1].trim();
        const clean = story.content_en
          .replace(/<!--[\s\S]*?-->/g, "")
          .replace(/<[^>]+>/g, " ")
          .trim();
        if (clean) return clean.substring(0, 140) + "...";
      }
      return story.summary_ur || "";
    }
    return story.summary_ur || story.summary_en || "";
  };

  const getCatName = (cat) => {
    if (!cat) return isEnglish ? "News" : "خبر";
    return isEnglish ? cat.name_en || cat.name_ur || "News" : cat.name_ur || cat.name_en || "خبر";
  };

  const getAuthor = (story) => {
    if (!story) return "";
    return isEnglish
      ? story.author_name_en || "Editorial Board"
      : story.author_name || "ایڈیٹوریل بورڈ";
  };

  const storyHref = (story) =>
    isEnglish && story?.title_en
      ? `/en/story/${story?.slug || story?.id}`
      : `/story/${story?.slug || story?.id}`;

  // In English edition, only show articles that have an English version (title_en)
  // In Urdu edition, only show articles that have an Urdu version (title_ur)
  const visibleArticles = isEnglish
    ? articles.filter((a) => Boolean(a.title_en && a.title_en.trim()))
    : articles.filter((a) => Boolean(a.title_ur && a.title_ur.trim()));

  // 1. Hero + Live Stories (Prioritize Red Alert breaking first, then featured stories, rotating every 12s)
  const redAlertArticles = visibleArticles.filter(
    (a) => a.is_breaking && Number(a.meta?.breakingPriority || 1) === 1
  );
  const otherFeatured = visibleArticles.filter(
    (a) => a.is_featured && !redAlertArticles.some((r) => r.id === a.id)
  );
  const heroPool = [...redAlertArticles, ...otherFeatured];
  const heroCandidates = heroPool.length > 0 ? heroPool : visibleArticles[0] ? [visibleArticles[0]] : [];

  const [heroIndex, setHeroIndex] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);

  useEffect(() => {
    if (heroCandidates.length <= 1 || heroPaused) return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroCandidates.length);
    }, 12000);
    return () => clearInterval(timer);
  }, [heroCandidates.length, heroPaused]);

  const safeHeroIndex = heroCandidates.length > 0 ? heroIndex % heroCandidates.length : 0;
  const leadStory = heroCandidates[safeHeroIndex] || visibleArticles[0] || null;
  const nonLeadArticles = visibleArticles.filter((a) => a.id !== leadStory?.id);
  const remainingHeroPool = heroCandidates.filter((a) => a.id !== leadStory?.id);
  const nonFeatured = nonLeadArticles.filter((a) => !remainingHeroPool.some((h) => h.id === a.id));
  const secondaryStories = [...remainingHeroPool, ...nonFeatured].slice(0, 4);
  const usedIds = new Set([leadStory?.id, ...secondaryStories.map((s) => s.id)].filter(Boolean));
  const remainingLive = visibleArticles.filter((a) => !usedIds.has(a.id));
  const liveFeatured = remainingLive[0] || visibleArticles[0] || null;
  const liveTimeline = remainingLive.slice(1, 7);

  // 2. Strict Category Story Selector — only show articles belonging to that category
  const getCategoryStories = (slugs, count = 5) => {
    const slugList = Array.isArray(slugs) ? slugs : [slugs];
    const matched = visibleArticles.filter((a) =>
      slugList.includes((a.category?.slug || a.category_slug || "").toLowerCase())
    );
    return matched.slice(0, count);
  };

  const businessStories = getCategoryStories(["business"], 6);
  const pakStories = getCategoryStories(["pakistan", "national"], 4);
  const worldStories = getCategoryStories(["world", "international"], 4);
  const sportsStories = getCategoryStories(["sports"], 7);
  const entStories = getCategoryStories(["entertainment", "showbiz"], 4);
  const techStories = getCategoryStories(["tech", "science-technology"], 4);
  const healthStories = getCategoryStories(["health", "health-science"], 5);
  const crimeStories = getCategoryStories(["crime"], 4);
  const lifestyleStories = getCategoryStories(["lifestyle"], 4);
  const weirdStories = getCategoryStories(["weird", "odd-news"], 5);
  const opinionMatched = visibleArticles.filter(
    (a) =>
      ["opinion", "blogs"].includes((a.category?.slug || a.category_slug || "").toLowerCase()) ||
      ["column", "blog"].includes(a.meta?.articleType)
  );
  const opinionStories = opinionMatched.slice(0, 6);
  const factCheckStories = visibleArticles
    .filter(
      (a) =>
        a.meta?.articleType === "fact_check" ||
        ["factcheck", "fact-check"].includes((a.category?.slug || a.category_slug || "").toLowerCase())
    )
    .slice(0, 5);
  const latestSidebar = visibleArticles.slice(0, 7);

  // Reusable Section Header
  const SectionHeader = ({ titleUr, titleEn, href }) => (
    <div className="border-b-2 border-emerald-700 pb-1.5 mb-4 flex items-center justify-between">
      <h2
        className={`text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2 ${
          isUrdu ? "urdu-headline" : "font-sans"
        }`}
      >
        <span className="w-1.5 h-5 bg-emerald-700 inline-block" />
        <span>{isUrdu ? titleUr : titleEn}</span>
      </h2>
      <Link
        href={href}
        className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1 font-sans"
      >
        <span>{t("viewMore")}</span>
        <ArrowRight size={13} className="rtl:rotate-180" />
      </Link>
    </div>
  );

  // Reusable 12-Col Split Section (7:5 or reversed 5:7 for Business, Health, Odd News)
  const SplitSection = ({ titleUr, titleEn, href, stories, reversed = false }) => {
    const lead = stories[0];
    const list = stories.slice(1, 5);
    if (!lead) return null;

    return (
      <section className="u-block" aria-label={isUrdu ? titleUr : titleEn}>
        <SectionHeader titleUr={titleUr} titleEn={titleEn} href={href} />
        <div className="grid gap-4 lg:grid-cols-12 lg:gap-5">
          <article
            className={`group flex flex-col justify-between ${
              reversed
                ? "order-first lg:col-span-7 lg:order-2 lg:border-s lg:border-[#dcd8cd] lg:ps-5"
                : "order-first lg:col-span-7 lg:order-1 lg:border-e lg:border-[#dcd8cd] lg:pe-5"
            }`}
          >
            <div>
              <Link href={storyHref(lead)} className="block">
                <div className="relative w-full aspect-[16/10] overflow-hidden border border-[#dcd8cd] bg-[#dcd8cd]/40 mb-3 shadow-xs">
                  <Image
                    src={getFallbackImageForStory(lead)}
                    alt={getTitle(lead)}
                    fill
                    className="object-cover group-hover:scale-102 transition duration-500"
                  />
                </div>
                <h3
                  className={`text-lg sm:text-xl font-bold text-gray-950 group-hover:text-emerald-700 transition leading-snug mb-2 ${
                    isUrdu ? "urdu-headline" : "font-sans"
                  }`}
                >
                  {getTitle(lead)}
                </h3>
              </Link>
              <p
                className={`text-xs sm:text-sm text-gray-600 line-clamp-2 ${
                  isUrdu ? "urdu-body leading-relaxed" : "font-sans leading-normal"
                }`}
              >
                {getSummary(lead)}
              </p>
            </div>
            <div className="mt-2 pt-2 border-t border-[#dcd8cd]/60 flex items-center justify-between text-[11px] text-gray-500 font-sans">
              <span>{getAuthor(lead)}</span>
              <span suppressHydrationWarning>
                {new Date(lead.created_at).toLocaleDateString(isUrdu ? "ur-PK" : "en-US", {
                  day: "numeric",
                  month: "short",
                  timeZone: "Asia/Karachi",
                })}
              </span>
            </div>
          </article>

          <div
            className={`content-start divide-y divide-[#dcd8cd] ${
              reversed ? "lg:col-span-5 lg:order-1" : "lg:col-span-5 lg:order-2"
            }`}
          >
            {list.map((st) => (
              <article key={st.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start gap-3 group">
                <div className="relative w-20 h-16 shrink-0 overflow-hidden border border-[#dcd8cd] bg-[#dcd8cd]/40">
                  <Image
                    src={getFallbackImageForStory(st)}
                    alt={getTitle(st)}
                    fill
                    sizes="80px"
                    className="object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={storyHref(st)}>
                    <h3
                      className={`text-[13px] font-bold text-gray-800 group-hover:text-emerald-700 transition leading-snug line-clamp-2 ${
                        isUrdu ? "urdu-headline" : "font-sans"
                      }`}
                    >
                      {getTitle(st)}
                    </h3>
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // Reusable Paired Section Card (Pakistan/World, Ent/Tech, Crime/Lifestyle)
  const PairedCard = ({ titleUr, titleEn, href, stories }) => {
    const lead = stories[0];
    const subList = stories.slice(1, 4);
    if (!lead) return null;

    return (
      <section className="border border-[#dcd8cd] p-4 bg-[#efeee9]/70 flex flex-col justify-between shadow-xs h-full">
        <div>
          <SectionHeader titleUr={titleUr} titleEn={titleEn} href={href} />
          <article className="group mb-3 pb-3 border-b border-[#dcd8cd]">
            <Link href={storyHref(lead)} className="block">
              <div className="relative w-full aspect-[16/10] overflow-hidden border border-[#dcd8cd] bg-[#dcd8cd]/40 mb-2.5">
                <Image
                  src={getFallbackImageForStory(lead)}
                  alt={getTitle(lead)}
                  fill
                  className="object-cover group-hover:scale-105 transition duration-300"
                />
              </div>
              <h3
                className={`text-base font-bold text-gray-900 group-hover:text-emerald-700 transition leading-snug line-clamp-2 ${
                  isUrdu ? "urdu-headline" : "font-sans"
                }`}
              >
                {getTitle(lead)}
              </h3>
            </Link>
          </article>
          <ul className="divide-y divide-[#dcd8cd]/80">
            {subList.map((st) => (
              <li key={st.id} className="py-2 last:pb-0">
                <Link
                  href={storyHref(st)}
                  className={`block text-[13px] font-bold text-gray-800 hover:text-emerald-700 transition leading-snug line-clamp-2 ${
                    isUrdu ? "urdu-headline" : "font-sans"
                  }`}
                >
                  {getTitle(st)}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  };

  const sportsCenter = sportsStories[0];
  const sportsLeft = sportsStories.slice(1, 4);
  const sportsRight = sportsStories.slice(4, 7);

  const mainVideo = videos[0] || null;
  const sideVideos = videos.slice(1, 5);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const activeVideo = selectedVideo || mainVideo;
  const activeYtId = extractYouTubeId(activeVideo?.video_url);

  return (
    <div className="min-h-screen text-gray-900 bg-[#f7f6f3]" dir={dir}>
      {/* 1. SITE HEADER */}
      <Header
        categories={categories}
        breakingNews={breakingNews}
        initialTickerEnabled={breakingTickerEnabled}
      />

      {/* 2. MAIN CONTENT AREA */}
      <main className="u-shell py-4">
        {/* TOP LEADERBOARD AD (Matches scrapped-pulic_site position above Hero) */}
        <AdSlot slotKey="home-leaderboard" className="mb-5 max-w-5xl mx-auto" />

        {/* HERO SECTION */}
        {leadStory && (
          <section
            onMouseEnter={() => setHeroPaused(true)}
            onMouseLeave={() => setHeroPaused(false)}
            className="bg-[#efeee9] border border-[#dcd8cd] rounded-none p-4 sm:p-5 mb-6 shadow-xs"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Lead Featured Story (7 Cols) */}
              <article className="lg:col-span-7 flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="bg-emerald-800 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-none uppercase font-sans tracking-wide">
                      {getCatName(leadStory.category)}
                    </span>
                    {leadStory.is_breaking && (
                      <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-none flex items-center gap-1 font-sans animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                        <span>{isUrdu ? "اہم خبر" : "BREAKING"}</span>
                      </span>
                    )}
                  </div>

                  <Link href={storyHref(leadStory)} className="block group-hover:text-emerald-800 transition">
                    <h1
                      className={`text-2xl sm:text-3xl lg:text-4xl font-black text-gray-950 tracking-tight leading-snug sm:leading-tight mb-3 ${
                        isUrdu ? "urdu-headline" : "font-sans font-extrabold"
                      }`}
                    >
                      {getTitle(leadStory)}
                    </h1>
                  </Link>

                  <div className="relative w-full aspect-[16/10] overflow-hidden rounded-none border border-[#dcd8cd] bg-[#dcd8cd]/40 mb-3.5 shadow-xs">
                    <Image
                      src={getFallbackImageForStory(leadStory)}
                      alt={getTitle(leadStory)}
                      fill
                      className="object-cover group-hover:scale-102 transition duration-500"
                      priority
                    />
                    {heroCandidates.length > 1 && (
                      <div className="absolute bottom-2.5 end-2.5 z-10 flex items-center gap-1.5 bg-black/55 px-2 py-1">
                        {heroCandidates.map((hc, idx) => (
                          <button
                            key={hc.id}
                            type="button"
                            onClick={() => setHeroIndex(idx)}
                            aria-label={`Featured ${idx + 1}`}
                            className="min-w-[24px] min-h-[24px] flex items-center justify-center cursor-pointer"
                          >
                            <span
                              className={`h-2 rounded-full transition-all block ${
                                idx === safeHeroIndex ? "w-5 bg-white" : "w-2 bg-white/60 hover:bg-white/90"
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <p
                    className={`text-gray-700 text-sm sm:text-[15px] line-clamp-3 mb-3.5 ${
                      isUrdu ? "urdu-body leading-relaxed text-justify" : "font-sans leading-normal"
                    }`}
                  >
                    {getSummary(leadStory)}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-600 font-sans border-t border-[#dcd8cd] pt-2.5 mt-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800">{getAuthor(leadStory)}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-gray-600" suppressHydrationWarning>
                      <Clock size={12} />
                      {new Date(leadStory.created_at).toLocaleDateString(isUrdu ? "ur-PK" : "en-US", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        timeZone: "Asia/Karachi",
                      })}
                    </span>
                  </div>

                  <Link
                    href={storyHref(leadStory)}
                    className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 group-hover:underline"
                  >
                    <span>{isUrdu ? "مکمل تفصیل پڑھیں" : "Read Full Story"}</span>
                    <ArrowRight size={13} className="rtl:rotate-180" />
                  </Link>
                </div>
              </article>

              {/* Secondary Top Stories (5 Cols) */}
              <div className="lg:col-span-5 flex flex-col divide-y divide-[#dcd8cd]">
                <div className="pb-2 mb-1 flex items-center justify-between border-b-2 border-emerald-600">
                  <h2 className="text-base font-bold text-gray-900 flex items-center gap-1.5 font-sans">
                    <TrendingUp size={16} className="text-emerald-600" />
                    <span>{t("trendingNews")}</span>
                  </h2>
                  <span className="text-xs text-gray-600 font-sans">{t("latestUpdates")}</span>
                </div>

                {secondaryStories.map((story) => (
                  <article key={story.id} className="py-2.5 flex items-start gap-3 group">
                    <div className="relative w-24 sm:w-28 h-20 shrink-0 overflow-hidden rounded-none border border-[#dcd8cd] bg-[#dcd8cd]/40 shadow-2xs">
                      <Image
                        src={getFallbackImageForStory(story)}
                        alt={getTitle(story)}
                        fill
                        sizes="(max-width: 640px) 96px, 112px"
                        className="object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                    <div className="flex-1">
                      <span className="text-[11px] text-emerald-700 font-bold font-sans">
                        {getCatName(story.category)}
                      </span>
                      <Link href={storyHref(story)}>
                        <h3
                          className={`text-[14px] font-bold text-gray-800 group-hover:text-emerald-600 transition leading-snug line-clamp-2 ${
                            isUrdu ? "urdu-headline" : "font-sans"
                          }`}
                        >
                          {getTitle(story)}
                        </h3>
                      </Link>
                      <span className="text-[11px] text-gray-600 font-sans mt-0.5 block" suppressHydrationWarning>
                        {new Date(story.created_at).toLocaleTimeString(isUrdu ? "ur-PK" : "en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          timeZone: "Asia/Karachi",
                        })}
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* LIVE UPDATES 2-COLUMN TIMELINE BOX */}
        {liveFeatured && (
          <section
            className="bg-[#efeee9] border border-[#dcd8cd] rounded-none mb-6 shadow-xs"
            aria-label={t("liveUpdates")}
          >
            <div className="border-b border-[#dcd8cd] flex items-center gap-2.5 px-4 py-2.5 sm:px-5">
              <span className="bg-red-600 inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold tracking-wide text-white uppercase font-sans">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75 motion-reduce:animate-none" />
                  <span className="relative inline-flex size-2 rounded-full bg-white" />
                </span>
                {t("liveUpdates")}
              </span>
              <span className="flex-1" />
              <Link
                href="/live"
                className="text-xs font-semibold text-gray-500 hover:text-emerald-700 font-sans flex items-center gap-1 transition"
              >
                {t("viewMore")}
              </Link>
            </div>

            <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-2 lg:gap-6">
              <article className="group order-first block self-start">
                <Link href={storyHref(liveFeatured)} className="block">
                  <div className="relative w-full aspect-[16/10] overflow-hidden border border-[#dcd8cd] bg-[#dcd8cd]/40 mb-3 shadow-xs">
                    <Image
                      src={getFallbackImageForStory(liveFeatured)}
                      alt={getTitle(liveFeatured)}
                      fill
                      className="object-cover group-hover:scale-102 transition duration-500"
                    />
                  </div>
                </Link>
                <Link href={storyHref(liveFeatured)}>
                  <h3
                    className={`text-base sm:text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition leading-snug mb-1.5 ${
                      isUrdu ? "urdu-headline" : "font-sans"
                    }`}
                  >
                    {getTitle(liveFeatured)}
                  </h3>
                </Link>
                <p
                  className={`text-xs text-gray-600 line-clamp-2 ${
                    isUrdu ? "urdu-body leading-relaxed" : "font-sans leading-normal"
                  }`}
                >
                  {getSummary(liveFeatured)}
                </p>
              </article>

              <div className="flex min-w-0 flex-col">
                <div className="mb-2">
                  <span className="text-[11px] text-gray-400 font-sans block mb-1" suppressHydrationWarning>
                    {isUrdu ? "اپ ڈیٹ" : "Live Feed"} •{" "}
                    {new Date(liveFeatured.created_at).toLocaleDateString(isUrdu ? "ur-PK" : "en-US", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      timeZone: "Asia/Karachi",
                    })}
                  </span>
                </div>

                <ol className="relative max-h-[19rem] overflow-y-auto border-t border-[#dcd8cd] pt-2 space-y-3.5 scrollbar-thin">
                  <span className="bg-[#dcd8cd] absolute inset-y-2 start-[7px] w-px" aria-hidden="true" />
                  {liveTimeline.map((item) => (
                    <li key={item.id} className="relative ps-5 group">
                      <span
                        className="bg-red-600 ring-4 ring-[#efeee9] absolute start-1 top-2 size-2 rounded-full"
                        aria-hidden="true"
                      />
                      <time className="text-[10px] text-gray-400 font-sans block mb-0.5" suppressHydrationWarning>
                        {new Date(item.created_at).toLocaleTimeString(isUrdu ? "ur-PK" : "en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
                          timeZone: "Asia/Karachi",
                        })}
                      </time>
                      <Link href={storyHref(item)}>
                        <h4
                          className={`text-xs sm:text-[13px] font-bold text-gray-800 group-hover:text-emerald-700 transition leading-snug line-clamp-2 ${
                            isUrdu ? "urdu-headline" : "font-sans"
                          }`}
                        >
                          {getTitle(item)}
                        </h4>
                      </Link>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </section>
        )}

        {/* 12-COLUMN EDITORIAL & SIDEBAR GRID (Exact scrapped-pulic_site sequence) */}
        <section className="my-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* MAIN EDITORIAL COLUMN (8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* 1. BUSINESS (بزنس) */}
            <SplitSection
              titleUr="بزنس"
              titleEn="Business"
              href="/category/business"
              stories={businessStories}
            />

            {/* 2. PAKISTAN + WORLD (پاکستان + انٹرنیشنل) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <PairedCard
                titleUr="پاکستان"
                titleEn="Pakistan"
                href="/category/pakistan"
                stories={pakStories}
              />
              <PairedCard
                titleUr="انٹرنیشنل"
                titleEn="World"
                href="/category/world"
                stories={worldStories}
              />
            </div>

            {/* IN-FEED AD #1 */}
            <AdSlot slotKey="home-infeed-1" className="my-2" />

            {/* 3. SPORTS (کھیل) — 3-Column Newspaper Showcase */}
            {sportsCenter && (
              <section className="u-block" aria-label={isUrdu ? "کھیل" : "Sports"}>
                <SectionHeader titleUr="کھیل" titleEn="Sports" href="/category/sports" />
                <div className="grid gap-4 lg:grid-cols-12 lg:gap-3">
                  {/* Left Wing (3 cols, with thumbnails + metadata matching Daily Insaf) */}
                  <div className="content-start space-y-4 lg:order-1 lg:col-span-3">
                    {sportsLeft.map((st) => (
                      <article key={st.id} className="group">
                        <Link href={storyHref(st)} className="block space-y-1.5">
                          <div className="relative w-full aspect-[16/10] overflow-hidden border border-[#dcd8cd] bg-[#dcd8cd]/40">
                            <Image
                              src={getFallbackImageForStory(st)}
                              alt={getTitle(st)}
                              fill
                              className="object-cover group-hover:scale-105 transition duration-300"
                            />
                          </div>
                          <h3
                            className={`text-[13px] font-bold text-gray-900 group-hover:text-emerald-700 transition leading-snug line-clamp-2 ${
                              isUrdu ? "urdu-headline" : "font-sans"
                            }`}
                          >
                            {getTitle(st)}
                          </h3>
                          <p className="text-[11px] font-sans text-gray-500 flex items-center gap-1.5">
                            <span className="font-semibold text-[#184e2d]">{getCatName(st.category)}</span>
                            <span>•</span>
                            <span suppressHydrationWarning>
                              {new Date(st.created_at).toLocaleDateString(isUrdu ? "ur-PK" : "en-GB", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                                timeZone: "Asia/Karachi",
                              })}
                            </span>
                          </p>
                        </Link>
                      </article>
                    ))}
                  </div>

                  {/* Center Lead (6 cols with border-x) */}
                  <article className="order-first lg:order-2 lg:col-span-6 lg:border-x lg:border-[#dcd8cd] lg:px-4 group">
                    <Link href={storyHref(sportsCenter)} className="block">
                      <div className="relative w-full aspect-[16/10] overflow-hidden border border-[#dcd8cd] bg-[#dcd8cd]/40 mb-2.5">
                        <Image
                          src={getFallbackImageForStory(sportsCenter)}
                          alt={getTitle(sportsCenter)}
                          fill
                          className="object-cover group-hover:scale-102 transition duration-500"
                        />
                      </div>
                      <h3
                        className={`text-lg sm:text-xl font-bold text-gray-950 group-hover:text-emerald-700 transition leading-snug mb-1.5 ${
                          isUrdu ? "urdu-headline" : "font-sans"
                        }`}
                      >
                        {getTitle(sportsCenter)}
                      </h3>
                    </Link>
                    <p
                      className={`text-xs sm:text-[13px] text-gray-600 line-clamp-2 mb-2 ${
                        isUrdu ? "urdu-body leading-relaxed" : "font-sans"
                      }`}
                    >
                      {getSummary(sportsCenter)}
                    </p>
                    <p className="text-[11px] font-sans text-gray-500 flex items-center gap-1.5">
                      <span className="font-semibold text-[#184e2d]">{getCatName(sportsCenter.category)}</span>
                      <span>•</span>
                      <span suppressHydrationWarning>
                        {new Date(sportsCenter.created_at).toLocaleDateString(isUrdu ? "ur-PK" : "en-GB", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          timeZone: "Asia/Karachi",
                        })}
                      </span>
                    </p>
                  </article>

                  {/* Right Wing (3 cols, with thumbnails + metadata matching Daily Insaf) */}
                  <div className="content-start space-y-4 lg:order-3 lg:col-span-3">
                    {sportsRight.map((st) => (
                      <article key={st.id} className="group">
                        <Link href={storyHref(st)} className="block space-y-1.5">
                          <div className="relative w-full aspect-[16/10] overflow-hidden border border-[#dcd8cd] bg-[#dcd8cd]/40">
                            <Image
                              src={getFallbackImageForStory(st)}
                              alt={getTitle(st)}
                              fill
                              className="object-cover group-hover:scale-105 transition duration-300"
                            />
                          </div>
                          <h3
                            className={`text-[13px] font-bold text-gray-900 group-hover:text-emerald-700 transition leading-snug line-clamp-2 ${
                              isUrdu ? "urdu-headline" : "font-sans"
                            }`}
                          >
                            {getTitle(st)}
                          </h3>
                          <p className="text-[11px] font-sans text-gray-500 flex items-center gap-1.5">
                            <span className="font-semibold text-[#184e2d]">{getCatName(st.category)}</span>
                            <span>•</span>
                            <span suppressHydrationWarning>
                              {new Date(st.created_at).toLocaleDateString(isUrdu ? "ur-PK" : "en-GB", {
                                day: "numeric",
                                month: "long",
                                year: "numeric",
                                timeZone: "Asia/Karachi",
                              })}
                            </span>
                          </p>
                        </Link>
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* 4. ENTERTAINMENT + SCIENCE & TECH */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <PairedCard
                titleUr="انٹرٹینمنٹ"
                titleEn="Entertainment"
                href="/category/entertainment"
                stories={entStories}
              />
              <PairedCard
                titleUr="سائنس و ٹیکنالوجی"
                titleEn="Science & Tech"
                href="/category/tech"
                stories={techStories}
              />
            </div>

            {/* 5. HEALTH (صحت) — Reversed 12-Col Split */}
            <SplitSection
              titleUr="صحت"
              titleEn="Health"
              href="/category/health"
              stories={healthStories}
              reversed
            />

            {/* IN-FEED AD #2 */}
            <AdSlot slotKey="home-infeed-2" className="my-2" />

            {/* 6. CRIME + LIFESTYLE */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <PairedCard
                titleUr="جرائم"
                titleEn="Crime"
                href="/category/crime"
                stories={crimeStories}
              />
              <PairedCard
                titleUr="لائف اسٹائل"
                titleEn="Lifestyle"
                href="/category/lifestyle"
                stories={lifestyleStories}
              />
            </div>

            {/* 7. WEIRD / ODD NEWS (دلچسپ و عجیب) */}
            <SplitSection
              titleUr="دلچسپ و عجیب"
              titleEn="Odd News"
              href="/category/weird"
              stories={weirdStories}
            />

            {/* 7B. FACT CHECK (فیکٹ چیک) — shown when Fact Check articles exist */}
            {factCheckStories.length > 0 && (
              <SplitSection
                titleUr="فیکٹ چیک"
                titleEn="Fact Check"
                href="/category/factcheck"
                stories={factCheckStories}
                reversed
              />
            )}

            {/* IN-FEED AD #3 */}
            <AdSlot slotKey="home-infeed-3" className="my-2" />

            {/* 8. VIDEOS (ویڈیوز) — Dark Editorial Showcase + Interactive YouTube Embed */}
            <section
              className="bg-[#121614] text-white p-4 sm:p-5 overflow-hidden border border-[#262b28] shadow-sm"
              aria-label={isUrdu ? "ویڈیوز" : "Videos"}
            >
              <div className="mb-4 flex items-end gap-3 border-b border-white/15 pb-2">
                <Link href="/video" className="transition-colors hover:text-[#57d98a]">
                  <h2 className={`text-lg sm:text-xl leading-tight font-bold ${isUrdu ? "urdu-headline" : "font-sans"}`}>
                    {isUrdu ? "ویڈیوز" : "Videos"}
                  </h2>
                </Link>
                <span className="flex-1" />
                <Link
                  href="/video"
                  className="text-xs font-semibold tracking-wide text-white/75 uppercase transition-colors hover:text-[#57d98a] font-sans"
                >
                  {t("viewMore")}
                </Link>
              </div>

              <div className="grid gap-5 lg:grid-cols-12">
                <div className="lg:col-span-8">
                  {activeVideo ? (
                    <div>
                      <div className="relative aspect-video w-full overflow-hidden bg-black border border-white/10">
                        {isPlayingVideo && activeYtId ? (
                          <iframe
                            src={`https://www.youtube.com/embed/${activeYtId}?autoplay=1&rel=0`}
                            title={isUrdu ? activeVideo.title_ur : activeVideo.title_en || activeVideo.title_ur}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full border-0"
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              if (activeYtId) {
                                setIsPlayingVideo(true);
                              } else if (activeVideo.video_url) {
                                window.open(activeVideo.video_url, "_blank", "noopener,noreferrer");
                              }
                            }}
                            className="group relative block w-full h-full cursor-pointer text-left"
                          >
                            <img
                              src={
                                activeVideo.thumbnail_url ||
                                activeVideo.cover_image ||
                                (activeYtId ? `https://img.youtube.com/vi/${activeYtId}/hqdefault.jpg` : "/logo.webp")
                              }
                              alt={isUrdu ? activeVideo.title_ur : activeVideo.title_en || activeVideo.title_ur}
                              className="h-full w-full object-cover opacity-90 group-hover:opacity-100 transition"
                            />
                            <span className="absolute inset-0 grid place-items-center bg-black/25 transition-colors group-hover:bg-black/10">
                              <span className="grid size-16 place-items-center rounded-full bg-[#e01e26]/90 text-white shadow-xl group-hover:scale-105 transition">
                                <Play size={26} className="fill-white ms-0.5" />
                              </span>
                            </span>
                          </button>
                        )}
                      </div>
                      <h3
                        className={`mt-3 text-lg sm:text-xl font-bold leading-snug line-clamp-2 hover:text-[#57d98a] transition ${
                          isUrdu ? "urdu-headline" : "font-sans"
                        }`}
                      >
                        {isUrdu ? activeVideo.title_ur : activeVideo.title_en || activeVideo.title_ur}
                      </h3>
                    </div>
                  ) : (
                    <div className="aspect-video border border-white/15 bg-black/30 flex items-center justify-center text-xs text-white/60">
                      {isUrdu ? "ویڈیوز شامل کرنے کے لیے ایڈمن ویڈیو سیکشن استعمال کریں" : "Add videos in Admin → Videos"}
                    </div>
                  )}
                </div>

                <div className="lg:col-span-4">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 lg:max-h-[22rem] lg:overflow-y-auto lg:pe-1">
                    {(videos.length > 1 ? videos.slice(0, 6) : sideVideos).map((v) => {
                      const ytId = extractYouTubeId(v.video_url);
                      const thumb =
                        v.thumbnail_url ||
                        v.cover_image ||
                        (ytId ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` : "/logo.webp");
                      const isCurrent = activeVideo?.id === v.id;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          onClick={() => {
                            setSelectedVideo(v);
                            setIsPlayingVideo(Boolean(ytId));
                          }}
                          className={`group flex items-start gap-3 text-start cursor-pointer p-1.5 rounded transition ${
                            isCurrent ? "bg-white/10" : "hover:bg-white/5"
                          }`}
                        >
                          <div className="relative aspect-video w-[7.5rem] shrink-0 overflow-hidden bg-black/60 border border-white/10">
                            <img src={thumb} alt={v.title_ur} className="h-full w-full object-cover" loading="lazy" />
                            <span className="absolute bottom-1 end-1 grid size-5 place-items-center rounded-full bg-black/75 text-white">
                              <Play size={10} className="fill-white" />
                            </span>
                          </div>
                          <h4
                            className={`flex-1 text-sm font-bold leading-snug line-clamp-3 transition-colors group-hover:text-[#57d98a] ${
                              isUrdu ? "urdu-headline" : "font-sans"
                            }`}
                          >
                            {isUrdu ? v.title_ur : v.title_en || v.title_ur}
                          </h4>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* 9. OPINION & COLUMNS (رائے و کالم) */}
            {opinionStories.length > 0 && (
              <section className="u-block" aria-label={isUrdu ? "رائے و کالم" : "Opinion & Columns"}>
                <SectionHeader titleUr="رائے و کالم" titleEn="Opinion & Columns" href="/category/opinion" />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {opinionStories.slice(0, 6).map((op) => (
                    <article
                      key={op.id}
                      className="border border-[#dcd8cd] bg-[#efeee9]/70 p-3.5 hover:border-emerald-700 transition group"
                    >
                      <span className="text-[11px] font-bold text-emerald-800 block mb-1">
                        {getAuthor(op)}
                      </span>
                      <Link href={storyHref(op)}>
                        <h3
                          className={`text-sm font-bold text-gray-900 group-hover:text-emerald-700 leading-snug line-clamp-2 ${
                            isUrdu ? "urdu-headline" : "font-sans"
                          }`}
                        >
                          {getTitle(op)}
                        </h3>
                      </Link>
                    </article>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* RIGHT / END SIDEBAR (4 Cols — full height so sticky ad works!) */}
          <aside className="lg:col-span-4 space-y-5">
            {/* 1. تازہ ترین خبریں (Latest News) */}
            <section className="border border-[#dcd8cd] bg-white flex flex-col overflow-hidden shadow-xs">
              <header className="border-b border-[#dcd8cd] px-4 py-2.5 bg-[#efeee9] flex items-center justify-between">
                <h2 className={`text-sm font-bold text-gray-900 ${isUrdu ? "urdu-headline" : "font-sans"}`}>
                  {isUrdu ? "تازہ ترین خبریں" : "Latest News"}
                </h2>
                <Link href="/live" className="text-[11px] font-bold text-emerald-800 hover:underline font-sans">
                  {t("viewMore")}
                </Link>
              </header>
              <ul className="divide-y divide-[#dcd8cd] px-4 py-1">
                {latestSidebar.map((st) => (
                  <li key={st.id} className="py-2.5">
                    <Link
                      href={storyHref(st)}
                      className={`block text-[13px] font-bold text-gray-800 hover:text-emerald-700 leading-snug line-clamp-2 ${
                        isUrdu ? "urdu-headline" : "font-sans"
                      }`}
                    >
                      {getTitle(st)}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            {/* 2. زیادہ پڑھی گئیں (Most Read) */}
            <MostReadWidget articles={articles} />

            {/* 3. رائے (Opinion Rail) */}
            {opinionStories.length > 0 && (
              <section className="border border-[#dcd8cd] bg-[#efeee9] overflow-hidden shadow-xs">
                <header className="border-b border-[#dcd8cd] px-4 py-2.5 flex items-center justify-between">
                  <h2 className={`text-sm font-bold text-gray-900 ${isUrdu ? "urdu-headline" : "font-sans"}`}>
                    {isUrdu ? "رائے" : "Opinion"}
                  </h2>
                  <Link href="/category/opinion" className="text-[11px] font-bold text-emerald-800 hover:underline font-sans">
                    {t("viewMore")}
                  </Link>
                </header>
                <ul className="divide-y divide-[#dcd8cd] px-4 py-1">
                  {opinionStories.slice(0, 5).map((op) => (
                    <li key={op.id} className="py-2.5">
                      <Link
                        href={storyHref(op)}
                        className={`block text-[13px] font-bold text-gray-900 hover:text-emerald-700 leading-snug line-clamp-2 ${
                          isUrdu ? "urdu-headline" : "font-sans"
                        }`}
                      >
                        {getTitle(op)}
                      </Link>
                      <span className="text-[11px] text-gray-500 block mt-0.5">{getAuthor(op)}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* 4. Reader Poll Widget */}
            <PollWidget />

            {/* 5. Sidebar MPU Ad (300x250) */}
            <AdSlot slotKey="home-mpu" />

            {/* 6. Namaz, Currency, Weather Widgets */}
            <NamazWidget />
            <CurrencyWidget />
            <WeatherWidget />

            {/* 7. ہمیں فالو کریں (Follow Us) */}
            <section className="border border-[#dcd8cd] bg-white p-4 shadow-xs">
              <h2 className={`text-sm font-bold text-gray-900 border-b border-[#dcd8cd] pb-2 mb-3 ${isUrdu ? "urdu-headline" : "font-sans"}`}>
                {isUrdu ? "ہمیں فالو کریں" : "Follow Us"}
              </h2>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={socialLinks?.facebook || "https://facebook.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 border border-[#dcd8cd] bg-[#f7f6f3]/60 hover:bg-white text-xs font-bold text-gray-800 hover:border-[#1877F2] transition"
                >
                  {BrandIcons.facebook}
                  <span>Facebook</span>
                </a>
                <a
                  href={socialLinks?.youtube || "https://youtube.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 border border-[#dcd8cd] bg-[#f7f6f3]/60 hover:bg-white text-xs font-bold text-gray-800 hover:border-[#FF0000] transition"
                >
                  {BrandIcons.youtube}
                  <span>YouTube</span>
                </a>
                <a
                  href={socialLinks?.instagram || "https://instagram.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 border border-[#dcd8cd] bg-[#f7f6f3]/60 hover:bg-white text-xs font-bold text-gray-800 hover:border-[#DD2A7B] transition"
                >
                  {BrandIcons.instagram}
                  <span>Instagram</span>
                </a>
                <a
                  href={socialLinks?.whatsapp || "https://whatsapp.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 border border-[#dcd8cd] bg-[#f7f6f3]/60 hover:bg-white text-xs font-bold text-gray-800 hover:border-[#25D366] transition"
                >
                  {BrandIcons.whatsapp}
                  <span>WhatsApp</span>
                </a>
                <a
                  href={socialLinks?.twitter || "https://x.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 border border-[#dcd8cd] bg-[#f7f6f3]/60 hover:bg-white text-xs font-bold text-gray-800 hover:border-black transition"
                >
                  {BrandIcons.x}
                  <span>X / Twitter</span>
                </a>
                <a
                  href={socialLinks?.tiktok || "https://tiktok.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-2 border border-[#dcd8cd] bg-[#f7f6f3]/60 hover:bg-white text-xs font-bold text-gray-800 hover:border-black transition"
                >
                  {BrandIcons.tiktok}
                  <span>TikTok</span>
                </a>
              </div>
            </section>

            {/* 8. Sticky Tall Sidebar Ad (300x600) */}
            <AdSlot slotKey="home-sidebar" className="lg:sticky lg:top-24" />
          </aside>
        </section>

        {/* COMPACT NEWSLETTER STRIP */}
        <section className="my-6 py-4 px-5 bg-[#121614] border border-[#262b28] rounded-none text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm font-sans">
          <div className="text-center sm:text-start">
            <h3 className={`text-sm sm:text-base font-bold text-white ${isUrdu ? "urdu-headline" : "font-sans"}`}>
              {t("newsletterTitle")}
            </h3>
            <p className="text-gray-300 text-xs mt-0.5">{t("newsletterSubtitle")}</p>
          </div>
          <div className="w-full sm:w-auto sm:min-w-[340px]">
            <NewsletterBox variant="inline" />
          </div>
        </section>
      </main>

      {/* SITE FOOTER */}
      <Footer categories={categories} />
    </div>
  );
}
