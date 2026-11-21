"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Search, Users, ChevronDown } from "lucide-react";
import Header from "@/component/Header";
import Footer from "@/component/Footer";
import AdSlot from "@/component/AdSlot";
import NewsletterBox from "@/component/NewsletterBox";
import { useSiteLanguage } from "@/context/SiteLanguageContext";

export default function StaffClient({
  categories = [],
  breakingNews = [],
  initialStaff = [],
}) {
  const { isUrdu, isEnglish, dir, t } = useSiteLanguage();
  const [staff, setStaff] = useState(initialStaff || []);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");

  useEffect(() => {
    let active = true;
    fetch("/api/staff", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (active && Array.isArray(data?.staff)) setStaff(data.staff);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const availableCities = useMemo(() => {
    const map = new Map();
    for (const m of staff) {
      const key = (m.city_en || m.city_ur || "").trim().toLowerCase();
      if (!key || map.has(key)) continue;
      map.set(key, { key, ur: m.city_ur || m.city_en, en: m.city_en || m.city_ur });
    }
    return Array.from(map.values());
  }, [staff]);

  const filteredStaff = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return staff.filter((m) => {
      const cityKey = (m.city_en || m.city_ur || "").trim().toLowerCase();
      if (selectedCity !== "all" && cityKey !== selectedCity) return false;
      if (!q) return true;
      return [
        m.name_ur, m.name_en, m.designation_ur, m.designation_en,
        m.department_ur, m.department_en, m.city_ur, m.city_en, m.email, m.phone,
      ].some((v) => (v || "").toLowerCase().includes(q));
    });
  }, [staff, selectedCity, searchQuery]);

  const pageTitle = isEnglish ? "Our Staff" : "ہمارا عملہ";

  return (
    <div className="min-h-screen text-gray-900" dir={dir}>
      <Header categories={categories} breakingNews={breakingNews} />

      <main className="u-shell py-6">
        {/* Breadcrumb */}
        <div className={`flex items-center gap-2 text-gray-500 mb-3 ${isUrdu ? "urdu-body text-sm" : "font-sans text-xs"}`}>
          <Link href="/" className="hover:text-emerald-600 transition">
            {t("breadcrumbHome")}
          </Link>
          <span>/</span>
          <span className="text-emerald-700 font-bold">{pageTitle}</span>
        </div>

        {/* Section Header (same pattern as category pages) */}
        <div className="border-b-2 border-emerald-600 pb-2 mb-4 flex items-center justify-between gap-3">
          <h1
            className={`text-2xl sm:text-3xl font-bold text-gray-900 ${
              isUrdu ? "urdu-headline" : "font-sans"
            }`}
          >
            {pageTitle}
          </h1>
          <span className="text-xs text-gray-500 font-sans">
            {filteredStaff.length} {isEnglish ? "members" : "ارکان"}
          </span>
        </div>

        <p
          className={`text-sm text-gray-600 mb-5 max-w-3xl ${
            isUrdu ? "urdu-body" : "font-sans leading-relaxed"
          }`}
        >
          {isEnglish
            ? "Meet the editors, bureau chiefs and correspondents behind Daily Afadiat."
            : "ڈیلی افادیت کے مدیران، بیورو چیفس اور نمائندگان سے ملیں اور براہِ راست رابطہ کریں۔"}
        </p>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 font-sans">
          <div className="relative flex-1 max-w-md">
            <Search
              size={15}
              className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${
                isUrdu ? "right-3" : "left-3"
              }`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isEnglish ? "Search name, role or city..." : "نام، عہدہ یا شہر تلاش کریں..."}
              className={`w-full text-sm bg-[#efeee9] border border-[#dcd8cd] rounded-xl py-2.5 focus:outline-none focus:border-emerald-600 transition ${
                isUrdu ? "pr-9 pl-3" : "pl-9 pr-3"
              }`}
            />
          </div>

          {availableCities.length > 1 && (
            <div className="relative w-fit self-start">
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className={`appearance-none text-sm font-semibold bg-[#efeee9] border border-[#dcd8cd] rounded-xl py-2.5 focus:outline-none focus:border-emerald-600 cursor-pointer ${
                isUrdu ? "pl-7 pr-3" : "pl-3 pr-7"
              }`}
            >
              <option value="all">{isEnglish ? "All cities" : "تمام شہر"}</option>
              {availableCities.map((c) => (
                <option key={c.key} value={c.key}>
                  {isEnglish ? c.en : c.ur}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-gray-600 ${
                isUrdu ? "left-2.5" : "right-2.5"
              }`}
            />
            </div>
          )}
        </div>

        {/* Staff Grid */}
        {filteredStaff.length === 0 ? (
          <div className="text-center py-16 bg-[#efeee9] border border-[#dcd8cd] rounded-xl font-sans">
            <Users size={28} className="mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500 text-sm">
              {isEnglish ? "No staff members found." : "کوئی رکن نہیں ملا۔"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredStaff.map((m) => {
              const name = isEnglish ? m.name_en || m.name_ur : m.name_ur || m.name_en;
              const role = isEnglish
                ? m.designation_en || m.designation_ur
                : m.designation_ur || m.designation_en;
              const dept = isEnglish
                ? m.department_en || m.department_ur
                : m.department_ur || m.department_en;
              const city = isEnglish ? m.city_en || m.city_ur : m.city_ur || m.city_en;
              const bio = isEnglish ? m.bio_en || m.bio_ur : m.bio_ur || m.bio_en;
              const initial = (m.name_en || m.name_ur || "S").trim().charAt(0).toUpperCase();

              return (
                <article
                  key={m.id}
                  className="group bg-[#efeee9] border border-[#dcd8cd] rounded-xl overflow-hidden hover:border-emerald-600 transition duration-300 shadow-2xs flex flex-col justify-between"
                >
                  <div>
                    <div className="relative w-full aspect-[4/5] bg-[#dcd8cd]/40 overflow-hidden">
                      {m.image_url ? (
                        <img
                          src={m.image_url}
                          alt={name}
                          loading="lazy"
                          className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-[#0d542f] text-white flex items-center justify-center text-6xl font-bold font-sans">
                          {initial}
                        </div>
                      )}
                    </div>

                    <div className="p-4 pb-2">
                      <h2
                        className={`text-lg font-bold text-gray-900 leading-snug ${
                          isUrdu ? "urdu-headline" : "font-sans"
                        }`}
                      >
                        {name}
                      </h2>
                      {role && (
                        <p
                          className={`text-sm font-semibold text-emerald-700 mt-0.5 ${
                            isUrdu ? "urdu-body" : "font-sans"
                          }`}
                        >
                          {role}
                        </p>
                      )}
                      {(dept || city) && (
                        <p className="text-[11px] text-gray-500 mt-1.5 font-sans flex flex-wrap items-center gap-x-3 gap-y-1">
                          {dept && <span>{dept}</span>}
                          {city && (
                            <span className="inline-flex items-center gap-1">
                              <MapPin size={11} />
                              {city}
                            </span>
                          )}
                        </p>
                      )}
                    </div>
                  </div>

                  {bio && (
                    <p
                      className={`px-4 pb-4 text-xs text-gray-600 line-clamp-3 ${
                        isUrdu ? "urdu-body leading-relaxed" : "font-sans leading-normal"
                      }`}
                    >
                      {bio}
                    </p>
                  )}

                  {(m.phone || m.email) && (
                    <div
                      dir="ltr"
                      className="px-4 py-2.5 border-t border-[#dcd8cd] flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-gray-600 font-sans"
                    >
                      {m.phone && (
                        <a
                          href={`tel:${m.phone}`}
                          className="inline-flex items-center gap-1 hover:text-emerald-700 transition"
                        >
                          <Phone size={11} />
                          {m.phone}
                        </a>
                      )}
                      {m.email && (
                        <a
                          href={`mailto:${m.email}`}
                          className="inline-flex items-center gap-1 hover:text-emerald-700 transition truncate"
                        >
                          <Mail size={11} />
                          <span className="truncate">{m.email}</span>
                        </a>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}

        <AdSlot slotKey="home_mid_banner" className="my-8 max-w-4xl mx-auto" />

        <div className="my-10">
          <NewsletterBox />
        </div>
      </main>

      <Footer categories={categories} />
    </div>
  );
}
