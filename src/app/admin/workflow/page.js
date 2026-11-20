"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { hasPermission } from "@/lib/permissions";

const WORKFLOW_COLUMNS = ["draft", "in_review", "ready", "scheduled", "published"];

const COLUMN_META = {
  draft: { label: "Draft", accent: "border-t-stone-400", dot: "bg-stone-400" },
  in_review: { label: "In review", accent: "border-t-sky-500", dot: "bg-sky-500" },
  ready: { label: "Ready", accent: "border-t-amber-500", dot: "bg-amber-500" },
  scheduled: { label: "Scheduled", accent: "border-t-violet-500", dot: "bg-violet-500" },
  published: { label: "Published", accent: "border-t-[#184e2d]", dot: "bg-[#184e2d]" },
};

const PKT_TZ = "Asia/Karachi";

function getPktDayKey(dateInput) {
  if (!dateInput) return "";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: PKT_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(dateInput));
}

function getPktDayLabel(dateInput) {
  if (!dateInput) return "";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: PKT_TZ,
    day: "numeric",
    month: "short",
  }).format(new Date(dateInput));
}

function formatPktDateTime(dateInput) {
  if (!dateInput) return "";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: PKT_TZ,
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dateInput));
}

function timeAgo(dateInput) {
  if (!dateInput) return "";
  const mins = Math.floor((Date.now() - new Date(dateInput).getTime()) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function computeSeoScore(art) {
  let score = 35;
  if (art.cover_image) score += 20;
  if (art.summary_ur || art.excerpt_en || art.meta?.seoDescription) score += 15;
  if (art.content_ur && art.content_ur.length > 300) score += 10;
  if (art.title_ur && art.title_ur.length >= 30) score += 10;
  if (art.meta?.focusKeyword || art.meta?.coverImageAlt) score += 10;
  return Math.min(score, 100);
}

function MoveMenu({ targets, canPublish, onPick, onClose }) {
  const ref = useRef(null);

  useEffect(() => {
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="absolute right-0 bottom-full z-30 mb-1 w-40 overflow-hidden rounded-lg border border-[#e5e2da] bg-white py-1 shadow-lg"
    >
      <p className="px-3 py-1 text-[10px] font-bold tracking-wide text-[#5c635b] uppercase">
        Move to
      </p>
      {targets.map((target) => {
        const meta = COLUMN_META[target];
        const disabled = target === "published" && !canPublish;
        return (
          <button
            key={target}
            type="button"
            disabled={disabled}
            onClick={() => onPick(target)}
            title={disabled ? "You don't have permission to publish" : undefined}
            className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs font-medium text-[#18221b] transition hover:bg-[#f9f8f5] disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
          >
            <span className={`size-2 rounded-full ${meta.dot}`} />
            <span>{meta.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function ColumnSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg border border-[#e5e2da] bg-white p-3"
          style={{ opacity: 1 - 0.25 * i }}
        >
          <div className="h-2.5 w-12 rounded bg-[#f0ede6]" />
          <div className="mt-2 h-3 w-full rounded bg-[#f0ede6]" />
          <div className="mt-1.5 h-3 w-3/4 rounded bg-[#f0ede6]" />
          <div className="mt-3 h-2 w-1/2 rounded bg-[#f0ede6]" />
        </div>
      ))}
    </div>
  );
}

export default function WorkflowPage() {
  const [articles, setArticles] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [edition, setEdition] = useState("ur"); // 'ur' | 'en'
  const [dateFilter, setDateFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [movingId, setMovingId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [expandedDays, setExpandedDays] = useState({});
  const [toast, setToast] = useState(null);

  function showToast(message, type = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function loadBoard() {
    setLoading(true);
    try {
      const [artRes, meRes] = await Promise.all([
        fetch("/api/articles?limit=200").then((r) => r.json()),
        fetch("/api/auth/me").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      ]);
      if (meRes?.user) setCurrentUser(meRes.user);
      if (artRes?.articles) {
        setArticles(artRes.articles.filter((a) => a.status !== "trashed"));
      }
    } catch {
      showToast("Could not load workflow board", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBoard();
  }, []);

  const canPublish = !currentUser || hasPermission(currentUser, "article.publish");

  const boardColumns = useMemo(() => {
    const grouped = { draft: [], in_review: [], ready: [], scheduled: [], published: [] };
    for (const art of articles) {
      if (edition === "en" && !art.title_en) continue;
      if (edition === "ur" && !art.title_ur) continue;

      const stage = WORKFLOW_COLUMNS.includes(art.status) ? art.status : "published";
      const refDate = art.meta?.scheduledAt || art.updated_at || art.created_at;
      if (dateFilter && getPktDayKey(refDate) !== dateFilter) continue;

      grouped[stage].push(art);
    }
    return grouped;
  }, [articles, edition, dateFilter]);

  async function moveArticle(articleId, fromStage, toStage) {
    setOpenMenuId(null);
    if (!fromStage || !toStage || fromStage === toStage) return;
    if (toStage === "published" && !canPublish) {
      showToast("You don't have permission to publish", "error");
      return;
    }

    const prevArticles = articles;
    setMovingId(articleId);
    setArticles((prev) =>
      prev.map((a) =>
        a.id === articleId ? { ...a, status: toStage, updated_at: new Date().toISOString() } : a
      )
    );

    try {
      const res =
        toStage === "published"
          ? await fetch(`/api/articles/${articleId}/publish`, { method: "POST" })
          : await fetch(`/api/articles/${articleId}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: toStage }),
            });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Move failed");
      }
      showToast(`Moved to ${COLUMN_META[toStage].label}`, "success");
    } catch (err) {
      setArticles(prevArticles);
      showToast(err.message || "Move failed", "error");
    } finally {
      setMovingId(null);
    }
  }

  function groupByDay(list) {
    const todayKey = getPktDayKey(new Date().toISOString());
    const map = new Map();
    for (const item of list) {
      const refDate = item.meta?.scheduledAt || item.updated_at || item.created_at || new Date().toISOString();
      const dayKey = getPktDayKey(refDate);
      if (!map.has(dayKey)) {
        map.set(dayKey, {
          key: dayKey,
          label: getPktDayLabel(refDate),
          isToday: dayKey === todayKey,
          cards: [],
        });
      }
      map.get(dayKey).cards.push(item);
    }
    return Array.from(map.values()).sort((a, b) => b.key.localeCompare(a.key));
  }

  const allEmpty = WORKFLOW_COLUMNS.every((c) => boardColumns[c].length === 0);

  return (
    <div className="space-y-4">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 text-xs font-semibold shadow-lg border flex items-center gap-2 ${
            toast.type === "error"
              ? "bg-red-50 text-red-800 border-red-200"
              : "bg-[#0a2618] text-white border-[#1f5637]"
          }`}
        >
          {toast.type === "error" ? <AlertCircle size={14} /> : <CheckCircle2 size={14} className="text-emerald-300" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#e5e2da] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#18221b]">Workflow board</h1>
          <p className="text-xs sm:text-sm text-[#5c635b] mt-0.5">
            Move a story through the desk — drag it, or use the &lsquo;Move&rsquo; menu on each card. Publishing goes live.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date filter */}
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              aria-label="Show one day only"
              className="rounded-lg border border-[#e5e2da] bg-white px-2.5 py-1.5 text-xs text-[#18221b] focus:border-[#184e2d] focus:outline-none"
            />
            {dateFilter && (
              <button
                type="button"
                onClick={() => setDateFilter("")}
                className="rounded-lg border border-[#e5e2da] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#5c635b] hover:text-[#184e2d] cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Edition switcher */}
          <div className="inline-flex overflow-hidden rounded-lg border border-[#e5e2da] bg-white text-xs">
            {[
              { id: "ur", label: "اردو" },
              { id: "en", label: "English" },
            ].map((ed) => (
              <button
                key={ed.id}
                type="button"
                onClick={() => setEdition(ed.id)}
                className={`px-3 py-1.5 font-semibold transition cursor-pointer ${
                  edition === ed.id ? "bg-[#184e2d] text-white" : "text-[#5c635b] hover:bg-[#f9f8f5]"
                }`}
              >
                {ed.label}
              </button>
            ))}
          </div>

          {/* Refresh */}
          <button
            type="button"
            onClick={loadBoard}
            aria-label="Refresh"
            title="Refresh"
            className="rounded-lg border border-[#e5e2da] bg-white p-2 text-[#5c635b] hover:border-[#184e2d] hover:text-[#184e2d] transition cursor-pointer"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {dateFilter && (
        <p className="rounded-lg border border-[#e5e2da] bg-[#fbfaf8] px-3 py-2 text-xs text-[#5c635b]">
          Showing <span className="font-semibold text-[#18221b]">{getPktDayLabel(dateFilter)}</span> only.{" "}
          <Link href="/admin/articles" className="font-semibold text-[#184e2d] hover:underline">
            The articles list
          </Link>{" "}
          searches everything.
        </p>
      )}

      {/* 5-Column Kanban Board */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {WORKFLOW_COLUMNS.map((colKey) => {
          const meta = COLUMN_META[colKey];
          const colItems = boardColumns[colKey];
          const dayGroups = groupByDay(colItems);

          return (
            <div
              key={colKey}
              onDragOver={(e) => {
                if (draggingId !== null) {
                  e.preventDefault();
                  setDragOverCol(colKey);
                }
              }}
              onDragLeave={() => setDragOverCol((cur) => (cur === colKey ? null : cur))}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverCol(null);
                const id = Number(e.dataTransfer.getData("text/id"));
                const from = e.dataTransfer.getData("text/from");
                setDraggingId(null);
                if (id && from) moveArticle(id, from, colKey);
              }}
              className={`flex min-h-[62vh] flex-col rounded-xl border border-t-4 border-[#e5e2da] bg-[#fbfaf8] ${meta.accent} ${
                dragOverCol === colKey && draggingId !== null ? "ring-2 ring-[#184e2d]/40" : ""
              }`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between gap-2 border-b border-[#e5e2da] px-3 py-2.5 bg-white rounded-t-lg">
                <span className="flex items-center gap-2 text-sm font-bold text-[#18221b]">
                  <span className={`size-2 rounded-full ${meta.dot}`} />
                  {meta.label}
                </span>
                <span className="rounded bg-[#f4f2ec] px-1.5 py-0.5 text-[11px] font-bold text-[#5c635b] tabular-nums">
                  {colItems.length}
                </span>
              </div>

              {/* Column Body */}
              <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-2">
                {loading ? (
                  <ColumnSkeleton />
                ) : colItems.length === 0 ? (
                  <p className="px-2 py-8 text-center text-xs text-gray-400">
                    {dateFilter ? "Nothing on this day" : "Nothing here"}
                  </p>
                ) : (
                  dayGroups.map((group, gIdx) => {
                    const expandKey = `${colKey}::${group.key}`;
                    const isExpanded = expandedDays[expandKey] ?? gIdx === 0;

                    return (
                      <div key={group.key}>
                        <button
                          type="button"
                          aria-expanded={isExpanded}
                          onClick={() =>
                            setExpandedDays((prev) => ({ ...prev, [expandKey]: !isExpanded }))
                          }
                          className="flex w-full items-center gap-1.5 border-b border-[#e5e2da] px-0.5 pb-1.5 text-left transition hover:text-[#184e2d] cursor-pointer"
                        >
                          <span
                            className={`text-[9px] text-[#5c635b] transition-transform duration-200 ${
                              isExpanded ? "rotate-90" : ""
                            }`}
                          >
                            ▶
                          </span>
                          <span className="text-[11px] font-bold text-[#18221b]">
                            {group.isToday ? "Today" : group.label}
                          </span>
                          <span className="flex-1" />
                          <span className="text-[10px] font-bold text-[#5c635b] tabular-nums">
                            {group.cards.length}
                          </span>
                        </button>

                        {isExpanded && (
                          <div className="flex flex-col gap-2 pt-2">
                            {group.cards.map((art) => {
                              const targets = WORKFLOW_COLUMNS.filter((c) => c !== colKey);
                              const isMoving = movingId === art.id;
                              const seo = computeSeoScore(art);
                              const title =
                                edition === "en"
                                  ? art.title_en || art.title_ur
                                  : art.title_ur || art.title_en;
                              const catLabel =
                                edition === "en"
                                  ? art.categories?.name_en || art.categories?.name_ur
                                  : art.categories?.name_ur || art.categories?.name_en;

                              return (
                                <article
                                  key={art.id}
                                  draggable={!isMoving}
                                  onDragStart={(e) => {
                                    e.dataTransfer.setData("text/id", String(art.id));
                                    e.dataTransfer.setData("text/from", colKey);
                                    e.dataTransfer.effectAllowed = "move";
                                    setDraggingId(art.id);
                                  }}
                                  onDragEnd={() => {
                                    setDraggingId(null);
                                    setDragOverCol(null);
                                  }}
                                  className={`group relative rounded-lg border border-[#e5e2da] bg-white p-3 shadow-2xs transition hover:border-[#184e2d]/50 cursor-grab active:cursor-grabbing ${
                                    draggingId === art.id || isMoving ? "opacity-50" : ""
                                  }`}
                                >
                                  {/* Story ID & Language */}
                                  <div className="mb-1 flex items-center gap-1.5">
                                    <span className="rounded bg-[#f4f2ec] px-1 py-0.5 text-[10px] font-bold text-[#5c635b] tabular-nums">
                                      #{edition === "en" ? "E" : "U"}
                                      {art.id}
                                    </span>
                                    <span className="rounded bg-[#f4f2ec] px-1 py-0.5 text-[10px] font-semibold text-[#5c635b] uppercase">
                                      {edition === "en" ? "EN" : "اردو"}
                                    </span>
                                  </div>

                                  {/* Headline */}
                                  <Link
                                    href={`/admin/articles/${art.id}`}
                                    dir={edition === "ur" ? "rtl" : "ltr"}
                                    className="block text-sm font-semibold leading-snug text-[#18221b] group-hover:text-[#184e2d]"
                                  >
                                    {title}
                                  </Link>

                                  {/* Section & Flags */}
                                  <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-[#5c635b]">
                                    {catLabel && (
                                      <span className="rounded bg-[#f4f2ec] px-1.5 py-0.5 font-medium">
                                        {catLabel}
                                      </span>
                                    )}
                                    {art.is_breaking && (
                                      <span className="rounded bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.5 text-[10px] font-semibold">
                                        Breaking
                                      </span>
                                    )}
                                    {art.is_featured && (
                                      <span className="rounded bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 text-[10px] font-semibold">
                                        Featured
                                      </span>
                                    )}
                                  </div>

                                  {/* Author & SEO Meter */}
                                  <div className="mt-2 flex items-center justify-between gap-2">
                                    <span className="truncate text-[11px] text-[#5c635b]">
                                      {art.author_name || "—"}
                                    </span>
                                    <span
                                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                        seo >= 80
                                          ? "bg-emerald-50 text-[#184e2d]"
                                          : seo >= 60
                                          ? "bg-amber-50 text-amber-800"
                                          : "bg-red-50 text-red-700"
                                      }`}
                                      title="SEO completeness score"
                                    >
                                      SEO {seo}
                                    </span>
                                  </div>

                                  {/* Timestamp & Move Menu */}
                                  <div className="mt-1.5 flex items-center justify-between gap-2">
                                    <p className="text-[10px] text-gray-400">
                                      {colKey === "scheduled" && art.meta?.scheduledAt
                                        ? `Scheduled ${formatPktDateTime(art.meta.scheduledAt)}`
                                        : colKey === "published"
                                        ? `Published ${formatPktDateTime(art.created_at)}`
                                        : `Updated ${timeAgo(art.updated_at || art.created_at)}`}
                                    </p>

                                    <div className="relative">
                                      <button
                                        type="button"
                                        disabled={isMoving}
                                        onClick={() =>
                                          setOpenMenuId((cur) => (cur === art.id ? null : art.id))
                                        }
                                        className="rounded border border-[#e5e2da] px-1.5 py-0.5 text-[10px] font-semibold text-[#5c635b] hover:border-[#184e2d] hover:text-[#184e2d] disabled:opacity-50 cursor-pointer"
                                      >
                                        Move ▾
                                      </button>
                                      {openMenuId === art.id && (
                                        <MoveMenu
                                          targets={targets}
                                          canPublish={canPublish}
                                          onPick={(target) => moveArticle(art.id, colKey, target)}
                                          onClose={() => setOpenMenuId(null)}
                                        />
                                      )}
                                    </div>
                                  </div>
                                </article>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!loading && allEmpty && (
        <div className="bg-white border border-[#e5e2da] rounded-lg p-10 text-center">
          <p className="text-sm font-semibold text-[#18221b]">No stories yet</p>
          <p className="text-xs text-[#5c635b] mt-1">
            Create a draft and it will appear here, ready to move through the desk.
          </p>
        </div>
      )}
    </div>
  );
}
