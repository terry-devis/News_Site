"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, ArrowRight } from "lucide-react";
import Header from "@/component/Header";
import Footer from "@/component/Footer";
import AdSlot from "@/component/AdSlot";
import NewsletterBox from "@/component/NewsletterBox";
import { useSiteLanguage } from "@/context/SiteLanguageContext";
import { ARTICLE_TYPE_BADGES } from "@/lib/articleMeta";

export default function CategoryClient({ slug, category, articles = [], categories = [] }) {
  const { lang, isUrdu, isEnglish, dir, t } = useSiteLanguage();

  const catName = isEnglish
    ? (category?.name_en || category?.name_ur || slug.toUpperCase())
    : (category?.name_ur || category?.name_en || slug);

  const visibleArticles = isEnglish
    ? articles.filter((a) => Boolean(a.title_en && a.title_en.trim()))
    : articles.filter((a) => Boolean(a.title_ur && a.title_ur.trim()));

  const storyHref = (story) =>
    isEnglish && story?.title_en
      ? `/en/story/${story?.slug || story?.id}`
      : `/story/${story?.slug || story?.id}`;

  return (
    <div className="min-h-screen text-gray-900" dir={dir}>
      <Header categories={categories} />

      <main className="u-shell py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 font-sans">
          <Link href="/" className="hover:text-emerald-600 transition">
            {t("breadcrumbHome")}
          </Link>
          <span>/</span>
          <span className="text-emerald-700 font-bold">{catName}</span>
        </div>

        {/* Category Header */}
        <div className="border-b-2 border-emerald-600 pb-2 mb-6 flex items-center justify-between">
          <h1 className={`text-2xl sm:text-3xl font-bold text-gray-900 ${isUrdu ? "urdu-headline" : "font-sans"}`}>
            {catName}
          </h1>
          <span className="text-xs text-gray-500 font-sans">
            {visibleArticles.length} {isEnglish ? "stories" : "خبریں"}
          </span>
        </div>

        {/* Stories Grid */}
        {visibleArticles.length === 0 ? (
          <div className="text-center py-16 bg-[#efeee9] border border-[#dcd8cd] rounded-xl font-sans">
            <p className="text-gray-500 text-sm">
              {isEnglish
                ? "No stories published in this category yet. Please check back shortly."
                : "اس زمرے میں فی الحال کوئی خبر دستیاب نہیں ہے۔"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleArticles.map((story) => {
              const title = isEnglish
                ? (story.title_en || story.title_ur)
                : (story.title_ur || story.title_en);
              const summary = isEnglish
                ? (story.summary_en || story.summary_ur)
                : (story.summary_ur || story.summary_en);

              return (
                <article
                  key={story.id}
                  className="bg-[#efeee9] border border-[#dcd8cd] rounded-xl overflow-hidden hover:border-emerald-600 transition duration-300 group shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div className="relative w-full aspect-[16/10] bg-[#dcd8cd]/40">
                      <Image
                        src={story.cover_image || "/logo-light.webp"}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-105 transition duration-500"
                      />
                      {story.meta?.articleType && ARTICLE_TYPE_BADGES[story.meta.articleType] && (
                        <span
                          className={`absolute top-2 start-2 px-2 py-0.5 text-[10px] font-bold rounded border shadow-2xs ${
                            ARTICLE_TYPE_BADGES[story.meta.articleType].cls
                          }`}
                        >
                          {isUrdu
                            ? ARTICLE_TYPE_BADGES[story.meta.articleType].ur
                            : ARTICLE_TYPE_BADGES[story.meta.articleType].en}
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <Link href={storyHref(story)}>
                        <h2 className={`text-base font-bold text-gray-900 group-hover:text-emerald-700 transition leading-snug line-clamp-2 mb-2 ${isUrdu ? "urdu-headline" : "font-sans"}`}>
                          {title}
                        </h2>
                      </Link>
                      <p className={`text-xs text-gray-600 line-clamp-3 ${isUrdu ? "urdu-body leading-relaxed" : "font-sans leading-normal"}`}>
                        {summary}
                      </p>
                    </div>
                  </div>

                  <div className="px-4 py-2.5 border-t border-[#dcd8cd] flex items-center justify-between text-[11px] text-gray-500 font-sans">
                    <span>{story.author_name || "Daily Afadiat"}</span>
                    <span className="flex items-center gap-1" suppressHydrationWarning>
                      <Clock size={11} />
                      {new Date(story.created_at).toLocaleDateString(isUrdu ? "ur-PK" : "en-US", { timeZone: "Asia/Karachi" })}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* In-page Ad Banner */}
        <AdSlot slotKey="home_mid_banner" className="my-8 max-w-4xl mx-auto" />

        {/* Newsletter Box */}
        <div className="my-10">
          <NewsletterBox />
        </div>
      </main>

      <Footer categories={categories} />
    </div>
  );
}
