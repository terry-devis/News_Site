"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Image as ImageIcon,
  Upload,
  Crop,
  Pencil,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Copy,
  RefreshCw,
  X,
  Loader2,
  Search,
  HardDrive,
} from "lucide-react";
import ImageFramingModal from "@/component/admin/article-editor/ImageFramingModal";
import { hasPermission } from "@/lib/permissions";
import { optimizeImageToWebP } from "@/lib/imageOptimizer";

function formatBytes(bytes, fallbackStr) {
  if (typeof bytes === "number" && bytes > 0) {
    return bytes > 1048576
      ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
      : `${Math.round(bytes / 1024)} KB`;
  }
  return fallbackStr || "—";
}

function formatDateTime(dt) {
  if (!dt) return "";
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Karachi",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(dt));
}

export default function AdminMediaPage() {
  const [assets, setAssets] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [storageStatus, setStorageStatus] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  // Image details modal
  const [editingAsset, setEditingAsset] = useState(null);
  const [altText, setAltText] = useState("");
  const [caption, setCaption] = useState("");
  const [credit, setCredit] = useState("");
  const [savingDetails, setSavingDetails] = useState(false);

  // Framing / Crop modal (reuses ImageFramingModal from Module 4)
  const [framingAsset, setFramingAsset] = useState(null);

  // Delete confirmation dialog
  const [deletingAsset, setDeletingAsset] = useState(null);
  const [deleting, setDeleting] = useState(false);

  function showToast(type, message) {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3500);
  }

  async function fetchMedia() {
    setLoading(true);
    try {
      const [mediaRes, statusRes, meRes] = await Promise.all([
        fetch("/api/media").then((r) => r.json()),
        fetch("/api/media/storage-status").then((r) => (r.ok ? r.json() : null)).catch(() => null),
        fetch("/api/auth/me").then((r) => (r.ok ? r.json() : null)).catch(() => null),
      ]);

      if (mediaRes?.assets) setAssets(mediaRes.assets);
      if (statusRes) setStorageStatus(statusRes);
      if (meRes?.user) setCurrentUser(meRes.user);
    } catch {
      showToast("error", "Failed to load media library");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMedia();
  }, []);

  const canUpload = !currentUser || hasPermission(currentUser, "media.upload");
  const canFrame = !currentUser || hasPermission(currentUser, "media.framing");
  const canDelete = !currentUser || hasPermission(currentUser, "media.delete");

  const filteredAssets = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return assets;
    return assets.filter(
      (a) =>
        String(a.filename || "").toLowerCase().includes(q) ||
        String(a.alt_text || "").toLowerCase().includes(q) ||
        String(a.credit || "").toLowerCase().includes(q)
    );
  }, [assets, searchQuery]);

  async function handleFileUpload(e) {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;

    setUploading(true);
    try {
      const file = await optimizeImageToWebP(rawFile);
      const fd = new FormData();
      fd.append("file", file);

      const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
      const uploadData = await uploadRes.json();
      if (!uploadRes.ok || !uploadData.url) {
        throw new Error(uploadData.error || "Upload failed");
      }

      const sizeKb = Math.round(file.size / 1024);
      const sizeFormatted = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

      const createRes = await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          url: uploadData.url,
          size: sizeFormatted,
          size_bytes: file.size,
          type: "image",
        }),
      });
      const createData = await createRes.json();
      if (createData?.asset) {
        setAssets((prev) => [createData.asset, ...prev]);
      } else {
        await fetchMedia();
      }
      showToast("success", "Image uploaded to Cloudflare R2");
    } catch (err) {
      showToast("error", err.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function openInspector(asset) {
    setAltText(asset.alt_text || "");
    setCaption(asset.caption || "");
    setCredit(asset.credit || "");
    setEditingAsset(asset);
  }

  async function handleSaveDetails() {
    if (!editingAsset) return;
    setSavingDetails(true);
    try {
      const res = await fetch("/api/media", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingAsset.id,
          alt_text: altText.trim(),
          caption: caption.trim(),
          credit: credit.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not save");

      setAssets((prev) =>
        prev.map((a) =>
          a.id === editingAsset.id
            ? { ...a, alt_text: altText.trim(), caption: caption.trim(), credit: credit.trim() }
            : a
        )
      );
      setEditingAsset(null);
      showToast("success", "Image details saved");
    } catch (err) {
      showToast("error", err.message || "Could not save");
    } finally {
      setSavingDetails(false);
    }
  }

  async function handleSaveFraming(framing) {
    if (!framingAsset) return;
    try {
      const res = await fetch(`/api/media/${framingAsset.id}/framing`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ framing }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save framing");

      setAssets((prev) =>
        prev.map((a) =>
          a.id === framingAsset.id ? { ...a, framing, focal_point: framing.focal } : a
        )
      );
      showToast("success", "Framing saved. Live pages update in a few seconds.");
    } catch (err) {
      showToast("error", err.message || "Could not save framing");
    }
  }

  async function handleConfirmDelete() {
    if (!deletingAsset) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/media?id=${deletingAsset.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not delete");

      setAssets((prev) => prev.filter((a) => a.id !== deletingAsset.id));
      setDeletingAsset(null);
      showToast("success", "Image deleted");
    } catch (err) {
      showToast("error", err.message || "Could not delete");
    } finally {
      setDeleting(false);
    }
  }

  function copyUrl(url) {
    navigator.clipboard.writeText(url);
    showToast("success", "Image URL copied");
  }

  return (
    <div className="space-y-5">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 text-xs font-semibold shadow-lg border flex items-center gap-2 ${
            toast.type === "error"
              ? "bg-red-50 text-red-800 border-red-200"
              : "bg-[#0a2618] text-white border-[#1f5637]"
          }`}
        >
          {toast.type === "error" ? (
            <AlertCircle size={14} />
          ) : (
            <CheckCircle2 size={14} className="text-emerald-300" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#e5e2da] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[#18221b] flex items-center gap-2">
            <ImageIcon className="text-[#184e2d]" size={24} />
            <span>Media library</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#5c635b] mt-0.5">
            Images upload to Cloudflare R2 and serve globally via CDN.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {storageStatus && (
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-semibold rounded border ${
                storageStatus.configured
                  ? "bg-emerald-50 text-[#184e2d] border-emerald-200"
                  : "bg-amber-50 text-amber-800 border-amber-200"
              }`}
            >
              <HardDrive size={12} />
              <span>
                {storageStatus.configured
                  ? `R2 Connected (${storageStatus.bucketName})`
                  : "Local Fallback Mode"}
              </span>
            </span>
          )}

          <button
            type="button"
            onClick={fetchMedia}
            title="Refresh library"
            className="p-2 border border-[#e5e2da] bg-white text-[#5c635b] hover:text-[#184e2d] rounded-md cursor-pointer"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>

          {canUpload && (
            <label className="inline-flex items-center gap-1.5 bg-[#184e2d] hover:bg-[#0a2618] text-white text-xs font-semibold px-4 py-2 rounded-md cursor-pointer transition">
              {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              <span>{uploading ? "Uploading..." : "Upload image"}</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          )}
        </div>
      </div>

      {/* Storage warning if R2 not configured */}
      {storageStatus && storageStatus.configured === false && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
          Cloudflare R2 credentials (<span className="font-mono font-semibold">R2_*</span>) are not configured.
          New uploads are temporarily saved to <span className="font-mono">public/uploads</span>.
        </div>
      )}

      {/* Search & Count Bar */}
      <div className="bg-white border border-[#e5e2da] rounded-lg overflow-hidden shadow-2xs">
        <div className="px-4 py-3 border-b border-[#e5e2da] bg-[#faf9f6] flex flex-wrap items-center justify-between gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search filename, alt text, credit..."
              className="pl-8 pr-3 py-1.5 text-xs border border-[#e5e2da] rounded bg-white text-[#18221b] focus:outline-none focus:border-[#184e2d] w-64"
            />
          </div>
          <span className="text-xs text-[#5c635b] font-medium">
            {filteredAssets.length} {filteredAssets.length === 1 ? "asset" : "assets"}
          </span>
        </div>

        {/* 5-Column Grid Matching scraped-site */}
        {loading ? (
          <div className="flex h-56 items-center justify-center text-xs text-[#5c635b]">
            <Loader2 size={20} className="animate-spin mr-2" />
            Loading media library...
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-semibold text-[#18221b]">Library is empty</p>
            <p className="text-xs text-[#5c635b] mt-1">
              Upload an image above to store it in Cloudflare R2.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-3 lg:grid-cols-5">
            {filteredAssets.map((asset) => {
              const focal = asset.framing?.focal || asset.focal_point || { x: 50, y: 50 };
              return (
                <figure
                  key={asset.id}
                  className="overflow-hidden rounded-lg border border-[#e5e2da] bg-white flex flex-col justify-between"
                >
                  <div>
                    <div className="relative flex aspect-4/3 items-center justify-center bg-[#f4f2ec] overflow-hidden group">
                      {asset.url ? (
                        <img
                          src={asset.url}
                          alt={asset.alt_text || ""}
                          style={{ objectPosition: `${focal.x}% ${focal.y}%` }}
                          className="size-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <span className="text-xs text-[#5c635b]">No preview</span>
                      )}
                      {asset.url && (
                        <button
                          type="button"
                          onClick={() => copyUrl(asset.url)}
                          title="Copy URL"
                          className="opacity-0 group-hover:opacity-100 absolute top-1.5 right-1.5 bg-black/70 text-white p-1.5 rounded transition cursor-pointer"
                        >
                          <Copy size={12} />
                        </button>
                      )}
                    </div>

                    <figcaption className="space-y-1 p-2.5">
                      <p className="font-mono truncate text-[11px] text-[#18221b]" title={asset.filename}>
                        {asset.filename || "image"}
                      </p>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] text-[#5c635b] tabular-nums">
                          {formatBytes(asset.size_bytes, asset.size)}
                        </span>
                        {!asset.alt_text && (
                          <span className="rounded bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                            No alt
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400">
                        {formatDateTime(asset.created_at)}
                      </p>
                    </figcaption>
                  </div>

                  {(canFrame || canDelete) && (
                    <div className="flex items-center justify-between gap-1 border-t border-[#e5e2da] px-2 py-1.5 bg-[#fbfaf8]">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openInspector(asset)}
                          title="Edit details"
                          className="p-1.5 text-[#5c635b] hover:text-[#184e2d] hover:bg-white rounded transition cursor-pointer"
                        >
                          <Pencil size={13} />
                        </button>
                        {canFrame && asset.url && (
                          <button
                            type="button"
                            onClick={() => setFramingAsset(asset)}
                            className="px-2 py-1 text-[11px] font-semibold text-[#184e2d] hover:bg-white rounded flex items-center gap-1 transition cursor-pointer"
                          >
                            <Crop size={12} />
                            <span>{asset.framing ? "Re-crop" : "Crop"}</span>
                          </button>
                        )}
                      </div>

                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => setDeletingAsset(asset)}
                          title="Delete image"
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                        >
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  )}
                </figure>
              );
            })}
          </div>
        )}
      </div>

      {/* Image Details Modal */}
      {editingAsset && (
        <div className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-4">
          <div className="bg-white border border-[#e5e2da] w-full max-w-lg shadow-2xl">
            <header className="px-5 py-3.5 border-b border-[#e5e2da] bg-[#fbfaf8] flex items-center justify-between">
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-[#18221b]">Image details</h3>
                <p className="text-[11px] font-mono text-[#5c635b] truncate">{editingAsset.filename}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingAsset(null)}
                className="text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </header>

            <div className="p-5 space-y-4">
              {editingAsset.url && (
                <img
                  src={editingAsset.url}
                  alt={altText}
                  className="max-h-52 w-full border border-[#e5e2da] bg-[#f4f2ec] object-contain"
                />
              )}

              <div>
                <label className="block text-xs font-semibold text-[#18221b] mb-1">Alt text</label>
                <input
                  type="text"
                  dir="auto"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Describe what is in the picture (indexed by Google Images)"
                  className="w-full px-3 py-2 text-xs border border-[#e5e2da] focus:outline-none focus:border-[#184e2d]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#18221b] mb-1">Caption</label>
                <textarea
                  rows={2}
                  dir="auto"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Printed under the image on the story page"
                  className="w-full px-3 py-2 text-xs border border-[#e5e2da] focus:outline-none focus:border-[#184e2d]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#18221b] mb-1">Credit</label>
                <input
                  type="text"
                  value={credit}
                  onChange={(e) => setCredit(e.target.value)}
                  placeholder="Photographer or news agency"
                  className="w-full px-3 py-2 text-xs border border-[#e5e2da] focus:outline-none focus:border-[#184e2d]"
                />
              </div>
            </div>

            <footer className="px-5 py-3 border-t border-[#e5e2da] bg-[#fbfaf8] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingAsset(null)}
                className="px-3.5 py-2 text-xs font-semibold border border-[#e5e2da] bg-white text-[#5c635b] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={savingDetails}
                onClick={handleSaveDetails}
                className="px-4 py-2 text-xs font-semibold bg-[#184e2d] hover:bg-[#0a2618] text-white disabled:opacity-60 cursor-pointer"
              >
                {savingDetails ? "Saving..." : "Save"}
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* Shared 5-Ratio Image Framing & Cropping Modal */}
      <ImageFramingModal
        open={Boolean(framingAsset)}
        imageUrl={framingAsset?.url}
        initialFraming={framingAsset?.framing}
        onClose={() => setFramingAsset(null)}
        onSave={handleSaveFraming}
      />

      {/* Delete Confirmation Dialog */}
      {deletingAsset && (
        <div className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-4">
          <div className="bg-white border border-[#e5e2da] w-full max-w-md shadow-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-[#18221b]">Delete this image?</h3>
            <p className="text-xs text-[#5c635b] leading-relaxed">
              <span className="font-mono font-semibold text-[#18221b]">
                {deletingAsset.filename}
              </span>{" "}
              will be removed from the media library.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeletingAsset(null)}
                className="px-3.5 py-2 text-xs font-semibold border border-[#e5e2da] bg-white text-[#5c635b] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white disabled:opacity-60 cursor-pointer"
              >
                {deleting ? "Deleting..." : "Delete image"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
