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

  const channels = [
    {
      id: "afadiat-hls",
      name_ur: "ڈیلی افادیت لائیو (HLS)",
      name_en: "Daily Afadiat Live (HLS)",
      desc_ur: "روزنامہ افادیت ایچ ڈی براہِ راست نشریات",
      desc_en: "Daily Afadiat HD Live Stream",
      isLive: true,
      streamUrl: "https://mtoczko.github.io/hls-test-streams/test-vtt/playlist.m3u8",
      embedUrl: "",
    },
    {
      id: "afadiat-live",
      name_ur: "ڈیلی افادیت لائیو",
      name_en: "Daily Afadiat Live",
      desc_ur: "اسلام آباد اسٹوڈیو — ۲۴ گھنٹے بریکنگ نیوز اور حالاتِ حاضرہ",
      desc_en: "Islamabad Studio — 24/7 Breaking News & Current Affairs",
      isLive: true,
      streamUrl: "",
      embedUrl: "https://www.youtube.com/embed/live_stream?channel=UC4R8DWoMoI7CAwX8_LjQHig",
    },
    {
      id: "afadiat-news-24",
      name_ur: "افادیت نیوز ۲۴",
      name_en: "Afadiat News 24",
      desc_ur: "بزنس، مارکیٹس اور خصوصی رپورٹس",
      desc_en: "Business, Markets & Special Bulletins",
      isLive: true,
      streamUrl: "",
      embedUrl: "https://www.youtube.com/embed/live_stream?channel=UC4R8DWoMoI7CAwX8_LjQHig",
    },
    {
      id: "afadiat-world",
      name_ur: "افادیت ورلڈ",
      name_en: "Afadiat World",
      desc_ur: "بین الاقوامی اور کھیلوں کی خصوصی نشریات",
      desc_en: "International & Sports Special Coverage",
      isLive: false,
      streamUrl: "",
      embedUrl: "",
    },
  ];
  const [activeChannelId, setActiveChannelId] = useState(channels[0].id);
  const [isPlayerStarted, setIsPlayerStarted] = useState(false);
  const activeChannel = channels.find((c) => c.id === activeChannelId) || channels[0];

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

      <main className="flex-1 u-shell py-5 sm:py-6 space-y-10">

        {/* Editorial Page Header + 2-Column Live TV Layout (Matches Daily Insaf) */}
        <section>
          <header className="border-b border-[#dcd8cd] mb-5 pb-4 sm:mb-6">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl lg:text-[2.125rem] font-black text-gray-950 urdu-headline">
                {isUrdu ? "لائیو ٹی وی" : "Live TV"}
              </h1>
            </div>
            <p className="text-gray-500 mt-1.5 text-sm">
              {isUrdu ? "روزنامہ افادیت کی براہِ راست نشریات۔" : "Daily Afadiat's live broadcast."}
            </p>
          </header>

          <div className="grid gap-5 lg:grid-cols-[1fr_340px] lg:gap-6">
            {/* Left Column: 16:9 Live Video Player + Active Stream Title */}
            <div>
              <div className="relative aspect-video w-full overflow-hidden bg-black rounded-lg border border-[#dcd8cd]">
                {isPlayerStarted && activeChannel.isLive ? (
                  activeChannel.embedUrl ? (
                    <iframe
                      src={`${activeChannel.embedUrl}&autoplay=1`}
                      title={activeChannel.name_en}
                      className="absolute inset-0 w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <video
                      className="absolute inset-0 h-full w-full"
                      controls
                      autoPlay
                      playsInline
                      crossOrigin="anonymous"
                      src={activeChannel.streamUrl || undefined}
                    />
                  )
                ) : (
                  <>
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white/80">
                      <button
                        type="button"
                        aria-label={isUrdu ? activeChannel.name_ur : activeChannel.name_en}
                        onClick={() => activeChannel.isLive && setIsPlayerStarted(true)}
                        className={`group grid place-items-center transition-colors ${
                          activeChannel.isLive ? "cursor-pointer" : "cursor-not-allowed opacity-60"
                        }`}
                      >
                        <span className="bg-red-600/90 grid size-16 place-items-center rounded-full text-white shadow-lg transition-transform group-hover:scale-105">
                          <Play size={26} className="translate-x-0.5" fill="currentColor" />
                        </span>
                      </button>
                      <p className="mt-3 text-xs text-gray-300 max-w-md">
                        {activeChannel.isLive
                          ? isUrdu
                            ? "نشریات چلانے کے لیے پلے بٹن پر کلک کریں"
                            : "Click play to start the live stream"
                          : isUrdu
                          ? "یہ چینل اس وقت آف ایئر ہے"
                          : "This channel is currently Off air"}
                      </p>
                    </div>
                  </>
                )}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <h2 className="text-xl leading-tight sm:text-2xl font-black text-gray-950 urdu-headline">
                  {isUrdu ? activeChannel.name_ur : activeChannel.name_en}
                </h2>
                {activeChannel.isLive ? (
                  <span className="bg-red-600 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold text-white">
                    <span className="size-1.5 animate-pulse rounded-full bg-white" />
                    <span>{isUrdu ? "آن ایئر" : "On air"}</span>
                  </span>
                ) : (
                  <span className="bg-gray-200 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold text-gray-700">
                    <span>{isUrdu ? "آف ایئر" : "Off air"}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Right Column: Vertical Channel Selector List */}
            <ul className="grid content-start gap-2">
              {channels.map((ch) => {
                const isSelected = ch.id === activeChannel.id;
                return (
                  <li key={ch.id}>
                    <button
                      type="button"
                      aria-current={isSelected ? "true" : undefined}
                      onClick={() => {
                        setActiveChannelId(ch.id);
                        setIsPlayerStarted(false);
                      }}
                      className={`rounded-lg flex w-full items-center gap-3 border p-2 text-start transition-colors cursor-pointer ${
                        isSelected
                          ? "border-[#184e2d] bg-[#184e2d]/10"
                          : "border-[#dcd8cd] bg-white hover:border-[#184e2d]"
                      }`}
                    >
                      <span className="relative grid aspect-video w-24 shrink-0 place-items-center overflow-hidden rounded bg-black text-white/85">
                        <Play size={18} fill="currentColor" />
                        {ch.isLive && (
                          <span className="bg-red-600 absolute start-1 top-1 rounded px-1 py-0.5 text-[0.5rem] font-bold text-white">
                            ●
                          </span>
                        )}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-gray-900 leading-snug urdu-headline">
                          {isUrdu ? ch.name_ur : ch.name_en}
                        </span>
                        <span
                          className={`text-xs font-semibold ${
                            ch.isLive ? "text-red-600" : "text-gray-400"
                          }`}
                        >
                          {ch.isLive
                            ? isUrdu ? "آن ایئر" : "On air"
                            : isUrdu ? "آف ایئر" : "Off air"}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* Clean Light Notify Me Card */}
        <div className="bg-[#efeee9] border border-[#dcd8cd] p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-gray-950 urdu-headline">
              {isUrdu ? "خصوصی نشریات کے الرٹس حاصل کریں" : "Get Live Broadcast Alerts"}
            </h3>
            <p className="text-xs text-gray-600">
              {isUrdu ? "کوئی اسپام نہیں • اہم لائیو پروگرامز کی فوری اطلاع" : "No spam • Instant alerts for special live broadcasts"}
            </p>
          </div>
          <div className="w-full md:w-auto md:min-w-[360px]">
              {subscribed ? (
                <div className="p-3 bg-emerald-50 border border-[#184e2d]/40 text-[#184e2d] text-xs font-bold flex items-center justify-center gap-2">
                  <CheckCircle2 size={16} className="text-[#184e2d] shrink-0" />
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
                    dir="ltr"
                    inputMode="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="flex-1 p-3 bg-white border border-[#dcd8cd] text-gray-900 text-xs rounded-none outline-none focus:border-[#184e2d] text-left font-sans"
                  />
                  <button
                    type="submit"
                    className="bg-[#184e2d] hover:bg-[#113820] text-white font-bold text-xs px-5 py-3 rounded-none flex items-center justify-center gap-1.5 transition cursor-pointer shrink-0 uppercase tracking-wider font-sans"
                  >
                    <Bell size={14} />
                    <span>{isUrdu ? "مطلع کریں" : "Notify Me"}</span>
                  </button>
                </form>
              )}
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
