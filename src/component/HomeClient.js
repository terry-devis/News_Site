"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, TrendingUp, ArrowRight, Radio } from "lucide-react";
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

export default function HomeClient({ articles = [], categories = [], breakingNews = [] }) {
  const { lang, isUrdu, isEnglish, dir, t } = useSiteLanguage();

  // Helper getters
  const getTitle = (story) => {
    if (!story) return "";
    return isEnglish ? (story.title_en || story.title_ur) : (story.title_ur || story.title_en);
  };

  const getSummary = (story) => {
    if (!story) return "";
    if (isEnglish) {
      if (story.summary_en) return story.summary_en;
      if (story.content_en) {
        const m = story.content_en.match(/<!--excerpt:([\s\S]*?)-->/);
        if (m) return m[1].trim();
        const clean = story.content_en.replace(/<[^>]+>/g, " ").trim();
        if (clean) return clean.substring(0, 140) + "...";
      }
      return story.summary_ur || "";
    }
    return story.summary_ur || story.summary_en || "";
  };

  const getCatName = (cat) => {
    if (!cat) return isEnglish ? "News" : "خبر";
    return isEnglish ? (cat.name_en || cat.name_ur || "News") : (cat.name_ur || cat.name_en || "خبر");
  };

  const getAuthor = (story) => {
    if (!story) return "";
    return isEnglish
      ? (story.author_name_en || "Editorial Board")
      : (story.author_name || "ایڈیٹوریل بورڈ");
  };

  // 1. Hero Stories (Kept 100% same as original design)
  const leadStory = articles[0] || null;
  const secondaryStories = articles.slice(1, 5);

  // 2. Live Updates Box Stories
  const liveFeatured = articles[5] || articles[0] || null;
  const liveTimeline = articles.slice(6, 12);

  // 3. Category Filter helper with safe fallback
  const getCategoryStories = (slug, count = 5) => {
    const matched = articles.filter(
      (a) => (a.category?.slug || a.category_slug || "").toLowerCase() === slug.toLowerCase()
    );
    if (matched.length >= count) return matched.slice(0, count);
    const others = articles.filter(
      (a) => !matched.some((m) => m.id === a.id) && a.id !== leadStory?.id
    );
    return [...matched, ...others].slice(0, count);
  };

  const businessStories = getCategoryStories("business", 5);
  const businessLead = businessStories[0] || null;
  const businessSubList = businessStories.slice(1, 5);

  const pakStories = getCategoryStories("pakistan", 3);
  const pakLead = pakStories[0] || null;
  const pakSubList = pakStories.slice(1, 3);

  const sportsStories = getCategoryStories("sports", 3);
  const sportsLead = sportsStories[0] || null;
  const sportsSubList = sportsStories.slice(1, 3);

  const worldStories = getCategoryStories("world", 3);

  const techStories = getCategoryStories("tech", 3);
  const techLead = techStories[0] || null;
  const techSubList = techStories.slice(1, 3);

  const entStories = getCategoryStories("entertainment", 3);
  const entLead = entStories[0] || null;
  const entSubList = entStories.slice(1, 3);

  // Remaining general stories for broadsheet bottom grid
  const remainingStories = articles.slice(12);

  return (
    <div className="min-h-screen text-gray-900 bg-[#f7f6f3]" dir={dir}>
      {/* 1. SITE HEADER (Kept identical as requested) */}
      <Header categories={categories} breakingNews={breakingNews} />

      {/* 2. MAIN CONTENT AREA */}
      <main className="u-shell py-5">
        
        {/* HERO SECTION (Kept 100% identical as requested) */}
        {leadStory && (
          <section className="bg-[#efeee9] border border-[#dcd8cd] rounded-none p-4 sm:p-5 mb-6 shadow-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Lead Featured Story (7 Cols) - Express News Premier Broadsheet Style (HEADING ABOVE IMAGE) */}
              <article className="lg:col-span-7 flex flex-col justify-between group">
                <div>
                  {/* Category Kicker & Status */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="bg-emerald-800 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-none uppercase font-sans tracking-wide">
                      {getCatName(leadStory.category)}
                    </span>
                    {leadStory.is_breaking && (
                      <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-none flex items-center gap-1 font-sans animate-pulse">
                        <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                        <span>{isUrdu ? "اہم خبر" : "BREAKING"}</span>
                      </span>
                    )}
                  </div>

                  {/* 1. PROMINENT HEADLINE ABOVE THE IMAGE (Express.pk Style) */}
                  <Link href={`/story/${leadStory.id || leadStory.slug}`} className="block group-hover:text-emerald-800 transition">
                    <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-black text-gray-950 tracking-tight leading-snug sm:leading-tight mb-3 ${isUrdu ? "urdu-headline" : "font-sans font-extrabold"}`}>
                      {getTitle(leadStory)}
                    </h1>
                  </Link>

                  {/* 2. FEATURED IMAGE DIRECTLY UNDER HEADLINE */}
                  <div className="relative w-full aspect-[16/10] overflow-hidden rounded-none border border-[#dcd8cd] bg-[#dcd8cd]/40 mb-3.5 shadow-xs">
                    <Image
                      src={getFallbackImageForStory(leadStory)}
                      alt={getTitle(leadStory)}
                      fill
                      className="object-cover group-hover:scale-102 transition duration-500"
                      priority
                    />
                  </div>

                  {/* 3. EXCERPT / LEAD SUMMARY UNDER IMAGE */}
                  <p className={`text-gray-700 text-sm sm:text-[15px] line-clamp-3 mb-3.5 ${isUrdu ? "urdu-body leading-relaxed text-justify" : "font-sans leading-normal"}`}>
                    {getSummary(leadStory)}
                  </p>
                </div>

                {/* Footer Byline & Timestamp */}
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
                    href={`/story/${leadStory.id || leadStory.slug}`}
                    className="text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 group-hover:underline"
                  >
                    <span>{isUrdu ? "مکمل تفصیل پڑھیں" : "Read Full Story"}</span>
                    <ArrowRight size={13} className="rtl:rotate-180" />
                  </Link>
                </div>
              </article>

              {/* Secondary Top Stories (5 Cols - اہم خبریں) */}
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
                    <div className="relative w-24 sm:w-28 h-20 sm:h-20 shrink-0 overflow-hidden rounded-none border border-[#dcd8cd] bg-[#dcd8cd]/40 shadow-2xs">
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
                      <Link href={`/story/${story.id || story.slug}`}>
                        <h3 className={`text-[14px] font-bold text-gray-800 group-hover:text-emerald-600 transition leading-snug line-clamp-2 ${isUrdu ? "urdu-headline" : "font-sans"}`}>
                          {getTitle(story)}
                        </h3>
                      </Link>
                      <span className="text-[11px] text-gray-400 font-sans mt-0.5 block">
                        {new Date(story.created_at).toLocaleTimeString(isUrdu ? "ur-PK" : "en-US", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </article>
                ))}
              </div>

            </div>
          </section>
        )}

        {/* 3. "LIVE UPDATES" (لائیو اپڈیٹس) 2-COLUMN TIMELINE BOX (Daily Insaaf Architecture) */}
        {liveFeatured && (
          <section className="bg-[#efeee9] border border-[#dcd8cd] rounded-none mb-6 shadow-xs" aria-label={t("liveUpdates")}>
            <div className="border-b border-[#dcd8cd] flex items-center gap-2.5 px-4 py-2.5 sm:px-5">
              <span className="bg-red-600 inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold tracking-wide text-white uppercase font-sans">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-75 motion-reduce:animate-none"></span>
                  <span className="relative inline-flex size-2 rounded-full bg-white"></span>
                </span>
                {t("liveUpdates")}
              </span>
              <span className="flex-1"></span>
              <Link href="/live" className="text-xs font-semibold text-gray-500 hover:text-emerald-700 font-sans flex items-center gap-1 transition">
                {t("viewMore")}
              </Link>
            </div>

            <div className="grid gap-5 p-4 sm:p-5 lg:grid-cols-2 lg:gap-6">
              {/* Left/Start Column: Lead Live Update Hero Card */}
              <article className="group order-first block self-start">
                <Link href={`/story/${liveFeatured.id || liveFeatured.slug}`} className="block">
                  <div className="relative w-full aspect-[16/10] overflow-hidden border border-[#dcd8cd] bg-[#dcd8cd]/40 mb-3 shadow-xs">
                    <Image
                      src={getFallbackImageForStory(liveFeatured)}
                      alt={getTitle(liveFeatured)}
                      fill
                      className="object-cover group-hover:scale-102 transition duration-500"
                    />
                  </div>
                </Link>
                <Link href={`/story/${liveFeatured.id || liveFeatured.slug}`}>
                  <h3 className={`text-base sm:text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition leading-snug mb-1.5 ${isUrdu ? "urdu-headline" : "font-sans"}`}>
                    {getTitle(liveFeatured)}
                  </h3>
                </Link>
                <p className={`text-xs text-gray-600 line-clamp-2 ${isUrdu ? "urdu-body leading-relaxed" : "font-sans leading-normal"}`}>
                  {getSummary(liveFeatured)}
                </p>
              </article>

              {/* Right/End Column: Interactive Vertical Timeline Rail */}
              <div className="flex min-w-0 flex-col">
                <div className="mb-2">
                  <span className="text-[11px] text-gray-400 font-sans block mb-1">
                    {isUrdu ? "اپ ڈیٹ" : "Live Feed"} • {new Date().toLocaleDateString(isUrdu ? "ur-PK" : "en-US", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                </div>

                <ol className="relative max-h-[19rem] overflow-y-auto border-t border-[#dcd8cd] pt-2 space-y-3.5 scrollbar-thin">
                  <span className="bg-[#dcd8cd] absolute inset-y-2 start-[7px] w-px" aria-hidden="true"></span>
                  {liveTimeline.map((item) => (
                    <li key={item.id} className="relative ps-5 group">
                      <span className="bg-red-600 ring-4 ring-[#efeee9] absolute start-1 top-2 size-2 rounded-full" aria-hidden="true"></span>
                      <time className="text-[10px] text-gray-400 font-sans block mb-0.5">
                        {new Date(item.created_at).toLocaleTimeString(isUrdu ? "ur-PK" : "en-US", { hour: "2-digit", minute: "2-digit" })}
                      </time>
                      <Link href={`/story/${item.id || item.slug}`}>
                        <h4 className={`text-xs sm:text-[13px] font-bold text-gray-800 group-hover:text-emerald-700 transition leading-snug line-clamp-2 ${isUrdu ? "urdu-headline" : "font-sans"}`}>
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

        {/* 4. LEADERBOARD AD SLOT */}
        <AdSlot slotKey="home_mid_banner" className="my-6 max-w-5xl mx-auto" />

        {/* 5. BROADSHEET EDITORIAL & SIDEBAR GRID (Daily Insaaf 12-Column Architecture) */}
        <section className="my-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Editorial Content Column (8 Cols) */}
          <div className="lg:col-span-8 space-y-7">

            {/* A. BUSINESS (بزنس) SECTION — 7:5 Column Split Grid */}
            {businessLead && (
              <section className="u-block" aria-label={t("business")}>
                <div className="border-b-2 border-emerald-700 pb-1.5 mb-4 flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 font-sans flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-emerald-700 inline-block"></span>
                    <span>{t("business")}</span>
                  </h2>
                  <Link href="/category/business" className="text-xs text-gray-500 hover:text-emerald-700 font-sans font-semibold">
                    {t("viewMore")}
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 border border-[#dcd8cd] p-4 bg-[#efeee9]/70 shadow-xs">
                  {/* 7 Cols: Lead Business Article */}
                  <article className="md:col-span-7 flex flex-col justify-between group md:border-e md:border-[#dcd8cd] md:pe-4">
                    <div>
                      <div className="relative w-full aspect-[3/2] overflow-hidden border border-[#dcd8cd] bg-[#dcd8cd]/40 mb-3 shadow-2xs">
                        <Image
                          src={getFallbackImageForStory(businessLead)}
                          alt={getTitle(businessLead)}
                          fill
                          className="object-cover group-hover:scale-102 transition duration-500"
                        />
                        <span className={`absolute top-2 ${isUrdu ? "right-2" : "left-2"} bg-black/75 text-white text-[10px] px-2 py-0.5 rounded-none font-sans`}>
                          {t("business")}
                        </span>
                      </div>
                      <Link href={`/story/${businessLead.id || businessLead.slug}`}>
                        <h3 className={`text-base sm:text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition line-clamp-2 mb-2 leading-snug ${isUrdu ? "urdu-headline" : "font-sans"}`}>
                          {getTitle(businessLead)}
                        </h3>
                      </Link>
                      <p className={`text-xs text-gray-600 line-clamp-2 mb-3 ${isUrdu ? "urdu-body leading-relaxed" : "font-sans leading-normal"}`}>
                        {getSummary(businessLead)}
                      </p>
                    </div>

                    <div className="text-[11px] text-gray-400 font-sans border-t border-[#dcd8cd]/60 pt-2 flex items-center justify-between">
                      <span>{getAuthor(businessLead)}</span>
                      <span>{new Date(businessLead.created_at).toLocaleDateString(isUrdu ? "ur-PK" : "en-US")}</span>
                    </div>
                  </article>

                  {/* 5 Cols: Vertical Mini Stack of Business Stories */}
                  <div className="md:col-span-5 flex flex-col divide-y divide-[#dcd8cd]">
                    {businessSubList.map((item) => (
                      <article key={item.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start gap-2.5 group">
                        <div className="relative w-[76px] sm:w-[84px] h-16 sm:h-18 shrink-0 overflow-hidden border border-[#dcd8cd] bg-[#dcd8cd]/40 shadow-2xs">
                          <Image
                            src={getFallbackImageForStory(item)}
                            alt={getTitle(item)}
                            fill
                            sizes="84px"
                            className="object-cover group-hover:scale-105 transition"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={`/story/${item.id || item.slug}`}>
                            <h4 className={`text-xs sm:text-[13px] font-bold text-gray-800 group-hover:text-emerald-700 line-clamp-2 leading-snug ${isUrdu ? "urdu-headline" : "font-sans"}`}>
                              {getTitle(item)}
                            </h4>
                          </Link>
                          <span className="text-[10px] text-gray-400 font-sans mt-1 block">
                            {new Date(item.created_at).toLocaleTimeString(isUrdu ? "ur-PK" : "en-US", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {/* B. DUAL-COLUMN PARALLEL MODULES (پاکستان / PAKISTAN & کھیل / SPORTS) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Left Column: Pakistan */}
              {pakLead && (
                <section className="border border-[#dcd8cd] p-4 bg-[#efeee9]/70 flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="border-b-2 border-emerald-700 pb-1 mb-3 flex items-center justify-between">
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 font-sans flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-emerald-700 inline-block"></span>
                        <span>{t("pakistan")}</span>
                      </h3>
                      <Link href="/category/pakistan" className="text-xs text-gray-500 hover:text-emerald-700 font-sans">
                        {t("viewMore")}
                      </Link>
                    </div>

                    <article className="group mb-3">
                      <div className="relative w-full aspect-[3/2] overflow-hidden border border-[#dcd8cd] bg-[#dcd8cd]/40 mb-2 shadow-2xs">
                        <Image
                          src={getFallbackImageForStory(pakLead)}
                          alt={getTitle(pakLead)}
                          fill
                          className="object-cover group-hover:scale-102 transition"
                        />
                      </div>
                      <Link href={`/story/${pakLead.id || pakLead.slug}`}>
                        <h4 className={`text-sm sm:text-base font-bold text-gray-900 group-hover:text-emerald-700 transition line-clamp-2 leading-snug mb-1 ${isUrdu ? "urdu-headline" : "font-sans"}`}>
                          {getTitle(pakLead)}
                        </h4>
                      </Link>
                      <p className={`text-xs text-gray-600 line-clamp-2 ${isUrdu ? "urdu-body leading-relaxed" : "font-sans leading-normal"}`}>
                        {getSummary(pakLead)}
                      </p>
                    </article>
                  </div>

                  <div className="border-t border-[#dcd8cd] divide-y divide-[#dcd8cd] pt-1">
                    {pakSubList.map((item) => (
                      <article key={item.id} className="py-2 first:pt-0 last:pb-0 flex items-start gap-2.5 group">
                        <div className="relative w-16 h-12 shrink-0 overflow-hidden border border-[#dcd8cd] bg-[#dcd8cd]/40">
                          <Image src={getFallbackImageForStory(item)} alt={getTitle(item)} fill className="object-cover group-hover:scale-105 transition" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={`/story/${item.id || item.slug}`}>
                            <h5 className={`text-xs font-bold text-gray-800 group-hover:text-emerald-700 line-clamp-2 leading-snug ${isUrdu ? "urdu-headline" : "font-sans"}`}>
                              {getTitle(item)}
                            </h5>
                          </Link>
                          <span className="text-[10px] text-gray-400 font-sans block mt-0.5">
                            {new Date(item.created_at).toLocaleTimeString(isUrdu ? "ur-PK" : "en-US", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {/* Right Column: Sports */}
              {sportsLead && (
                <section className="border border-[#dcd8cd] p-4 bg-[#efeee9]/70 flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="border-b-2 border-emerald-700 pb-1 mb-3 flex items-center justify-between">
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 font-sans flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-emerald-700 inline-block"></span>
                        <span>{t("sports")}</span>
                      </h3>
                      <Link href="/category/sports" className="text-xs text-gray-500 hover:text-emerald-700 font-sans">
                        {t("viewMore")}
                      </Link>
                    </div>

                    <article className="group mb-3">
                      <div className="relative w-full aspect-[3/2] overflow-hidden border border-[#dcd8cd] bg-[#dcd8cd]/40 mb-2 shadow-2xs">
                        <Image
                          src={getFallbackImageForStory(sportsLead)}
                          alt={getTitle(sportsLead)}
                          fill
                          className="object-cover group-hover:scale-102 transition"
                        />
                      </div>
                      <Link href={`/story/${sportsLead.id || sportsLead.slug}`}>
                        <h4 className={`text-sm sm:text-base font-bold text-gray-900 group-hover:text-emerald-700 transition line-clamp-2 leading-snug mb-1 ${isUrdu ? "urdu-headline" : "font-sans"}`}>
                          {getTitle(sportsLead)}
                        </h4>
                      </Link>
                      <p className={`text-xs text-gray-600 line-clamp-2 ${isUrdu ? "urdu-body leading-relaxed" : "font-sans leading-normal"}`}>
                        {getSummary(sportsLead)}
                      </p>
                    </article>
                  </div>

                  <div className="border-t border-[#dcd8cd] divide-y divide-[#dcd8cd] pt-1">
                    {sportsSubList.map((item) => (
                      <article key={item.id} className="py-2 first:pt-0 last:pb-0 flex items-start gap-2.5 group">
                        <div className="relative w-16 h-12 shrink-0 overflow-hidden border border-[#dcd8cd] bg-[#dcd8cd]/40">
                          <Image src={getFallbackImageForStory(item)} alt={getTitle(item)} fill className="object-cover group-hover:scale-105 transition" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={`/story/${item.id || item.slug}`}>
                            <h5 className={`text-xs font-bold text-gray-800 group-hover:text-emerald-700 line-clamp-2 leading-snug ${isUrdu ? "urdu-headline" : "font-sans"}`}>
                              {getTitle(item)}
                            </h5>
                          </Link>
                          <span className="text-[10px] text-gray-400 font-sans block mt-0.5">
                            {new Date(item.created_at).toLocaleTimeString(isUrdu ? "ur-PK" : "en-US", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* C. IN-FEED LEADERBOARD AD */}
            <AdSlot slotKey="home_infeed_1" className="my-2" />

            {/* D. INTERNATIONAL (انٹرنیشنل) SECTION — 3-Column Broadsheet Cards */}
            {worldStories.length > 0 && (
              <section className="u-block" aria-label={t("world")}>
                <div className="border-b-2 border-emerald-700 pb-1.5 mb-4 flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 font-sans flex items-center gap-2">
                    <span className="w-2.5 h-2.5 bg-emerald-700 inline-block"></span>
                    <span>{t("world")}</span>
                  </h2>
                  <Link href="/category/world" className="text-xs text-gray-500 hover:text-emerald-700 font-sans font-semibold">
                    {t("viewMore")}
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {worldStories.map((story) => (
                    <article
                      key={story.id}
                      className="border border-[#dcd8cd] bg-[#efeee9]/70 p-3.5 flex flex-col justify-between group hover:border-emerald-600 transition shadow-2xs"
                    >
                      <div>
                        <div className="relative w-full aspect-[3/2] overflow-hidden border border-[#dcd8cd] bg-[#dcd8cd]/40 mb-2.5 shadow-2xs">
                          <Image
                            src={getFallbackImageForStory(story)}
                            alt={getTitle(story)}
                            fill
                            className="object-cover group-hover:scale-105 transition duration-300"
                          />
                          <span className={`absolute top-1.5 ${isUrdu ? "right-1.5" : "left-1.5"} bg-black/75 text-white text-[10px] px-1.5 py-0.5 font-sans`}>
                            {t("world")}
                          </span>
                        </div>
                        <Link href={`/story/${story.id || story.slug}`}>
                          <h4 className={`text-sm font-bold text-gray-900 group-hover:text-emerald-700 line-clamp-2 leading-snug mb-1.5 ${isUrdu ? "urdu-headline" : "font-sans"}`}>
                            {getTitle(story)}
                          </h4>
                        </Link>
                        <p className={`text-xs text-gray-600 line-clamp-2 ${isUrdu ? "urdu-body leading-relaxed" : "font-sans leading-normal"}`}>
                          {getSummary(story)}
                        </p>
                      </div>

                      <div className="text-[10px] text-gray-400 font-sans mt-2.5 pt-2 border-t border-[#dcd8cd]/50 flex items-center justify-between">
                        <span>{getAuthor(story)}</span>
                        <span>{new Date(story.created_at).toLocaleDateString(isUrdu ? "ur-PK" : "en-US")}</span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* E. DUAL-COLUMN PARALLEL MODULES (سائنس و ٹیکنالوجی & انٹرٹینمنٹ) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Tech & Science */}
              {techLead && (
                <section className="border border-[#dcd8cd] p-4 bg-[#efeee9]/70 flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="border-b-2 border-emerald-700 pb-1 mb-3 flex items-center justify-between">
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 font-sans flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-emerald-700 inline-block"></span>
                        <span>{t("tech")}</span>
                      </h3>
                      <Link href="/category/tech" className="text-xs text-gray-500 hover:text-emerald-700 font-sans">
                        {t("viewMore")}
                      </Link>
                    </div>

                    <article className="group mb-3">
                      <div className="relative w-full aspect-[3/2] overflow-hidden border border-[#dcd8cd] bg-[#dcd8cd]/40 mb-2 shadow-2xs">
                        <Image
                          src={getFallbackImageForStory(techLead)}
                          alt={getTitle(techLead)}
                          fill
                          className="object-cover group-hover:scale-102 transition"
                        />
                      </div>
                      <Link href={`/story/${techLead.id || techLead.slug}`}>
                        <h4 className={`text-sm sm:text-base font-bold text-gray-900 group-hover:text-emerald-700 transition line-clamp-2 leading-snug mb-1 ${isUrdu ? "urdu-headline" : "font-sans"}`}>
                          {getTitle(techLead)}
                        </h4>
                      </Link>
                      <p className={`text-xs text-gray-600 line-clamp-2 ${isUrdu ? "urdu-body leading-relaxed" : "font-sans leading-normal"}`}>
                        {getSummary(techLead)}
                      </p>
                    </article>
                  </div>

                  <div className="border-t border-[#dcd8cd] divide-y divide-[#dcd8cd] pt-1">
                    {techSubList.map((item) => (
                      <article key={item.id} className="py-2 first:pt-0 last:pb-0 flex items-start gap-2.5 group">
                        <div className="relative w-16 h-12 shrink-0 overflow-hidden border border-[#dcd8cd] bg-[#dcd8cd]/40">
                          <Image src={getFallbackImageForStory(item)} alt={getTitle(item)} fill className="object-cover group-hover:scale-105 transition" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={`/story/${item.id || item.slug}`}>
                            <h5 className={`text-xs font-bold text-gray-800 group-hover:text-emerald-700 line-clamp-2 leading-snug ${isUrdu ? "urdu-headline" : "font-sans"}`}>
                              {getTitle(item)}
                            </h5>
                          </Link>
                          <span className="text-[10px] text-gray-400 font-sans block mt-0.5">
                            {new Date(item.created_at).toLocaleTimeString(isUrdu ? "ur-PK" : "en-US", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}

              {/* Entertainment */}
              {entLead && (
                <section className="border border-[#dcd8cd] p-4 bg-[#efeee9]/70 flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="border-b-2 border-emerald-700 pb-1 mb-3 flex items-center justify-between">
                      <h3 className="text-sm sm:text-base font-bold text-gray-900 font-sans flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-emerald-700 inline-block"></span>
                        <span>{t("entertainment")}</span>
                      </h3>
                      <Link href="/category/entertainment" className="text-xs text-gray-500 hover:text-emerald-700 font-sans">
                        {t("viewMore")}
                      </Link>
                    </div>

                    <article className="group mb-3">
                      <div className="relative w-full aspect-[3/2] overflow-hidden border border-[#dcd8cd] bg-[#dcd8cd]/40 mb-2 shadow-2xs">
                        <Image
                          src={getFallbackImageForStory(entLead)}
                          alt={getTitle(entLead)}
                          fill
                          className="object-cover group-hover:scale-102 transition"
                        />
                      </div>
                      <Link href={`/story/${entLead.id || entLead.slug}`}>
                        <h4 className={`text-sm sm:text-base font-bold text-gray-900 group-hover:text-emerald-700 transition line-clamp-2 leading-snug mb-1 ${isUrdu ? "urdu-headline" : "font-sans"}`}>
                          {getTitle(entLead)}
                        </h4>
                      </Link>
                      <p className={`text-xs text-gray-600 line-clamp-2 ${isUrdu ? "urdu-body leading-relaxed" : "font-sans leading-normal"}`}>
                        {getSummary(entLead)}
                      </p>
                    </article>
                  </div>

                  <div className="border-t border-[#dcd8cd] divide-y divide-[#dcd8cd] pt-1">
                    {entSubList.map((item) => (
                      <article key={item.id} className="py-2 first:pt-0 last:pb-0 flex items-start gap-2.5 group">
                        <div className="relative w-16 h-12 shrink-0 overflow-hidden border border-[#dcd8cd] bg-[#dcd8cd]/40">
                          <Image src={getFallbackImageForStory(item)} alt={getTitle(item)} fill className="object-cover group-hover:scale-105 transition" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <Link href={`/story/${item.id || item.slug}`}>
                            <h5 className={`text-xs font-bold text-gray-800 group-hover:text-emerald-700 line-clamp-2 leading-snug ${isUrdu ? "urdu-headline" : "font-sans"}`}>
                              {getTitle(item)}
                            </h5>
                          </Link>
                          <span className="text-[10px] text-gray-400 font-sans block mt-0.5">
                            {new Date(item.created_at).toLocaleTimeString(isUrdu ? "ur-PK" : "en-US", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* F. OTHER MAJOR HEADLINES (دیگر اہم خبریں) — Broadsheet Grid */}
            {remainingStories.length > 0 && (
              <section className="u-block">
                <div className="mb-4 flex items-center justify-between border-b-2 border-emerald-700 pb-1.5">
                  <h2 className={`text-base sm:text-lg font-bold text-gray-900 ${isUrdu ? "urdu-headline" : "font-sans"}`}>
                    {t("otherHeadlines")}
                  </h2>
                  <span className="text-xs text-gray-500 font-sans">{t("allSections")}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {remainingStories.map((story) => (
                    <article
                      key={story.id}
                      className="border border-[#dcd8cd] rounded-none overflow-hidden hover:border-emerald-600 transition group bg-[#efeee9]/70 hover:bg-[#efeee9] shadow-2xs flex flex-col justify-between"
                    >
                      <div>
                        <div className="relative w-full h-44 bg-[#dcd8cd]/40 overflow-hidden">
                          <Image
                            src={getFallbackImageForStory(story)}
                            alt={getTitle(story)}
                            fill
                            className="object-cover group-hover:scale-105 transition duration-500"
                          />
                          <span className={`absolute top-2 ${isUrdu ? "right-2" : "left-2"} bg-black/75 text-white text-[11px] px-2 py-0.5 rounded-none font-sans`}>
                            {getCatName(story.category)}
                          </span>
                        </div>
                        <div className="p-3.5">
                          <Link href={`/story/${story.id || story.slug}`}>
                            <h3 className={`text-[15px] font-bold text-gray-900 group-hover:text-emerald-700 transition leading-snug line-clamp-2 mb-1.5 ${isUrdu ? "urdu-headline" : "font-sans"}`}>
                              {getTitle(story)}
                            </h3>
                          </Link>
                          <p className={`text-xs text-gray-600 line-clamp-2 ${isUrdu ? "urdu-body leading-relaxed" : "font-sans leading-normal"}`}>
                            {getSummary(story)}
                          </p>
                        </div>
                      </div>

                      <div className="px-3.5 pb-3 pt-1 text-[11px] text-gray-400 font-sans border-t border-[#dcd8cd]/40 flex items-center justify-between">
                        <span>{getAuthor(story)}</span>
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {new Date(story.created_at).toLocaleDateString(isUrdu ? "ur-PK" : "en-US")}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* Sidebar Stack (4 Cols): Namaz, Currency, Weather, Most Read, Poll, Ad, Newsletter */}
          <aside className="lg:col-span-4 space-y-5">
            {/* 1. Namaz Auqaat Card */}
            <NamazWidget />

            {/* 2. Currency & Gold Rates Card */}
            <CurrencyWidget />

            {/* 3. Weather Card */}
            <WeatherWidget />

            {/* 4. Automated Most Read Stories Card */}
            <MostReadWidget stories={articles} />

            {/* 5. Daily Opinion & Voting Poll */}
            <PollWidget />

            {/* 6. Sidebar Ad Slot (Controllable from CMS) */}
            <AdSlot slotKey="home_sidebar" />

            {/* 7. Compact Newsletter Box */}
            <div className="border border-[#dcd8cd] bg-[#efeee9]/90 p-4 shadow-xs">
              <NewsletterBox />
            </div>
          </aside>

        </section>

        {/* 6. PROMOTIONAL SLATE BANNER (ePaper Promo) */}
        <section className="my-6 py-3.5 px-5 bg-[#0a1f13] rounded-none text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm border-t-2 border-emerald-500 font-sans">
          <div className="flex items-center gap-3">
            <div className="h-10 w-36 relative shrink-0">
              <Image src="/logo.webp" alt="Daily Afadiat Logo" fill className="object-contain" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-emerald-400">{t("promoTitle")}</h4>
              <p className="text-xs text-gray-300">{t("promoTagline")}</p>
            </div>
          </div>
          <Link
            href="/epaper"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-none transition whitespace-nowrap"
          >
            {t("readTodayPaper")}
          </Link>
        </section>

      </main>

      {/* 7. FOOTER */}
      <Footer categories={categories} />
    </div>
  );
}
