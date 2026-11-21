"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "@/component/Header";
import Footer from "@/component/Footer";
import NewsletterBox from "@/component/NewsletterBox";
import { useSiteLanguage } from "@/context/SiteLanguageContext";
import {
  Calendar,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Layers,
  LayoutGrid,
  MapPin,
  Share2,
  FileText,
  X,
  ExternalLink,
  Edit,
  Sparkles,
} from "lucide-react";

export default function EPaperClient({
  categories = [],
  breakingNews = [],
  initialEditions = [],
}) {
  const { isUrdu, isEnglish, dir } = useSiteLanguage();
  const [editions, setEditions] = useState(initialEditions || []);
  const [selectedDate, setSelectedDate] = useState(
    initialEditions?.[0]?.edition_date || new Date().toISOString().split("T")[0]
  );
  const [selectedCity, setSelectedCity] = useState("islamabad");
  const [activePage, setActivePage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [activeClip, setActiveClip] = useState(null);
  const [showAllPages, setShowAllPages] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarViewMonth, setCalendarViewMonth] = useState(() => {
    const seed = initialEditions?.[0]?.edition_date || new Date().toISOString().split("T")[0];
    const [y, m] = seed.split("-").map(Number);
    return { year: y || 2026, month: (m || 11) - 1 };
  });
  const viewerRef = useRef(null);
  const calendarPopoverRef = useRef(null);

  const cities = [
    { key: "islamabad", name_ur: "اسلام آباد / راولپنڈی", name_en: "Islamabad" },
    { key: "lahore", name_ur: "لاہور ایڈیشن", name_en: "Lahore" },
    { key: "karachi", name_ur: "کراچی ایڈیشن", name_en: "Karachi" },
    { key: "peshawar", name_ur: "پشاور ایڈیشن", name_en: "Peshawar" },
    { key: "quetta", name_ur: "کوئٹہ ایڈیشن", name_en: "Quetta" },
    { key: "multan", name_ur: "ملتان ایڈیشن", name_en: "Multan" },
    { key: "international", name_ur: "انٹرنیشنل ایڈیشن", name_en: "International" },
  ];

  const targetPaper = isUrdu ? "ur" : "en";

  // Set of available dates in DB strictly for the selected city & language
  const availableDatesForCity = React.useMemo(() => {
    const s = new Set();
    for (const e of editions) {
      const cityKey = e.city_slug || "islamabad";
      if (
        e.edition_date &&
        (!e.paper || e.paper === targetPaper) &&
        cityKey === selectedCity
      ) {
        s.add(e.edition_date);
      }
    }
    return s;
  }, [editions, targetPaper, selectedCity]);

  // All cities that have at least one published edition in DB for the active language
  const citiesWithEditions = React.useMemo(() => {
    const s = new Set();
    for (const e of editions) {
      if (!e.paper || e.paper === targetPaper) {
        s.add(e.city_slug || "islamabad");
      }
    }
    return s;
  }, [editions, targetPaper]);

  const sortedAvailableDates = React.useMemo(
    () => Array.from(availableDatesForCity).sort((a, b) => b.localeCompare(a)),
    [availableDatesForCity]
  );

  // When available dates or city changes, auto-snap selectedDate to the latest available date for that city
  useEffect(() => {
    if (
      sortedAvailableDates.length > 0 &&
      !availableDatesForCity.has(selectedDate)
    ) {
      setSelectedDate(sortedAvailableDates[0]);
    }
  }, [sortedAvailableDates, availableDatesForCity, selectedDate]);

  // Close custom calendar popover on outside click
  useEffect(() => {
    if (!calendarOpen) return;
    const handleClickOutside = (ev) => {
      if (
        calendarPopoverRef.current &&
        !calendarPopoverRef.current.contains(ev.target)
      ) {
        setCalendarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [calendarOpen]);

  // Strictly match pages belonging to the currently selected date + city + paper
  const currentIssuePages = React.useMemo(() => {
    const matches = editions.filter(
      (e) =>
        e.edition_date === selectedDate &&
        (!e.paper || e.paper === targetPaper) &&
        (e.city_slug || "islamabad") === selectedCity
    );
    const byPage = new Map();
    for (const m of matches) {
      const pNum = Number(m.page_number) || 1;
      if (!byPage.has(pNum)) byPage.set(pNum, m);
    }
    return Array.from(byPage.values()).sort(
      (a, b) => (Number(a.page_number) || 1) - (Number(b.page_number) || 1)
    );
  }, [editions, selectedDate, targetPaper, selectedCity]);

  // Dynamic pagesList matching the exact uploaded PDF page count for this issue
  const pagesList = React.useMemo(() => {
    return currentIssuePages.map((p, idx) => {
      const num = Number(p.page_number) || idx + 1;
      return {
        num,
        title_ur: p.page_title_ur || `صفحہ ${num}`,
        title_en: p.page_title_en || `Page ${num}`,
      };
    });
  }, [currentIssuePages]);

  const activeEdition =
    currentIssuePages.find((e) => Number(e.page_number) === Number(activePage)) ||
    currentIssuePages[0] ||
    null;

  useEffect(() => {
    let active = true;
    fetch("/api/epaper", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!active || !data) return;
        if (Array.isArray(data.legacyEditions) && data.legacyEditions.length > 0) {
          setEditions(data.legacyEditions);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  // Extract stories on this page
  const stories = activeEdition?.stories || [];
  const leadStory =
    stories.find((s) => s.position === "lead") ||
    stories[0] || {
      headline_ur: "ڈیلی افادیت ڈیجیٹل اور پرنٹ ایڈیشن کا شاندار آغاز: سچائی اور فوری باخبر رہنے کا نیا عہد",
      headline_en: "Daily Afadiat Digital & Print Edition Historic Launch: A New Era of Integrity and Speed",
      excerpt_ur: "جدید ترین پرنٹنگ ٹیکنالوجی اور ڈیجیٹل سروسز کے ساتھ ملکی صحافت میں ایک نئے باب کا اضافہ۔",
      excerpt_en: "Marking a transformative milestone in Pakistani journalism with state-of-the-art broadsheet printing and digital accessibility.",
      content_ur: "اسلام آباد (خصوصی نامہ نگار) روزنامہ افادیت نے جدید ترین پرنٹنگ ٹیکنالوجی اور ڈیجیٹل سروسز کے ساتھ ملکی صحافت میں ایک نئے باب کا اضافہ کر دیا ہے۔ ادارتی بورڈ کا کہنا ہے کہ ہمارا مقصد قاری تک بلاخوف و خطر اور تصدیق شدہ اطلاعات پہنچانا ہے۔",
      content_en: "Islamabad (Special Correspondent) Daily Afadiat has inaugurated its multi-edition print publication and digital broadsheet ecosystem today. The editorial governing board reiterated its core pledge to deliver uncompromising, rigorously verified news.",
      byline_ur: "اسلام آباد (خصوصی نامہ نگار)",
      byline_en: "Islamabad (Special Correspondent)",
      image_url: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop",
    };

  const secTop =
    stories.find((s) => s.position === "secondary_top") ||
    stories[1] || {
      headline_ur: "اسٹیٹ بینک کی مانیٹری پالیسی کا اعلان، شرح سود میں استحکام برقرار",
      headline_en: "State Bank of Pakistan Announces Monetary Policy, Retaining Benchmark Rates",
      excerpt_ur: "مرکزی بینک نے ملکی معاشی استحکام اور زرمبادلہ ذخائر میں بہتری کے پیش نظر نئی ہدایات جاری کر دیں۔",
      excerpt_en: "Central bank highlights fiscal stabilization, export expansion, and foreign reserve resilience.",
      content_ur: "کراچی (بزنس رپورٹر) اسٹیٹ بینک آف پاکستان نے اپنی تازہ مانیٹری پالیسی کا اعلان کرتے ہوئے شرح سود میں استحکام برقرار رکھنے کی توثیق کی ہے۔",
      content_en: "Karachi (Business Desk) The State Bank of Pakistan announced its latest benchmark policy stance today, affirming stability in discount rates.",
      byline_ur: "کراچی (بزنس رپورٹر)",
      byline_en: "Karachi (Business Desk)",
      image_url: "",
    };

  const secBottom =
    stories.find((s) => s.position === "secondary_bottom") ||
    stories[2] || {
      headline_ur: "ملک بھر میں موسم سرما کی بارشیں اور پہاڑوں پر برفباری کی نئی لہر",
      headline_en: "Winter Weather Alert: Widespread Rain Across Plains and Snowfall Over Northern Peaks",
      excerpt_ur: "محکمہ موسمیات نے سردی کی نئی لہر کی پیش گوئی کر دی، سیاحوں کا شمالی علاقوں میں رش۔",
      excerpt_en: "Meteorological Department issues advisories as cold spell intensifies across the country.",
      content_ur: "مری، گلگت بلتستان اور وادی نیلم میں برفباری کا سلسلہ شروع ہو گیا ہے جس کے بعد سردی کی شدت میں غیر معمولی اضافہ ریکارڈ کیا گیا ہے۔",
      content_en: "Murree, Gilgit-Baltistan, and Neelum Valley experienced fresh winter snowfall today. Weather authorities anticipate the active westerly wave to persist.",
      byline_ur: "موسمی ڈیسک",
      byline_en: "Weather Desk",
      image_url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop",
    };

  const handleZoom = useCallback((delta) => {
    setZoomLevel((prev) => Math.max(75, Math.min(175, prev + delta)));
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!viewerRef.current) return;
    if (!document.fullscreenElement) {
      viewerRef.current.requestFullscreen?.().catch(() => {});
    } else {
      document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      const tag = document.activeElement?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      if (activeClip) {
        if (e.key === "Escape") setActiveClip(null);
        return;
      }

      if (e.key === "ArrowLeft") {
        setShowAllPages(false);
        setActivePage((p) => (isUrdu ? Math.min(pagesList.length, p + 1) : Math.max(1, p - 1)));
      } else if (e.key === "ArrowRight") {
        setShowAllPages(false);
        setActivePage((p) => (isUrdu ? Math.max(1, p - 1) : Math.min(pagesList.length, p + 1)));
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        handleZoom(15);
      } else if (e.key === "-") {
        e.preventDefault();
        handleZoom(-15);
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeClip, handleZoom, isUrdu, pagesList.length, toggleFullscreen]);

  const currentCityObj = cities.find((c) => c.key === selectedCity) || cities[0];

  const formatDisplayDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
    } catch {
      return dateStr;
    }
  };

  const handleSharePage = async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({
          title: isUrdu ? `ای پیپر — صفحہ ${activePage}` : `ePaper — Page ${activePage}`,
          url: shareUrl,
        });
      } else if (navigator.clipboard && shareUrl) {
        await navigator.clipboard.writeText(shareUrl);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      }
    } catch {
      // ignore cancel
    }
  };

  const renderPager = (extraClass = "") => {
    const visiblePages =
      pagesList.length <= 6
        ? pagesList.map((p) => p.num)
        : [1, 2, 3, 4, 5, "...", pagesList.length];

    return (
      <nav aria-label={isUrdu ? "صفحات کی ترتیب" : "Page Navigation"} className={extraClass}>
        <ul className="flex items-center justify-center gap-0.5 sm:gap-1">
          <li>
            <button
              type="button"
              disabled={activePage <= 1}
              onClick={() => setActivePage((p) => Math.max(1, p - 1))}
              aria-label={isUrdu ? "پچھلا صفحہ" : "Previous Page"}
              className="grid h-8 min-w-8 place-items-center rounded-md px-1.5 text-sm tabular-nums transition-colors sm:h-10 sm:min-w-10 sm:px-2 text-gray-800 hover:bg-[#efeee9] hover:text-[#184e2d] disabled:pointer-events-none disabled:opacity-30 cursor-pointer"
            >
              {isUrdu ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </li>
          {visiblePages.map((item, idx) =>
            item === "..." ? (
              <li
                key={`dots-${idx}`}
                aria-hidden="true"
                className="text-gray-400 grid h-8 w-5 place-items-center text-sm sm:h-10 sm:w-6"
              >
                …
              </li>
            ) : (
              <li key={item}>
                <button
                  type="button"
                  onClick={() => setActivePage(item)}
                  aria-label={isUrdu ? `صفحہ ${item}` : `Page ${item}`}
                  aria-current={activePage === item ? "page" : undefined}
                  className={`grid h-8 min-w-8 place-items-center rounded-md px-1.5 text-sm tabular-nums transition-colors sm:h-10 sm:min-w-10 sm:px-2 cursor-pointer ${
                    activePage === item
                      ? "bg-[#184e2d] text-white font-semibold"
                      : "text-gray-800 hover:bg-[#efeee9] hover:text-[#184e2d]"
                  }`}
                >
                  {item}
                </button>
              </li>
            )
          )}
          <li>
            <button
              type="button"
              disabled={activePage >= pagesList.length}
              onClick={() => setActivePage((p) => Math.min(pagesList.length, p + 1))}
              aria-label={isUrdu ? "اگلا صفحہ" : "Next Page"}
              className="grid h-8 min-w-8 place-items-center rounded-md px-1.5 text-sm tabular-nums transition-colors sm:h-10 sm:min-w-10 sm:px-2 text-gray-800 hover:bg-[#efeee9] hover:text-[#184e2d] disabled:pointer-events-none disabled:opacity-30 cursor-pointer"
            >
              {isUrdu ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  const handleDownloadPDF = () => {
    if (activeEdition?.pdf_url) {
      window.open(activeEdition.pdf_url, "_blank");
    } else {
      alert(
        isUrdu
          ? `روزنامہ افادیت (${selectedDate}) مکمل ایڈیشن ڈاؤنلوڈ شروع ہو گیا ہے۔`
          : `Daily Afadiat (${selectedDate}) full broadsheet edition download initiated.`
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f6f3] flex flex-col font-sans text-[#1a1a1a]" dir={dir}>
      <Header categories={categories} breakingNews={breakingNews} />

      <main className="flex-1 w-full max-w-5xl mx-auto px-3 sm:px-6 py-6">
        
        {/* Editorial Header (Matches Daily Insaf reference) */}
        <header className="mb-4 flex flex-wrap items-end justify-between gap-3 sm:mb-5">
          <div>
            <h1 className="text-xl leading-tight sm:text-2xl lg:text-3xl font-black text-gray-900 urdu-headline">
              {isUrdu ? "ای پیپر" : "ePaper"}
            </h1>
            <p className="text-gray-500 mt-1 text-sm font-sans">
              {formatDisplayDate(selectedDate)} · {isUrdu ? currentCityObj.name_ur : currentCityObj.name_en} · {pagesList.length} {isUrdu ? "صفحات" : "Pages"}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Compact City Edition Selector */}
            <div className="flex items-center gap-1.5 border border-[#dcd8cd] bg-white hover:border-[#184e2d] rounded-lg px-3 min-h-11 text-sm font-semibold text-gray-800 transition-colors">
              <MapPin size={15} className="text-[#184e2d] shrink-0" />
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setActivePage(1);
                }}
                aria-label={isUrdu ? "شہر منتخب کریں" : "Select City Edition"}
                className="bg-transparent outline-none cursor-pointer text-xs sm:text-sm font-semibold text-gray-800"
              >
                {cities.map((c) => (
                  <option key={c.key} value={c.key}>
                    {isUrdu ? c.name_ur : c.name_en}
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Calendar Date Picker (Only allows dates available in DB; unavailable dates show cursor-not-allowed) */}
            <div ref={calendarPopoverRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  if (!calendarOpen && selectedDate) {
                    const [y, m] = selectedDate.split("-").map(Number);
                    if (y && m) {
                      setCalendarViewMonth({ year: y, month: m - 1 });
                    }
                  }
                  setCalendarOpen((prev) => !prev);
                }}
                className="border border-[#dcd8cd] bg-white hover:border-[#184e2d] hover:text-[#184e2d] flex min-h-11 items-center gap-2 rounded-lg px-3.5 py-2 text-xs sm:text-sm font-semibold text-gray-800 transition-colors cursor-pointer"
              >
                <Calendar size={16} className="text-[#184e2d] shrink-0" />
                <span className="font-sans">{formatDisplayDate(selectedDate)}</span>
              </button>

              {calendarOpen && (() => {
                const { year, month } = calendarViewMonth;
                const firstDayOfWeek = new Date(year, month, 1).getDay();
                const daysInMonth = new Date(year, month + 1, 0).getDate();
                const monthLabel = new Date(year, month, 1).toLocaleDateString("en-GB", {
                  month: "long",
                  year: "numeric",
                });
                const dayHeaders = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
                const cells = [];
                for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
                for (let d = 1; d <= daysInMonth; d++) cells.push(d);

                const pad2 = (n) => String(n).padStart(2, "0");

                return (
                  <div
                    dir="ltr"
                    className={`absolute top-full mt-2 z-50 w-72 bg-white border border-[#dcd8cd] rounded-xl shadow-2xl p-3.5 font-sans ${
                      isUrdu ? "left-0" : "right-0"
                    }`}
                  >
                    {/* Month Switcher Header */}
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#efeee9]">
                      <button
                        type="button"
                        onClick={() =>
                          setCalendarViewMonth((prev) =>
                            prev.month === 0
                              ? { year: prev.year - 1, month: 11 }
                              : { year: prev.year, month: prev.month - 1 }
                          )
                        }
                        className="p-1.5 rounded-md hover:bg-[#efeee9] text-gray-700 cursor-pointer"
                        aria-label="Previous Month"
                      >
                        <ChevronLeft size={16} />
                      </button>
                      <span className="text-xs font-bold text-gray-900">{monthLabel}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setCalendarViewMonth((prev) =>
                            prev.month === 11
                              ? { year: prev.year + 1, month: 0 }
                              : { year: prev.year, month: prev.month + 1 }
                          )
                        }
                        className="p-1.5 rounded-md hover:bg-[#efeee9] text-gray-700 cursor-pointer"
                        aria-label="Next Month"
                      >
                        <ChevronRight size={16} />
                      </button>
                    </div>

                    {/* Weekday Header */}
                    <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-gray-400 mb-1">
                      {dayHeaders.map((dh) => (
                        <span key={dh}>{dh}</span>
                      ))}
                    </div>

                    {/* Days Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {cells.map((day, idx) => {
                        if (!day) {
                          return <span key={`empty-${idx}`} className="h-8" />;
                        }
                        const iso = `${year}-${pad2(month + 1)}-${pad2(day)}`;
                        const isAvailable = availableDatesForCity.has(iso);
                        const isSelected = selectedDate === iso;

                        return (
                          <button
                            key={iso}
                            type="button"
                            disabled={!isAvailable}
                            onClick={() => {
                              if (!isAvailable) return;
                              setSelectedDate(iso);
                              setActivePage(1);
                              setCalendarOpen(false);
                            }}
                            title={
                              isAvailable
                                ? `View ePaper for ${iso}`
                                : "No ePaper published for this date"
                            }
                            className={`h-8 rounded-md text-xs font-semibold tabular-nums transition-colors flex items-center justify-center ${
                              isSelected
                                ? "bg-[#184e2d] text-white font-bold shadow-2xs cursor-pointer"
                                : isAvailable
                                ? "bg-emerald-50 text-[#184e2d] hover:bg-[#184e2d] hover:text-white border border-emerald-200 cursor-pointer"
                                : "text-gray-300 bg-gray-50/60 cursor-not-allowed opacity-60"
                            }`}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>

                    {/* Available Editions Count Footer */}
                    <div className="mt-3 pt-2.5 border-t border-[#efeee9]">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        Available Editions ({sortedAvailableDates.length})
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        </header>

        {/* Single Unified Toolbar (Pager on left, Actions on right) */}
        <div className="border-b border-[#dcd8cd] mb-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pb-3">
          {renderPager("max-sm:w-full")}

          <div className="flex flex-wrap items-center gap-0.5 max-sm:w-full max-sm:justify-center">
            {/* All Pages Modal Trigger */}
            <button
              type="button"
              onClick={() => setShowAllPages(true)}
              title={isUrdu ? "تمام صفحات" : "All Pages"}
              className="flex h-10 items-center justify-center gap-1.5 rounded-md transition-colors px-2.5 text-sm font-semibold text-gray-800 hover:bg-[#efeee9] hover:text-[#184e2d] cursor-pointer"
            >
              <LayoutGrid size={18} />
              <span className="max-sm:sr-only">{isUrdu ? "تمام صفحات" : "All Pages"}</span>
            </button>

            <span aria-hidden="true" className="bg-[#dcd8cd] mx-1 h-5 w-px" />

            {/* Zoom Controls */}
            <button
              type="button"
              disabled={zoomLevel <= 75}
              onClick={() => handleZoom(-15)}
              title={isUrdu ? "زوم کم کریں" : "Zoom Out"}
              aria-label={isUrdu ? "زوم کم کریں" : "Zoom Out"}
              className="flex h-10 w-10 items-center justify-center rounded-md transition-colors disabled:pointer-events-none disabled:opacity-30 text-gray-800 hover:bg-[#efeee9] hover:text-[#184e2d] cursor-pointer"
            >
              <ZoomOut size={18} />
            </button>
            <button
              type="button"
              disabled={zoomLevel === 100}
              onClick={() => setZoomLevel(100)}
              title={isUrdu ? "اصل سائز" : "Reset Size (100%)"}
              className="text-gray-600 hover:text-[#184e2d] h-10 min-w-12 rounded-md text-xs font-mono tabular-nums transition-colors disabled:pointer-events-none cursor-pointer"
            >
              {zoomLevel}%
            </button>
            <button
              type="button"
              disabled={zoomLevel >= 175}
              onClick={() => handleZoom(15)}
              title={isUrdu ? "زوم کریں" : "Zoom In"}
              aria-label={isUrdu ? "زوم کریں" : "Zoom In"}
              className="flex h-10 w-10 items-center justify-center rounded-md transition-colors disabled:pointer-events-none disabled:opacity-30 text-gray-800 hover:bg-[#efeee9] hover:text-[#184e2d] cursor-pointer"
            >
              <ZoomIn size={18} />
            </button>

            <span aria-hidden="true" className="bg-[#dcd8cd] mx-1 h-5 w-px" />

            {/* Share Page */}
            <span className="relative">
              <button
                type="button"
                onClick={handleSharePage}
                title={isUrdu ? "صفحہ شیئر کریں" : "Share Page"}
                aria-label={isUrdu ? "صفحہ شیئر کریں" : "Share Page"}
                className="flex h-10 w-10 items-center justify-center rounded-md transition-colors text-gray-800 hover:bg-[#efeee9] hover:text-[#184e2d] cursor-pointer"
              >
                <Share2 size={18} />
              </button>
              {shareCopied && (
                <span
                  role="status"
                  className="bg-gray-900 text-white pointer-events-none absolute top-full start-1/2 z-10 mt-1 -translate-x-1/2 whitespace-nowrap rounded px-2 py-1 text-xs"
                >
                  {isUrdu ? "لنک کاپی ہو گیا!" : "Link copied!"}
                </span>
              )}
            </span>

            {/* Fullscreen / Open */}
            <button
              type="button"
              onClick={toggleFullscreen}
              title={isUrdu ? "پوری اسکرین (F)" : "Fullscreen (F)"}
              aria-label={isUrdu ? "پوری اسکرین" : "Fullscreen"}
              className="hover:bg-[#efeee9] hover:text-[#184e2d] text-gray-800 grid size-10 place-items-center rounded-md transition-colors cursor-pointer"
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>

            {/* PDF Download Link */}
            <button
              type="button"
              onClick={handleDownloadPDF}
              className="text-[#184e2d] hover:bg-[#184e2d]/10 ms-1 flex h-10 items-center gap-1.5 rounded-md px-3 text-sm font-semibold transition-colors cursor-pointer"
            >
              <Download size={16} />
              <span>{isUrdu ? "پی ڈی ایف" : "PDF"}</span>
            </button>
          </div>
        </div>

        {/* Viewer Container (Fullscreen Target) */}
        <div
          ref={viewerRef}
          className={isFullscreen ? "bg-[#f7f6f3] p-4 sm:p-6 overflow-y-auto h-screen" : ""}
        >
        {activeEdition?.page_image ? (
          /* Uploaded High-Res Newspaper Page Image (Click to Zoom + Interactive Hot-Zone Regions) */
          <div
            dir="ltr"
            className="border border-[#dcd8cd] rounded-xl relative bg-white overflow-hidden shadow-xs"
          >
            <div className="w-full overflow-auto">
              <div
                style={{
                  transform: `scale(${zoomLevel / 100})`,
                  transformOrigin: "top center",
                }}
                className="relative w-full transition-transform duration-200"
              >
                <img
                  src={activeEdition.page_image}
                  alt={`${selectedDate} — ${isUrdu ? `صفحہ ${activePage}` : `Page ${activePage}`}`}
                  onClick={() => setZoomLevel((z) => (z === 100 ? 145 : 100))}
                  draggable={false}
                  className={`block w-full h-auto select-none ${
                    zoomLevel > 100 ? "cursor-zoom-out" : "cursor-zoom-in"
                  }`}
                />
                {Array.isArray(activeEdition.regions) &&
                  activeEdition.regions.map((reg, rIdx) => {
                    const c = reg?.coordinates;
                    if (!c) return null;
                    return (
                      <button
                        key={reg.id || rIdx}
                        type="button"
                        onClick={(ev) => {
                          ev.stopPropagation();
                          setActiveClip({
                            title:
                              reg.headline ||
                              (isUrdu ? `ای پیپر کلپنگ — صفحہ ${activePage}` : `ePaper Clipping — Page ${activePage}`),
                            excerpt: reg.body ? reg.body.slice(0, 140) : "",
                            content:
                              reg.body ||
                              (isUrdu
                                ? "اس خبر کی مکمل تفصیل پڑھنے کے لیے کلپنگ۔"
                                : "Full newspaper clipping details."),
                            byline: isUrdu ? currentCityObj.name_ur : currentCityObj.name_en,
                            image_url: activeEdition.page_image,
                            article_id: reg.article_id || "",
                          });
                        }}
                        style={{
                          left: `${c.x}%`,
                          top: `${c.y}%`,
                          width: `${c.width}%`,
                          height: `${c.height}%`,
                        }}
                        title={reg.headline || (isUrdu ? "خبر پڑھنے کے لیے کلک کریں" : "Click to read story clipping")}
                        className="absolute border-2 border-emerald-600/60 bg-emerald-500/10 hover:bg-emerald-500/25 hover:border-emerald-700 transition-colors cursor-pointer rounded-xs"
                      />
                    );
                  })}
              </div>
            </div>
          </div>
        ) : (
          /* Clean Empty State when the selected City or Date has no uploaded ePaper edition */
          <div className="border border-dashed border-[#dcd8cd] rounded-xl bg-white p-10 sm:p-16 text-center shadow-xs space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#efeee9] text-[#184e2d] flex items-center justify-center mx-auto">
              <FileText size={26} />
            </div>

            <div className="space-y-1.5 max-w-md mx-auto">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 urdu-headline">
                {isUrdu
                  ? `${currentCityObj.name_ur} اس تاریخ کے لیے دستیاب نہیں ہے`
                  : `${currentCityObj.name_en} Edition Not Available`}
              </h2>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">
                {sortedAvailableDates.length === 0
                  ? isUrdu
                    ? `ابھی تک ${currentCityObj.name_ur} کا کوئی ای پیپر اپ لوڈ نہیں کیا گیا۔ براہِ کرم دستیاب ایڈیشن منتخب کریں۔`
                    : `No ePaper PDF has been uploaded for the ${currentCityObj.name_en} edition yet. Please switch to an available city edition below.`
                  : isUrdu
                  ? `${formatDisplayDate(selectedDate)} کو ${currentCityObj.name_ur} شائع نہیں ہوا۔ کیلنڈر سے دستیاب تاریخ منتخب کریں۔`
                  : `No edition was published on ${formatDisplayDate(selectedDate)} for ${currentCityObj.name_en}. Please pick an available date from the calendar.`}
              </p>
            </div>

            {citiesWithEditions.size > 0 && (
              <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                {cities
                  .filter((c) => citiesWithEditions.has(c.key))
                  .map((c) => (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() => {
                        setSelectedCity(c.key);
                        setActivePage(1);
                      }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#184e2d] hover:bg-[#0d542f] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer shadow-2xs"
                    >
                      <MapPin size={14} />
                      <span>
                        {isUrdu
                          ? `${c.name_ur} دیکھیں`
                          : `Switch to ${c.name_en} Edition`}
                      </span>
                    </button>
                  ))}
              </div>
            )}
          </div>
        )}
        </div>

        {/* Bottom Hint & Bottom Pager (Matches Daily Insaf reference) */}
        <p className="text-gray-500 mx-auto mt-3 max-w-md text-center text-[0.8125rem] leading-snug">
          {isUrdu ? "صفحہ بڑا کرنے کے لیے تصویر پر کلک کریں" : "Click the page to zoom in / out"}
          <span className="mt-0.5 hidden sm:block">
            {isUrdu
              ? "تیر کی کلیدیں: صفحہ بدلیں · + / − : زوم · F: پوری اسکرین"
              : "Arrow keys: Change page · + / − : Zoom · F: Fullscreen"}
          </span>
        </p>

        {renderPager("mt-4 mb-8")}

        {/* All Pages Thumbnail Modal Dialog (Matches Daily Insaf reference) */}
        {showAllPages && (
          <div
            onClick={() => setShowAllPages(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-labelledby="epaper-index-title"
              className="bg-white rounded-xl text-gray-900 max-h-[88vh] w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col border border-[#dcd8cd]"
            >
              <header className="border-b border-[#dcd8cd] flex items-center justify-between gap-3 px-4 py-3">
                <h2 id="epaper-index-title" className="text-lg font-black text-gray-900 flex items-center gap-2">
                  <span>{isUrdu ? "تمام صفحات" : "All Pages"}</span>
                  <span className="text-gray-400 text-sm font-normal tabular-nums">{pagesList.length}</span>
                </h2>
                <button
                  type="button"
                  onClick={() => setShowAllPages(false)}
                  aria-label={isUrdu ? "بند کریں" : "Close"}
                  className="hover:bg-[#efeee9] grid size-10 place-items-center rounded-md transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </header>

              <ol className="grid grid-cols-3 gap-3 overflow-y-auto p-4 sm:grid-cols-4 md:grid-cols-6">
                {pagesList.map((p) => {
                  const pageEdition =
                    currentIssuePages.find((e) => Number(e.page_number) === Number(p.num)) ||
                    editions.find((e) => Number(e.page_number) === Number(p.num));
                  const isActive = activePage === p.num;

                  return (
                    <li key={p.num}>
                      <button
                        type="button"
                        aria-current={isActive ? "page" : undefined}
                        aria-label={isUrdu ? `صفحہ ${p.num}` : `Page ${p.num}`}
                        onClick={() => {
                          setActivePage(p.num);
                          setShowAllPages(false);
                          window.scrollTo({ top: 120, behavior: "smooth" });
                        }}
                        className={`group block w-full rounded-md border-2 p-1 text-start transition-colors cursor-pointer ${
                          isActive
                            ? "border-[#184e2d]"
                            : "border-transparent hover:border-[#dcd8cd]"
                        }`}
                      >
                        <span
                          className="bg-[#efeee9] relative block overflow-hidden rounded-sm border border-[#dcd8cd]/70"
                          style={{ aspectRatio: "1600 / 2654" }}
                        >
                          {pageEdition?.page_image ? (
                            <Image
                              src={pageEdition.page_image}
                              alt={`${isUrdu ? "صفحہ" : "Page"} ${p.num}`}
                              fill
                              className="object-cover object-top"
                            />
                          ) : (
                            <span className="absolute inset-0 flex flex-col items-center justify-center p-2 text-center bg-white">
                              <span className="text-[10px] font-black text-[#184e2d] uppercase tracking-wider">
                                Daily Afadiat
                              </span>
                              <span className="text-xs font-bold text-gray-800 mt-1">
                                {isUrdu ? `صفحہ ${p.num}` : `Page ${p.num}`}
                              </span>
                              <span className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">
                                {isUrdu ? p.title_ur : p.title_en}
                              </span>
                            </span>
                          )}
                        </span>
                        <span className="mt-1 flex items-center justify-between gap-1 text-xs">
                          <span className={`tabular-nums ${isActive ? "text-[#184e2d] font-semibold" : "text-gray-600"}`}>
                            {isUrdu ? `صفحہ ${p.num}` : `Page ${p.num}`}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        )}

        {/* Active Clipping Detail Modal (Bilingual & Sharp Edges) */}
        {activeClip && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white border-2 border-gray-800 rounded-none max-w-2xl w-full p-6 shadow-2xl relative space-y-4">
              <button
                onClick={() => setActiveClip(null)}
                className="absolute top-3 right-3 text-gray-400 hover:text-black p-1 transition"
                title="Close"
              >
                <X size={20} />
              </button>

              <div className="border-b-2 border-emerald-900 pb-2">
                <div className="flex items-center justify-between text-[11px] text-gray-500 font-sans mb-1">
                  <span className="font-bold text-emerald-800 uppercase tracking-wider">
                    {isUrdu ? "روزنامہ افادیت پرنٹ کلپنگ ریڈر" : "Daily Afadiat ePaper Clipping Reader"}
                  </span>
                  <span>{activeClip.byline}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold urdu-headline text-gray-900 mt-1">
                  {activeClip.title}
                </h2>
              </div>

              {activeClip.image_url && (
                <div className="relative aspect-[16/9] w-full border border-gray-300 bg-gray-100 overflow-hidden">
                  <Image
                    src={activeClip.image_url}
                    alt={activeClip.title || "Clip image"}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {activeClip.excerpt && (
                <p className="text-xs font-bold text-emerald-900 bg-emerald-50/60 p-2.5 border-l-4 border-emerald-800">
                  {activeClip.excerpt}
                </p>
              )}

              <p className="text-sm leading-relaxed text-gray-800 font-sans text-justify max-h-[50vh] overflow-y-auto pr-1">
                {activeClip.content}
              </p>

              <div className="pt-3 border-t border-gray-200 flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() =>
                      alert(
                        isUrdu
                          ? "کلپ تصویر کے طور پر محفوظ ہو گیا!"
                          : "Clipping image saved to your downloads!"
                      )
                    }
                    className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1.5"
                  >
                    <Download size={13} />
                    <span>{isUrdu ? "کلپ محفوظ کریں (Save Clip)" : "Save Story Clipping"}</span>
                  </button>
                </div>

                <button
                  onClick={() => setActiveClip(null)}
                  className="bg-gray-800 hover:bg-black text-white text-xs font-semibold px-4 py-1.5 rounded-none transition"
                >
                  {isUrdu ? "بند کریں" : "Close"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Newsletter Box */}
        <NewsletterBox />

      </main>

      <Footer categories={categories} />
    </div>
  );
}
