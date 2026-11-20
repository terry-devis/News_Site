"use client";

import React, { useState, useEffect } from "react";
import { X, UploadCloud, Loader2, Image as ImageIcon, Check } from "lucide-react";
import { optimizeImageToWebP } from "@/lib/imageOptimizer";

export default function MediaPickerModal({ open, onClose, onSelect }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!open) return;
    let active = true;
    setLoading(true);
    fetch("/api/media")
      .then((r) => (r.ok ? r.json() : { files: [] }))
      .then((data) => {
        if (active) {
          setItems(data.assets || data.files || data.media || data.items || []);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [open]);

  if (!open) return null;

  async function handleUpload(e) {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;
    setUploading(true);
    try {
      const file = await optimizeImageToWebP(rawFile);
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        const sizeKb = Math.round(file.size / 1024);
        const sizeFormatted = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;
        fetch("/api/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            url: data.url,
            size: sizeFormatted,
            size_bytes: file.size,
            type: "image",
          }),
        }).catch(() => {});
        onSelect(data.url, file.name.replace(/\.[^.]+$/, ""));
        onClose();
      }
    } finally {
      setUploading(false);
    }
  }

  const filtered = items.filter((it) => {
    const url = it.url || it;
    return String(url).toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
      <div className="bg-white border border-[#e5e2da] w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl">
        <header className="px-5 py-3.5 border-b border-[#e5e2da] bg-[#fbfaf8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon size={17} className="text-[#184e2d]" />
            <h3 className="text-sm font-bold text-[#18221b]">Media library (Cloudflare R2)</h3>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700 cursor-pointer">
            <X size={18} />
          </button>
        </header>

        <div className="p-4 border-b border-[#e5e2da] flex flex-wrap items-center justify-between gap-3 bg-white">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter media by filename..."
            className="px-3 py-1.5 text-xs border border-[#e5e2da] focus:outline-none focus:border-[#184e2d] w-64"
          />
          <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#184e2d] hover:bg-[#0a2618] text-white text-xs font-semibold cursor-pointer transition">
            {uploading ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={14} />}
            <span>{uploading ? "Uploading to R2..." : "Upload new image"}</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="py-16 flex justify-center text-xs text-[#5c635b]">
              <Loader2 size={18} className="animate-spin mr-2" />
              Loading media...
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#5c635b]">
              No images found. Upload a new image above.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {filtered.map((item, idx) => {
                const url = item.url || item;
                const name = item.key || item.name || String(url).split("/").pop();
                return (
                  <button
                    key={url + idx}
                    type="button"
                    onClick={() => {
                      onSelect(url, name);
                      onClose();
                    }}
                    className="group border border-[#e5e2da] hover:border-[#184e2d] bg-[#fbfaf8] overflow-hidden text-left transition cursor-pointer"
                  >
                    <div className="aspect-video bg-gray-100 relative overflow-hidden">
                      <img src={url} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                      <span className="opacity-0 group-hover:opacity-100 absolute top-1.5 right-1.5 bg-[#184e2d] text-white p-1 rounded-full transition">
                        <Check size={12} />
                      </span>
                    </div>
                    <p className="p-2 text-[11px] text-[#5c635b] truncate font-mono">{name}</p>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
