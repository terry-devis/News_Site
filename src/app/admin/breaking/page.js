"use client";
import React, { useState, useEffect } from "react";
import { Flame, Plus, Trash2, CheckCircle2, XCircle, Edit2, Save, RefreshCw, AlertCircle } from "lucide-react";
import { useAdminLanguage } from "@/context/AdminLanguageContext";

export default function BreakingNewsAdmin() {
  const { lang, t, dir } = useAdminLanguage();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState(null);

  // New ticker form state
  const [newUrdu, setNewUrdu] = useState("");
  const [newEnglish, setNewEnglish] = useState("");
  const [newPriority, setNewPriority] = useState(1);
  const [adding, setAdding] = useState(false);

  // Edit state
  const [editingId, setEditingId] = useState(null);
  const [editUrdu, setEditUrdu] = useState("");
  const [editEnglish, setEditEnglish] = useState("");
  const [editPriority, setEditPriority] = useState(1);

  async function loadBreakingNews() {
    setLoading(true);
    try {
      const res = await fetch("/api/breaking");
      const data = await res.json();
      if (data.breakingNews) setItems(data.breakingNews);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBreakingNews();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newUrdu && !newEnglish) return;
    setAdding(true);
    setNotice(null);

    try {
      const res = await fetch("/api/breaking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text_ur: newUrdu,
          text_en: newEnglish,
          priority: Number(newPriority) || 1,
          is_active: true,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewUrdu("");
        setNewEnglish("");
        setNewPriority(1);
        setNotice({ type: "success", text: lang === "ur" ? "نئی بریکنگ نیوز کامیابی سے شامل ہو گئی۔" : "Breaking news added successfully!" });
        loadBreakingNews();
      } else {
        setNotice({ type: "error", text: data.error || "Failed to add" });
      }
    } catch (err) {
      setNotice({ type: "error", text: "Network error" });
    } finally {
      setAdding(false);
    }
  };

  const handleToggle = async (item) => {
    try {
      const res = await fetch("/api/breaking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          text_ur: item.text_ur,
          text_en: item.text_en,
          is_active: !item.is_active,
          priority: item.priority,
        }),
      });
      if (res.ok) {
        setItems(items.map((i) => (i.id === item.id ? { ...i, is_active: !i.is_active } : i)));
      }
    } catch (e) {
      alert("Error updating status");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(lang === "ur" ? "کیا آپ واقعی یہ بریکنگ نیوز حذف کرنا چاہتے ہیں؟" : "Are you sure you want to delete this breaking news?")) return;
    try {
      const res = await fetch(`/api/breaking?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems(items.filter((i) => i.id !== id));
        setNotice({ type: "success", text: lang === "ur" ? "بریکنگ نیوز کامیابی سے حذف ہو گئی۔" : "Item deleted successfully!" });
      }
    } catch (e) {
      alert("Failed to delete");
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditUrdu(item.text_ur || "");
    setEditEnglish(item.text_en || "");
    setEditPriority(item.priority || 1);
  };

  const saveEdit = async (item) => {
    try {
      const res = await fetch("/api/breaking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          text_ur: editUrdu,
          text_en: editEnglish,
          is_active: item.is_active,
          priority: Number(editPriority) || 1,
        }),
      });
      if (res.ok) {
        setEditingId(null);
        loadBreakingNews();
        setNotice({ type: "success", text: lang === "ur" ? "تبدیلیاں محفوظ ہو گئیں۔" : "Changes saved successfully!" });
      }
    } catch (e) {
      alert("Failed to save changes");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto" dir={dir}>
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#dcd8cd]">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Flame className="text-red-600" />
            <span>{lang === "ur" ? "بریکنگ نیوز کنٹرول پینل" : "Breaking News Ticker Manager"}</span>
          </h1>
          <p className="text-xs text-gray-600 mt-1">
            {lang === "ur"
              ? "سرخ پٹی کے لائیو بریکنگ نیوز ٹکر کو یہاں سے تبدیل، فعال یا حذف کریں۔"
              : "Control, edit, toggle, and add live breaking news headlines for the top red marquee."}
          </p>
        </div>
        <button
          onClick={loadBreakingNews}
          className="text-xs text-gray-600 hover:text-emerald-700 flex items-center gap-1 font-semibold border border-[#dcd8cd] bg-white px-3 py-1.5 rounded-lg transition"
        >
          <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          <span>{lang === "ur" ? "ریفریش" : "Refresh"}</span>
        </button>
      </div>

      {notice && (
        <div
          className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
            notice.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
              : "bg-red-50 text-red-800 border border-red-300"
          }`}
        >
          {notice.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Live Ticker Preview */}
      <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-xl p-4 shadow-2xs">
        <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wide mb-2 flex items-center gap-1.5">
          <span>{lang === "ur" ? "لائیو ٹکر پیش منظر (Live Preview)" : "Live Ticker Preview"}</span>
        </h3>
        <div className="w-full bg-red-700 text-white rounded overflow-hidden flex items-center shadow-xs">
          <div className="bg-red-900 px-3 py-2 font-bold text-xs flex items-center gap-1 shrink-0">
            <Flame size={14} className="text-yellow-300 animate-bounce" />
            <span>{lang === "ur" ? "بریکنگ نیوز :" : "BREAKING NEWS :"}</span>
          </div>
          <div className="px-3 py-2 text-xs text-yellow-100 font-medium overflow-hidden whitespace-nowrap">
            {items.filter((i) => i.is_active).length > 0 ? (
              items
                .filter((i) => i.is_active)
                .map((i) => (lang === "en" ? i.text_en || i.text_ur : i.text_ur || i.text_en))
                .join("  ★  ")
            ) : (
              <span className="opacity-75 italic">
                {lang === "ur" ? "کوئی فعال بریکنگ نیوز موجود نہیں ہے۔" : "No active breaking news currently."}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Add New Breaking News Form */}
      <form onSubmit={handleCreate} className="bg-white border border-[#dcd8cd] rounded-xl p-5 shadow-2xs space-y-4">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Plus size={16} className="text-emerald-700" />
          <span>{lang === "ur" ? "نئی بریکنگ نیوز شامل کریں" : "Add New Breaking News"}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {lang === "ur" ? "اردو متن (Urdu Headline)" : "Urdu Headline"} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={newUrdu}
              onChange={(e) => setNewUrdu(e.target.value)}
              placeholder="مثلاً: سینیٹ نے اہم بل کی منظوری دے دی..."
              className="w-full text-xs p-2.5 rounded-lg border border-[#dcd8cd] focus:border-emerald-600 outline-none font-sans"
              dir="rtl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              {lang === "ur" ? "انگریزی متن (English Headline)" : "English Headline"} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={newEnglish}
              onChange={(e) => setNewEnglish(e.target.value)}
              placeholder="e.g. Senate passes landmark legislative bill..."
              className="w-full text-xs p-2.5 rounded-lg border border-[#dcd8cd] focus:border-emerald-600 outline-none font-sans"
              dir="ltr"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-700">
              {lang === "ur" ? "ترجیح (Priority):" : "Priority:"}
            </label>
            <input
              type="number"
              min="1"
              max="99"
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              className="w-16 text-xs p-1.5 border border-[#dcd8cd] rounded text-center font-bold"
            />
            <span className="text-[11px] text-gray-400">
              {lang === "ur" ? "(1 سب سے پہلے چلے گا)" : "(1 plays first)"}
            </span>
          </div>

          <button
            type="submit"
            disabled={adding}
            className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-5 py-2 rounded-lg transition disabled:opacity-50 cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Plus size={14} />
            <span>{adding ? (lang === "ur" ? "شامل ہو رہا ہے..." : "Adding...") : lang === "ur" ? "شامل کریں" : "Add Headline"}</span>
          </button>
        </div>
      </form>

      {/* Existing Breaking News Items Table */}
      <div className="bg-white border border-[#dcd8cd] rounded-xl overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-[#eceae3] bg-[#fbfbfa] flex items-center justify-between">
          <h3 className="font-bold text-sm text-gray-900">
            {lang === "ur" ? "موجودہ بریکنگ سرخیاں" : "Existing Breaking News Items"} ({items.length})
          </h3>
        </div>

        {items.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500">
            {lang === "ur" ? "کوئی بریکنگ نیوز درج نہیں ہے۔" : "No breaking news items found."}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map((item) => {
              const isEditing = editingId === item.id;

              return (
                <div key={item.id} className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 hover:bg-[#fbfbfa] transition">
                  {isEditing ? (
                    <div className="flex-1 space-y-2 w-full">
                      <input
                        type="text"
                        value={editUrdu}
                        onChange={(e) => setEditUrdu(e.target.value)}
                        className="w-full text-xs p-2 border border-emerald-600 rounded font-sans"
                        dir="rtl"
                      />
                      <input
                        type="text"
                        value={editEnglish}
                        onChange={(e) => setEditEnglish(e.target.value)}
                        className="w-full text-xs p-2 border border-emerald-600 rounded font-sans"
                        dir="ltr"
                      />
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-600 font-semibold">{lang === "ur" ? "ترجیح:" : "Priority:"}</label>
                        <input
                          type="number"
                          value={editPriority}
                          onChange={(e) => setEditPriority(e.target.value)}
                          className="w-14 text-xs p-1 border rounded text-center"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">
                          #{item.priority || 1}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.is_active
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {item.is_active ? (lang === "ur" ? "فعال (Active)" : "Active") : lang === "ur" ? "غیر فعال (Inactive)" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-gray-900 font-sans" dir="rtl">
                        {item.text_ur}
                      </p>
                      <p className="text-[11px] text-gray-600 font-sans" dir="ltr">
                        {item.text_en}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 shrink-0">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => saveEdit(item)}
                          className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1 transition"
                        >
                          <Save size={12} />
                          <span>{lang === "ur" ? "محفوظ" : "Save"}</span>
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs px-2.5 py-1.5 rounded transition"
                        >
                          {lang === "ur" ? "منسوخ" : "Cancel"}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleToggle(item)}
                          className={`text-xs px-2.5 py-1 rounded font-semibold transition ${
                            item.is_active
                              ? "bg-amber-100 text-amber-900 hover:bg-amber-200"
                              : "bg-emerald-100 text-emerald-900 hover:bg-emerald-200"
                          }`}
                        >
                          {item.is_active ? (lang === "ur" ? "بند کریں" : "Deactivate") : lang === "ur" ? "فعال کریں" : "Activate"}
                        </button>
                        <button
                          onClick={() => startEdit(item)}
                          className="p-1.5 text-gray-500 hover:text-emerald-700 border border-gray-200 rounded hover:border-emerald-600 transition"
                          title="ترمیم"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 text-red-500 hover:text-red-700 border border-gray-200 rounded hover:border-red-600 transition"
                          title="حذف"
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
