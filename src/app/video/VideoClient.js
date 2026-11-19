"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/component/Header";
import Footer from "@/component/Footer";
import NewsletterBox from "@/component/NewsletterBox";
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

export default function VideoClient({ categories = [], breakingNews = [], initialVideos = [] }) {
  const { isUrdu, isEnglish, dir } = useSiteLanguage();
  const [selectedCat, setSelectedCat] = useState("all");
  const [search, setSearch] = useState("");
  const [activeVideoModal, setActiveVideoModal] = useState(null);

  // Dynamic Video catalog from CMS / Database
  const videoList = (initialVideos && initialVideos.length > 0 ? initialVideos : []).map((v) => ({
    id: v.id,
    category: v.category || "special",
    title_ur: v.title_ur || "",
    title_en: v.title_en || v.title_ur || "",
    summary_ur: v.summary_ur || "",
    summary_en: v.summary_en || v.summary_ur || "",
    content_ur: v.content_ur || v.summary_ur || "",
    content_en: v.content_en || v.summary_en || v.content_ur || "",
    duration: v.duration || "15:00",
    views: v.views_count || v.views || "10K",
    date: v.created_at ? new Date(v.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "Today",
    thumb: v.cover_image || v.thumb || "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop",
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

        {/* Hero Featured Video (Cinema Card) */}
        {selectedCat === "all" && !search && (
          <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-3xl overflow-hidden shadow-sm hover:border-emerald-700 transition">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
              
              {/* Big 16:9 Thumbnail / Play button */}
              <div
                onClick={() => setActiveVideoModal(heroVideo)}
                className="lg:col-span-8 relative aspect-video bg-black cursor-pointer group overflow-hidden"
              >
                <Image
                  src={heroVideo.thumb}
                  alt={heroVideo.title_ur}
                  fill
                  className="object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-center justify-center">
                  <div className="size-16 sm:size-20 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:bg-red-700 transition duration-300">
                    <Play size={32} className="translate-x-1" />
                  </div>
                </div>
                <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-xs text-white text-xs font-mono font-bold px-2.5 py-1 rounded-md">
                  {heroVideo.duration}
                </div>
                <div className="absolute top-3 right-3 bg-emerald-700 text-white text-[11px] font-bold px-2.5 py-1 rounded-md shadow-xs">
                  {isUrdu ? "خصوصی فیچر" : "FEATURED STORY"}
                </div>
              </div>

              {/* Story Details Beside Video */}
              <div className="lg:col-span-4 p-5 sm:p-7 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-xs text-gray-500 font-sans">
                    <span className="flex items-center gap-1">
                      <Eye size={13} />
                      <span>{heroVideo.views} views</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={13} />
                      <span>{heroVideo.date}</span>
                    </span>
                  </div>

                  <h2
                    onClick={() => setActiveVideoModal(heroVideo)}
                    className="text-xl sm:text-2xl font-bold urdu-headline text-gray-900 leading-snug hover:text-emerald-800 transition cursor-pointer"
                  >
                    {isUrdu ? heroVideo.title_ur : heroVideo.title_en}
                  </h2>

                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-sans line-clamp-3">
                    {isUrdu ? heroVideo.summary_ur : heroVideo.summary_en}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#dcd8cd] flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800">
                    {isEnglish ? heroVideo.author_en : heroVideo.author_ur}
                  </span>
                  <button
                    onClick={() => setActiveVideoModal(heroVideo)}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                  >
                    <Play size={13} />
                    <span>{isUrdu ? "ویڈیو دیکھیں" : "Watch Video"}</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Video Grid Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#dcd8cd]">
            <h2 className="text-lg sm:text-xl font-bold urdu-headline text-gray-900">
              {isUrdu ? "تازہ ترین ویڈیو پیکجز" : "Latest Video Packages"}
            </h2>
            <span className="text-xs text-gray-500 font-mono">
              {filtered.length} {isUrdu ? "ویڈیوز" : "videos"}
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="p-12 text-center text-sm text-gray-500 bg-[#efeee9] rounded-2xl border border-[#dcd8cd]">
              {isUrdu ? "کوئی ویڈیو دستیاب نہیں ہے۔" : "No videos found matching your search."}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((v) => (
                <div
                  key={v.id}
                  onClick={() => setActiveVideoModal(v)}
                  className="bg-[#efeee9] border border-[#dcd8cd] rounded-2xl overflow-hidden shadow-xs hover:border-emerald-600 transition group cursor-pointer flex flex-col justify-between"
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
                      <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold">
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

                      <h3 className="text-sm font-bold urdu-headline text-gray-900 line-clamp-2 leading-snug group-hover:text-emerald-800 transition">
                        {isUrdu ? v.title_ur : v.title_en}
                      </h3>

                      <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed">
                        {isUrdu ? v.summary_ur : v.summary_en}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 pt-0 border-t border-[#dcd8cd]/50 flex items-center justify-between text-xs text-gray-500">
                    <span className="font-semibold text-emerald-800 text-[11px]">
                      {isEnglish ? v.author_en : v.author_ur}
                    </span>
                    <span className="text-emerald-700 font-bold group-hover:underline flex items-center gap-1">
                      <span>{isUrdu ? "چلائیں" : "Play"}</span>
                      <Play size={10} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
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
