"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  PlusCircle,
  Search,
  Edit3,
  Trash2,
  ExternalLink,
  Flame,
  Star,
  CheckCircle2,
  Camera,
  Image as ImageIcon,
  Upload,
  X,
  Check,
  Sparkles,
} from "lucide-react";
import { useAdminLanguage } from "@/context/AdminLanguageContext";
import { MOCK_NEWS_IMAGES } from "@/lib/mockImages";

export default function PostsAdmin() {
  const { t, lang } = useAdminLanguage();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [toastNotice, setToastNotice] = useState("");

  // Quick Cover Photo Replacer Modal State
  const [imageModalArt, setImageModalArt] = useState(null);
  const [modalImageUrl, setModalImageUrl] = useState("");
  const [modalUploading, setModalUploading] = useState(false);
  const [modalSaving, setModalSaving] = useState(false);

  const openImageModal = (art) => {
    setImageModalArt(art);
    setModalImageUrl(art.cover_image || "");
  };

  const closeImageModal = () => {
    setImageModalArt(null);
    setModalImageUrl("");
    setModalUploading(false);
    setModalSaving(false);
  };

  const handleModalFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setModalUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setModalImageUrl(data.url);
      } else {
        alert(data.error || (lang === "ur" ? "تصویر اپلوڈ نہ ہو سکی" : "Upload failed"));
      }
    } catch (err) {
      alert(lang === "ur" ? "نیٹ ورک میں خرابی پیش آئی" : "Network error during upload");
    } finally {
      setModalUploading(false);
    }
  };

  const handleSaveModalImage = async () => {
    if (!imageModalArt) return;
    setModalSaving(true);
    const newImage = modalImageUrl.trim() || null;

    try {
      const res = await fetch(`/api/articles/${imageModalArt.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cover_image: newImage,
          title_ur: imageModalArt.title_ur,
          title_en: imageModalArt.title_en,
        }),
      });

      if (res.ok) {
        setArticles((prev) =>
          prev.map((a) => (a.id === imageModalArt.id ? { ...a, cover_image: newImage } : a))
        );
        setToastNotice(
          lang === "ur"
            ? `✓ مضمون #${imageModalArt.id} کی کور تصویر کامیابی کے ساتھ تبدیل کر دی گئی!`
            : `✓ Cover photo for article #${imageModalArt.id} updated successfully!`
        );
        setTimeout(() => setToastNotice(""), 4500);
        closeImageModal();
      } else {
        alert("Failed to update article image");
      }
    } catch (err) {
      alert("Error saving cover photo");
    } finally {
      setModalSaving(false);
    }
  };

  async function loadArticles() {
    setLoading(true);
    try {
      const res = await fetch("/api/articles?limit=100");
      const data = await res.json();
      setArticles(data.articles || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadArticles();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm(t("confirm_delete_post"))) return;
    try {
      const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
      if (res.ok) {
        setArticles(articles.filter((a) => a.id !== id));
      }
    } catch (e) {
      alert("Failed to delete article");
    }
  };

  const handleToggleBreaking = async (art) => {
    try {
      const nextState = !art.is_breaking;
      setArticles(articles.map((a) => (a.id === art.id ? { ...a, is_breaking: nextState } : a)));

      const res = await fetch(`/api/articles/${art.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_breaking: nextState, title_ur: art.title_ur, title_en: art.title_en }),
      });

      if (res.ok) {
        setToastNotice(
          nextState
            ? (lang === "ur" ? `✓ "${(art.title_ur || '').substring(0, 35)}..." بریکنگ نیوز ریڈ پٹی میں فعال ہو گئی!` : `✓ "${(art.title_en || art.title_ur || '').substring(0, 35)}..." is now LIVE on breaking ticker!`)
            : (lang === "ur" ? "✓ بریکنگ نیوز ریڈ پٹی سے ہٹا دی گئی۔" : "✓ Removed from breaking ticker.")
        );
        setTimeout(() => setToastNotice(""), 4500);
      } else {
        setArticles(articles.map((a) => (a.id === art.id ? { ...a, is_breaking: !nextState } : a)));
        alert("Failed to update breaking news status");
      }
    } catch (e) {
      alert("Error toggling breaking status");
    }
  };

  const filtered = articles.filter((a) => {
    const matchSearch =
      a.title_ur.toLowerCase().includes(search.toLowerCase()) ||
      (a.title_en && a.title_en.toLowerCase().includes(search.toLowerCase()));
    const matchCat =
      categoryFilter === "all" ||
      (a.categories && a.categories.slug === categoryFilter);
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {t("posts_list_title")}
          </h1>
          <p className="text-xs text-gray-600 mt-0.5">
            {t("total_published_count")}: <strong className="font-sans text-gray-900">{articles.length}</strong>
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition shrink-0 shadow-xs"
        >
          <PlusCircle size={16} />
          <span>{t("nav_new_post")}</span>
        </Link>
      </div>

      {toastNotice && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center gap-2 shadow-xs">
          <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
          <span>{toastNotice}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 bg-white border border-[#dcd8cd] rounded-lg px-3 py-1.5 w-full sm:w-80 shadow-inner">
          <Search size={15} className="text-gray-400" />
          <input
            type="text"
            placeholder={t("search_posts_placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs outline-none bg-transparent"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-semibold text-gray-600 shrink-0">{t("filter_department")}</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-white border border-[#dcd8cd] rounded-lg px-3 py-1.5 outline-none font-sans"
          >
            <option value="all">{t("all_departments")}</option>
            <option value="pakistan">پاکستان (Pakistan)</option>
            <option value="world">انٹرنیشنل (World)</option>
            <option value="sports">کھیل (Sports)</option>
            <option value="business">بزنس (Business)</option>
            <option value="tech">سائنس و ٹیکنالوجی (Tech)</option>
            <option value="health">صحت (Health)</option>
            <option value="weird">دلچسپ و عجیب (Odd News)</option>
          </select>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-xs text-gray-500">Loading articles...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500">{t("no_posts_found")}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-[#dcd8cd]/50 text-gray-700 font-bold border-b border-[#dcd8cd]">
                <tr>
                  <th className="p-3 w-16 text-center">{t("col_photo")}</th>
                  <th className="p-3 text-start">{t("col_title")}</th>
                  <th className="p-3 text-start">{t("col_category")}</th>
                  <th className="p-3 text-start">{t("col_author")}</th>
                  <th className="p-3 text-start">{t("col_badge")}</th>
                  <th className="p-3 text-start">{t("col_date")}</th>
                  <th className="p-3 text-center">{t("col_actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dcd8cd]">
                {filtered.map((art) => (
                  <tr key={art.id} className="hover:bg-white/60 transition">
                    <td className="p-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => openImageModal(art)}
                        className="relative size-12 rounded-lg overflow-hidden bg-gray-200 mx-auto group block cursor-pointer border border-[#dcd8cd] shadow-xs"
                        title={lang === "ur" ? "تصویر تبدیل کریں (کلک کریں)" : "Click to Replace Cover Photo"}
                      >
                        <Image
                          src={art.cover_image || "/logo-light.webp"}
                          alt={art.title_ur}
                          fill
                          className="object-cover group-hover:scale-110 transition duration-300"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[9px] font-bold transition duration-200">
                          <Camera size={13} className="text-emerald-400" />
                          <span>{lang === "ur" ? "تبدیل" : "Change"}</span>
                        </div>
                      </button>
                    </td>
                    <td className="p-3 font-semibold text-gray-900 max-w-md">
                      <Link href={`/admin/posts/${art.id}`} className="hover:text-emerald-700 line-clamp-2 leading-relaxed">
                        {lang === "en" && art.title_en ? art.title_en : art.title_ur}
                      </Link>
                      {art.title_en && lang === "ur" && (
                        <span className="block text-[11px] text-gray-400 font-sans mt-0.5 line-clamp-1">
                          {art.title_en}
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-medium text-emerald-800">
                      {lang === "en" ? art.categories?.name_en || art.categories?.name_ur : art.categories?.name_ur || "—"}
                    </td>
                    <td className="p-3 text-gray-600">{art.author_name}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {/* Interactive Breaking News Toggle Switch Button */}
                        <button
                          type="button"
                          onClick={() => handleToggleBreaking(art)}
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1 transition cursor-pointer border ${
                            art.is_breaking
                              ? "bg-red-600 text-white border-red-700 shadow-2xs"
                              : "bg-white text-gray-500 border-gray-300 hover:border-red-400 hover:text-red-600"
                          }`}
                          title={lang === "ur" ? "بریکنگ نیوز آن یا آف کریں" : "Click to toggle Breaking News ticker"}
                        >
                          <Flame size={10} className={art.is_breaking ? "text-yellow-300 animate-pulse" : "text-gray-400"} />
                          <span>{art.is_breaking ? (lang === "ur" ? "بریکنگ آن" : "Breaking ON") : (lang === "ur" ? "بریکنگ لگائیں" : "Set Breaking")}</span>
                        </button>

                        {art.is_featured && (
                          <span className="inline-flex items-center gap-0.5 bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[10px] font-bold border border-amber-200">
                            <Star size={10} /> {lang === "ur" ? "اہم خبر" : "Featured"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-gray-500 font-sans whitespace-nowrap">
                      {new Date(art.created_at).toLocaleDateString(lang === "ur" ? "ur-PK" : "en-US")}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => openImageModal(art)}
                          className="p-1 text-gray-500 hover:text-emerald-700 transition cursor-pointer"
                          title={lang === "ur" ? "تصویر تبدیل کریں" : "Change Cover Photo"}
                        >
                          <ImageIcon size={15} />
                        </button>
                        <Link
                          href={`/story/${art.id || art.slug}`}
                          target="_blank"
                          className="p-1 text-gray-400 hover:text-emerald-700"
                          title="View Live"
                        >
                          <ExternalLink size={15} />
                        </Link>
                        <Link
                          href={`/admin/posts/${art.id}`}
                          className="p-1 text-gray-600 hover:text-blue-600"
                          title="Edit"
                        >
                          <Edit3 size={15} />
                        </Link>
                        <button
                          onClick={() => handleDelete(art.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* QUICK COVER PHOTO REPLACER MODAL */}
      {imageModalArt && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#dcd8cd]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
                  <Camera size={18} />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900 urdu-headline">
                    {lang === "ur" ? "مضمون کی کور تصویر تبدیل کریں" : "Replace Article Cover Photo"}
                  </h3>
                  <p className="text-[11px] text-gray-500 font-sans">
                    ID #{imageModalArt.id} • {lang === "en" && imageModalArt.title_en ? imageModalArt.title_en : imageModalArt.title_ur}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={closeImageModal}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-[#dcd8cd]/50 cursor-pointer transition"
              >
                <X size={18} />
              </button>
            </div>

            {/* Current vs New Preview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white p-3.5 rounded-xl border border-[#dcd8cd]">
              <div>
                <span className="text-[11px] font-bold text-gray-500 block mb-1">
                  {lang === "ur" ? "موجودہ تصویر:" : "Current Photo:"}
                </span>
                <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden border border-[#dcd8cd] bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageModalArt.cover_image || "/logo-light.webp"}
                    alt="Current"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-emerald-700 block mb-1">
                  {lang === "ur" ? "نئی منتخب کردہ تصویر کا پیش منظر:" : "New Selected Photo Preview:"}
                </span>
                <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden border-2 border-dashed border-emerald-500 bg-emerald-50/30 flex items-center justify-center">
                  {modalImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={modalImageUrl}
                      alt="New Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xs text-gray-400 text-center px-2">
                      {lang === "ur" ? "کوئی تصویر منتخب نہیں ہے" : "No photo selected"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Option 1: File Upload */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <Upload size={14} className="text-emerald-700" />
                <span>{lang === "ur" ? "اختیار 1: کمپیوٹر یا موبائل سے نئی تصویر اپلوڈ کریں" : "Option 1: Upload from Device"}</span>
              </span>
              <label className="border-2 border-dashed border-[#dcd8cd] hover:border-emerald-600 rounded-xl p-3 sm:p-4 flex flex-col items-center justify-center cursor-pointer bg-white transition group">
                <Upload size={20} className="text-emerald-700 mb-1 group-hover:scale-110 transition" />
                <span className="text-xs font-bold text-gray-800 text-center">
                  {modalUploading ? (lang === "ur" ? "تصویر اپلوڈ ہو رہی ہے..." : "Uploading...") : (lang === "ur" ? "تصویر منتخب کریں (JPG, PNG, WebP)" : "Choose File to Upload")}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleModalFileUpload}
                  disabled={modalUploading}
                  className="hidden"
                />
              </label>
            </div>

            {/* Option 2: Direct URL */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <ImageIcon size={14} className="text-emerald-700" />
                <span>{lang === "ur" ? "اختیار 2: تصویر کا براہ راست ویب لنک (URL) درج کریں" : "Option 2: Direct Image URL"}</span>
              </span>
              <input
                type="text"
                dir="ltr"
                value={modalImageUrl}
                onChange={(e) => setModalImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full text-xs p-2.5 rounded-xl bg-white border border-[#dcd8cd] font-sans text-left outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            {/* Option 3: Curated Mock Presets */}
            <div className="space-y-2 pt-2 border-t border-[#dcd8cd]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-600" />
                  <span>{lang === "ur" ? "اختیار 3: تیار شدہ ماک تصاویر کے ذخیرے سے 1-کلک میں تبدیل کریں" : "Option 3: Curated Mock News Presets (1-Click)"}</span>
                </span>
                <span className="text-[10px] text-gray-500 font-sans">{MOCK_NEWS_IMAGES.length} Presets</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {MOCK_NEWS_IMAGES.map((preset) => {
                  const isSelected = modalImageUrl === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => setModalImageUrl(preset.url)}
                      className={`relative rounded-xl overflow-hidden border p-1.5 text-left flex flex-col gap-1 transition cursor-pointer ${
                        isSelected
                          ? "bg-emerald-100/70 border-emerald-600 ring-2 ring-emerald-600 shadow-xs"
                          : "bg-white border-[#dcd8cd] hover:border-emerald-500 hover:shadow-xs"
                      }`}
                    >
                      <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden bg-gray-100">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={preset.url}
                          alt={preset.title_en}
                          className="w-full h-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute top-1 right-1 size-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                            <Check size={12} strokeWidth={3} />
                          </div>
                        )}
                      </div>
                      <div className="px-0.5">
                        <span className="text-[10px] font-bold text-gray-900 block truncate leading-tight">
                          {lang === "en" ? preset.title_en : preset.title_ur}
                        </span>
                        <span className="text-[9px] text-emerald-700 font-sans uppercase font-semibold">
                          {preset.category}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#dcd8cd]">
              <button
                type="button"
                onClick={closeImageModal}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-[#dcd8cd]/50 border border-[#dcd8cd] cursor-pointer transition"
              >
                {lang === "ur" ? "منسوخ کریں" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleSaveModalImage}
                disabled={modalSaving || modalUploading}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition"
              >
                {modalSaving ? (
                  <span>{lang === "ur" ? "محفوظ ہو رہا ہے..." : "Saving..."}</span>
                ) : (
                  <>
                    <CheckCircle2 size={14} />
                    <span>{lang === "ur" ? "تصویر محفوظ کریں اور لائیو کریں" : "Save & Update Photo"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
