"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";

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
    return null; // Silent load
  }

  // If slot is deactivated from CMS, render nothing
  if (!ad || !ad.is_active) {
    return null;
  }

  // 1. Image Banner
  if (ad.ad_type === "image" && ad.image_url) {
    return (
      <div className={`relative my-4 text-center ${className}`}>
        <span className="block text-[10px] text-gray-400 font-sans tracking-widest uppercase mb-1">
          — اشتہار —
        </span>
        <a
          href={ad.target_url || "#"}
          target="_blank"
          rel="noopener noreferrer sponsored"
          className="inline-block relative overflow-hidden rounded border border-[#dcd8cd] shadow-xs hover:opacity-95 transition"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ad.image_url}
            alt={ad.title || "اشتہار"}
            className="max-w-full h-auto object-contain mx-auto rounded"
            style={{ maxHeight: "250px" }}
          />
        </a>
      </div>
    );
  }

  // 2. Custom Code Snippet (Google AdSense / HTML Script)
  if (ad.ad_type === "code" && ad.code_snippet) {
    return (
      <div className={`my-4 text-center ${className}`}>
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

  // 3. Fallback placeholder (visible if ad slot is active but no image has been uploaded yet)
  return (
    <div className={`my-3 p-4 bg-[#efeee9]/60 border border-dashed border-[#dcd8cd] rounded text-center text-xs text-gray-500 font-sans ${className}`}>
      <span className="font-semibold text-emerald-800">{ad.title || title}</span>
      <p className="text-[11px] text-gray-400 mt-0.5">
        اس جگہ اشتہار دینے کے لیے ہم سے رابطہ کریں یا CMS ایڈمن پینل سے بینر اپلوڈ کریں۔
      </p>
    </div>
  );
}
