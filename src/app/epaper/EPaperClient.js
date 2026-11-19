"use client";
import React, { useState } from "react";
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
  ChevronLeft,
  ChevronRight,
  Layers,
  MapPin,
  Share2,
  FileText,
  X,
  ExternalLink,
} from "lucide-react";

export default function EPaperClient({ categories = [], breakingNews = [] }) {
  const { isUrdu, isEnglish, dir } = useSiteLanguage();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedCity, setSelectedCity] = useState("islamabad");
  const [activePage, setActivePage] = useState(1);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [activeClip, setActiveClip] = useState(null);

  const cities = [
    { key: "islamabad", name_ur: "اسلام آباد / راولپنڈی", name_en: "Islamabad" },
    { key: "lahore", name_ur: "لاہور ایڈیشن", name_en: "Lahore" },
    { key: "karachi", name_ur: "کراچی ایڈیشن", name_en: "Karachi" },
    { key: "quetta", name_ur: "کوئٹہ ایڈیشن", name_en: "Quetta" },
    { key: "international", name_ur: "انٹرنیشنل ایڈیشن", name_en: "International" },
  ];

  const pages = [
    { num: 1, title_ur: "صفحۂ اول (اہم سرخیاں)", title_en: "Front Page" },
    { num: 2, title_ur: "قومی و علاقائی خبریں", title_en: "National News" },
    { num: 3, title_ur: "اداریہ، کالم و تجارت", title_en: "Editorial & Business" },
    { num: 4, title_ur: "بین الاقوامی و کھیل", title_en: "World & Sports" },
  ];

  const handleZoom = (delta) => {
    setZoomLevel((prev) => Math.max(75, Math.min(175, prev + delta)));
  };

  const handleDownloadPDF = () => {
    alert(isUrdu ? "مکمل اخبار PDF ڈاؤنلوڈ ہو رہا ہے..." : "Downloading full ePaper PDF edition...");
  };

  return (
    <div className="min-h-screen bg-[#f7f6f3] flex flex-col font-sans" dir={dir}>
      <Header categories={categories} breakingNews={breakingNews} />

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-5 space-y-6">
        
        {/* Top Control Bar: City Edition + Date + Zoom + PDF Download */}
        <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-2xl p-3 sm:p-4 shadow-xs space-y-3">
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
            
            {/* Left: City Selector Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 lg:pb-0">
              <span className="text-xs font-bold text-gray-700 flex items-center gap-1 shrink-0 px-1">
                <MapPin size={14} className="text-emerald-700" />
                <span>{isUrdu ? "شہر منتخب کریں:" : "Edition:"}</span>
              </span>
              {cities.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setSelectedCity(c.key)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition cursor-pointer ${
                    selectedCity === c.key
                      ? "bg-emerald-800 text-white shadow-xs"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-[#dcd8cd]"
                  }`}
                >
                  {isUrdu ? c.name_ur : c.name_en}
                </button>
              ))}
            </div>

            {/* Right: Date Picker & PDF Download */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex items-center gap-1.5 bg-white border border-[#dcd8cd] rounded-xl px-2.5 py-1 text-xs shadow-xs">
                <Calendar size={14} className="text-emerald-700" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="outline-none bg-transparent font-sans text-xs text-gray-800 cursor-pointer"
                />
              </div>

              <button
                type="button"
                onClick={handleDownloadPDF}
                className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 transition cursor-pointer shadow-xs"
              >
                <Download size={13} />
                <span>{isUrdu ? "مکمل اخبار PDF ڈاؤنلوڈ" : "Download PDF"}</span>
              </button>
            </div>

          </div>

          {/* Page Switcher & Zoom Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2.5 border-t border-[#dcd8cd]">
            
            {/* Page Buttons */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              <span className="text-xs font-bold text-gray-700 flex items-center gap-1 shrink-0 px-1">
                <Layers size={14} className="text-emerald-700" />
                <span>{isUrdu ? "صفحات:" : "Pages:"}</span>
              </span>
              {pages.map((p) => (
                <button
                  key={p.num}
                  onClick={() => setActivePage(p.num)}
                  className={`text-xs px-3 py-1 rounded-lg font-bold transition cursor-pointer whitespace-nowrap ${
                    activePage === p.num
                      ? "bg-emerald-700 text-white shadow-xs"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-[#dcd8cd]"
                  }`}
                >
                  <span>{isUrdu ? `صفحہ ${p.num}` : `Page ${p.num}`}</span>
                </button>
              ))}
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1.5 self-end sm:self-auto">
              <div className="flex items-center bg-white border border-[#dcd8cd] rounded-xl p-0.5 shadow-2xs">
                <button
                  onClick={() => handleZoom(-15)}
                  className="p-1.5 text-gray-600 hover:text-emerald-800 hover:bg-gray-100 rounded-lg transition"
                  title="Zoom Out"
                >
                  <ZoomOut size={15} />
                </button>
                <span className="text-[11px] font-mono font-bold px-2 text-gray-700">
                  {zoomLevel}%
                </span>
                <button
                  onClick={() => handleZoom(15)}
                  className="p-1.5 text-gray-600 hover:text-emerald-800 hover:bg-gray-100 rounded-lg transition"
                  title="Zoom In"
                >
                  <ZoomIn size={15} />
                </button>
              </div>

              <button
                onClick={() => setZoomLevel(100)}
                className="text-[11px] font-semibold bg-white border border-[#dcd8cd] text-gray-700 px-2.5 py-1.5 rounded-xl hover:bg-gray-50 transition"
              >
                Reset
              </button>
            </div>

          </div>

        </div>

        {/* Newspaper Broadsheet Sheet Viewer */}
        <div className="w-full overflow-x-auto pb-4 scrollbar-thin">
          <div
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "top center" }}
            className="transition-transform duration-200 mx-auto min-w-[760px] max-w-[1020px] bg-white border-2 border-gray-400 shadow-2xl p-6 sm:p-10 space-y-6 text-gray-900"
          >
            {/* Authentic Newspaper Masthead Header */}
            <div className="border-b-4 border-black pb-3 text-center space-y-2">
              <div className="flex items-center justify-between text-[11px] text-gray-700 font-sans border-b border-gray-300 pb-1">
                <span>جلد نمبر: ۰۱ • شمارہ نمبر: ۲۴۵</span>
                <span>{selectedDate} • باقاعدہ رجسٹرڈ پرنٹ ایڈیشن</span>
                <span>قیمت: ۲۰ روپے • صفحات: ۰۸</span>
              </div>

              {/* Masthead Title */}
              <div className="py-2">
                <h1 className="text-4xl sm:text-6xl font-black urdu-headline text-black tracking-tight">
                  روزنامہ افادیت
                </h1>
                <p className="text-[11px] font-sans font-bold tracking-widest uppercase text-gray-700 mt-1">
                  DAILY AFADIAT — PAKISTAN'S PREMIER TRUSTED BROADSHEET NEWSPAPER
                </p>
              </div>

              {/* Tagline stripe */}
              <div className="bg-black text-white text-[11px] py-1 font-bold flex items-center justify-around font-sans">
                <span>سچ کے ساتھ، ہر لمحہ باخبر</span>
                <span>•</span>
                <span>اسلام آباد • لاہور • کراچی • کوئٹہ</span>
                <span>•</span>
                <span>www.dailyafadiat.com</span>
              </div>
            </div>

            {/* Broadsheet Columns Layout (Mirrors real print page 1) */}
            <div className="grid grid-cols-12 gap-4">
              
              {/* Column 1: Lead Super Headline (7 Cols) */}
              <div
                onClick={() =>
                  setActiveClip({
                    title: "ڈیلی افادیت ڈیجیٹل و پرنٹ ایڈیشن کا شاندار آغاز",
                    excerpt: "سچائی، خودمختار صحافت اور قومی تعمیر کے منشور کے ساتھ نیا دور شروع۔ قارئین کی جانب سے زبردست خیرمقدم۔",
                    content: "اسلام آباد (خصوصی نمائندہ) روزنامہ افادیت نے قارئین کے لیے ایک نیا سنگ میل عبور کر لیا ہے۔ غیر جانبدار تجزیات، فیکٹ چیک اور تحقیقاتی صحافت کے ساتھ ملک کے تمام بڑے شہروں میں آج سے باقاعدہ ترسیل جاری ہے۔",
                  })
                }
                className="col-span-8 p-3.5 border-r border-gray-300 cursor-pointer hover:bg-emerald-50/40 transition group"
              >
                <span className="text-[10px] font-bold bg-black text-white px-2 py-0.5 rounded font-sans uppercase">
                  لیڈ اسٹوری
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold urdu-headline leading-tight mt-1 group-hover:text-emerald-900">
                  ڈیلی افادیت ڈیجیٹل اور پرنٹ ایڈیشن کا شاندار آغاز: سچائی اور فوری باخبر رہنے کا نیا عہد
                </h2>
                <div className="relative aspect-[16/9] w-full my-3 border border-gray-300 bg-gray-100 overflow-hidden">
                  <Image
                    src="https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200&auto=format&fit=crop"
                    alt="Main news"
                    fill
                    className="object-cover"
                  />
                </div>
                <p className="urdu-body text-sm leading-relaxed text-gray-800 text-justify">
                  اسلام آباد (خصوصی نامہ نگار) روزنامہ افادیت نے جدید ترین پرنٹنگ ٹیکنالوجی اور ڈیجیٹل سروسز کے ساتھ ملکی صحافت میں ایک نئے باب کا اضافہ کر دیا ہے۔ ادارتی بورڈ کا کہنا ہے کہ ہمارا مقصد قاری تک بلاخوف و خطر اور تصدیق شدہ اطلاعات پہنچانا ہے۔
                </p>
                <span className="text-[10px] text-emerald-700 font-bold mt-2 inline-block">
                  [مکمل خبر کا کلپ پڑھنے کے لیے کلک کریں]
                </span>
              </div>

              {/* Column 2: Side Secondary Headlines (4 Cols) */}
              <div className="col-span-4 space-y-4">
                
                {/* Story 2 */}
                <div
                  onClick={() =>
                    setActiveClip({
                      title: "اسٹیٹ بینک کی مانیٹری پالیسی کا اعلان، شرح سود میں استحکام",
                      excerpt: "مرکزی بینک نے ملکی معاشی استحکام کے پیش نظر نئی ہدایات جاری کر دیں۔",
                      content: "کراچی (بزنس رپورٹر) اسٹیٹ بینک آف پاکستان نے اپنی تازہ مانیٹری پالیسی کا اعلان کرتے ہوئے شرح سود میں استحکام برقرار رکھنے کی توثیق کی ہے۔",
                    })
                  }
                  className="p-3 border-b border-gray-300 cursor-pointer hover:bg-emerald-50/40 transition group"
                >
                  <h3 className="text-base sm:text-lg font-bold urdu-headline leading-snug group-hover:text-emerald-900">
                    اسٹیٹ بینک کی مانیٹری پالیسی کا اعلان، شرح سود میں استحکام برقرار
                  </h3>
                  <p className="urdu-body text-xs text-gray-700 mt-1 line-clamp-3 leading-relaxed">
                    مرکزی بینک کے مطابق برآمدات میں بتدریج اضافہ اور زرمبادلہ کے ذخائر میں بہتری خوش آئند اشارے ہیں۔
                  </p>
                </div>

                {/* Story 3 */}
                <div
                  onClick={() =>
                    setActiveClip({
                      title: "ملک بھر میں موسم سرما کی بارشیں اور پہاڑوں پر برفباری",
                      excerpt: "محکمہ موسمیات نے سردی کی نئی لہر کی پیش گوئی کر دی، سیاحوں کا رش۔",
                      content: "مری، گلگت بلتستان اور وادی نیلم میں برفباری کا سلسلہ شروع ہو گیا ہے جس کے بعد سردی کی شدت میں غیر معمولی اضافہ ریکارڈ کیا گیا ہے۔",
                    })
                  }
                  className="p-3 border-b border-gray-300 cursor-pointer hover:bg-emerald-50/40 transition group"
                >
                  <h3 className="text-base sm:text-lg font-bold urdu-headline leading-snug group-hover:text-emerald-900">
                    ملک بھر میں موسم سرما کی بارشیں اور پہاڑوں پر برفباری
                  </h3>
                  <div className="relative aspect-[16/10] w-full my-2 border border-gray-200">
                    <Image
                      src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop"
                      alt="Weather report"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <p className="urdu-body text-xs text-gray-700 line-clamp-2 leading-relaxed">
                    مری اور شمالی علاقوں میں سیاحوں کی بڑی تعداد پہنچ گئی۔
                  </p>
                </div>

                {/* Daily Rates Box */}
                <div className="p-3 bg-[#f7f6f3] border border-gray-300 rounded text-xs space-y-1">
                  <h4 className="font-bold text-black border-b border-gray-300 pb-1">
                    آج کے صرافہ و کرنسی ریٹس
                  </h4>
                  <div className="flex justify-between text-[11px]">
                    <span>سونا فی تولہ ۲۴K:</span>
                    <strong className="font-mono">₨ 422,095</strong>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>امریکی ڈالر (USD):</span>
                    <strong className="font-mono">₨ 277.50</strong>
                  </div>
                </div>

              </div>

            </div>

            {/* Bottom Footer Stripe */}
            <div className="border-t-2 border-black pt-2 flex items-center justify-between text-[11px] text-gray-600 font-sans">
              <span>صفحہ نمبر: {activePage} • روزنامہ افادیت ڈیجیٹل ای پیپر</span>
              <span>تمام حقوق بحق ادارہ روزنامہ افادیت محفوظ ہیں © 2026</span>
            </div>

          </div>
        </div>

        {/* Newspaper Page Thumbnails Reel at bottom */}
        <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-2xl p-4 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
            <Layers size={14} className="text-emerald-700" />
            <span>{isUrdu ? "آج کے تمام صفحات کا پیش منظر" : "All Newspaper Pages Preview"}</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {pages.map((p) => (
              <button
                key={p.num}
                onClick={() => {
                  setActivePage(p.num);
                  window.scrollTo({ top: 180, behavior: "smooth" });
                }}
                className={`p-2 rounded-xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                  activePage === p.num
                    ? "bg-white border-emerald-700 shadow-md ring-2 ring-emerald-600"
                    : "bg-white/80 border-[#dcd8cd] hover:bg-white"
                }`}
              >
                <div className="w-full aspect-[3/4] bg-gray-100 border border-gray-300 rounded flex items-center justify-center text-xs font-bold text-gray-500 font-mono shadow-inner">
                  Page {p.num}
                </div>
                <span className="text-xs font-bold text-gray-800">
                  {isUrdu ? p.title_ur : p.title_en}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Active Clipping Detail Modal */}
        {activeClip && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white border border-[#dcd8cd] rounded-2xl max-w-xl w-full p-6 shadow-2xl relative space-y-4">
              <button
                onClick={() => setActiveClip(null)}
                className="absolute top-3 right-3 text-gray-400 hover:text-black p-1 transition"
              >
                <X size={20} />
              </button>

              <div className="border-b border-gray-200 pb-2">
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider font-sans">
                  روزنامہ افادیت پرنٹ کلپ
                </span>
                <h2 className="text-xl sm:text-2xl font-bold urdu-headline text-gray-900 mt-1">
                  {activeClip.title}
                </h2>
              </div>

              <p className="urdu-body text-base leading-loose text-gray-800">
                {activeClip.content}
              </p>

              <div className="pt-3 border-t border-gray-200 flex items-center justify-between">
                <button
                  onClick={() => alert("کلپ تصویر کے طور پر محفوظ ہو گیا!")}
                  className="text-xs font-bold text-emerald-800 hover:underline flex items-center gap-1"
                >
                  <Download size={13} />
                  <span>کلپ محفوظ کریں (Save Clip)</span>
                </button>
                <button
                  onClick={() => setActiveClip(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold px-4 py-1.5 rounded-xl transition"
                >
                  بند کریں
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
