"use client";
import React, { useState, useEffect } from "react";
import { Vote, Save, RotateCcw, CheckCircle, BarChart3, AlertCircle } from "lucide-react";

export default function AdminPollPage() {
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    async function fetchPoll() {
      try {
        const res = await fetch("/api/poll");
        const data = await res.json();
        if (data.poll) setPoll(data.poll);
      } catch (e) {
        console.error("Poll fetch error:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchPoll();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotice(null);
    try {
      const res = await fetch("/api/poll", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(poll),
      });
      const data = await res.json();
      if (data.poll) {
        setPoll(data.poll);
        setNotice({ type: "success", text: "رائے شماری کا سوال اور ترتیبات کامیابی سے محفوظ ہو گئیں!" });
      }
    } catch (err) {
      setNotice({ type: "error", text: "تبدیلیاں محفوظ کرتے وقت خرابی پیش آئی۔" });
    } finally {
      setSaving(false);
    }
  };

  const handleResetVotes = () => {
    if (!confirm("کیا آپ واقعی تمام ووٹس کی گنتی صفر (0) کرنا چاہتے ہیں؟")) return;
    const resetOptions = poll.options.map((opt) => ({ ...opt, votes: 0 }));
    setPoll({
      ...poll,
      options: resetOptions,
      total_votes: 0,
    });
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-500 font-sans">
        رائے شماری ڈیٹا لوڈ ہو رہا ہے...
      </div>
    );
  }

  if (!poll) return null;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#dcd8cd] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Vote className="text-emerald-700" size={24} />
            <span>رائے شماری مینیجر (Daily Public Poll)</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            ہوم پیج پر شائع ہونے والے روزانہ کے رائے شماری سوال اور نتائج کا کنٹرول پینل۔
          </p>
        </div>

        <button
          onClick={handleResetVotes}
          type="button"
          className="inline-flex items-center gap-1.5 border border-red-300 text-red-700 hover:bg-red-50 text-xs font-semibold px-3 py-1.5 rounded transition"
        >
          <RotateCcw size={13} />
          <span>تمام ووٹس ری سیٹ کریں</span>
        </button>
      </div>

      {notice && (
        <div className={`p-3 rounded text-xs font-semibold flex items-center gap-2 ${
          notice.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-800 border border-red-200"
        }`}>
          {notice.type === "success" ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
          <span>{notice.text}</span>
        </div>
      )}

      {/* Live Votes Summary Card */}
      <div className="border border-[#dcd8cd] bg-white p-5 rounded shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <span className="font-bold text-sm text-gray-800 flex items-center gap-2">
            <BarChart3 size={16} className="text-emerald-700" />
            <span>موجودہ پول کی صورتحال (Live Statistics)</span>
          </span>
          <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-xs">
            کل ووٹس: {poll.total_votes || 0}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {poll.options.map((opt) => {
            const pct = poll.total_votes > 0 ? Math.round(((opt.votes || 0) / poll.total_votes) * 100) : 0;
            return (
              <div key={opt.id} className="border border-[#dcd8cd] p-3 rounded bg-[#f7f6f3]">
                <span className="text-xs font-bold text-gray-700 block">{opt.label_ur}</span>
                <span className="text-[11px] text-gray-400 block mb-2">{opt.label_en}</span>
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-emerald-800 text-base">{pct}%</span>
                  <span className="text-gray-500 font-sans">{opt.votes || 0} ووٹس</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave} className="border border-[#dcd8cd] bg-white p-5 rounded shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2">
          سوال اور ترتیبات تبدیل کریں
        </h2>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            سوال (اردو) *
          </label>
          <input
            type="text"
            value={poll.question_ur || ""}
            onChange={(e) => setPoll({ ...poll, question_ur: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-600 urdu-headline"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Question (English) *
          </label>
          <input
            type="text"
            value={poll.question_en || ""}
            onChange={(e) => setPoll({ ...poll, question_en: e.target.value })}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-emerald-600 font-sans"
            required
          />
        </div>

        {/* Options Labels */}
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold text-gray-700">آپشنز کے نام</h3>
          {poll.options.map((opt, idx) => (
            <div key={opt.id} className="grid grid-cols-1 sm:grid-cols-2 gap-3 border p-2.5 rounded bg-gray-50/50">
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-0.5">
                  آپشن {idx + 1} (اردو)
                </label>
                <input
                  type="text"
                  value={opt.label_ur || ""}
                  onChange={(e) => {
                    const next = [...poll.options];
                    next[idx].label_ur = e.target.value;
                    setPoll({ ...poll, options: next });
                  }}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-0.5">
                  Option {idx + 1} (English)
                </label>
                <input
                  type="text"
                  value={opt.label_en || ""}
                  onChange={(e) => {
                    const next = [...poll.options];
                    next[idx].label_en = e.target.value;
                    setPoll({ ...poll, options: next });
                  }}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-emerald-600 font-sans"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Active Toggle */}
        <div className="pt-2 flex items-center gap-2">
          <input
            type="checkbox"
            id="poll_active"
            checked={Boolean(poll.is_active)}
            onChange={(e) => setPoll({ ...poll, is_active: e.target.checked })}
            className="size-4 text-emerald-700 rounded focus:ring-emerald-600"
          />
          <label htmlFor="poll_active" className="text-xs font-semibold text-gray-700 select-none">
            ہوم پیج پر یہ رائے شماری فعال (Active) رکھیں
          </label>
        </div>

        <div className="pt-3 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-emerald-800 hover:bg-emerald-900 disabled:bg-gray-400 text-white text-xs font-bold px-5 py-2.5 rounded transition flex items-center gap-2 shadow-xs"
          >
            <Save size={14} />
            <span>{saving ? "محفوظ ہو رہا ہے..." : "تبدیلیاں محفوظ کریں"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
