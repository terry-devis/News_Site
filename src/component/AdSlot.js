"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Megaphone, ExternalLink, Info } from "lucide-react";

export default function AdSlot({ slotKey, title = "اشتہار", className = "" }) {
  const [ad, setAd] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchAd() {
      try {
        const res = await fetch(`/api/ads?slot=${slotKey}`);
        const data = await res.json();
        if (isMounted && data.slot) {
          setAd(data.slot);
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

  if (loading) {
    return null;
  }

  // If slot is deactivated from CMS, render nothing
  if (!ad || !ad.is_active) {
    return null;
  }

  // 1. Custom Uploaded Image Banner
  if (ad.ad_type === "image" && ad.image_url) {
    return (
      <div className={`relative my-4 text-center ${className}`}>
        <div className="relative inline-block overflow-hidden border border-[#dcd8cd] bg-[#efeee9] shadow-2xs">
          <span className="absolute top-1 start-1 z-10 bg-black/65 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-none font-sans uppercase tracking-wider">
            اشتہار
          </span>
          <a
            href={ad.target_url || "#"}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="block hover:opacity-95 transition"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ad.image_url}
              alt={ad.title || "اشتہار"}
              className="max-w-full h-auto object-contain mx-auto"
              style={{ maxHeight: "250px" }}
            />
          </a>
        </div>
      </div>
    );
  }

  // 2. Custom Code Snippet (Google AdSense / Custom Script)
  if (ad.ad_type === "code" && ad.code_snippet) {
    return (
      <div className={`relative my-4 text-center ${className}`}>
        <span className="block text-[10px] text-gray-400 font-sans tracking-widest uppercase mb-1">
          — اسپانسر شدہ —
        </span>
        <div
          className="inline-block max-w-full overflow-hidden"
          dangerouslySetInnerHTML={{ __html: ad.code_snippet }}
        />
      </div>
    );
  }

  // 3. Optimized Native Broadsheet House Ad Frame (Matches Daily Insaaf Sleek Layout)
  const isSidebar = slotKey.includes("sidebar") || slotKey.includes("300x250");

  if (isSidebar) {
    return (
      <div className={`relative border border-[#dcd8cd] bg-[#efeee9] p-4 text-center shadow-xs ${className}`}>
        <span className="absolute top-1.5 start-1.5 bg-black/65 text-white text-[9px] font-bold px-1.5 py-0.5 font-sans uppercase">
          اشتہار
        </span>
        <div className="flex flex-col items-center justify-center min-h-[200px] py-2">
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
            پریمیم بینر اور اسپانسرڈ پوسٹس کے لیے دستیاب
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

  // Horizontal Leaderboard Format (e.g. 728x90, 970x90, mid banner)
  return (
    <div className={`relative border border-[#dcd8cd] bg-[#efeee9] px-4 py-3 shadow-xs overflow-hidden ${className}`}>
      <div className="flex items-center gap-1 absolute top-1 start-1.5">
        <span className="bg-black/65 text-white text-[9px] font-bold px-1.5 py-0.5 font-sans uppercase">
          اشتہار
        </span>
        <button
          type="button"
          title="معاوضہ شدہ اشتہار سلاٹ"
          className="size-3.5 rounded-full bg-black/40 text-white text-[9px] flex items-center justify-center font-sans hover:bg-black/60"
        >
          i
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 min-h-[64px] pt-2 sm:pt-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-emerald-700/10 flex items-center justify-center text-emerald-800 shrink-0">
            <Megaphone size={16} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-gray-900 urdu-headline">
                ڈیلی افادیت ای پیپر و آن لائن اشتہارات
              </span>
              <span className="text-[10px] bg-emerald-700/15 text-emerald-900 px-1.5 py-0.2 rounded font-sans font-semibold">
                Verified Reach
              </span>
            </div>
            <p className="text-[11px] text-gray-500 font-sans mt-0.5">
              اپنا کمرشل بینر شائع کروانے کے لیے رابطہ کریں: <span className="font-semibold text-gray-700">ads@dailyafadiat.com</span> • <span className="font-semibold text-gray-700">051-111-232-342</span>
            </p>
          </div>
        </div>

        <Link
          href="/advertise"
          className="inline-flex items-center gap-1 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold px-3 py-1.5 transition font-sans shrink-0"
        >
          <span>اشتہار بک کریں</span>
          <ExternalLink size={11} />
        </Link>
      </div>
    </div>
  );
}
