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
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.5 1.6-1.5h1.6V4.9c-.3 0-1.3-.1-2.4-.1-2.4 0-4 1.4-4 4.1V11H7.7v3h2.6v8h3.2z" />
    </svg>
  ),
  youtube: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z" />
    </svg>
  ),
  x: (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.9 2H22l-6.8 7.8L23 22h-6.1l-4.8-6.3L6.6 22H3.5l7.3-8.3L1 2h6.2l4.3 5.7L18.9 2zm-1.1 18h1.7L6.3 3.9H4.5L17.8 20z" />
    </svg>
  ),
  instagram: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  ),
  whatsapp: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.81 14.12c-.24.68-1.42 1.3-1.97 1.38-.51.07-1.15.1-1.85-.12-.43-.14-.98-.32-1.69-.63-2.97-1.28-4.91-4.29-5.06-4.49-.15-.2-1.21-1.61-1.21-3.07 0-1.46.76-2.18 1.03-2.48.27-.3.59-.38.79-.38.2 0 .4 0 .57.01.18.01.43-.07.67.51.24.59.83 2.04.9 2.19.07.15.12.33.02.53-.1.2-.15.33-.3.5-.15.17-.31.38-.44.51-.15.15-.3.31-.13.61.17.3.76 1.25 1.63 2.02 1.12.99 2.06 1.3 2.36 1.45.3.15.47.13.65-.07.18-.2.74-.86.94-1.16.2-.3.4-.25.67-.15.27.1 1.73.82 2.03.97.3.15.5.22.57.34.07.12.07.69-.17 1.37z" />
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

export default function HomeClient({
  articles = [],
  categories = [],
  breakingNews = [],
  videos = [],
  socialLinks = null,
}) {
  const { isUrdu, isEnglish, dir, t } = useSiteLanguage();

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

  const storyHref = (story) => `/story/${story?.slug || story?.id}`;

  // 1. Hero + Live Stories (Prioritize Red Alert breaking first, then featured stories, rotating every 12s)
  const redAlertArticles = articles.filter(
    (a) => a.is_breaking && Number(a.meta?.breakingPriority || 1) === 1
  );
  const otherFeatured = articles.filter(
    (a) => a.is_featured && !redAlertArticles.some((r) => r.id === a.id)
  );
  const heroPool = [...redAlertArticles, ...otherFeatured];
  const heroCandidates = heroPool.length > 0 ? heroPool : articles[0] ? [articles[0]] : [];

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
  const leadStory = heroCandidates[safeHeroIndex] || articles[0] || null;
  const nonLeadArticles = articles.filter((a) => a.id !== leadStory?.id);
  const remainingHeroPool = heroCandidates.filter((a) => a.id !== leadStory?.id);
  const nonFeatured = nonLeadArticles.filter((a) => !remainingHeroPool.some((h) => h.id === a.id));
  const secondaryStories = [...remainingHeroPool, ...nonFeatured].slice(0, 4);
  const usedIds = new Set([leadStory?.id, ...secondaryStories.map((s) => s.id)].filter(Boolean));
  const remainingLive = articles.filter((a) => !usedIds.has(a.id));
  const liveFeatured = remainingLive[0] || articles[0] || null;
  const liveTimeline = remainingLive.slice(1, 7);

  // 2. Category Story Selector with safe fallback
  const getCategoryStories = (slugs, count = 5) => {
    const slugList = Array.isArray(slugs) ? slugs : [slugs];
    const matched = articles.filter((a) =>
      slugList.includes((a.category?.slug || a.category_slug || "").toLowerCase())
    );
    if (matched.length >= count) return matched.slice(0, count);
    const others = articles.filter(
      (a) => !matched.some((m) => m.id === a.id) && a.id !== leadStory?.id
    );
    return [...matched, ...others].slice(0, count);
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
  const opinionStories = getCategoryStories(["opinion", "blogs"], 6);
  const latestSidebar = articles.slice(0, 7);

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
              <span>
                {new Date(lead.created_at).toLocaleDateString(isUrdu ? "ur-PK" : "en-US", {
                  day: "numeric",
                  month: "short",
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
      <Header categories={categories} breakingNews={breakingNews} />

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
                            className={`h-2 rounded-full transition-all cursor-pointer ${
                              idx === safeHeroIndex ? "w-5 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
                            }`}
                          />
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

                <div className="flex items-center justify-between text-xs text-gray-500 font-sans border-t border-[#dcd8cd] pt-2.5 mt-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800">{getAuthor(leadStory)}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-gray-500">
                      <Clock size={12} />
                      {new Date(leadStory.created_at).toLocaleDateString(isUrdu ? "ur-PK" : "en-US", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
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
                  <span className="text-xs text-gray-500 font-sans">{t("latestUpdates")}</span>
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
                      <span className="text-[11px] text-gray-400 font-sans mt-0.5 block">
                        {new Date(story.created_at).toLocaleTimeString(isUrdu ? "ur-PK" : "en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
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
                  <span className="text-[11px] text-gray-400 font-sans block mb-1">
                    {isUrdu ? "اپ ڈیٹ" : "Live Feed"} •{" "}
                    {new Date().toLocaleDateString(isUrdu ? "ur-PK" : "en-US", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
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
                      <time className="text-[10px] text-gray-400 font-sans block mb-0.5">
                        {new Date(item.created_at).toLocaleTimeString(isUrdu ? "ur-PK" : "en-US", {
                          hour: "2-digit",
                          minute: "2-digit",
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
                  {/* Left Wing (3 cols) */}
                  <div className="content-start divide-y divide-[#dcd8cd] lg:order-1 lg:col-span-3">
                    {sportsLeft.map((st) => (
                      <article key={st.id} className="py-2.5 first:pt-0 last:pb-0 group">
                        <Link href={storyHref(st)}>
                          <h3
                            className={`text-[13px] font-bold text-gray-800 group-hover:text-emerald-700 transition leading-snug line-clamp-2 ${
                              isUrdu ? "urdu-headline" : "font-sans"
                            }`}
                          >
                            {getTitle(st)}
                          </h3>
                        </Link>
                      </article>
                    ))}
                  </div>

                  {/* Center Lead (6 cols with border-x) */}
                  <article className="order-first lg:order-2 lg:col-span-6 lg:border-x lg:border-[#dcd8cd] lg:px-3 group">
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
                        className={`text-lg font-bold text-gray-950 group-hover:text-emerald-700 transition leading-snug mb-1.5 ${
                          isUrdu ? "urdu-headline" : "font-sans"
                        }`}
                      >
                        {getTitle(sportsCenter)}
                      </h3>
                    </Link>
                    <p
                      className={`text-xs text-gray-600 line-clamp-2 ${
                        isUrdu ? "urdu-body leading-relaxed" : "font-sans"
                      }`}
                    >
                      {getSummary(sportsCenter)}
                    </p>
                  </article>

                  {/* Right Wing (3 cols) */}
                  <div className="content-start divide-y divide-[#dcd8cd] lg:order-3 lg:col-span-3">
                    {sportsRight.map((st) => (
                      <article key={st.id} className="py-2.5 first:pt-0 last:pb-0 group">
                        <Link href={storyHref(st)}>
                          <h3
                            className={`text-[13px] font-bold text-gray-800 group-hover:text-emerald-700 transition leading-snug line-clamp-2 ${
                              isUrdu ? "urdu-headline" : "font-sans"
                            }`}
                          >
                            {getTitle(st)}
                          </h3>
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
              <div className="flex flex-wrap gap-2">
                <a
                  href={socialLinks?.facebook || "https://facebook.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#dcd8cd] text-xs font-bold text-gray-700 hover:border-emerald-700 hover:text-emerald-800 transition"
                >
                  {BrandIcons.facebook}
                  <span>Facebook</span>
                </a>
                <a
                  href={socialLinks?.youtube || "https://youtube.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#dcd8cd] text-xs font-bold text-gray-700 hover:border-emerald-700 hover:text-emerald-800 transition"
                >
                  {BrandIcons.youtube}
                  <span>YouTube</span>
                </a>
                <a
                  href={socialLinks?.twitter || "https://x.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#dcd8cd] text-xs font-bold text-gray-700 hover:border-emerald-700 hover:text-emerald-800 transition"
                >
                  {BrandIcons.x}
                  <span>X</span>
                </a>
                <a
                  href={socialLinks?.instagram || "https://instagram.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#dcd8cd] text-xs font-bold text-gray-700 hover:border-emerald-700 hover:text-emerald-800 transition"
                >
                  {BrandIcons.instagram}
                  <span>Instagram</span>
                </a>
                <a
                  href={socialLinks?.whatsapp || "https://whatsapp.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#dcd8cd] text-xs font-bold text-gray-700 hover:border-emerald-700 hover:text-emerald-800 transition"
                >
                  {BrandIcons.whatsapp}
                  <span>WhatsApp</span>
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
