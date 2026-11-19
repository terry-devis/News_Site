"use client";
import React, { useState } from "react";
import { Mail, CheckCircle2 } from "lucide-react";
import { useSiteLanguage } from "@/context/SiteLanguageContext";

export default function NewsletterBox({ variant = "banner", className = "" }) {
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

  // 1. SIDEBAR COMPACT VARIANT (For sidebars)
  if (variant === "compact" || variant === "sidebar") {
    return (
      <div className={`p-4 bg-[#efeee9] border border-[#dcd8cd] rounded-xl font-sans ${className}`} dir={dir}>
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
          <div className="p-2.5 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-300 flex items-center gap-2 font-medium">
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
              className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#dcd8cd] focus:border-emerald-600 outline-none font-sans"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2 rounded-lg transition disabled:opacity-50 cursor-pointer"
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

  // 2. MAIN NEWSLETTER CARD (Clean, Simple, Broadsheet Paper Style - No Extras)
  return (
    <div
      className={`bg-[#efeee9] border border-[#dcd8cd] rounded-2xl p-6 sm:p-8 text-center font-sans ${className}`}
      dir={dir}
    >
      <div className="max-w-xl mx-auto">
        {/* Simple Mail Icon */}
        <div className="size-11 rounded-full bg-emerald-100 text-emerald-800 grid place-items-center mx-auto mb-3 shadow-2xs">
          <Mail size={20} />
        </div>

        {/* Clean Title */}
        <h3 className={`text-xl sm:text-2xl font-bold text-gray-900 mb-1.5 ${isUrdu ? "urdu-headline" : "font-sans"}`}>
          {t("newsletterTitle")}
        </h3>

        {/* Short Subtitle */}
        <p className={`text-xs sm:text-sm text-gray-600 mb-5 ${isUrdu ? "urdu-body leading-relaxed" : "font-sans"}`}>
          {t("newsletterSubtitle")}
        </p>

        {/* Simple Form */}
        {status === "success" ? (
          <div className="p-3 bg-emerald-50 text-emerald-800 text-xs sm:text-sm rounded-xl border border-emerald-300 inline-flex items-center gap-2 font-medium">
            <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
            <span>{message}</span>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              <input
                type="email"
                required
                placeholder={t("newsletterPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`flex-1 h-11 px-3.5 rounded-lg bg-white border border-[#dcd8cd] focus:border-emerald-600 outline-none text-xs sm:text-sm text-gray-900 font-sans shadow-2xs ${isUrdu ? "text-right" : "text-left"}`}
              />

              <button
                type="submit"
                disabled={status === "loading"}
                className="h-11 px-6 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm transition shrink-0 disabled:opacity-50 cursor-pointer shadow-2xs"
              >
                {status === "loading" ? t("subscribing") : t("subscribeBtn")}
              </button>
            </div>

            {status === "error" && (
              <p className="text-xs text-red-600 font-medium mt-2">{message}</p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
