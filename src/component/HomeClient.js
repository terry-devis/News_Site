"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Clock,
  TrendingUp,
  ArrowRight,
  Play,
  Share2,
  MessageCircle,
} from "lucide-react";
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

  // 1. Hero + Live Stories (kept 100% intact)
  const leadStory = articles[0] || null;
  const secondaryStories = articles.slice(1, 5);
  const liveFeatured = articles[5] || articles[0] || null;
  const liveTimeline = articles.slice(6, 12);

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
          <section className="bg-[#efeee9] border border-[#dcd8cd] rounded-none p-4 sm:p-5 mb-6 shadow-xs">
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

            {/* 8. VIDEOS (ویڈیوز) */}
            <section className="u-block overflow-hidden" aria-label={isUrdu ? "ویڈیوز" : "Videos"}>
              <SectionHeader titleUr="ویڈیوز" titleEn="Videos" href="/video" />
              <div className="grid gap-5 lg:grid-cols-12">
                <div className="lg:col-span-8">
                  {mainVideo ? (
                    <Link href="/video" className="group block border border-[#dcd8cd] bg-[#0a2618] text-white overflow-hidden">
                      <div className="relative aspect-video bg-black/50">
                        {mainVideo.thumbnail_url ? (
                          <img
                            src={mainVideo.thumbnail_url}
                            alt={isUrdu ? mainVideo.title_ur : mainVideo.title_en || mainVideo.title_ur}
                            className="w-full h-full object-cover opacity-85 group-hover:scale-102 transition duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#0a2618]" />
                        )}
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="size-14 rounded-full bg-emerald-600/90 text-white flex items-center justify-center shadow-xl group-hover:scale-110 transition">
                            <Play size={24} className="fill-white ms-0.5" />
                          </span>
                        </span>
                      </div>
                      <div className="p-3.5">
                        <h3 className={`text-base font-bold leading-snug ${isUrdu ? "urdu-headline" : "font-sans"}`}>
                          {isUrdu ? mainVideo.title_ur : mainVideo.title_en || mainVideo.title_ur}
                        </h3>
                      </div>
                    </Link>
                  ) : (
                    <div className="border border-[#dcd8cd] bg-[#efeee9] p-8 text-center text-xs text-gray-500">
                      {isUrdu ? "ویڈیوز دیکھنے کے لیے ویڈیو سیکشن ملاحظہ کریں" : "Visit Videos section"}
                    </div>
                  )}
                </div>

                <div className="lg:col-span-4 divide-y divide-[#dcd8cd] border border-[#dcd8cd] bg-[#efeee9]/60 p-3">
                  {sideVideos.length > 0 ? (
                    sideVideos.map((v) => (
                      <Link key={v.id} href="/video" className="flex items-center gap-2.5 py-2.5 first:pt-0 last:pb-0 group">
                        <div className="relative w-20 h-14 shrink-0 bg-black/80 overflow-hidden border border-[#dcd8cd]">
                          {v.thumbnail_url && (
                            <img
                              src={v.thumbnail_url}
                              alt={v.title_ur}
                              className="w-full h-full object-cover opacity-85"
                            />
                          )}
                          <span className="absolute inset-0 flex items-center justify-center">
                            <Play size={14} className="text-white fill-white" />
                          </span>
                        </div>
                        <span className={`text-xs font-bold text-gray-800 group-hover:text-emerald-700 line-clamp-2 ${isUrdu ? "urdu-headline" : "font-sans"}`}>
                          {isUrdu ? v.title_ur : v.title_en || v.title_ur}
                        </span>
                      </Link>
                    ))
                  ) : (
                    <Link href="/video" className="text-xs font-bold text-emerald-800 hover:underline block py-4 text-center">
                      {isUrdu ? "تمام ویڈیوز دیکھیں ←" : "Watch all videos →"}
                    </Link>
                  )}
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

          {/* RIGHT / END SIDEBAR (4 Cols) */}
          <aside className="lg:col-span-4 space-y-5 self-start">
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
                  <Share2 size={13} />
                  <span>Facebook</span>
                </a>
                <a
                  href={socialLinks?.youtube || "https://youtube.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#dcd8cd] text-xs font-bold text-gray-700 hover:border-emerald-700 hover:text-emerald-800 transition"
                >
                  <Play size={13} />
                  <span>YouTube</span>
                </a>
                <a
                  href={socialLinks?.twitter || "https://x.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#dcd8cd] text-xs font-bold text-gray-700 hover:border-emerald-700 hover:text-emerald-800 transition"
                >
                  <Share2 size={13} />
                  <span>X</span>
                </a>
                <a
                  href={socialLinks?.instagram || "https://instagram.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#dcd8cd] text-xs font-bold text-gray-700 hover:border-emerald-700 hover:text-emerald-800 transition"
                >
                  <Share2 size={13} />
                  <span>Instagram</span>
                </a>
                <a
                  href={socialLinks?.whatsapp || "https://whatsapp.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#dcd8cd] text-xs font-bold text-gray-700 hover:border-emerald-700 hover:text-emerald-800 transition"
                >
                  <MessageCircle size={13} />
                  <span>WhatsApp</span>
                </a>
              </div>
            </section>

            {/* 8. Sticky Tall Sidebar Ad (300x600) */}
            <AdSlot slotKey="home-sidebar" className="lg:sticky lg:top-24" />
          </aside>
        </section>

        {/* COMPACT NEWSLETTER STRIP */}
        <section className="my-6 py-3.5 px-5 bg-[#0a1f13] rounded-none text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm border-t-2 border-emerald-500 font-sans">
          <div className="text-center sm:text-start">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center justify-center sm:justify-start gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{t("newsletterHeading")}</span>
            </h3>
            <p className="text-gray-300 text-xs">{t("newsletterSub")}</p>
          </div>
          <div className="w-full sm:w-auto sm:min-w-[320px]">
            <NewsletterBox />
          </div>
        </section>
      </main>

      {/* SITE FOOTER */}
      <Footer categories={categories} />
    </div>
  );
}
