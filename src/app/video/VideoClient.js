"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/component/Header";
import Footer from "@/component/Footer";
import NewsletterBox from "@/component/NewsletterBox";
import MostReadWidget from "@/component/widgets/MostReadWidget";
import { useSiteLanguage } from "@/context/SiteLanguageContext";
import {
  Play,
  Video,
  Clock,
  Eye,
  Search,
  Filter,
  Flame,
  Share2,
  X,
  CheckCircle2,
} from "lucide-react";

function getEmbedUrl(url) {
  if (!url) return "https://www.youtube.com/embed/dQw4w9WgXcQ";
  if (url.includes("youtube.com/embed/")) return url;
  const matchWatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (matchWatch) return `https://www.youtube.com/embed/${matchWatch[1]}`;
  const matchShort = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (matchShort) return `https://www.youtube.com/embed/${matchShort[1]}`;
  return url;
}

export default function VideoClient({
  categories = [],
  breakingNews = [],
  initialVideos = [],
  mostReadStories = [],
}) {
  const { isUrdu, isEnglish, dir } = useSiteLanguage();
  const [videosData, setVideosData] = useState(initialVideos || []);
  const [selectedCat, setSelectedCat] = useState("all");
  const [search, setSearch] = useState("");
  const [activeVideoModal, setActiveVideoModal] = useState(null);
  const [isHeroPlaying, setIsHeroPlaying] = useState(false);
  const viewedIdsRef = useRef(new Set());

  useEffect(() => {
    let active = true;
    fetch("/api/videos", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active && Array.isArray(data?.videos) && data.videos.length > 0) {
          setVideosData(data.videos);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const formatViews = (raw) => {
    if (typeof raw === "number" && Number.isFinite(raw)) {
      return raw.toLocaleString();
    }
    if (/^\d+$/.test(String(raw || "").trim())) {
      return Number(raw).toLocaleString();
    }
    return raw || "0";
  };

  const trackVideoView = async (videoId) => {
    const key = String(videoId);
    if (!key || viewedIdsRef.current.has(key)) return;
    viewedIdsRef.current.add(key);

    try {
      const res = await fetch(`/api/videos/${encodeURIComponent(key)}/view`, {
        method: "POST",
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.views_count !== undefined) {
        const formatted = formatViews(data.views_count);
        setVideosData((prev) =>
          prev.map((item) =>
            String(item.id) === key ? { ...item, views_count: data.views_count } : item
          )
        );
        setActiveVideoModal((prev) =>
          prev && String(prev.id) === key ? { ...prev, views: formatted } : prev
        );
      }
    } catch {}
  };

  const handleOpenVideo = (v) => {
    setActiveVideoModal(v);
    trackVideoView(v.id);
  };

  const handlePlayHero = (hero) => {
    setIsHeroPlaying(true);
    if (hero?.id) trackVideoView(hero.id);
  };

  // Dynamic Video catalog from CMS / Database
  const videoList = (videosData && videosData.length > 0 ? videosData : []).map((v) => ({
    id: v.id,
    category: v.category || "special",
    title_ur: v.title_ur || "",
    title_en: v.title_en || v.title_ur || "",
    summary_ur: v.summary_ur || "",
    summary_en: v.summary_en || v.summary_ur || "",
    content_ur: v.content_ur || v.summary_ur || "",
    content_en: v.content_en || v.summary_en || v.content_ur || "",
    duration: v.duration || "15:00",
    views: formatViews(v.views_count !== undefined ? v.views_count : v.views || 0),
    date: v.created_at ? new Date(v.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "Today",
    thumb: v.cover_image || v.thumb || "/logo-light.webp",
    author_ur: v.author_name || v.author || "ڈیلی افادیت نیوز روم",
    author_en: v.author_en || "Daily Afadiat Newsroom",
    featured: Boolean(v.is_featured !== undefined ? v.is_featured : v.featured),
    videoUrl: getEmbedUrl(v.video_url || v.videoUrl),
  }));

  const catTabs = [
    { key: "all", name_ur: "تمام ویڈیوز", name_en: "All Videos" },
    { key: "special", name_ur: "خصوصی رپورٹس", name_en: "Special Reports" },
    { key: "bulletin", name_ur: "نیوز بلیٹنز", name_en: "News Bulletins" },
    { key: "economy", name_ur: "بزنس و معیشت", name_en: "Business & Economy" },
    { key: "tech", name_ur: "سائنس و ٹیکنالوجی", name_en: "Science & Tech" },
    { key: "sports", name_ur: "کھیل و اسپورٹس", name_en: "Sports News" },
    { key: "interviews", name_ur: "خصوصی انٹرویوز", name_en: "Interviews" },
  ];

  const filtered = videoList.filter((v) => {
    const matchCat = selectedCat === "all" || v.category === selectedCat;
    const matchSearch =
      v.title_ur.toLowerCase().includes(search.toLowerCase()) ||
      v.title_en.toLowerCase().includes(search.toLowerCase()) ||
      v.summary_ur.toLowerCase().includes(search.toLowerCase()) ||
      v.summary_en.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const heroVideo = videoList.find((v) => v.featured) || videoList[0];

  return (
    <div className="min-h-screen bg-[#f7f6f3] flex flex-col font-sans" dir={dir}>
      <Header categories={categories} breakingNews={breakingNews} />

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Page Title & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#dcd8cd]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 bg-emerald-800 text-white text-xs font-bold px-2.5 py-0.5 rounded-full font-sans">
                <Video size={13} />
                <span>AFADIAT MULTIMEDIA HUB</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold urdu-headline text-gray-900">
              {isUrdu ? "ویڈیو نیوز و خصوصی ڈاکومنٹریز" : "Daily Afadiat Video News & Documentaries"}
            </h1>
          </div>

          {/* Video Search input */}
          <div className="flex items-center gap-2 bg-white border border-[#dcd8cd] rounded-xl px-3.5 py-2 w-full sm:w-80 shadow-xs focus-within:border-emerald-600">
            <Search size={16} className="text-gray-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isUrdu ? "ویڈیو تلاش کیجیے..." : "Search videos..."}
              className="w-full text-xs outline-none bg-transparent"
            />
          </div>
        </div>

        {/* Category Filters Reel */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {catTabs.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setSelectedCat(cat.key)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap border ${
                selectedCat === cat.key
                  ? "bg-emerald-800 text-white border-emerald-900 shadow-xs"
                  : "bg-white text-gray-700 border-[#dcd8cd] hover:bg-gray-100"
              }`}
            >
              {isUrdu ? cat.name_ur : cat.name_en}
            </button>
          ))}
        </div>

        {/* Archive Top Hero: 1 Large Lead Video (Inline Playable) + 4 Side Rail Videos */}
        {selectedCat === "all" && !search && heroVideo && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            {/* Lead Video Card (7 cols) */}
            <div className="lg:col-span-7 bg-[#efeee9] border border-[#dcd8cd] overflow-hidden shadow-xs flex flex-col justify-between">
              <div className="relative aspect-video bg-black overflow-hidden">
                {isHeroPlaying && heroVideo.videoUrl ? (
                  <iframe
                    src={`${heroVideo.videoUrl}${heroVideo.videoUrl.includes("?") ? "&" : "?"}autoplay=1`}
                    title={heroVideo.title_en || heroVideo.title_ur}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div
                    onClick={() => handlePlayHero(heroVideo)}
                    className="w-full h-full relative cursor-pointer group"
                  >
                    <Image
                      src={heroVideo.thumb}
                      alt={heroVideo.title_ur}
                      fill
                      className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-center justify-center">
                      <div className="size-16 sm:size-20 rounded-full bg-red-600/95 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-red-700 transition duration-300">
                        <Play size={30} className="translate-x-0.5" />
                      </div>
                    </div>
                    <div className="absolute bottom-3 left-3 bg-black/80 text-white text-xs font-mono font-bold px-2.5 py-1">
                      {heroVideo.duration}
                    </div>
                    <div className="absolute top-3 right-3 bg-[#184e2d] text-white text-[11px] font-bold px-2.5 py-1 shadow-xs">
                      {isUrdu ? "خصوصی ویڈیو" : "FEATURED VIDEO"}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 sm:p-5 space-y-2.5 flex-1 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 text-xs text-gray-500 font-sans">
                    <span className="flex items-center gap-1">
                      <Eye size={13} />
                      <span>{heroVideo.views}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={13} />
                      <span>{heroVideo.date}</span>
                    </span>
                  </div>
                  <h2
                    onClick={() => handleOpenVideo(heroVideo)}
                    className="text-xl sm:text-2xl font-bold urdu-headline text-gray-900 leading-snug hover:text-[#184e2d] transition cursor-pointer"
                  >
                    {isUrdu ? heroVideo.title_ur : heroVideo.title_en}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-sans line-clamp-2">
                    {isUrdu ? heroVideo.summary_ur : heroVideo.summary_en}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-[#dcd8cd] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#184e2d]">
                    {isEnglish ? heroVideo.author_en : heroVideo.author_ur}
                  </span>
                  <div className="flex items-center gap-2">
                    {!isHeroPlaying && (
                      <button
                        type="button"
                        onClick={() => handlePlayHero(heroVideo)}
                        className="bg-[#184e2d] hover:bg-[#113820] text-white text-xs font-bold px-3.5 py-1.5 flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Play size={12} />
                        <span>{isUrdu ? "یہاں چلائیں" : "Play Inline"}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleOpenVideo(heroVideo)}
                      className="bg-white border border-[#dcd8cd] hover:border-[#184e2d] text-gray-800 text-xs font-bold px-3 py-1.5 transition cursor-pointer"
                    >
                      {isUrdu ? "تفصیل" : "Details"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 4 Side Rail Videos (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-3 justify-between">
              {videoList.slice(1, 5).map((sv) => (
                <div
                  key={sv.id}
                  onClick={() => handleOpenVideo(sv)}
                  className="bg-[#efeee9] border border-[#dcd8cd] hover:border-[#184e2d] p-2.5 flex gap-3 items-center cursor-pointer group transition flex-1"
                >
                  <div className="relative w-32 sm:w-36 aspect-video shrink-0 bg-black overflow-hidden">
                    <Image
                      src={sv.thumb}
                      alt={sv.title_ur}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <div className="size-8 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow">
                        <Play size={14} className="translate-x-0.5" />
                      </div>
                    </div>
                    <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[10px] font-mono px-1.5 py-0.5 font-bold">
                      {sv.duration}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="text-sm font-bold urdu-headline text-gray-900 line-clamp-2 leading-snug group-hover:text-[#184e2d] transition">
                      {isUrdu ? sv.title_ur : sv.title_en}
                    </h3>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500 font-sans">
                      <span>{sv.date}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Eye size={11} />
                        {sv.views}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Videos Grid + Right Sidebar (Most Read & Follow Us) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left / Main Column (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b-2 border-[#184e2d]">
              <h2 className="text-lg sm:text-xl font-bold urdu-headline text-gray-900">
                {isUrdu ? "مزید ویڈیوز و پیکجز" : "More Video Reports"}
              </h2>
              <span className="text-xs text-gray-500 font-mono">
                {filtered.length} {isUrdu ? "ویڈیوز" : "videos"}
              </span>
            </div>

            {filtered.length === 0 ? (
              <div className="p-12 text-center text-sm text-gray-500 bg-[#efeee9] border border-[#dcd8cd]">
                {isUrdu ? "کوئی ویڈیو دستیاب نہیں ہے۔" : "No videos found matching your search."}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {filtered.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => handleOpenVideo(v)}
                    className="bg-[#efeee9] border border-[#dcd8cd] overflow-hidden shadow-xs hover:border-[#184e2d] transition group cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      {/* Thumbnail */}
                      <div className="relative aspect-video w-full overflow-hidden bg-gray-200">
                        <Image
                          src={v.thumb}
                          alt={v.title_ur}
                          fill
                          className="object-cover group-hover:scale-105 transition duration-300"
                        />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-80 group-hover:opacity-100 transition">
                          <div className="size-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition">
                            <Play size={20} className="translate-x-0.5" />
                          </div>
                        </div>
                        <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-mono px-2 py-0.5 font-bold">
                          {v.duration}
                        </span>
                      </div>

                      {/* Metadata & Title */}
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-gray-500 font-sans">
                          <span className="flex items-center gap-1">
                            <Eye size={12} />
                            <span>{v.views}</span>
                          </span>
                          <span>{v.date}</span>
                        </div>

                        <h3 className="text-sm font-bold urdu-headline text-gray-900 line-clamp-2 leading-snug group-hover:text-[#184e2d] transition">
                          {isUrdu ? v.title_ur : v.title_en}
                        </h3>

                        <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">
                          {isUrdu ? v.summary_ur : v.summary_en}
                        </p>
                      </div>
                    </div>

                    <div className="p-4 pt-2 border-t border-[#dcd8cd]/50 flex items-center justify-between text-xs text-gray-500">
                      <span className="font-semibold text-[#184e2d] text-[11px]">
                        {isEnglish ? v.author_en : v.author_ur}
                      </span>
                      <span className="text-[#184e2d] font-bold group-hover:underline flex items-center gap-1">
                        <span>{isUrdu ? "چلائیں" : "Play"}</span>
                        <Play size={10} />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar (4 cols): Most Read + Follow Us */}
          <aside className="lg:col-span-4 space-y-6">
            {mostReadStories && mostReadStories.length > 0 && (
              <MostReadWidget stories={mostReadStories} />
            )}

            {/* Follow Us Card (scraped-site style, safe inline SVGs) */}
            <div className="bg-[#efeee9] border border-[#dcd8cd] p-4 space-y-3">
              <div className="border-b-2 border-[#184e2d] pb-2 flex items-center justify-between">
                <h3 className="text-base font-black text-gray-900 urdu-headline">
                  {isUrdu ? "ہمیں فالو کریں" : "Follow Us"}
                </h3>
                <span className="text-[11px] font-bold text-[#184e2d] font-sans">
                  @dailyafadiat
                </span>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                {isUrdu
                  ? "تازہ ترین ویڈیو رپورٹس، بریکنگ نیوز اور خصوصی پروگرامز کے لیے ہمارے سوشل میڈیا چینلز جوائن کریں۔"
                  : "Join our official social channels for breaking news alerts, field reports, and special shows."}
              </p>
              <div className="grid grid-cols-2 gap-2.5 text-xs font-bold">
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#cc0000] hover:opacity-90 text-white py-2.5 px-3 transition"
                >
                  <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true">
                    <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31.2 31.2 0 0 0 0 12a31.2 31.2 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.2 31.2 0 0 0 24 12a31.2 31.2 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z" />
                  </svg>
                  <span>YouTube</span>
                </a>
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#1877f2] hover:opacity-90 text-white py-2.5 px-3 transition"
                >
                  <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true">
                    <path d="M22 12a10 10 0 1 0-11.6 9.9v-7h-2.5V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12z" />
                  </svg>
                  <span>Facebook</span>
                </a>
                <a
                  href="https://x.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-black hover:opacity-90 text-white py-2.5 px-3 transition"
                >
                  <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true">
                    <path d="M18.2 2.25h3.3l-7.2 8.23 8.5 11.27h-6.6l-5.2-6.8-6 6.8H1.7l7.7-8.8L1.2 2.25H8l4.7 6.2 5.5-6.2zm-1.2 17.5h1.8L7.1 4.1H5.2l11.8 15.65z" />
                  </svg>
                  <span>X / Twitter</span>
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-[#e1306c] hover:opacity-90 text-white py-2.5 px-3 transition"
                >
                  <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden="true">
                    <path d="M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2zm-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4H7.6zm9.65 1.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
                  </svg>
                  <span>Instagram</span>
                </a>
              </div>
            </div>
          </aside>
        </div>

        {/* Modal Player when Video Clicked */}
        {activeVideoModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
            <div className="bg-[#111] border border-gray-700 rounded-3xl overflow-hidden max-w-4xl w-full shadow-2xl relative">
              {/* Close Button */}
              <button
                onClick={() => setActiveVideoModal(null)}
                className="absolute top-3 right-3 z-10 size-9 rounded-full bg-black/70 text-white hover:bg-red-600 flex items-center justify-center transition cursor-pointer"
              >
                <X size={18} />
              </button>

              {/* Responsive Video Container */}
              <div className="relative aspect-video w-full bg-black">
                {activeVideoModal.videoUrl ? (
                  <iframe
                    src={activeVideoModal.videoUrl + "?autoplay=1"}
                    title={activeVideoModal.title_en}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 text-white space-y-3">
                    <div className="size-16 rounded-full bg-red-600 flex items-center justify-center animate-pulse">
                      <Play size={32} className="translate-x-1" />
                    </div>
                    <h3 className="text-lg font-bold urdu-headline">
                      {isUrdu ? activeVideoModal.title_ur : activeVideoModal.title_en}
                    </h3>
                    <p className="text-xs text-gray-400 max-w-md">
                      {isUrdu
                        ? "ڈیلی افادیت ویڈیو پلیئر: ایچ ڈی اسٹریمنگ فعال ہے۔"
                        : "Daily Afadiat HD Digital Video Stream Active."}
                    </p>
                  </div>
                )}
              </div>

              {/* Video Info under player */}
              <div className="p-5 bg-zinc-900 text-white space-y-3">
                <div className="flex items-center gap-3 text-xs text-gray-400 font-sans">
                  <span>{activeVideoModal.views} views</span>
                  <span>•</span>
                  <span>{activeVideoModal.date}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-semibold">
                    {isEnglish ? activeVideoModal.author_en : activeVideoModal.author_ur}
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-bold urdu-headline leading-relaxed">
                  {isUrdu ? activeVideoModal.title_ur : activeVideoModal.title_en}
                </h2>
                <p className="text-xs text-gray-300 leading-relaxed font-sans">
                  {isUrdu ? activeVideoModal.summary_ur : activeVideoModal.summary_en}
                </p>

                {/* Detailed transcription / coverage highlights */}
                {(activeVideoModal.content_ur || activeVideoModal.content_en) && (
                  <div className="pt-3 border-t border-gray-800 text-xs text-gray-400 leading-relaxed font-sans">
                    <span className="text-[10px] uppercase font-bold text-gray-500 block mb-1">
                      {isUrdu ? "تفصیلی تجزیہ و اہم نکات" : "Detailed Overview & Highlights"}
                    </span>
                    <p className="whitespace-pre-line">
                      {isUrdu ? activeVideoModal.content_ur : activeVideoModal.content_en}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Newsletter Subscription */}
        <NewsletterBox />

      </main>

      <Footer categories={categories} />
    </div>
  );
}
