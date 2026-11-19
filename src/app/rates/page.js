"use client";
import React from "react";
import Link from "next/link";
import Header from "@/component/Header";
import Footer from "@/component/Footer";
import NamazWidget from "@/component/widgets/NamazWidget";
import CurrencyWidget from "@/component/widgets/CurrencyWidget";
import WeatherWidget from "@/component/widgets/WeatherWidget";
import AdSlot from "@/component/AdSlot";
import { useSiteLanguage } from "@/context/SiteLanguageContext";

export default function RatesServicesPage() {
  const { isUrdu, isEnglish, dir, t } = useSiteLanguage();

  return (
    <div className="min-h-screen text-gray-900 bg-[#f7f6f3]" dir={dir}>
      <Header />

      <main className="u-shell py-6 sm:py-8">
        {/* Breadcrumb / Title Bar */}
        <div className="mb-6 pb-3 border-b-2 border-emerald-800 flex items-center justify-between">
          <div>
            <h1 className={`text-2xl sm:text-3xl font-bold text-gray-950 ${isUrdu ? "urdu-headline" : "font-sans"}`}>
              {isUrdu ? "روزمرہ خدمات و مارکیٹ ریٹس" : "Daily Services & Market Rates"}
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              {isUrdu
                ? "نماز کے مستند اوقات، لائیو کرنسی و سونے کے ریٹس، اور پاکستان بھر کا تازہ ترین موسم"
                : "Verified prayer times, live forex & bullion rates, and real-time Pakistan weather"}
            </p>
          </div>
          <Link
            href="/"
            className="text-xs text-[#0d3822] hover:text-black font-bold border border-[#dcd8cd] bg-white px-3 py-1.5 rounded-none transition"
          >
            {isUrdu ? "← صفحۂ اول" : "← Back to Home"}
          </Link>
        </div>

        {/* Top Ad Banner */}
        <AdSlot slotKey="services_top" className="mb-6 max-w-4xl mx-auto" />

        {/* 3 Full Dashboard Widgets in a 3-Column Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {/* 1. Namaz Auqaat */}
          <div>
            <NamazWidget />
          </div>

          {/* 2. Currency & Gold Rates */}
          <div>
            <CurrencyWidget />
          </div>

          {/* 3. Weather */}
          <div>
            <WeatherWidget />
          </div>
        </div>

        {/* Bottom Ad Banner */}
        <AdSlot slotKey="services_bottom" className="mt-8 max-w-4xl mx-auto" />
      </main>

      <Footer />
    </div>
  );
}
