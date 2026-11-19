"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Video,
  PlusCircle,
  Search,
  Trash2,
  Edit2,
  ExternalLink,
  CheckCircle2,
  Upload,
  Play,
  Flame,
  Clock,
  Eye,
  X,
  AlertCircle,
} from "lucide-react";
import { useAdminLanguage } from "@/context/AdminLanguageContext";

export default function AdminVideosPage() {
  const { lang, t, dir } = useAdminLanguage();
  const isUrdu = lang === "ur";

  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");

  // Form Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState(null);

  const [formData, setFormData] = useState({
    title_ur: "",
    title_en: "",
    summary_ur: "",
    summary_en: "",
    category: "special",
    video_url: "",
    duration: "15:00",
    views_count: "10K",
    cover_image: "",
    author_name: "تحقیقاتی ڈیسک",
    is_featured: false,
  });

  const categories = [
    { key: "special", name_ur: "خصوصی رپورٹس (Special)", name_en: "Special Reports" },
    { key: "bulletin", name_ur: "نیوز بلیٹنز (Bulletins)", name_en: "News Bulletins" },
    { key: "economy", name_ur: "بزنس و معیشت (Economy)", name_en: "Business & Economy" },
    { key: "tech", name_ur: "سائنس و ٹیکنالوجی (Tech)", name_en: "Science & Tech" },
    { key: "sports", name_ur: "کھیل و اسپورٹس (Sports)", name_en: "Sports News" },
    { key: "interviews", name_ur: "خصوصی انٹرویوز (Interviews)", name_en: "Interviews" },
  ];

  async function loadVideos() {
    setLoading(true);
    try {
      const res = await fetch("/api/videos");
      const data = await res.json();
      setVideos(data.videos || []);
    } catch (err) {
      console.error("Load videos error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadVideos();
  }, []);

  const openNewModal = () => {
    setEditingVideo(null);
    setFormData({
      title_ur: "",
      title_en: "",
      summary_ur: "",
      summary_en: "",
      category: "special",
      video_url: "",
      duration: "12:00",
      views_count: "15K",
      cover_image: "",
      author_name: "نیوز ڈیسک",
      is_featured: false,
    });
    setModalOpen(true);
  };

  const openEditModal = (v) => {
    setEditingVideo(v);
    setFormData({
      title_ur: v.title_ur || "",
      title_en: v.title_en || "",
      summary_ur: v.summary_ur || "",
      summary_en: v.summary_en || "",
      category: v.category || "special",
      video_url: v.video_url || "",
      duration: v.duration || "12:00",
      views_count: v.views_count || v.views || "15K",
      cover_image: v.cover_image || v.thumb || "",
      author_name: v.author_name || v.author || "نیوز ڈیسک",
      is_featured: Boolean(v.is_featured),
    });
    setModalOpen(true);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        setFormData((prev) => ({ ...prev, cover_image: data.url }));
        showNotice(isUrdu ? "تصویر کامیابی سے اپلوڈ ہو گئی" : "Thumbnail uploaded successfully");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const showNotice = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title_ur) {
      alert(isUrdu ? "اردو عنوان درج کرنا لازمی ہے۔" : "Urdu title is required.");
      return;
    }

    setSaving(true);
    try {
      const url = editingVideo ? `/api/videos/${editingVideo.id}` : "/api/videos";
      const method = editingVideo ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        showNotice(isUrdu ? "ویڈیو محفوظ ہو گئی اور پورٹل پر لائیو ہے!" : "Video saved and published live!");
        setModalOpen(false);
        loadVideos();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save video");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving video");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(isUrdu ? "کیا آپ واقعی اس ویڈیو کو حذف کرنا چاہتے ہیں؟" : "Are you sure you want to delete this video?")) {
      return;
    }

    try {
      const res = await fetch(`/api/videos/${id}`, { method: "DELETE" });
      if (res.ok) {
        showNotice(isUrdu ? "ویڈیو حذف کر دی گئی" : "Video deleted successfully");
        loadVideos();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = videos.filter((v) => {
    const matchCat = selectedCat === "all" || v.category === selectedCat;
    const matchSearch =
      (v.title_ur || "").toLowerCase().includes(search.toLowerCase()) ||
      (v.title_en || "").toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6" dir={dir}>
      
      {/* Top Banner & Actions */}
      <div className="bg-white border border-[#dcd8cd] rounded-none p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider mb-1">
            <Video size={15} />
            <span>{isUrdu ? "ملٹی میڈیا اور ویڈیو مواد" : "MULTIMEDIA CMS"}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-950 urdu-headline">
            {isUrdu ? "ویڈیوز اور ڈاکومنٹریز مینیجر" : "Video Packages & Documentary Manager"}
          </h1>
          <p className="text-xs text-gray-600 mt-1">
            {isUrdu
              ? "ویڈیو پیکجز شامل کریں، یوٹیوب ایمبیڈ لنکس لگائیں اور لائیو ویڈیو پیج (/video) پر فوری نشر کریں۔"
              : "Manage news videos, YouTube embeds, documentary broadcasts, and live video hub (/video)."}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/video"
            target="_blank"
            className="inline-flex items-center gap-1.5 border border-[#dcd8cd] bg-[#f7f6f3] text-gray-800 hover:text-emerald-700 font-bold text-xs px-3.5 py-2.5 rounded-none transition"
          >
            <ExternalLink size={13} />
            <span>{isUrdu ? "لائیو ویڈیو پیج دیکھیں" : "View /video Page"}</span>
          </Link>

          <button
            onClick={openNewModal}
            className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2.5 rounded-none shadow-xs transition cursor-pointer"
          >
            <PlusCircle size={15} />
            <span>{isUrdu ? "نئی ویڈیو شامل کریں" : "Add New Video"}</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notice && (
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 px-4 py-2.5 rounded-none text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 size={16} className="text-emerald-700" />
          <span>{notice}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#dcd8cd] rounded-none p-3.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Search */}
        <div className="flex items-center gap-2 bg-[#f7f6f3] border border-[#dcd8cd] px-3 py-1.5 rounded-none w-full sm:w-72">
          <Search size={15} className="text-gray-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isUrdu ? "ویڈیو تلاش کریں..." : "Search video titles..."}
            className="w-full text-xs outline-none bg-transparent"
          />
        </div>

        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSelectedCat("all")}
            className={`px-3 py-1.5 rounded-none text-xs font-bold transition border ${
              selectedCat === "all"
                ? "bg-[#0d3822] text-white border-[#0d3822]"
                : "bg-white text-gray-700 border-[#dcd8cd] hover:bg-gray-100"
            }`}
          >
            {isUrdu ? "تمام ویڈیوز" : "All"} ({videos.length})
          </button>
          {categories.map((c) => (
            <button
              key={c.key}
              onClick={() => setSelectedCat(c.key)}
              className={`px-3 py-1.5 rounded-none text-xs font-bold transition border whitespace-nowrap ${
                selectedCat === c.key
                  ? "bg-[#0d3822] text-white border-[#0d3822]"
                  : "bg-white text-gray-700 border-[#dcd8cd] hover:bg-gray-100"
              }`}
            >
              {isUrdu ? c.name_ur.split(" ")[0] : c.name_en}
            </button>
          ))}
        </div>
      </div>

      {/* Video Cards Grid */}
      {loading ? (
        <div className="p-12 text-center text-sm text-gray-500 font-sans">
          {isUrdu ? "ویڈیوز لوڈ ہو رہی ہیں..." : "Loading videos..."}
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-sm text-gray-500 bg-white border border-[#dcd8cd] rounded-none">
          {isUrdu ? "کوئی ویڈیو موجود نہیں ہے۔" : "No videos found."}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((v) => (
            <div
              key={v.id}
              className="bg-white border border-[#dcd8cd] rounded-none overflow-hidden shadow-2xs flex flex-col justify-between hover:border-emerald-700 transition group"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-video w-full bg-black">
                {v.cover_image ? (
                  <Image
                    src={v.cover_image}
                    alt={v.title_ur || "Video"}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900 text-gray-500">
                    <Video size={36} />
                  </div>
                )}

                {/* Duration Badge */}
                {v.duration && (
                  <span className="absolute bottom-2 right-2 bg-black/80 text-white font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-none">
                    {v.duration}
                  </span>
                )}

                {/* Featured Tag */}
                {v.is_featured && (
                  <span className="absolute top-2 left-2 bg-amber-500 text-black font-bold text-[10px] px-2 py-0.5 rounded-none flex items-center gap-1 font-sans">
                    <Flame size={11} />
                    <span>FEATURED</span>
                  </span>
                )}
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-2.5 flex-1">
                <div className="flex items-center justify-between text-[11px] text-gray-500 font-sans">
                  <span className="bg-[#f7f6f3] border border-[#dcd8cd] px-2 py-0.5 font-bold text-[#0d3822] uppercase">
                    {v.category || "special"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Eye size={12} />
                      <span>{v.views_count || "10K"}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      <span>{new Date(v.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                    </span>
                  </div>
                </div>

                <h3 className="font-bold text-sm text-gray-950 urdu-headline leading-snug line-clamp-2">
                  {v.title_ur}
                </h3>

                {v.title_en && (
                  <p className="text-xs text-gray-500 font-sans line-clamp-1">
                    {v.title_en}
                  </p>
                )}

                {v.author_name && (
                  <p className="text-[11px] text-emerald-800 font-bold">
                    {v.author_name}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="px-4 py-2.5 bg-[#f7f6f3] border-t border-[#dcd8cd] flex items-center justify-between">
                <div className="text-[11px] text-gray-500 font-mono">ID: #{v.id}</div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(v)}
                    className="p-1.5 text-gray-700 hover:text-emerald-700 hover:bg-white rounded-none transition border border-transparent hover:border-[#dcd8cd]"
                    title="Edit"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(v.id)}
                    className="p-1.5 text-gray-500 hover:text-red-700 hover:bg-white rounded-none transition border border-transparent hover:border-red-200"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Video Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#dcd8cd] rounded-none max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-[#eceae3] pb-3">
              <h2 className="text-lg font-bold text-gray-950 urdu-headline flex items-center gap-2">
                <Video size={18} className="text-emerald-700" />
                <span>{editingVideo ? (isUrdu ? "ویڈیو میں ترمیم کریں" : "Edit Video") : (isUrdu ? "نئی ویڈیو شامل کریں" : "Add New Video")}</span>
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-sans">
              
              {/* Urdu Title */}
              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  {isUrdu ? "اردو عنوان (لازمی)" : "Urdu Headline (Required)"} *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title_ur}
                  onChange={(e) => setFormData({ ...formData, title_ur: e.target.value })}
                  placeholder="مثال: خصوصی ڈاکومنٹری: پاکستان کی معیشت اور نئے منصوبے..."
                  className="w-full border border-[#dcd8cd] rounded-none p-2.5 text-xs text-right font-urdu outline-none focus:border-emerald-700"
                />
              </div>

              {/* English Title */}
              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  {isUrdu ? "انگریزی عنوان (اختیاری)" : "English Headline (Optional)"}
                </label>
                <input
                  type="text"
                  value={formData.title_en}
                  onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                  placeholder="e.g. Special Documentary: Economic Reforms..."
                  className="w-full border border-[#dcd8cd] rounded-none p-2.5 text-xs outline-none focus:border-emerald-700 font-sans"
                />
              </div>

              {/* Category & Duration & Views Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">
                    {isUrdu ? "زمرہ (Category)" : "Category"}
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full border border-[#dcd8cd] rounded-none p-2.5 text-xs outline-none bg-white font-sans"
                  >
                    {categories.map((c) => (
                      <option key={c.key} value={c.key}>
                        {isUrdu ? c.name_ur : c.name_en}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">
                    {isUrdu ? "دورانیہ (Duration)" : "Duration (e.g. 18:45)"}
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="15:30"
                    className="w-full border border-[#dcd8cd] rounded-none p-2.5 text-xs outline-none font-sans"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">
                    {isUrdu ? "ویوز کاؤنٹر" : "Views Counter (e.g. 45K)"}
                  </label>
                  <input
                    type="text"
                    value={formData.views_count}
                    onChange={(e) => setFormData({ ...formData, views_count: e.target.value })}
                    placeholder="25K"
                    className="w-full border border-[#dcd8cd] rounded-none p-2.5 text-xs outline-none font-sans"
                  />
                </div>
              </div>

              {/* Video URL */}
              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  {isUrdu ? "یوٹیوب لنک یا ویڈیو URL" : "YouTube Video Link or Embed URL"}
                </label>
                <input
                  type="text"
                  value={formData.video_url}
                  onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=... یا https://youtu.be/..."
                  className="w-full border border-[#dcd8cd] rounded-none p-2.5 text-xs outline-none font-mono focus:border-emerald-700"
                />
                <span className="text-[10px] text-gray-500 mt-1 block">
                  {isUrdu
                    ? "آپ عام یوٹیوب ویڈیو کا لنک بھی پیسٹ کر سکتے ہیں، سسٹم خودکار طور پر ایمبیڈ فارمیٹ میں بدل دے گا۔"
                    : "You can paste standard YouTube URLs (watch?v=... or youtu.be/...), they auto-convert to embed."}
                </span>
              </div>

              {/* Thumbnail / Cover Photo */}
              <div className="space-y-2">
                <label className="block font-bold text-gray-800">
                  {isUrdu ? "ویڈیو تھمب نیل / سرورق تصویر" : "Video Thumbnail Image"}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formData.cover_image}
                    onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                    placeholder="https://... تصویر کا لنک پیسٹ کریں یا فائل اپلوڈ کریں"
                    className="flex-1 border border-[#dcd8cd] rounded-none p-2.5 text-xs outline-none font-sans"
                  />
                  <label className="bg-[#f7f6f3] border border-[#dcd8cd] hover:bg-gray-100 px-3 py-2.5 rounded-none font-bold text-xs cursor-pointer flex items-center gap-1.5 shrink-0">
                    <Upload size={14} />
                    <span>{uploading ? (isUrdu ? "اپلوڈ..." : "Uploading...") : (isUrdu ? "فائل منتخب کریں" : "Choose File")}</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
                {formData.cover_image && (
                  <div className="relative aspect-video w-36 border border-[#dcd8cd] rounded-none overflow-hidden mt-1">
                    <Image src={formData.cover_image} alt="Preview" fill className="object-cover" />
                  </div>
                )}
              </div>

              {/* Byline / Reporter */}
              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  {isUrdu ? "رپورٹر / اینکر / ڈیسک کا نام" : "Reporter / Anchor Name"}
                </label>
                <input
                  type="text"
                  value={formData.author_name}
                  onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
                  placeholder="تحقیقاتی ڈیسک"
                  className="w-full border border-[#dcd8cd] rounded-none p-2.5 text-xs outline-none font-sans"
                />
              </div>

              {/* Urdu Summary */}
              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  {isUrdu ? "ویڈیو کا تفصیلی خلاصہ (اردو)" : "Video Summary (Urdu)"}
                </label>
                <textarea
                  rows={3}
                  value={formData.summary_ur}
                  onChange={(e) => setFormData({ ...formData, summary_ur: e.target.value })}
                  placeholder="ویڈیو کی مختصر تفصیل..."
                  className="w-full border border-[#dcd8cd] rounded-none p-2.5 text-xs text-right font-urdu outline-none focus:border-emerald-700"
                />
              </div>

              {/* Featured Priority Checkbox */}
              <div className="flex items-center gap-2 pt-2 border-t border-[#eceae3]">
                <input
                  type="checkbox"
                  id="feat_check"
                  checked={formData.is_featured}
                  onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                  className="size-4 text-emerald-700 accent-emerald-700"
                />
                <label htmlFor="feat_check" className="font-bold text-gray-900 cursor-pointer">
                  {isUrdu
                    ? "نمایاں ہیرو ویڈیو بنائیں (صفحۂ اول کے سب سے بڑے ویڈیو پلیئر میں دکھائیں)"
                    : "Make Featured Hero Video (Highlight on top of /video page)"}
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#eceae3]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-[#dcd8cd] bg-white text-gray-700 font-bold hover:bg-gray-100 rounded-none transition"
                >
                  {isUrdu ? "منسوخ کریں" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-none shadow-xs transition"
                >
                  {saving ? (isUrdu ? "محفوظ ہو رہا ہے..." : "Saving...") : (isUrdu ? "ویڈیو شائع کریں" : "Publish Video")}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
