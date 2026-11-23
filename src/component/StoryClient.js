"use client";
import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, User, Share2, ArrowRight, ArrowLeft } from "lucide-react";
import Header from "@/component/Header";
import Footer from "@/component/Footer";
import CommentSection from "@/component/CommentSection";
import AdSlot from "@/component/AdSlot";
import NewsletterBox from "@/component/NewsletterBox";
import { useSiteLanguage } from "@/context/SiteLanguageContext";

export default function StoryClient({
  article,
  related = [],
  categories = [],
  breakingNews = [],
  initialLang = null,
}) {
  const { lang, isUrdu: ctxIsUrdu, isEnglish: ctxIsEnglish, dir: ctxDir, t, toggleLanguage, setLanguage } = useSiteLanguage();

  useEffect(() => {
    if (initialLang && (initialLang === "en" || initialLang === "ur")) {
      setLanguage(initialLang);
    }
  }, [initialLang, setLanguage]);

  const effectiveLang = initialLang || lang;
  const isEnglish = effectiveLang === "en" || (!initialLang && ctxIsEnglish);
  const isUrdu = !isEnglish;
  const dir = isUrdu ? "rtl" : "ltr";

  // Automatic View Tracking
  useEffect(() => {
    if (!article?.id) return;
    const viewKey = `afadiat_viewed_${article.id}`;
    if (typeof window !== "undefined" && !sessionStorage.getItem(viewKey)) {
      sessionStorage.setItem(viewKey, "1");
      fetch(`/api/articles/${article.id}/view`, { method: "POST" }).catch(() => {});
    }
  }, [article?.id]);

  const missingEnglishEdition = isEnglish && !(article.title_en && article.title_en.trim());
  const missingUrduEdition = isUrdu && !(article.title_ur && article.title_ur.trim());

  const handleLanguageToggle = () => {
    const targetLang = isEnglish ? "ur" : "en";
    const hasTargetArticle = targetLang === "en"
      ? Boolean(article?.title_en && article.title_en.trim())
      : Boolean(article?.title_ur && article.title_ur.trim());

    try {
      document.cookie = `site_lang=${targetLang}; path=/; max-age=31536000; SameSite=Lax`;
      localStorage.setItem("site_lang", targetLang);
    } catch (e) {}

    if (hasTargetArticle) {
      const targetSlug = article.slug || article.id;
      const targetUrl = targetLang === "en" ? `/en/story/${targetSlug}` : `/story/${targetSlug}`;
      window.location.href = targetUrl;
    } else {
      // If alternate language not available, switch language and refresh to that language's homepage with articles
      const targetHome = targetLang === "en" ? "/en" : "/";
      window.location.href = targetHome;
    }
  };

  const title = isEnglish
    ? (article.title_en || article.title_ur)
    : (article.title_ur || article.title_en);

  const rawContent = isEnglish
    ? (article.content_en || article.content_ur)
    : (article.content_ur || article.content_en);

  // Clean out any metadata comment tags
  const content = rawContent ? rawContent.replace(/<!--excerpt:[\s\S]*?-->\n?/, "") : "";

  const authorName = isEnglish
    ? (article.author_name_en || article.meta?.bylineEn || article.author_name || "Editorial Desk")
    : (article.author_name || article.meta?.bylineUr || "ایڈیٹوریل ڈیسک");

  const categoryName = isEnglish
    ? (article.category?.name_en || article.category?.name_ur || "News")
    : (article.category?.name_ur || article.category?.name_en || "خبر");

  const shareText = encodeURIComponent(
    `${title}\n\n${isEnglish ? "Read on Daily Afadiat:" : "پڑھیے ڈیلی افادیت پر:"}`
  );

  return (
    <div className="min-h-screen text-gray-900" dir={dir}>
      <Header categories={categories} breakingNews={breakingNews} onToggleLanguage={handleLanguageToggle} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Top Leaderboard Ad Banner (Same as Homepage under Header) */}
        <AdSlot slotKey="home-leaderboard" className="mb-6 max-w-5xl mx-auto" />

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-4 font-sans">
          <Link href="/" className="hover:text-emerald-600 transition">
            {t("breadcrumbHome")}
          </Link>
          <span>/</span>
          <span className="text-emerald-700 font-bold">{categoryName}</span>
        </div>

        {/* Main Article Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Article Main Body (8 Cols) */}
          <article className="lg:col-span-8 bg-[#efeee9] border border-[#dcd8cd] rounded-lg p-5 sm:p-7 shadow-sm">
            {missingEnglishEdition || missingUrduEdition ? (
              <div className="py-12 text-center space-y-4 font-sans">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {missingEnglishEdition
                    ? "This story is only published in the Urdu edition"
                    : "یہ خبر صرف انگریزی ایڈیشن میں شائع ہوئی ہے"}
                </h1>
                <p className="text-sm text-gray-600 max-w-md mx-auto">
                  {missingEnglishEdition
                    ? "An English version of this article has not been published."
                    : "اس خبر کا اردو ترجمہ شائع نہیں کیا گیا۔"}
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleLanguageToggle}
                    className="px-4 py-2 rounded-lg bg-[#184e2d] hover:bg-[#0d542f] text-white text-xs sm:text-sm font-semibold cursor-pointer transition"
                  >
                    {missingEnglishEdition ? "اردو میں پڑھیں (Switch to Urdu)" : "Read in English"}
                  </button>
                  <Link
                    href="/"
                    className="px-4 py-2 rounded-lg border border-[#dcd8cd] bg-white text-gray-800 text-xs sm:text-sm font-semibold hover:bg-gray-50 transition"
                  >
                    {isEnglish ? "Back to Home" : "صفحہ اول پر جائیں"}
                  </Link>
                </div>
              </div>
            ) : (
            <>
            <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-snug mb-4 ${isUrdu ? "urdu-headline" : "font-sans"}`}>
              {title}
            </h1>

            {/* Author & Meta Bar */}
            <div className="flex flex-wrap items-center justify-between border-y border-[#dcd8cd] py-3 mb-6 text-xs text-gray-600 font-sans gap-2">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1 font-semibold text-gray-800">
                  <User size={14} className="text-emerald-600" />
                  {authorName}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1" suppressHydrationWarning>
                  <Clock size={14} />
                  {new Date(article.created_at).toLocaleDateString(isUrdu ? "ur-PK" : "en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    timeZone: "Asia/Karachi",
                  })}
                </span>
              </div>

              {/* Social Share Buttons */}
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-xs hidden sm:inline">{t("shareStory")}</span>
                <a
                  href={`https://wa.me/?text=${shareText}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1 transition"
                  title="Share on WhatsApp"
                >
                  <Share2 size={12} />
                  <span>WhatsApp</span>
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1 rounded-full transition"
                  title="Share on Facebook"
                >
                  Facebook
                </a>
              </div>
            </div>

            {/* Lead Image */}
            {article.cover_image && (
              <div className="relative w-full aspect-[16/10] overflow-hidden rounded-lg bg-[#dcd8cd]/40 shadow-sm mb-6">
                <Image
                  src={article.cover_image}
                  alt={title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}

            {/* Content Body */}
            <div
              className={`text-gray-800 leading-loose text-base sm:text-lg space-y-4 ${isUrdu ? "urdu-body" : "font-sans"}`}
              dangerouslySetInnerHTML={{ __html: content }}
            />

            {/* Inline Article Ad Banner */}
            <AdSlot slotKey="article_inline_banner" className="my-6" />

            {/* Verified Comments Section */}
            <CommentSection articleId={article.id} />
            </>
            )}
          </article>

          {/* Sidebar (4 Cols) */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-lg p-5 shadow-sm font-sans">
              <div className="pb-3 mb-4 border-b-2 border-emerald-600">
                <h2 className="text-lg font-bold text-gray-900">
                  {t("latestStoriesSidebar")}
                </h2>
              </div>

              <div className="divide-y divide-[#dcd8cd]">
                {related.map((item) => {
                  const relTitle = isEnglish ? (item.title_en || item.title_ur) : (item.title_ur || item.title_en);
                  return (
                    <div key={item.id} className="py-3 flex gap-3 group">
                      <div className="relative w-20 h-16 shrink-0 rounded overflow-hidden bg-[#dcd8cd]/40">
                        <Image
                          src={item.cover_image || "/logo-light.webp"}
                          alt={relTitle}
                          fill
                          className="object-cover group-hover:scale-105 transition"
                        />
                      </div>
                      <div>
                        <Link href={`/story/${item.id || item.slug}`}>
                          <h3 className={`text-sm font-bold text-gray-800 group-hover:text-emerald-700 transition line-clamp-2 leading-snug ${isUrdu ? "urdu-headline" : "font-sans"}`}>
                            {relTitle}
                          </h3>
                        </Link>
                        <span className="text-xs text-gray-400 font-sans mt-1 block" suppressHydrationWarning>
                          {new Date(item.created_at).toLocaleTimeString(isUrdu ? "ur-PK" : "en-US", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Karachi" })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sidebar Ad (300x250) */}
            <AdSlot slotKey="article_sidebar_300x250" />

            {/* Newsletter Box in Sidebar */}
            <NewsletterBox variant="sidebar" />
          </aside>

        </div>
      </main>

      {/* FOOTER */}
      <Footer categories={categories} />
    </div>
  );
}
