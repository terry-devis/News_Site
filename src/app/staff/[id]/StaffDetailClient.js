"use client";

import React from "react";
import Link from "next/link";
import {
  Phone,
  Mail,
  MapPin,
  Briefcase,
  ArrowLeft,
  ArrowRight,
  Clock,
  Users,
} from "lucide-react";
import Header from "@/component/Header";
import Footer from "@/component/Footer";
import AdSlot from "@/component/AdSlot";
import NewsletterBox from "@/component/NewsletterBox";
import { useSiteLanguage } from "@/context/SiteLanguageContext";

export default function StaffDetailClient({
  member,
  colleagues = [],
  authoredArticles = [],
  categories = [],
  breakingNews = [],
}) {
  const { isUrdu, isEnglish, dir, t } = useSiteLanguage();

  const name = isEnglish
    ? member.name_en || member.name_ur
    : member.name_ur || member.name_en;
  const role = isEnglish
    ? member.designation_en || member.designation_ur
    : member.designation_ur || member.designation_en;
  const dept = isEnglish
    ? member.department_en || member.department_ur
    : member.department_ur || member.department_en;
  const city = isEnglish
    ? member.city_en || member.city_ur
    : member.city_ur || member.city_en;
  const bio = isEnglish
    ? member.bio_en || member.bio_ur
    : member.bio_ur || member.bio_en;
  const initial = (member.name_en || member.name_ur || "S")
    .trim()
    .charAt(0)
    .toUpperCase();

  const staffLabel = isEnglish ? "Staff" : "اسٹاف";

  return (
    <div className="min-h-screen text-gray-900" dir={dir}>
      <Header categories={categories} breakingNews={breakingNews} />

      <main className="u-shell py-6">
        <AdSlot slotKey="home-leaderboard" className="mb-5 max-w-5xl mx-auto" />

        {/* Breadcrumb */}
        <div
          className={`flex flex-wrap items-center gap-2 text-gray-500 mb-4 ${
            isUrdu ? "urdu-body text-sm" : "font-sans text-xs"
          }`}
        >
          <Link href="/" className="hover:text-[#184e2d] transition">
            {t("breadcrumbHome")}
          </Link>
          <span>/</span>
          <Link href="/staff" className="hover:text-[#184e2d] transition">
            {staffLabel}
          </Link>
          <span>/</span>
          <span className="text-[#184e2d] font-bold">{name}</span>
        </div>

        {/* Main 12-Col Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left / Main Profile Column (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            <article className="bg-[#efeee9]/80 border border-[#dcd8cd] p-5 sm:p-7 shadow-2xs">
              {/* Inline Profile Header */}
              <div className="flex flex-col sm:flex-row items-start gap-5 pb-5 border-b border-[#dcd8cd]">
                <div className="relative w-28 h-28 sm:w-36 sm:h-36 shrink-0 border border-[#dcd8cd] bg-[#dcd8cd]/40 overflow-hidden shadow-xs">
                  {member.image_url ? (
                    <img
                      src={member.image_url}
                      alt={name}
                      className="w-full h-full object-cover object-top"
                    />
                  ) : (
                    <div className="w-full h-full bg-[#184e2d] text-white flex items-center justify-center text-4xl sm:text-5xl font-bold font-sans">
                      {initial}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1 space-y-2">
                  {role && (
                    <span
                      className={`inline-block bg-[#184e2d] text-white text-[11px] font-bold px-2.5 py-0.5 ${
                        isUrdu ? "urdu-body" : "font-sans uppercase tracking-wider"
                      }`}
                    >
                      {role}
                    </span>
                  )}

                  <h1
                    className={`text-2xl sm:text-3xl font-bold text-gray-950 leading-snug ${
                      isUrdu ? "urdu-headline" : "font-sans"
                    }`}
                  >
                    {name}
                  </h1>

                  {(dept || city) && (
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-gray-600 font-sans pt-0.5">
                      {dept && (
                        <span className="inline-flex items-center gap-1.5">
                          <Briefcase size={13} className="text-[#184e2d] shrink-0" />
                          <span>{dept}</span>
                        </span>
                      )}
                      {city && (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={13} className="text-[#184e2d] shrink-0" />
                          <span>{city}</span>
                        </span>
                      )}
                    </div>
                  )}

                  {/* Inline Contact Buttons */}
                  {(member.phone || member.email) && (
                    <div
                      dir="ltr"
                      className="pt-2 flex flex-wrap items-center gap-2.5 text-xs font-sans"
                    >
                      {member.phone && (
                        <a
                          href={`tel:${member.phone}`}
                          className="inline-flex items-center gap-1.5 bg-white border border-[#dcd8cd] hover:border-[#184e2d] text-gray-800 hover:text-[#184e2d] px-3 py-1.5 font-semibold transition"
                        >
                          <Phone size={12} className="text-[#184e2d]" />
                          <span>{member.phone}</span>
                        </a>
                      )}
                      {member.email && (
                        <a
                          href={`mailto:${member.email}`}
                          className="inline-flex items-center gap-1.5 bg-white border border-[#dcd8cd] hover:border-[#184e2d] text-gray-800 hover:text-[#184e2d] px-3 py-1.5 font-semibold transition"
                        >
                          <Mail size={12} className="text-[#184e2d]" />
                          <span>{member.email}</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Full Biography / About Section */}
              <div className="pt-5">
                <h2
                  className={`text-base font-bold text-gray-900 border-b border-[#dcd8cd] pb-2 mb-3 ${
                    isUrdu ? "urdu-headline" : "font-sans uppercase tracking-wider text-xs text-[#184e2d]"
                  }`}
                >
                  {isEnglish ? "Biography & Editorial Profile" : "تعارف اور ادارتی پروفائل"}
                </h2>
                {bio ? (
                  <p
                    className={`text-gray-800 whitespace-pre-line ${
                      isUrdu
                        ? "urdu-body text-base leading-loose"
                        : "font-sans text-sm sm:text-base leading-relaxed"
                    }`}
                  >
                    {bio}
                  </p>
                ) : (
                  <p className="text-xs sm:text-sm text-gray-500 font-sans">
                    {isEnglish
                      ? `${name} is a member of the Daily Afadiat editorial team${city ? ` based in ${city}` : ""}.`
                      : `${name} روزنامہ افادیت کی ادارتی ٹیم کا حصہ ہیں${city ? ` (${city})` : ""}۔`}
                  </p>
                )}
              </div>

              {/* Back to Staff Directory */}
              <div className="mt-6 pt-4 border-t border-[#dcd8cd] flex items-center justify-between">
                <Link
                  href="/staff"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#184e2d] hover:underline font-sans"
                >
                  {isUrdu ? <ArrowRight size={14} /> : <ArrowLeft size={14} />}
                  <span>{isEnglish ? "Back to Staff Directory" : "تمام عملے کی فہرست پر واپس جائیں"}</span>
                </Link>
              </div>
            </article>

            {/* Recent Articles Authored by Staff Member */}
            {authoredArticles.length > 0 && (
              <section className="bg-[#efeee9]/60 border border-[#dcd8cd] p-5 sm:p-6">
                <div className="border-b-2 border-[#184e2d] pb-2 mb-4 flex items-center justify-between">
                  <h2
                    className={`text-lg font-bold text-gray-950 ${
                      isUrdu ? "urdu-headline" : "font-sans"
                    }`}
                  >
                    {isEnglish ? `Reports by ${name}` : `${name} کی خبریں اور مضامین`}
                  </h2>
                </div>
                <div className="divide-y divide-[#dcd8cd]">
                  {authoredArticles.map((art) => {
                    const artTitle = isEnglish
                      ? art.title_en || art.title_ur
                      : art.title_ur || art.title_en;
                    const artHref =
                      isEnglish && art.title_en
                        ? `/en/story/${art.slug || art.id}`
                        : `/story/${art.slug || art.id}`;
                    return (
                      <article key={art.id} className="py-3 first:pt-0 last:pb-0 group">
                        <Link href={artHref} className="block">
                          <h3
                            className={`text-sm sm:text-base font-bold text-gray-900 group-hover:text-[#184e2d] transition leading-snug ${
                              isUrdu ? "urdu-headline" : "font-sans"
                            }`}
                          >
                            {artTitle}
                          </h3>
                        </Link>
                        <div className="mt-1 flex items-center gap-2 text-[11px] text-gray-500 font-sans">
                          <Clock size={11} />
                          <span suppressHydrationWarning>
                            {new Date(art.created_at).toLocaleDateString(
                              isUrdu ? "ur-PK" : "en-US",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                timeZone: "Asia/Karachi",
                              }
                            )}
                          </span>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* Right / End Sidebar (4 Cols) */}
          <aside className="lg:col-span-4 space-y-5">
            {/* Quick Profile Summary Card */}
            <div className="bg-[#efeee9]/80 border border-[#dcd8cd] p-5 shadow-2xs">
              <div className="border-b-2 border-[#184e2d] pb-2 mb-3">
                <h2
                  className={`text-sm font-bold text-gray-950 ${
                    isUrdu ? "urdu-headline" : "font-sans uppercase tracking-wider"
                  }`}
                >
                  {isEnglish ? "Quick Details" : "مختصر تفصیلات"}
                </h2>
              </div>

              <dl className="divide-y divide-[#dcd8cd] text-xs font-sans">
                <div className="py-2 flex items-center justify-between gap-2">
                  <dt className="text-gray-500">{isEnglish ? "Name" : "نام"}</dt>
                  <dd className="font-bold text-gray-900 text-end">{name}</dd>
                </div>
                {role && (
                  <div className="py-2 flex items-center justify-between gap-2">
                    <dt className="text-gray-500">{isEnglish ? "Designation" : "عہدہ"}</dt>
                    <dd className="font-semibold text-[#184e2d] text-end">{role}</dd>
                  </div>
                )}
                {dept && (
                  <div className="py-2 flex items-center justify-between gap-2">
                    <dt className="text-gray-500">{isEnglish ? "Department" : "شعبہ"}</dt>
                    <dd className="font-semibold text-gray-800 text-end">{dept}</dd>
                  </div>
                )}
                {city && (
                  <div className="py-2 flex items-center justify-between gap-2">
                    <dt className="text-gray-500">{isEnglish ? "City / Bureau" : "شہر / بیورو"}</dt>
                    <dd className="font-semibold text-gray-800 text-end">{city}</dd>
                  </div>
                )}
                {member.phone && (
                  <div className="py-2 flex items-center justify-between gap-2">
                    <dt className="text-gray-500">{isEnglish ? "Phone" : "فون"}</dt>
                    <dd dir="ltr">
                      <a href={`tel:${member.phone}`} className="font-semibold text-[#184e2d] hover:underline">
                        {member.phone}
                      </a>
                    </dd>
                  </div>
                )}
                {member.email && (
                  <div className="py-2 flex items-center justify-between gap-2">
                    <dt className="text-gray-500">{isEnglish ? "Email" : "ای میل"}</dt>
                    <dd dir="ltr" className="truncate">
                      <a href={`mailto:${member.email}`} className="font-semibold text-[#184e2d] hover:underline">
                        {member.email}
                      </a>
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Other Staff Members Directory Widget */}
            {colleagues.length > 0 && (
              <div className="bg-[#efeee9]/80 border border-[#dcd8cd] p-5 shadow-2xs">
                <div className="border-b-2 border-[#184e2d] pb-2 mb-3 flex items-center justify-between">
                  <h2
                    className={`text-sm font-bold text-gray-950 flex items-center gap-1.5 ${
                      isUrdu ? "urdu-headline" : "font-sans uppercase tracking-wider"
                    }`}
                  >
                    <Users size={14} className="text-[#184e2d]" />
                    <span>{isEnglish ? "Editorial Team" : "دیگر عملہ"}</span>
                  </h2>
                  <Link href="/staff" className="text-[11px] font-bold text-[#184e2d] hover:underline font-sans">
                    {t("viewMore")}
                  </Link>
                </div>

                <div className="divide-y divide-[#dcd8cd]">
                  {colleagues.map((col) => {
                    const cName = isEnglish ? col.name_en || col.name_ur : col.name_ur || col.name_en;
                    const cRole = isEnglish
                      ? col.designation_en || col.designation_ur
                      : col.designation_ur || col.designation_en;
                    const cInitial = (col.name_en || col.name_ur || "S").trim().charAt(0).toUpperCase();
                    return (
                      <Link
                        key={col.id}
                        href={`/staff/${col.id}`}
                        className="py-2.5 first:pt-0 last:pb-0 flex items-center gap-3 group"
                      >
                        <div className="w-10 h-10 shrink-0 border border-[#dcd8cd] bg-[#dcd8cd]/40 overflow-hidden">
                          {col.image_url ? (
                            <img
                              src={col.image_url}
                              alt={cName}
                              loading="lazy"
                              className="w-full h-full object-cover object-top"
                            />
                          ) : (
                            <div className="w-full h-full bg-[#184e2d] text-white flex items-center justify-center text-sm font-bold font-sans">
                              {cInitial}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3
                            className={`text-xs font-bold text-gray-900 group-hover:text-[#184e2d] transition truncate ${
                              isUrdu ? "urdu-headline" : "font-sans"
                            }`}
                          >
                            {cName}
                          </h3>
                          {cRole && (
                            <p className="text-[11px] text-gray-500 truncate font-sans">
                              {cRole}
                            </p>
                          )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>
        </div>

        <AdSlot slotKey="home_mid_banner" className="my-8 max-w-4xl mx-auto" />

        <div className="my-10">
          <NewsletterBox />
        </div>
      </main>

      <Footer categories={categories} />
    </div>
  );
}
