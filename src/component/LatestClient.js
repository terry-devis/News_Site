"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/component/Header";
import Footer from "@/component/Footer";
import { useSiteLanguage } from "@/context/SiteLanguageContext";

const PAGE_SIZE = 20;

const DEFAULT_SOCIAL_LINKS = {
  youtube: "https://youtube.com/@dailyafadiat",
  whatsapp: "https://whatsapp.com",
  facebook: "https://facebook.com/dailyafadiat",
  instagram: "https://instagram.com/dailyafadiat",
  twitter: "https://x.com/dailyafadiat",
  tiktok: "https://tiktok.com/@dailyafadiat",
  threads: "https://threads.net/@dailyafadiat",
};

const SOCIAL_ITEMS = [
  {
    key: "youtube",
    label: "YouTube",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.885 3.488" />
      </svg>
    ),
  },
  {
    key: "facebook",
    label: "Facebook",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    key: "instagram",
    label: "Instagram",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    key: "twitter",
    label: "X (Twitter)",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    key: "tiktok",
    label: "TikTok",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
  },
  {
    key: "threads",
    label: "Threads",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.781 3.631 2.695 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.194.02 5.097 1.975 5.287 5.388.108.046.216.094.324.145 1.52.715 2.631 1.796 3.21 3.128.809 1.86.884 4.893-1.582 7.312-1.885 1.847-4.173 2.681-7.317 2.703zm1.276-11.63c-.244 0-.492.008-.744.023-1.842.104-2.98.952-2.916 2.15.067 1.256 1.452 1.84 2.784 1.768 1.224-.066 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.21-.229z" />
      </svg>
    ),
  },
];

function getPktDateKey(dateValue) {
  try {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Karachi",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date(dateValue));
  } catch {
    return "";
  }
}

function formatDateLabel(dateValue) {
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Karachi",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(dateValue));
  } catch {
    return "";
  }
}

function formatTimePkt(dateValue) {
  try {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Karachi",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
      .format(new Date(dateValue))
      .toLowerCase();
  } catch {
    return "";
  }
}

export default function LatestClient({
  initialArticles = [],
  initialHasMore = false,
  initialMostRead = [],
  categories = [],
  breakingNews = [],
  socialLinks = null,
  breakingTickerEnabled = null,
  initialLang = null,
  initialLoadedLang = "ur",
}) {
  const { lang, isEnglish: ctxIsEnglish, setLanguage } = useSiteLanguage();

  useEffect(() => {
    if (initialLang && (initialLang === "en" || initialLang === "ur")) {
      setLanguage(initialLang);
    }
  }, [initialLang, setLanguage]);

  const effectiveLang = initialLang || lang;
  const isEnglish = effectiveLang === "en" || (!initialLang && ctxIsEnglish);
  const isUrdu = !isEnglish;
  const dir = isUrdu ? "rtl" : "ltr";
  const targetLang = isEnglish ? "en" : "ur";

  const [articles, setArticles] = useState(initialArticles);
  const [hasMore, setHasMore] = useState(Boolean(initialHasMore));
  const [mostRead, setMostRead] = useState(initialMostRead);
  const [loadingMore, setLoadingMore] = useState(false);
  const [switchingLang, setSwitchingLang] = useState(false);
  const activeLangRef = useRef(initialLoadedLang || "ur");

  // If rendered on /latest (without locked initialLang) and cookie/toggle language differs, fetch matching edition
  useEffect(() => {
    if (initialLang) return;
    if (activeLangRef.current === targetLang) return;

    let cancelled = false;
    activeLangRef.current = targetLang;
    setSwitchingLang(true);

    fetch(`/api/public/latest?offset=0&limit=${PAGE_SIZE}&lang=${targetLang}&includeSidebar=1`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data) return;
        setArticles(Array.isArray(data.articles) ? data.articles : []);
        setHasMore(Boolean(data.hasMore));
        if (Array.isArray(data.mostRead)) {
          setMostRead(data.mostRead);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setSwitchingLang(false);
      });

    return () => {
      cancelled = true;
    };
  }, [initialLang, targetLang]);

  const visibleArticles = useMemo(() => {
    return (articles || []).filter((a) =>
      isEnglish ? Boolean(a.title_en && a.title_en.trim()) : Boolean(a.title_ur && a.title_ur.trim())
    );
  }, [articles, isEnglish]);

  const visibleMostRead = useMemo(() => {
    return (mostRead || []).filter((a) =>
      isEnglish ? Boolean(a.title_en && a.title_en.trim()) : Boolean(a.title_ur && a.title_ur.trim())
    );
  }, [mostRead, isEnglish]);

  // Group chronological articles by PKT date
  const groupedTimeline = useMemo(() => {
    const groups = [];
    const map = new Map();
    for (const story of visibleArticles) {
      const dateKey = getPktDateKey(story.created_at);
      if (!map.has(dateKey)) {
        const group = {
          dateKey,
          dateLabel: formatDateLabel(story.created_at),
          items: [],
        };
        map.set(dateKey, group);
        groups.push(group);
      }
      map.get(dateKey).items.push(story);
    }
    return groups;
  }, [visibleArticles]);

  const getTitle = (story) => {
    if (!story) return "";
    return isEnglish ? story.title_en || story.title_ur : story.title_ur || story.title_en;
  };

  const getCatName = (cat) => {
    if (!cat) return isEnglish ? "News" : "خبر";
    return isEnglish ? cat.name_en || cat.name_ur || "News" : cat.name_ur || cat.name_en || "خبر";
  };

  const storyHref = (story) =>
    isEnglish && story?.title_en
      ? `/en/story/${story?.slug || story?.id}`
      : `/story/${story?.slug || story?.id}`;

  const handleLoadMore = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const res = await fetch(
        `/api/public/latest?offset=${visibleArticles.length}&limit=${PAGE_SIZE}&lang=${targetLang}`
      );
      if (res.ok) {
        const data = await res.json();
        const incoming = Array.isArray(data.articles) ? data.articles : [];
        setArticles((prev) => {
          const seen = new Set(prev.map((item) => item.id));
          const merged = [...prev];
          for (const art of incoming) {
            if (!seen.has(art.id)) {
              seen.add(art.id);
              merged.push(art);
            }
          }
          return merged;
        });
        setHasMore(Boolean(data.hasMore));
      }
    } catch (err) {
      console.error("Load more latest error:", err);
    } finally {
      setLoadingMore(false);
    }
  };

  const resolvedSocial = {
    ...DEFAULT_SOCIAL_LINKS,
    ...(socialLinks || {}),
  };

  return (
    <div className="min-h-screen flex flex-col text-gray-900" dir={dir}>
      <Header
        categories={categories}
        breakingNews={breakingNews}
        initialTickerEnabled={breakingTickerEnabled}
      />

      <main id="main" className="flex-1">
        <div className="u-shell py-5 sm:py-6">
          {/* Page Header Banner */}
          <header className="border-b-2 border-[#dc2626] mb-6 flex items-center gap-3 pb-3">
            <span
              className="bg-[#dc2626] w-2.5 h-2.5 shrink-0 animate-pulse rounded-full motion-reduce:animate-none"
              aria-hidden="true"
            />
            <div className="min-w-0">
              <h1
                className={`text-2xl leading-tight font-bold text-gray-900 sm:text-3xl lg:text-[2.125rem] ${
                  isUrdu ? "urdu-headline" : "font-sans"
                }`}
              >
                {isUrdu ? "تازہ ترین خبریں" : "Latest News"}
              </h1>
              <p className={`text-gray-600 mt-1 text-sm ${isUrdu ? "urdu-body" : "font-sans"}`}>
                {isUrdu
                  ? "تمام سیکشنز کی خبریں، تازہ ترین پہلے۔"
                  : "Stories from all sections, newest first."}
              </p>
            </div>
          </header>

          {/* 12-Column Timeline + Sidebar Layout */}
          <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
            {/* Chronological Timeline (8 Cols) */}
            <div className="lg:col-span-8">
              {switchingLang ? (
                <div className="space-y-4 py-4">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div key={n} className="h-20 rounded bg-[#efeee9] animate-pulse" />
                  ))}
                </div>
              ) : groupedTimeline.length === 0 ? (
                <div className="border border-[#dcd8cd] bg-[#efeee9]/60 p-10 text-center">
                  <p className={`text-gray-600 text-sm ${isUrdu ? "urdu-body" : "font-sans"}`}>
                    {isUrdu
                      ? "فی الحال کوئی تازہ خبر دستیاب نہیں ہے۔"
                      : "No latest stories are currently available."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-[auto_1fr] gap-x-3 sm:gap-x-5">
                  {groupedTimeline.map((group) => (
                    <React.Fragment key={group.dateKey}>
                      <h2
                        suppressHydrationWarning
                        className="text-gray-500 col-span-2 mb-3 border-t border-[#dcd8cd] pt-3 text-xs font-semibold tracking-[0.14em] uppercase first:border-t-0 first:pt-0 font-sans"
                      >
                        {group.dateLabel}
                      </h2>

                      {group.items.map((story) => {
                        const title = getTitle(story);
                        const catName = getCatName(story.category);
                        return (
                          <React.Fragment key={story.id}>
                            <time
                              dateTime={story.created_at}
                              dir="ltr"
                              suppressHydrationWarning
                              className="text-gray-500 w-11 pt-0.5 text-end text-xs font-semibold tabular-nums sm:w-16 sm:text-[0.8125rem] font-sans"
                            >
                              {formatTimePkt(story.created_at)}
                            </time>

                            <div className="border-[#dcd8cd] relative border-s-2 ps-4 pb-6 sm:ps-6">
                              <span
                                aria-hidden="true"
                                className="bg-[#184e2d] ring-[#f7f6f3] absolute -start-[7px] top-1.5 w-3 h-3 rounded-full ring-4"
                              />
                              <Link className="group block" href={storyHref(story)}>
                                <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-none">
                                  <span className="text-[#184e2d] font-semibold">{catName}</span>
                                  {story.is_breaking && (
                                    <span className="text-[#dc2626] font-bold">
                                      {isUrdu ? "• بریکنگ" : "• Breaking"}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-start gap-3">
                                  <h3
                                    className={`flex-1 text-base leading-snug font-bold text-gray-900 group-hover:text-[#184e2d] transition-colors sm:text-lg line-clamp-3 ${
                                      isUrdu ? "urdu-headline" : "font-sans"
                                    }`}
                                  >
                                    {title}
                                  </h3>
                                  {story.cover_image && (
                                    <div className="relative block overflow-hidden rounded w-20 shrink-0 sm:w-24 aspect-[4/3] bg-[#efeee9] border border-[#dcd8cd]/70">
                                      <Image
                                        src={story.cover_image}
                                        alt={title}
                                        fill
                                        sizes="(max-width: 640px) 80px, 96px"
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                      />
                                    </div>
                                  )}
                                </div>
                              </Link>
                            </div>
                          </React.Fragment>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              )}

              {/* Load More Button */}
              {hasMore && !switchingLang && (
                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    className={`border border-[#dcd8cd] bg-white hover:border-[#184e2d] hover:text-[#184e2d] text-gray-900 rounded px-6 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 ${
                      isUrdu ? "urdu-body" : "font-sans"
                    }`}
                  >
                    {loadingMore
                      ? isUrdu
                        ? "لوڈ ہو رہا ہے..."
                        : "Loading..."
                      : isUrdu
                      ? "مزید خبریں"
                      : "Load more"}
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar: Most Read + Follow Us (4 Cols) */}
            <aside className="space-y-6 lg:col-span-4">
              {visibleMostRead.length > 0 && (
                <section className="border border-[#dcd8cd] bg-white/80">
                  <h2
                    className={`border-b border-[#dcd8cd] text-[#dc2626] px-4 py-3 text-base font-bold leading-tight ${
                      isUrdu ? "urdu-headline" : "font-sans"
                    }`}
                  >
                    {isUrdu ? "زیادہ پڑھی گئیں" : "Most Read"}
                  </h2>
                  <div className="px-4">
                    {visibleMostRead.slice(0, 8).map((item, idx) => {
                      const itemTitle = getTitle(item);
                      return (
                        <article
                          key={item.id}
                          className="group border-b border-[#dcd8cd] last:border-b-0"
                        >
                          <Link
                            href={storyHref(item)}
                            className="hover:bg-[#efeee9]/70 -mx-2 flex items-start gap-3 px-2 py-3 transition-colors"
                          >
                            <span
                              dir="ltr"
                              className="text-[#184e2d] mt-0.5 w-6 shrink-0 text-center text-xl font-extrabold tabular-nums leading-none font-sans"
                            >
                              {idx + 1}
                            </span>

                            {item.cover_image && (
                              <div className="relative block overflow-hidden rounded w-16 shrink-0 aspect-[4/3] bg-[#efeee9] border border-[#dcd8cd]/60">
                                <Image
                                  src={item.cover_image}
                                  alt={itemTitle}
                                  fill
                                  sizes="72px"
                                  className="object-cover"
                                />
                              </div>
                            )}

                            <span className="min-w-0 flex-1">
                              <h3
                                className={`text-sm sm:text-[0.95rem] font-bold text-gray-900 group-hover:text-[#184e2d] transition-colors line-clamp-3 leading-snug ${
                                  isUrdu ? "urdu-headline" : "font-sans"
                                }`}
                              >
                                {itemTitle}
                              </h3>
                              <div className="text-gray-500 mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs leading-normal font-sans">
                                <span className="text-[#184e2d] font-semibold">
                                  {getCatName(item.category)}
                                </span>
                                <span aria-hidden="true">·</span>
                                <time dir="ltr" dateTime={item.created_at} suppressHydrationWarning>
                                  {formatDateLabel(item.created_at)}
                                </time>
                              </div>
                            </span>
                          </Link>
                        </article>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Follow Us Card */}
              <section className="border border-[#dcd8cd] bg-white/80 p-4">
                <p className="text-gray-500 text-[0.6875rem] font-semibold tracking-[0.14em] uppercase mb-3 font-sans">
                  {isUrdu ? "ہمیں فالو کریں" : "Follow Us"}
                </p>
                <ul className="flex flex-wrap items-center gap-2">
                  {SOCIAL_ITEMS.map((item) => {
                    const href = resolvedSocial[item.key];
                    if (!href) return null;
                    return (
                      <li key={item.key}>
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={item.label}
                          title={item.label}
                          className="border border-[#dcd8cd] text-gray-600 hover:border-[#184e2d] hover:text-[#184e2d] inline-flex w-9 h-9 items-center justify-center rounded-full transition-colors bg-[#f7f6f3]/60 hover:bg-white"
                        >
                          {item.icon}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </section>
            </aside>
          </div>
        </div>
      </main>

      <Footer categories={categories} />
    </div>
  );
}
