"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Flame,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Edit2,
  Save,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Radio,
  Clock,
  Globe,
  Sliders,
  Check,
  X,
} from "lucide-react";

const PRIORITY_TIERS = [
  { id: 1, name: "Tier 1: Red Alert / Flash", name_ur: "ریڈ الرٹ / فلیش بینر", color: "bg-red-700 text-white", border: "border-red-600" },
  { id: 2, name: "Tier 2: Breaking News Ticker", name_ur: "بریکنگ نیوز پٹی", color: "bg-red-600 text-white", border: "border-red-500" },
  { id: 3, name: "Tier 3: Developing Story", name_ur: "اہم پیش رفت / لائیو", color: "bg-amber-600 text-white", border: "border-amber-500" },
];

export default function BreakingNewsAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTier, setFilterTier] = useState("all"); // 'all' | 1 | 2 | 3
  const [masterTickerActive, setMasterTickerActive] = useState(true);
  const [notice, setNotice] = useState(null);

  // New Ticker Form State
  const [newUrdu, setNewUrdu] = useState("");
  const [newEnglish, setNewEnglish] = useState("");
  const [newLink, setNewLink] = useState("");
  const [newPriority, setNewPriority] = useState(2);
  const [newExpirationHours, setNewExpirationHours] = useState(6);
  const [adding, setAdding] = useState(false);

  // Editing state
  const [editingId, setEditingId] = useState(null);
  const [editUrdu, setEditUrdu] = useState("");
  const [editEnglish, setEditEnglish] = useState("");
  const [editLink, setEditLink] = useState("");
  const [editPriority, setEditPriority] = useState(2);
  const [savingEdit, setSavingEdit] = useState(false);

  async function loadBreakingNews() {
    setLoading(true);
    try {
      const [res, settingsRes] = await Promise.all([
        fetch("/api/breaking"),
        fetch("/api/settings?key=breaking_ticker_enabled").catch(() => null),
      ]);
      const data = await res.json();
      if (data?.breakingNews) {
        setItems(data.breakingNews);
      }
      if (settingsRes && settingsRes.ok) {
        const sData = await settingsRes.json();
        if (sData?.breaking_ticker_enabled !== undefined && sData?.breaking_ticker_enabled !== null) {
          setMasterTickerActive(Boolean(sData.breaking_ticker_enabled));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const toggleMasterTicker = async () => {
    const next = !masterTickerActive;
    setMasterTickerActive(next);
    try {
      await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "breaking_ticker_enabled", value: next }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadBreakingNews();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newUrdu.trim() && !newEnglish.trim()) {
      setNotice({ type: "error", text: "براہ کرم اردو یا انگریزی خبر کا متن درج کریں۔" });
      return;
    }

    setAdding(true);
    setNotice(null);

    try {
      const res = await fetch("/api/breaking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text_ur: newUrdu.trim() || newEnglish.trim(),
          text_en: newEnglish.trim() || newUrdu.trim(),
          link_url: newLink.trim() || null,
          priority: Number(newPriority),
          is_active: true,
        }),
      });

      const data = await res.json();
      if (res.ok && data?.item) {
        setItems([data.item, ...items]);
        setNewUrdu("");
        setNewEnglish("");
        setNewLink("");
        setNotice({ type: "success", text: "✓ بریکنگ نیوز کامیابی سے لائیو پٹی میں شامل کر دی گئی!" });
      } else {
        setNotice({ type: "error", text: data?.error || "بریکنگ نیوز شامل کرنے میں ناکامی" });
      }
    } catch (err) {
      setNotice({ type: "error", text: "نیٹ ورک میں خرابی پیش آئی۔" });
    } finally {
      setAdding(false);
      setTimeout(() => setNotice(null), 4000);
    }
  };

  const handleToggleActive = async (item) => {
    const updatedStatus = !item.is_active;

    // Optimistic update
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, is_active: updatedStatus } : i))
    );

    try {
      await fetch(`/api/breaking/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: updatedStatus }),
      });
      setNotice({
        type: "success",
        text: updatedStatus
          ? "✓ خبر فعال ہو گئی اور سرورق پر لائیو دکھائی دے رہی ہے۔"
          : "✓ خبر غیر فعال کر دی گئی اور لائیو پٹی سے ہٹا دی گئی۔",
      });
      setTimeout(() => setNotice(null), 3000);
    } catch (err) {
      console.error(err);
      loadBreakingNews();
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("کیا آپ واقعی اس بریکنگ نیوز کو حذف کرنا چاہتے ہیں؟")) return;

    setItems((prev) => prev.filter((i) => i.id !== id));

    try {
      await fetch(`/api/breaking/${id}`, { method: "DELETE" });
      setNotice({ type: "success", text: "✓ بریکنگ نیوز کامیابی کے ساتھ حذف کر دی گئی۔" });
      setTimeout(() => setNotice(null), 3000);
    } catch (err) {
      console.error(err);
      loadBreakingNews();
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditUrdu(item.text_ur || "");
    setEditEnglish(item.text_en || "");
    setEditLink(item.link_url || "");
    setEditPriority(item.priority || 2);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveEdit = async (id) => {
    setSavingEdit(true);
    try {
      const res = await fetch("/api/breaking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          text_ur: editUrdu.trim(),
          text_en: editEnglish.trim(),
          link_url: editLink.trim() || null,
          priority: Number(editPriority),
        }),
      });
      const data = await res.json();
      if (res.ok && data?.item) {
        setItems((prev) => prev.map((i) => (i.id === id ? data.item : i)));
        setEditingId(null);
        setNotice({ type: "success", text: "✓ بریکنگ نیوز کامیابی سے اپ ڈیٹ ہو گئی۔" });
        setTimeout(() => setNotice(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSavingEdit(false);
    }
  };

  const filteredItems = items.filter((item) => {
    if (filterTier === "all") return true;
    return item.priority === Number(filterTier);
  });

  const activeCount = items.filter((i) => i.is_active).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* 1. Top Header & Master Ticker Control */}
      <div className="bg-white border border-[#e5e2da] rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-red-700 text-white flex items-center justify-center">
              <Flame size={18} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <span>Breaking ticker</span>
                <span className="bg-red-100 text-red-800 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping" />
                  Live Strip
                </span>
              </h1>
              <p className="text-xs text-gray-500">
                Real-time breaking ticker manager with priority tiers and auto-expiration.
              </p>
            </div>
          </div>
        </div>

        {/* Master Portal Ticker Switch */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2.5 bg-[#f9f8f5] px-3.5 py-2 rounded-xl border border-[#e5e2da]">
            <span className="text-xs font-bold text-gray-800">Master Portal Ticker:</span>
            <button
              type="button"
              onClick={toggleMasterTicker}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                masterTickerActive ? "bg-red-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  masterTickerActive ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
            <span
              className={`text-[11px] font-bold ${
                masterTickerActive ? "text-red-700" : "text-gray-400"
              }`}
            >
              {masterTickerActive ? "ACTIVE ON PORTAL" : "PAUSED"}
            </span>
          </div>

          <button
            onClick={loadBreakingNews}
            disabled={loading}
            className="border border-[#e5e2da] bg-white hover:bg-gray-50 p-2 rounded-xl text-gray-600 transition-colors shadow-xs"
            title="Refresh breaking news"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-red-700" : ""} />
          </button>
        </div>
      </div>

      {/* Notice alert */}
      {notice && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between shadow-xs ${
            notice.type === "success"
              ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
              : "bg-red-50 text-red-900 border border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {notice.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            <span>{notice.text}</span>
          </div>
          <button onClick={() => setNotice(null)} className="text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        </div>
      )}

      {/* 2. New Breaking News Dispatch Card */}
      <div className="bg-white border border-[#e5e2da] rounded-xl p-4 sm:p-5 shadow-xs">
        <h2 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 pb-3 border-b border-[#f0eee6]">
          <Plus size={14} className="text-red-700" />
          <span>Dispatch New Breaking Item (بیک وقت اردو و انگریزی)</span>
        </h2>

        <form onSubmit={handleCreate} className="mt-4 space-y-4">
          {/* Priority Tier Selector */}
          <div>
            <label className="text-xs font-bold text-gray-800 block mb-1.5">
              Select Priority Tier & Broadcast Format
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {PRIORITY_TIERS.map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setNewPriority(tier.id)}
                  className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                    newPriority === tier.id
                      ? `${tier.border} bg-red-50/50 shadow-xs ring-1 ring-red-600`
                      : "border-[#e5e2da] bg-[#fcfbf9] hover:bg-gray-50"
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full mt-0.5 shrink-0 flex items-center justify-center ${
                      newPriority === tier.id ? "bg-red-700 text-white" : "border border-gray-300"
                    }`}
                  >
                    {newPriority === tier.id && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">{tier.name}</span>
                    <span className="text-[11px] text-gray-500 font-serif urdu-headline">{tier.name_ur}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Bilingual Headline Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Urdu Headline */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <span>اردو بریکنگ نیوز (UR Headline)</span>
                <span className="text-red-500">*</span>
              </label>
              <textarea
                dir="rtl"
                rows={2}
                value={newUrdu}
                onChange={(e) => setNewUrdu(e.target.value)}
                placeholder="اہم اور فوری خبر کی سرخی یہاں اردو میں تحریر کریں…"
                className="w-full text-base font-serif urdu-headline text-gray-900 border border-[#e5e2da] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-700 resize-none placeholder:text-gray-300"
              />
            </div>

            {/* English Headline */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                <span>English Breaking Headline (EN)</span>
                <span className="text-blue-600 text-[10px] font-semibold">Synchronized</span>
              </label>
              <textarea
                dir="ltr"
                rows={2}
                value={newEnglish}
                onChange={(e) => setNewEnglish(e.target.value)}
                placeholder="Enter urgent English headline for ticker..."
                className="w-full text-xs font-sans text-gray-900 border border-[#e5e2da] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-700 resize-none placeholder:text-gray-300"
              />
            </div>
          </div>

          {/* Link & Auto-Expiration Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
            <div className="sm:col-span-7 space-y-1">
              <label className="text-[11px] font-bold text-gray-700">Target Story Link (Optional)</label>
              <input
                type="text"
                value={newLink}
                onChange={(e) => setNewLink(e.target.value)}
                placeholder="/story/11 or https://..."
                className="w-full text-xs p-2 rounded-lg border border-[#e5e2da] bg-[#f9f8f5] focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-700 font-mono"
              />
            </div>

            <div className="sm:col-span-3 space-y-1">
              <label className="text-[11px] font-bold text-gray-700">Auto-Expire Duration</label>
              <select
                value={newExpirationHours}
                onChange={(e) => setNewExpirationHours(Number(e.target.value))}
                className="w-full text-xs p-2 rounded-lg border border-[#e5e2da] bg-[#f9f8f5] focus:outline-none focus:ring-1 focus:ring-red-700 font-semibold"
              >
                <option value={1}>1 Hour (Urgent)</option>
                <option value={3}>3 Hours</option>
                <option value={6}>6 Hours (Standard)</option>
                <option value={12}>12 Hours</option>
                <option value={24}>24 Hours</option>
                <option value={0}>No expiration (Manual)</option>
              </select>
            </div>

            <div className="sm:col-span-2 flex items-end">
              <button
                type="submit"
                disabled={adding}
                className="w-full bg-red-700 hover:bg-red-800 text-white font-bold text-xs py-2 px-3 rounded-lg shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Flame size={14} />
                <span>{adding ? "Posting..." : "Post live"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* 3. Ticker Inventory Table Card */}
      <div className="bg-white border border-[#e5e2da] rounded-xl shadow-xs overflow-hidden">
        {/* Table Filter Bar */}
        <div className="p-3 sm:p-4 bg-[#fcfbf9] border-b border-[#e5e2da] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-800">Filter Tickers:</span>
            <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-[#e5e2da]">
              <button
                onClick={() => setFilterTier("all")}
                className={`px-2.5 py-1 text-xs font-semibold rounded ${
                  filterTier === "all" ? "bg-red-700 text-white" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                All ({items.length})
              </button>
              <button
                onClick={() => setFilterTier(1)}
                className={`px-2.5 py-1 text-xs font-semibold rounded ${
                  filterTier === 1 ? "bg-red-700 text-white" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Tier 1 Flash
              </button>
              <button
                onClick={() => setFilterTier(2)}
                className={`px-2.5 py-1 text-xs font-semibold rounded ${
                  filterTier === 2 ? "bg-red-700 text-white" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Tier 2 Breaking
              </button>
              <button
                onClick={() => setFilterTier(3)}
                className={`px-2.5 py-1 text-xs font-semibold rounded ${
                  filterTier === 3 ? "bg-red-700 text-white" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Tier 3 Developing
              </button>
            </div>
          </div>

          <div className="text-xs text-gray-500 flex items-center gap-2">
            <span className="font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              {activeCount} Active on Portal
            </span>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f9f8f5] border-b border-[#e5e2da] text-gray-600 font-bold uppercase text-[11px]">
              <tr>
                <th className="p-3.5 w-12 text-center">Tier</th>
                <th className="p-3.5">Breaking News Headline (Bilingual)</th>
                <th className="p-3.5 w-36">Target Link</th>
                <th className="p-3.5 w-24 text-center">Active</th>
                <th className="p-3.5 w-24 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0eee6]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    Loading breaking tickers...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    No breaking items found.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isEditing = editingId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-[#fcfbf9] transition-colors ${
                        item.is_active ? "bg-white" : "bg-gray-50/70 opacity-60"
                      }`}
                    >
                      {/* Priority Tier Badge */}
                      <td className="p-3.5 text-center align-top">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            item.priority === 1
                              ? "bg-red-700 text-white"
                              : item.priority === 2
                              ? "bg-red-100 text-red-800 border border-red-300"
                              : "bg-amber-100 text-amber-800 border border-amber-300"
                          }`}
                        >
                          T{item.priority || 2}
                        </span>
                      </td>

                      {/* Headline (Urdu + English) */}
                      <td className="p-3.5 align-top">
                        {isEditing ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              dir="rtl"
                              value={editUrdu}
                              onChange={(e) => setEditUrdu(e.target.value)}
                              className="w-full p-2 border border-[#e5e2da] rounded-lg font-serif urdu-headline text-sm focus:outline-none focus:ring-1 focus:ring-red-700"
                            />
                            <input
                              type="text"
                              dir="ltr"
                              value={editEnglish}
                              onChange={(e) => setEditEnglish(e.target.value)}
                              className="w-full p-2 border border-[#e5e2da] rounded-lg text-xs font-sans focus:outline-none focus:ring-1 focus:ring-red-700"
                            />
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="font-serif urdu-headline text-base text-gray-900 leading-normal text-right">
                              {item.text_ur}
                            </div>
                            {item.text_en && (
                              <div className="text-xs text-gray-500 font-sans flex items-center gap-1.5">
                                <span className="bg-blue-50 text-blue-700 font-bold px-1 rounded text-[10px]">
                                  EN
                                </span>
                                <span>{item.text_en}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Target Link */}
                      <td className="p-3.5 align-top">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editLink}
                            onChange={(e) => setEditLink(e.target.value)}
                            placeholder="/story/11"
                            className="w-full p-1.5 border border-[#e5e2da] rounded text-xs font-mono"
                          />
                        ) : item.link_url ? (
                          <Link
                            href={item.link_url}
                            target="_blank"
                            className="font-mono text-xs text-gray-600 hover:text-red-700 flex items-center gap-1 truncate max-w-[140px]"
                          >
                            <ExternalLink size={11} className="shrink-0" />
                            <span className="truncate">{item.link_url}</span>
                          </Link>
                        ) : (
                          <span className="text-gray-400 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Active Toggle Switch */}
                      <td className="p-3.5 text-center align-top">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(item)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            item.is_active ? "bg-emerald-600" : "bg-gray-300"
                          }`}
                          title={item.is_active ? "Click to deactivate" : "Click to activate"}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                              item.is_active ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-center align-top">
                        {isEditing ? (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => saveEdit(item.id)}
                              disabled={savingEdit}
                              className="p-1 rounded bg-emerald-600 text-white hover:bg-emerald-700"
                              title="Save changes"
                            >
                              <Check size={13} />
                            </button>
                            <button
                              onClick={cancelEdit}
                              className="p-1 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                              title="Cancel"
                            >
                              <X size={13} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => startEdit(item)}
                              className="p-1 text-gray-500 hover:text-gray-800 rounded hover:bg-gray-100"
                              title="Edit ticker"
                            >
                              <Edit2 size={13} />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className="p-1 text-red-500 hover:text-red-700 rounded hover:bg-red-50"
                              title="Delete ticker"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
