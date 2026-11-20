"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, AlertTriangle } from "lucide-react";
import { hasPermission } from "@/lib/permissions";

const KPI_TILES = [
  {
    key: "publishedToday",
    label: "Published today",
    tone: "bg-emerald-50 text-[#184e2d] border-emerald-200",
    href: "/admin/articles?status=published",
  },
  {
    key: "drafts",
    label: "Drafts",
    tone: "bg-stone-100 text-stone-700 border-stone-200",
    href: "/admin/articles?status=draft",
    hint: "Stories in draft status",
  },
  {
    key: "inReview",
    label: "In review",
    tone: "bg-amber-50 text-amber-800 border-amber-200",
    href: "/admin/articles?status=in_review",
    hint: "Stories awaiting editorial review",
  },
  {
    key: "scheduled",
    label: "Scheduled",
    tone: "bg-violet-50 text-violet-700 border-violet-200",
    href: "/admin/articles?status=scheduled",
    hint: "Stories queued for scheduled publication",
  },
  {
    key: "breaking",
    label: "Breaking",
    tone: "bg-red-50 text-red-700 border-red-200",
    href: "/admin/breaking",
  },
  {
    key: "totalArticles",
    label: "Published articles",
    tone: "bg-sky-50 text-sky-700 border-sky-200",
    href: "/admin/articles?status=published",
    hint: "Total published stories",
  },
];

const STATUS_BADGES = {
  published: { label: "Published", cls: "bg-emerald-50 text-[#184e2d] border-emerald-200" },
  draft: { label: "Draft", cls: "bg-stone-100 text-stone-700 border-stone-200" },
  in_review: { label: "In review", cls: "bg-amber-50 text-amber-800 border-amber-200" },
  scheduled: { label: "Scheduled", cls: "bg-violet-50 text-violet-700 border-violet-200" },
};

function formatNumber(n) {
  return new Intl.NumberFormat("en-US").format(Number(n || 0));
}

function timeAgo(dateInput) {
  if (!dateInput) return "";
  const diffMs = Date.now() - new Date(dateInput).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateInput).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export default function AdminDashboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [counters, setCounters] = useState({
    publishedToday: 0,
    drafts: 0,
    inReview: 0,
    scheduled: 0,
    breaking: 0,
    totalArticles: 0,
  });
  const [seoWarnings, setSeoWarnings] = useState({ imagesMissingAltText: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [topToday, setTopToday] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const [dashRes, meRes] = await Promise.all([
          fetch("/api/dashboard").then((r) => (r.ok ? r.json() : null)),
          fetch("/api/auth/me").then((r) => (r.ok ? r.json() : null)),
        ]);

        if (!active) return;
        if (meRes?.user) setCurrentUser(meRes.user);
        if (dashRes?.counters) setCounters(dashRes.counters);
        if (dashRes?.seoWarnings) setSeoWarnings(dashRes.seoWarnings);
        if (dashRes?.recentActivity) setRecentActivity(dashRes.recentActivity);
        if (dashRes?.topToday) setTopToday(dashRes.topToday);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const canCreateArticle = !currentUser || hasPermission(currentUser, "article.create");
  const getHeadline = (item) => item?.title_ur || item?.title_en || "Untitled article";
  const getCategoryName = (item) =>
    item?.categories?.name_ur || item?.categories?.name_en || "News";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#e5e2da] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#18221b] tracking-tight">Dashboard</h1>
          <p className="text-xs sm:text-sm text-[#5c635b] mt-0.5">
            Signed in as{" "}
            <span className="font-semibold text-[#18221b]">
              {currentUser?.email || "newsroom staff"}
            </span>{" "}
            — newsroom at a glance
          </p>
        </div>

        {canCreateArticle && (
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center justify-center gap-1.5 bg-[#184e2d] hover:bg-[#0a2618] text-white text-xs font-semibold px-4 py-2.5 rounded-md shadow-2xs transition"
          >
            <Plus size={15} />
            <span>New article</span>
          </Link>
        )}
      </div>

      {/* Loading Skeleton */}
      {loading ? (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white border border-[#e5e2da] p-4 rounded-lg animate-pulse"
              >
                <div className="h-4 w-20 rounded bg-[#f0ede6]" />
                <div className="mt-3 h-7 w-12 rounded bg-[#f0ede6]" />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="lg:col-span-2 bg-white border border-[#e5e2da] rounded-lg divide-y divide-[#e5e2da] animate-pulse">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <div className="h-4 w-16 rounded bg-[#f0ede6]" />
                  <div className="h-3 flex-1 rounded bg-[#f0ede6]" />
                </div>
              ))}
            </div>
            <div className="bg-white border border-[#e5e2da] rounded-lg divide-y divide-[#e5e2da] animate-pulse">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3">
                  <div className="h-4 w-4 rounded bg-[#f0ede6]" />
                  <div className="h-3 flex-1 rounded bg-[#f0ede6]" />
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Top Row of 6 Clickable KPI Tiles */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
            {KPI_TILES.map((tile) => (
              <Link
                key={tile.key}
                href={tile.href}
                title={tile.hint}
                className="bg-white border border-[#e5e2da] rounded-lg p-4 shadow-2xs hover:border-[#184e2d] transition group"
              >
                <span
                  className={`inline-flex rounded-sm border px-1.5 py-0.5 text-[0.6875rem] font-semibold ${tile.tone}`}
                >
                  {tile.label}
                </span>
                <p className="mt-2.5 text-2xl font-bold tracking-tight text-[#18221b] tabular-nums group-hover:text-[#184e2d]">
                  {formatNumber(counters[tile.key])}
                </p>
              </Link>
            ))}
          </div>

          {/* Lower Grid: Recent Activity (2 cols) + Most Read & SEO Warnings (1 col) */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 items-start">
            {/* Recent Activity */}
            <section className="lg:col-span-2 bg-white border border-[#e5e2da] rounded-lg shadow-2xs overflow-hidden">
              <header className="flex items-center justify-between border-b border-[#e5e2da] px-4 py-3 bg-[#faf9f6]">
                <h2 className="text-xs font-bold uppercase tracking-wider text-[#5c635b]">
                  Recent activity
                </h2>
                <Link
                  href="/admin/articles"
                  className="text-xs font-semibold text-[#184e2d] hover:underline"
                >
                  All articles →
                </Link>
              </header>

              {recentActivity.length === 0 ? (
                <div className="p-10 text-center space-y-3">
                  <p className="text-sm font-semibold text-[#18221b]">No articles yet</p>
                  <p className="text-xs text-[#5c635b]">Create and publish your first story.</p>
                  {canCreateArticle && (
                    <Link
                      href="/admin/articles/new"
                      className="inline-flex items-center gap-1.5 bg-[#184e2d] text-white text-xs font-semibold px-3.5 py-2 rounded-md"
                    >
                      Create article
                    </Link>
                  )}
                </div>
              ) : (
                <ul className="divide-y divide-[#e5e2da]">
                  {recentActivity.map((art) => {
                    const badge = STATUS_BADGES[art.status] || STATUS_BADGES.published;
                    return (
                      <li key={art.id}>
                        <Link
                          href={`/admin/articles/${art.id}`}
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#f9f8f5] transition"
                        >
                          <span
                            className={`shrink-0 rounded-sm border px-1.5 py-0.5 text-[11px] font-semibold ${badge.cls}`}
                          >
                            {badge.label}
                          </span>
                          <span
                            dir="auto"
                            className="min-w-0 flex-1 truncate text-sm font-medium text-[#18221b] hover:text-[#184e2d]"
                          >
                            {getHeadline(art)}
                          </span>
                          <span className="hidden sm:block shrink-0 text-xs text-[#5c635b]">
                            {getCategoryName(art)}
                          </span>
                          <span className="shrink-0 text-xs text-gray-400">
                            {timeAgo(art.updated_at || art.created_at)}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>

            {/* Right Column: Most Read Today + SEO Warnings */}
            <div className="space-y-4">
              {/* Most Read Today */}
              <section className="bg-white border border-[#e5e2da] rounded-lg shadow-2xs overflow-hidden">
                <header className="flex items-center justify-between border-b border-[#e5e2da] px-4 py-3 bg-[#faf9f6]">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#5c635b]">
                    Most read today
                  </h2>
                  <span className="text-[11px] font-semibold text-[#184e2d]">Top 6</span>
                </header>

                {topToday.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#5c635b]">
                    Appears once stories are published.
                  </div>
                ) : (
                  <ol className="divide-y divide-[#e5e2da]">
                    {topToday.map((item, idx) => (
                      <li key={item.id} className="flex items-center gap-3 px-4 py-2.5">
                        <span className="w-5 text-sm font-bold text-gray-400 tabular-nums shrink-0">
                          {idx + 1}
                        </span>
                        <Link
                          href={`/admin/articles/${item.id}`}
                          dir="auto"
                          className="min-w-0 flex-1 truncate text-sm text-[#18221b] hover:text-[#184e2d] transition"
                        >
                          {getHeadline(item)}
                        </Link>
                        <span className="text-xs font-semibold text-[#5c635b] tabular-nums shrink-0">
                          {formatNumber(item.views_count)}
                        </span>
                      </li>
                    ))}
                  </ol>
                )}
              </section>

              {/* SEO Warnings */}
              <section className="bg-white border border-[#e5e2da] rounded-lg shadow-2xs p-4">
                <header className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#e5e2da]">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-[#5c635b]">
                    SEO warnings
                  </h2>
                  <AlertTriangle size={14} className="text-amber-600" />
                </header>

                <div className="flex items-center justify-between rounded-md bg-amber-50 border border-amber-200 px-3 py-2">
                  <span className="text-sm text-amber-900">Images missing alt text</span>
                  <span className="text-sm font-bold text-amber-900 tabular-nums">
                    {formatNumber(seoWarnings.imagesMissingAltText)}
                  </span>
                </div>

                <p className="mt-3 text-xs leading-5 text-[#5c635b]">
                  Alt text is both an accessibility requirement and a real source of Google Images
                  traffic.
                </p>
              </section>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
