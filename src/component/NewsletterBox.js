"use client";
import React, { useState } from "react";
import { Mail, CheckCircle2, ShieldCheck, ArrowLeft, ArrowRight, BellRing } from "lucide-react";
import { useSiteLanguage } from "@/context/SiteLanguageContext";

export default function NewsletterBox({ variant = "dark", className = "" }) {
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

  // 1. LIGHT VARIANT (For Article Sidebars & Cards)
  if (variant === "light") {
    return (
      <div className={`p-4 sm:p-5 bg-[#efeee9] border border-[#dcd8cd] rounded-xl shadow-xs font-sans ${className}`} dir={dir}>
        <div className="flex items-center gap-2 mb-2 text-emerald-800">
          <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-800">
            <Mail size={16} />
          </div>
          <div>
            <h4 className={`font-bold text-sm text-gray-900 ${isUrdu ? "urdu-headline" : "font-sans"}`}>
              {t("newsletterTitle")}
            </h4>
            <span className="text-[10px] text-emerald-700 font-semibold block">
              {isEnglish ? "Free Daily Edition" : "مفت روزانہ ایڈیشن"}
            </span>
          </div>
        </div>
        <p className={`text-xs text-gray-600 mb-3 leading-relaxed ${isUrdu ? "urdu-body" : "font-sans"}`}>
          {t("newsletterSubtitle")}
        </p>

        {status === "success" ? (
          <div className="p-3 bg-emerald-50 text-emerald-800 text-xs rounded-lg border border-emerald-300 flex items-center gap-2 font-medium">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
            <span>{message}</span>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="space-y-2">
            <div className="relative">
              <input
                type="email"
                required
                placeholder={t("newsletterPlaceholder")}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full text-xs p-2.5 rounded-lg bg-white border border-[#dcd8cd] focus:border-emerald-600 outline-none text-left font-sans shadow-inner ${isUrdu ? "pr-8" : "pl-8"}`}
              />
              <Mail size={13} className={`absolute ${isUrdu ? "right-2.5" : "left-2.5"} top-1/2 -translate-y-1/2 text-gray-400`} />
            </div>

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2 rounded-lg transition flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
            >
              <span>{status === "loading" ? t("subscribing") : t("subscribeBtn")}</span>
              {isUrdu ? <ArrowLeft size={13} /> : <ArrowRight size={13} />}
            </button>

            {status === "error" && (
              <p className="text-[11px] text-red-600 font-medium">{message}</p>
            )}

            <div className="flex items-center justify-center gap-1 text-[10px] text-gray-400 pt-1">
              <ShieldCheck size={11} className="text-emerald-700" />
              <span>{isEnglish ? "We respect your privacy. No spam ever." : "ہم آپ کی پرائیویسی کا مکمل احترام کرتے ہیں۔"}</span>
            </div>
          </form>
        )}
      </div>
    );
  }

  // 2. DARK EDITORIAL VARIANT (Full-Width Broadsheet Ribbon for Homepage)
  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#06190f] via-[#0b2416] to-[#04120a] border border-emerald-900/60 p-6 sm:p-8 text-white shadow-md font-sans ${className}`}
      dir={dir}
    >
      {/* Background Decorative Pattern & Glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
      <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-400/5 rounded-full blur-2xl pointer-events-none -ml-20 -mb-20" />

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        
        {/* Content side */}
        <div className="space-y-2 md:max-w-md">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-900/80 border border-emerald-700/60 text-emerald-300 text-[11px] font-bold tracking-wide">
            <BellRing size={12} className="animate-pulse text-amber-400" />
            <span>{isEnglish ? "Free Daily Alert Service" : "مفت روزانہ نیوز لیٹر سروس"}</span>
          </div>

          <h3 className={`text-xl sm:text-2xl font-bold text-white leading-snug ${isUrdu ? "urdu-headline" : "font-sans"}`}>
            {t("newsletterTitle")}
          </h3>

          <p className={`text-xs sm:text-[13px] text-gray-300 leading-relaxed ${isUrdu ? "urdu-body" : "font-sans"}`}>
            {t("newsletterSubtitle")}
          </p>

          <div className="flex items-center gap-3 text-[11px] text-emerald-400/90 pt-1 font-medium">
            <span className="flex items-center gap-1">
              <ShieldCheck size={12} />
              <span>{isEnglish ? "100% Free" : "۱۰۰٪ مفت"}</span>
            </span>
            <span>•</span>
            <span>{isEnglish ? "No Spam" : "کوئی اسپام نہیں"}</span>
            <span>•</span>
            <span>{isEnglish ? "Unsubscribe anytime" : "کسی بھی وقت ان سبسکرائب کریں"}</span>
          </div>
        </div>

        {/* Form side */}
        <div className="w-full md:w-auto md:min-w-[340px]">
          {status === "success" ? (
            <div className="bg-emerald-900/60 border border-emerald-500/50 rounded-xl p-4 text-emerald-100 text-xs flex items-center gap-2.5 shadow-inner">
              <CheckCircle2 size={22} className="shrink-0 text-emerald-400" />
              <div>
                <strong className="block font-bold text-white text-sm mb-0.5">
                  {isEnglish ? "Subscription Successful!" : "سبسکرپشن مکمل!"}
                </strong>
                <span>{message}</span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="space-y-2.5">
              <div className="flex flex-col sm:flex-row items-stretch gap-2">
                <div className="relative flex-1">
                  <input
                    type="email"
                    required
                    placeholder={t("newsletterPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full h-11 px-3.5 rounded-xl bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-emerald-700/50 focus:border-emerald-400 text-white placeholder-gray-400 text-xs sm:text-sm outline-none transition text-left font-sans backdrop-blur-sm ${isUrdu ? "pr-3.5 pl-9" : "pl-3.5 pr-9"}`}
                  />
                  <Mail size={15} className={`absolute ${isUrdu ? "left-3" : "right-3"} top-1/2 -translate-y-1/2 text-emerald-400`} />
                </div>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="h-11 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-1.5 shadow-md hover:shadow-emerald-700/50 shrink-0 disabled:opacity-50 cursor-pointer"
                >
                  <span>{status === "loading" ? t("subscribing") : t("subscribeBtn")}</span>
                  {isUrdu ? <ArrowLeft size={15} /> : <ArrowRight size={15} />}
                </button>
              </div>

              {status === "error" && (
                <p className="text-xs text-red-400 font-semibold pr-1">{message}</p>
              )}
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
