"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Globe,
  Save,
  Send,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading2,
  Heading3,
  Quote,
  List,
  ListOrdered,
  Image as ImageIcon,
  Video,
  Share2,
  Table,
  Minus,
  AlignRight,
  AlignLeft,
  Lock,
  Unlock,
  UploadCloud,
  X,
  Smartphone,
  Monitor,
  Calendar,
  ChevronDown,
  ExternalLink,
  Flame,
  Star,
  MessageSquareOff,
  Radio,
  FileCheck,
} from "lucide-react";

const CATEGORIES = [
  { id: 1, slug: "national", name_ur: "قومی", name_en: "National / Pakistan" },
  { id: 2, slug: "international", name_ur: "بین الاقوامی", name_en: "International / World" },
  { id: 3, slug: "business", name_ur: "تجارت و کاروبار", name_en: "Business & Economy" },
  { id: 4, slug: "sports", name_ur: "کھیل", name_en: "Sports" },
  { id: 5, slug: "entertainment", name_ur: "شوبز", name_en: "Showbiz & Entertainment" },
  { id: 6, slug: "health-science", name_ur: "صحت و سائنس", name_en: "Health & Science" },
  { id: 7, slug: "opinion", name_ur: "رائے و اداریے", name_en: "Opinion & Columns" },
  { id: 8, slug: "blogs", name_ur: "بلاگز", name_en: "Blogs & Perspectives" },
  { id: 9, slug: "crime", name_ur: "جرائم و عدلیہ", name_en: "Crime & Courts" },
  { id: 10, slug: "climate", name_ur: "موسم و ماحولیات", name_en: "Climate & Weather" },
  { id: 11, slug: "fact-check", name_ur: "حقائق کی جانچ", name_en: "Fact Check" },
  { id: 12, slug: "weird", name_ur: "عجیب و غریب", name_en: "Weird News" },
  { id: 13, slug: "religion", name_ur: "اسلام و مذہب", name_en: "Religion & Ethics" },
  { id: 14, slug: "lifestyle", name_ur: "لائف اسٹائل", name_en: "Lifestyle & Culture" },
  { id: 15, slug: "special-reports", name_ur: "خصوصی رپورٹس", name_en: "Special Reports" },
  { id: 16, slug: "videos", name_ur: "ویڈیوز", name_en: "Video Stories" },
];

const AUTHORS = [
  { id: 1, name: "ایڈیٹوریل ڈیسک (Editorial Desk)", role: "Desk" },
  { id: 2, name: "محمد اسد بیگ (Chief Editor)", role: "Chief Editor" },
  { id: 3, name: "سینئر نامہ نگار (Senior Reporter)", role: "Correspondent" },
  { id: 4, name: "ڈیلی افادیت اسپورٹس بیورو", role: "Sports Desk" },
  { id: 5, name: "خصوصی نامہ نگار اسلام آباد", role: "Islamabad Bureau" },
  { id: 6, name: "بین الاقوامی مانیٹرنگ ڈیسک", role: "Foreign Desk" },
];

export default function ArticleEditorClient({ initialId = null }) {
  const router = useRouter();
  const isEdit = Boolean(initialId);

  // Active edition tab in editor: 'ur' or 'en'
  const [activeEdition, setActiveEdition] = useState("ur");

  // Article Form State
  const [articleId, setArticleId] = useState(initialId || null);
  const [titleUr, setTitleUr] = useState("");
  const [titleEn, setTitleEn] = useState("");
  const [slug, setSlug] = useState("");
  const [slugLocked, setSlugLocked] = useState(true);
  const [summaryUr, setSummaryUr] = useState("");
  const [summaryEn, setSummaryEn] = useState("");
  const [contentUr, setContentUr] = useState("");
  const [contentEn, setContentEn] = useState("");
  const [categoryId, setCategoryId] = useState(1);
  const [storyType, setStoryType] = useState("standard");
  const [status, setStatus] = useState("draft"); // draft, in_review, ready, scheduled, published
  const [scheduledAt, setScheduledAt] = useState("");
  const [authorName, setAuthorName] = useState(AUTHORS[0].name);

  // Featured Media State
  const [coverImage, setCoverImage] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [imageCredit, setImageCredit] = useState("ڈیلی افادیت / فائل فوٹو");
  const [imageAlt, setImageAlt] = useState("");
  const [focalPoint, setFocalPoint] = useState("center");

  // Promotion & Editorial Flags
  const [isBreaking, setIsBreaking] = useState(false);
  const [isRedAlert, setIsRedAlert] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isEditorsPick, setIsEditorsPick] = useState(false);
  const [disableComments, setDisableComments] = useState(false);

  // SEO & Social State
  const [focusKeyphrase, setFocusKeyphrase] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");
  const [serpPreviewMode, setSerpPreviewMode] = useState("desktop"); // desktop or mobile

  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveNotice, setSaveNotice] = useState(null);
  const [autoSavedTime, setAutoSavedTime] = useState("06:56 PKT");
  const [embedModal, setEmbedModal] = useState(null); // 'video' | 'social' | null
  const [embedInput, setEmbedInput] = useState("");

  const contentTextareaRef = useRef(null);

  // Load existing article if editing
  useEffect(() => {
    if (initialId) {
      setLoading(true);
      fetch(`/api/articles/${initialId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data?.article) {
            const a = data.article;
            setArticleId(a.id);
            setTitleUr(a.title_ur || "");
            setTitleEn(a.title_en || "");
            setSlug(a.slug || "");
            setSummaryUr(a.summary_ur || "");
            setCategoryId(a.category_id || 1);
            setCoverImage(a.cover_image || "");
            setIsBreaking(Boolean(a.is_breaking));
            setIsFeatured(Boolean(a.is_featured));
            setAuthorName(a.author_name || AUTHORS[0].name);

            // Handle English content / excerpt
            if (a.content_en) {
              const match = a.content_en.match(/<!--excerpt:([\s\S]*?)-->/);
              if (match) {
                setSummaryEn(match[1].trim());
                setContentEn(a.content_en.replace(/<!--excerpt:[\s\S]*?-->\n?/, "").trim());
              } else {
                setContentEn(a.content_en);
              }
            }
            setContentUr(a.content_ur || "");
            setStatus(a.status || "published");
          }
        })
        .catch((err) => console.error("Error loading article:", err))
        .finally(() => setLoading(false));
    }
  }, [initialId]);

  // Auto-generate slug from English title or transliterated slug if locked
  const handleTitleChange = (val, lang) => {
    if (lang === "ur") {
      setTitleUr(val);
      if (slugLocked && !slug && !isEdit) {
        setSlug("afadiat-" + Math.floor(100000 + Math.random() * 900000));
      }
    } else {
      setTitleEn(val);
      if (slugLocked && !isEdit) {
        const clean = val
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .substring(0, 60);
        if (clean) setSlug(clean);
      }
    }
  };

  // Text formatting insertion into current active content
  const handleInsertFormatting = (prefix, suffix = "") => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);
    const replacement = `${prefix}${selected || (prefix.includes("#") ? "Heading" : "Text")}${suffix}`;
    const currentValue = activeEdition === "ur" ? contentUr : contentEn;
    const nextValue = currentValue.substring(0, start) + replacement + currentValue.substring(end);

    if (activeEdition === "ur") {
      setContentUr(nextValue);
    } else {
      setContentEn(nextValue);
    }

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 50);
  };

  // Handle Embed insertions (Video / Social)
  const handleApplyEmbed = () => {
    if (!embedInput.trim()) return;
    let embedBlock = "";
    if (embedModal === "video") {
      embedBlock = `\n\n[youtube-embed url="${embedInput.trim()}"]\n\n`;
    } else if (embedModal === "social") {
      embedBlock = `\n\n[social-embed url="${embedInput.trim()}"]\n\n`;
    }

    if (activeEdition === "ur") {
      setContentUr((prev) => prev + embedBlock);
    } else {
      setContentEn((prev) => prev + embedBlock);
    }

    setEmbedModal(null);
    setEmbedInput("");
  };

  // Metrics calculations
  const currentContent = activeEdition === "ur" ? contentUr : contentEn;
  const currentTitle = activeEdition === "ur" ? titleUr : titleEn;
  const wordCount = currentContent.trim() ? currentContent.trim().split(/\s+/).length : 0;
  const charCount = currentContent.length;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 180));
  const titleCharCount = currentTitle.length;

  // Save / Update Handler
  const handleSave = async (newStatus = null) => {
    const targetStatus = newStatus || status;

    if (!titleUr.trim() && !titleEn.trim()) {
      setSaveNotice({
        type: "error",
        text: "براہ کرم اردو یا انگریزی سرخی درج کریں۔ (Please enter a headline in Urdu or English).",
      });
      return;
    }

    setSaving(true);
    setSaveNotice(null);

    const finalContentEn = contentEn.trim()
      ? summaryEn.trim()
        ? `<!--excerpt:${summaryEn.trim()}-->\n${contentEn.trim()}`
        : contentEn.trim()
      : null;

    const payload = {
      title_ur: titleUr.trim() || titleEn.trim(),
      title_en: titleEn.trim() || null,
      slug: slug.trim() || `story-${Date.now()}`,
      category_id: Number(categoryId),
      summary_ur: summaryUr.trim() || titleUr.trim().substring(0, 160),
      content_ur: contentUr.trim() || (titleUr ? `<p>${titleUr}</p>` : ""),
      content_en: finalContentEn,
      cover_image: coverImage || null,
      is_breaking: isBreaking,
      is_featured: isFeatured,
      author_name: authorName,
      status: targetStatus,
    };

    try {
      const endpoint = isEdit ? `/api/articles/${articleId}` : "/api/articles";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        const now = new Date();
        const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
        setAutoSavedTime(`${timeStr} PKT`);
        setStatus(targetStatus);

        setSaveNotice({
          type: "success",
          text: isEdit
            ? `✓ مضمون بحیثیت ${targetStatus.toUpperCase()} محفوظ ہو گیا۔`
            : `✓ نیا مضمون کامیابی کے ساتھ محفوظ ہو گیا۔`,
        });

        if (!isEdit && data?.article?.id) {
          router.push(`/admin/articles/${data.article.id}`);
        }
      } else {
        setSaveNotice({ type: "error", text: data.error || "محفوظ کرنے میں خرابی پیش آئی۔" });
      }
    } catch (err) {
      setSaveNotice({ type: "error", text: "نیٹ ورک میں خرابی پیش آئی۔" });
    } finally {
      setSaving(false);
      setTimeout(() => setSaveNotice(null), 5000);
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case "published":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300">Published</span>;
      case "ready":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-indigo-100 text-indigo-800 border border-indigo-300">Ready</span>;
      case "in_review":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-amber-100 text-amber-800 border border-amber-300">In review</span>;
      case "scheduled":
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-blue-100 text-blue-800 border border-blue-300">Scheduled</span>;
      default:
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-gray-100 text-gray-700 border border-gray-300">Draft</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2 text-sm text-[#5f6368]">
          <div className="w-5 h-5 border-2 border-[#124e2b] border-t-transparent rounded-full animate-spin" />
          <span>مضمون لوڈ ہو رہا ہے…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-16">
      {/* 1. Sibling Draft Creation Notice Banner */}
      <div className="bg-[#f0f9f3] border border-[#cbe4d4] rounded-xl p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-[#0a2618]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#124e2b] text-white flex items-center justify-center font-bold shrink-0">
            ⇄
          </div>
          <div>
            <span className="font-bold text-[#124e2b]">Bilingual Sibling Linker: </span>
            <span>Write in either edition — a linked sibling draft is maintained automatically.</span>
            <span className="ml-2 font-mono font-bold text-gray-600 bg-white px-2 py-0.5 rounded border border-[#cbe4d4]">
              {articleId ? `#U${articleId} ⇄ #E${articleId}` : "#U(Draft) ⇄ #E(Draft)"}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setActiveEdition(activeEdition === "ur" ? "en" : "ur")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#cbe4d4] hover:bg-emerald-50 text-emerald-800 font-semibold transition-colors self-start sm:self-auto shrink-0 shadow-xs"
        >
          <Globe size={13} className="text-emerald-700" />
          <span>
            {activeEdition === "ur"
              ? "Switch to English Sibling (EN)"
              : "اردو ڈرافٹ پر جائیں (UR)"}
          </span>
        </button>
      </div>

      {/* 2. Top Header & Action Bar */}
      <div className="bg-white border border-[#e5e2da] rounded-xl p-3 sm:p-4 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: Back & Status info */}
        <div className="flex items-center flex-wrap gap-3">
          <Link
            href="/admin/articles"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-gray-900 bg-[#f9f8f5] px-2.5 py-1.5 rounded-lg border border-[#e5e2da] transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Articles</span>
          </Link>
          <div className="h-4 w-[1px] bg-gray-200" />
          {getStatusBadge()}
          <span className="text-[11px] text-gray-500 flex items-center gap-1">
            <CheckCircle2 size={12} className="text-emerald-600" />
            Auto-saved {autoSavedTime}
          </span>
        </div>

        {/* Center: Language Switcher Tabs */}
        <div className="flex items-center bg-[#f9f8f5] p-1 rounded-xl border border-[#e5e2da] self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveEdition("ur")}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeEdition === "ur"
                ? "bg-[#124e2b] text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span>اردو (UR)</span>
            {titleUr && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
          </button>
          <button
            type="button"
            onClick={() => setActiveEdition("en")}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeEdition === "en"
                ? "bg-[#124e2b] text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span>English (EN)</span>
            {titleEn && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
          </button>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center flex-wrap gap-2">
          {articleId && (
            <Link
              href={`/story/${articleId}`}
              target="_blank"
              className="inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-[#e5e2da] rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ExternalLink size={13} />
              <span>View live ↗</span>
            </Link>
          )}

          <button
            type="button"
            onClick={() => handleSave("draft")}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-gray-700 bg-white border border-[#e5e2da] rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <Save size={13} />
            <span>Save draft</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave("published")}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#124e2b] hover:bg-[#0e3d22] rounded-lg transition-colors shadow-xs disabled:opacity-50"
          >
            <Send size={13} />
            <span>{saving ? "Saving..." : status === "published" ? "Update story" : "Publish now"}</span>
          </button>
        </div>
      </div>

      {/* Save Notification alert */}
      {saveNotice && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between ${
            saveNotice.type === "success"
              ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
              : "bg-red-50 text-red-900 border border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {saveNotice.type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
            <span>{saveNotice.text}</span>
          </div>
          <button onClick={() => setSaveNotice(null)} className="text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        </div>
      )}

      {/* 3. Main Editor Grid: Left Editor (7 Cols) & Right Panels (5 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* LEFT COLUMN: Editorial Body & Content (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Headline / Title Card */}
          <div className="bg-white border border-[#e5e2da] rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <span>{activeEdition === "ur" ? "مضمون کی سرخی (Headline)" : "Article Headline"}</span>
                <span className="text-red-500">*</span>
              </label>

              {/* Character Count & SERP optimal indicator */}
              <div className="flex items-center gap-2 text-[11px]">
                <span
                  className={`font-mono font-semibold ${
                    titleCharCount > 110
                      ? "text-red-600"
                      : titleCharCount > 80
                      ? "text-amber-600"
                      : "text-gray-500"
                  }`}
                >
                  {titleCharCount} / 110 chars
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    titleCharCount > 110
                      ? "bg-red-100 text-red-700"
                      : "bg-emerald-100 text-emerald-800"
                  }`}
                >
                  {titleCharCount > 110 ? "Exceeds Google Snippet" : "Optimal for SERP"}
                </span>
              </div>
            </div>

            {activeEdition === "ur" ? (
              <input
                type="text"
                dir="rtl"
                value={titleUr}
                onChange={(e) => handleTitleChange(e.target.value, "ur")}
                placeholder="اہم خبر یا تفصیلی مضمون کی سرخی یہاں درج کریں…"
                className="w-full text-xl sm:text-2xl font-serif urdu-headline text-gray-900 border border-[#e5e2da] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#124e2b] placeholder:text-gray-300"
              />
            ) : (
              <input
                type="text"
                dir="ltr"
                value={titleEn}
                onChange={(e) => handleTitleChange(e.target.value, "en")}
                placeholder="Enter engaging, SEO-friendly headline in English..."
                className="w-full text-xl sm:text-2xl font-bold font-sans text-gray-900 border border-[#e5e2da] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#124e2b] placeholder:text-gray-300"
              />
            )}

            {/* Permalink / Slug preview */}
            <div className="flex items-center gap-2 text-xs text-gray-500 bg-[#f9f8f5] p-2.5 rounded-lg border border-[#e5e2da]">
              <span className="font-semibold shrink-0">Permalink:</span>
              <span className="font-mono text-gray-400 truncate">https://dailyafadiat.com/articles/</span>
              {slugLocked ? (
                <span className="font-mono font-bold text-gray-800 truncate">{slug || "story-slug"}</span>
              ) : (
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="font-mono text-xs text-gray-900 bg-white border border-[#e5e2da] rounded px-2 py-0.5 focus:outline-none focus:ring-1 focus:ring-emerald-700 w-48"
                />
              )}
              <button
                type="button"
                onClick={() => setSlugLocked(!slugLocked)}
                className="text-gray-400 hover:text-gray-700 ml-auto shrink-0"
                title={slugLocked ? "Unlock slug to edit" : "Lock slug"}
              >
                {slugLocked ? <Lock size={13} /> : <Unlock size={13} className="text-emerald-700" />}
              </button>
            </div>
          </div>

          {/* Excerpt / Summary Card */}
          <div className="bg-white border border-[#e5e2da] rounded-xl p-4 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-gray-800">
                {activeEdition === "ur" ? "مختصر خلاصہ یا تعارف (Excerpt / Teaser)" : "Story Teaser / Excerpt"}
              </label>
              <span className="text-[11px] font-mono text-gray-400">
                {(activeEdition === "ur" ? summaryUr : summaryEn).length} / 250 chars
              </span>
            </div>

            {activeEdition === "ur" ? (
              <textarea
                dir="rtl"
                rows={2}
                value={summaryUr}
                onChange={(e) => setSummaryUr(e.target.value)}
                placeholder="دو سطری جامع خلاصہ تحریر کریں جو سرورق اور سوشل میڈیا پر دکھایا جائے گا…"
                className="w-full text-sm font-serif urdu-headline text-gray-800 border border-[#e5e2da] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#124e2b] resize-none placeholder:text-gray-300"
              />
            ) : (
              <textarea
                dir="ltr"
                rows={2}
                value={summaryEn}
                onChange={(e) => setSummaryEn(e.target.value)}
                placeholder="Write a concise 2-sentence teaser for the homepage grid, RSS feeds, and social share cards..."
                className="w-full text-xs font-sans text-gray-800 border border-[#e5e2da] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-[#124e2b] resize-none placeholder:text-gray-300"
              />
            )}
            <p className="text-[10px] text-gray-400">
              {activeEdition === "ur"
                ? "خلاصہ خود بخود گوگل سرچ کے میٹا ڈسکرپشن اور واٹس ایپ/فیس بک شیئر کارڈ میں استعمال ہوگا۔"
                : "This summary seeds the Google meta description, OpenGraph preview, and reader teaser."}
            </p>
          </div>

          {/* Rich Text Editor Suite */}
          <div className="bg-white border border-[#e5e2da] rounded-xl shadow-xs overflow-hidden">
            {/* Toolbar */}
            <div className="bg-[#f9f8f5] border-b border-[#e5e2da] p-2 flex items-center flex-wrap gap-1">
              {/* Text formatting */}
              <button
                type="button"
                onClick={() => handleInsertFormatting("**", "**")}
                className="p-1.5 hover:bg-white text-gray-700 hover:text-black rounded border border-transparent hover:border-gray-200 transition-colors"
                title="Bold (Ctrl+B)"
              >
                <Bold size={15} />
              </button>
              <button
                type="button"
                onClick={() => handleInsertFormatting("*", "*")}
                className="p-1.5 hover:bg-white text-gray-700 hover:text-black rounded border border-transparent hover:border-gray-200 transition-colors"
                title="Italic (Ctrl+I)"
              >
                <Italic size={15} />
              </button>
              <button
                type="button"
                onClick={() => handleInsertFormatting("<u>", "</u>")}
                className="p-1.5 hover:bg-white text-gray-700 hover:text-black rounded border border-transparent hover:border-gray-200 transition-colors"
                title="Underline"
              >
                <Underline size={15} />
              </button>
              <button
                type="button"
                onClick={() => handleInsertFormatting("~~", "~~")}
                className="p-1.5 hover:bg-white text-gray-700 hover:text-black rounded border border-transparent hover:border-gray-200 transition-colors"
                title="Strikethrough"
              >
                <Strikethrough size={15} />
              </button>

              <div className="h-4 w-[1px] bg-gray-300 mx-1" />

              {/* Headings */}
              <button
                type="button"
                onClick={() => handleInsertFormatting("\n## ", "\n")}
                className="p-1.5 hover:bg-white text-gray-700 hover:text-black rounded border border-transparent hover:border-gray-200 transition-colors"
                title="Heading 2"
              >
                <Heading2 size={15} />
              </button>
              <button
                type="button"
                onClick={() => handleInsertFormatting("\n### ", "\n")}
                className="p-1.5 hover:bg-white text-gray-700 hover:text-black rounded border border-transparent hover:border-gray-200 transition-colors"
                title="Heading 3"
              >
                <Heading3 size={15} />
              </button>
              <button
                type="button"
                onClick={() => handleInsertFormatting("\n> ", "\n")}
                className="p-1.5 hover:bg-white text-gray-700 hover:text-black rounded border border-transparent hover:border-gray-200 transition-colors"
                title="Blockquote"
              >
                <Quote size={15} />
              </button>

              <div className="h-4 w-[1px] bg-gray-300 mx-1" />

              {/* Lists */}
              <button
                type="button"
                onClick={() => handleInsertFormatting("\n- ", "\n")}
                className="p-1.5 hover:bg-white text-gray-700 hover:text-black rounded border border-transparent hover:border-gray-200 transition-colors"
                title="Bullet List"
              >
                <List size={15} />
              </button>
              <button
                type="button"
                onClick={() => handleInsertFormatting("\n1. ", "\n")}
                className="p-1.5 hover:bg-white text-gray-700 hover:text-black rounded border border-transparent hover:border-gray-200 transition-colors"
                title="Numbered List"
              >
                <ListOrdered size={15} />
              </button>

              <div className="h-4 w-[1px] bg-gray-300 mx-1" />

              {/* Rich Inserts */}
              <button
                type="button"
                onClick={() => {
                  const url = prompt("تصویر کا URL درج کریں (Image URL):");
                  if (url) handleInsertFormatting(`\n![تصویر](${url})\n`);
                }}
                className="inline-flex items-center gap-1 px-2 py-1 hover:bg-white text-gray-700 rounded border border-transparent hover:border-gray-200 text-xs font-semibold"
                title="Insert Image"
              >
                <ImageIcon size={14} className="text-emerald-700" />
                <span>+ Image</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmbedModal("video");
                  setEmbedInput("");
                }}
                className="inline-flex items-center gap-1 px-2 py-1 hover:bg-white text-gray-700 rounded border border-transparent hover:border-gray-200 text-xs font-semibold"
                title="Insert Video"
              >
                <Video size={14} className="text-red-600" />
                <span>+ Video</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setEmbedModal("social");
                  setEmbedInput("");
                }}
                className="inline-flex items-center gap-1 px-2 py-1 hover:bg-white text-gray-700 rounded border border-transparent hover:border-gray-200 text-xs font-semibold"
                title="Insert Social Embed"
              >
                <Share2 size={14} className="text-sky-600" />
                <span>+ Social</span>
              </button>

              <button
                type="button"
                onClick={() => handleInsertFormatting("\n| کالم 1 | کالم 2 |\n| --- | --- |\n| ڈیٹا 1 | ڈیٹا 2 |\n")}
                className="p-1.5 hover:bg-white text-gray-700 hover:text-black rounded border border-transparent hover:border-gray-200 transition-colors"
                title="Insert Table"
              >
                <Table size={15} />
              </button>

              <button
                type="button"
                onClick={() => handleInsertFormatting("\n\n---\n\n")}
                className="p-1.5 hover:bg-white text-gray-700 hover:text-black rounded border border-transparent hover:border-gray-200 transition-colors"
                title="Horizontal Divider"
              >
                <Minus size={15} />
              </button>
            </div>

            {/* Embed Insertion Modal Prompt Bar */}
            {embedModal && (
              <div className="bg-[#f0f9f3] p-3 border-b border-[#cbe4d4] flex items-center gap-2">
                <span className="text-xs font-bold text-[#124e2b] shrink-0">
                  {embedModal === "video" ? "YouTube Video Embed:" : "Social Post Embed (X / FB / Insta):"}
                </span>
                <input
                  type="text"
                  value={embedInput}
                  onChange={(e) => setEmbedInput(e.target.value)}
                  placeholder={
                    embedModal === "video"
                      ? "https://www.youtube.com/watch?v=..."
                      : "https://twitter.com/user/status/..."
                  }
                  className="w-full text-xs p-1.5 rounded border border-[#cbe4d4] focus:outline-none focus:ring-1 focus:ring-emerald-700 bg-white"
                />
                <button
                  type="button"
                  onClick={handleApplyEmbed}
                  className="px-3 py-1.5 bg-[#124e2b] text-white text-xs font-bold rounded shrink-0 hover:bg-[#0e3d22]"
                >
                  Insert
                </button>
                <button
                  type="button"
                  onClick={() => setEmbedModal(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 shrink-0"
                >
                  <X size={15} />
                </button>
              </div>
            )}

            {/* Editable Content Textarea */}
            <div className="p-4">
              {activeEdition === "ur" ? (
                <textarea
                  ref={contentTextareaRef}
                  dir="rtl"
                  rows={18}
                  value={contentUr}
                  onChange={(e) => setContentUr(e.target.value)}
                  placeholder="مضمون کی مکمل تفصیل، پیراگراف اور بیانات یہاں تحریر کریں…"
                  className="w-full text-base sm:text-lg font-serif urdu-body text-gray-800 leading-loose focus:outline-none resize-y placeholder:text-gray-300"
                />
              ) : (
                <textarea
                  ref={contentTextareaRef}
                  dir="ltr"
                  rows={18}
                  value={contentEn}
                  onChange={(e) => setContentEn(e.target.value)}
                  placeholder="Write full article body paragraphs in English..."
                  className="w-full text-sm font-sans text-gray-800 leading-relaxed focus:outline-none resize-y placeholder:text-gray-300"
                />
              )}
            </div>

            {/* Editorial Metrics Footer */}
            <div className="bg-[#f9f8f5] border-t border-[#e5e2da] px-4 py-2 flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span>
                  Words: <strong className="font-mono text-gray-800">{wordCount}</strong>
                </span>
                <span>
                  Characters: <strong className="font-mono text-gray-800">{charCount}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={12} className="text-gray-400" />
                  Reading time: <strong className="text-gray-800">~{readTimeMinutes} min</strong>
                </span>
              </div>
              <div className="text-[11px] text-gray-400">
                Markdown & custom embeds supported
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Publishing Desks, Media & SEO (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Card 1: Workflow & Publication Desk */}
          <div className="bg-white border border-[#e5e2da] rounded-xl p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-[#f0eee6]">
              <FileCheck size={14} className="text-emerald-700" />
              <span>Workflow & Publishing</span>
            </h3>

            {/* Status Selector */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-700">Stage / Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full text-xs font-semibold p-2 border border-[#e5e2da] rounded-lg bg-[#f9f8f5] focus:outline-none focus:ring-1 focus:ring-emerald-700"
              >
                <option value="draft">Draft (مسودہ)</option>
                <option value="in_review">In Review (زیر جائزہ / ڈیسک)</option>
                <option value="ready">Ready (شائع کے لیے تیار)</option>
                <option value="scheduled">Scheduled (شیڈول شدہ)</option>
                <option value="published">Published (براہ راست لائیو)</option>
              </select>
            </div>

            {/* Schedule picker if Scheduled */}
            {status === "scheduled" && (
              <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-lg space-y-1.5 text-xs">
                <label className="font-bold text-blue-900 flex items-center gap-1">
                  <Calendar size={13} />
                  <span>Scheduled Publication Date & Time</span>
                </label>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full text-xs p-1.5 border border-blue-300 rounded bg-white text-gray-800 focus:outline-none"
                />
              </div>
            )}

            {/* Desk / Author Byline */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-700">Byline / Author Attribution</label>
              <select
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full text-xs p-2 border border-[#e5e2da] rounded-lg bg-[#f9f8f5] focus:outline-none focus:ring-1 focus:ring-emerald-700"
              >
                {AUTHORS.map((a) => (
                  <option key={a.id} value={a.name}>
                    {a.name} ({a.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Card 2: Taxonomy & Story Type */}
          <div className="bg-white border border-[#e5e2da] rounded-xl p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-[#f0eee6]">
              <Globe size={14} className="text-emerald-700" />
              <span>Section & Story Desk</span>
            </h3>

            {/* Category / Section */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-700">Category / Section</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className="w-full text-xs font-semibold p-2 border border-[#e5e2da] rounded-lg bg-[#f9f8f5] focus:outline-none focus:ring-1 focus:ring-emerald-700"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name_ur} — {cat.name_en}
                  </option>
                ))}
              </select>
            </div>

            {/* Story Type */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-700">Story Format</label>
              <select
                value={storyType}
                onChange={(e) => setStoryType(e.target.value)}
                className="w-full text-xs p-2 border border-[#e5e2da] rounded-lg bg-[#f9f8f5] focus:outline-none focus:ring-1 focus:ring-emerald-700"
              >
                <option value="standard">Standard Article (عام خبر)</option>
                <option value="breaking">Breaking Story (بریکنگ نیوز)</option>
                <option value="liveblog">Live Blog (براہ راست کوریج)</option>
                <option value="opinion">Op-Ed / Column (کالم و تجزیہ)</option>
                <option value="special">Special Report (خصوصی رپورٹ)</option>
                <option value="video">Video Feature (ویڈیو اسٹوری)</option>
              </select>
            </div>
          </div>

          {/* Card 3: Lead / Featured Media Desk */}
          <div className="bg-white border border-[#e5e2da] rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#f0eee6]">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon size={14} className="text-emerald-700" />
                <span>Lead / Featured Image</span>
              </h3>
              {coverImage && (
                <button
                  type="button"
                  onClick={() => setCoverImage("")}
                  className="text-[11px] text-red-600 hover:underline flex items-center gap-0.5"
                >
                  <X size={12} /> Remove
                </button>
              )}
            </div>

            {/* Image Preview or Dropzone */}
            {coverImage ? (
              <div className="space-y-2">
                <div className="relative aspect-video rounded-lg overflow-hidden border border-[#e5e2da] bg-black">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverImage}
                    alt={imageAlt || "Lead image"}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1.5 py-0.5 rounded">
                    Focal: {focalPoint}
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-[#e5e2da] rounded-xl p-4 text-center hover:border-emerald-500 bg-[#f9f8f5] transition-colors">
                <UploadCloud size={24} className="mx-auto text-gray-400 mb-1" />
                <p className="text-xs font-bold text-gray-700">Upload high-res lead photo</p>
                <p className="text-[10px] text-gray-400 mt-0.5">JPEG, PNG, WebP up to 5MB</p>
                <input
                  type="text"
                  placeholder="Or paste direct image URL..."
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  className="w-full mt-2 text-xs p-1.5 rounded border border-[#e5e2da] bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>
            )}

            {/* Focal Point Alignment */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-700">Adaptive Crop Focal Point</label>
              <div className="grid grid-cols-4 gap-1 text-[11px]">
                {["center", "top", "face", "bottom"].map((pt) => (
                  <button
                    key={pt}
                    type="button"
                    onClick={() => setFocalPoint(pt)}
                    className={`py-1 text-center rounded capitalize font-medium transition-colors ${
                      focalPoint === pt
                        ? "bg-[#124e2b] text-white"
                        : "bg-[#f9f8f5] text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {pt}
                  </button>
                ))}
              </div>
            </div>

            {/* Caption & Credit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[10px] font-bold text-gray-600">Photo Caption</label>
                <input
                  type="text"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  placeholder="تصویر کی مختصر وضاحت"
                  className="w-full p-1.5 border border-[#e5e2da] rounded bg-[#f9f8f5] text-xs focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-600">Photo Credit</label>
                <input
                  type="text"
                  value={imageCredit}
                  onChange={(e) => setImageCredit(e.target.value)}
                  placeholder="AFP / Reuters"
                  className="w-full p-1.5 border border-[#e5e2da] rounded bg-[#f9f8f5] text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* Image Alt Text (SEO Mandatory) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-gray-800 flex items-center gap-1">
                  <span>Image Alt Text</span>
                  <span className="text-red-500">* (SEO Mandatory)</span>
                </label>
                {!imageAlt && coverImage && (
                  <span className="text-[10px] font-semibold text-red-600">Missing Alt text!</span>
                )}
              </div>
              <input
                type="text"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="Descriptive text for Google News & Screen Readers..."
                className={`w-full p-1.5 border rounded text-xs focus:outline-none ${
                  !imageAlt && coverImage
                    ? "border-amber-400 bg-amber-50 focus:ring-1 focus:ring-amber-500"
                    : "border-[#e5e2da] bg-[#f9f8f5]"
                }`}
              />
            </div>
          </div>

          {/* Card 4: Editorial Promotion & Flags */}
          <div className="bg-white border border-[#e5e2da] rounded-xl p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-[#f0eee6]">
              <Sparkles size={14} className="text-emerald-700" />
              <span>Editorial Promotion Flags</span>
            </h3>

            {/* Breaking News Toggle */}
            <label className="flex items-center justify-between p-2 rounded-lg bg-[#f9f8f5] hover:bg-emerald-50/50 cursor-pointer transition-colors border border-transparent hover:border-emerald-200">
              <div className="flex items-center gap-2">
                <Flame size={15} className={isBreaking ? "text-red-600" : "text-gray-400"} />
                <div>
                  <span className="text-xs font-bold text-gray-800 block">Breaking News Ticker</span>
                  <span className="text-[10px] text-gray-500">Live red ticker strip on top of portal</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isBreaking}
                onChange={(e) => setIsBreaking(e.target.checked)}
                className="w-4 h-4 text-emerald-700 rounded focus:ring-emerald-700 cursor-pointer"
              />
            </label>

            {/* Red Alert Flash Banner */}
            <label className="flex items-center justify-between p-2 rounded-lg bg-[#f9f8f5] hover:bg-emerald-50/50 cursor-pointer transition-colors border border-transparent hover:border-emerald-200">
              <div className="flex items-center gap-2">
                <Radio size={15} className={isRedAlert ? "text-red-700 animate-pulse" : "text-gray-400"} />
                <div>
                  <span className="text-xs font-bold text-gray-800 block">Red Alert / Flash Banner</span>
                  <span className="text-[10px] text-gray-500">Urgent persistent top-of-site red alert</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isRedAlert}
                onChange={(e) => setIsRedAlert(e.target.checked)}
                className="w-4 h-4 text-emerald-700 rounded focus:ring-emerald-700 cursor-pointer"
              />
            </label>

            {/* Homepage Featured */}
            <label className="flex items-center justify-between p-2 rounded-lg bg-[#f9f8f5] hover:bg-emerald-50/50 cursor-pointer transition-colors border border-transparent hover:border-emerald-200">
              <div className="flex items-center gap-2">
                <Star size={15} className={isFeatured ? "text-amber-500" : "text-gray-400"} />
                <div>
                  <span className="text-xs font-bold text-gray-800 block">Featured on Homepage</span>
                  <span className="text-[10px] text-gray-500">Top hero slot & broadsheet lead</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-emerald-700 rounded focus:ring-emerald-700 cursor-pointer"
              />
            </label>

            {/* Editor's Pick */}
            <label className="flex items-center justify-between p-2 rounded-lg bg-[#f9f8f5] hover:bg-emerald-50/50 cursor-pointer transition-colors border border-transparent hover:border-emerald-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={15} className={isEditorsPick ? "text-emerald-700" : "text-gray-400"} />
                <div>
                  <span className="text-xs font-bold text-gray-800 block">Editor&apos;s Pick</span>
                  <span className="text-[10px] text-gray-500">Editorial curated story badge</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isEditorsPick}
                onChange={(e) => setIsEditorsPick(e.target.checked)}
                className="w-4 h-4 text-emerald-700 rounded focus:ring-emerald-700 cursor-pointer"
              />
            </label>

            {/* Disable Comments */}
            <label className="flex items-center justify-between p-2 rounded-lg bg-[#f9f8f5] hover:bg-red-50/50 cursor-pointer transition-colors border border-transparent hover:border-red-200">
              <div className="flex items-center gap-2">
                <MessageSquareOff size={15} className={disableComments ? "text-gray-700" : "text-gray-400"} />
                <div>
                  <span className="text-xs font-bold text-gray-800 block">Disable Reader Comments</span>
                  <span className="text-[10px] text-gray-500">Turn off discussion queue for story</span>
                </div>
              </div>
              <input
                type="checkbox"
                checked={disableComments}
                onChange={(e) => setDisableComments(e.target.checked)}
                className="w-4 h-4 text-gray-700 rounded focus:ring-gray-700 cursor-pointer"
              />
            </label>
          </div>

          {/* Card 5: SEO & Google SERP Preview Suite */}
          <div className="bg-white border border-[#e5e2da] rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-[#f0eee6]">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-emerald-700" />
                <span>SEO & Google SERP Preview</span>
              </h3>
              <div className="flex items-center gap-1 bg-[#f9f8f5] p-0.5 rounded border border-[#e5e2da]">
                <button
                  type="button"
                  onClick={() => setSerpPreviewMode("desktop")}
                  className={`p-1 rounded ${
                    serpPreviewMode === "desktop" ? "bg-white text-emerald-800 shadow-xs" : "text-gray-400"
                  }`}
                  title="Desktop SERP"
                >
                  <Monitor size={12} />
                </button>
                <button
                  type="button"
                  onClick={() => setSerpPreviewMode("mobile")}
                  className={`p-1 rounded ${
                    serpPreviewMode === "mobile" ? "bg-white text-emerald-800 shadow-xs" : "text-gray-400"
                  }`}
                  title="Mobile SERP"
                >
                  <Smartphone size={12} />
                </button>
              </div>
            </div>

            {/* Focus Keyphrase */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-700">Focus Keyphrase</label>
              <input
                type="text"
                value={focusKeyphrase}
                onChange={(e) => setFocusKeyphrase(e.target.value)}
                placeholder="e.g. Pakistan Economy, AI Education"
                className="w-full p-1.5 border border-[#e5e2da] rounded bg-[#f9f8f5] text-xs focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            {/* Meta Title */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-gray-700">Meta Title Override</label>
                <span className="text-[10px] font-mono text-gray-400">{metaTitle.length} / 60</span>
              </div>
              <input
                type="text"
                value={metaTitle}
                onChange={(e) => setMetaTitle(e.target.value)}
                placeholder={currentTitle || "Default headline used"}
                className="w-full p-1.5 border border-[#e5e2da] rounded bg-[#f9f8f5] text-xs focus:outline-none"
              />
            </div>

            {/* Meta Description */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-gray-700">Meta Description Override</label>
                <span className="text-[10px] font-mono text-gray-400">{metaDescription.length} / 155</span>
              </div>
              <textarea
                rows={2}
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                placeholder={
                  (activeEdition === "ur" ? summaryUr : summaryEn) ||
                  "Default teaser used in Google search snippet..."
                }
                className="w-full p-1.5 border border-[#e5e2da] rounded bg-[#f9f8f5] text-xs focus:outline-none resize-none"
              />
            </div>

            {/* Canonical URL */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-gray-700">Canonical URL (Optional)</label>
              <input
                type="text"
                value={canonicalUrl}
                onChange={(e) => setCanonicalUrl(e.target.value)}
                placeholder="Leave blank for auto /articles/slug"
                className="w-full p-1.5 border border-[#e5e2da] rounded bg-[#f9f8f5] text-xs focus:outline-none font-mono"
              />
            </div>

            {/* Google SERP Card Mockup */}
            <div className="p-3 bg-[#f8f9fa] border border-gray-200 rounded-lg space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] text-gray-600">
                <div className="w-4 h-4 rounded-full bg-emerald-800 text-white text-[9px] flex items-center justify-center font-bold">
                  A
                </div>
                <div className="truncate">
                  <span className="font-semibold text-gray-900">Daily Afadiat</span>
                  <span className="text-gray-400 mx-1">›</span>
                  <span className="text-gray-500 font-mono text-[10px]">articles/{slug || "slug"}</span>
                </div>
              </div>
              <h4 className="text-xs font-semibold text-[#1a0dab] hover:underline cursor-pointer line-clamp-1">
                {metaTitle || currentTitle || "Daily Afadiat — Breaking News and In-depth Reports"}
              </h4>
              <p className="text-[11px] text-[#4d5156] line-clamp-2 leading-tight">
                {metaDescription ||
                  (activeEdition === "ur" ? summaryUr : summaryEn) ||
                  "Read latest updates, breaking news, detailed analysis, and verified reporting from Daily Afadiat newsroom."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
