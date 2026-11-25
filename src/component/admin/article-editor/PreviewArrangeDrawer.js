"use client";

import React, { useState, useMemo, useEffect } from "react";
import { X, Monitor, Smartphone, ArrowUp, ArrowDown, Trash2, Pin, Layers, Eye } from "lucide-react";

function cleanBodyHtml(html) {
  if (!html) return "";
  return String(html)
    .replace(/<!--excerpt:[\s\S]*?-->\n?/gi, "")
    .replace(/<!--meta:[\s\S]*?-->\n?/gi, "")
    .trim();
}

function splitHtmlIntoBlocks(html) {
  const trimmed = cleanBodyHtml(html);
  if (!trimmed) return [];
  const matches = trimmed.match(/<(p|h2|h3|h4|blockquote|ul|ol|figure|table|div)[^>]*>[\s\S]*?<\/\1>|<img[^>]*\/?>|<hr[^>]*\/?>/gi);
  if (matches && matches.length > 0) {
    return matches
      .filter((m) => stripTags(m).length > 0 || /<(img|hr)\b/i.test(m))
      .map((m, idx) => ({ id: `blk_${idx}_${m.length}`, html: m }));
  }
  return trimmed
    .split(/\n{2,}/)
    .filter(Boolean)
    .map((line, idx) => ({ id: `blk_${idx}`, html: line.startsWith("<") ? line : `<p>${line}</p>` }));
}

function stripTags(html) {
  return String(html || "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

export default function PreviewArrangeDrawer({
  open,
  onClose,
  initialLocale = "ur",
  titleUr,
  titleEn,
  summaryUr,
  summaryEn,
  contentUr,
  contentEn,
  coverImage,
  coverFraming,
  categoryName,
  categoryNameUr,
  categoryNameEn,
  authorName,
  authorNameUr,
  authorNameEn,
  onApplyArrangedContent,
}) {
  const [viewport, setViewport] = useState("desktop"); // 'desktop' | 'mobile'
  const [locale, setLocale] = useState(initialLocale === "en" ? "en" : "ur"); // 'ur' | 'en'
  const [mode, setMode] = useState("preview"); // 'preview' | 'arrange'

  useEffect(() => {
    if (open) {
      setLocale(initialLocale === "en" ? "en" : "ur");
      setArrangedBlocks(null);
    }
  }, [open, initialLocale]);

  const activeTitle = locale === "ur" ? titleUr || titleEn : titleEn || titleUr;
  const activeSummary = locale === "ur" ? summaryUr || summaryEn : summaryEn || summaryUr;
  const rawActiveHtml = locale === "ur" ? contentUr : contentEn;
  const activeHtml = useMemo(() => cleanBodyHtml(rawActiveHtml), [rawActiveHtml]);
  const hasBodyContent = Boolean(stripTags(activeHtml)) || /<(img|iframe|video|table)\b/i.test(activeHtml);

  const activeCategoryName =
    locale === "ur"
      ? categoryNameUr || categoryName || "خبر"
      : categoryNameEn || categoryName || "News";
  const activeAuthorName =
    locale === "ur"
      ? authorNameUr || authorName || "ایڈیٹوریل ڈیسک"
      : authorNameEn || authorName || "Daily Afadiat Desk";

  const blocks = useMemo(() => splitHtmlIntoBlocks(activeHtml), [activeHtml]);
  const [arrangedBlocks, setArrangedBlocks] = useState(null);

  const displayBlocks = arrangedBlocks || blocks;
  const focal = coverFraming?.focal || { x: 50, y: 50 };
  const heroCrop = coverFraming?.crops?.["16:9"];

  if (!open) return null;

  function moveBlock(index, dir) {
    const list = [...displayBlocks];
    const target = index + dir;
    if (target < 0 || target >= list.length) return;
    [list[index], list[target]] = [list[target], list[index]];
    setArrangedBlocks(list);
  }

  function removeBlock(index) {
    const list = displayBlocks.filter((_, i) => i !== index);
    setArrangedBlocks(list);
  }

  function applyChanges() {
    if (arrangedBlocks) {
      onApplyArrangedContent(locale, arrangedBlocks.map((b) => b.html).join("\n"));
      setArrangedBlocks(null);
    }
    setMode("preview");
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/55 flex justify-end">
      <div className="bg-[#f9f8f5] border-l border-[#e5e2da] w-full max-w-3xl h-full flex flex-col shadow-2xl">
        {/* Top Header */}
        <header className="px-5 py-3.5 bg-white border-b border-[#e5e2da] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h3 className="text-sm font-bold text-[#18221b]">Preview & arrange</h3>
            <span className="text-[11px] bg-[#eef5f0] text-[#184e2d] font-semibold px-2 py-0.5 rounded">
              {locale === "ur" ? "Urdu (RTL)" : "English (LTR)"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Switch */}
            <div className="flex border border-[#e5e2da] bg-[#fbfaf8] p-0.5">
              <button
                type="button"
                onClick={() => setMode("preview")}
                className={`px-2.5 py-1 text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                  mode === "preview" ? "bg-[#184e2d] text-white" : "text-[#5c635b]"
                }`}
              >
                <Eye size={13} />
                <span>Preview</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setArrangedBlocks(null);
                  setMode("arrange");
                }}
                className={`px-2.5 py-1 text-xs font-semibold flex items-center gap-1 cursor-pointer ${
                  mode === "arrange" ? "bg-[#184e2d] text-white" : "text-[#5c635b]"
                }`}
              >
                <Layers size={13} />
                <span>Arrange ({blocks.length})</span>
              </button>
            </div>

            {/* Locale Switch */}
            <div className="flex border border-[#e5e2da] bg-[#fbfaf8] p-0.5">
              <button
                type="button"
                onClick={() => {
                  setArrangedBlocks(null);
                  setLocale("ur");
                }}
                className={`px-2 py-1 text-xs font-semibold cursor-pointer ${
                  locale === "ur" ? "bg-[#0a2618] text-white" : "text-[#5c635b]"
                }`}
              >
                UR
              </button>
              <button
                type="button"
                onClick={() => {
                  setArrangedBlocks(null);
                  setLocale("en");
                }}
                className={`px-2 py-1 text-xs font-semibold cursor-pointer ${
                  locale === "en" ? "bg-[#0a2618] text-white" : "text-[#5c635b]"
                }`}
              >
                EN
              </button>
            </div>

            {/* Viewport Switch */}
            {mode === "preview" && (
              <div className="flex border border-[#e5e2da] bg-[#fbfaf8] p-0.5">
                <button
                  type="button"
                  onClick={() => setViewport("desktop")}
                  className={`p-1.5 cursor-pointer ${
                    viewport === "desktop" ? "bg-white text-[#184e2d] shadow-2xs" : "text-[#5c635b]"
                  }`}
                  title="Desktop preview"
                >
                  <Monitor size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setViewport("mobile")}
                  className={`p-1.5 cursor-pointer ${
                    viewport === "mobile" ? "bg-white text-[#184e2d] shadow-2xs" : "text-[#5c635b]"
                  }`}
                  title="Mobile preview"
                >
                  <Smartphone size={14} />
                </button>
              </div>
            )}

            <button type="button" onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-800 cursor-pointer">
              <X size={18} />
            </button>
          </div>
        </header>

        {/* Pinned Notice */}
        <div className="px-5 py-2 bg-[#eef5f0] border-b border-[#d5e6da] text-xs text-[#184e2d] flex items-center gap-2">
          <Pin size={13} className="shrink-0" />
          <span>
            <strong className="font-semibold">Pinned:</strong> headline and hero image stay at the top of the story.
          </span>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5">
          {mode === "preview" ? (
            <div
              dir={locale === "ur" ? "rtl" : "ltr"}
              className={`mx-auto bg-white border border-[#e5e2da] shadow-sm transition-all ${
                viewport === "mobile" ? "max-w-[390px] p-4" : "max-w-2xl p-7"
              }`}
            >
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#184e2d] mb-2">
                <span>{activeCategoryName}</span>
                <span>•</span>
                <span className="text-[#5c635b] font-normal">{activeAuthorName}</span>
              </div>

              <h1
                className={`font-bold text-[#18221b] leading-snug ${
                  locale === "ur" ? "urdu-headline" : "font-sans"
                } ${viewport === "mobile" ? "text-xl" : "text-2xl"}`}
              >
                {activeTitle || (locale === "ur" ? "بغیر عنوان خبر" : "Untitled story")}
              </h1>

              {activeSummary && (
                <p
                  className={`mt-2.5 text-sm text-[#5c635b] leading-relaxed border-b border-[#e5e2da] pb-3 ${
                    locale === "ur" ? "urdu-body" : "font-sans"
                  }`}
                >
                  {activeSummary}
                </p>
              )}

              {coverImage && (
                <div style={{ aspectRatio: "16 / 9" }} className="mt-4 w-full overflow-hidden bg-gray-100 border border-[#e5e2da]">
                  <img
                    src={coverImage}
                    alt={activeTitle}
                    style={{
                      objectPosition: heroCrop ? `${heroCrop.x}% ${heroCrop.y}%` : `${focal.x}% ${focal.y}%`,
                      transform: heroCrop ? `scale(${heroCrop.zoom})` : undefined,
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div
                className={`mt-5 max-w-none text-[#18221b] space-y-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-5 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-4 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:ps-6 [&_ol]:list-decimal [&_ol]:ps-6 [&_blockquote]:border-s-4 [&_blockquote]:border-[#184e2d] [&_blockquote]:ps-4 [&_blockquote]:italic [&_blockquote]:text-[#5c635b] [&_a]:text-[#184e2d] [&_a]:underline [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded [&_img]:my-3 [&_p]:mb-3 ${
                  locale === "ur" ? "urdu-body leading-loose text-base" : "font-sans leading-relaxed text-sm"
                }`}
                dangerouslySetInnerHTML={{
                  __html: hasBodyContent
                    ? activeHtml
                    : `<p class='text-gray-400'>${
                        locale === "ur"
                          ? "ابھی تک اردو متن نہیں لکھا گیا۔"
                          : "No English body content written yet."
                      }</p>`,
                }}
              />
            </div>
          ) : (
            <div className="space-y-3 max-w-2xl mx-auto">
              <div className="flex items-center justify-between">
                <p className="text-xs text-[#5c635b]">
                  Reorder or remove body blocks for the {locale === "ur" ? "Urdu" : "English"} edition.
                </p>
                {arrangedBlocks && (
                  <button
                    type="button"
                    onClick={applyChanges}
                    className="px-3.5 py-1.5 bg-[#184e2d] hover:bg-[#0a2618] text-white text-xs font-semibold cursor-pointer"
                  >
                    Apply arrangement
                  </button>
                )}
              </div>

              {displayBlocks.length === 0 ? (
                <div className="bg-white border border-[#e5e2da] p-8 text-center text-xs text-[#5c635b]">
                  No blocks found in the {locale === "ur" ? "Urdu" : "English"} body yet.
                </div>
              ) : (
                displayBlocks.map((blk, idx) => (
                  <div
                    key={blk.id}
                    className="bg-white border border-[#e5e2da] p-3 flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="text-[11px] font-mono font-bold text-[#5c635b] w-6 shrink-0">
                        #{idx + 1}
                      </span>
                      <p dir={locale === "ur" ? "rtl" : "ltr"} className="text-xs text-[#18221b] truncate flex-1">
                        {stripTags(blk.html) || "[Media / Divider block]"}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveBlock(idx, -1)}
                        className="p-1.5 text-[#5c635b] hover:text-[#18221b] disabled:opacity-30 cursor-pointer"
                        title="Move up"
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        disabled={idx === displayBlocks.length - 1}
                        onClick={() => moveBlock(idx, 1)}
                        className="p-1.5 text-[#5c635b] hover:text-[#18221b] disabled:opacity-30 cursor-pointer"
                        title="Move down"
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeBlock(idx)}
                        className="p-1.5 text-red-500 hover:text-red-700 cursor-pointer"
                        title="Remove block"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
