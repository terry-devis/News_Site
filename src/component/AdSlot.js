"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Megaphone, ExternalLink } from "lucide-react";

const adSlotCache = new Map();
const adSlotPromises = new Map();
const AD_CACHE_TTL_MS = 60_000;

function pickWeightedCreative(creatives = [], isMobile = false) {
  const now = Date.now();
  const eligible = (creatives || []).filter((c) => {
    if (!c || c.is_active === false || c.status === "pause" || c.status === "paused") return false;
    if (c.runs_on === "desktop" && isMobile) return false;
    if (c.runs_on === "mobile" && !isMobile) return false;
    if (c.starts_at && new Date(c.starts_at).getTime() > now) return false;
    if (c.ends_at && new Date(c.ends_at).getTime() < now) return false;
    return Boolean(c.image_url || c.html_code);
  });

  if (eligible.length === 0) return null;
  if (eligible.length === 1) return eligible[0];

  const totalWeight = eligible.reduce((sum, c) => sum + Math.max(1, Number(c.weight) || 1), 0);
  let r = Math.random() * totalWeight;
  for (const c of eligible) {
    r -= Math.max(1, Number(c.weight) || 1);
    if (r <= 0) return c;
  }
  return eligible[0];
}

export default function AdSlot({ slotKey, title = "اشتہار", className = "" }) {
  const [slot, setSlot] = useState(null);
  const [creative, setCreative] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    async function fetchAd() {
      try {
        const now = Date.now();
        const cached = adSlotCache.get(slotKey);
        if (cached && now - cached.ts < AD_CACHE_TTL_MS) {
          if (isMounted) {
            if (cached.data.slot) setSlot(cached.data.slot);
            if (Array.isArray(cached.data.creatives)) {
              setCreative(pickWeightedCreative(cached.data.creatives, isMobile));
            }
            setLoading(false);
          }
          return;
        }

        let reqPromise = adSlotPromises.get(slotKey);
        if (!reqPromise) {
          reqPromise = fetch(`/api/ads?slot=${encodeURIComponent(slotKey)}`)
            .then((res) => res.json())
            .then((data) => {
              adSlotCache.set(slotKey, { data, ts: Date.now() });
              adSlotPromises.delete(slotKey);
              return data;
            })
            .catch((err) => {
              adSlotPromises.delete(slotKey);
              throw err;
            });
          adSlotPromises.set(slotKey, reqPromise);
        }

        const data = await reqPromise;
        if (!isMounted) return;
        if (data.slot) setSlot(data.slot);
        if (Array.isArray(data.creatives)) {
          setCreative(pickWeightedCreative(data.creatives, isMobile));
        }
      } catch (err) {
        console.error("Ad fetch error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    fetchAd();
    return () => {
      isMounted = false;
    };
  }, [slotKey]);

  if (loading) return null;
  if (slot && !slot.is_active) return null;

  // 1. Active Creative Image Banner
  const imgUrl = creative?.image_url || (slot?.ad_type === "image" ? slot.image_url : "");
  const clickUrl = creative?.click_url || slot?.target_url || "/advertise";
  const imgAlt = creative?.image_alt || creative?.name || slot?.name || title;

  if (imgUrl) {
    const isTallSidebar = slotKey.includes("sidebar");
    return (
      <div className={`relative text-center ${className}`}>
        <div className="relative inline-block w-full overflow-hidden border border-[#dcd8cd] bg-[#efeee9] shadow-2xs">
          <span className="absolute top-1 start-1 z-10 bg-black/65 text-white text-[9px] font-bold px-1.5 py-0.5 font-sans uppercase tracking-wider">
            اشتہار
          </span>
          <a
            href={clickUrl}
            target={clickUrl.startsWith("http") ? "_blank" : undefined}
            rel={clickUrl.startsWith("http") ? "noopener noreferrer sponsored" : undefined}
            className="block hover:opacity-95 transition"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgUrl}
              alt={imgAlt}
              className="w-full h-auto object-contain mx-auto"
              style={{ maxHeight: isTallSidebar ? "600px" : "250px" }}
            />
          </a>
        </div>
      </div>
    );
  }

  // 2. HTML / AdSense Snippet
  const htmlCode = creative?.html_code || (slot?.ad_type === "code" ? slot.code_snippet : "");
  if (htmlCode) {
    return (
      <div className={`relative text-center ${className}`}>
        <span className="block text-[10px] text-gray-400 font-sans tracking-widest uppercase mb-1">
          — اسپانسر شدہ —
        </span>
        <div
          className="inline-block max-w-full overflow-hidden"
          dangerouslySetInnerHTML={{ __html: htmlCode }}
        />
      </div>
    );
  }

  // 3. If neither slot nor creative is active/present, hide if slot wasn't found
  if (!slot) return null;

  // 4. Native Broadsheet House Ad Frame
  const isTallSidebar = slotKey.includes("sidebar");
  const isMpu = slotKey.includes("mpu") || slotKey.includes("300x250");

  if (isTallSidebar || isMpu) {
    return (
      <div
        className={`relative border border-[#dcd8cd] bg-[#efeee9] p-4 text-center shadow-xs ${
          isTallSidebar ? "mx-auto w-full max-w-[300px]" : ""
        } ${className}`}
      >
        <span className="absolute top-1.5 start-1.5 bg-black/65 text-white text-[9px] font-bold px-1.5 py-0.5 font-sans uppercase">
          اشتہار
        </span>
        <div
          className={`flex flex-col items-center justify-center py-2 ${
            isTallSidebar ? "min-h-[320px] sm:min-h-[540px]" : "min-h-[210px]"
          }`}
        >
          <div className="w-10 h-10 rounded-full bg-emerald-700/10 flex items-center justify-center text-emerald-800 mb-2">
            <Megaphone size={18} />
          </div>
          <span className="text-[11px] font-bold text-gray-400 font-sans uppercase tracking-widest mb-1">
            ڈیلی افادیت ڈیجیٹل میڈیا
          </span>
          <h4 className="text-sm font-bold text-gray-900 urdu-headline mb-1.5 max-w-[220px]">
            ملک بھر کے لاکھوں قارئین تک اپنا برانڈ پہنچائیں
          </h4>
          <p className="text-[11px] text-gray-500 font-sans mb-3">
            {isTallSidebar ? "300×600 ہاف پیج" : "300×250 ایم پی یو"} بینر کے لیے دستیاب
          </p>
          <Link
            href="/advertise"
            className="inline-flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-3 py-1.5 transition font-sans"
          >
            <span>اشتہار بُک کریں</span>
            <ExternalLink size={11} />
          </Link>
        </div>
      </div>
    );
  }

  // Horizontal Leaderboard / Billboard / In-feed Frame
  const isBillboard = slotKey === "footer-strip" || slotKey.includes("billboard");
  return (
    <div
      className={`relative border border-[#dcd8cd] bg-[#efeee9] px-5 py-4 shadow-xs overflow-hidden flex items-center ${
        isBillboard ? "min-h-[110px] sm:min-h-[150px]" : "min-h-[82px] sm:min-h-[100px]"
      } ${className}`}
    >
      <span className="absolute top-1 start-1.5 bg-black/60 text-white text-[8px] font-bold px-1.5 py-0.5 font-sans uppercase tracking-wider">
        اشتہار
      </span>
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 sm:pt-0 sm:ps-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-800/10 flex items-center justify-center text-emerald-800 shrink-0">
            <Megaphone size={16} />
          </div>
          <div className="text-center sm:text-start">
            <h4 className="text-sm sm:text-base font-bold text-gray-900 urdu-headline">
              ڈیلی افادیت پر اشتہار کے لیے رابطہ کریں
            </h4>
            <p className="text-[11px] sm:text-xs text-gray-500 font-sans">
              روزانہ لاکھوں قارئین تک رسائی • {isBillboard ? "970×250 / 970×90" : slot.sizes || "728×90 / 970×90"}
            </p>
          </div>
        </div>
        <Link
          href="/advertise"
          className="inline-flex items-center gap-1.5 bg-[#184e2d] hover:bg-[#113820] text-white text-xs sm:text-sm font-bold px-4 py-2 transition shrink-0 font-sans"
        >
          <span>بُک کریں</span>
          <ExternalLink size={12} />
        </Link>
      </div>
    </div>
  );
}
