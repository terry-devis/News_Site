"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { toPublicSiteUrl } from "@/lib/publicUrl";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Send,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  Lock,
  Unlock,
  UploadCloud,
  X,
  Crop,
  Image as ImageIcon,
  Code2,
  Trash2,
  Loader2,
} from "lucide-react";
import TipTapEditor from "@/component/admin/article-editor/TipTapEditor";
import MediaPickerModal from "@/component/admin/article-editor/MediaPickerModal";
import ImageFramingModal from "@/component/admin/article-editor/ImageFramingModal";
import SeoSocialPanel from "@/component/admin/article-editor/SeoSocialPanel";
import PreviewArrangeDrawer from "@/component/admin/article-editor/PreviewArrangeDrawer";
import { DEFAULT_ARTICLE_META, ARTICLE_TYPES } from "@/lib/articleMeta";
import { generateSeoSlug } from "@/lib/slugify";
import { optimizeImageToWebP } from "@/lib/imageOptimizer";

export default function ArticleEditorClient({ initialId = null }) {
  const router = useRouter();
  const isEdit = Boolean(initialId);
  const tiptapRef = useRef(null);

  // Dynamic taxonomy & staff lists
  const [categories, setCategories] = useState([]);
  const [authors, setAuthors] = useState([]);

  // Core bilingual content
  const [activeTab, setActiveTab] = useState("ur"); // 'ur' | 'en'
  const [sourceMode, setSourceMode] = useState(false);
  const [titleUr, setTitleUr] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [summaryUr, setSummaryUr] = useState("");
  const [summaryEn, setSummaryEn] = useState("");
  const [contentUr, setContentUr] = useState("");
  const [contentEn, setContentEn] = useState("");

  // Publishing & Metadata
  const [slug, setSlug] = useState("");
  const [slugLocked, setSlugLocked] = useState(isEdit);
  const [categoryId, setCategoryId] = useState("");
  const [authorName, setAuthorName] = useState("ایڈیٹوریل ڈیسک");
  const [status, setStatus] = useState("draft");
  const [coverImage, setCoverImage] = useState("");
  const [isBreaking, setIsBreaking] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [meta, setMeta] = useState({ ...DEFAULT_ARTICLE_META });
  const [tagInput, setTagInput] = useState("");

  // UI state
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [toast, setToast] = useState(null);
  const [autosaveLabel, setAutosaveLabel] = useState("");

  // Modals / Drawers
  const [mediaModalTarget, setMediaModalTarget] = useState(null); // 'cover' | 'inline' | null
  const [framingOpen, setFramingOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  }

  // Load categories, authors, and existing article
  useEffect(() => {
    let active = true;
    async function init() {
      try {
        const [catsRes, usersRes, meRes] = await Promise.all([
          fetch("/api/categories").then((r) => (r.ok ? r.json() : {})).catch(() => ({})),
          fetch("/api/users").then((r) => (r.ok ? r.json() : {})).catch(() => ({})),
          fetch("/api/auth/me").then((r) => (r.ok ? r.json() : {})).catch(() => ({})),
        ]);

        if (!active) return;

        const loadedCats = catsRes.categories || catsRes.data || (Array.isArray(catsRes) ? catsRes : []);
        setCategories(loadedCats);

        const loadedUsers = (usersRes.users || []).filter((u) => u.status !== "Disabled");
        setAuthors(loadedUsers);

        if (!isEdit) {
          if (loadedCats[0]?.id) setCategoryId(String(loadedCats[0].id));
          if (meRes?.user) {
            const u = meRes.user;
            const urByline = u.full_name_ur || u.byline_name || "ایڈیٹوریل ڈیسک";
            const enByline = u.full_name_en || u.byline_name || "Editorial Desk";
            setAuthorName(urByline);
            setMeta((prev) => ({
              ...prev,
              bylineUr: urByline,
              bylineEn: enByline,
            }));
          }
        }

        if (isEdit && initialId) {
          const res = await fetch(`/api/articles/${initialId}`);
          const data = await res.json();
          if (res.ok && data.article && active) {
            const a = data.article;
            setTitleUr(a.title_ur || "");
            setTitleEn(a.title_en || "");
            setSummaryUr(a.summary_ur || "");
            setSummaryEn(a.excerpt_en || "");
            setContentUr(a.content_ur || "");
            setContentEn(a.content_en || "");
            setSlug(a.slug || "");
            setCategoryId(a.category_id ? String(a.category_id) : loadedCats[0]?.id ? String(loadedCats[0].id) : "");
            setAuthorName(a.meta?.bylineUr || a.author_name || "ایڈیٹوریل ڈیسک");
            setStatus(a.status || "published");
            setCoverImage(a.cover_image || "");
            setIsBreaking(Boolean(a.is_breaking));
            setIsFeatured(Boolean(a.is_featured));
            setMeta({
              ...DEFAULT_ARTICLE_META,
              ...(a.meta || {}),
              bylineUr: a.meta?.bylineUr || a.author_name || "",
              bylineEn: a.meta?.bylineEn || a.author_name_en || "",
            });
          }
        }
      } catch (err) {
        if (active) showToast("Failed to load editor data", "error");
      } finally {
        if (active) setLoading(false);
      }
    }
    init();
    return () => {
      active = false;
    };
  }, [isEdit, initialId]);

  // Auto-generate SEO slug from English title, Focus Keyword, or transliterated Urdu headline
  useEffect(() => {
    if (slugLocked) return;
    if (!titleEn.trim() && !titleUr.trim() && !meta.focusKeyword?.trim()) return;
    const activeCatSlug = categories.find((c) => String(c.id) === String(categoryId))?.slug || "";
    const generated = generateSeoSlug({
      titleEn,
      titleUr,
      focusKeyword: meta.focusKeyword,
      categorySlug: activeCatSlug,
    });
    if (generated) setSlug(generated);
  }, [titleEn, titleUr, meta.focusKeyword, categoryId, categories, slugLocked]);

  // Local draft autosave
  useEffect(() => {
    if (loading || (!titleUr && !contentUr && !titleEn && !contentEn)) return;
    const key = isEdit ? `da_draft_${initialId}` : "da_draft_new";
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(
          key,
          JSON.stringify({ titleUr, titleEn, summaryUr, summaryEn, contentUr, contentEn, updatedAt: Date.now() })
        );
        setAutosaveLabel("Draft cached");
      } catch {}
    }, 1200);
    return () => clearTimeout(timer);
  }, [titleUr, titleEn, summaryUr, summaryEn, contentUr, contentEn, isEdit, initialId, loading]);

  function updateMeta(field, value) {
    setMeta((prev) => ({ ...prev, [field]: value }));
  }

  async function handleDirectCoverUpload(e) {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;
    setUploadingCover(true);
    try {
      const file = await optimizeImageToWebP(rawFile);
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      setCoverImage(data.url);
      if (!meta.coverImageAlt) {
        updateMeta("coverImageAlt", rawFile.name.replace(/\.[^.]+$/, ""));
      }
      showToast("Lead image compressed (WebP) & uploaded to Cloudflare R2");
    } catch (err) {
      showToast(err.message || "Upload failed", "error");
    } finally {
      setUploadingCover(false);
    }
  }

  async function handleSave(targetStatus = status) {
    const stripHtml = (html) => String(html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    const hasUrdu =
      Boolean(titleUr.trim()) &&
      Boolean(stripHtml(contentUr) || /<(img|iframe|video|table)\b/i.test(contentUr || ""));
    const hasEnglish =
      Boolean(titleEn.trim()) &&
      Boolean(stripHtml(contentEn) || /<(img|iframe|video|table)\b/i.test(contentEn || ""));

    if (!hasUrdu && !hasEnglish) {
      if (activeTab === "en") {
        showToast(
          !titleEn.trim()
            ? "English headline is required (or complete the Urdu edition)"
            : "English article body is required",
          "error"
        );
      } else {
        showToast(
          !titleUr.trim()
            ? "Urdu headline (عنوان) is required (or complete the English edition)"
            : "Urdu article body is required",
          "error"
        );
      }
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title_ur: titleUr.trim(),
        title_en: titleEn.trim() || null,
        slug: slug.trim() || `news-${Date.now()}`,
        summary_ur: summaryUr.trim() || (titleUr.trim() ? titleUr.trim().slice(0, 150) : ""),
        excerpt_en: summaryEn.trim() || (titleEn.trim() ? titleEn.trim().slice(0, 150) : ""),
        content_ur: hasUrdu ? contentUr : "",
        content_en: hasEnglish ? contentEn : "",
        category_id: categoryId ? Number(categoryId) : null,
        cover_image: coverImage || null,
        is_breaking: isBreaking,
        is_featured: isFeatured,
        author_name: authorName,
        status: targetStatus,
        meta,
      };

      const url = isEdit ? `/api/articles/${initialId}` : "/api/articles";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");

      setStatus(targetStatus);
      const savedId = data.article?.id || initialId;
      showToast(
        targetStatus === "published"
          ? "Article published live"
          : targetStatus === "scheduled"
          ? "Article scheduled"
          : "Draft saved"
      );

      if (!isEdit && savedId) {
        router.replace(`/admin/articles/${savedId}`);
      }
    } catch (err) {
      showToast(err.message || "Could not save article", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleQuickTrash() {
    if (!isEdit) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/articles/${initialId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "trashed",
          meta: { ...meta, deletedAt: new Date().toISOString() },
        }),
      });
      if (!res.ok) throw new Error("Failed to move to trash");
      showToast("Moved to trash");
      router.push("/admin/articles");
    } catch (err) {
      showToast(err.message, "error");
      setSaving(false);
    }
  }

  const selectedCategoryObj = categories.find((c) => String(c.id) === String(categoryId));
  const activeCategoryNameUr = selectedCategoryObj?.name_ur || "خبر";
  const activeCategoryNameEn = selectedCategoryObj?.name_en || selectedCategoryObj?.name_ur || "News";
  const activeCategoryName = activeCategoryNameUr;

  if (loading) {
    return (
      <div className="py-24 flex justify-center items-center text-sm text-[#5c635b]">
        <Loader2 size={20} className="animate-spin mr-2" />
        Loading article editor...
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-16 relative">
      {/* Floating Vertical Preview Edge Tab (matching Daily Insaf) */}
      <button
        type="button"
        onClick={() => setPreviewOpen(true)}
        title="Preview & arrange"
        className="hidden xl:flex fixed right-0 top-1/2 -translate-y-1/2 z-30 bg-[#0a2618] hover:bg-[#184e2d] text-white px-2 py-4 text-xs font-bold tracking-wider uppercase shadow-lg cursor-pointer items-center gap-1.5"
        style={{ writingMode: "vertical-rl" }}
      >
        <span>Preview</span>
      </button>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 text-xs font-semibold shadow-lg border flex items-center gap-2 ${
            toast.type === "error"
              ? "bg-red-50 text-red-800 border-red-200"
              : "bg-[#0a2618] text-white border-[#1f5637]"
          }`}
        >
          {toast.type === "error" ? <AlertCircle size={14} /> : <CheckCircle2 size={14} className="text-emerald-300" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Sticky Top Action Bar */}
      <div className="sticky top-12 z-20 bg-[#f9f8f5]/95 backdrop-blur-xs border-b border-[#e5e2da] py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/articles"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5c635b] hover:text-[#18221b]"
          >
            <ArrowLeft size={15} />
            <span>Articles</span>
          </Link>
          <span className="text-[#e5e2da]">/</span>
          <h1 className="text-base sm:text-lg font-bold text-[#18221b]">
            {isEdit ? "Edit article" : "New article"}
          </h1>
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200 uppercase">
            {status.replace("_", " ")}
          </span>
          {autosaveLabel && (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#5c635b]">
              <Clock size={12} />
              {autosaveLabel}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="px-3 py-2 text-xs font-semibold border border-[#e5e2da] bg-white hover:bg-gray-50 text-[#18221b] flex items-center gap-1.5 cursor-pointer"
          >
            <Eye size={14} />
            <span>Preview & arrange</span>
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave(status === "published" ? "draft" : status)}
            className="px-3.5 py-2 text-xs font-semibold border border-[#e5e2da] bg-white hover:bg-gray-50 text-[#18221b] flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
          >
            <Save size={14} />
            <span>Save draft</span>
          </button>

          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave(status === "scheduled" ? "scheduled" : "published")}
            className="px-4 py-2 text-xs font-semibold bg-[#184e2d] hover:bg-[#0a2618] text-white flex items-center gap-1.5 disabled:opacity-60 cursor-pointer"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            <span>{status === "scheduled" ? "Schedule" : isEdit && status === "published" ? "Update" : "Publish"}</span>
          </button>
        </div>
      </div>

      {/* Main 2-Column Editorial Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Left Main Writing Surface */}
        <div className="space-y-5 min-w-0">
          {/* Edition Switcher + Editor Card */}
          <div className="bg-white border border-[#e5e2da] shadow-2xs">
            <div className="px-5 pt-3 border-b border-[#e5e2da] flex items-center justify-between bg-[#fbfaf8]">
              <div className="flex gap-6 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab("ur")}
                  className={`pb-2.5 border-b-2 flex items-center gap-1.5 cursor-pointer ${
                    activeTab === "ur"
                      ? "border-[#184e2d] text-[#184e2d]"
                      : "border-transparent text-[#5c635b]"
                  }`}
                >
                  <span className="bg-emerald-50 text-[#184e2d] px-1.5 py-0.5 rounded text-[10px]">UR</span>
                  <span>اردو (Urdu Edition)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("en")}
                  className={`pb-2.5 border-b-2 flex items-center gap-1.5 cursor-pointer ${
                    activeTab === "en"
                      ? "border-[#184e2d] text-[#184e2d]"
                      : "border-transparent text-[#5c635b]"
                  }`}
                >
                  <span className="bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded text-[10px]">EN</span>
                  <span>English Edition</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setSourceMode((v) => !v)}
                className={`mb-2 px-2 py-1 text-[11px] font-semibold border flex items-center gap-1 cursor-pointer ${
                  sourceMode
                    ? "bg-[#0a2618] text-white border-[#0a2618]"
                    : "bg-white text-[#5c635b] border-[#e5e2da]"
                }`}
              >
                <Code2 size={12} />
                <span>{sourceMode ? "Visual" : "HTML"}</span>
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Headline */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-[#18221b] mb-1">
                  <label>{activeTab === "ur" ? "Headline (اردو عنوان) *" : "Headline (English)"}</label>
                  <span className="font-mono text-[11px] text-[#5c635b]">
                    {(activeTab === "ur" ? titleUr : titleEn).length} chars
                  </span>
                </div>
                <input
                  type="text"
                  dir={activeTab === "ur" ? "rtl" : "ltr"}
                  value={activeTab === "ur" ? titleUr : titleEn}
                  onChange={(e) => (activeTab === "ur" ? setTitleUr(e.target.value) : setTitleEn(e.target.value))}
                  placeholder={activeTab === "ur" ? "خبر کی سرخی یہاں لکھیں..." : "Enter English headline..."}
                  className={`w-full px-3.5 py-2.5 border border-[#e5e2da] bg-[#fbfaf8] focus:bg-white focus:outline-none focus:border-[#184e2d] font-bold text-[#18221b] ${
                    activeTab === "ur" ? "text-xl leading-relaxed" : "text-lg"
                  }`}
                />
              </div>

              {/* Subhead / Summary */}
              <div>
                <label className="block text-xs font-semibold text-[#18221b] mb-1">
                  {activeTab === "ur" ? "Summary / Standfirst (خلاصہ)" : "English Summary / Excerpt"}
                </label>
                <textarea
                  rows={2}
                  dir={activeTab === "ur" ? "rtl" : "ltr"}
                  value={activeTab === "ur" ? summaryUr : summaryEn}
                  onChange={(e) => (activeTab === "ur" ? setSummaryUr(e.target.value) : setSummaryEn(e.target.value))}
                  placeholder={activeTab === "ur" ? "خبر کا مختصر خلاصہ..." : "Brief 1–2 sentence standfirst..."}
                  className="w-full px-3.5 py-2 text-sm border border-[#e5e2da] bg-[#fbfaf8] focus:bg-white focus:outline-none focus:border-[#184e2d]"
                />
              </div>

              {/* URL Slug */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-[#18221b] mb-1">
                  <label>URL Slug</label>
                  <button
                    type="button"
                    onClick={() => setSlugLocked((v) => !v)}
                    className="text-[11px] text-[#184e2d] flex items-center gap-1 cursor-pointer"
                  >
                    {slugLocked ? <Lock size={11} /> : <Unlock size={11} />}
                    <span>{slugLocked ? "Locked" : "Auto"}</span>
                  </button>
                </div>
                <div className="flex items-center border border-[#e5e2da] bg-[#fbfaf8]">
                  <span className="px-3 py-2 text-xs text-[#5c635b] border-r border-[#e5e2da] font-mono">
                    /story/
                  </span>
                  <input
                    type="text"
                    value={slug}
                    disabled={slugLocked}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="pakistan-economy-update"
                    className="flex-1 px-3 py-2 text-xs font-mono bg-transparent focus:outline-none disabled:opacity-60"
                  />
                </div>
              </div>

              {/* TipTap ProseMirror Editor / HTML Source */}
              {sourceMode ? (
                <div className="border border-[#e5e2da]">
                  <textarea
                    rows={16}
                    dir="ltr"
                    value={activeTab === "ur" ? contentUr : contentEn}
                    onChange={(e) => (activeTab === "ur" ? setContentUr(e.target.value) : setContentEn(e.target.value))}
                    className="w-full p-4 font-mono text-xs bg-[#18221b] text-emerald-100 focus:outline-none"
                  />
                </div>
              ) : (
                <TipTapEditor
                  ref={tiptapRef}
                  dir={activeTab === "ur" ? "rtl" : "ltr"}
                  value={activeTab === "ur" ? contentUr : contentEn}
                  onChange={(html) => (activeTab === "ur" ? setContentUr(html) : setContentEn(html))}
                  placeholder={
                    activeTab === "ur"
                      ? "تفصیلی خبر یا مضمون یہاں لکھیں..."
                      : "Write the English edition story here..."
                  }
                  onRequestImage={() => setMediaModalTarget("inline")}
                />
              )}
            </div>
          </div>

          {/* SEO & Social Preview Suite */}
          <SeoSocialPanel
            activeTab={activeTab}
            title={activeTab === "ur" ? titleUr : titleEn}
            summary={activeTab === "ur" ? summaryUr : summaryEn}
            slug={slug}
            coverImage={coverImage}
            coverFraming={meta.coverFraming}
            meta={meta}
            onChangeMeta={updateMeta}
          />
        </div>

        {/* Right Sticky Publishing Rail */}
        <aside className="space-y-4 lg:sticky lg:top-32">
          {/* 1. Status & Schedule */}
          <div className="bg-white border border-[#e5e2da] p-4 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#5c635b] border-b border-[#e5e2da] pb-2">
              Publishing
            </h3>
            <div>
              <label className="block text-xs font-semibold text-[#18221b] mb-1">Workflow Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#e5e2da] bg-[#fbfaf8] focus:outline-none focus:border-[#184e2d]"
              >
                <option value="draft">Draft</option>
                <option value="in_review">In review</option>
                <option value="ready">Ready</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
              </select>
            </div>

            {status === "scheduled" && (
              <div>
                <label className="block text-xs font-semibold text-[#18221b] mb-1">
                  Schedule Date & Time (PKT)
                </label>
                <input
                  type="datetime-local"
                  value={meta.scheduledAt || ""}
                  onChange={(e) => updateMeta("scheduledAt", e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-[#e5e2da] bg-[#fbfaf8]"
                />
              </div>
            )}

            {isEdit && (
              <div className="pt-2 border-t border-[#e5e2da] flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleQuickTrash}
                  className="text-xs font-semibold text-red-600 hover:text-red-800 flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Move to trash</span>
                </button>
                <Link
                  href={toPublicSiteUrl(`/story/${initialId}`)}
                  target="_blank"
                  className="text-xs font-semibold text-[#184e2d] hover:underline"
                >
                  View live →
                </Link>
              </div>
            )}
          </div>

          {/* 2. Section & Bilingual Byline */}
          <div className="bg-white border border-[#e5e2da] p-4 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#5c635b] border-b border-[#e5e2da] pb-2">
              Section & Bilingual Byline
            </h3>
            <div>
              <label className="block text-xs font-semibold text-[#18221b] mb-1">Section</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#e5e2da] bg-[#fbfaf8] focus:outline-none focus:border-[#184e2d]"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name_en ? `${cat.name_en} — ${cat.name_ur}` : cat.name_ur}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#18221b] mb-1">Type</label>
              <select
                value={meta.articleType || "news"}
                onChange={(e) => updateMeta("articleType", e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#e5e2da] bg-[#fbfaf8] focus:outline-none focus:border-[#184e2d]"
              >
                {Object.entries(ARTICLE_TYPES).map(([val, label]) => (
                  <option key={val} value={val}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-[#18221b]">
                  Tags ({activeTab === "ur" ? "Urdu" : "English"})
                </label>
                <span className="text-[10px] text-[#5c635b]">Press Enter to add</span>
              </div>
              <input
                type="text"
                dir={activeTab === "ur" ? "rtl" : "ltr"}
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const t = tagInput.trim();
                    const tagsKey = activeTab === "ur" ? "tagsUr" : "tagsEn";
                    const cur = Array.isArray(meta[tagsKey]) ? meta[tagsKey] : [];
                    if (t && !cur.includes(t)) {
                      updateMeta(tagsKey, [...cur, t]);
                    }
                    setTagInput("");
                  }
                }}
                placeholder={activeTab === "ur" ? "ٹیگ لکھ کر Enter دبائیں..." : "Type tag and press Enter..."}
                className={`w-full px-3 py-1.5 text-xs border border-[#e5e2da] bg-[#fbfaf8] focus:outline-none focus:border-[#184e2d] ${
                  activeTab === "ur" ? "text-right font-nastaliq leading-loose" : "text-left font-sans"
                }`}
              />
              {(() => {
                const tagsKey = activeTab === "ur" ? "tagsUr" : "tagsEn";
                const list = Array.isArray(meta[tagsKey]) ? meta[tagsKey] : [];
                if (list.length === 0) return null;
                return (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {list.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() =>
                          updateMeta(
                            tagsKey,
                            list.filter((item) => item !== tag)
                          )
                        }
                        className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-medium text-[#184e2d] hover:bg-emerald-100 cursor-pointer"
                      >
                        <span>{tag}</span>
                        <span className="opacity-60">×</span>
                      </button>
                    ))}
                  </div>
                );
              })()}
            </div>

            {authors.length > 0 && (
              <div>
                <label className="block text-[11px] font-semibold text-[#5c635b] mb-1">
                  Quick Fill from Staff (Optional)
                </label>
                <select
                  value=""
                  onChange={(e) => {
                    const selected = authors.find((u) => String(u.id) === e.target.value);
                    if (!selected) return;
                    const urName = selected.full_name_ur || selected.byline_name || selected.full_name_en || "";
                    const enName = selected.full_name_en || selected.byline_name || selected.full_name_ur || "";
                    setAuthorName(urName);
                    setMeta((prev) => ({ ...prev, bylineUr: urName, bylineEn: enName }));
                  }}
                  className="w-full px-3 py-1.5 text-xs border border-[#e5e2da] bg-[#fbfaf8] focus:outline-none focus:border-[#184e2d]"
                >
                  <option value="">— Select staff member to auto-fill —</option>
                  {authors.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name_en || u.byline_name} ({u.roles?.[0] || "Staff"})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {activeTab === "ur" ? (
              <div>
                <label className="block text-xs font-semibold text-[#18221b] mb-1">
                  Byline (Urdu)
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={authorName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setAuthorName(val);
                    updateMeta("bylineUr", val);
                  }}
                  placeholder="ایڈیٹوریل ڈیسک / نامہ نگار"
                  className="w-full px-3.5 py-2.5 text-sm leading-loose text-right font-nastaliq border border-[#e5e2da] bg-[#fbfaf8] focus:bg-white focus:outline-none focus:border-[#184e2d]"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-[#18221b] mb-1">
                  Byline (English)
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={meta.bylineEn || ""}
                  onChange={(e) => updateMeta("bylineEn", e.target.value)}
                  placeholder="Editorial Desk / Staff Reporter"
                  className="w-full px-3 py-2 text-xs text-left font-sans border border-[#e5e2da] bg-[#fbfaf8] focus:bg-white focus:outline-none focus:border-[#184e2d]"
                />
              </div>
            )}
          </div>

          {/* 3. Lead Media + Crop & Frame */}
          <div className="bg-white border border-[#e5e2da] p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-[#e5e2da] pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#5c635b]">Lead Media</h3>
              {coverImage && (
                <button
                  type="button"
                  onClick={() => setFramingOpen(true)}
                  className="text-[11px] font-semibold text-[#184e2d] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Crop size={12} />
                  <span>Crop & frame</span>
                </button>
              )}
            </div>

            {coverImage ? (
              <div className="relative border border-[#e5e2da] bg-gray-100">
                <img
                  src={coverImage}
                  alt={meta.coverImageAlt || "Lead preview"}
                  style={{
                    objectPosition: meta.coverFraming?.focal
                      ? `${meta.coverFraming.focal.x}% ${meta.coverFraming.focal.y}%`
                      : "50% 50%",
                  }}
                  className="w-full aspect-video object-cover"
                />
                <button
                  type="button"
                  onClick={() => setCoverImage("")}
                  className="absolute top-1.5 right-1.5 bg-black/70 text-white p-1 rounded-full hover:bg-black cursor-pointer"
                  title="Remove cover image"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <div className="aspect-video border border-dashed border-[#d5d0c5] bg-[#fbfaf8] flex flex-col items-center justify-center text-xs text-[#5c635b] p-4 text-center">
                <ImageIcon size={22} className="mb-1.5 text-[#7da88d]" />
                <span>No lead image selected</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <label className="px-2.5 py-2 text-[11px] font-semibold border border-[#e5e2da] bg-[#fbfaf8] hover:bg-gray-100 text-center cursor-pointer flex items-center justify-center gap-1">
                {uploadingCover ? <Loader2 size={12} className="animate-spin" /> : <UploadCloud size={12} />}
                <span>{uploadingCover ? "Uploading..." : "Upload R2"}</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleDirectCoverUpload} />
              </label>
              <button
                type="button"
                onClick={() => setMediaModalTarget("cover")}
                className="px-2.5 py-2 text-[11px] font-semibold border border-[#e5e2da] bg-white hover:bg-gray-50 text-[#18221b] cursor-pointer"
              >
                R2 Library
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#18221b] mb-1">
                Image Alt Text (SEO)
              </label>
              <input
                type="text"
                dir="auto"
                value={meta.coverImageAlt || ""}
                onChange={(e) => updateMeta("coverImageAlt", e.target.value)}
                placeholder="Describe what is in the photo..."
                className="w-full px-2.5 py-1.5 text-xs border border-[#e5e2da] bg-[#fbfaf8] focus:bg-white focus:outline-none focus:border-[#184e2d]"
              />
            </div>
          </div>

          {/* 4. Newsroom Flags & Breaking Ticker */}
          <div className="bg-white border border-[#e5e2da] p-4 shadow-2xs space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#5c635b] border-b border-[#e5e2da] pb-2">
              Newsroom Flags
            </h3>

            <label className="flex items-center justify-between text-xs cursor-pointer py-1">
              <div>
                <span className="font-semibold text-[#18221b] block">Breaking ticker</span>
                <span className="text-[11px] text-[#5c635b]">Syncs directly to live ticker</span>
              </div>
              <input
                type="checkbox"
                checked={isBreaking}
                onChange={(e) => setIsBreaking(e.target.checked)}
                className="size-4 accent-[#184e2d]"
              />
            </label>

            {isBreaking && (
              <div className="pl-2 border-l-2 border-red-400">
                <label className="block text-[11px] font-semibold text-[#18221b] mb-1">Ticker Priority</label>
                <select
                  value={meta.breakingPriority || 1}
                  onChange={(e) => updateMeta("breakingPriority", Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 text-xs border border-[#e5e2da] bg-[#fbfaf8]"
                >
                  <option value={1}>Normal</option>
                  <option value={2}>Breaking</option>
                  <option value={3}>Flash</option>
                </select>
              </div>
            )}

            <label className="flex items-center justify-between text-xs cursor-pointer py-1">
              <div>
                <span className="font-semibold text-[#18221b] block">Featured</span>
                <span className="text-[11px] text-[#5c635b]">Eligible for the homepage hero</span>
              </div>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="size-4 accent-[#184e2d]"
              />
            </label>

            <label className="flex items-center justify-between text-xs cursor-pointer py-1">
              <span className="font-semibold text-[#18221b]">Exclusive</span>
              <input
                type="checkbox"
                checked={Boolean(meta.isExclusive)}
                onChange={(e) => updateMeta("isExclusive", e.target.checked)}
                className="size-4 accent-[#184e2d]"
              />
            </label>

            <label className="flex items-center justify-between text-xs cursor-pointer py-1">
              <span className="font-semibold text-[#18221b]">Allow comments</span>
              <input
                type="checkbox"
                checked={meta.allowComments !== false}
                onChange={(e) => updateMeta("allowComments", e.target.checked)}
                className="size-4 accent-[#184e2d]"
              />
            </label>
          </div>
        </aside>
      </div>

      {/* Modals & Drawers */}
      <MediaPickerModal
        open={Boolean(mediaModalTarget)}
        onClose={() => setMediaModalTarget(null)}
        onSelect={(url, alt) => {
          if (mediaModalTarget === "cover") {
            setCoverImage(url);
            if (!meta.coverImageAlt && alt) updateMeta("coverImageAlt", alt);
          } else if (sourceMode) {
            const imgTag = `<p><img src="${url}" alt="${alt || ""}" /></p>`;
            if (activeTab === "ur") setContentUr((p) => `${p}\n${imgTag}`);
            else setContentEn((p) => `${p}\n${imgTag}`);
          } else {
            tiptapRef.current?.insertImage(url, alt || "");
          }
        }}
      />

      <ImageFramingModal
        open={framingOpen}
        imageUrl={coverImage}
        initialFraming={meta.coverFraming}
        onClose={() => setFramingOpen(false)}
        onSave={(framing) => {
          updateMeta("coverFraming", framing);
          showToast("Image framing saved");
        }}
      />

      <PreviewArrangeDrawer
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        initialLocale={activeTab}
        titleUr={titleUr}
        titleEn={titleEn}
        summaryUr={summaryUr}
        summaryEn={summaryEn}
        contentUr={contentUr}
        contentEn={contentEn}
        coverImage={coverImage}
        coverFraming={meta.coverFraming}
        categoryName={activeCategoryName}
        categoryNameUr={activeCategoryNameUr}
        categoryNameEn={activeCategoryNameEn}
        authorName={authorName}
        authorNameUr={authorName}
        authorNameEn={meta.bylineEn}
        onApplyArrangedContent={(locale, html) => {
          if (locale === "ur") setContentUr(html);
          else setContentEn(html);
          showToast("Block arrangement applied");
        }}
      />
    </div>
  );
}
