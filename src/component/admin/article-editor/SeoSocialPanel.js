"use client";

import React from "react";
import { Globe, Search, Share2 } from "lucide-react";

export default function SeoSocialPanel({
  title,
  summary,
  slug,
  coverImage,
  coverFraming,
  meta,
  onChangeMeta,
}) {
  const effectiveTitle = meta.seoTitle || title || "Article headline";
  const effectiveDesc = meta.seoDescription || summary || "Summary appears in Google Search and social previews.";
  const ogCrop = coverFraming?.crops?.og;
  const focal = coverFraming?.focal || { x: 50, y: 50 };

  return (
    <div className="bg-white border border-[#e5e2da] p-5 shadow-2xs space-y-5">
      <div className="border-b border-[#e5e2da] pb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe size={16} className="text-[#184e2d]" />
          <h3 className="text-sm font-bold text-[#18221b]">SEO & Social Preview</h3>
        </div>
        <span className="text-[11px] text-[#5c635b]">Google Search & OpenGraph</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: SEO Fields */}
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-xs font-semibold text-[#18221b] mb-1">
              <label>SEO title</label>
              <span
                className={`font-mono text-[11px] ${
                  effectiveTitle.length > 60 ? "text-amber-700" : "text-[#5c635b]"
                }`}
              >
                {(meta.seoTitle || title || "").length}/60 characters
              </span>
            </div>
            <input
              type="text"
              dir="auto"
              value={meta.seoTitle || ""}
              onChange={(e) => onChangeMeta("seoTitle", e.target.value)}
              placeholder={title || "Custom search title (defaults to headline)"}
              className="w-full px-3 py-2 text-xs border border-[#e5e2da] bg-[#fbfaf8] focus:bg-white focus:outline-none focus:border-[#184e2d]"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs font-semibold text-[#18221b] mb-1">
              <label>Meta description</label>
              <span
                className={`font-mono text-[11px] ${
                  (meta.seoDescription || "").length > 160 ? "text-amber-700" : "text-[#5c635b]"
                }`}
              >
                {(meta.seoDescription || "").length}/160 characters
              </span>
            </div>
            <textarea
              rows={2}
              dir="auto"
              value={meta.seoDescription || ""}
              onChange={(e) => onChangeMeta("seoDescription", e.target.value)}
              placeholder={summary || "Concise summary for Google Search results..."}
              className="w-full px-3 py-2 text-xs border border-[#e5e2da] bg-[#fbfaf8] focus:bg-white focus:outline-none focus:border-[#184e2d]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#18221b] mb-1">Focus keyword</label>
            <input
              type="text"
              dir="auto"
              value={meta.focusKeyword || ""}
              onChange={(e) => onChangeMeta("focusKeyword", e.target.value)}
              placeholder="e.g. Pakistan economy, budget 2026"
              className="w-full px-3 py-2 text-xs border border-[#e5e2da] bg-[#fbfaf8] focus:bg-white focus:outline-none focus:border-[#184e2d]"
            />
          </div>

          <div className="space-y-2 pt-1">
            <label className="flex items-center justify-between gap-3 p-2.5 border border-[#e5e2da] bg-[#fbfaf8] cursor-pointer">
              <div>
                <span className="block text-xs font-semibold text-[#18221b]">Hide from search engines (noindex)</span>
                <span className="block text-[11px] text-[#5c635b]">Adds robots noindex tag to this story</span>
              </div>
              <input
                type="checkbox"
                checked={Boolean(meta.robotsNoindex)}
                onChange={(e) => onChangeMeta("robotsNoindex", e.target.checked)}
                className="size-4 accent-[#184e2d]"
              />
            </label>

            <label className="flex items-center justify-between gap-3 p-2.5 border border-[#e5e2da] bg-[#fbfaf8] cursor-pointer">
              <div>
                <span className="block text-xs font-semibold text-[#18221b]">Exclude from Google News sitemap</span>
                <span className="block text-[11px] text-[#5c635b]">Keep off news-sitemap & RSS syndication</span>
              </div>
              <input
                type="checkbox"
                checked={Boolean(meta.excludeFromNewsSitemap)}
                onChange={(e) => onChangeMeta("excludeFromNewsSitemap", e.target.checked)}
                className="size-4 accent-[#184e2d]"
              />
            </label>
          </div>
        </div>

        {/* Right: Live Google & Social Previews */}
        <div className="space-y-4">
          {/* Google Search Snippet Preview */}
          <div className="border border-[#e5e2da] p-4 bg-white">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#5c635b] mb-2">
              <Search size={12} />
              <span>Google Search Preview</span>
            </div>
            <p className="text-[11px] text-[#202124] truncate font-mono">
              https://dailyafadiat.com/story/{slug || "article-slug"}
            </p>
            <p dir="auto" className="text-sm font-semibold text-[#1a0dab] hover:underline line-clamp-1 mt-0.5">
              {effectiveTitle}
            </p>
            <p dir="auto" className="text-xs text-[#4d5156] line-clamp-2 mt-1 leading-relaxed">
              {effectiveDesc}
            </p>
          </div>

          {/* WhatsApp / Facebook / X OG Preview */}
          <div className="border border-[#e5e2da] bg-[#fbfaf8] overflow-hidden">
            <div className="px-3 py-2 border-b border-[#e5e2da] flex items-center gap-1.5 text-[11px] font-semibold text-[#5c635b]">
              <Share2 size={12} />
              <span>Social Share Preview (1200×630)</span>
            </div>
            {coverImage ? (
              <div style={{ aspectRatio: "1200 / 630" }} className="w-full overflow-hidden bg-gray-200">
                <img
                  src={coverImage}
                  alt={meta.coverImageAlt || effectiveTitle}
                  style={{
                    objectPosition: ogCrop ? `${ogCrop.x}% ${ogCrop.y}%` : `${focal.x}% ${focal.y}%`,
                    transform: ogCrop ? `scale(${ogCrop.zoom})` : undefined,
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="h-32 bg-gray-100 flex items-center justify-center text-xs text-gray-400">
                No lead image selected
              </div>
            )}
            <div className="p-3 bg-white border-t border-[#e5e2da]">
              <p className="text-[10px] uppercase tracking-wider text-[#5c635b]">dailyafadiat.com</p>
              <p dir="auto" className="text-xs font-bold text-[#18221b] line-clamp-1 mt-0.5">
                {effectiveTitle}
              </p>
              <p dir="auto" className="text-[11px] text-[#5c635b] line-clamp-1 mt-0.5">
                {effectiveDesc}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
