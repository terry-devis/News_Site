"use client";
import React, { useState } from "react";
import Link from "next/link";
import Header from "@/component/Header";
import Footer from "@/component/Footer";
import NewsletterBox from "@/component/NewsletterBox";
import { useSiteLanguage } from "@/context/SiteLanguageContext";
import {
  Tv,
  Radio,
  Clock,
  Bell,
  CheckCircle2,
  Calendar,
  Sparkles,
  Signal,
  Video,
  Play,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

export default function LiveClient({ categories = [], breakingNews = [] }) {
  const { isUrdu, isEnglish, dir } = useSiteLanguage();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const upcomingShows = [
    {
      id: 1,
      title_ur: "پرائم ٹائم اسپیشل و تفصیلی تجزیہ",
      title_en: "Prime Time News & In-Depth Analysis",
      host_ur: "سینئر ایڈیٹوریل پینل",
      host_en: "Senior Editorial Panel",
      time: "09:00 PM (PKT)",
      desc_ur: "قومی سیاست، سفارت کاری اور معیشت پر ملک کے معروف اینکرز اور تجزیہ کاروں کے ساتھ بحث۔",
      desc_en: "Uncompromising debate and non-partisan scrutiny on national politics, economy, and diplomacy.",
    },
    {
      id: 2,
      title_ur: "صبح کا اخبار و ادارتی جائزہ",
      title_en: "Morning Headlines & Press Review",
      host_ur: "مارننگ ڈیسک",
      host_en: "Morning Desk",
      time: "08:00 AM (PKT)",
      desc_ur: "دن کے آغاز پر تمام ملکی اور بین الاقوامی اخبارات کی شہ سرخیاں اور اہم ترین خبروں کا خلاصہ۔",
      desc_en: "Start your day with instant verified headlines, newspaper editorials, and top stories.",
    },
    {
      id: 3,
      title_ur: "بزنس و اسٹاک مارکیٹ لائیو آور",
      title_en: "Business & Financial Markets Live",
      host_ur: "اکنامک بیورو",
      host_en: "Economic Bureau",
      time: "03:00 PM (PKT)",
      desc_ur: "پاکستان اسٹاک ایکسچینج، صرافہ سونا، اوپن مارکیٹ کرنسی اور ملکی سرمایہ کاری کی لائیو صورتحال۔",
      desc_en: "Moment-by-moment coverage of PSX index, gold bullion rates, and currency movements.",
    },
    {
      id: 4,
      title_ur: "اسپورٹس ایکسٹرا و خصوصی کوریج",
      title_en: "Sports Extra & Match Previews",
      host_ur: "کھیل ڈیسک",
      host_en: "Sports Desk",
      time: "06:00 PM (PKT)",
      desc_ur: "قومی کرکٹ ٹیم، انٹرنیشنل ٹورنامنٹس اور فیلڈ کے ہیروز کے ساتھ خصوصی گفتگو۔",
      desc_en: "High-energy match analysis, press conferences, and athlete interviews.",
    },
  ];

  const handleNotifySubmit = (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    setSubscribed(true);
    setEmail("");
    setTimeout(() => setSubscribed(false), 5000);
  };

  return (
    <div className="min-h-screen bg-[#f7f6f3] flex flex-col font-sans" dir={dir}>
      <Header categories={categories} breakingNews={breakingNews} />

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-8 space-y-10">
        
        {/* Main "Coming Soon" Broadcast Stage (Sharp Non-Round Edges) */}
        <div className="bg-[#07130c] border border-gray-800 rounded-none text-white overflow-hidden shadow-2xl relative">
          
          {/* Top Frequency & Test Transmission Strip */}
          <div className="bg-[#0b1d13] border-b border-emerald-950/80 px-4 py-2.5 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="size-2 bg-amber-400 rounded-none animate-pulse" />
              <span className="text-amber-300 font-bold uppercase tracking-wider">
                {isUrdu ? "نشریاتی ٹیسٹنگ مرحلہ (Test Transmission Mode)" : "TEST TRANSMISSION ACTIVE"}
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-3 text-emerald-400/80 text-[11px]">
              <span>SATELLITE: PAKSAT-MM1</span>
              <span>•</span>
              <span>IP LIVE: 1080p 60FPS</span>
            </div>
          </div>

          <div className="p-6 sm:p-12 lg:p-16 max-w-4xl mx-auto text-center space-y-6">
            
            {/* Pulsing Badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-900/60 border border-emerald-700/80 text-emerald-200 text-xs font-bold px-3.5 py-1.5 rounded-none uppercase tracking-widest font-sans">
              <Signal size={14} className="text-emerald-400 animate-pulse" />
              <span>{isUrdu ? "عنقریب باقاعدہ نشریات کا آغاز" : "LIVE TRANSMISSION COMING SOON"}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black urdu-headline leading-tight tracking-tight text-white">
              {isUrdu
                ? "ڈیلی افادیت ۲۴ گھنٹے لائیو نشریات — بہت جلد آپ کی اسکرینز پر"
                : "Daily Afadiat 24/7 Live Satellite & Digital Transmission — Launching Soon"}
            </h1>

            {/* Description */}
            <p className="text-sm sm:text-base text-gray-300 max-w-2xl mx-auto leading-relaxed">
              {isUrdu
                ? "اسلام آباد، لاہور اور کراچی کے جدید ترین اسٹوڈیوز اور او بی وین نیٹ ورک کے ذریعے پل پل کی مصدقہ بریکنگ نیوز، تحقیقاتی صحافت اور خصوصی پروگرامز کی لائیو اسٹریمنگ کا باقاعدہ آغاز بہت جلد کیا جا رہا ہے۔"
                : "State-of-the-art master transmission facilities and live bureau feeds across Pakistan and international bureaus are in final testing. Full round-the-clock live broadcasting will commence shortly."}
            </p>

            {/* Simulated Broadcast Monitor Graphics */}
            <div className="relative aspect-[21/9] sm:aspect-[24/9] w-full max-w-2xl mx-auto bg-black/80 border border-gray-700 rounded-none flex items-center justify-center overflow-hidden my-6">
              {/* Scanlines Overlay */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] pointer-events-none" />
              
              <div className="text-center space-y-2 z-10 p-4">
                <div className="size-12 sm:size-14 rounded-none bg-emerald-950/80 border border-emerald-600/80 text-emerald-400 flex items-center justify-center mx-auto">
                  <Tv size={28} />
                </div>
                <div className="text-white text-xs sm:text-sm font-bold uppercase tracking-wider font-sans">
                  DAILY AFADIAT NEWS NETWORK • STUDIO FEED 01
                </div>
                <div className="text-[11px] text-amber-300/90 font-mono">
                  STANDBY FOR OFFICIAL ON-AIR LAUNCH
                </div>
              </div>
            </div>

            {/* Notify Me Form */}
            <div className="max-w-md mx-auto pt-2">
              {subscribed ? (
                <div className="p-3.5 bg-emerald-950/90 border border-emerald-600 rounded-none text-emerald-200 text-xs font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                  <span>
                    {isUrdu
                      ? "شکریہ! لائیو نشریات کے آغاز پر آپ کو فوری اطلاع دی جائے گی۔"
                      : "Thank you! You will be notified the moment we go live."}
                  </span>
                </div>
              ) : (
                <form onSubmit={handleNotifySubmit} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isUrdu ? "اپنا ای میل درج کریں..." : "Enter your email address..."}
                    className="flex-1 p-3 bg-zinc-900 border border-gray-700 text-white text-xs rounded-none outline-none focus:border-emerald-500 font-sans"
                  />
                  <button
                    type="submit"
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-5 py-3 rounded-none flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0 uppercase tracking-wider font-sans"
                  >
                    <Bell size={14} />
                    <span>{isUrdu ? "مطلع کریں" : "Notify Me"}</span>
                  </button>
                </form>
              )}
              <p className="text-[11px] text-gray-400 mt-2 font-sans">
                {isUrdu ? "کوئی اسپام نہیں • مکمل رازداری" : "No spam • Zero unverified alerts"}
              </p>
            </div>

          </div>
        </div>

        {/* Flagship Programs Lineup (Sharp-Edged Broadsheet Grid) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b-2 border-[#0d3822]">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold urdu-headline text-gray-950">
                {isUrdu ? "عنقریب نشر ہونے والے فلیگ شپ پروگرامز" : "Upcoming Flagship Broadcast Lineup"}
              </h2>
              <p className="text-xs text-gray-600">
                {isUrdu ? "لائیو لانچ پر روزنامہ افادیت کے خصوصی شوز اور تجزیاتی پینلز" : "Exclusive daily shows and investigative analysis airing on live debut"}
              </p>
            </div>
            <span className="hidden sm:inline text-xs font-bold font-mono text-emerald-800 bg-[#efeee9] border border-[#dcd8cd] px-2.5 py-1 rounded-none">
              4 DAILY SHOWS
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {upcomingShows.map((s) => (
              <div
                key={s.id}
                className="bg-white border border-[#dcd8cd] rounded-none p-5 shadow-2xs hover:border-emerald-800 transition flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-sans pb-1.5 border-b border-[#eceae3]">
                    <span className="font-mono font-bold text-[#0d3822]">{s.time}</span>
                    <span className="text-gray-500 font-medium">{isUrdu ? s.host_ur : s.host_en}</span>
                  </div>

                  <h3 className="text-base font-bold text-gray-950 urdu-headline leading-snug">
                    {isUrdu ? s.title_ur : s.title_en}
                  </h3>

                  <p className="text-xs text-gray-600 leading-relaxed font-sans">
                    {isUrdu ? s.desc_ur : s.desc_en}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#eceae3] flex items-center justify-between text-[11px] font-bold text-emerald-800">
                  <span className="flex items-center gap-1">
                    <Sparkles size={12} className="text-amber-500" />
                    <span>{isUrdu ? "عنقریب آن ایئر" : "Coming On-Air"}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Meanwhile, Explore Videos & ePaper */}
        <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-none p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-bold text-base text-gray-950 urdu-headline">
              {isUrdu ? "لائیو نشریات کے منتظر؟ ہمارے ویڈیو پیکجز اور ای پیپر دیکھیے" : "Explore Our Multimedia Video Packages & Today's ePaper"}
            </h3>
            <p className="text-xs text-gray-700">
              {isUrdu ? "تمام بڑی خبروں کے تفصیلی ویڈیو پیکیجز اور آج کا مکمل پرنٹ اخبار دستیاب ہے۔" : "Watch recorded special reports and read the full authentic broadsheet edition right now."}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Link
              href="/video"
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2.5 rounded-none flex items-center gap-1.5 transition"
            >
              <Video size={14} />
              <span>{isUrdu ? "ویڈیوز دیکھیں" : "Watch Videos"}</span>
            </Link>
            <Link
              href="/epaper"
              className="bg-white hover:bg-gray-100 text-gray-800 border border-[#dcd8cd] font-bold text-xs px-4 py-2.5 rounded-none transition"
            >
              <span>{isUrdu ? "ای پیپر پڑھیں" : "Read ePaper"}</span>
            </Link>
          </div>
        </div>

        {/* Newsletter Box */}
        <NewsletterBox />

      </main>

      <Footer categories={categories} />
    </div>
  );
}
