"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileText,
  MessageSquare,
  Megaphone,
  Mail,
  PlusCircle,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { useAdminLanguage } from "@/context/AdminLanguageContext";

export default function AdminDashboard() {
  const { t, lang } = useAdminLanguage();

  const [stats, setStats] = useState({
    articlesCount: 0,
    pendingCommentsCount: 0,
    activeAdsCount: 0,
    subscribersCount: 0,
  });
  const [pendingComments, setPendingComments] = useState([]);
  const [recentArticles, setRecentArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    setLoading(true);
    try {
      const [artRes, comRes, adRes, subRes] = await Promise.all([
        fetch("/api/articles?limit=5").then((r) => r.json()),
        fetch("/api/comments?all=true").then((r) => r.json()),
        fetch("/api/ads").then((r) => r.json()),
        fetch("/api/newsletter").then((r) => r.json()),
      ]);

      const allComments = comRes.comments || [];
      const pending = allComments.filter((c) => c.status === "pending");
      const activeAds = (adRes.slots || []).filter((s) => s.is_active);

      setStats({
        articlesCount: artRes.articles?.length || 0,
        pendingCommentsCount: pending.length,
        activeAdsCount: activeAds.length,
        subscribersCount: subRes.subscribers?.length || 0,
      });

      setPendingComments(pending.slice(0, 5));
      setRecentArticles(artRes.articles || []);
    } catch (err) {
      console.error("Dashboard data error:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleModerate = async (commentId, status) => {
    try {
      const res = await fetch("/api/comments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment_id: commentId, status }),
      });
      if (res.ok) {
        loadData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {t("dashboard_welcome_title")}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl leading-relaxed">
            {t("dashboard_welcome_desc")}
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition shrink-0 shadow-xs"
        >
          <PlusCircle size={17} />
          <span>{t("dashboard_publish_btn")}</span>
        </Link>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Articles */}
        <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-600">{t("stat_published_articles")}</span>
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
              <FileText size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2 font-sans">
            {loading ? "..." : stats.articlesCount}
          </div>
          <Link href="/admin/posts" className="text-[11px] text-emerald-700 hover:underline mt-2 inline-block font-semibold">
            {t("view_all")} →
          </Link>
        </div>

        {/* Pending Comments */}
        <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-600">{t("stat_pending_comments")}</span>
            <div className={`p-2 rounded-lg ${stats.pendingCommentsCount > 0 ? "bg-amber-100 text-amber-800" : "bg-gray-100 text-gray-600"}`}>
              <MessageSquare size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2 font-sans">
            {loading ? "..." : stats.pendingCommentsCount}
          </div>
          <Link href="/admin/comments" className="text-[11px] text-emerald-700 hover:underline mt-2 inline-block font-semibold">
            {t("view_all")} →
          </Link>
        </div>

        {/* Active Ads */}
        <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-600">{t("stat_active_ads")}</span>
            <div className="p-2 rounded-lg bg-blue-100 text-blue-800">
              <Megaphone size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2 font-sans">
            {loading ? "..." : stats.activeAdsCount}
          </div>
          <Link href="/admin/ads" className="text-[11px] text-emerald-700 hover:underline mt-2 inline-block font-semibold">
            {t("view_all")} →
          </Link>
        </div>

        {/* Newsletter Subscribers */}
        <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-600">{t("stat_subscribers")}</span>
            <div className="p-2 rounded-lg bg-purple-100 text-purple-800">
              <Mail size={18} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-2 font-sans">
            {loading ? "..." : stats.subscribersCount}
          </div>
          <Link href="/admin/newsletter" className="text-[11px] text-emerald-700 hover:underline mt-2 inline-block font-semibold">
            {t("view_all")} →
          </Link>
        </div>
      </div>

      {/* Grid: Pending Comments Check & Balance + Recent Articles */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* 1. Pending Comments Moderation (7 Cols) */}
        <div className="lg:col-span-7 bg-[#efeee9] border border-[#dcd8cd] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#dcd8cd] mb-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <MessageSquare size={18} className="text-amber-700" />
              <span>{t("pending_comments_title")}</span>
            </h2>
            <Link href="/admin/comments" className="text-xs text-emerald-700 hover:underline font-semibold">
              {t("view_all")}
            </Link>
          </div>

          {pendingComments.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-500">
              {t("all_clear_comments")}
            </div>
          ) : (
            <div className="space-y-3">
              {pendingComments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-white border border-[#dcd8cd] rounded-lg p-3.5 space-y-2 shadow-2xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-gray-900">{comment.author_name}</span>
                    <span className="text-[10px] text-gray-400 font-sans">
                      {new Date(comment.created_at).toLocaleDateString(lang === "ur" ? "ur-PK" : "en-US")}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {comment.content}
                  </p>
                  <div className="flex items-center justify-end gap-2 pt-1 border-t border-gray-100">
                    <button
                      onClick={() => handleModerate(comment.id, "approved")}
                      className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded transition"
                    >
                      <CheckCircle size={12} />
                      <span>{t("approve")}</span>
                    </button>
                    <button
                      onClick={() => handleModerate(comment.id, "rejected")}
                      className="inline-flex items-center gap-1 text-[11px] font-bold bg-red-600 hover:bg-red-700 text-white px-2.5 py-1 rounded transition"
                    >
                      <XCircle size={12} />
                      <span>{t("reject")}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Recent Articles (5 Cols) */}
        <div className="lg:col-span-5 bg-[#efeee9] border border-[#dcd8cd] rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#dcd8cd] mb-4">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <FileText size={18} className="text-emerald-700" />
              <span>{t("recent_articles")}</span>
            </h2>
            <Link href="/admin/posts" className="text-xs text-emerald-700 hover:underline font-semibold">
              {t("view_all")}
            </Link>
          </div>

          <div className="divide-y divide-[#dcd8cd]">
            {recentArticles.slice(0, 5).map((art) => (
              <div key={art.id} className="py-2.5 flex items-start justify-between gap-3">
                <div className="flex-1">
                  <span className="text-[10px] font-bold text-emerald-700 font-sans">
                    {lang === "en" ? art.categories?.name_en || art.categories?.name_ur : art.categories?.name_ur || "خبر"}
                  </span>
                  <Link href={`/admin/posts/${art.id}`} className="block">
                    <h3 className="text-xs font-bold text-gray-900 hover:text-emerald-700 line-clamp-2 leading-snug">
                      {lang === "en" && art.title_en ? art.title_en : art.title_ur}
                    </h3>
                  </Link>
                </div>
                <Link
                  href={`/story/${art.id || art.slug}`}
                  target="_blank"
                  className="text-gray-400 hover:text-emerald-700 p-1"
                  title="View Live"
                >
                  <ExternalLink size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
