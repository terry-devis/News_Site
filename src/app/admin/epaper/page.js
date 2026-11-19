"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Newspaper,
  PlusCircle,
  Calendar,
  MapPin,
  Upload,
  FileText,
  Download,
  Trash2,
  Edit2,
  ExternalLink,
  CheckCircle2,
  Eye,
  X,
  Layers,
} from "lucide-react";
import { useAdminLanguage } from "@/context/AdminLanguageContext";

export default function AdminEpaperPage() {
  const { lang, t, dir } = useAdminLanguage();
  const isUrdu = lang === "ur";

  const today = new Date().toISOString().split("T")[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedCity, setSelectedCity] = useState("all");

  const [editions, setEditions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState(null);

  const [formData, setFormData] = useState({
    edition_date: today,
    city_slug: "islamabad",
    city_name_ur: "اسلام آباد / راولپنڈی",
    city_name_en: "Islamabad / Rawalpindi",
    page_number: 1,
    page_title_ur: "صفحۂ اول (اہم سرخیاں)",
    page_title_en: "Front Page",
    page_image: "",
    pdf_url: "",
    is_active: true,
  });

  const cities = [
    { slug: "islamabad", name_ur: "اسلام آباد / راولپنڈی", name_en: "Islamabad / Rawalpindi" },
    { slug: "lahore", name_ur: "لاہور ایڈیشن", name_en: "Lahore Edition" },
    { slug: "karachi", name_ur: "کراچی ایڈیشن", name_en: "Karachi Edition" },
    { slug: "quetta", name_ur: "کوئٹہ ایڈیشن", name_en: "Quetta Edition" },
    { slug: "international", name_ur: "انٹرنیشنل ایڈیشن", name_en: "International Edition" },
  ];

  async function loadEditions() {
    setLoading(true);
    try {
      let url = "/api/epaper";
      const params = new URLSearchParams();
      if (selectedDate) params.append("date", selectedDate);
      if (selectedCity && selectedCity !== "all") params.append("city", selectedCity);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      setEditions(data.editions || []);
    } catch (e) {
      console.error("Load epaper error:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEditions();
  }, [selectedDate, selectedCity]);

  const showNotice = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const openNewModal = () => {
    setEditingItem(null);
    const nextPage = editions.length > 0 ? Math.max(...editions.map((e) => Number(e.page_number) || 1)) + 1 : 1;
    setFormData({
      edition_date: selectedDate || today,
      city_slug: selectedCity !== "all" ? selectedCity : "islamabad",
      city_name_ur: "اسلام آباد / راولپنڈی",
      city_name_en: "Islamabad / Rawalpindi",
      page_number: nextPage,
      page_title_ur: `صفحہ نمبر ${nextPage}`,
      page_title_en: `Page ${nextPage}`,
      page_image: "",
      pdf_url: "",
      is_active: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      edition_date: item.edition_date,
      city_slug: item.city_slug,
      city_name_ur: item.city_name_ur,
      city_name_en: item.city_name_en,
      page_number: item.page_number,
      page_title_ur: item.page_title_ur,
      page_title_en: item.page_title_en || "",
      page_image: item.page_image,
      pdf_url: item.pdf_url || "",
      is_active: Boolean(item.is_active),
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
        setFormData((prev) => ({ ...prev, page_image: data.url }));
        showNotice(isUrdu ? "اخبار کے صفحے کی تصویر اپلوڈ ہو گئی" : "Page scan uploaded successfully");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const selectedCityObj = cities.find((c) => c.slug === formData.city_slug) || cities[0];
      const payload = {
        ...formData,
        city_name_ur: selectedCityObj.name_ur,
        city_name_en: selectedCityObj.name_en,
        page_number: Number(formData.page_number) || 1,
      };

      const url = editingItem ? `/api/epaper/${editingItem.id}` : "/api/epaper";
      const method = editingItem ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showNotice(isUrdu ? "ای پیپر صفحہ محفوظ ہو گیا!" : "ePaper page edition saved!");
        setModalOpen(false);
        loadEditions();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save ePaper page");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm(isUrdu ? "کیا آپ واقعی اس صفحے کو حذف کرنا چاہتے ہیں؟" : "Are you sure you want to delete this page?")) {
      return;
    }

    try {
      const res = await fetch(`/api/epaper/${id}`, { method: "DELETE" });
      if (res.ok) {
        showNotice(isUrdu ? "صفحہ حذف کر دیا گیا" : "Page deleted");
        loadEditions();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6" dir={dir}>
      
      {/* Top Banner & Control */}
      <div className="bg-white border border-[#dcd8cd] rounded-none p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider mb-1">
            <Newspaper size={15} />
            <span>{isUrdu ? "ڈیجیٹل پرنٹ ایڈیشن" : "DIGITAL BROADSHEET CMS"}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-950 urdu-headline">
            {isUrdu ? "روزنامہ افادیت ای پیپر مینیجر" : "Daily Afadiat Digital ePaper Controller"}
          </h1>
          <p className="text-xs text-gray-600 mt-1">
            {isUrdu
              ? "روزانہ کے پرنٹ ایڈیشنز، تمام شہروں کے صفحات اور مکمل پی ڈی ایف آرکائیو کو یہاں سے کنٹرول کریں۔"
              : "Manage daily print editions, city page scans, zoomable broadsheets, and downloadable full-issue PDFs."}
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/epaper"
            target="_blank"
            className="inline-flex items-center gap-1.5 border border-[#dcd8cd] bg-[#f7f6f3] text-gray-800 hover:text-emerald-700 font-bold text-xs px-3.5 py-2.5 rounded-none transition"
          >
            <ExternalLink size={13} />
            <span>{isUrdu ? "لائیو ای پیپر دیکھیں" : "View Live /epaper"}</span>
          </Link>

          <button
            onClick={openNewModal}
            className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2.5 rounded-none shadow-xs transition cursor-pointer"
          >
            <PlusCircle size={15} />
            <span>{isUrdu ? "نیا صفحہ شامل کریں" : "Add New Page Scan"}</span>
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

      {/* Filter Strip: Date + City */}
      <div className="bg-white border border-[#dcd8cd] rounded-none p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs font-sans">
        
        {/* Date Filter */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-700 flex items-center gap-1">
            <Calendar size={14} className="text-[#0d3822]" />
            <span>{isUrdu ? "تاریخ منتخب کریں:" : "Edition Date:"}</span>
          </span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border border-[#dcd8cd] rounded-none px-2.5 py-1.5 bg-white text-gray-900 font-mono font-semibold"
          />
        </div>

        {/* City Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setSelectedCity("all")}
            className={`px-3 py-1.5 rounded-none font-bold transition border ${
              selectedCity === "all"
                ? "bg-[#0d3822] text-white border-[#0d3822]"
                : "bg-white text-gray-700 border-[#dcd8cd] hover:bg-gray-100"
            }`}
          >
            {isUrdu ? "تمام شہر" : "All Cities"}
          </button>
          {cities.map((c) => (
            <button
              key={c.slug}
              onClick={() => setSelectedCity(c.slug)}
              className={`px-3 py-1.5 rounded-none font-bold transition border whitespace-nowrap ${
                selectedCity === c.slug
                  ? "bg-[#0d3822] text-white border-[#0d3822]"
                  : "bg-white text-gray-700 border-[#dcd8cd] hover:bg-gray-100"
              }`}
            >
              {isUrdu ? c.name_ur.split(" ")[0] : c.name_en.split(" ")[0]}
            </button>
          ))}
        </div>

      </div>

      {/* Pages Grid */}
      {loading ? (
        <div className="p-12 text-center text-sm text-gray-500 font-sans">
          {isUrdu ? "ای پیپر صفحات لوڈ ہو رہے ہیں..." : "Loading ePaper editions..."}
        </div>
      ) : editions.length === 0 ? (
        <div className="p-12 text-center text-sm text-gray-500 bg-white border border-[#dcd8cd] rounded-none space-y-3">
          <p>{isUrdu ? "منتخب تاریخ کے لیے کوئی صفحہ شامل نہیں کیا گیا۔" : "No ePaper pages found for selected date & city."}</p>
          <button
            onClick={openNewModal}
            className="inline-flex items-center gap-1.5 bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-none"
          >
            <PlusCircle size={14} />
            <span>{isUrdu ? "اس تاریخ کے لیے پہلا صفحہ شامل کریں" : "Add First Page for this date"}</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {editions.map((ed) => (
            <div
              key={ed.id}
              className="bg-white border border-[#dcd8cd] rounded-none overflow-hidden shadow-2xs flex flex-col justify-between hover:border-emerald-700 transition group"
            >
              {/* Header Ribbon */}
              <div className="bg-[#0d3822] text-white px-3 py-2 flex items-center justify-between text-xs font-sans">
                <span className="font-bold">
                  {isUrdu ? `صفحہ ${ed.page_number}` : `Page ${ed.page_number}`}
                </span>
                <span className="text-[10px] text-emerald-200">
                  {ed.city_name_ur || ed.city_slug}
                </span>
              </div>

              {/* Page Scan Preview */}
              <div className="relative aspect-[3/4] w-full bg-gray-100 border-b border-[#eceae3]">
                {ed.page_image ? (
                  <Image
                    src={ed.page_image}
                    alt={ed.page_title_ur || "ePaper Page"}
                    fill
                    className="object-cover group-hover:scale-102 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-gray-400 space-y-2">
                    <FileText size={32} />
                    <span className="text-xs">No scan image uploaded</span>
                  </div>
                )}
              </div>

              {/* Title & Info */}
              <div className="p-3 space-y-1 text-xs">
                <h3 className="font-bold text-gray-950 urdu-headline line-clamp-1">
                  {ed.page_title_ur}
                </h3>
                <div className="text-[11px] text-gray-500 font-sans flex items-center justify-between">
                  <span>{ed.edition_date}</span>
                  {ed.pdf_url && (
                    <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                      <Download size={11} />
                      <span>PDF</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-2.5 bg-[#f7f6f3] border-t border-[#dcd8cd] flex items-center justify-between">
                <span className="text-[10px] font-mono text-gray-400">ID: #{ed.id}</span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => openEditModal(ed)}
                    className="p-1.5 text-gray-600 hover:text-emerald-700 hover:bg-white rounded-none border border-transparent hover:border-[#dcd8cd]"
                    title="Edit"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(ed.id)}
                    className="p-1.5 text-gray-400 hover:text-red-700 hover:bg-white rounded-none border border-transparent hover:border-red-200"
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Page Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#dcd8cd] rounded-none max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-[#eceae3] pb-3">
              <h2 className="text-lg font-bold text-gray-950 urdu-headline flex items-center gap-2">
                <Newspaper size={18} className="text-emerald-700" />
                <span>{editingItem ? (isUrdu ? "صفحے میں ترمیم کریں" : "Edit ePaper Page") : (isUrdu ? "نیا ای پیپر صفحہ شامل کریں" : "Add ePaper Page Scan")}</span>
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-700 p-1">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-sans">
              
              {/* Date & City Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">
                    {isUrdu ? "ایڈیشن تاریخ" : "Edition Date"} *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.edition_date}
                    onChange={(e) => setFormData({ ...formData, edition_date: e.target.value })}
                    className="w-full border border-[#dcd8cd] rounded-none p-2.5 text-xs outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">
                    {isUrdu ? "ایڈیشن شہر" : "City Edition"} *
                  </label>
                  <select
                    value={formData.city_slug}
                    onChange={(e) => setFormData({ ...formData, city_slug: e.target.value })}
                    className="w-full border border-[#dcd8cd] rounded-none p-2.5 text-xs outline-none bg-white font-sans"
                  >
                    {cities.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {isUrdu ? c.name_ur : c.name_en}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Page Number & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">
                    {isUrdu ? "صفحہ نمبر" : "Page Number"} (1, 2...)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="32"
                    required
                    value={formData.page_number}
                    onChange={(e) => setFormData({ ...formData, page_number: e.target.value })}
                    className="w-full border border-[#dcd8cd] rounded-none p-2.5 text-xs outline-none font-mono font-bold"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-800 mb-1">
                    {isUrdu ? "صفحے کا عنوان (اردو)" : "Page Title (Urdu)"} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.page_title_ur}
                    onChange={(e) => setFormData({ ...formData, page_title_ur: e.target.value })}
                    placeholder="مثال: صفحۂ اول (اہم سرخیاں)"
                    className="w-full border border-[#dcd8cd] rounded-none p-2.5 text-xs text-right font-urdu outline-none focus:border-emerald-700"
                  />
                </div>
              </div>

              {/* Page Image Scan */}
              <div className="space-y-2">
                <label className="block font-bold text-gray-800">
                  {isUrdu ? "صفحے کی تصویر / براڈ شیٹ اسکین" : "Newspaper Page Image Scan"} *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={formData.page_image}
                    onChange={(e) => setFormData({ ...formData, page_image: e.target.value })}
                    placeholder="تصویر کا URL یا نیچے سے فائل اپلوڈ کریں..."
                    className="flex-1 border border-[#dcd8cd] rounded-none p-2.5 text-xs outline-none font-sans"
                  />
                  <label className="bg-[#f7f6f3] border border-[#dcd8cd] hover:bg-gray-100 px-3 py-2.5 rounded-none font-bold text-xs cursor-pointer flex items-center gap-1.5 shrink-0">
                    <Upload size={14} />
                    <span>{uploading ? (isUrdu ? "اپلوڈ..." : "Uploading...") : (isUrdu ? "فائل منتخب کریں" : "Choose File")}</span>
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                  </label>
                </div>
                {formData.page_image && (
                  <div className="relative aspect-[3/4] w-24 border border-[#dcd8cd] rounded-none overflow-hidden mt-1">
                    <Image src={formData.page_image} alt="Page Preview" fill className="object-cover" />
                  </div>
                )}
              </div>

              {/* Full PDF URL */}
              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  {isUrdu ? "مکمل ایڈیشن PDF لنک (اختیاری)" : "Full Issue PDF Download URL (Optional)"}
                </label>
                <input
                  type="text"
                  value={formData.pdf_url}
                  onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
                  placeholder="https://... روزنامہ کا مکمل PDF ایڈیشن"
                  className="w-full border border-[#dcd8cd] rounded-none p-2.5 text-xs outline-none font-mono"
                />
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
                  {saving ? (isUrdu ? "محفوظ ہو رہا ہے..." : "Saving...") : (isUrdu ? "صفحہ شائع کریں" : "Publish Page")}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
