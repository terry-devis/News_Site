"use client";
import React, { useState, useEffect, useRef } from "react";
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
  Bold,
  Italic,
  Quote,
  List,
  Save,
  ChevronLeft,
  ChevronRight,
  Settings,
  ArrowRight,
  RefreshCw,
  LayoutGrid,
  PenTool,
  Check,
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
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState(null);

  // View Mode: "studio" (interactive split-screen writer) or "rack" (pages grid overview)
  const [viewMode, setViewMode] = useState("studio");

  // Active Edition being edited in the Studio
  const [activeEditionId, setActiveEditionId] = useState(null);

  // Active Story within the Active Edition being edited in the Studio
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);

  // Active Language Tab in the Story Editor ("ur" or "en")
  const [editorLangTab, setEditorLangTab] = useState("ur");

  // Page Settings Drawer/Modal toggle
  const [pageSettingsOpen, setPageSettingsOpen] = useState(false);

  // New Page Modal toggle
  const [newPageModalOpen, setNewPageModalOpen] = useState(false);

  // Page form state for settings / new page
  const [pageFormData, setPageFormData] = useState({
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

  // Story form state currently in the writing suite
  const [currentStory, setCurrentStory] = useState({
    id: "s1",
    position: "lead",
    headline_ur: "",
    headline_en: "",
    byline_ur: "اسلام آباد (خصوصی نامہ نگار)",
    byline_en: "Islamabad (Special Correspondent)",
    excerpt_ur: "",
    excerpt_en: "",
    content_ur: "",
    content_en: "",
    image_url: "",
  });

  const cities = [
    { slug: "islamabad", name_ur: "اسلام آباد / راولپنڈی", name_en: "Islamabad / Rawalpindi" },
    { slug: "lahore", name_ur: "لاہور ایڈیشن", name_en: "Lahore Edition" },
    { slug: "karachi", name_ur: "کراچی ایڈیشن", name_en: "Karachi Edition" },
    { slug: "quetta", name_ur: "کوئٹہ ایڈیشن", name_en: "Quetta Edition" },
    { slug: "international", name_ur: "انٹرنیشنل ایڈیشن", name_en: "International Edition" },
  ];

  const quickBylines = [
    { ur: "اسلام آباد (خصوصی نامہ نگار)", en: "Islamabad (Special Correspondent)" },
    { ur: "کراچی (بزنس رپورٹر)", en: "Karachi (Business Desk)" },
    { ur: "لاہور (خصوصی نمائندہ)", en: "Lahore (Special Correspondent)" },
    { ur: "موسمی ڈیسک", en: "Weather & Metro Desk" },
    { ur: "کھیل ڈیسک", en: "Sports Bureau" },
    { ur: "ادارتی بورڈ", en: "Editorial Board" },
  ];

  const contentTextareaRef = useRef(null);

  async function loadEditions(autoSelectPageNumber = null) {
    setLoading(true);
    try {
      let url = "/api/epaper";
      const params = new URLSearchParams();
      if (selectedDate) params.append("date", selectedDate);
      if (selectedCity && selectedCity !== "all") params.append("city", selectedCity);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      const data = await res.json();
      const list = data.editions || [];
      setEditions(list);

      // Auto select edition for studio
      if (list.length > 0) {
        let target = null;
        if (autoSelectPageNumber) {
          target = list.find((e) => Number(e.page_number) === Number(autoSelectPageNumber));
        }
        if (!target) {
          target = activeEditionId ? list.find((e) => e.id === activeEditionId) : list[0];
        }
        if (!target) target = list[0];

        setActiveEditionId(target.id);
        setPageFormData({ ...target });

        const stories = target.stories || [];
        if (stories.length > 0) {
          const sIdx = Math.min(activeStoryIndex, stories.length - 1);
          setActiveStoryIndex(Math.max(0, sIdx));
          setCurrentStory({ ...stories[Math.max(0, sIdx)] });
        } else {
          // Empty initial story
          const emptyStory = {
            id: `s-${Date.now()}`,
            position: "lead",
            headline_ur: "",
            headline_en: "",
            byline_ur: "اسلام آباد (خصوصی نامہ نگار)",
            byline_en: "Islamabad (Special Correspondent)",
            excerpt_ur: "",
            excerpt_en: "",
            content_ur: "",
            content_en: "",
            image_url: "",
          };
          setCurrentStory(emptyStory);
        }
      }
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

  // Switch active edition in Studio
  const handleSelectEdition = (edition) => {
    setActiveEditionId(edition.id);
    setPageFormData({ ...edition });
    const stories = edition.stories || [];
    if (stories.length > 0) {
      setActiveStoryIndex(0);
      setCurrentStory({ ...stories[0] });
    } else {
      const empty = {
        id: `s-${Date.now()}`,
        position: "lead",
        headline_ur: "",
        headline_en: "",
        byline_ur: "اسلام آباد (خصوصی نامہ نگار)",
        byline_en: "Islamabad (Special Correspondent)",
        excerpt_ur: "",
        excerpt_en: "",
        content_ur: "",
        content_en: "",
        image_url: "",
      };
      setCurrentStory(empty);
      setActiveStoryIndex(0);
    }
    setViewMode("studio");
  };

  // Switch active story within current page
  const handleSelectStorySlot = (index) => {
    const stories = pageFormData.stories || [];
    if (index >= 0 && index < stories.length) {
      setActiveStoryIndex(index);
      setCurrentStory({ ...stories[index] });
    }
  };

  // Add a new blank story slot to current page
  const handleAddNewStorySlot = (preferredPosition = "secondary_bottom") => {
    const stories = [...(pageFormData.stories || [])];
    const newStory = {
      id: `s-${Date.now()}`,
      position: preferredPosition,
      headline_ur: "",
      headline_en: "",
      byline_ur: "خصوصی نامہ نگار",
      byline_en: "Special Correspondent",
      excerpt_ur: "",
      excerpt_en: "",
      content_ur: "",
      content_en: "",
      image_url: "",
    };
    stories.push(newStory);
    const updatedPage = { ...pageFormData, stories };
    setPageFormData(updatedPage);
    setActiveStoryIndex(stories.length - 1);
    setCurrentStory(newStory);
    showNotice(isUrdu ? "نئے مضمون کا سلاٹ شامل ہو گیا۔ اب تحریر شروع کریں۔" : "New article slot added. Begin writing.");
  };

  // Remove a story slot
  const handleDeleteStorySlot = (index) => {
    const stories = [...(pageFormData.stories || [])];
    if (stories.length <= 1) {
      alert(isUrdu ? "کم از کم ایک لیڈ اسٹوری سلاٹ صفحے پر ہونا لازمی ہے۔" : "At least one lead story slot must remain.");
      return;
    }
    if (!confirm(isUrdu ? "کیا آپ واقعی یہ خبر اس صفحے سے حذف کرنا چاہتے ہیں؟" : "Delete this article from page?")) {
      return;
    }
    stories.splice(index, 1);
    const updatedPage = { ...pageFormData, stories };
    setPageFormData(updatedPage);
    const newIdx = Math.max(0, index - 1);
    setActiveStoryIndex(newIdx);
    setCurrentStory({ ...stories[newIdx] });
    showNotice(isUrdu ? "خبر صفحے سے ہٹا دی گئی۔" : "Story removed from page.");
  };

  // Save current story and sync the entire edition immediately
  const handleSaveCurrentStory = async (e) => {
    if (e) e.preventDefault();

    if (!currentStory.headline_ur && !currentStory.headline_en) {
      alert(isUrdu ? "کم از کم اردو یا انگریزی سرخی درج کرنا لازمی ہے۔" : "Headline is required in Urdu or English.");
      return;
    }

    setSaving(true);
    try {
      const stories = [...(pageFormData.stories || [])];
      if (activeStoryIndex >= 0 && activeStoryIndex < stories.length) {
        stories[activeStoryIndex] = { ...currentStory };
      } else {
        stories.push({ ...currentStory });
      }

      const updatedPage = {
        ...pageFormData,
        stories,
        page_number: Number(pageFormData.page_number) || 1,
      };

      const selectedCityObj = cities.find((c) => c.slug === updatedPage.city_slug) || cities[0];
      updatedPage.city_name_ur = selectedCityObj.name_ur;
      updatedPage.city_name_en = selectedCityObj.name_en;

      const url = updatedPage.id ? `/api/epaper/${updatedPage.id}` : "/api/epaper";
      const method = updatedPage.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPage),
      });

      if (res.ok) {
        const result = await res.json();
        setPageFormData(updatedPage);
        showNotice(isUrdu ? "✓ مضمون اور اخباری صفحہ کامیابی سے محفوظ ہو گیا!" : "✓ Article & Broadsheet page published live!");
        loadEditions();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save story");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Rich Text Insertion Helper
  const insertFormatting = (prefix, suffix = "") => {
    const textarea = contentTextareaRef.current;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = editorLangTab === "ur" ? currentStory.content_ur || "" : currentStory.content_en || "";
    const selected = text.substring(start, end) || (isUrdu ? "اہم متن" : "Sample text");
    const replacement = `${prefix}${selected}${suffix}`;
    const newText = text.substring(0, start) + replacement + text.substring(end);

    if (editorLangTab === "ur") {
      setCurrentStory((prev) => ({ ...prev, content_ur: newText }));
    } else {
      setCurrentStory((prev) => ({ ...prev, content_en: newText }));
    }

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
    }, 50);
  };

  // File Upload Helper
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
          setCurrentStory((prev) => ({ ...prev, image_url: data.url }));
          showNotice(isUrdu ? "مضمون کی تصویر اپلوڈ ہو گئی" : "Story photo uploaded");
        } else if (targetField === "page_image") {
          setPageFormData((prev) => ({ ...prev, page_image: data.url }));
          showNotice(isUrdu ? "پورے صفحے کا اسکین اپلوڈ ہو گیا" : "Page scan uploaded");
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  // Save Page Settings (Title, Date, City, Scan, PDF)
  const handleSavePageSettings = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const selectedCityObj = cities.find((c) => c.slug === pageFormData.city_slug) || cities[0];
      const payload = {
        ...pageFormData,
        city_name_ur: selectedCityObj.name_ur,
        city_name_en: selectedCityObj.name_en,
        page_number: Number(pageFormData.page_number) || 1,
      };

      const url = payload.id ? `/api/epaper/${payload.id}` : "/api/epaper";
      const method = payload.id ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showNotice(isUrdu ? "صفحے کی بنیادی ترتیبات محفوظ ہو گئیں" : "Page settings updated");
        setPageSettingsOpen(false);
        loadEditions();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Helper for word count
  const getWordCount = (str) => {
    if (!str) return 0;
    return str.trim().split(/\s+/).filter(Boolean).length;
  };

  // Active edition object
  const activeEdition = editions.find((e) => e.id === activeEditionId) || editions[0] || pageFormData;
  const storiesList = pageFormData.stories || [];

  return (
    <div className="p-3 sm:p-5 lg:p-7 space-y-5 font-sans" dir={dir}>
      
      {/* Top Bar: Title, Mode Switcher, Quick Links & Notice */}
      <div className="bg-white border border-[#dcd8cd] rounded-none p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider mb-0.5">
            <Newspaper size={16} />
            <span>{isUrdu ? "روزنامہ افادیت — براڈ شیٹ رائٹنگ و ایڈیٹنگ اسٹوڈیو" : "DAILY AFADIAT — BROADSHEET WRITING & EDITING STUDIO"}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-950 urdu-headline">
            {isUrdu ? "ای پیپر اخباری مضامین و صفحات کی تدوین" : "ePaper Articles & Broadsheet Newsroom"}
          </h1>
          <p className="text-xs text-gray-600 mt-0.5">
            {isUrdu
              ? "لائیو اخبار پر خبریں لکھیں، لیڈ اسٹوری و کالمز سیٹ کریں اور اردو و انگریزی دونوں زبانوں میں فوری شائع کریں۔"
              : "Write articles directly on the live broadsheet layout, configure hero lead & columns, and publish bilingual content."}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Studio vs Rack Mode Toggle */}
          <div className="bg-[#f7f6f3] border border-[#dcd8cd] p-0.5 flex items-center">
            <button
              onClick={() => setViewMode("studio")}
              className={`px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 transition ${
                viewMode === "studio"
                  ? "bg-[#0d3822] text-white shadow-2xs"
                  : "text-gray-700 hover:text-black"
              }`}
            >
              <PenTool size={13} />
              <span>{isUrdu ? "رائٹنگ اسٹوڈیو" : "Writing Studio"}</span>
            </button>
            <button
              onClick={() => setViewMode("rack")}
              className={`px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 transition ${
                viewMode === "rack"
                  ? "bg-[#0d3822] text-white shadow-2xs"
                  : "text-gray-700 hover:text-black"
              }`}
            >
              <LayoutGrid size={13} />
              <span>{isUrdu ? "تمام صفحات کی فہرست" : "All Pages Rack"}</span>
            </button>
          </div>

          <Link
            href="/epaper"
            target="_blank"
            className="inline-flex items-center gap-1.5 border border-[#dcd8cd] bg-[#f7f6f3] hover:bg-white text-gray-800 hover:text-emerald-800 font-bold text-xs px-3 py-1.5 rounded-none transition"
          >
            <ExternalLink size={13} />
            <span>{isUrdu ? "پبلک ای پیپر دیکھیں" : "View /epaper"}</span>
          </Link>
        </div>
      </div>

      {/* Floating Status Notification */}
      {notice && (
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-950 px-4 py-2 text-xs font-bold flex items-center gap-2 animate-fadeIn shadow-xs">
          <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODE 1: THE FULL-FEATURED BROADSHEET WRITING STUDIO (SPLIT-SCREEN) */}
      {/* ============================================================== */}
      {viewMode === "studio" && (
        <div className="space-y-4">
          
          {/* Studio Top Control Strip: Page Selection Tabs + Date + City + Page Settings */}
          <div className="bg-white border border-[#dcd8cd] rounded-none p-3 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
            
            {/* Left: Quick Page Switcher Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 lg:pb-0">
              <span className="font-bold text-gray-700 flex items-center gap-1 shrink-0 px-1">
                <Layers size={14} className="text-[#0d3822]" />
                <span>{isUrdu ? "صفحہ منتخب کریں:" : "Select Page:"}</span>
              </span>

              {editions.map((ed) => (
                <button
                  key={ed.id}
                  onClick={() => handleSelectEdition(ed)}
                  className={`px-3 py-1.5 font-bold transition whitespace-nowrap cursor-pointer border ${
                    activeEditionId === ed.id
                      ? "bg-[#0d3822] text-white border-[#0d3822] shadow-xs"
                      : "bg-[#f7f6f3] text-gray-700 border-[#dcd8cd] hover:bg-white"
                  }`}
                >
                  <span>{isUrdu ? `صفحہ ${ed.page_number}` : `Page ${ed.page_number}`}</span>
                  <span className="text-[10px] opacity-80 mr-1.5 font-sans">
                    ({(ed.stories || []).length} {isUrdu ? "مضامین" : "stories"})
                  </span>
                </button>
              ))}

              <button
                onClick={() => setNewPageModalOpen(true)}
                className="px-2.5 py-1.5 bg-white border border-dashed border-[#0d3822] text-[#0d3822] hover:bg-emerald-50 font-bold transition flex items-center gap-1 shrink-0"
                title="Add New Page"
              >
                <PlusCircle size={13} />
                <span>{isUrdu ? "نیا صفحہ" : "New Page"}</span>
              </button>
            </div>

            {/* Right: City, Date & Settings Drawer */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 bg-[#f7f6f3] border border-[#dcd8cd] px-2 py-1">
                <Calendar size={13} className="text-emerald-700" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent font-mono text-xs text-gray-900 outline-none cursor-pointer"
                />
              </div>

              <select
                value={pageFormData.city_slug}
                onChange={(e) => {
                  setPageFormData({ ...pageFormData, city_slug: e.target.value });
                  setSelectedCity(e.target.value);
                }}
                className="bg-[#f7f6f3] border border-[#dcd8cd] px-2.5 py-1 text-xs text-gray-900 outline-none cursor-pointer font-bold"
              >
                {cities.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {isUrdu ? c.name_ur : c.name_en}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setPageSettingsOpen(true)}
                className="bg-zinc-800 hover:bg-black text-white px-3 py-1 font-bold flex items-center gap-1 transition"
                title={isUrdu ? "صفحے کے اسکین اور PDF ترتیبات" : "Page Scan & PDF Settings"}
              >
                <Settings size={13} />
                <span>{isUrdu ? "صفحے کی سیٹنگز" : "Page Settings"}</span>
              </button>
            </div>

          </div>

          {/* Studio Workspace: Left Pane (Interactive Broadsheet Preview) + Right Pane (Article Studio) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            
            {/* LEFT PANE (5 Cols): Authentic Interactive Broadsheet Wireframe & Story Slots */}
            <div className="lg:col-span-5 bg-white border border-[#dcd8cd] rounded-none p-4 shadow-xs space-y-4 sticky top-4">
              
              <div className="flex items-center justify-between border-b border-[#dcd8cd] pb-2.5">
                <div className="flex items-center gap-1.5">
                  <Eye size={15} className="text-emerald-700" />
                  <span className="font-black text-gray-950 text-xs urdu-headline">
                    {isUrdu ? `لائیو اخباری صفحہ ${pageFormData.page_number} کا لے آؤٹ` : `Live Broadsheet Layout (Page ${pageFormData.page_number})`}
                  </span>
                </div>
                <span className="text-[11px] text-gray-500 font-sans">
                  {isUrdu ? "ایڈٹ کرنے کے لیے کسی بھی خبر پر کلک کریں" : "Click slot to edit"}
                </span>
              </div>

              {/* Broadsheet Miniature Page Preview */}
              <div className="bg-[#fcfbf9] border-2 border-gray-400 p-3.5 space-y-3 shadow-inner">
                
                {/* Masthead Ribbon */}
                <div className="border-b-2 border-black pb-2 text-center space-y-1">
                  <div className="flex justify-between text-[9px] text-gray-600 font-sans border-b border-gray-300 pb-0.5">
                    <span>{isUrdu ? "جلد: ۰۱" : "Vol: 01"}</span>
                    <span>{pageFormData.edition_date}</span>
                    <span>{isUrdu ? "قیمت: ۲۰ روپے" : "Rs. 20"}</span>
                  </div>
                  <h3 className="text-2xl font-black urdu-headline tracking-tight text-black py-0.5">
                    {isUrdu ? "روزنامہ افادیت" : "DAILY AFADIAT"}
                  </h3>
                  <div className="bg-black text-white text-[9px] py-0.5 font-bold flex justify-around font-sans">
                    <span>{pageFormData.city_name_ur || "اسلام آباد"}</span>
                    <span>•</span>
                    <span>{isUrdu ? "سچ کے ساتھ، ہر لمحہ باخبر" : "TRUTH & INTEGRITY"}</span>
                  </div>
                </div>

                {/* Newspaper Slots Grid */}
                <div className="space-y-3">
                  
                  {/* Slot 1: Hero Lead Story */}
                  {(() => {
                    const leadIdx = storiesList.findIndex((s) => s.position === "lead");
                    const lead = leadIdx >= 0 ? storiesList[leadIdx] : storiesList[0];
                    const isSelected = activeStoryIndex === (leadIdx >= 0 ? leadIdx : 0);

                    return (
                      <div
                        onClick={() => handleSelectStorySlot(leadIdx >= 0 ? leadIdx : 0)}
                        className={`p-3 border-2 transition cursor-pointer relative group ${
                          isSelected
                            ? "border-emerald-700 bg-emerald-50/60 shadow-md ring-2 ring-emerald-500"
                            : "border-gray-300 bg-white hover:border-gray-500"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="bg-black text-white text-[9px] font-bold px-1.5 py-0.2 uppercase font-sans">
                            {isUrdu ? "۱. لیڈ سپر ہیڈ لائن (Hero)" : "1. Lead Story"}
                          </span>
                          {isSelected && (
                            <span className="text-[10px] font-bold text-emerald-800 flex items-center gap-1 font-sans">
                              <Check size={11} /> {isUrdu ? "زیرِ تدوین" : "Editing Now"}
                            </span>
                          )}
                        </div>

                        <h4 className="font-bold text-xs sm:text-sm text-gray-950 urdu-headline line-clamp-2 leading-snug">
                          {lead?.headline_ur || lead?.headline_en || (isUrdu ? "[لیڈ سرخی خالی ہے - یہاں کلک کر کے لکھیں]" : "[Empty Lead Headline - Click to write]")}
                        </h4>

                        {lead?.image_url && (
                          <div className="relative aspect-[16/8] w-full my-1.5 bg-gray-100 border border-gray-200 overflow-hidden">
                            <Image src={lead.image_url} alt="Lead" fill className="object-cover" />
                          </div>
                        )}

                        <p className="text-[11px] text-gray-600 line-clamp-2 leading-relaxed font-sans">
                          {lead?.excerpt_ur || lead?.excerpt_en || "اخبار کے براڈ شیٹ صفحے پر کالم کا خلاصہ یہاں ظاہر ہوگا۔"}
                        </p>
                      </div>
                    );
                  })()}

                  {/* Slot 2 & Slot 3: Secondary Stories Row */}
                  <div className="grid grid-cols-2 gap-2.5">
                    
                    {/* Secondary 1 */}
                    {(() => {
                      const secTopIdx = storiesList.findIndex((s) => s.position === "secondary_top");
                      const secTop = secTopIdx >= 0 ? storiesList[secTopIdx] : storiesList[1];
                      const isSelected = activeStoryIndex === (secTopIdx >= 0 ? secTopIdx : 1);

                      return (
                        <div
                          onClick={() => {
                            if (secTopIdx >= 0) handleSelectStorySlot(secTopIdx);
                            else handleAddNewStorySlot("secondary_top");
                          }}
                          className={`p-2.5 border-2 transition cursor-pointer relative ${
                            isSelected
                              ? "border-emerald-700 bg-emerald-50/60 shadow-md ring-2 ring-emerald-500"
                              : "border-gray-300 bg-white hover:border-gray-500"
                          }`}
                        >
                          <span className="bg-emerald-900 text-white text-[8px] font-bold px-1 py-0.2 uppercase font-sans block mb-1">
                            {isUrdu ? "۲. ثانوی بڑی خبر" : "2. Secondary Top"}
                          </span>
                          <h5 className="font-bold text-[11px] text-gray-950 urdu-headline line-clamp-2 leading-snug">
                            {secTop?.headline_ur || secTop?.headline_en || (isUrdu ? "[اہم خبر شامل کریں]" : "[Add Top Highlight]")}
                          </h5>
                          <p className="text-[10px] text-gray-500 line-clamp-2 mt-1 font-sans">
                            {secTop?.excerpt_ur || secTop?.excerpt_en || "مختصر خلاصہ..."}
                          </p>
                        </div>
                      );
                    })()}

                    {/* Secondary 2 */}
                    {(() => {
                      const secBotIdx = storiesList.findIndex((s) => s.position === "secondary_bottom");
                      const secBot = secBotIdx >= 0 ? storiesList[secBotIdx] : storiesList[2];
                      const isSelected = activeStoryIndex === (secBotIdx >= 0 ? secBotIdx : 2);

                      return (
                        <div
                          onClick={() => {
                            if (secBotIdx >= 0) handleSelectStorySlot(secBotIdx);
                            else handleAddNewStorySlot("secondary_bottom");
                          }}
                          className={`p-2.5 border-2 transition cursor-pointer relative ${
                            isSelected
                              ? "border-emerald-700 bg-emerald-50/60 shadow-md ring-2 ring-emerald-500"
                              : "border-gray-300 bg-white hover:border-gray-500"
                          }`}
                        >
                          <span className="bg-zinc-800 text-white text-[8px] font-bold px-1 py-0.2 uppercase font-sans block mb-1">
                            {isUrdu ? "۳. موسمی و علاقائی رپورٹ" : "3. Metro / Weather"}
                          </span>
                          <h5 className="font-bold text-[11px] text-gray-950 urdu-headline line-clamp-2 leading-snug">
                            {secBot?.headline_ur || secBot?.headline_en || (isUrdu ? "[موسمی / علاقائی خبر]" : "[Add Metro Story]")}
                          </h5>
                          <p className="text-[10px] text-gray-500 line-clamp-2 mt-1 font-sans">
                            {secBot?.excerpt_ur || secBot?.excerpt_en || "مختصر خلاصہ..."}
                          </p>
                        </div>
                      );
                    })()}

                  </div>

                  {/* Extra Columns & Stories (Slot 4+) */}
                  {storiesList.slice(3).map((extraStory, extraOffset) => {
                    const actualIdx = 3 + extraOffset;
                    const isSelected = activeStoryIndex === actualIdx;

                    return (
                      <div
                        key={extraStory.id || actualIdx}
                        onClick={() => handleSelectStorySlot(actualIdx)}
                        className={`p-2.5 border-2 transition cursor-pointer relative ${
                          isSelected
                            ? "border-emerald-700 bg-emerald-50/60 shadow-md ring-2 ring-emerald-500"
                            : "border-gray-300 bg-white hover:border-gray-500"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="bg-amber-900 text-white text-[8px] font-bold px-1 py-0.2 uppercase font-sans">
                            {isUrdu ? `۴.${extraOffset + 1} کالم / خصوصی خبر` : `4.${extraOffset + 1} Column / Feature`}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteStorySlot(actualIdx);
                            }}
                            className="text-gray-400 hover:text-red-700 p-0.5"
                            title="Delete Slot"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                        <h5 className="font-bold text-xs text-gray-950 urdu-headline line-clamp-1">
                          {extraStory.headline_ur || extraStory.headline_en || (isUrdu ? "[عنوان تحریر کریں]" : "[Write Column Title]")}
                        </h5>
                      </div>
                    );
                  })}

                  {/* Button to add extra column slot */}
                  <button
                    onClick={() => handleAddNewStorySlot("column")}
                    className="w-full py-2 bg-white border border-dashed border-gray-400 hover:border-emerald-700 hover:bg-emerald-50 text-gray-700 hover:text-emerald-900 text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <PlusCircle size={13} className="text-emerald-700" />
                    <span>{isUrdu ? "+ صفحے پر مزید کالم یا خبر شامل کریں" : "+ Add Another Column / Story Slot"}</span>
                  </button>

                </div>

              </div>

              {/* Bottom Quick Help */}
              <div className="p-3 bg-[#f7f6f3] border border-[#dcd8cd] text-[11px] text-gray-600 space-y-1">
                <span className="font-bold text-gray-900 block">
                  💡 {isUrdu ? "ادارتی رہنمائی (Editorial Tip):" : "Editorial Tip:"}
                </span>
                <p>
                  {isUrdu
                    ? "بائیں جانب کسی بھی خبر کے خانے پر کلک کر کے دائیں جانب اس کی سرخی اور متن براہِ راست تبدیل کریں۔ ہر تبدیلی فوراً محفوظ کی جا سکتی ہے۔"
                    : "Click any broadsheet slot on the left to immediately edit its headline and body in the writing studio on the right."}
                </p>
              </div>

            </div>

            {/* RIGHT PANE (7 Cols): The Dedicated High-End Writing Studio */}
            <div className="lg:col-span-7 bg-white border border-[#dcd8cd] rounded-none p-4 sm:p-6 shadow-xs space-y-5">
              
              {/* Studio Header: Active Slot Banner + Position Selector + Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#dcd8cd]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[#0d3822] text-white text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide font-sans">
                      {currentStory.position === "lead" ? (isUrdu ? "لیڈ اسٹوری (Hero 8-Col)" : "Lead Story (Hero)") :
                       currentStory.position === "secondary_top" ? (isUrdu ? "ثانوی بڑی خبر (Top Highlight)" : "Secondary Top") :
                       currentStory.position === "secondary_bottom" ? (isUrdu ? "ثانوی رپورٹ (Metro/Weather)" : "Secondary Bottom") :
                       (isUrdu ? "کالم / اداریہ (Column/Op-Ed)" : "Column / Editorial")}
                    </span>
                    <span className="text-xs font-bold text-gray-700 font-sans">
                      {isUrdu ? `صفحہ ${pageFormData.page_number}` : `Page ${pageFormData.page_number}`}
                    </span>
                  </div>
                  <h2 className="text-base sm:text-lg font-black text-gray-950 urdu-headline mt-1">
                    {isUrdu ? "اخباری تحریر و ادارت اسٹوڈیو" : "Journalistic Article Studio"}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={currentStory.position}
                    onChange={(e) => setCurrentStory({ ...currentStory, position: e.target.value })}
                    className="border border-[#dcd8cd] bg-[#f7f6f3] px-2 py-1.5 text-xs font-bold text-gray-800 outline-none cursor-pointer"
                  >
                    <option value="lead">{isUrdu ? "مقام: لیڈ اسٹوری (Main)" : "Slot: Lead Story"}</option>
                    <option value="secondary_top">{isUrdu ? "مقام: ثانوی بڑی خبر ۱" : "Slot: Secondary Top"}</option>
                    <option value="secondary_bottom">{isUrdu ? "مقام: ثانوی خبر ۲" : "Slot: Secondary Bottom"}</option>
                    <option value="column">{isUrdu ? "مقام: کالم / اداریہ" : "Slot: Column / Editorial"}</option>
                  </select>

                  {storiesList.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteStorySlot(activeStoryIndex)}
                      className="p-1.5 text-gray-400 hover:text-red-700 hover:bg-red-50 border border-[#dcd8cd]"
                      title="Delete this story"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {/* Language Tabs: Urdu (RTL) vs English (LTR) */}
              <div className="flex items-center justify-between border-b border-[#dcd8cd] pb-1">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditorLangTab("ur")}
                    className={`px-4 py-2 font-bold text-xs transition border-b-2 flex items-center gap-1.5 ${
                      editorLangTab === "ur"
                        ? "border-[#0d3822] text-[#0d3822] bg-emerald-50/40"
                        : "border-transparent text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    <span>🇵🇰 اردو مواد (Urdu Story)</span>
                    {currentStory.headline_ur && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>}
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditorLangTab("en")}
                    className={`px-4 py-2 font-bold text-xs transition border-b-2 flex items-center gap-1.5 ${
                      editorLangTab === "en"
                        ? "border-[#0d3822] text-[#0d3822] bg-emerald-50/40"
                        : "border-transparent text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    <span>🇬🇧 English Edition Content</span>
                    {currentStory.headline_en && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>}
                  </button>
                </div>

                <span className="text-[11px] text-gray-500 font-sans hidden sm:inline">
                  {editorLangTab === "ur" ? "دائیں سے بائیں (RTL)" : "Left-to-Right (LTR)"}
                </span>
              </div>

              {/* Main Form Fields */}
              <form onSubmit={handleSaveCurrentStory} className="space-y-4 text-xs font-sans">
                
                {/* 1. Headline (Urdu / English) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-gray-900">
                      {editorLangTab === "ur" ? "خبر کی سرخی (Headline - Urdu) *" : "Story Headline (English) *"}
                    </label>
                    <span className="text-[10px] font-mono text-gray-500">
                      {editorLangTab === "ur" ? (currentStory.headline_ur || "").length : (currentStory.headline_en || "").length} {isUrdu ? "حروف" : "chars"}
                    </span>
                  </div>

                  {editorLangTab === "ur" ? (
                    <input
                      type="text"
                      dir="rtl"
                      required
                      value={currentStory.headline_ur}
                      onChange={(e) => setCurrentStory({ ...currentStory, headline_ur: e.target.value })}
                      placeholder="مثال: اسٹیٹ بینک کا بڑا فیصلہ، شرح سود میں استحکام برقرار رکھنے کی توثیق..."
                      className="w-full border-2 border-[#dcd8cd] focus:border-emerald-700 bg-white p-3 text-sm font-bold text-right font-urdu outline-none shadow-2xs leading-relaxed"
                    />
                  ) : (
                    <input
                      type="text"
                      dir="ltr"
                      value={currentStory.headline_en}
                      onChange={(e) => setCurrentStory({ ...currentStory, headline_en: e.target.value })}
                      placeholder="e.g. State Bank of Pakistan Announces Milestone Benchmark Rates..."
                      className="w-full border-2 border-[#dcd8cd] focus:border-emerald-700 bg-white p-3 text-sm font-bold outline-none font-sans shadow-2xs"
                    />
                  )}
                </div>

                {/* 2. Reporter / Byline with Quick Selection Chips */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-gray-900">
                      {editorLangTab === "ur" ? "رپورٹر / بائی لائن (Byline)" : "Reporter / Byline (English)"}
                    </label>
                    <span className="text-[10px] text-gray-500">
                      {isUrdu ? "فوری چپس پر کلک کریں:" : "Quick suggestions:"}
                    </span>
                  </div>

                  {editorLangTab === "ur" ? (
                    <input
                      type="text"
                      dir="rtl"
                      value={currentStory.byline_ur}
                      onChange={(e) => setCurrentStory({ ...currentStory, byline_ur: e.target.value })}
                      placeholder="اسلام آباد (خصوصی نامہ نگار)"
                      className="w-full border border-[#dcd8cd] focus:border-emerald-700 bg-white p-2 text-xs text-right font-urdu outline-none"
                    />
                  ) : (
                    <input
                      type="text"
                      dir="ltr"
                      value={currentStory.byline_en}
                      onChange={(e) => setCurrentStory({ ...currentStory, byline_en: e.target.value })}
                      placeholder="Islamabad (Special Correspondent)"
                      className="w-full border border-[#dcd8cd] focus:border-emerald-700 bg-white p-2 text-xs outline-none font-sans"
                    />
                  )}

                  {/* Byline Quick Chips */}
                  <div className="flex items-center gap-1.5 flex-wrap mt-1.5">
                    {quickBylines.map((qb, qIdx) => (
                      <button
                        key={qIdx}
                        type="button"
                        onClick={() => {
                          if (editorLangTab === "ur") {
                            setCurrentStory({ ...currentStory, byline_ur: qb.ur });
                          } else {
                            setCurrentStory({ ...currentStory, byline_en: qb.en });
                          }
                        }}
                        className="text-[10px] bg-[#f7f6f3] hover:bg-emerald-50 hover:text-emerald-900 border border-[#dcd8cd] px-2 py-0.5 font-sans transition cursor-pointer"
                      >
                        + {editorLangTab === "ur" ? qb.ur : qb.en}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. Short Excerpt / Broadsheet Kicker (with word count indicator) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="font-bold text-gray-900">
                      {editorLangTab === "ur" ? "مختصر خلاصہ (صفحے پر کالم کا پیش منظر)" : "Broadsheet Column Excerpt (2-3 sentences)"}
                    </label>
                    <span className="text-[10px] font-sans text-gray-500">
                      {getWordCount(editorLangTab === "ur" ? currentStory.excerpt_ur : currentStory.excerpt_en)} {isUrdu ? "الفاظ (کالم کے لیے بہترین)" : "words"}
                    </span>
                  </div>

                  {editorLangTab === "ur" ? (
                    <textarea
                      rows={2}
                      dir="rtl"
                      value={currentStory.excerpt_ur}
                      onChange={(e) => setCurrentStory({ ...currentStory, excerpt_ur: e.target.value })}
                      placeholder="اخبار کے فرنٹ پیج کالم پر دکھانے کے لیے ۲ سے ۳ بااثر جملے..."
                      className="w-full border border-[#dcd8cd] focus:border-emerald-700 bg-white p-2.5 text-xs text-right font-urdu outline-none leading-relaxed"
                    />
                  ) : (
                    <textarea
                      rows={2}
                      dir="ltr"
                      value={currentStory.excerpt_en}
                      onChange={(e) => setCurrentStory({ ...currentStory, excerpt_en: e.target.value })}
                      placeholder="Brief excerpt to show in the broadsheet column on the newspaper sheet..."
                      className="w-full border border-[#dcd8cd] focus:border-emerald-700 bg-white p-2.5 text-xs outline-none font-sans leading-relaxed"
                    />
                  )}
                </div>

                {/* 4. Full Article Body (Clipping Reader Modal Content) with Rich Formatting Toolbar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-gray-900 flex items-center gap-1.5">
                      <BookOpen size={13} className="text-emerald-700" />
                      <span>{editorLangTab === "ur" ? "مکمل اخباری متن (کلپنگ ریڈر کے لیے)" : "Full Story Body (In-Depth Clipping Content)"}</span>
                    </label>

                    {/* Formatting Toolbar */}
                    <div className="flex items-center bg-[#f7f6f3] border border-[#dcd8cd] p-0.5">
                      <button
                        type="button"
                        onClick={() => insertFormatting("**", "**")}
                        className="p-1 hover:bg-white text-gray-700"
                        title="Bold"
                      >
                        <Bold size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting("*", "*")}
                        className="p-1 hover:bg-white text-gray-700"
                        title="Italic"
                      >
                        <Italic size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting("\n> ", "\n")}
                        className="p-1 hover:bg-white text-gray-700"
                        title="Quote"
                      >
                        <Quote size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => insertFormatting("\n• ")}
                        className="p-1 hover:bg-white text-gray-700"
                        title="Bullet List"
                      >
                        <List size={12} />
                      </button>
                    </div>
                  </div>

                  {editorLangTab === "ur" ? (
                    <textarea
                      ref={contentTextareaRef}
                      rows={8}
                      dir="rtl"
                      value={currentStory.content_ur}
                      onChange={(e) => setCurrentStory({ ...currentStory, content_ur: e.target.value })}
                      placeholder="قاری جب اخبار کے کالم پر کلک کرے گا تو یہ مکمل تفصیلی مضمون کھل کر سامنے آئے گا۔ پیراگراف بنائیں اور تفصیل لکھیں..."
                      className="w-full border border-[#dcd8cd] focus:border-emerald-700 bg-white p-3 text-xs text-right font-urdu outline-none leading-loose shadow-inner"
                    />
                  ) : (
                    <textarea
                      ref={contentTextareaRef}
                      rows={8}
                      dir="ltr"
                      value={currentStory.content_en}
                      onChange={(e) => setCurrentStory({ ...currentStory, content_en: e.target.value })}
                      placeholder="Complete journalistic article body for the clipping reader modal. Supports in-depth investigative reports, quotes, and transcriptions..."
                      className="w-full border border-[#dcd8cd] focus:border-emerald-700 bg-white p-3 text-xs outline-none font-sans leading-relaxed shadow-inner"
                    />
                  )}
                </div>

                {/* 5. Story Photograph (Upload / URL) */}
                <div className="bg-[#fcfbf9] border border-[#dcd8cd] p-3 space-y-2">
                  <label className="font-bold text-gray-900 block text-xs">
                    {isUrdu ? "مضمون کی اخباری تصویر (اختیاری)" : "Story News Photograph (Optional)"}
                  </label>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={currentStory.image_url}
                      onChange={(e) => setCurrentStory({ ...currentStory, image_url: e.target.value })}
                      placeholder="https://... تصویر کا ویب ایڈریس یا فائل اپلوڈ کریں"
                      className="w-full border border-[#dcd8cd] bg-white p-2 text-xs outline-none font-sans"
                    />

                    <label className="bg-white border border-[#dcd8cd] hover:bg-gray-100 px-3 py-2 font-bold text-xs cursor-pointer flex items-center gap-1.5 shrink-0 transition">
                      <Upload size={13} />
                      <span>{uploading ? "..." : (isUrdu ? "کمپیوٹر سے اپلوڈ" : "Upload")}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "story_image")}
                        className="hidden"
                      />
                    </label>

                    {currentStory.image_url && (
                      <button
                        type="button"
                        onClick={() => setCurrentStory({ ...currentStory, image_url: "" })}
                        className="p-2 text-red-600 hover:bg-red-50 border border-red-200"
                        title="Remove image"
                      >
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  {currentStory.image_url && (
                    <div className="relative aspect-[16/7] max-w-sm border border-gray-300 bg-gray-100 overflow-hidden mt-2">
                      <Image
                        src={currentStory.image_url}
                        alt="Story preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Submit Action Bar */}
                <div className="flex items-center justify-between pt-3 border-t border-[#eceae3]">
                  <div className="text-[11px] text-gray-500 font-sans">
                    {isUrdu ? "تبدیلیاں خودکار طور پر لائیو براڈ شیٹ کے ساتھ مطابقت پذیر ہو جائیں گی" : "Changes sync immediately with the live broadsheet"}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 transition cursor-pointer shadow-xs disabled:opacity-50"
                    >
                      <Save size={14} />
                      <span>{saving ? (isUrdu ? "محفوظ ہو رہا ہے..." : "Saving...") : (isUrdu ? "مضمون محفوظ کریں (Save Story)" : "Save & Update Story")}</span>
                    </button>
                  </div>
                </div>

              </form>

            </div>

          </div>

        </div>
      )}

      {/* ============================================================== */}
      {/* MODE 2: THE ALL PAGES RACK & ARCHIVE OVERVIEW */}
      {/* ============================================================== */}
      {viewMode === "rack" && (
        <div className="space-y-4">
          
          {/* Filter Strip */}
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

            <button
              onClick={() => setNewPageModalOpen(true)}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3.5 py-1.5 flex items-center gap-1.5 transition"
            >
              <PlusCircle size={14} />
              <span>{isUrdu ? "نیا صفحہ ایڈیشن بنائیں" : "Create Page"}</span>
            </button>
          </div>

          {/* Editions Rack Grid */}
          {loading ? (
            <div className="p-12 text-center text-sm text-gray-500 font-sans">
              {isUrdu ? "ای پیپر صفحات لوڈ ہو رہے ہیں..." : "Loading ePaper editions..."}
            </div>
          ) : editions.length === 0 ? (
            <div className="p-12 text-center text-sm text-gray-500 bg-white border border-[#dcd8cd] rounded-none space-y-3">
              <p>{isUrdu ? "منتخب تاریخ کے لیے کوئی صفحہ شامل نہیں کیا گیا۔" : "No ePaper pages found for selected date & city."}</p>
              <button
                onClick={() => setNewPageModalOpen(true)}
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
                      onClick={() => handleSelectEdition(ed)}
                      className="inline-flex items-center gap-1.5 bg-[#0d3822] hover:bg-[#072415] text-white text-xs px-3 py-1.5 font-bold transition"
                    >
                      <PenTool size={12} />
                      <span>{isUrdu ? "اسٹوڈیو میں ایڈٹ کریں" : "Open in Studio"}</span>
                    </button>

                    <button
                      onClick={async () => {
                        if (!confirm(isUrdu ? "کیا آپ واقعی یہ صفحہ حذف کرنا چاہتے ہیں؟" : "Delete this page?")) return;
                        await fetch(`/api/epaper/${ed.id}`, { method: "DELETE" });
                        loadEditions();
                      }}
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

        </div>
      )}

      {/* ============================================================== */}
      {/* DRAWER / MODAL: PAGE LEVEL SETTINGS (Scan, PDF, Titles) */}
      {/* ============================================================== */}
      {pageSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#dcd8cd] max-w-xl w-full p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-[#eceae3] pb-3">
              <h3 className="text-base font-bold text-gray-950 urdu-headline flex items-center gap-2">
                <Settings size={16} className="text-emerald-700" />
                <span>{isUrdu ? `صفحہ ${pageFormData.page_number} کی سیٹنگز و اسکین` : `Page ${pageFormData.page_number} Settings`}</span>
              </h3>
              <button onClick={() => setPageSettingsOpen(false)} className="text-gray-400 hover:text-black p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePageSettings} className="space-y-4 text-xs font-sans">
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{isUrdu ? "تاریخ (Date)" : "Date"}</label>
                  <input
                    type="date"
                    required
                    value={pageFormData.edition_date}
                    onChange={(e) => setPageFormData({ ...pageFormData, edition_date: e.target.value })}
                    className="w-full border border-[#dcd8cd] p-2 bg-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">{isUrdu ? "صفحہ نمبر" : "Page Number"}</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={pageFormData.page_number}
                    onChange={(e) => setPageFormData({ ...pageFormData, page_number: e.target.value })}
                    className="w-full border border-[#dcd8cd] p-2 bg-white font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">{isUrdu ? "شہر ایڈیشن (City)" : "City Edition"}</label>
                <select
                  value={pageFormData.city_slug}
                  onChange={(e) => setPageFormData({ ...pageFormData, city_slug: e.target.value })}
                  className="w-full border border-[#dcd8cd] p-2 bg-white font-bold"
                >
                  {cities.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {isUrdu ? c.name_ur : c.name_en}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">{isUrdu ? "صفحے کا عنوان (اردو)" : "Page Title (Urdu)"}</label>
                <input
                  type="text"
                  dir="rtl"
                  value={pageFormData.page_title_ur}
                  onChange={(e) => setPageFormData({ ...pageFormData, page_title_ur: e.target.value })}
                  placeholder="صفحۂ اول (اہم سرخیاں)"
                  className="w-full border border-[#dcd8cd] p-2 font-urdu text-right"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 mb-1">{isUrdu ? "صفحے کا عنوان (انگریزی)" : "Page Title (English)"}</label>
                <input
                  type="text"
                  value={pageFormData.page_title_en}
                  onChange={(e) => setPageFormData({ ...pageFormData, page_title_en: e.target.value })}
                  placeholder="Front Page"
                  className="w-full border border-[#dcd8cd] p-2 font-sans"
                />
              </div>

              {/* Full Scan Image */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">{isUrdu ? "پورے صفحے کا اسکین (Scan Image)" : "Page Scan Image"}</label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    value={pageFormData.page_image}
                    onChange={(e) => setPageFormData({ ...pageFormData, page_image: e.target.value })}
                    placeholder="https://..."
                    className="w-full border border-[#dcd8cd] p-2 text-xs"
                  />
                  <label className="bg-[#f7f6f3] border border-[#dcd8cd] hover:bg-gray-100 px-3 py-2 font-bold text-xs cursor-pointer flex items-center gap-1 shrink-0">
                    <Upload size={13} />
                    <span>{uploading ? "..." : (isUrdu ? "فائل" : "File")}</span>
                    <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, "page_image")} className="hidden" />
                  </label>
                </div>
              </div>

              {/* PDF URL */}
              <div>
                <label className="block font-bold text-gray-700 mb-1">{isUrdu ? "مکمل ایڈیشن PDF ڈاؤنلوڈ لنک" : "Full Edition PDF URL"}</label>
                <input
                  type="text"
                  value={pageFormData.pdf_url}
                  onChange={(e) => setPageFormData({ ...pageFormData, pdf_url: e.target.value })}
                  placeholder="https://... روزنامہ کا مکمل PDF ایڈیشن"
                  className="w-full border border-[#dcd8cd] p-2 text-xs font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#eceae3]">
                <button
                  type="button"
                  onClick={() => setPageSettingsOpen(false)}
                  className="px-4 py-2 border border-[#dcd8cd] bg-white text-gray-700 font-bold"
                >
                  {isUrdu ? "منسوخ" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#0d3822] hover:bg-[#072415] text-white font-bold"
                >
                  {saving ? (isUrdu ? "محفوظ ہو رہا ہے..." : "Saving...") : (isUrdu ? "سیٹنگز محفوظ کریں" : "Save Settings")}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL: ADD NEW PAGE EDITION */}
      {/* ============================================================== */}
      {newPageModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#dcd8cd] max-w-lg w-full p-6 shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-[#eceae3] pb-3">
              <h3 className="text-base font-bold text-gray-950 urdu-headline flex items-center gap-2">
                <PlusCircle size={16} className="text-emerald-700" />
                <span>{isUrdu ? "نیا ای پیپر صفحہ ایڈیشن بنائیں" : "Create New ePaper Page"}</span>
              </h3>
              <button onClick={() => setNewPageModalOpen(false)} className="text-gray-400 hover:text-black p-1">
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSaving(true);
                try {
                  const nextPageNum = editions.length > 0 ? Math.max(...editions.map((x) => Number(x.page_number) || 1)) + 1 : 1;
                  const newPage = {
                    edition_date: selectedDate || today,
                    city_slug: selectedCity !== "all" ? selectedCity : "islamabad",
                    city_name_ur: "اسلام آباد / راولپنڈی",
                    city_name_en: "Islamabad / Rawalpindi",
                    page_number: nextPageNum,
                    page_title_ur: `صفحہ نمبر ${nextPageNum}`,
                    page_title_en: `Page ${nextPageNum}`,
                    page_image: "",
                    pdf_url: "",
                    stories: [
                      {
                        id: `s-${Date.now()}`,
                        position: "lead",
                        headline_ur: "",
                        headline_en: "",
                        byline_ur: "اسلام آباد (خصوصی نامہ نگار)",
                        byline_en: "Islamabad (Special Correspondent)",
                        excerpt_ur: "",
                        excerpt_en: "",
                        content_ur: "",
                        content_en: "",
                        image_url: "",
                      },
                    ],
                    is_active: true,
                  };

                  const res = await fetch("/api/epaper", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newPage),
                  });

                  if (res.ok) {
                    const saved = await res.json();
                    showNotice(isUrdu ? "نیا صفحہ شامل ہو گیا!" : "New page created!");
                    setNewPageModalOpen(false);
                    loadEditions(nextPageNum);
                  }
                } catch (err) {
                  console.error(err);
                } finally {
                  setSaving(false);
                }
              }}
              className="space-y-4 text-xs font-sans"
            >
              <p className="text-gray-600">
                {isUrdu
                  ? "اس تاریخ اور شہر کے لیے اگلا ای پیپر صفحہ خودکار طور پر لیڈ اسٹوری سلاٹ کے ساتھ بن جائے گا اور آپ فوراً اس پر مضامین لکھ سکیں گے۔"
                  : "The next page number for this date and city will be created with an initial lead story slot so you can start writing immediately."}
              </p>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#eceae3]">
                <button
                  type="button"
                  onClick={() => setNewPageModalOpen(false)}
                  className="px-4 py-2 border border-[#dcd8cd] bg-white text-gray-700 font-bold"
                >
                  {isUrdu ? "منسوخ" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold"
                >
                  {saving ? (isUrdu ? "تخلیق ہو رہا ہے..." : "Creating...") : (isUrdu ? "صفحہ بنائیں اور اسٹوڈیو کھولیں" : "Create Page & Open Studio")}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
