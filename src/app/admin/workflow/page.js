"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Columns,
  RefreshCw,
  Plus,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  Edit,
  Globe,
  Search,
  Calendar,
  AlertCircle,
  Sparkles,
  Flame,
} from "lucide-react";

const STAGES = [
  { id: "draft", label_ur: "مسودہ", label_en: "Draft", dot: "bg-gray-400", border: "border-gray-200" },
  { id: "in_review", label_ur: "زیر جائزہ", label_en: "In review", dot: "bg-amber-500", border: "border-amber-200" },
  { id: "ready", label_ur: "تیار", label_en: "Ready", dot: "bg-indigo-600", border: "border-indigo-200" },
  { id: "scheduled", label_ur: "شیڈول شدہ", label_en: "Scheduled", dot: "bg-blue-600", border: "border-blue-200" },
  { id: "published", label_ur: "شائع شدہ", label_en: "Published", dot: "bg-emerald-600", border: "border-emerald-200" },
];

const SECTIONS = [
  { id: "all", name_ur: "تمام ڈیسک", name_en: "All desks" },
  { id: "قومی", name_ur: "قومی", name_en: "National" },
  { id: "بین الاقوامی", name_ur: "بین الاقوامی", name_en: "International" },
  { id: "تجارت و کاروبار", name_ur: "تجارت و کاروبار", name_en: "Business" },
  { id: "کھیل", name_ur: "کھیل", name_en: "Sports" },
  { id: "شوبز", name_ur: "شوبز", name_en: "Entertainment" },
  { id: "صحت و سائنس", name_ur: "صحت و سائنس", name_en: "Health & Science" },
  { id: "رائے و اداریے", name_ur: "رائے و اداریے", name_en: "Opinion" },
  { id: "بلاگز", name_ur: "بلاگز", name_en: "Blogs" },
  { id: "جرائم", name_ur: "جرائم و عدلیہ", name_en: "Crime" },
  { id: "موسم و ماحولیات", name_ur: "موسم و ماحولیات", name_en: "Climate" },
  { id: "ویڈیوز", name_ur: "ویڈیوز", name_en: "Videos" },
];

export default function WorkflowPage() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeEdition, setActiveEdition] = useState("all"); // 'all' | 'ur' | 'en'
  const [selectedSection, setSelectedSection] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [transitioningId, setTransitioningId] = useState(null);
  const [toastNotice, setToastNotice] = useState(null);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/articles?limit=100");
      const data = await res.json();
      if (data?.articles) {
        // Distribute articles into workflow stages for newsroom demonstration if status is default
        const items = data.articles.map((art, idx) => {
          let artStatus = art.status;
          if (!artStatus) {
            // Assign varied statuses for demonstration
            if (idx === 0) artStatus = "draft";
            else if (idx === 1) artStatus = "in_review";
            else if (idx === 2) artStatus = "ready";
            else if (idx === 3) artStatus = "scheduled";
            else artStatus = "published";
          }
          return { ...art, status: artStatus };
        });
        setArticles(items);
      }
    } catch (err) {
      console.error("Error fetching articles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // Handle stage transitions
  const handleMoveStage = async (articleId, targetStage) => {
    setTransitioningId(articleId);

    // Optimistic UI update
    setArticles((prev) =>
      prev.map((a) => (a.id === articleId ? { ...a, status: targetStage } : a))
    );

    try {
      const res = await fetch(`/api/articles/${articleId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStage }),
      });

      if (res.ok) {
        setToastNotice(`✓ کہانی کامیابی سے "${targetStage.toUpperCase()}" کے کالم میں منتقل کر دی گئی۔`);
        setTimeout(() => setToastNotice(null), 4000);
      }
    } catch (err) {
      console.error("Stage transition failed:", err);
    } finally {
      setTransitioningId(null);
    }
  };

  // Filter articles
  const filteredArticles = articles.filter((art) => {
    // Edition filter
    if (activeEdition === "ur" && !art.title_ur) return false;
    if (activeEdition === "en" && !art.title_en) return false;

    // Section filter
    if (selectedSection !== "all") {
      const catName = art.categories?.name_ur || "قومی";
      if (!catName.includes(selectedSection)) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const matchUr = art.title_ur?.toLowerCase().includes(query);
      const matchEn = art.title_en?.toLowerCase().includes(query);
      if (!matchUr && !matchEn) return false;
    }

    return true;
  });

  // Calculate counts per stage
  const getStageArticles = (stageId) => {
    return filteredArticles.filter((art) => (art.status || "published") === stageId);
  };

  return (
    <div className="space-y-5 max-w-full mx-auto pb-16">
      {/* 1. Header Bar */}
      <div className="bg-white border border-[#e5e2da] rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0a2618] text-white flex items-center justify-center">
              <Columns size={16} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Workflow board</h1>
              <p className="text-xs text-gray-500">
                Move a story through the desk — advance stages from Draft to Published live.
              </p>
            </div>
          </div>
        </div>

        {/* Right Top Actions */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Edition filter tabs */}
          <div className="flex items-center bg-[#f9f8f5] p-1 rounded-xl border border-[#e5e2da]">
            <button
              onClick={() => setActiveEdition("all")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeEdition === "all" ? "bg-white text-gray-900 shadow-xs" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              All editions
            </button>
            <button
              onClick={() => setActiveEdition("ur")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeEdition === "ur" ? "bg-[#124e2b] text-white shadow-xs" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              UR اردو
            </button>
            <button
              onClick={() => setActiveEdition("en")}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                activeEdition === "en" ? "bg-[#124e2b] text-white shadow-xs" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              EN English
            </button>
          </div>

          {/* Desk / Section selector */}
          <select
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="border border-[#e5e2da] bg-white px-3 py-2 rounded-lg text-xs font-semibold text-gray-700 outline-none focus:ring-1 focus:ring-emerald-700"
          >
            {SECTIONS.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.name_ur} — {sec.name_en}
              </option>
            ))}
          </select>

          {/* Search bar */}
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search workflow..."
              className="pl-8 pr-3 py-1.5 border border-[#e5e2da] bg-[#f9f8f5] rounded-lg text-xs outline-none focus:bg-white focus:ring-1 focus:ring-emerald-700 w-36 sm:w-44"
            />
          </div>

          {/* Refresh button */}
          <button
            onClick={fetchArticles}
            disabled={loading}
            className="border border-[#e5e2da] bg-white hover:bg-gray-50 p-2 rounded-lg text-gray-600 transition-colors shadow-xs"
            title="Refresh workflow board"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-emerald-700" : ""} />
          </button>

          {/* + New article link */}
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center gap-1.5 bg-[#124e2b] hover:bg-[#0e3d22] text-white px-3.5 py-2 rounded-lg text-xs font-bold shadow-xs transition-colors"
          >
            <Plus size={14} />
            <span>New story</span>
          </Link>
        </div>
      </div>

      {/* Toast Notice */}
      {toastNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs px-3.5 py-2.5 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 size={15} className="text-emerald-700" />
            <span>{toastNotice}</span>
          </div>
          <button onClick={() => setToastNotice(null)} className="text-gray-400 hover:text-gray-600 text-xs">
            ✕
          </button>
        </div>
      )}

      {/* 2. 5-Stage Kanban Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start">
        {STAGES.map((stage) => {
          const stageItems = getStageArticles(stage.id);

          return (
            <div
              key={stage.id}
              className="bg-[#fcfbf9] border border-[#e5e2da] rounded-xl overflow-hidden shadow-xs flex flex-col min-h-[580px]"
            >
              {/* Column Header */}
              <div className="p-3 bg-white border-b border-[#e5e2da] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${stage.dot}`} />
                  <div>
                    <span className="text-xs font-bold text-gray-900 block leading-tight">{stage.label_en}</span>
                    <span className="text-[10px] text-gray-400 font-serif urdu-headline">{stage.label_ur}</span>
                  </div>
                </div>
                <span className="bg-[#f0eee6] text-gray-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {stageItems.length}
                </span>
              </div>

              {/* Column Body / Story Cards */}
              <div className="p-2.5 space-y-2.5 flex-1 overflow-y-auto max-h-[750px]">
                {stageItems.length === 0 ? (
                  <div className="p-6 text-center text-gray-400 text-xs border border-dashed border-[#e5e2da] rounded-lg mt-2">
                    No stories in {stage.label_en}
                  </div>
                ) : (
                  stageItems.map((article) => {
                    const headline =
                      activeEdition === "en"
                        ? article.title_en || article.title_ur
                        : article.title_ur || article.title_en;
                    const isUrdu = activeEdition === "ur" || (!article.title_en && article.title_ur);
                    const isTrans = transitioningId === article.id;

                    return (
                      <div
                        key={article.id}
                        className={`bg-white border rounded-lg p-3 shadow-2xs hover:shadow-xs transition-all space-y-2.5 ${
                          isTrans ? "opacity-50 pointer-events-none" : "border-[#e5e2da] hover:border-gray-400"
                        }`}
                      >
                        {/* Card Top: Badges */}
                        <div className="flex items-center justify-between gap-1 text-[10px]">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded font-bold font-serif">
                              {article.categories?.name_ur || "قومی"}
                            </span>
                            <span className="bg-gray-100 text-gray-700 font-mono font-bold px-1.5 py-0.5 rounded">
                              #U{article.id}
                            </span>
                            <span className="text-gray-400 text-[10px] font-sans">
                              ⇄ #E{article.id}
                            </span>
                          </div>
                          {article.is_breaking && (
                            <span className="bg-red-100 text-red-800 font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                              <Flame size={10} />
                              <span>Breaking</span>
                            </span>
                          )}
                        </div>

                        {/* Card Headline */}
                        <Link
                          href={`/admin/articles/${article.id}`}
                          className={`block hover:text-emerald-800 transition-colors line-clamp-2 ${
                            isUrdu
                              ? "font-serif urdu-headline text-sm text-gray-900 leading-snug text-right"
                              : "font-semibold text-xs text-gray-900 leading-snug text-left"
                          }`}
                        >
                          {headline}
                        </Link>

                        {/* Card Meta & Byline */}
                        <div className="flex items-center justify-between pt-2 border-t border-[#f4f2eb] text-[11px] text-gray-500">
                          <div className="flex items-center gap-1 truncate max-w-[140px]">
                            <div className="w-4 h-4 rounded-full bg-[#124e2b] text-white text-[9px] flex items-center justify-center font-bold shrink-0">
                              A
                            </div>
                            <span className="truncate">{article.author_name || "Daily Afadiat"}</span>
                          </div>
                          <span className="font-mono text-[10px] bg-emerald-50 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                            SEO 94
                          </span>
                        </div>

                        {/* Workflow Transition Buttons */}
                        <div className="pt-2 border-t border-[#f4f2eb] flex items-center justify-between gap-1 text-[11px]">
                          <Link
                            href={`/admin/articles/${article.id}`}
                            className="text-gray-500 hover:text-gray-800 p-1 rounded hover:bg-gray-100 transition-colors"
                            title="Edit story"
                          >
                            <Edit size={12} />
                          </Link>

                          {/* Stage Transition Controllers */}
                          <div className="flex items-center gap-1 ml-auto">
                            {stage.id === "draft" && (
                              <button
                                onClick={() => handleMoveStage(article.id, "in_review")}
                                className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-bold flex items-center gap-1 transition-colors"
                              >
                                <span>Submit Review</span>
                                <ArrowRight size={10} />
                              </button>
                            )}

                            {stage.id === "in_review" && (
                              <>
                                <button
                                  onClick={() => handleMoveStage(article.id, "draft")}
                                  className="px-1.5 py-1 rounded bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 text-[10px] transition-colors"
                                  title="Send back to Draft"
                                >
                                  <ArrowLeft size={10} />
                                </button>
                                <button
                                  onClick={() => handleMoveStage(article.id, "ready")}
                                  className="px-2 py-1 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-[10px] font-bold flex items-center gap-1 transition-colors"
                                >
                                  <span>Mark Ready</span>
                                  <ArrowRight size={10} />
                                </button>
                              </>
                            )}

                            {stage.id === "ready" && (
                              <button
                                onClick={() => handleMoveStage(article.id, "published")}
                                className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold flex items-center gap-1 transition-colors"
                              >
                                <span>Publish Live</span>
                                <ArrowRight size={10} />
                              </button>
                            )}

                            {stage.id === "scheduled" && (
                              <button
                                onClick={() => handleMoveStage(article.id, "published")}
                                className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-bold flex items-center gap-1 transition-colors"
                              >
                                <span>Publish Now</span>
                                <ArrowRight size={10} />
                              </button>
                            )}

                            {stage.id === "published" && (
                              <Link
                                href={`/story/${article.id}`}
                                target="_blank"
                                className="px-2 py-1 rounded bg-[#f9f8f5] hover:bg-gray-100 text-gray-700 border border-gray-200 text-[10px] font-semibold flex items-center gap-1 transition-colors"
                              >
                                <span>Live ↗</span>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
