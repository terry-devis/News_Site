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
        <div className="flex items-center gap-2 mb-2 text-gray-600">
          <Mail size={15} />
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
              className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#dcd8cd] focus:border-gray-500 outline-none font-sans"
            />
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-gray-800 hover:bg-gray-900 text-white text-xs font-bold py-2 rounded-lg transition disabled:opacity-50 cursor-pointer"
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

  // 2. MAIN NEWSLETTER CARD — Compact, clean, newspaper style
  return (
    <div
      className={`bg-[#efeee9] border border-[#dcd8cd] rounded-xl p-4 sm:p-5 text-center font-sans ${className}`}
      dir={dir}
    >
      <div className="max-w-lg mx-auto">
        {/* Plain Mail Icon — no background color */}
        <Mail size={22} className="text-gray-500 mx-auto mb-2" />

        {/* Title */}
        <h3 className={`text-lg sm:text-xl font-bold text-gray-900 mb-1 ${isUrdu ? "urdu-headline" : "font-sans"}`}>
          {t("newsletterTitle")}
        </h3>

        {/* Subtitle */}
        <p className={`text-xs text-gray-500 mb-3 ${isUrdu ? "urdu-body leading-relaxed" : "font-sans"}`}>
          {t("newsletterSubtitle")}
        </p>

        {/* Form */}
        {status === "success" ? (
          <div className="p-2.5 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-300 inline-flex items-center gap-2 font-medium">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
            <span>{message}</span>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="max-w-sm mx-auto">
            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              <input
                type="email"
                required
                placeholder={t("newsletterPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`flex-1 h-10 px-3 rounded-lg bg-white border border-[#dcd8cd] focus:border-gray-500 outline-none text-xs text-gray-900 font-sans ${isUrdu ? "text-right" : "text-left"}`}
              />

              <button
                type="submit"
                disabled={status === "loading"}
                className="h-10 px-5 rounded-lg bg-gray-800 hover:bg-gray-900 text-white font-bold text-xs transition shrink-0 disabled:opacity-50 cursor-pointer"
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
