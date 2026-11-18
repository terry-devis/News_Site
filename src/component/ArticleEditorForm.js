"use client";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Upload,
  Image as ImageIcon,
  CheckCircle,
  X,
  Bold,
  Italic,
  Heading2,
  Heading3,
  Quote,
  List,
  Link as LinkIcon,
  Eye,
  Edit,
  Save,
  ArrowRight,
} from "lucide-react";

export default function ArticleEditorForm({ initialData = null, isEdit = false }) {
  const router = useRouter();

  const [titleUr, setTitleUr] = useState(initialData?.title_ur || "");
  const [titleEn, setTitleEn] = useState(initialData?.title_en || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [categoryId, setCategoryId] = useState(initialData?.category_id || 1);
  const [summaryUr, setSummaryUr] = useState(initialData?.summary_ur || "");
  const [contentUr, setContentUr] = useState(initialData?.content_ur || "");
  const [coverImage, setCoverImage] = useState(initialData?.cover_image || "");
  const [isBreaking, setIsBreaking] = useState(Boolean(initialData?.is_breaking));
  const [isFeatured, setIsFeatured] = useState(Boolean(initialData?.is_featured));
  const [authorName, setAuthorName] = useState(initialData?.author_name || "ایڈیٹر ڈیلی افادیت");

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadNotice, setUploadNotice] = useState(null);
  const [activeTab, setActiveTab] = useState("editor"); // 'editor' or 'preview'
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const textareaRef = useRef(null);

  // Auto-generate slug when title changes (if not editing an existing slug)
  const handleTitleChange = (val) => {
    setTitleUr(val);
    if (!isEdit && !slug) {
      const generated = "news-" + Math.floor(Math.random() * 100000);
      setSlug(generated);
    }
  };

  // Image upload to Cloudflare R2
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
          text: `تصویر کامیابی کے ساتھ ${data.storage === "cloudflare_r2" ? "Cloudflare R2" : "سٹوریج"} پر اپلوڈ ہو گئی۔`,
        });
      } else {
        setUploadNotice({ type: "error", text: data.error || "اپلوڈ میں خرابی ہوئی" });
      }
    } catch (err) {
      setUploadNotice({ type: "error", text: "نیٹ ورک خرابی، براہ کرم دوبارہ کوشش کریں" });
    } finally {
      setUploadingImage(false);
    }
  };

  // Format insertion in content editor
  const insertFormatting = (prefix, suffix = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);

    const replacement = `${prefix}${selected}${suffix}`;
    const newContent =
      textarea.value.substring(0, start) +
      replacement +
      textarea.value.substring(end);

    setContentUr(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        end + prefix.length
      );
    }, 50);
  };

  const insertImageInBody = async () => {
    const url = prompt("تصویر کا URL درج کریں (یا R2 پر اپلوڈ شدہ لنک):");
    if (url) {
      const imgTag = `\n<figure class="my-4"><img src="${url}" alt="خبر کی تصویر" class="w-full rounded-md shadow-xs object-cover" /><figcaption class="text-xs text-gray-500 mt-1 text-center font-sans">ڈیلی افادیت میڈیا</figcaption></figure>\n`;
      insertFormatting(imgTag);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titleUr.trim() || !contentUr.trim()) {
      setErrorMsg("اردو عنوان اور تفصیلی مضمون کا متن لازمی ہے۔");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    const payload = {
      title_ur: titleUr.trim(),
      title_en: titleEn.trim() || null,
      slug: slug.trim() || `news-${Date.now()}`,
      category_id: Number(categoryId),
      summary_ur: summaryUr.trim() || titleUr.trim().substring(0, 150),
      content_ur: contentUr.trim(),
      cover_image: coverImage || null,
      is_breaking: isBreaking,
      is_featured: isFeatured,
      author_name: authorName.trim() || "ایڈیٹر ڈیلی افادیت",
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
        setErrorMsg(data.error || "مضمون محفوظ کرنے میں خرابی ہوئی۔");
      }
    } catch (err) {
      setErrorMsg("نیٹ ورک خرابی، براہ کرم دوبارہ کوشش کریں۔");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 font-sans">
      {errorMsg && (
        <div className="p-3 bg-red-100 text-red-800 rounded-lg text-xs font-semibold border border-red-300">
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (8 Cols): Titles & Rich Content Editor */}
        <div className="lg:col-span-8 space-y-5">
          
          {/* 1. Urdu Title */}
          <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-xl p-4 shadow-xs">
            <label className="block text-xs font-bold text-gray-800 mb-1.5">
              خبر کا اردو عنوان <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              value={titleUr}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="مثال: پاکستان معیشت میں اہم پیش رفت، برآمدات میں ریکارڈ اضافہ..."
              className="w-full text-base sm:text-lg font-bold p-3 rounded-lg bg-white border border-[#dcd8cd] focus:border-emerald-600 outline-none urdu-headline leading-relaxed"
            />
          </div>

          {/* 2. English Title & Slug */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-xl p-3.5 shadow-xs">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                انگریزی عنوان (English Title - اختیاری)
              </label>
              <input
                type="text"
                value={titleEn}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="English headline for /en edition..."
                className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#dcd8cd] focus:border-emerald-600 outline-none text-left font-sans"
              />
            </div>

            <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-xl p-3.5 shadow-xs">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                یو آر ایل سلگ (URL Slug)
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="news-article-slug"
                className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#dcd8cd] focus:border-emerald-600 outline-none text-left font-mono"
              />
            </div>
          </div>

          {/* 3. Summary / Excerpt */}
          <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-xl p-4 shadow-xs">
            <label className="block text-xs font-bold text-gray-800 mb-1.5">
              مختصر خلاصہ (Excerpt)
            </label>
            <textarea
              rows={2}
              value={summaryUr}
              onChange={(e) => setSummaryUr(e.target.value)}
              placeholder="خبر کا دو تین سطروں کا خلاصہ جو سوشل میڈیا اور ہوم پیج پر کارڈ میں نظر آئے گا..."
              className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#dcd8cd] focus:border-emerald-600 outline-none urdu-body leading-relaxed"
            />
          </div>

          {/* 4. Rich Content Editor */}
          <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-xl p-4 shadow-xs">
            <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-[#dcd8cd]">
              <label className="text-xs font-bold text-gray-800">
                مکمل تفصیلی خبر کا متن <span className="text-red-600">*</span>
              </label>

              {/* Tab Switcher */}
              <div className="flex items-center gap-1 bg-[#dcd8cd]/50 p-0.5 rounded-lg">
                <button
                  type="button"
                  onClick={() => setActiveTab("editor")}
                  className={`text-xs px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition ${
                    activeTab === "editor" ? "bg-white text-emerald-800 shadow-xs" : "text-gray-600"
                  }`}
                >
                  <Edit size={13} />
                  <span>ایڈیٹر</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={`text-xs px-2.5 py-1 rounded-md font-semibold flex items-center gap-1 transition ${
                    activeTab === "preview" ? "bg-white text-emerald-800 shadow-xs" : "text-gray-600"
                  }`}
                >
                  <Eye size={13} />
                  <span>پیش منظر (Preview)</span>
                </button>
              </div>
            </div>

            {activeTab === "editor" ? (
              <div>
                {/* Editor Quick Toolbar */}
                <div className="flex flex-wrap items-center gap-1 mb-2 p-1.5 bg-white border border-[#dcd8cd] rounded-lg">
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
                    onClick={() => insertFormatting("<blockquote class='border-r-4 border-emerald-600 pr-3 my-3 italic text-gray-700'>", "</blockquote>")}
                    title="Quote"
                    className="p-1.5 text-gray-700 hover:bg-gray-100 rounded"
                  >
                    <Quote size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => insertFormatting("<p class='mb-4'>", "</p>")}
                    title="Paragraph"
                    className="px-2 py-1 text-gray-700 hover:bg-gray-100 rounded text-xs font-mono"
                  >
                    &lt;p&gt;
                  </button>
                  <button
                    type="button"
                    onClick={insertImageInBody}
                    title="Insert Image"
                    className="p-1.5 text-emerald-700 hover:bg-emerald-50 rounded flex items-center gap-1 text-xs font-semibold"
                  >
                    <ImageIcon size={14} />
                    <span>تصویر شامل کریں</span>
                  </button>
                </div>

                <textarea
                  ref={textareaRef}
                  required
                  rows={14}
                  value={contentUr}
                  onChange={(e) => setContentUr(e.target.value)}
                  placeholder="خبر کا مکمل پیراگراف یہاں لکھیں... (HTML ٹیگز جیسے <p>, <h2>, <strong> مکمل سپورٹڈ ہیں)"
                  className="w-full text-sm sm:text-base p-3.5 rounded-lg bg-white border border-[#dcd8cd] focus:border-emerald-600 outline-none urdu-body leading-loose"
                />
              </div>
            ) : (
              <div className="bg-white border border-[#dcd8cd] rounded-lg p-5 min-h-[350px] overflow-y-auto">
                <h1 className="text-xl sm:text-2xl font-bold urdu-headline text-gray-900 mb-4 pb-2 border-b border-[#dcd8cd]">
                  {titleUr || "عنوان کا پیش منظر"}
                </h1>
                <div
                  className="urdu-body text-gray-800 leading-loose text-base space-y-4"
                  dangerouslySetInnerHTML={{ __html: contentUr || "<p class='text-gray-400'>متن کا پیش منظر یہاں نظر آئے گا...</p>" }}
                />
              </div>
            )}
          </div>

        </div>

        {/* Right Column (4 Cols): Category, Cover Image R2, Options & Publish */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Action Box */}
          <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-xl p-4 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-gray-900 pb-2 border-b border-[#dcd8cd]">
              اشاعت کا عمل
            </h3>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm py-2.5 rounded-lg flex items-center justify-center gap-2 transition shadow-xs disabled:opacity-50"
            >
              <Save size={16} />
              <span>{submitting ? "محفوظ کیا جا رہا ہے..." : isEdit ? "تبدیلیاں محفوظ کریں" : "مضمون شائع کریں"}</span>
            </button>
          </div>

          {/* Category Selector */}
          <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-xl p-4 shadow-xs">
            <label className="block text-xs font-bold text-gray-800 mb-1.5">
              شعبہ منتخب کریں (Category)
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full text-xs font-semibold p-2.5 rounded-lg bg-white border border-[#dcd8cd] focus:border-emerald-600 outline-none"
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

          {/* Cover Image Upload (Cloudflare R2) */}
          <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-xl p-4 shadow-xs space-y-3">
            <label className="block text-xs font-bold text-gray-800">
              سرورق کی تصویر (Cover Image — Cloudflare R2)
            </label>

            {uploadNotice && (
              <div
                className={`p-2 rounded text-xs flex items-center gap-1.5 ${
                  uploadNotice.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                <CheckCircle size={14} className="shrink-0" />
                <span>{uploadNotice.text}</span>
              </div>
            )}

            {coverImage ? (
              <div className="space-y-2">
                <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden border border-[#dcd8cd] bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={coverImage}
                    alt="Cover Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setCoverImage("")}
                    className="absolute top-2 left-2 size-6 rounded-full bg-red-600 text-white grid place-items-center hover:bg-red-700 shadow-sm"
                    title="تصویر ہٹائیں"
                  >
                    <X size={14} />
                  </button>
                </div>
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="تصویر کا براہ راست URL"
                  className="w-full text-[11px] p-2 rounded bg-white border border-[#dcd8cd] font-mono text-left"
                />
              </div>
            ) : (
              <div>
                <label className="border-2 border-dashed border-[#dcd8cd] hover:border-emerald-600 rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer bg-white transition">
                  <Upload size={24} className="text-emerald-700 mb-1" />
                  <span className="text-xs font-bold text-gray-800">
                    {uploadingImage ? "تصویر اپلوڈ ہو رہی ہے..." : "کمپیوٹر سے تصویر منتخب کریں"}
                  </span>
                  <span className="text-[10px] text-gray-500 mt-0.5">
                    Cloudflare R2 پر فوری محفوظ ہو گی
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    disabled={uploadingImage}
                    className="hidden"
                  />
                </label>
                <div className="mt-2 text-center text-[11px] text-gray-400">یا نیچے یو آر ایل درج کریں</div>
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="https://... تصویر کا بیرونی لنک"
                  className="w-full text-xs p-2 rounded mt-1 bg-white border border-[#dcd8cd] font-mono text-left"
                />
              </div>
            )}
          </div>

          {/* Visibility & Ticker Flags */}
          <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-xl p-4 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-gray-800 pb-2 border-b border-[#dcd8cd]">
              خصوصی اشاعت اور بینرز
            </h4>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-800">
              <input
                type="checkbox"
                checked={isBreaking}
                onChange={(e) => setIsBreaking(e.target.checked)}
                className="size-4 rounded accent-red-600"
              />
              <span className="text-red-700 font-bold">بریکنگ نیوز (ریڈ مارکی ٹکر میں دکھائیں)</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-800">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="size-4 rounded accent-emerald-600"
              />
              <span>اہم خبر (صفحۂ اول کے ہیرو سیکشن میں ترجیح دیں)</span>
            </label>

            <div className="pt-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                رپورٹر / ایڈیٹر کا نام
              </label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="w-full text-xs p-2 rounded bg-white border border-[#dcd8cd] outline-none"
              />
            </div>
          </div>

        </div>

      </div>
    </form>
  );
}
