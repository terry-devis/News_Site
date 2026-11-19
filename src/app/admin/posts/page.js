"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  PlusCircle,
  Search,
  Edit3,
  Trash2,
  ExternalLink,
  Flame,
  Star,
} from "lucide-react";
import { useAdminLanguage } from "@/context/AdminLanguageContext";

export default function PostsAdmin() {
  const { t, lang } = useAdminLanguage();

  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  async function loadArticles() {
    setLoading(true);
    try {
      const res = await fetch("/api/articles?limit=100");
      const data = await res.json();
      setArticles(data.articles || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadArticles();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm(t("confirm_delete_post"))) return;
    try {
      const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
      if (res.ok) {
        setArticles(articles.filter((a) => a.id !== id));
      }
    } catch (e) {
      alert("Failed to delete article");
    }
  };

  const filtered = articles.filter((a) => {
    const matchSearch =
      a.title_ur.toLowerCase().includes(search.toLowerCase()) ||
      (a.title_en && a.title_en.toLowerCase().includes(search.toLowerCase()));
    const matchCat =
      categoryFilter === "all" ||
      (a.categories && a.categories.slug === categoryFilter);
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {t("posts_list_title")}
          </h1>
          <p className="text-xs text-gray-600 mt-0.5">
            {t("total_published_count")}: <strong className="font-sans text-gray-900">{articles.length}</strong>
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition shrink-0 shadow-xs"
        >
          <PlusCircle size={16} />
          <span>{t("nav_new_post")}</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-2 bg-white border border-[#dcd8cd] rounded-lg px-3 py-1.5 w-full sm:w-80 shadow-inner">
          <Search size={15} className="text-gray-400" />
          <input
            type="text"
            placeholder={t("search_posts_placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs outline-none bg-transparent"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <label className="text-xs font-semibold text-gray-600 shrink-0">{t("filter_department")}</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-white border border-[#dcd8cd] rounded-lg px-3 py-1.5 outline-none font-sans"
          >
            <option value="all">{t("all_departments")}</option>
            <option value="pakistan">پاکستان (Pakistan)</option>
            <option value="world">انٹرنیشنل (World)</option>
            <option value="sports">کھیل (Sports)</option>
            <option value="business">بزنس (Business)</option>
            <option value="tech">سائنس و ٹیکنالوجی (Tech)</option>
            <option value="health">صحت (Health)</option>
            <option value="weird">دلچسپ و عجیب (Odd News)</option>
          </select>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-xl overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-8 text-center text-xs text-gray-500">Loading articles...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500">{t("no_posts_found")}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-[#dcd8cd]/50 text-gray-700 font-bold border-b border-[#dcd8cd]">
                <tr>
                  <th className="p-3 w-16 text-center">{t("col_photo")}</th>
                  <th className="p-3 text-start">{t("col_title")}</th>
                  <th className="p-3 text-start">{t("col_category")}</th>
                  <th className="p-3 text-start">{t("col_author")}</th>
                  <th className="p-3 text-start">{t("col_badge")}</th>
                  <th className="p-3 text-start">{t("col_date")}</th>
                  <th className="p-3 text-center">{t("col_actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#dcd8cd]">
                {filtered.map((art) => (
                  <tr key={art.id} className="hover:bg-white/60 transition">
                    <td className="p-2.5 text-center">
                      <div className="relative size-11 rounded-lg overflow-hidden bg-gray-200 mx-auto">
                        <Image
                          src={art.cover_image || "/logo-light.webp"}
                          alt={art.title_ur}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="p-3 font-semibold text-gray-900 max-w-md">
                      <Link href={`/admin/posts/${art.id}`} className="hover:text-emerald-700 line-clamp-2 leading-relaxed">
                        {lang === "en" && art.title_en ? art.title_en : art.title_ur}
                      </Link>
                      {art.title_en && lang === "ur" && (
                        <span className="block text-[11px] text-gray-400 font-sans mt-0.5 line-clamp-1">
                          {art.title_en}
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-medium text-emerald-800">
                      {lang === "en" ? art.categories?.name_en || art.categories?.name_ur : art.categories?.name_ur || "—"}
                    </td>
                    <td className="p-3 text-gray-600">{art.author_name}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-1.5">
                        {art.is_breaking && (
                          <span className="inline-flex items-center gap-0.5 bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                            <Flame size={10} /> Breaking
                          </span>
                        )}
                        {art.is_featured && (
                          <span className="inline-flex items-center gap-0.5 bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded text-[10px] font-bold">
                            <Star size={10} /> Featured
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3 text-gray-500 font-sans whitespace-nowrap">
                      {new Date(art.created_at).toLocaleDateString(lang === "ur" ? "ur-PK" : "en-US")}
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link
                          href={`/story/${art.id || art.slug}`}
                          target="_blank"
                          className="p-1 text-gray-400 hover:text-emerald-700"
                          title="View Live"
                        >
                          <ExternalLink size={15} />
                        </Link>
                        <Link
                          href={`/admin/posts/${art.id}`}
                          className="p-1 text-gray-600 hover:text-blue-600"
                          title="Edit"
                        >
                          <Edit3 size={15} />
                        </Link>
                        <button
                          onClick={() => handleDelete(art.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
