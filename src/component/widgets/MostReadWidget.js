"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Flame, Eye, TrendingUp } from "lucide-react";
import { useSiteLanguage } from "@/context/SiteLanguageContext";
import { getFallbackImageForStory } from "@/lib/mockImages";

export default function MostReadWidget({ stories = [] }) {
  const { isUrdu, isEnglish } = useSiteLanguage();

  // Sort by views_count descending
  const sorted = [...stories].sort((a, b) => (b.views_count || 0) - (a.views_count || 0)).slice(0, 5);

  if (!sorted || sorted.length === 0) return null;

  const getTitle = (story) => {
    return isEnglish ? (story.title_en || story.title_ur) : (story.title_ur || story.title_en);
  };

  const getCatName = (cat) => {
    if (!cat) return isEnglish ? "News" : "خبر";
    return isEnglish ? (cat.name_en || cat.name_ur || "News") : (cat.name_ur || cat.name_en || "خبر");
  };

  const formatViews = (cnt) => {
    const num = cnt || 1200;
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const lead = sorted[0];
  const list = sorted.slice(1, 5);

  return (
    <div className="border border-[#dcd8cd] bg-[#efeee9] p-4 shadow-xs">
      {/* Header */}
      <div className="border-b-2 border-emerald-700 pb-2 mb-3.5 flex items-center justify-between">
        <h3 className="text-sm sm:text-base font-bold text-gray-900 font-sans flex items-center gap-1.5">
          <Flame size={16} className="text-red-600 fill-red-600" />
          <span>{isUrdu ? "زیادہ پڑھی گئیں" : "Most Read Stories"}</span>
        </h3>
        <span className="text-[10px] bg-red-600/10 text-red-700 font-bold px-1.5 py-0.5 rounded font-sans">
          {isUrdu ? "تادمِ تحریر" : "Trending"}
        </span>
      </div>

      {/* #1 Top Ranked Article with Image */}
      {lead && (
        <article className="group mb-4 pb-3 border-b border-[#dcd8cd]/70">
          <div className="relative w-full aspect-[3/2] overflow-hidden border border-[#dcd8cd] bg-[#dcd8cd]/40 mb-2.5 shadow-2xs">
            <Image
              src={getFallbackImageForStory(lead)}
              alt={getTitle(lead)}
              fill
              className="object-cover group-hover:scale-102 transition duration-500"
            />
            <span className={`absolute top-1.5 ${isUrdu ? "right-1.5" : "left-1.5"} bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-none font-sans flex items-center gap-1`}>
              <TrendingUp size={10} />
              <span>#1</span>
            </span>
          </div>

          <span className="text-[10px] font-bold text-emerald-800 font-sans block mb-1">
            {getCatName(lead.category)}
          </span>

          <Link href={`/story/${lead.id || lead.slug}`}>
            <h4 className={`text-sm font-bold text-gray-900 group-hover:text-emerald-700 transition line-clamp-2 leading-snug mb-1.5 ${isUrdu ? "urdu-headline" : "font-sans"}`}>
              {getTitle(lead)}
            </h4>
          </Link>

          <div className="flex items-center justify-between text-[10px] text-gray-400 font-sans">
            <span className="flex items-center gap-1 text-gray-600">
              <Eye size={11} className="text-gray-400" />
              <span>{formatViews(lead.views_count)} {isUrdu ? "مشاہدات" : "views"}</span>
            </span>
            <span>{new Date(lead.created_at).toLocaleDateString(isUrdu ? "ur-PK" : "en-US")}</span>
          </div>
        </article>
      )}

      {/* #2 to #5 Ranked Articles with Big Numerals */}
      <div className="divide-y divide-[#dcd8cd]/60">
        {list.map((item, idx) => {
          const rankNum = idx + 2;
          return (
            <article key={item.id} className="py-2.5 first:pt-0 last:pb-0 flex items-start gap-3 group">
              <span className="text-2xl font-black font-sans text-gray-300 group-hover:text-emerald-700 transition shrink-0 leading-none pt-0.5 select-none">
                0{rankNum}
              </span>
              <div className="flex-1 min-w-0">
                <Link href={`/story/${item.id || item.slug}`}>
                  <h5 className={`text-xs sm:text-[13px] font-bold text-gray-800 group-hover:text-emerald-700 transition line-clamp-2 leading-snug ${isUrdu ? "urdu-headline" : "font-sans"}`}>
                    {getTitle(item)}
                  </h5>
                </Link>
                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-sans mt-1">
                  <span className="text-emerald-800 font-semibold">{getCatName(item.category)}</span>
                  <span>•</span>
                  <span className="flex items-center gap-0.5">
                    <Eye size={10} />
                    <span>{formatViews(item.views_count)}</span>
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
