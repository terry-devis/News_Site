"use client";
import React, { useState, useEffect } from "react";
import {
  Tv,
  Plus,
  Save,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Radio,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
} from "lucide-react";
import Link from "next/link";
import { DEFAULT_LIVE_STREAMS } from "@/lib/liveStreams";

const EMPTY_FORM = {
  id: "",
  name_ur: "",
  name_en: "",
  desc_ur: "",
  desc_en: "",
  provider: "youtube",
  streamUrl: "",
  embedUrl: "",
  isLive: true,
};

export default function AdminLiveTvPage() {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);
  const [editingIndex, setEditingIndex] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    let active = true;
    fetch("/api/settings?key=live_streams")
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        const list = Array.isArray(data?.live_streams) && data.live_streams.length > 0
          ? data.live_streams
          : DEFAULT_LIVE_STREAMS;
        setChannels(list);
      })
      .catch(() => {
        if (active) setChannels(DEFAULT_LIVE_STREAMS);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const persistChannels = async (nextList, msg = "Live TV channels saved!") => {
    setSaving(true);
    setNotice(null);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "live_streams", value: nextList }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNotice({ type: "error", text: data.error || "Failed to save channels" });
        return false;
      }
      setChannels(nextList);
      setNotice({ type: "success", text: msg });
      return true;
    } catch {
      setNotice({ type: "error", text: "Network error saving channels" });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!form.name_ur.trim() && !form.name_en.trim()) {
      setNotice({ type: "error", text: "Please enter channel name (Urdu or English)." });
      return;
    }

    const entry = {
      id: form.id || `ch-${Date.now().toString(36)}`,
      name_ur: form.name_ur.trim() || form.name_en.trim(),
      name_en: form.name_en.trim() || form.name_ur.trim(),
      desc_ur: form.desc_ur.trim(),
      desc_en: form.desc_en.trim(),
      provider: form.provider,
      streamUrl: form.provider === "hls" ? form.streamUrl.trim() : "",
      embedUrl: form.provider === "youtube" ? form.embedUrl.trim() : "",
      isLive: Boolean(form.isLive),
    };

    const next = [...channels];
    if (editingIndex !== null && next[editingIndex]) {
      next[editingIndex] = entry;
    } else {
      next.push(entry);
    }

    const ok = await persistChannels(
      next,
      editingIndex !== null ? "Channel updated!" : "New channel added!"
    );
    if (ok) {
      setForm(EMPTY_FORM);
      setEditingIndex(null);
    }
  };

  const handleToggleOnAir = async (idx) => {
    const next = channels.map((c, i) => (i === idx ? { ...c, isLive: !c.isLive } : c));
    await persistChannels(next, "Stream status updated!");
  };

  const handleMove = async (idx, dir) => {
    const target = idx + dir;
    if (target < 0 || target >= channels.length) return;
    const next = [...channels];
    [next[idx], next[target]] = [next[target], next[idx]];
    await persistChannels(next, "Channel order updated!");
  };

  const handleDelete = async (idx) => {
    if (!window.confirm("Remove this Live TV channel?")) return;
    const next = channels.filter((_, i) => i !== idx);
    await persistChannels(next, "Channel removed!");
  };

  const startEdit = (ch, idx) => {
    setEditingIndex(idx);
    setForm({
      id: ch.id || "",
      name_ur: ch.name_ur || "",
      name_en: ch.name_en || "",
      desc_ur: ch.desc_ur || "",
      desc_en: ch.desc_en || "",
      provider: ch.provider || (ch.streamUrl ? "hls" : "youtube"),
      streamUrl: ch.streamUrl || "",
      embedUrl: ch.embedUrl || "",
      isLive: Boolean(ch.isLive),
    });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#e5e2da] pb-4">
        <div className="border-l-4 border-[#184e2d] pl-3">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Tv size={20} className="text-[#184e2d]" />
            <span>Live TV Channels & Streams</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage HLS (.m3u8) or YouTube Live streams, toggle On Air / Off Air status, and reorder channels.
          </p>
        </div>

        <Link
          href="/live"
          target="_blank"
          className="inline-flex items-center gap-1.5 text-xs font-semibold border border-[#e5e2da] bg-white hover:border-[#184e2d] hover:text-[#184e2d] px-3 py-2 rounded-md transition"
        >
          <ExternalLink size={13} />
          <span>View Public /live</span>
        </Link>
      </div>

      {notice && (
        <div
          className={`p-3 rounded-lg border text-xs font-semibold flex items-center gap-2 ${
            notice.type === "error"
              ? "bg-red-50 border-red-200 text-red-800"
              : "bg-emerald-50 border-emerald-200 text-emerald-900"
          }`}
        >
          {notice.type === "error" ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
          <span>{notice.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Channel List (7 Cols) */}
        <section className="lg:col-span-7 rounded-lg border border-[#e5e2da] bg-white shadow-2xs overflow-hidden">
          <header className="flex items-center justify-between border-b border-[#e5e2da] px-4 py-3 bg-[#faf9f6]">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Configured Channels ({channels.length})
            </h2>
          </header>

          {loading ? (
            <div className="p-8 text-center text-xs text-gray-400">Loading streams...</div>
          ) : channels.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">No channels configured yet.</div>
          ) : (
            <ul className="divide-y divide-[#e5e2da]">
              {channels.map((ch, idx) => (
                <li key={ch.id || idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#faf9f6]">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">{ch.name_en}</span>
                      {ch.name_ur && (
                        <span className="text-xs text-gray-600 font-nastaliq">({ch.name_ur})</span>
                      )}
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 border border-gray-200">
                        {ch.provider || (ch.streamUrl ? "hls" : "youtube")}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-gray-500 truncate">
                      {ch.streamUrl || ch.embedUrl || "No stream URL set"}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => handleToggleOnAir(idx)}
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold flex items-center gap-1 cursor-pointer transition ${
                        ch.isLive
                          ? "bg-red-600 text-white hover:bg-red-700"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      }`}
                    >
                      <Radio size={11} />
                      <span>{ch.isLive ? "On air" : "Off air"}</span>
                    </button>

                    <button
                      type="button"
                      disabled={idx === 0 || saving}
                      onClick={() => handleMove(idx, -1)}
                      className="p-1.5 text-gray-400 hover:text-gray-800 disabled:opacity-30 cursor-pointer"
                      title="Move up"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={idx === channels.length - 1 || saving}
                      onClick={() => handleMove(idx, 1)}
                      className="p-1.5 text-gray-400 hover:text-gray-800 disabled:opacity-30 cursor-pointer"
                      title="Move down"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(ch, idx)}
                      className="p-1.5 text-gray-500 hover:text-[#184e2d] cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => handleDelete(idx)}
                      className="p-1.5 text-gray-400 hover:text-red-600 cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Right: Add / Edit Channel Form (5 Cols) */}
        <section className="lg:col-span-5 rounded-lg border border-[#e5e2da] bg-white shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#e5e2da] pb-2.5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
              <Plus size={14} className="text-[#184e2d]" />
              <span>{editingIndex !== null ? "Edit Channel" : "Add New Channel"}</span>
            </h2>
            {editingIndex !== null && (
              <button
                type="button"
                onClick={() => {
                  setEditingIndex(null);
                  setForm(EMPTY_FORM);
                }}
                className="text-xs text-gray-500 hover:text-gray-800 flex items-center gap-1 cursor-pointer"
              >
                <X size={13} /> Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSubmitForm} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Channel Name (English)</label>
                <input
                  type="text"
                  value={form.name_en}
                  onChange={(e) => setForm({ ...form, name_en: e.target.value })}
                  placeholder="Daily Afadiat Live"
                  className="w-full p-2.5 rounded-md border border-[#e5e2da] bg-[#faf9f6] focus:outline-none focus:border-[#184e2d]"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Channel Name (Urdu)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={form.name_ur}
                  onChange={(e) => setForm({ ...form, name_ur: e.target.value })}
                  placeholder="ڈیلی افادیت لائیو"
                  className="w-full p-2.5 rounded-md border border-[#e5e2da] bg-[#faf9f6] text-right font-nastaliq focus:outline-none focus:border-[#184e2d]"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Stream Provider</label>
              <select
                value={form.provider}
                onChange={(e) => setForm({ ...form, provider: e.target.value })}
                className="w-full p-2.5 rounded-md border border-[#e5e2da] bg-[#faf9f6] focus:outline-none focus:border-[#184e2d] cursor-pointer"
              >
                <option value="youtube">YouTube Live (URL or Channel ID)</option>
                <option value="hls">HLS Stream (.m3u8 URL)</option>
              </select>
            </div>

            {form.provider === "hls" ? (
              <div>
                <label className="block font-semibold text-gray-700 mb-1">HLS Playlist URL (.m3u8)</label>
                <input
                  type="url"
                  dir="ltr"
                  value={form.streamUrl}
                  onChange={(e) => setForm({ ...form, streamUrl: e.target.value })}
                  placeholder="https://example.com/live/playlist.m3u8"
                  className="w-full p-2.5 rounded-md border border-[#e5e2da] bg-[#faf9f6] font-mono text-left focus:outline-none focus:border-[#184e2d]"
                />
              </div>
            ) : (
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  YouTube Live URL / Embed URL / Channel ID
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={form.embedUrl}
                  onChange={(e) => setForm({ ...form, embedUrl: e.target.value })}
                  placeholder="https://youtube.com/watch?v=... or UC..."
                  className="w-full p-2.5 rounded-md border border-[#e5e2da] bg-[#faf9f6] font-mono text-left focus:outline-none focus:border-[#184e2d]"
                />
              </div>
            )}

            <label className="flex items-center gap-2 pt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={form.isLive}
                onChange={(e) => setForm({ ...form, isLive: e.target.checked })}
                className="accent-[#184e2d] size-4"
              />
              <span className="font-semibold text-gray-800">Mark as On air (Live now)</span>
            </label>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-[#184e2d] hover:bg-[#113820] text-white font-bold py-2.5 rounded-md flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
            >
              <Save size={14} />
              <span>{saving ? "Saving..." : editingIndex !== null ? "Update Channel" : "Add Channel"}</span>
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
