"use client";
import React, { useState } from "react";
import { Mail, CheckCircle2, BellRing } from "lucide-react";
import { useSiteLanguage } from "@/context/SiteLanguageContext";

export default function NewsletterBox({ variant = "ribbon", className = "" }) {
  const { isUrdu, isEnglish, dir, t } = useSiteLanguage();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null); // 'loading', 'success', 'error'
  const [message, setMessage] = useState("");

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setMessage(data.message || t("subscribedSuccess"));
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || (isEnglish ? "Error subscribing." : "سبسکرائب کرنے میں خرابی ہوئی۔"));
      }
    } catch (err) {
      setStatus("error");
      setMessage(isEnglish ? "Network error. Please try again." : "نیٹ ورک خرابی، براہ کرم بعد میں کوشش کریں۔");
    }
  };

  // 0. INLINE DARK-BAR VARIANT (for Homepage Dark Strip)
  if (variant === "inline") {
    return (
      <div className={`w-full font-sans ${className}`} dir={dir}>
        {status === "success" ? (
          <div className="px-3 py-2 bg-emerald-900/70 text-emerald-100 text-xs border border-emerald-500/40 flex items-center gap-2 font-medium">
            <CheckCircle2 size={14} className="shrink-0 text-emerald-300" />
            <span>{message}</span>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="email"
              required
              placeholder={t("newsletterPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 min-w-0 text-xs px-3 py-2 bg-white text-gray-900 border border-white/20 focus:border-emerald-400 outline-none"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 transition disabled:opacity-50 cursor-pointer shrink-0"
            >
              {status === "loading" ? t("subscribing") : t("subscribeBtn")}
            </button>
          </form>
        )}
        {status === "error" && (
          <p className="text-[11px] text-red-300 mt-1">{message}</p>
        )}
      </div>
    );
  }

  // 1. SIDEBAR / COMPACT VARIANT
  if (variant === "compact" || variant === "sidebar") {
    return (
      <div className={`p-4 bg-[#efeee9] border border-[#dcd8cd] rounded-none font-sans ${className}`} dir={dir}>
        <div className="flex items-center gap-2 mb-2 text-emerald-800">
          <Mail size={16} />
          <h4 className={`font-bold text-sm text-gray-900 ${isUrdu ? "urdu-headline" : "font-sans"}`}>
            {t("newsletterTitle")}
          </h4>
        </div>
        <p className={`text-xs text-gray-600 mb-3 ${isUrdu ? "urdu-body leading-relaxed" : "font-sans"}`}>
          {t("newsletterSubtitle")}
        </p>

        {status === "success" ? (
          <div className="p-2.5 bg-emerald-50 text-emerald-800 text-xs rounded-none border border-emerald-300 flex items-center gap-2 font-medium">
            <CheckCircle2 size={15} className="shrink-0 text-emerald-600" />
            <span>{message}</span>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="space-y-2">
            <input
              type="email"
              required
              placeholder={t("newsletterPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full text-xs p-2.5 rounded-none bg-white border border-[#dcd8cd] focus:border-emerald-700 outline-none font-sans"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold py-2 rounded-none transition disabled:opacity-50 cursor-pointer"
            >
              {status === "loading" ? t("subscribing") : t("subscribeBtn")}
            </button>
            {status === "error" && (
              <p className="text-[11px] text-red-600 font-medium">{message}</p>
            )}
          </form>
        )}
      </div>
    );
  }

  // 2. FULL-WIDTH BROADSHEET RIBBON (Desktop & Mobile Optimized)
  return (
    <section
      className={`w-full bg-[#efeee9] border border-[#dcd8cd] rounded-none p-5 sm:p-6 lg:p-7 shadow-xs font-sans ${className}`}
      dir={dir}
      aria-label={t("newsletterTitle")}
    >
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 lg:gap-8">
        
        {/* Leading Content: Icon, Title, and Editorial Subtitle */}
        <div className="flex items-start sm:items-center gap-3.5 sm:gap-4 flex-1">
          <div className="w-11 h-11 sm:w-12 sm:h-12 shrink-0 bg-emerald-800 text-white flex items-center justify-center rounded-none shadow-xs">
            <Mail size={22} className="sm:size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-emerald-100 text-emerald-900 text-[10px] font-bold px-2 py-0.5 rounded-none uppercase font-sans tracking-wide">
                {isUrdu ? "روزانہ کا نیوز لیٹر" : "MORNING BRIEFING"}
              </span>
              <span className="text-gray-400 text-xs hidden sm:inline">•</span>
              <span className="text-xs text-gray-500 font-sans hidden sm:inline">
                {isUrdu ? "مفت سبسکرپشن" : "Free Subscription"}
              </span>
            </div>
            <h3 className={`text-lg sm:text-xl font-black text-gray-950 leading-snug ${isUrdu ? "urdu-headline" : "font-sans"}`}>
              {t("newsletterTitle")}
            </h3>
            <p className={`text-xs sm:text-[13px] text-gray-600 mt-1 max-w-xl ${isUrdu ? "urdu-body leading-relaxed" : "font-sans leading-normal"}`}>
              {t("newsletterSubtitle")}
            </p>
          </div>
        </div>

        {/* Action Form: Inline Email Input & Subscribe Button */}
        <div className="w-full lg:w-auto shrink-0">
          {status === "success" ? (
            <div className="p-3 bg-emerald-50 text-emerald-900 text-xs sm:text-sm rounded-none border border-emerald-300 flex items-center gap-2 font-medium">
              <CheckCircle2 size={18} className="shrink-0 text-emerald-700" />
              <span>{message}</span>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="w-full sm:w-[380px] lg:w-[420px]">
              <div className="flex items-stretch rounded-none border border-[#c8c4b7] focus-within:border-emerald-700 bg-white shadow-2xs">
                <input
                  type="email"
                  required
                  placeholder={t("newsletterPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`flex-1 h-11 px-3.5 sm:px-4 bg-transparent outline-none text-xs sm:text-sm text-gray-900 font-sans ${isUrdu ? "text-right" : "text-left"}`}
                />
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="h-11 px-5 sm:px-6 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs sm:text-sm transition shrink-0 disabled:opacity-50 cursor-pointer flex items-center justify-center whitespace-nowrap rounded-none font-sans"
                >
                  {status === "loading" ? t("subscribing") : t("subscribeBtn")}
                </button>
              </div>
              {status === "error" && (
                <p className="text-xs text-red-600 font-medium mt-1.5">{message}</p>
              )}
            </form>
          )}
        </div>

      </div>
    </section>
  );
}
