"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, TrendingUp, ArrowRight } from "lucide-react";
import Header from "@/component/Header";
import Footer from "@/component/Footer";
import AdSlot from "@/component/AdSlot";
import NewsletterBox from "@/component/NewsletterBox";
import NamazWidget from "@/component/widgets/NamazWidget";
import CurrencyWidget from "@/component/widgets/CurrencyWidget";
import WeatherWidget from "@/component/widgets/WeatherWidget";
import { useSiteLanguage } from "@/context/SiteLanguageContext";
import { getFallbackImageForStory } from "@/lib/mockImages";

export default function HomeClient({ articles = [], categories = [], breakingNews = [] }) {
  const { lang, isUrdu, isEnglish, dir, t } = useSiteLanguage();

  const leadStory = articles[0] || null;
  const secondaryStories = articles.slice(1, 5);
  const remainingStories = articles.slice(5);

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

  return (
    <div className="min-h-screen text-gray-900" dir={dir}>
      {/* 1. SITE HEADER */}
      <Header categories={categories} breakingNews={breakingNews} />

      {/* 2. MAIN CONTENT AREA */}
      <main className="u-shell py-5">
        
        {/* HERO SECTION */}
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
                    <div className="relative w-24 h-18 sm:w-28 sm:h-20 shrink-0 overflow-hidden rounded-none border border-[#dcd8cd] bg-[#dcd8cd]/40 shadow-2xs">
                      <Image
                        src={getFallbackImageForStory(story)}
                        alt={getTitle(story)}
                        fill
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

        {/* Home Mid-Feed Ad Slot */}
        <AdSlot slotKey="home_mid_banner" className="my-6 max-w-4xl mx-auto" />

        {/* PROMOTIONAL SLATE BANNER */}
        <section className="my-6 py-3.5 px-5 bg-[#0a1f13] rounded text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm border-t-2 border-emerald-500 font-sans">
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
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-1.5 rounded transition whitespace-nowrap"
          >
            {t("readTodayPaper")}
          </Link>
        </section>

        {/* BROADSHEET EDITORIAL & UTILITY SECTION (Matching Daily Insaaf Layout) */}
        <section className="my-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main News Articles Grid (8 Cols) */}
          <div className="lg:col-span-8">
            <div className="mb-4 flex items-center justify-between border-b-2 border-emerald-700 pb-1.5">
              <h2 className={`text-lg font-bold text-gray-900 ${isUrdu ? "urdu-headline" : "font-sans"}`}>
                {t("otherHeadlines")}
              </h2>
              <span className="text-xs text-gray-500 font-sans">{t("allSections")}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {remainingStories.map((story) => (
                <article
                  key={story.id}
                  className="border border-[#dcd8cd] rounded overflow-hidden hover:border-emerald-600 transition group bg-[#efeee9]/70 hover:bg-[#efeee9] shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div className="relative w-full h-44 bg-[#dcd8cd]/40 overflow-hidden">
                      <Image
                        src={story.cover_image || "/logo-light.webp"}
                        alt={getTitle(story)}
                        fill
                        className="object-cover group-hover:scale-105 transition duration-500"
                      />
                      <span className={`absolute top-2 ${isUrdu ? "right-2" : "left-2"} bg-black/75 text-white text-[11px] px-2 py-0.5 rounded font-sans`}>
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
          </div>

          {/* Daily Insaaf Style Sidebar Stack (4 Cols): Namaz, Currency, Weather */}
          <aside className="lg:col-span-4 space-y-5">
            {/* 1. Namaz Auqaat Card */}
            <NamazWidget />

            {/* 2. Currency & Gold Rates Card */}
            <CurrencyWidget />

            {/* 3. Weather Card */}
            <WeatherWidget />

            {/* Sidebar Ad Slot (Controllable from CMS) */}
            <AdSlot slotKey="home_sidebar" />
          </aside>

        </section>

        {/* NEWSLETTER SUBSCRIPTION RIBBON */}
        <section className="my-6 w-full">
          <NewsletterBox />
        </section>

      </main>

      {/* FOOTER */}
      <Footer categories={categories} />
    </div>
  );
}
