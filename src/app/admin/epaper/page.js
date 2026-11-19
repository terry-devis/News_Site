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
  Sparkles,
  BookOpen,
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

  // Main Page Modal State
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
    stories: [],
    is_active: true,
  });

  // Story Sub-modal State (for editing actual content on that ePaper page)
  const [storyModalOpen, setStoryModalOpen] = useState(false);
  const [editingStoryIndex, setEditingStoryIndex] = useState(-1);
  const [storyFormData, setStoryFormData] = useState({
    id: "",
    position: "lead",
    headline_ur: "",
    headline_en: "",
    excerpt_ur: "",
    excerpt_en: "",
    content_ur: "",
    content_en: "",
    byline_ur: "خصوصی نامہ نگار",
    byline_en: "Special Correspondent",
    image_url: "",
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
      stories: [],
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
      stories: item.stories || [],
      is_active: Boolean(item.is_active),
    });
    setModalOpen(true);
  };

  const handleFileUpload = async (e, targetField) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        if (targetField === "story_image") {
          setStoryFormData((prev) => ({ ...prev, image_url: data.url }));
        } else {
          setFormData((prev) => ({ ...prev, page_image: data.url }));
        }
        showNotice(isUrdu ? "تصویر اپلوڈ ہو گئی" : "Uploaded successfully");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  // Story management helpers
  const openNewStoryModal = () => {
    setEditingStoryIndex(-1);
    setStoryFormData({
      id: `s-${Date.now()}`,
      position: (formData.stories || []).length === 0 ? "lead" : "secondary_top",
      headline_ur: "",
      headline_en: "",
      excerpt_ur: "",
      excerpt_en: "",
      content_ur: "",
      content_en: "",
      byline_ur: "خصوصی نامہ نگار",
      byline_en: "Special Correspondent",
      image_url: "",
    });
    setStoryModalOpen(true);
  };

  const openEditStoryModal = (index) => {
    setEditingStoryIndex(index);
    const s = formData.stories[index];
    setStoryFormData({ ...s });
    setStoryModalOpen(true);
  };

  const saveStoryToPage = (e) => {
    e.preventDefault();
    if (!storyFormData.headline_ur) {
      alert(isUrdu ? "اردو سرخی درج کرنا لازمی ہے۔" : "Urdu headline is required.");
      return;
    }

    const currentStories = [...(formData.stories || [])];
    if (editingStoryIndex >= 0) {
      currentStories[editingStoryIndex] = { ...storyFormData };
    } else {
      currentStories.push({ ...storyFormData, id: storyFormData.id || `s-${Date.now()}` });
    }

    setFormData((prev) => ({ ...prev, stories: currentStories }));
    setStoryModalOpen(false);
    showNotice(isUrdu ? "مضمون صفحے میں شامل ہو گیا" : "Story saved to page list");
  };

  const deleteStoryFromPage = (index) => {
    if (!confirm(isUrdu ? "کیا آپ واقعی یہ خبر صفحے سے ہٹانا چاہتے ہیں؟" : "Remove this story from page?")) return;
    const currentStories = [...(formData.stories || [])];
    currentStories.splice(index, 1);
    setFormData((prev) => ({ ...prev, stories: currentStories }));
  };

  const handleSavePage = async (e) => {
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
        showNotice(isUrdu ? "ای پیپر صفحہ اور تمام مضامین لائیو محفوظ ہو گئے!" : "ePaper page and all stories published live!");
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
            <span>{isUrdu ? "ڈیجیٹل پرنٹ ایڈیشن و مضامین" : "DIGITAL BROADSHEET & STORIES CMS"}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-950 urdu-headline">
            {isUrdu ? "روزنامہ افادیت ای پیپر و مضامین کنٹرولر" : "Daily Afadiat ePaper & Stories Controller"}
          </h1>
          <p className="text-xs text-gray-600 mt-1">
            {isUrdu
              ? "پرنٹ ایڈیشن کے صفحات، اخباری اسکین، اور صفحے کے اندر موجود تمام اصل خبروں / مضامین (اردو اور انگریزی) کو یہاں سے مکمل ایڈٹ کریں۔"
              : "Manage broadsheet page scans, PDF downloads, and the actual bilingual news stories/articles inside each ePaper page."}
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
            <span>{isUrdu ? "نیا صفحہ شامل کریں" : "Add New Page Edition"}</span>
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

              {/* Title & Stories Counter */}
              <div className="p-3 space-y-1.5 text-xs">
                <h3 className="font-bold text-gray-950 urdu-headline line-clamp-1">
                  {ed.page_title_ur}
                </h3>
                {ed.page_title_en && (
                  <p className="text-[11px] text-gray-500 font-sans line-clamp-1">
                    {ed.page_title_en}
                  </p>
                )}
                
                <div className="flex items-center justify-between pt-1 border-t border-[#eceae3] text-[11px] text-gray-600 font-sans">
                  <span className="bg-[#f7f6f3] border border-[#dcd8cd] px-2 py-0.5 font-bold text-[#0d3822]">
                    {(ed.stories || []).length} {isUrdu ? "مضامین / کلپس" : "Articles / Stories"}
                  </span>
                  <span>{ed.edition_date}</span>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="p-2.5 bg-[#f7f6f3] border-t border-[#dcd8cd] flex items-center justify-between">
                <button
                  onClick={() => openEditModal(ed)}
                  className="inline-flex items-center gap-1 text-xs text-emerald-800 hover:text-emerald-950 font-bold"
                >
                  <Edit2 size={12} />
                  <span>{isUrdu ? "مضامین ایڈٹ کریں" : "Edit Stories"}</span>
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
          ))}
        </div>
      )}

      {/* Main Page & Stories Management Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#dcd8cd] rounded-none max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            
            <div className="flex items-center justify-between border-b border-[#eceae3] pb-3">
              <h2 className="text-lg font-bold text-gray-950 urdu-headline flex items-center gap-2">
                <Newspaper size={18} className="text-emerald-700" />
                <span>
                  {editingItem
                    ? (isUrdu ? `ای پیپر صفحہ نمبر ${formData.page_number} اور مضامین کی تدوین` : `Edit ePaper Page ${formData.page_number} & Content`)
                    : (isUrdu ? "نیا ای پیپر صفحہ شامل کریں" : "Add ePaper Page")}
                </span>
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-700 p-1">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSavePage} className="space-y-6 text-xs font-sans">
              
              {/* Section 1: Page Basic Metadata */}
              <div className="bg-[#f7f6f3] p-4 border border-[#dcd8cd] space-y-3">
                <h3 className="font-bold text-gray-900 text-xs flex items-center gap-1.5">
                  <Layers size={14} className="text-[#0d3822]" />
                  <span>{isUrdu ? "۱. صفحے کی بنیادی معلومات و اسکین" : "1. Page Details & Broadsheet Scan"}</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      {isUrdu ? "تاریخ (Date)" : "Date"} *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.edition_date}
                      onChange={(e) => setFormData({ ...formData, edition_date: e.target.value })}
                      className="w-full border border-[#dcd8cd] bg-white p-2 text-xs outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      {isUrdu ? "شہر (City Edition)" : "City Edition"} *
                    </label>
                    <select
                      value={formData.city_slug}
                      onChange={(e) => setFormData({ ...formData, city_slug: e.target.value })}
                      className="w-full border border-[#dcd8cd] bg-white p-2 text-xs outline-none font-sans"
                    >
                      {cities.map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {isUrdu ? c.name_ur : c.name_en}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      {isUrdu ? "صفحہ نمبر" : "Page Number"} *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="32"
                      required
                      value={formData.page_number}
                      onChange={(e) => setFormData({ ...formData, page_number: e.target.value })}
                      className="w-full border border-[#dcd8cd] bg-white p-2 text-xs outline-none font-mono font-bold"
                    />
                  </div>
                </div>

                {/* Page Titles */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      {isUrdu ? "صفحے کا عنوان (اردو)" : "Page Title (Urdu)"} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.page_title_ur}
                      onChange={(e) => setFormData({ ...formData, page_title_ur: e.target.value })}
                      placeholder="صفحۂ اول (اہم سرخیاں)"
                      className="w-full border border-[#dcd8cd] bg-white p-2 text-xs text-right font-urdu outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      {isUrdu ? "صفحے کا عنوان (انگریزی)" : "Page Title (English)"}
                    </label>
                    <input
                      type="text"
                      value={formData.page_title_en}
                      onChange={(e) => setFormData({ ...formData, page_title_en: e.target.value })}
                      placeholder="Front Page (Main Headlines)"
                      className="w-full border border-[#dcd8cd] bg-white p-2 text-xs outline-none font-sans"
                    />
                  </div>
                </div>

                {/* Scan Image & PDF */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      {isUrdu ? "پورے صفحے کا اسکین (Page Image Scan)" : "Full Page Scan Image URL"}
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={formData.page_image}
                        onChange={(e) => setFormData({ ...formData, page_image: e.target.value })}
                        placeholder="https://... تصویر کا لنک"
                        className="w-full border border-[#dcd8cd] bg-white p-2 text-xs outline-none font-sans"
                      />
                      <label className="bg-white border border-[#dcd8cd] hover:bg-gray-100 px-2.5 py-2 font-bold text-xs cursor-pointer flex items-center gap-1 shrink-0">
                        <Upload size={13} />
                        <span>{uploading ? "..." : (isUrdu ? "فائل" : "File")}</span>
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "page_image")} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      {isUrdu ? "مکمل ایڈیشن PDF لنک" : "Full Edition PDF Download URL"}
                    </label>
                    <input
                      type="text"
                      value={formData.pdf_url}
                      onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
                      placeholder="https://... روزنامہ کا مکمل PDF ایڈیشن"
                      className="w-full border border-[#dcd8cd] bg-white p-2 text-xs outline-none font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Actual Page Stories / Articles (BILINGUAL) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-[#dcd8cd]">
                  <div>
                    <h3 className="font-bold text-gray-950 text-sm flex items-center gap-1.5 urdu-headline">
                      <BookOpen size={16} className="text-emerald-700" />
                      <span>{isUrdu ? "۲. اس صفحے کے اصل اخباری مضامین و خبریں (Bilingual News Articles)" : "2. Actual News Articles on this Page (Bilingual)"}</span>
                    </h3>
                    <p className="text-[11px] text-gray-500 font-sans mt-0.5">
                      {isUrdu
                        ? "قاری جب ای پیپر کے کسی مضمون پر کلک کرے گا تو یہ تفصیلی خبر اردو یا انگریزی میں کھلے گی۔"
                        : "When readers click on a story in the broadsheet ePaper, this full clipping will open in Urdu or English."}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={openNewStoryModal}
                    className="inline-flex items-center gap-1.5 bg-[#0d3822] hover:bg-[#072415] text-white font-bold text-xs px-3.5 py-2 rounded-none transition"
                  >
                    <PlusCircle size={14} />
                    <span>{isUrdu ? "صفحے پر نئی خبر شامل کریں" : "Add Article to Page"}</span>
                  </button>
                </div>

                {/* Stories List */}
                {(formData.stories || []).length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-500 bg-[#f7f6f3] border border-dashed border-[#dcd8cd]">
                    {isUrdu
                      ? "ابھی تک اس صفحے پر کوئی خبر تفصیلی شامل نہیں کی گئی۔ اوپر دیئے گئے بٹن سے لیڈ اسٹوری اور دیگر خبریں شامل کریں۔"
                      : "No articles added to this page yet. Click 'Add Article to Page' above to populate broadsheet stories."}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {formData.stories.map((st, sIdx) => (
                      <div
                        key={st.id || sIdx}
                        className="bg-white border border-[#dcd8cd] p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:border-emerald-700 transition"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2 text-[10px] font-sans">
                            <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold px-1.5 py-0.2 uppercase">
                              {st.position === "lead" ? (isUrdu ? "لیڈ اسٹوری" : "LEAD STORY") :
                               st.position === "secondary_top" ? (isUrdu ? "ثانوی خبر ۱" : "SECONDARY TOP") :
                               st.position === "secondary_bottom" ? (isUrdu ? "ثانوی خبر ۲" : "SECONDARY BOTTOM") : (isUrdu ? "کالم / فیچر" : "COLUMN")}
                            </span>
                            <span className="text-gray-500">{st.byline_ur || st.byline_en}</span>
                          </div>

                          <h4 className="font-bold text-gray-950 text-sm urdu-headline leading-snug">
                            {st.headline_ur}
                          </h4>

                          {st.headline_en && (
                            <p className="text-xs text-gray-500 font-sans line-clamp-1">
                              {st.headline_en}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => openEditStoryModal(sIdx)}
                            className="p-1.5 text-gray-600 hover:text-emerald-700 border border-[#dcd8cd] bg-[#f7f6f3]"
                            title="Edit"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteStoryFromPage(sIdx)}
                            className="p-1.5 text-gray-400 hover:text-red-700 border border-[#dcd8cd] bg-[#f7f6f3]"
                            title="Delete"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                  {saving ? (isUrdu ? "محفوظ ہو رہا ہے..." : "Saving...") : (isUrdu ? "پورا ای پیپر صفحہ شائع کریں" : "Publish Entire Page")}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Sub-modal: Story Editor (Bilingual Headline, Byline, Excerpt, Content) */}
      {storyModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#dcd8cd] rounded-none max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-[#eceae3] pb-3">
              <h3 className="text-base font-bold text-gray-950 urdu-headline flex items-center gap-2">
                <Sparkles size={16} className="text-emerald-700" />
                <span>{editingStoryIndex >= 0 ? (isUrdu ? "اخباری مضمون میں ترمیم کریں" : "Edit Article Details") : (isUrdu ? "صفحے کے لیے نیا مضمون" : "Add Article to Page")}</span>
              </h3>
              <button onClick={() => setStoryModalOpen(false)} className="text-gray-400 hover:text-gray-700 p-1">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveStoryToPage} className="space-y-4 text-xs font-sans">
              
              {/* Position Selection */}
              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  {isUrdu ? "صفحے پر مقام (Broadsheet Position)" : "Position on Broadsheet"}
                </label>
                <select
                  value={storyFormData.position}
                  onChange={(e) => setStoryFormData({ ...storyFormData, position: e.target.value })}
                  className="w-full border border-[#dcd8cd] bg-white p-2 text-xs font-sans outline-none"
                >
                  <option value="lead">{isUrdu ? "لیڈ اسٹوری (Hero 8-Column Super Headline)" : "Lead Story (Main Top Hero)"}</option>
                  <option value="secondary_top">{isUrdu ? "ثانوی بڑی خبر ۱ (Top Side Headline)" : "Secondary Top Story"}</option>
                  <option value="secondary_bottom">{isUrdu ? "ثانوی خبر ۲ (Bottom Side Story)" : "Secondary Bottom Story"}</option>
                  <option value="column">{isUrdu ? "کالم / اداریہ / فیچر (Column / Editorial)" : "Column / Editorial"}</option>
                </select>
              </div>

              {/* Headlines (Urdu & English) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">
                    {isUrdu ? "خبر کی سرخی (اردو)" : "Article Headline (Urdu)"} *
                  </label>
                  <input
                    type="text"
                    required
                    value={storyFormData.headline_ur}
                    onChange={(e) => setStoryFormData({ ...storyFormData, headline_ur: e.target.value })}
                    placeholder="مثال: اسٹیٹ بینک کا بڑا فیصلہ..."
                    className="w-full border border-[#dcd8cd] p-2 text-xs text-right font-urdu outline-none focus:border-emerald-700"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-800 mb-1">
                    {isUrdu ? "خبر کی سرخی (انگریزی)" : "Article Headline (English)"}
                  </label>
                  <input
                    type="text"
                    value={storyFormData.headline_en}
                    onChange={(e) => setStoryFormData({ ...storyFormData, headline_en: e.target.value })}
                    placeholder="e.g. Central Bank Announces Key Policy Shift..."
                    className="w-full border border-[#dcd8cd] p-2 text-xs outline-none font-sans focus:border-emerald-700"
                  />
                </div>
              </div>

              {/* Bylines (Urdu & English) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">
                    {isUrdu ? "رپورٹر / بائی لائن (اردو)" : "Reporter / Byline (Urdu)"}
                  </label>
                  <input
                    type="text"
                    value={storyFormData.byline_ur}
                    onChange={(e) => setStoryFormData({ ...storyFormData, byline_ur: e.target.value })}
                    placeholder="اسلام آباد (خصوصی نامہ نگار)"
                    className="w-full border border-[#dcd8cd] p-2 text-xs text-right font-urdu outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-800 mb-1">
                    {isUrdu ? "رپورٹر / بائی لائن (انگریزی)" : "Reporter / Byline (English)"}
                  </label>
                  <input
                    type="text"
                    value={storyFormData.byline_en}
                    onChange={(e) => setStoryFormData({ ...storyFormData, byline_en: e.target.value })}
                    placeholder="Islamabad (Special Correspondent)"
                    className="w-full border border-[#dcd8cd] p-2 text-xs outline-none font-sans"
                  />
                </div>
              </div>

              {/* Excerpts (Urdu & English) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">
                    {isUrdu ? "مختصر خلاصہ (اردو)" : "Short Excerpt (Urdu)"}
                  </label>
                  <textarea
                    rows={2}
                    value={storyFormData.excerpt_ur}
                    onChange={(e) => setStoryFormData({ ...storyFormData, excerpt_ur: e.target.value })}
                    placeholder="اخبار کے براڈ شیٹ صفحے پر دکھانے کے لیے ۲ سے ۳ جملے..."
                    className="w-full border border-[#dcd8cd] p-2 text-xs text-right font-urdu outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-800 mb-1">
                    {isUrdu ? "مختصر خلاصہ (انگریزی)" : "Short Excerpt (English)"}
                  </label>
                  <textarea
                    rows={2}
                    value={storyFormData.excerpt_en}
                    onChange={(e) => setStoryFormData({ ...storyFormData, excerpt_en: e.target.value })}
                    placeholder="2-3 sentences to show on broadsheet column..."
                    className="w-full border border-[#dcd8cd] p-2 text-xs outline-none font-sans"
                  />
                </div>
              </div>

              {/* Full Detailed Content (Urdu & English) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">
                    {isUrdu ? "مکمل تفصیلی خبر (اردو - کلپنگ ریڈر)" : "Full Story Content (Urdu)"}
                  </label>
                  <textarea
                    rows={4}
                    value={storyFormData.content_ur}
                    onChange={(e) => setStoryFormData({ ...storyFormData, content_ur: e.target.value })}
                    placeholder="جب قاری کلپنگ پر کلک کرے گا تو یہ مکمل خبر کھلے گی..."
                    className="w-full border border-[#dcd8cd] p-2 text-xs text-right font-urdu outline-none leading-relaxed"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-800 mb-1">
                    {isUrdu ? "مکمل تفصیلی خبر (انگریزی - کلپنگ ریڈر)" : "Full Story Content (English)"}
                  </label>
                  <textarea
                    rows={4}
                    value={storyFormData.content_en}
                    onChange={(e) => setStoryFormData({ ...storyFormData, content_en: e.target.value })}
                    placeholder="Full in-depth story in English..."
                    className="w-full border border-[#dcd8cd] p-2 text-xs outline-none font-sans leading-relaxed"
                  />
                </div>
              </div>

              {/* Story Photo */}
              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  {isUrdu ? "مضمون کی تصویر (اختیاری)" : "Story Photo URL (Optional)"}
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={storyFormData.image_url}
                    onChange={(e) => setStoryFormData({ ...storyFormData, image_url: e.target.value })}
                    placeholder="https://... تصویر کا لنک"
                    className="w-full border border-[#dcd8cd] p-2 text-xs outline-none font-sans"
                  />
                  <label className="bg-[#f7f6f3] border border-[#dcd8cd] hover:bg-gray-100 px-3 py-2 font-bold text-xs cursor-pointer flex items-center gap-1 shrink-0">
                    <Upload size={13} />
                    <span>{uploading ? "..." : (isUrdu ? "فائل" : "File")}</span>
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "story_image")} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#eceae3]">
                <button
                  type="button"
                  onClick={() => setStoryModalOpen(false)}
                  className="px-3.5 py-1.5 border border-[#dcd8cd] bg-white text-gray-700 font-bold"
                >
                  {isUrdu ? "منسوخ" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-1.5 bg-[#0d3822] text-white font-bold"
                >
                  {isUrdu ? "مضمون شامل کریں" : "Apply to Page"}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
