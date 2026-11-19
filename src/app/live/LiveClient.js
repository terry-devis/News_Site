"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "@/component/Header";
import Footer from "@/component/Footer";
import NewsletterBox from "@/component/NewsletterBox";
import { useSiteLanguage } from "@/context/SiteLanguageContext";
import {
  Tv,
  Flame,
  Radio,
  Clock,
  Users,
  Volume2,
  Maximize2,
  Play,
  Calendar,
  Share2,
  CheckCircle2,
  MessageSquare,
  Send,
  Eye,
} from "lucide-react";

export default function LiveClient({ categories = [], breakingNews = [] }) {
  const { isUrdu, isEnglish, dir, t } = useSiteLanguage();
  const [activeChannel, setActiveChannel] = useState("main");
  const [liveChat, setLiveChat] = useState([
    { id: 1, user: "محمد عثمان", time: "2 min ago", text: "ماشاءاللہ ڈیلی افادیت کی لائیو کوریج انتہائی غیر جانبدارانہ ہے۔" },
    { id: 2, user: "Kamran Shah", time: "5 min ago", text: "Great digital stream quality from London. Keep up the high standard reporting." },
    { id: 3, user: "طارق جاوید", time: "8 min ago", text: "اسٹاک مارکیٹ اور معیشت پر آج کا تجزیہ بہت معلوماتی تھا۔" },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatSuccess, setChatSuccess] = useState(false);

  // Channels list
  const channels = [
    { id: "main", name_ur: "ڈیلی افادیت نیوز (مین چینل)", name_en: "Daily Afadiat News (HD)", ytId: "live_stream" },
    { id: "business", name_ur: "بزنس و معیشت ڈیسک", name_en: "Business & Economy Live", ytId: "business_stream" },
    { id: "sports", name_ur: "اسپورٹس لائیو کوریج", name_en: "Sports Live Coverage", ytId: "sports_stream" },
  ];

  // Daily Schedule
  const schedule = [
    { time: "08:00 AM", title_ur: "صبح کا اخبار و ہیڈلائنز", title_en: "Morning Press Review & Headlines", host_ur: "ریحان احمد", host_en: "Rehan Ahmed", current: false },
    { time: "11:00 AM", title_ur: "قومی و بین الاقوامی اہم پیش رفت", title_en: "National & Global Developments", host_ur: "ثناء ملک", host_en: "Sana Malik", current: false },
    { time: "02:00 PM", title_ur: "مارکیٹ ریٹس و مڈ ڈے بلیٹن", title_en: "Midday Bulletin & Market Rates", host_ur: "بزنس ڈیسک", host_en: "Business Desk", current: true },
    { time: "06:00 PM", title_ur: "شام کی بڑی خبریں و فیکٹ چیک", title_en: "Evening Fast News & Fact Check", host_ur: "کاشف خان", host_en: "Kashif Khan", current: false },
    { time: "09:00 PM", title_ur: "پرائم ٹائم اسپیشل و تفصیلی تجزیہ", title_en: "Prime Time News & Deep Analysis", host_ur: "سید راشد علی", host_en: "Syed Rashid Ali", current: false },
    { time: "11:00 PM", title_ur: "آج کے دن کا مکمل خلاصہ", title_en: "Night Wrap & Complete Digest", host_ur: "نیوز روم", host_en: "Newsroom", current: false },
  ];

  // Recent archived broadcasts
  const recentBulletins = [
    {
      id: "b1",
      title_ur: "خصوصی بلیٹن: پاکستان اسٹاک ایکسچینج میں نئی تاریخی بلندیوں کا تفصیلی جائزہ",
      title_en: "Special Bulletin: Record Highs in Pakistan Stock Exchange Analyzed",
      duration: "24:15",
      views: "18.4K",
      time: "2 hours ago",
      thumb: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=600&auto=format&fit=crop",
    },
    {
      id: "b2",
      title_ur: "پرائم نیوز: قومی معیشت، نئی اصلاحات اور علاقائی سیکیورٹی صورتحال",
      title_en: "Prime News: National Economy, New Reforms, and Regional Security",
      duration: "32:40",
      views: "42.1K",
      time: "6 hours ago",
      thumb: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=600&auto=format&fit=crop",
    },
    {
      id: "b3",
      title_ur: "کھیل کے میدان سے: چیمپئنز ٹرافی اور قومی کرکٹ ٹیم کی خصوصی رپورٹ",
      title_en: "Sports Arena: Special Report on Upcoming International Tournament",
      duration: "18:50",
      views: "29.7K",
      time: "Yesterday",
      thumb: "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=600&auto=format&fit=crop",
    },
  ];

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setLiveChat([
      { id: Date.now(), user: isUrdu ? "آپ (لائیو قاری)" : "You (Reader)", time: "Just now", text: chatInput.trim() },
      ...liveChat,
    ]);
    setChatInput("");
    setChatSuccess(true);
    setTimeout(() => setChatSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#f7f6f3] flex flex-col font-sans" dir={dir}>
      <Header categories={categories} breakingNews={breakingNews} />

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-8">
        
        {/* Page Title & Status Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#dcd8cd]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full animate-pulse shadow-xs font-sans">
                <span className="size-2 rounded-full bg-yellow-300" />
                <span>LIVE 24/7</span>
              </span>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                HD 1080p Stream
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold urdu-headline text-gray-900">
              {isUrdu ? "ڈیلی افادیت لائیو نشریات" : "Daily Afadiat 24/7 Live Broadcast"}
            </h1>
          </div>

          {/* Active Viewers & Social Share */}
          <div className="flex items-center gap-3">
            <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-xl px-3 py-1.5 flex items-center gap-2 text-xs font-semibold text-gray-700">
              <Users size={14} className="text-red-600" />
              <span>{isUrdu ? "۱۸,۴۵۰ لائیو ناظرین" : "18,450 Watching Now"}</span>
            </div>
          </div>
        </div>

        {/* Channels Selector Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {channels.map((ch) => (
            <button
              key={ch.id}
              onClick={() => setActiveChannel(ch.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition cursor-pointer whitespace-nowrap border ${
                activeChannel === ch.id
                  ? "bg-emerald-800 text-white border-emerald-900 shadow-xs"
                  : "bg-white text-gray-700 border-[#dcd8cd] hover:bg-gray-100"
              }`}
            >
              <Radio size={14} className={activeChannel === ch.id ? "text-emerald-300 animate-pulse" : "text-gray-400"} />
              <span>{isUrdu ? ch.name_ur : ch.name_en}</span>
            </button>
          ))}
        </div>

        {/* Main Grid: Video Player (8 Cols) + Live Chat & Current Show (4 Cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Video Stream Container (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* 16:9 Cinema Player Card */}
            <div className="bg-black rounded-2xl overflow-hidden shadow-xl border border-gray-800 relative aspect-video flex flex-col justify-between group">
              {/* Fallback Live Stream Visual Representation */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-zinc-900 to-black flex items-center justify-center">
                <div className="text-center p-6 space-y-3">
                  <div className="relative size-16 sm:size-20 mx-auto rounded-full bg-red-600/20 border-2 border-red-500 flex items-center justify-center text-red-500 animate-pulse">
                    <Tv size={36} />
                  </div>
                  <h3 className="text-white text-lg sm:text-xl font-bold urdu-headline">
                    {isUrdu ? "ڈیلی افادیت ہائی ڈیفینیشن لائیو اسٹریمنگ" : "Daily Afadiat High-Definition Live Stream"}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-300 max-w-md mx-auto leading-relaxed">
                    {isUrdu
                      ? "برائے مہربانی لائیو نشریات دیکھنے کے لیے پلے کا بٹن دبائیں۔ براہ راست سٹوڈیو ٹرانسمیشن فعال ہے۔"
                      : "Connecting to Daily Afadiat master transmission center in Islamabad & Karachi."}
                  </p>
                </div>
              </div>

              {/* Top Stream Overlay */}
              <div className="relative z-10 p-3 sm:p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex items-center gap-2">
                  <span className="size-2.5 rounded-full bg-red-500 animate-ping" />
                  <span className="text-xs font-bold text-white tracking-wider uppercase font-sans">
                    TRANSMISSION FEED 01
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-white/80 font-mono">
                  <span>1080p • 60fps</span>
                </div>
              </div>

              {/* Bottom Ticker inside Stream Player */}
              <div className="relative z-10 p-3 sm:p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex items-center justify-between">
                <div className="flex items-center gap-2 text-white text-xs sm:text-sm font-semibold truncate">
                  <Flame size={16} className="text-yellow-400 shrink-0" />
                  <span className="truncate">
                    {isUrdu
                      ? "ابھی نشر ہو رہا ہے: مارکیٹ ریٹس و مڈ ڈے بلیٹن (براہ راست)"
                      : "Now Airing: Midday Bulletin & Financial Markets Live (HD)"}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button className="text-white/80 hover:text-white p-1.5 transition" title="Mute/Unmute">
                    <Volume2 size={16} />
                  </button>
                  <button className="text-white/80 hover:text-white p-1.5 transition" title="Fullscreen">
                    <Maximize2 size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Broadcast Details Card */}
            <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#dcd8cd]">
                <div>
                  <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider font-sans">
                    {isUrdu ? "مرکزی نشریات" : "PRIMARY SATELLITE & IP FEED"}
                  </span>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 urdu-headline mt-0.5">
                    {isUrdu ? "ڈیلی افادیت ۲۴ گھنٹے براہ راست نشریاتی کوریج" : "Daily Afadiat Continuous Live Stream & Special Coverage"}
                  </h2>
                </div>
                <div className="text-xs text-gray-600 font-sans flex items-center gap-1.5">
                  <Clock size={14} className="text-emerald-700" />
                  <span>{new Date().toLocaleDateString(isUrdu ? "ur-PK" : "en-US", { weekday: "long", year: "numeric", month: "short", day: "numeric" })}</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                {isUrdu
                  ? "ڈیلی افادیت کی ڈیجیٹل نشریات جدید ترین او بی وینز اور بیورو نیٹ ورک کے ذریعے اسلام آباد، لاہور، کراچی اور بین الاقوامی مراکز سے بغیر کسی وقفے کے فراہم کی جا رہی ہیں۔"
                  : "Daily Afadiat digital live transmission streams 24/7 directly from our newsrooms in Islamabad, Karachi, Lahore, and global correspondents."}
              </p>
            </div>

          </div>

          {/* Right Column: Live Chat & Daily Schedule (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Live Audience Feedback Box */}
            <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-2xl p-4 shadow-xs flex flex-col h-[320px]">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#dcd8cd]">
                <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <MessageSquare size={14} className="text-emerald-700" />
                  <span>{isUrdu ? "ناظرین کا ردِ عمل و سوالات" : "Live Audience Discussion"}</span>
                </h3>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                  {isUrdu ? "فعال" : "Live"}
                </span>
              </div>

              {/* Chat Messages Reel */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1 text-xs">
                {liveChat.map((msg) => (
                  <div key={msg.id} className="p-2 rounded-xl bg-white border border-[#dcd8cd] space-y-0.5">
                    <div className="flex items-center justify-between text-[10px] text-gray-500">
                      <span className="font-bold text-emerald-800">{msg.user}</span>
                      <span>{msg.time}</span>
                    </div>
                    <p className="text-gray-800 leading-relaxed text-[11px]">{msg.text}</p>
                  </div>
                ))}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSendChat} className="mt-2 pt-2 border-t border-[#dcd8cd] flex gap-1.5">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder={isUrdu ? "اپنا تبصرہ یا سوال لکھیے..." : "Share your comment or question..."}
                  className="flex-1 text-xs p-2 rounded-xl bg-white border border-[#dcd8cd] outline-none focus:border-emerald-600"
                />
                <button
                  type="submit"
                  className="bg-emerald-700 hover:bg-emerald-800 text-white p-2 rounded-xl transition cursor-pointer"
                  title="Send"
                >
                  <Send size={14} />
                </button>
              </form>
              {chatSuccess && (
                <div className="mt-1 text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={11} />
                  <span>{isUrdu ? "آپ کا تبصرہ موصول ہو گیا!" : "Comment posted live!"}</span>
                </div>
              )}
            </div>

            {/* Program Transmission Schedule */}
            <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-2xl p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#dcd8cd]">
                <h3 className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                  <Calendar size={14} className="text-emerald-700" />
                  <span>{isUrdu ? "آج کا نشریاتی شیڈول" : "Daily Program Guide"}</span>
                </h3>
                <span className="text-[10px] text-gray-500 font-mono">PKT (UTC+5)</span>
              </div>

              <div className="space-y-2">
                {schedule.map((p, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl border text-xs transition ${
                      p.current
                        ? "bg-emerald-50 border-emerald-300 shadow-2xs"
                        : "bg-white border-[#dcd8cd]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[11px] font-bold text-emerald-800">{p.time}</span>
                      {p.current ? (
                        <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase animate-pulse">
                          ON AIR
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-500 font-sans">{isUrdu ? p.host_ur : p.host_en}</span>
                      )}
                    </div>
                    <h4 className="font-bold text-gray-900 leading-snug">
                      {isUrdu ? p.title_ur : p.title_en}
                    </h4>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Past Recorded Bulletins Section */}
        <div className="pt-4 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#dcd8cd]">
            <div>
              <h2 className="text-lg sm:text-xl font-bold urdu-headline text-gray-900">
                {isUrdu ? "پچھلے ریکارڈ شدہ بلیٹنز و خصوصی رپورٹس" : "Recent Recorded Broadcasts & Special Bulletins"}
              </h2>
              <p className="text-xs text-gray-600">
                {isUrdu ? "اگر آپ لائیو نشریات مس کر چکے ہیں تو پچھلے بلیٹنز یہاں دیکھیے" : "Catch up on past full-length editions and analysis"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentBulletins.map((b) => (
              <div
                key={b.id}
                className="bg-[#efeee9] border border-[#dcd8cd] rounded-2xl overflow-hidden shadow-xs hover:border-emerald-600 transition group flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-video w-full overflow-hidden bg-gray-200">
                    <Image
                      src={b.thumb}
                      alt={b.title_ur}
                      fill
                      className="object-cover group-hover:scale-105 transition duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-80 group-hover:opacity-100 transition">
                      <div className="size-11 rounded-full bg-emerald-700/90 text-white flex items-center justify-center shadow-lg group-hover:bg-red-600 transition">
                        <Play size={20} className="translate-x-0.5" />
                      </div>
                    </div>
                    <span className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                      {b.duration}
                    </span>
                  </div>

                  <div className="p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-gray-500 font-sans">
                      <span className="flex items-center gap-1">
                        <Eye size={12} />
                        <span>{b.views} views</span>
                      </span>
                      <span>{b.time}</span>
                    </div>

                    <h3 className="text-xs sm:text-sm font-bold urdu-headline text-gray-900 line-clamp-2 leading-snug group-hover:text-emerald-800 transition">
                      {isUrdu ? b.title_ur : b.title_en}
                    </h3>
                  </div>
                </div>

                <div className="p-3.5 pt-0">
                  <button
                    type="button"
                    onClick={() => alert(isUrdu ? "ویڈیو چلائی جا رہی ہے..." : "Playing bulletin recording...")}
                    className="w-full py-2 bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl border border-[#dcd8cd] flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Play size={13} />
                    <span>{isUrdu ? "مکمل بلیٹن دیکھیں" : "Watch Full Broadcast"}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter Subscription */}
        <NewsletterBox />

      </main>

      <Footer categories={categories} />
    </div>
  );
}
