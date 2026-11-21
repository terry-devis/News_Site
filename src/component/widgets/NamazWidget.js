"use client";
import React, { useState, useEffect } from "react";
import { Moon, Sunrise, Sunset, MapPin } from "lucide-react";
import { useSiteLanguage } from "@/context/SiteLanguageContext";

const CITIES = [
  { id: "Islamabad", name_ur: "اسلام آباد", name_en: "Islamabad" },
  { id: "Lahore", name_ur: "لاہور", name_en: "Lahore" },
  { id: "Karachi", name_ur: "کراچی", name_en: "Karachi" },
  { id: "Peshawar", name_ur: "پشاور", name_en: "Peshawar" },
  { id: "Quetta", name_ur: "کوئٹہ", name_en: "Quetta" },
];

export default function NamazWidget({ className = "" }) {
  const { isUrdu, isEnglish, dir } = useSiteLanguage();
  const [city, setCity] = useState("Islamabad");
  const [timings, setTimings] = useState({
    Fajr: "05:16",
    Sunrise: "06:43",
    Dhuhr: "11:53",
    Asr: "15:25",
    Maghrib: "17:03",
    Isha: "18:29",
  });
  const [hijriDate, setHijriDate] = useState("9 جمادی الآخر 1448ھ");
  const [loading, setLoading] = useState(false);

  // Live clock tracker to update active prayer highlight in real time every 60s
  const [currentMinutes, setCurrentMinutes] = useState(() => {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const d = new Date();
      setCurrentMinutes(d.getHours() * 60 + d.getMinutes());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const CACHE_KEY = `daily_afadiat_namaz_${city}`;
    const TTL = 7200000; // 2 hours (Prayer times only change once per day)

    function applyNamazData(data) {
      if (data?.timings) setTimings(data.timings);
      const h = data?.date?.hijri;
      if (h) {
        const hStr = isEnglish
          ? `${h.day} ${h.month.en} ${h.year} AH`
          : `${h.day} ${h.month.ar || "جمادی الآخر"} ${h.year}ھ`;
        setHijriDate(hStr);
      }
    }

    // 1. Try reading valid cache first (Instant load, 0 network calls!)
    try {
      const cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.data && Date.now() - parsed.fetchedAt < TTL) {
          if (isMounted) applyNamazData(parsed.data);
          return;
        }
      }
    } catch (e) {}

    // 2. Fetch from Aladhan API only when needed
    async function fetchNamaz() {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=Pakistan&method=1&school=1`
        );
        const data = await res.json();
        if (isMounted && data.code === 200 && data.data?.timings) {
          applyNamazData(data.data);
          try {
            sessionStorage.setItem(
              CACHE_KEY,
              JSON.stringify({ data: data.data, fetchedAt: Date.now() })
            );
          } catch (e) {}
        }
      } catch (err) {
        console.error("Namaz API error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchNamaz();
    const interval = setInterval(fetchNamaz, TTL); // Refetch every 2 hours
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [city, isEnglish]);

  // Format 24h to 12h AM/PM
  const formatTime = (time24) => {
    if (!time24) return "";
    const cleanTime = time24.split(" ")[0];
    const [hStr, mStr] = cleanTime.split(":");
    let h = parseInt(hStr, 10);
    const m = mStr;
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12;
    h = h ? h : 12;
    return `${h}:${m} ${ampm}`;
  };

  // Determine current active prayer (using live currentMinutes state)
  const getMinutes = (tStr) => {
    if (!tStr) return 0;
    const [h, m] = tStr.split(" ")[0].split(":").map(Number);
    return h * 60 + m;
  };

  const fMin = getMinutes(timings.Fajr);
  const sMin = getMinutes(timings.Sunrise);
  const dMin = getMinutes(timings.Dhuhr);
  const aMin = getMinutes(timings.Asr);
  const mMin = getMinutes(timings.Maghrib);
  const iMin = getMinutes(timings.Isha);

  let activePrayer = "Fajr";
  if (currentMinutes >= fMin && currentMinutes < sMin) activePrayer = "Fajr";
  else if (currentMinutes >= sMin && currentMinutes < dMin) activePrayer = "Sunrise";
  else if (currentMinutes >= dMin && currentMinutes < aMin) activePrayer = "Dhuhr";
  else if (currentMinutes >= aMin && currentMinutes < mMin) activePrayer = "Asr";
  else if (currentMinutes >= mMin && currentMinutes < iMin) activePrayer = "Maghrib";
  else activePrayer = "Isha";

  const prayerList = [
    { key: "Fajr", name_ur: "فجر", name_en: "Fajr", time: timings.Fajr },
    { key: "Sunrise", name_ur: "طلوعِ آفتاب", name_en: "Sunrise", time: timings.Sunrise },
    { key: "Dhuhr", name_ur: "ظہر", name_en: "Dhuhr", time: timings.Dhuhr },
    { key: "Asr", name_ur: "عصر (حنفی)", name_en: "Asr (Hanafi)", time: timings.Asr },
    { key: "Maghrib", name_ur: "مغرب", name_en: "Maghrib", time: timings.Maghrib },
    { key: "Isha", name_ur: "عشاء", name_en: "Isha", time: timings.Isha },
  ];

  return (
    <div
      className={`bg-white border border-[#dcd8cd] rounded-none shadow-2xs font-sans overflow-hidden ${className}`}
      dir={dir}
    >
      {/* Unified Forest Green Header matching Daily Insaaf Broadsheet Style */}
      <div className="bg-[#0d3822] text-white px-3.5 py-2.5 flex items-center justify-between border-b border-[#072415]">
        <div className="flex items-center gap-1.5">
          <Moon size={16} className="text-yellow-400" />
          <h3 className={`font-bold text-sm text-white ${isUrdu ? "urdu-headline text-[15px]" : "font-sans"}`}>
            {isUrdu ? "اوقاتِ نماز" : "Prayer Times"}
          </h3>
        </div>
        <span className="text-[11px] text-emerald-200 font-sans font-medium tracking-tight">
          {hijriDate}
        </span>
      </div>

      {/* City Switcher Row (Sharp Non-Round) */}
      <div className="px-3.5 py-2 bg-[#f7f6f3] border-b border-[#dcd8cd] flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-gray-700 font-medium">
          <MapPin size={13} className="text-[#0d3822]" />
          <label htmlFor="namaz-city-select">{isUrdu ? "شہر:" : "City:"}</label>
        </div>
        <select
          id="namaz-city-select"
          name="namazCity"
          aria-label={isUrdu ? "نماز کے اوقات کے لیے شہر منتخب کریں" : "Select city for prayer times"}
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="text-xs bg-white border border-[#dcd8cd] rounded-none px-2 py-1 text-gray-900 font-medium focus:outline-none focus:border-[#0d3822] cursor-pointer font-sans"
        >
          {CITIES.map((c) => (
            <option key={c.id} value={c.id}>
              {isUrdu ? c.name_ur : c.name_en}
            </option>
          ))}
        </select>
      </div>

      <div className="p-3.5 space-y-3">
        {/* Suhoor & Iftar Dual Callout Cards (Harmonious Paper Tone & Sharp Edges) */}
        <div className="grid grid-cols-2 gap-2">
          {/* Suhoor */}
          <div className="bg-[#f7f6f3] border border-[#dcd8cd] p-2.5 rounded-none text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] text-[#0d3822] font-bold mb-0.5">
              <Sunrise size={13} />
              <span>{isUrdu ? "سحری" : "Suhoor"}</span>
            </div>
            <div className="text-base font-extrabold text-gray-950 tracking-tight font-sans">
              {formatTime(timings.Fajr)}
            </div>
          </div>

          {/* Iftar */}
          <div className="bg-[#f7f6f3] border border-[#dcd8cd] p-2.5 rounded-none text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] text-[#0d3822] font-bold mb-0.5">
              <Sunset size={13} />
              <span>{isUrdu ? "افطار" : "Iftar"}</span>
            </div>
            <div className="text-base font-extrabold text-gray-950 tracking-tight font-sans">
              {formatTime(timings.Maghrib)}
            </div>
          </div>
        </div>

        {/* Timetable List with Active Prayer Highlight (Classic Broadsheet Sharp Box) */}
        <div className="divide-y divide-[#eceae3] text-xs border border-[#dcd8cd] rounded-none overflow-hidden">
          {prayerList.map((prayer) => {
            const isActive = activePrayer === prayer.key;
            return (
              <div
                key={prayer.key}
                className={`flex items-center justify-between px-3 py-2 transition-colors ${
                  isActive
                    ? "bg-[#0d3822] text-white font-bold"
                    : "hover:bg-[#fbfbfa] text-gray-800"
                }`}
              >
                <span className={isUrdu ? "urdu-body text-[13px]" : "font-sans font-medium"}>
                  {isUrdu ? prayer.name_ur : prayer.name_en}
                </span>
                <span className="font-sans font-bold tracking-tight">
                  {formatTime(prayer.time)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Calculation Method Citation */}
        <p className="text-[10px] text-gray-500 text-center font-sans leading-tight">
          {isUrdu
            ? "طریقۂ حساب: جامعہ علومِ اسلامیہ، علامہ بنوری ٹاؤن، کراچی"
            : "Method: Jamia Uloom-ul-Islamia Banuri Town, Karachi"}
        </p>
      </div>
    </div>
  );
}
