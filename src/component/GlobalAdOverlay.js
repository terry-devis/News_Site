"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { X, ChevronDown, ChevronUp } from "lucide-react";

const DISMISS_STORAGE_KEY = "afadiat_ad_overlay_dismissed_until";
const DISMISS_SESSION_KEY = "afadiat_ad_overlay_dismissed_session";
const INJECTED_MARKER = "data-afadiat-global-ads";

export default function GlobalAdOverlay() {
  const pathname = usePathname();
  const isAdmin =
    process.env.NEXT_PUBLIC_APP_ROLE === "admin" ||
    (pathname && pathname.startsWith("/admin"));

  const [config, setConfig] = useState(null);
  const [visible, setVisible] = useState(false);
  const [folded, setFolded] = useState(false);
  const overlayHostRef = useRef(null);
  const impressionSentRef = useRef(false);

  // 1. Fetch global ad network config once on public pages
  useEffect(() => {
    if (isAdmin) return;
    let active = true;
    fetch("/api/ads", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active && data?.networkConfig) {
          setConfig(data.networkConfig);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [isAdmin]);

  // 2. Inject Google AdSense / Adsterra / Monetag global scripts once
  useEffect(() => {
    if (isAdmin || !config) return;
    if (document.querySelector(`[${INJECTED_MARKER}]`)) return;

    const marker = document.createElement("meta");
    marker.setAttribute(INJECTED_MARKER, "1");
    document.head.appendChild(marker);

    if (config.adsense_client_id) {
      const clientId = config.adsense_client_id.trim();
      const s = document.createElement("script");
      s.async = true;
      s.crossOrigin = "anonymous";
      s.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(
        clientId
      )}`;
      document.head.appendChild(s);
    }

    if (config.global_head_scripts && config.global_head_scripts.trim()) {
      try {
        const range = document.createRange();
        range.selectNode(document.head);
        const frag = range.createContextualFragment(config.global_head_scripts);
        document.head.appendChild(frag);
      } catch {}
    }
  }, [isAdmin, config]);

  // 3. Non-aggressive delayed overlay display with optional cooldown
  useEffect(() => {
    if (isAdmin || !config?.overlay_enabled) return;
    const hasContent = Boolean(config.overlay_html_code || config.overlay_image_url);
    if (!hasContent) return;

    try {
      if (config.overlay_once_per_session && sessionStorage.getItem(DISMISS_SESSION_KEY) === "1") {
        return;
      }
      const cooldownSecs = Number(config.overlay_cooldown_seconds || 0);
      if (cooldownSecs > 0) {
        const until = Number(localStorage.getItem(DISMISS_STORAGE_KEY) || 0);
        if (until > Date.now()) return;
      }
    } catch {}

    const delayMs = Math.max(0, Number(config.overlay_delay_seconds ?? 3)) * 1000;
    const timer = setTimeout(() => {
      setVisible(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [isAdmin, config]);

  // 4. Execute overlay HTML/script when visible & track impression once
  useEffect(() => {
    if (!visible || !config) return;

    if (!impressionSentRef.current) {
      impressionSentRef.current = true;
      fetch("/api/ads/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotKey: "global-overlay", type: "impression" }),
        keepalive: true,
      }).catch(() => {});
    }

    if (config.overlay_html_code && overlayHostRef.current) {
      const host = overlayHostRef.current;
      host.innerHTML = "";
      try {
        const range = document.createRange();
        range.selectNode(host);
        const frag = range.createContextualFragment(config.overlay_html_code);
        host.appendChild(frag);
      } catch {
        host.innerHTML = config.overlay_html_code;
      }
    }
  }, [visible, config]);

  if (isAdmin || !visible || !config) return null;

  const handleDismiss = () => {
    setVisible(false);
    try {
      if (config.overlay_once_per_session) {
        sessionStorage.setItem(DISMISS_SESSION_KEY, "1");
      }
      const cooldownSecs = Math.max(0, Number(config.overlay_cooldown_seconds || 0));
      if (cooldownSecs > 0) {
        localStorage.setItem(
          DISMISS_STORAGE_KEY,
          String(Date.now() + cooldownSecs * 1000)
        );
      } else {
        localStorage.removeItem(DISMISS_STORAGE_KEY);
      }
    } catch {}
  };

  const handleTrackClick = () => {
    try {
      const payload = JSON.stringify({ slotKey: "global-overlay", type: "click" });
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/ads/track",
          new Blob([payload], { type: "application/json" })
        );
        return;
      }
      fetch("/api/ads/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    } catch {}
  };

  const renderAdContent = (maxHeightClass = "max-h-24") =>
    config.overlay_html_code ? (
      <div
        ref={overlayHostRef}
        onClick={handleTrackClick}
        className="w-full overflow-hidden flex items-center justify-center"
      />
    ) : (
      <a
        href={config.overlay_click_url || "/advertise"}
        onClick={handleTrackClick}
        target={config.overlay_click_url?.startsWith("http") ? "_blank" : undefined}
        rel={
          config.overlay_click_url?.startsWith("http")
            ? "noopener noreferrer sponsored"
            : undefined
        }
        className="block overflow-hidden rounded-lg"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={config.overlay_image_url}
          alt="Sponsored advertisement"
          className={`w-full ${maxHeightClass} object-contain mx-auto`}
        />
      </a>
    );

  const pos = config.overlay_position || "bottom-anchor";

  // Mode 1: Centered Vignette Modal (Mobile / AdSense Vignette Style)
  if (pos === "vignette") {
    return (
      <div
        dir="ltr"
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        onClick={handleDismiss}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative bg-white border border-[#dcd8cd] rounded-2xl shadow-2xl max-w-md w-full p-3 pt-4 space-y-2"
        >
          <div className="flex items-center justify-between px-1 pb-1 border-b border-[#efeee9]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
              Sponsored
            </span>
            <button
              type="button"
              onClick={handleDismiss}
              aria-label="Close advertisement"
              className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700 hover:text-red-600 bg-gray-100 hover:bg-red-50 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
            >
              <X size={13} />
              <span>Close</span>
            </button>
          </div>
          {renderAdContent("max-h-[65vh]")}
        </div>
      </div>
    );
  }

  // Mode 2: Bottom Corner Card
  if (pos === "bottom-corner") {
    return (
      <div dir="ltr" className="fixed bottom-4 right-4 z-40 max-w-[340px] w-[calc(100vw-2rem)]">
        <div className="relative bg-white/95 backdrop-blur-md border border-[#dcd8cd] rounded-xl shadow-2xl p-2 pt-3">
          <span className="absolute -top-2.5 left-3 bg-[#184e2d] text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
            Sponsored
          </span>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Close advertisement"
            className="absolute -top-2.5 right-2.5 size-6 rounded-full bg-gray-900 hover:bg-red-600 text-white flex items-center justify-center shadow-md transition-colors cursor-pointer"
          >
            <X size={13} />
          </button>
          {renderAdContent("max-h-32")}
        </div>
      </div>
    );
  }

  // Mode 3: AdSense-Style Collapsible Anchor (Top or Bottom) with Fold/Unfold Arrow + Close
  const isTop = pos === "top-anchor";

  return (
    <div
      dir="ltr"
      className={`fixed left-0 right-0 z-40 flex justify-center pointer-events-none ${
        isTop ? "top-0" : "bottom-0"
      }`}
    >
      <div className="relative pointer-events-auto w-full max-w-[760px] bg-white/95 backdrop-blur-md border border-[#dcd8cd] shadow-2xl transition-all duration-200">
        {/* AdSense-style top/bottom control tab with Fold/Unfold + Close */}
        <div
          className={`absolute right-3 flex items-center gap-1 ${
            isTop ? "-bottom-6" : "-top-6"
          }`}
        >
          <button
            type="button"
            onClick={() => setFolded((f) => !f)}
            aria-label={folded ? "Expand ad" : "Collapse ad"}
            title={folded ? "Unfold ad" : "Fold ad"}
            className="h-6 px-2.5 bg-white border border-[#dcd8cd] text-gray-700 hover:text-[#184e2d] flex items-center gap-1 text-[10px] font-bold shadow-xs cursor-pointer rounded-sm"
          >
            {isTop ? (
              folded ? <ChevronDown size={13} /> : <ChevronUp size={13} />
            ) : folded ? (
              <ChevronUp size={13} />
            ) : (
              <ChevronDown size={13} />
            )}
            <span>{folded ? "Ad" : "Hide"}</span>
          </button>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Close advertisement"
            title="Close ad"
            className="h-6 w-6 bg-gray-900 hover:bg-red-600 text-white flex items-center justify-center shadow-xs cursor-pointer rounded-sm"
          >
            <X size={12} />
          </button>
        </div>

        {!folded && (
          <div className="p-1.5 sm:p-2 relative">
            <span className="absolute top-1 left-1.5 bg-black/60 text-white text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-wider z-10">
              AD
            </span>
            {renderAdContent("max-h-20 sm:max-h-24")}
          </div>
        )}
      </div>
    </div>
  );
}
