"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Phone, Mail, MapPin, Search, Users, ChevronDown, Briefcase } from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedDept, setSelectedDept] = useState("all");

  const staff = Array.isArray(initialStaff) ? initialStaff : [];

  const availableCities = useMemo(() => {
    const map = new Map();
    for (const m of staff) {
      const key = (m.city_en || m.city_ur || "").trim().toLowerCase();
      if (!key || map.has(key)) continue;
      map.set(key, { key, ur: m.city_ur || m.city_en, en: m.city_en || m.city_ur });
    }
    return Array.from(map.values());
  }, [staff]);

  const availableDepts = useMemo(() => {
    const map = new Map();
    for (const m of staff) {
      const key = (m.department_en || m.department_ur || "").trim().toLowerCase();
      if (!key || map.has(key)) continue;
      map.set(key, {
        key,
        ur: m.department_ur || m.department_en,
        en: m.department_en || m.department_ur,
      });
    }
    return Array.from(map.values());
  }, [staff]);

  const filteredStaff = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return staff.filter((m) => {
      const cityKey = (m.city_en || m.city_ur || "").trim().toLowerCase();
      const deptKey = (m.department_en || m.department_ur || "").trim().toLowerCase();
      if (selectedCity !== "all" && cityKey !== selectedCity) return false;
      if (selectedDept !== "all" && deptKey !== selectedDept) return false;
      if (!q) return true;
      return [
        m.name_ur,
        m.name_en,
        m.designation_ur,
        m.designation_en,
        m.department_ur,
        m.department_en,
        m.city_ur,
        m.city_en,
        m.email,
        m.phone,
      ].some((v) => (v || "").toLowerCase().includes(q));
    });
  }, [staff, selectedCity, selectedDept, searchQuery]);

  const pageTitle = isEnglish ? "Staff" : "اسٹاف";

  return (
    <div className="min-h-screen text-gray-900" dir={dir}>
      <Header categories={categories} breakingNews={breakingNews} />

      <main className="u-shell py-6">
        <AdSlot slotKey="home-leaderboard" className="mb-5 max-w-5xl mx-auto" />

        {/* Breadcrumb */}
        <div className={`flex items-center gap-2 text-gray-500 mb-3 ${isUrdu ? "urdu-body text-sm" : "font-sans text-xs"}`}>
          <Link href="/" className="hover:text-emerald-700 transition">
            {t("breadcrumbHome")}
          </Link>
          <span>/</span>
          <span className="text-[#184e2d] font-bold">{pageTitle}</span>
        </div>

        {/* Section Header matching homepage editorial style */}
        <div className="border-b-2 border-[#184e2d] pb-2 mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h1
            className={`text-2xl sm:text-3xl font-bold text-gray-950 ${
              isUrdu ? "urdu-headline" : "font-sans"
            }`}
          >
            {pageTitle}
          </h1>
          <span className="text-xs font-semibold text-gray-600 font-sans">
            {filteredStaff.length} {isEnglish ? "members" : "ارکان"}
          </span>
        </div>

        {/* Inline Intro + Compact Filter Bar */}
        <div className="bg-[#efeee9]/80 border border-[#dcd8cd] p-3 sm:p-4 mb-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 shadow-2xs">
          <p
            className={`text-xs sm:text-sm text-gray-700 ${
              isUrdu ? "urdu-body" : "font-sans leading-relaxed"
            }`}
          >
            {isEnglish
              ? "Meet the editors, bureau chiefs and correspondents behind Daily Afadiat."
              : "ڈیلی افادیت کے مدیران، بیورو چیفس اور نمائندگان سے ملیں اور براہِ راست رابطہ کریں۔"}
          </p>

          <div className="flex flex-wrap items-center gap-2 font-sans shrink-0">
            <div className="relative flex-1 sm:w-56">
              <Search
                size={14}
                className={`absolute top-1/2 -translate-y-1/2 text-gray-400 ${
                  isUrdu ? "right-2.5" : "left-2.5"
                }`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isEnglish ? "Search name, role, city..." : "نام، عہدہ یا شہر تلاش کریں..."}
                className={`w-full text-xs bg-white border border-[#dcd8cd] py-2 focus:outline-none focus:border-[#184e2d] transition ${
                  isUrdu ? "pr-8 pl-2.5 text-right" : "pl-8 pr-2.5 text-left"
                }`}
              />
            </div>

            {availableDepts.length > 1 && (
              <div className="relative">
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className={`appearance-none text-xs font-semibold bg-white border border-[#dcd8cd] py-2 focus:outline-none focus:border-[#184e2d] cursor-pointer ${
                    isUrdu ? "pl-7 pr-2.5" : "pl-2.5 pr-7"
                  }`}
                >
                  <option value="all">{isEnglish ? "All departments" : "تمام شعبے"}</option>
                  {availableDepts.map((d) => (
                    <option key={d.key} value={d.key}>
                      {isEnglish ? d.en : d.ur}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={13}
                  className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-gray-600 ${
                    isUrdu ? "left-2" : "right-2"
                  }`}
                />
              </div>
            )}

            {availableCities.length > 1 && (
              <div className="relative">
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className={`appearance-none text-xs font-semibold bg-white border border-[#dcd8cd] py-2 focus:outline-none focus:border-[#184e2d] cursor-pointer ${
                    isUrdu ? "pl-7 pr-2.5" : "pl-2.5 pr-7"
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
                  size={13}
                  className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-gray-600 ${
                    isUrdu ? "left-2" : "right-2"
                  }`}
                />
              </div>
            )}
          </div>
        </div>

        {/* Inline Editorial Staff Directory Grid */}
        {filteredStaff.length === 0 ? (
          <div className="text-center py-14 bg-[#efeee9]/70 border border-[#dcd8cd] font-sans">
            <Users size={26} className="mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600 text-xs sm:text-sm">
              {isEnglish ? "No staff members found." : "کوئی رکن نہیں ملا۔"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  className="group bg-[#efeee9]/70 border border-[#dcd8cd] hover:border-[#184e2d] transition duration-200 shadow-2xs flex flex-col justify-between"
                >
                  <Link href={`/staff/${m.id}`} className="block flex-1">
                    <div className="p-4 flex items-start gap-3.5">
                      {/* Crisp Inline Square Portrait */}
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 border border-[#dcd8cd] bg-[#dcd8cd]/40 overflow-hidden">
                        {m.image_url ? (
                          <img
                            src={m.image_url}
                            alt={name}
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover object-top group-hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#184e2d] text-white flex items-center justify-center text-2xl font-bold font-sans">
                            {initial}
                          </div>
                        )}
                      </div>

                      {/* Inline Details */}
                      <div className="min-w-0 flex-1">
                        <h2
                          className={`text-base font-bold text-gray-950 group-hover:text-[#184e2d] transition leading-snug ${
                            isUrdu ? "urdu-headline" : "font-sans"
                          }`}
                        >
                          {name}
                        </h2>

                        {role && (
                          <p
                            className={`text-xs font-bold text-[#184e2d] mt-0.5 ${
                              isUrdu ? "urdu-body" : "font-sans"
                            }`}
                          >
                            {role}
                          </p>
                        )}

                        {(dept || city) && (
                          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-600 font-sans">
                            {dept && (
                              <span className="inline-flex items-center gap-1">
                                <Briefcase size={11} className="text-gray-400 shrink-0" />
                                <span>{dept}</span>
                              </span>
                            )}
                            {city && (
                              <span className="inline-flex items-center gap-1">
                                <MapPin size={11} className="text-gray-400 shrink-0" />
                                <span>{city}</span>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {bio && (
                      <p
                        className={`px-4 pb-3 text-xs text-gray-600 line-clamp-2 ${
                          isUrdu ? "urdu-body leading-relaxed" : "font-sans leading-normal"
                        }`}
                      >
                        {bio}
                      </p>
                    )}
                  </Link>

                  <div className="px-4 py-2 bg-[#fbfaf8]/70 border-t border-[#dcd8cd] flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-700 font-sans">
                    <div dir="ltr" className="flex flex-wrap items-center gap-x-3 gap-y-1 min-w-0">
                      {m.phone && (
                        <a
                          href={`tel:${m.phone}`}
                          className="inline-flex items-center gap-1 hover:text-[#184e2d] transition"
                        >
                          <Phone size={11} className="text-[#184e2d]" />
                          <span>{m.phone}</span>
                        </a>
                      )}
                      {m.email && (
                        <a
                          href={`mailto:${m.email}`}
                          className="inline-flex items-center gap-1 hover:text-[#184e2d] transition truncate max-w-[160px]"
                        >
                          <Mail size={11} className="text-[#184e2d] shrink-0" />
                          <span className="truncate">{m.email}</span>
                        </a>
                      )}
                    </div>
                    <Link
                      href={`/staff/${m.id}`}
                      className="text-[11px] font-bold text-[#184e2d] hover:underline shrink-0"
                    >
                      {isEnglish ? "View Profile →" : "تفصیلات دیکھیں ←"}
                    </Link>
                  </div>
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
