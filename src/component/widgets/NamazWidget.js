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

  useEffect(() => {
    let isMounted = true;
    async function fetchNamaz() {
      setLoading(true);
      try {
        const res = await fetch(
          `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=Pakistan&method=1&school=1`
        );
        const data = await res.json();
        if (isMounted && data.code === 200 && data.data?.timings) {
          setTimings(data.data.timings);
          const h = data.data.date?.hijri;
          if (h) {
            const hStr = isEnglish
              ? `${h.day} ${h.month.en} ${h.year} AH`
              : `${h.day} ${h.month.ar || "جمادی الآخر"} ${h.year}ھ`;
            setHijriDate(hStr);
          }
        }
      } catch (err) {
        console.error("Namaz API error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchNamaz();
    return () => {
      isMounted = false;
    };
  }, [city, isEnglish]);

  // Format 24h to 12h AM/PM
  const formatTime = (time24) => {
    if (!time24) return "";
    const cleanTime = time24.split(" ")[0]; // In case (PKT) is attached
    const [hStr, mStr] = cleanTime.split(":");
    let h = parseInt(hStr, 10);
    const m = mStr;
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12;
    h = h ? h : 12;
    return `${h}:${m} ${ampm}`;
  };

  // Determine current active prayer
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

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
      className={`bg-white border border-[#dcd8cd] rounded shadow-2xs font-sans overflow-hidden ${className}`}
      dir={dir}
    >
      {/* Top Header matching Daily Insaaf */}
      <div className="p-3.5 border-b border-[#eceae3] flex items-center justify-between bg-[#fbfbfa]">
        <div className="flex items-center gap-1.5 text-emerald-800">
          <Moon size={17} className="text-emerald-700" />
          <h3 className={`font-bold text-sm text-gray-900 ${isUrdu ? "urdu-headline text-[15px]" : "font-sans"}`}>
            {isUrdu ? "اوقاتِ نماز" : "Prayer Times"}
          </h3>
        </div>
        <span className="text-[11px] text-gray-500 font-medium tracking-tight">
          {hijriDate}
        </span>
      </div>

      {/* City Switcher Row */}
      <div className="px-3.5 py-2 bg-[#f7f6f3] border-b border-[#eceae3] flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-gray-600 font-medium">
          <MapPin size={13} className="text-emerald-700" />
          <span>{isUrdu ? "شہر:" : "City:"}</span>
        </div>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="text-xs bg-white border border-[#dcd8cd] rounded px-2 py-0.5 text-gray-800 font-medium focus:outline-none focus:border-emerald-600 cursor-pointer"
        >
          {CITIES.map((c) => (
            <option key={c.id} value={c.id}>
              {isUrdu ? c.name_ur : c.name_en}
            </option>
          ))}
        </select>
      </div>

      <div className="p-3.5">
        {/* Suhoor & Iftar Dual Callout Cards (Daily Insaaf signature design) */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          {/* Suhoor / سحری */}
          <div className="bg-[#1f5f3e] text-white p-2.5 rounded text-center shadow-2xs">
            <div className="flex items-center justify-center gap-1 text-[11px] text-emerald-100 font-medium mb-0.5">
              <Sunrise size={13} />
              <span>{isUrdu ? "سحری" : "Suhoor"}</span>
            </div>
            <div className="text-base font-extrabold tracking-tight font-sans">
              {formatTime(timings.Fajr)}
            </div>
          </div>

          {/* Iftar / افطار */}
          <div className="bg-[#1f5f3e] text-white p-2.5 rounded text-center shadow-2xs">
            <div className="flex items-center justify-center gap-1 text-[11px] text-emerald-100 font-medium mb-0.5">
              <Sunset size={13} />
              <span>{isUrdu ? "افطار" : "Iftar"}</span>
            </div>
            <div className="text-base font-extrabold tracking-tight font-sans">
              {formatTime(timings.Maghrib)}
            </div>
          </div>
        </div>

        {/* Timetable List with Active Prayer Highlight */}
        <div className="divide-y divide-gray-100 text-xs border border-[#eceae3] rounded overflow-hidden">
          {prayerList.map((prayer) => {
            const isActive = activePrayer === prayer.key;
            return (
              <div
                key={prayer.key}
                className={`flex items-center justify-between px-3 py-2 transition-colors ${
                  isActive
                    ? "bg-[#1f5f3e] text-white font-bold"
                    : "hover:bg-[#fbfbfa] text-gray-700"
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

        {/* Authority / Calculation Method Citation */}
        <p className="text-[10px] text-gray-500 text-center mt-2.5 font-sans leading-tight">
          {isUrdu
            ? "طریقۂ حساب: جامعہ علومِ اسلامیہ، علامہ بنوری ٹاؤن، کراچی"
            : "Method: Jamia Uloom-ul-Islamia Banuri Town, Karachi"}
        </p>
      </div>
    </div>
  );
}
