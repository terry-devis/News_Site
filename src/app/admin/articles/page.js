"use client";
import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { toPublicSiteUrl } from "@/lib/publicUrl";
import { useSearchParams } from "next/navigation";
import {
  Plus,
  Search,
  Edit3,
  Trash2,
  ExternalLink,
  Flame,
  Star,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  X,
  Filter,
  Send,
  Archive,
} from "lucide-react";

function ArticlesAdminInner() {
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") || "all";

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeEdition, setActiveEdition] = useState("ur"); // 'ur', 'en', 'both'
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showTrash, setShowTrash] = useState(initialStatus === "trashed");
  const [toastMessage, setToastMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    const param = searchParams.get("status");
    if (param === "trashed") {
      setShowTrash(true);
      setStatusFilter("all");
    } else if (param) {
      setShowTrash(false);
      setStatusFilter(param);
    }
  }, [searchParams]);

  // Fetch articles from API
  async function loadArticles() {
    setLoading(true);
    try {
      const res = await fetch("/api/articles?limit=500");
      const data = await res.json();
      if (data.articles) {
        setArticles(data.articles);
      }
    } catch (err) {
      console.error("Failed to load articles:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadArticles();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 4000);
  };

  // Move to trash (persisted)
  const handleMoveToTrash = async (id) => {
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "trashed", meta: { deletedAt: new Date().toISOString() } }),
      });
      if (!res.ok) throw new Error("Trash failed");
      setArticles((prev) => prev.map((a) => (a.id === id ? { ...a, status: "trashed" } : a)));
      showToast("مضمون کامیابی سے کوڑے دان (Trash) میں منتقل کر دیا گیا");
    } catch {
      showToast("کوڑے دان میں منتقل کرنے میں خرابی");
    }
  };

  // Restore from trash (persisted)
  const handleRestoreFromTrash = async (id) => {
    try {
      const res = await fetch(`/api/articles/${id}/restore`, { method: "POST" });
      if (!res.ok) throw new Error("Restore failed");
      setArticles((prev) => prev.map((a) => (a.id === id ? { ...a, status: "draft" } : a)));
      showToast("مضمون کوڑے دان سے بحال کر دیا گیا");
    } catch {
      showToast("بحال کرنے میں خرابی");
    }
  };

  // Permanently delete from database
  const handlePermanentDelete = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this article? This cannot be undone.")) {
      return;
    }
    try {
      const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Permanent delete failed");
      }
      setArticles((prev) => prev.filter((a) => a.id !== id));
      showToast("Article permanently deleted");
    } catch (err) {
      showToast(err.message || "Failed to delete article permanently");
    }
  };

  const handleTogglePublish = async (art) => {
    const isPublished = (art.status || "published") === "published";
    const endpoint = isPublished ? `/api/articles/${art.id}/unpublish` : `/api/articles/${art.id}/publish`;
    try {
      const res = await fetch(endpoint, { method: "POST" });
      if (!res.ok) throw new Error("Action failed");
      setArticles((prev) =>
        prev.map((a) => (a.id === art.id ? { ...a, status: isPublished ? "draft" : "published" } : a))
      );
      showToast(isPublished ? "مضمون ڈرافٹ میں منتقل کر دیا گیا" : "مضمون شائع کر دیا گیا");
    } catch {
      showToast("اسٹیٹس تبدیل کرنے میں خرابی");
    }
  };

  const trashedCount = useMemo(
    () => articles.filter((a) => a.status === "trashed").length,
    [articles]
  );

  // Calculate SEO Completeness score for each story
  const getSeoScore = (art) => {
    let score = 35;
    if (art.cover_image || art.lead_image_url) score += 20;
    if (art.summary_ur || art.summary_en || art.meta?.seoDescription) score += 15;
    if (art.content_ur && art.content_ur.length > 300) score += 10;
    if (art.title_ur && art.title_ur.length >= 30) score += 10;
    if (art.meta?.focusKeyword || art.meta?.coverImageAlt) score += 10;
    return Math.min(score, 100);
  };

  // Category list extraction
  const categoriesList = useMemo(() => {
    const set = new Set();
    articles.forEach((a) => {
      const cat = a.category?.name_ur || a.category_slug || a.category;
      if (cat) set.add(cat);
    });
    return Array.from(set);
  }, [articles]);

  // Filtered Articles pipeline
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      const isTrashed = art.status === "trashed";
      if (showTrash && !isTrashed) return false;
      if (!showTrash && isTrashed) return false;

      // Edition filter (UR / EN / Both)
      if (activeEdition === "ur" && !(art.title_ur && art.title_ur.trim())) {
        return false;
      }
      if (activeEdition === "en" && !(art.title_en && art.title_en.trim())) {
        return false;
      }

      // Status filter
      if (statusFilter !== "all") {
        const artStatus = art.status || "published";
        if (artStatus.toLowerCase() !== statusFilter.toLowerCase()) return false;
      }

      // Category filter
      if (categoryFilter !== "all") {
        const cat = art.category?.name_ur || art.category_slug || art.category || "";
        if (cat.toLowerCase() !== categoryFilter.toLowerCase()) return false;
      }

      // Date range filter
      if (fromDate) {
        const artDate = new Date(art.created_at || Date.now());
        if (artDate < new Date(fromDate)) return false;
      }
      if (toDate) {
        const artDate = new Date(art.created_at || Date.now());
        const end = new Date(toDate);
        end.setHours(23, 59, 59, 999);
        if (artDate > end) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleUr = (art.title_ur || "").toLowerCase();
        const titleEn = (art.title_en || "").toLowerCase();
        const slug = (art.slug || "").toLowerCase();
        if (!titleUr.includes(q) && !titleEn.includes(q) && !slug.includes(q)) {
          return false;
        }
      }

      return true;
    });
  }, [articles, showTrash, activeEdition, statusFilter, categoryFilter, fromDate, toDate, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [showTrash, activeEdition, statusFilter, categoryFilter, fromDate, toDate, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredArticles.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const paginatedArticles = filteredArticles.slice(startIndex, startIndex + PAGE_SIZE);

  const getTimeAgo = (index) => {
    const hours = [4, 6, 6, 7, 8, 12, 18, 24];
    return `${hours[index % hours.length]} hours ago`;
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#124e2b] text-white px-4 py-3 shadow-lg rounded flex items-center gap-2.5 text-xs font-semibold animate-slide-up">
          <CheckCircle2 size={16} className="text-emerald-300" />
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage("")} className="text-emerald-200 hover:text-white ml-2">
            <X size={14} />
          </button>
        </div>
      )}

      {/* 1. Header & Actions Matching Daily Insaaf */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#e5e2da] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-[#18221b] tracking-tight">Articles</h1>
          <p className="text-xs sm:text-sm text-[#5e6b62] mt-0.5">
            Everything from draft to publication
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowTrash(!showTrash)}
            className={`border px-3.5 py-2 rounded text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer ${
              showTrash
                ? "bg-red-700 text-white border-red-800"
                : "border-[#e5e2da] bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <Trash2 size={13} className={showTrash ? "text-white" : "text-gray-500"} />
            <span>Trash ({trashedCount})</span>
          </button>

          <Link
            href="/admin/articles/new"
            className="inline-flex items-center justify-center gap-1.5 bg-[#124e2b] hover:bg-[#0b381e] text-white text-xs font-bold px-4 py-2 rounded shadow-xs transition cursor-pointer"
          >
            <Plus size={15} />
            <span>New article</span>
          </Link>
        </div>
      </div>

      {/* 2. Edition Switcher Tabs Matching Daily Insaaf Exactly */}
      <div className="flex items-center gap-6 border-b border-[#e5e2da] text-xs font-bold">
        <button
          onClick={() => setActiveEdition("ur")}
          className={`pb-2.5 transition flex items-center gap-1.5 cursor-pointer ${
            activeEdition === "ur"
              ? "border-b-2 border-emerald-800 text-emerald-950 font-black"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <span className="bg-emerald-100 text-emerald-900 text-[10px] px-1.5 py-0.5 rounded uppercase font-sans">
            UR
          </span>
          <span className="urdu-headline text-[13px]">اردو (Urdu)</span>
        </button>

        <button
          onClick={() => setActiveEdition("en")}
          className={`pb-2.5 transition flex items-center gap-1.5 cursor-pointer ${
            activeEdition === "en"
              ? "border-b-2 border-emerald-800 text-emerald-950 font-black"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <span className="bg-blue-100 text-blue-900 text-[10px] px-1.5 py-0.5 rounded uppercase font-sans">
            EN
          </span>
          <span>English</span>
        </button>

        <button
          onClick={() => setActiveEdition("both")}
          className={`pb-2.5 transition flex items-center gap-1.5 cursor-pointer ${
            activeEdition === "both"
              ? "border-b-2 border-emerald-800 text-emerald-950 font-black"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          <span>Both editions</span>
        </button>
      </div>

      {/* 3. Search and Multi-Filter Card */}
      <div className="bg-white border border-[#e5e2da] p-4 sm:p-5 shadow-2xs space-y-3.5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Headline Search Input */}
          <div className="md:col-span-6 relative">
            <input
              type="text"
              placeholder={activeEdition === "en" ? "Search headline, slug..." : "عنوان تلاش کریں…"}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full h-10 px-3.5 pe-8 border border-[#d5d2c8] focus:border-emerald-800 rounded bg-white text-xs sm:text-sm text-gray-900 outline-none transition ${
                activeEdition === "ur" ? "text-right urdu-headline" : "text-left font-sans"
              }`}
            />
            <Search
              size={15}
              className={`absolute top-3 ${activeEdition === "ur" ? "left-3" : "right-3"} text-gray-400`}
            />
          </div>

          {/* Status Dropdown */}
          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-10 px-3 border border-[#d5d2c8] focus:border-emerald-800 rounded bg-white text-xs font-semibold text-gray-700 outline-none cursor-pointer"
            >
              <option value="all">All statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="in_review">In review</option>
              <option value="ready">Ready</option>
              <option value="scheduled">Scheduled</option>
            </select>
          </div>

          {/* Section Dropdown */}
          <div className="md:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full h-10 px-3 border border-[#d5d2c8] focus:border-emerald-800 rounded bg-white text-xs font-semibold text-gray-700 outline-none cursor-pointer"
            >
              <option value="all">All sections</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Filter & Counter Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-[#f0ede6]">
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-gray-500">From:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="border border-[#d5d2c8] bg-white px-2.5 py-1 rounded text-xs text-gray-800 outline-none font-sans"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-gray-500">To:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="border border-[#d5d2c8] bg-white px-2.5 py-1 rounded text-xs text-gray-800 outline-none font-sans"
              />
            </div>

            {(searchQuery || statusFilter !== "all" || categoryFilter !== "all" || fromDate || toDate) && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setCategoryFilter("all");
                  setFromDate("");
                  setToDate("");
                }}
                className="text-[11px] text-red-700 hover:underline font-bold"
              >
                Reset filters
              </button>
            )}
          </div>

          <span className="text-xs font-bold text-gray-500 font-sans">
            {filteredArticles.length} results
          </span>
        </div>
      </div>

      {/* 4. Articles Catalog Table Matching Daily Insaaf Structure */}
      <div className="bg-white border border-[#e5e2da] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[#f4f2ec] border-b border-[#e5e2da] text-gray-700 font-bold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="p-3.5 w-5/12">Headline</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Section</th>
                <th className="p-3.5">SEO</th>
                <th className="p-3.5">Views</th>
                <th className="p-3.5">Updated</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#f0ede6]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-xs text-gray-500">
                    Loading newsroom articles...
                  </td>
                </tr>
              ) : filteredArticles.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-xs text-gray-400">
                    No articles found matching the selected filters.
                  </td>
                </tr>
              ) : (
                paginatedArticles.map((art, idx) => {
                  const seoScore = getSeoScore(art);
                  const isUrduActive = activeEdition === "ur" || (activeEdition === "both" && art.title_ur);
                  const headlineText =
                    activeEdition === "en"
                      ? art.title_en || art.title_ur || "Untitled Story"
                      : art.title_ur || art.title_en || "خبر کا عنوان";

                  const isTrashed = art.status === "trashed";

                  return (
                    <tr key={art.id || idx} className="hover:bg-[#fbfaf8] transition group">
                      {/* 1. HEADLINE WITH IDENTIFIER & FLAGS */}
                      <td className="p-3.5">
                        <div className="space-y-1.5">
                          {/* Tags Bar */}
                          <div className="flex items-center gap-1.5 font-mono text-[10px]">
                            <span className="text-gray-400 font-semibold">
                              #U{art.id || idx + 1000}
                            </span>

                            <span
                              className={`px-1.5 py-0.2 rounded font-bold uppercase ${
                                isUrduActive ? "bg-emerald-100 text-emerald-900" : "bg-blue-100 text-blue-900"
                              }`}
                            >
                              {isUrduActive ? "UR" : "EN"}
                            </span>

                            <span className="text-gray-400 flex items-center gap-0.5 font-sans">
                              <span>⇄</span>
                              <span>News</span>
                            </span>

                            {art.is_featured && (
                              <span className="bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-sans font-bold flex items-center gap-0.5">
                                <Star size={9} />
                                <span>Featured</span>
                              </span>
                            )}

                            {art.is_breaking && (
                              <span className="bg-red-100 text-red-900 px-1.5 py-0.2 rounded font-sans font-bold flex items-center gap-0.5 animate-pulse">
                                <Flame size={9} />
                                <span>Breaking</span>
                              </span>
                            )}
                          </div>

                          {/* Headline link */}
                          <Link
                            href={`/admin/articles/${art.id}`}
                            className={`block text-xs sm:text-[13px] font-bold text-gray-900 group-hover:text-emerald-800 transition line-clamp-1 leading-relaxed ${
                              isUrduActive ? "urdu-headline text-right" : "font-sans text-left"
                            }`}
                            dir={isUrduActive ? "rtl" : "ltr"}
                          >
                            {headlineText}
                          </Link>

                          {/* Sibling English Title preview in Both Editions mode */}
                          {activeEdition === "both" && art.title_en && (
                            <p className="text-[11px] text-gray-500 font-sans italic line-clamp-1">
                              EN: {art.title_en}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* 2. STATUS BADGE */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`text-[11px] font-bold px-2.5 py-1 rounded ${
                            isTrashed
                              ? "bg-red-100 text-red-900"
                              : art.status === "draft"
                              ? "bg-gray-100 text-gray-700"
                              : art.status === "in_review"
                              ? "bg-blue-100 text-blue-900"
                              : art.status === "scheduled"
                              ? "bg-purple-100 text-purple-900"
                              : "bg-emerald-100 text-emerald-900"
                          }`}
                        >
                          {isTrashed ? "Trashed" : art.status ? art.status : "Published"}
                        </span>
                      </td>

                      {/* 3. SECTION */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`bg-[#f4f2ec] text-gray-800 text-[11px] font-bold px-2.5 py-1 rounded ${
                            activeEdition === "en" || !art.title_ur?.trim() ? "font-sans" : "urdu-headline"
                          }`}
                        >
                          {activeEdition === "en" || !art.title_ur?.trim()
                            ? art.category?.name_en || art.category?.name_ur || art.category_slug || "News"
                            : art.category?.name_ur || art.category_slug || art.category || "قومی"}
                        </span>
                      </td>

                      {/* 4. SEO SCORE PROGRESS BAR */}
                      <td className="p-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                seoScore >= 80 ? "bg-emerald-700" : seoScore >= 60 ? "bg-amber-500" : "bg-red-500"
                              }`}
                              style={{ width: `${seoScore}%` }}
                            />
                          </div>
                          <span className="text-[11px] font-mono font-bold text-gray-700 newsroom-tabular">
                            {seoScore}
                          </span>
                        </div>
                      </td>

                      {/* 5. VIEWS */}
                      <td className="p-3.5 whitespace-nowrap font-mono text-[11px] font-semibold text-gray-700 newsroom-tabular">
                        {(art.views_count || 0).toLocaleString()}
                      </td>

                      {/* 6. UPDATED */}
                      <td className="p-3.5 whitespace-nowrap text-[11px] text-gray-400 font-sans">
                        {getTimeAgo(idx)}
                      </td>

                      {/* 7. ACTIONS */}
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {isTrashed ? (
                            <>
                              <button
                                onClick={() => handleRestoreFromTrash(art.id)}
                                className="p-1.5 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-50 rounded cursor-pointer"
                                title="Restore story"
                              >
                                <RotateCcw size={14} />
                              </button>
                              <button
                                onClick={() => handlePermanentDelete(art.id)}
                                className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded cursor-pointer"
                                title="Delete permanently"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => handleTogglePublish(art)}
                                className="p-1.5 text-gray-500 hover:text-emerald-800 hover:bg-gray-100 rounded transition cursor-pointer"
                                title={(art.status || "published") === "published" ? "Unpublish to draft" : "Publish live"}
                              >
                                {(art.status || "published") === "published" ? <Archive size={14} /> : <Send size={14} />}
                              </button>

                              <Link
                                href={`/admin/articles/${art.id}`}
                                className="p-1.5 text-gray-500 hover:text-emerald-800 hover:bg-gray-100 rounded transition"
                                title="Edit story"
                              >
                                <Edit3 size={14} />
                              </Link>

                              <Link
                                href={toPublicSiteUrl(
                                  activeEdition === "en" || !art.title_ur?.trim()
                                    ? `/en/story/${art.slug || art.id}`
                                    : `/story/${art.slug || art.id}`
                                )}
                                target="_blank"
                                className="p-1.5 text-gray-500 hover:text-emerald-800 hover:bg-gray-100 rounded transition"
                                title="View public page"
                              >
                                <ExternalLink size={14} />
                              </Link>

                              <button
                                onClick={() => handleMoveToTrash(art.id)}
                                className="p-1.5 text-gray-400 hover:text-red-700 hover:bg-red-50 rounded transition cursor-pointer"
                                title="Move to trash"
                              >
                                <Trash2 size={14} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Working Pagination */}
        <div className="p-4 bg-[#fbfaf8] border-t border-[#e5e2da] flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
          <span>
            {filteredArticles.length === 0
              ? "Showing 0 of 0 entries"
              : `Showing ${startIndex + 1} to ${Math.min(startIndex + PAGE_SIZE, filteredArticles.length)} of ${filteredArticles.length} entries`}
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className={`px-2.5 py-1 border border-[#e5e2da] bg-white rounded transition ${
                safePage <= 1
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-50 cursor-pointer"
              }`}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`px-2.5 py-1 border rounded font-bold transition cursor-pointer ${
                  pageNum === safePage
                    ? "border-emerald-800 bg-emerald-800 text-white"
                    : "border-[#e5e2da] bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {pageNum}
              </button>
            ))}
            <button
              type="button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className={`px-2.5 py-1 border border-[#e5e2da] bg-white rounded transition ${
                safePage >= totalPages
                  ? "text-gray-400 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-50 cursor-pointer"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ArticlesAdminPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-xs text-gray-400">Loading articles...</div>}>
      <ArticlesAdminInner />
    </Suspense>
  );
}
