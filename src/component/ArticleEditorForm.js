"use client";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Upload,
  CheckCircle2,
  X,
  Bold,
  Italic,
  Heading2,
  Heading3,
  Quote,
  Eye,
  Edit,
  Save,
  Flame,
  Star,
  Globe,
  FileText,
} from "lucide-react";
import { useAdminLanguage } from "@/context/AdminLanguageContext";

export default function ArticleEditorForm({ initialData = null, isEdit = false }) {
  const router = useRouter();
  const { t, lang, dir } = useAdminLanguage();

  // Extract initial summary and clean content if excerpt tag is present
  const extractExcerpt = (raw) => {
    if (!raw) return { excerpt: "", content: "" };
    const match = raw.match(/<!--excerpt:([\s\S]*?)-->/);
    if (match) {
      return {
        excerpt: match[1].trim(),
        content: raw.replace(/<!--excerpt:[\s\S]*?-->\n?/, "").trim(),
      };
    }
    return { excerpt: "", content: raw };
  };

  const parsedEn = extractExcerpt(initialData?.content_en);

  // Content states
  const [contentLangTab, setContentLangTab] = useState("ur"); // 'ur' or 'en'
  const [titleUr, setTitleUr] = useState(initialData?.title_ur || "");
  const [titleEn, setTitleEn] = useState(initialData?.title_en || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [categoryId, setCategoryId] = useState(initialData?.category_id || 1);
  const [summaryUr, setSummaryUr] = useState(initialData?.summary_ur || "");
  const [summaryEn, setSummaryEn] = useState(initialData?.summary_en || parsedEn.excerpt || "");
  const [contentUr, setContentUr] = useState(initialData?.content_ur || "");
  const [contentEn, setContentEn] = useState(parsedEn.content || initialData?.content_en || "");
  const [coverImage, setCoverImage] = useState(initialData?.cover_image || "");
  const [isBreaking, setIsBreaking] = useState(Boolean(initialData?.is_breaking));
  const [isFeatured, setIsFeatured] = useState(Boolean(initialData?.is_featured));
  const [authorName, setAuthorName] = useState(
    initialData?.author_name || (lang === "ur" ? "ایڈیٹر ڈیلی افادیت" : "Daily Afadiat Editor")
  );

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadNotice, setUploadNotice] = useState(null);
  const [viewMode, setViewMode] = useState("editor"); // 'editor' or 'preview'
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const urduTextareaRef = useRef(null);
  const englishTextareaRef = useRef(null);

  const handleTitleChange = (val) => {
    setTitleUr(val);
    if (!isEdit && !slug) {
      const generated = "news-" + Math.floor(Math.random() * 100000);
      setSlug(generated);
    }
  };

  // Image upload
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setUploadNotice(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setCoverImage(data.url);
        setUploadNotice({
          type: "success",
          text: lang === "ur" ? "تصویر کامیابی کے ساتھ اپلوڈ ہو گئی۔" : "Photo uploaded successfully!",
        });
      } else {
        setUploadNotice({ type: "error", text: data.error || (lang === "ur" ? "تصویر اپلوڈ نہ ہو سکی" : "Upload failed") });
      }
    } catch (err) {
      setUploadNotice({ type: "error", text: lang === "ur" ? "نیٹ ورک میں مسئلہ پیش آیا۔" : "Network error during upload" });
    } finally {
      setUploadingImage(false);
    }
  };

  const insertFormatting = (prefix, suffix = "") => {
    const textarea = contentLangTab === "ur" ? urduTextareaRef.current : englishTextareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);

    const replacement = `${prefix}${selected}${suffix}`;
    const newContent = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);

    if (contentLangTab === "ur") {
      setContentUr(newContent);
    } else {
      setContentEn(newContent);
    }

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, end + prefix.length);
    }, 50);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titleUr.trim() || !contentUr.trim()) {
      setErrorMsg(
        lang === "ur"
          ? "اردو عنوان اور تفصیلی متن لازمی ہیں۔"
          : "Urdu headline and article content are required."
      );
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    // Pack English summary with content_en so it is safely stored in database
    const finalContentEn = contentEn.trim()
      ? (summaryEn.trim() ? `<!--excerpt:${summaryEn.trim()}-->\n${contentEn.trim()}` : contentEn.trim())
      : null;

    const payload = {
      title_ur: titleUr.trim(),
      title_en: titleEn.trim() || null,
      slug: slug.trim() || `news-${Date.now()}`,
      category_id: Number(categoryId),
      summary_ur: summaryUr.trim() || titleUr.trim().substring(0, 150),
      content_ur: contentUr.trim(),
      content_en: finalContentEn,
      cover_image: coverImage || null,
      is_breaking: isBreaking,
      is_featured: isFeatured,
      author_name: authorName.trim() || "Daily Afadiat Editor",
    };

    try {
      const endpoint = isEdit ? `/api/articles/${initialData.id}` : "/api/articles";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        router.push("/admin/posts");
        router.refresh();
      } else {
        setErrorMsg(data.error || "Failed to save article.");
      }
    } catch (err) {
      setErrorMsg("Network error, please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-sans" dir={dir}>
      {errorMsg && (
        <div className="p-3 bg-red-100 text-red-800 rounded-xl text-xs font-semibold border border-red-300">
          {errorMsg}
        </div>
      )}

      {/* Main Grid: 8 Cols Editor / 4 Cols Metadata & Media */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 Cols): Language Tabs & Article Fields */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* Top Language Edition Selector Tabs */}
          <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-2xl p-2.5 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-700 px-2 flex items-center gap-1.5">
                <Globe size={15} className="text-emerald-700" />
                <span>{lang === "ur" ? "ایڈیشن منتخب کریں:" : "Content Edition:"}</span>
              </span>

              {/* Urdu Tab */}
              <button
                type="button"
                onClick={() => setContentLangTab("ur")}
                className={`text-xs px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  contentLangTab === "ur"
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-[#dcd8cd]"
                }`}
              >
                <span>اردو مواد (Urdu)</span>
                {titleUr && <span className="size-1.5 rounded-full bg-emerald-300" />}
              </button>

              {/* English Tab */}
              <button
                type="button"
                onClick={() => setContentLangTab("en")}
                className={`text-xs px-3.5 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition cursor-pointer ${
                  contentLangTab === "en"
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-[#dcd8cd]"
                }`}
              >
                <span>English Edition (انگریزی)</span>
                {titleEn && <span className="size-1.5 rounded-full bg-blue-300" />}
              </button>
            </div>

            {/* View Mode (Editor vs Preview) */}
            <div className="flex items-center gap-1 bg-[#dcd8cd]/50 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode("editor")}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition cursor-pointer ${
                  viewMode === "editor" ? "bg-white text-emerald-800 shadow-xs" : "text-gray-600"
                }`}
              >
                <Edit size={13} />
                <span>{t("tab_editor")}</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("preview")}
                className={`text-xs px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition cursor-pointer ${
                  viewMode === "preview" ? "bg-white text-emerald-800 shadow-xs" : "text-gray-600"
                }`}
              >
                <Eye size={13} />
                <span>{t("tab_preview")}</span>
              </button>
            </div>
          </div>

          {/* ============================================================ */}
          {/* TAB 1: URDU CONTENT FIELDS                                  */}
          {/* ============================================================ */}
          {contentLangTab === "ur" && (
            <div className="space-y-4">
              {/* Urdu Headline */}
              <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-800">
                    {t("field_urdu_title")} <span className="text-red-600">*</span>
                  </label>
                  <span className="text-[11px] text-emerald-700 font-semibold font-sans">اردو پورٹل ایڈیشن</span>
                </div>
                <input
                  type="text"
                  required
                  dir="rtl"
                  value={titleUr}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="خبر کا مکمل اردو عنوان درج کریں..."
                  className="w-full text-base sm:text-lg font-bold p-3 rounded-xl bg-white border border-[#dcd8cd] focus:border-emerald-600 outline-none urdu-headline leading-relaxed text-right"
                />
              </div>

              {/* Urdu Summary / Excerpt */}
              <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-2xl p-4 shadow-xs">
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  {t("field_excerpt")} (اردو خلاصہ)
                </label>
                <textarea
                  rows={2}
                  dir="rtl"
                  value={summaryUr}
                  onChange={(e) => setSummaryUr(e.target.value)}
                  placeholder="خبر کا مختصر ۲ سے ۳ جملوں کا خلاصہ جو کارڈز میں نظر آئے گا..."
                  className="w-full text-xs p-2.5 rounded-xl bg-white border border-[#dcd8cd] focus:border-emerald-600 outline-none urdu-body leading-relaxed text-right"
                />
              </div>

              {/* Urdu Rich Content Editor */}
              <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#dcd8cd]">
                  <label className="text-xs font-bold text-gray-800">
                    {t("field_content")} (اردو تفصیل) <span className="text-red-600">*</span>
                  </label>
                </div>

                {viewMode === "editor" ? (
                  <div>
                    {/* Quick Formatting Toolbar */}
                    <div className="flex flex-wrap items-center gap-1 mb-2 p-1.5 bg-white border border-[#dcd8cd] rounded-lg">
                      <button
                        type="button"
                        onClick={() => insertFormatting("<strong>", "</strong>")}
                        title="جلی (Bold)"
                        className="p-1.5 text-gray-700 hover:bg-gray-100 rounded"
                      >
                        <Bold size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting("<em>", "</em>")}
                        title="ترچھا (Italic)"
                        className="p-1.5 text-gray-700 hover:bg-gray-100 rounded"
                      >
                        <Italic size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting("<h2 class='text-xl font-bold my-3'>", "</h2>")}
                        title="ذیلی سرخی ۲"
                        className="p-1.5 text-gray-700 hover:bg-gray-100 rounded font-bold text-xs"
                      >
                        <Heading2 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting("<h3 class='text-lg font-bold my-2'>", "</h3>")}
                        title="ذیلی سرخی ۳"
                        className="p-1.5 text-gray-700 hover:bg-gray-100 rounded font-bold text-xs"
                      >
                        <Heading3 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting("<blockquote class='border-r-4 border-emerald-600 pr-3 my-3 italic text-gray-700'>", "</blockquote>")}
                        title="اقتباس (Quote)"
                        className="p-1.5 text-gray-700 hover:bg-gray-100 rounded"
                      >
                        <Quote size={14} />
                      </button>
                    </div>

                    <textarea
                      ref={urduTextareaRef}
                      required
                      rows={14}
                      dir="rtl"
                      value={contentUr}
                      onChange={(e) => setContentUr(e.target.value)}
                      placeholder="خبر کا مکمل تفصیلی مواد یہاں تحریر کریں..."
                      className="w-full p-4 rounded-xl bg-white border border-[#dcd8cd] focus:border-emerald-600 outline-none urdu-body leading-loose text-base text-right"
                    />
                  </div>
                ) : (
                  <div className="bg-white border border-[#dcd8cd] rounded-xl p-5 min-h-[350px] overflow-y-auto" dir="rtl">
                    <h1 className="text-xl sm:text-2xl font-bold urdu-headline text-gray-900 mb-4 pb-2 border-b border-[#dcd8cd]">
                      {titleUr || "سرخی کا پیش منظر"}
                    </h1>
                    <div
                      className="urdu-body text-gray-800 leading-loose text-base space-y-4"
                      dangerouslySetInnerHTML={{ __html: contentUr || "<p class='text-gray-400'>تفصیلی خبر کا پیش منظر...</p>" }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* TAB 2: ENGLISH DEDICATED CONTENT FIELDS                      */}
          {/* ============================================================ */}
          {contentLangTab === "en" && (
            <div className="space-y-4">
              {/* English Headline */}
              <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-gray-800">
                    English Headline (انگریزی سرخی)
                  </label>
                  <span className="text-[11px] text-blue-700 font-semibold font-sans">English Edition (/en)</span>
                </div>
                <input
                  type="text"
                  dir="ltr"
                  value={titleEn}
                  onChange={(e) => setTitleEn(e.target.value)}
                  placeholder="Enter full English headline for international & English readers..."
                  className="w-full text-base sm:text-lg font-bold p-3 rounded-xl bg-white border border-[#dcd8cd] focus:border-blue-600 outline-none text-left font-sans"
                />
              </div>

              {/* English Summary / Excerpt */}
              <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-2xl p-4 shadow-xs">
                <label className="block text-xs font-bold text-gray-800 mb-1.5">
                  English Summary / Excerpt (انگریزی خلاصہ)
                </label>
                <textarea
                  rows={2}
                  dir="ltr"
                  value={summaryEn}
                  onChange={(e) => setSummaryEn(e.target.value)}
                  placeholder="Short 2-3 sentence overview that appears on news cards in the English edition..."
                  className="w-full text-xs p-2.5 rounded-xl bg-white border border-[#dcd8cd] focus:border-blue-600 outline-none font-sans leading-relaxed text-left"
                />
              </div>

              {/* English Dedicated Content Editor */}
              <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#dcd8cd]">
                  <label className="text-xs font-bold text-gray-800">
                    English Article Content (مکمل انگریزی خبر)
                  </label>
                  <span className="text-[11px] text-gray-500 font-sans">Appears when reader switches to English</span>
                </div>

                {viewMode === "editor" ? (
                  <div>
                    {/* Quick Formatting Toolbar for English */}
                    <div className="flex flex-wrap items-center gap-1 mb-2 p-1.5 bg-white border border-[#dcd8cd] rounded-lg" dir="ltr">
                      <button
                        type="button"
                        onClick={() => insertFormatting("<strong>", "</strong>")}
                        title="Bold"
                        className="p-1.5 text-gray-700 hover:bg-gray-100 rounded"
                      >
                        <Bold size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting("<em>", "</em>")}
                        title="Italic"
                        className="p-1.5 text-gray-700 hover:bg-gray-100 rounded"
                      >
                        <Italic size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting("<h2 class='text-xl font-bold my-3'>", "</h2>")}
                        title="Heading 2"
                        className="p-1.5 text-gray-700 hover:bg-gray-100 rounded font-bold text-xs"
                      >
                        <Heading2 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting("<h3 class='text-lg font-bold my-2'>", "</h3>")}
                        title="Heading 3"
                        className="p-1.5 text-gray-700 hover:bg-gray-100 rounded font-bold text-xs"
                      >
                        <Heading3 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting("<blockquote class='border-l-4 border-blue-600 pl-3 my-3 italic text-gray-700'>", "</blockquote>")}
                        title="Quote"
                        className="p-1.5 text-gray-700 hover:bg-gray-100 rounded"
                      >
                        <Quote size={14} />
                      </button>
                    </div>

                    <textarea
                      ref={englishTextareaRef}
                      rows={14}
                      dir="ltr"
                      value={contentEn}
                      onChange={(e) => setContentEn(e.target.value)}
                      placeholder="Write or paste full English article body here..."
                      className="w-full p-4 rounded-xl bg-white border border-[#dcd8cd] focus:border-blue-600 outline-none font-sans text-sm leading-relaxed text-left"
                    />
                  </div>
                ) : (
                  <div className="bg-white border border-[#dcd8cd] rounded-xl p-5 min-h-[350px] overflow-y-auto" dir="ltr">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 pb-2 border-b border-[#dcd8cd] font-sans">
                      {titleEn || "English Headline Preview"}
                    </h1>
                    <div
                      className="font-sans text-gray-800 leading-relaxed text-sm space-y-4"
                      dangerouslySetInnerHTML={{ __html: contentEn || "<p class='text-gray-400'>English article body preview...</p>" }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Slug input */}
          <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-2xl p-3.5 shadow-xs">
            <label className="block text-xs font-bold text-gray-700 mb-1">
              {t("field_slug")}
            </label>
            <input
              type="text"
              dir="ltr"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="news-article-slug"
              className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#dcd8cd] focus:border-emerald-600 outline-none text-left font-mono"
            />
          </div>

        </div>

        {/* Right Column (4 Cols): Publish, Category, Cover Image & Ticker Flags */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Action Box */}
          <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-2xl p-4 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-gray-900 pb-2 border-b border-[#dcd8cd]">
              {isEdit ? t("edit_post_title") : t("new_post_title")}
            </h3>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm py-2.5 rounded-xl flex items-center justify-center gap-2 transition shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <Save size={16} />
              <span>{submitting ? (lang === "ur" ? "محفوظ ہو رہا ہے..." : "Saving...") : isEdit ? t("btn_save_changes") : t("btn_publish")}</span>
            </button>
          </div>

          {/* Category Selector */}
          <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-2xl p-4 shadow-xs">
            <label className="block text-xs font-bold text-gray-800 mb-1.5">
              {t("category_label")}
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full text-xs font-semibold p-2.5 rounded-xl bg-white border border-[#dcd8cd] focus:border-emerald-600 outline-none cursor-pointer"
            >
              <option value="1">پاکستان (Pakistan)</option>
              <option value="2">انٹرنیشنل (World)</option>
              <option value="3">کھیل (Sports)</option>
              <option value="4">بزنس (Business)</option>
              <option value="5">سائنس و ٹیکنالوجی (Tech)</option>
              <option value="6">صحت (Health)</option>
              <option value="7">دلچسپ و عجیب (Odd News)</option>
            </select>
          </div>

          {/* Cover Image Upload (User Friendly - No Technical Terms) */}
          <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-2xl p-4 shadow-xs space-y-3">
            <label className="block text-xs font-bold text-gray-800">
              {t("cover_image_label")}
            </label>

            {uploadNotice && (
              <div
                className={`p-2 rounded-lg text-xs flex items-center gap-1.5 ${
                  uploadNotice.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                <CheckCircle2 size={14} className="shrink-0" />
                <span>{uploadNotice.text}</span>
              </div>
            )}

            {coverImage ? (
              <div className="space-y-2">
                <div className="relative w-full aspect-[16/10] rounded-xl overflow-hidden border border-[#dcd8cd] bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverImage}
                    alt="Cover Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setCoverImage("")}
                    className="absolute top-2 left-2 size-6 rounded-full bg-red-600 text-white grid place-items-center hover:bg-red-700 shadow-sm cursor-pointer"
                    title={lang === "ur" ? "تصویر ہٹائیں" : "Remove Photo"}
                  >
                    <X size={14} />
                  </button>
                </div>
                <input
                  type="text"
                  dir="ltr"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://... تصویر کا لنک"
                  className="w-full text-[11px] p-2 rounded-lg bg-white border border-[#dcd8cd] font-sans text-left"
                />
              </div>
            ) : (
              <div>
                <label className="border-2 border-dashed border-[#dcd8cd] hover:border-emerald-600 rounded-xl p-5 flex flex-col items-center justify-center cursor-pointer bg-white transition">
                  <Upload size={24} className="text-emerald-700 mb-1" />
                  <span className="text-xs font-bold text-gray-800 text-center">
                    {uploadingImage ? (lang === "ur" ? "تصویر اپلوڈ ہو رہی ہے..." : "Uploading Photo...") : t("btn_pick_file")}
                  </span>
                  <span className="text-[10px] text-gray-400 mt-0.5">
                    JPG, PNG, WebP
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
                <div className="mt-2 text-center text-[11px] text-gray-400">{t("or_paste_url")}</div>
                <input
                  type="text"
                  dir="ltr"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://... تصویر کا ویب لنک"
                  className="w-full text-xs p-2 rounded-lg mt-1 bg-white border border-[#dcd8cd] font-sans text-left"
                />
              </div>
            )}
          </div>

          {/* Visibility & Ticker Flags */}
          <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-2xl p-4 shadow-xs space-y-3.5">
            <h4 className="text-xs font-bold text-gray-800 pb-2 border-b border-[#dcd8cd]">
              {t("flags_heading")}
            </h4>

            {/* Interactive Breaking News Toggle Switch */}
            <div className="p-2.5 rounded-xl bg-white border border-[#dcd8cd] space-y-1">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-1.5">
                  <Flame size={15} className={isBreaking ? "text-red-600" : "text-gray-400"} />
                  <span className={`text-xs font-bold ${isBreaking ? "text-red-700" : "text-gray-700"}`}>
                    {t("flag_breaking")}
                  </span>
                </div>
                {/* Switch button */}
                <input
                  type="checkbox"
                  checked={isBreaking}
                  onChange={(e) => setIsBreaking(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-600 relative cursor-pointer"></div>
              </label>
              <p className="text-[10px] text-gray-500 font-sans leading-tight">
                {lang === "ur"
                  ? "آن کرنے پر یہ سرخی ویب سائٹ کی اوپری ریڈ بریکنگ نیوز پٹی میں لائیو چلے گی۔"
                  : "When active, this will live-stream in the top red breaking news ticker."}
              </p>
            </div>

            {/* Featured Story Toggle */}
            <div className="p-2.5 rounded-xl bg-white border border-[#dcd8cd] space-y-1">
              <label className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-1.5">
                  <Star size={15} className={isFeatured ? "text-amber-500 fill-amber-500" : "text-gray-400"} />
                  <span className={`text-xs font-bold ${isFeatured ? "text-amber-800" : "text-gray-700"}`}>
                    {t("flag_featured")}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600 relative cursor-pointer"></div>
              </label>
              <p className="text-[10px] text-gray-500 font-sans leading-tight">
                {lang === "ur"
                  ? "ہوم پیج کے مین بینر پر ترجیح دی جائے گی۔"
                  : "Prioritized in homepage hero headline banner."}
              </p>
            </div>

            <div className="pt-1">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {t("field_byline")}
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full text-xs p-2 rounded-lg bg-white border border-[#dcd8cd] outline-none"
              />
            </div>
          </div>

        </div>

      </div>
    </form>
  );
}
