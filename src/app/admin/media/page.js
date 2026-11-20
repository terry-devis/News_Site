"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Image as ImageIcon,
  Upload,
  Crop,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  X,
  Check,
  RotateCcw,
  Maximize2,
  Eye,
  Info,
  Sliders,
  Copy,
} from "lucide-react";

export default function AdminMediaPage() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);

  // Inspector Modal State
  const [showInspectorModal, setShowInspectorModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [inspectorForm, setInspectorForm] = useState({
    alt_text: "",
    caption: "",
    credit: "",
  });

  // Crop & Position Modal State
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropAsset, setCropAsset] = useState(null);
  const [cropPreset, setCropPreset] = useState("Focal point");
  const [focalPoint, setFocalPoint] = useState({ x: 50, y: 50 });
  const [savingFraming, setSavingFraming] = useState(false);

  // Fetch Media Assets
  const fetchMedia = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/media");
      const data = await res.json();
      if (data.assets) {
        setAssets(data.assets);
      }
    } catch (e) {
      console.error("Failed to load media assets:", e);
      showToast("error", "Failed to fetch media assets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Upload handler
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.url) {
        const sizeKb = Math.round(file.size / 1024);
        const sizeFormatted = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

        const newAssetRes = await fetch("/api/media", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: file.name,
            url: data.url,
            size: sizeFormatted,
            size_bytes: file.size,
            alt_text: "",
            caption: "",
            credit: "",
            focal_point: { x: 50, y: 50 },
          }),
        });

        const newAssetData = await newAssetRes.json();
        if (newAssetData.success) {
          showToast("success", `Uploaded ${file.name} successfully!`);
          fetchMedia();
        }
      } else {
        showToast("error", data.error || "Upload failed");
      }
    } catch (err) {
      showToast("error", "Network error during upload");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Open Inspector Modal
  const handleOpenInspector = (asset) => {
    setSelectedAsset(asset);
    setInspectorForm({
      alt_text: asset.alt_text || "",
      caption: asset.caption || "",
      credit: asset.credit || "",
    });
    setShowInspectorModal(true);
  };

  // Save Inspector Details
  const handleSaveInspector = async (e) => {
    e.preventDefault();
    if (!selectedAsset) return;

    try {
      const res = await fetch("/api/media", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedAsset.id,
          alt_text: inspectorForm.alt_text,
          caption: inspectorForm.caption,
          credit: inspectorForm.credit,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", "Image details updated.");
        setShowInspectorModal(false);
        fetchMedia();
      }
    } catch (err) {
      showToast("error", "Failed to update image details");
    }
  };

  // Open Crop & Position Modal
  const handleOpenCrop = (asset) => {
    setCropAsset(asset);
    setCropPreset("Focal point");
    setFocalPoint(asset.focal_point || { x: 50, y: 50 });
    setShowCropModal(true);
  };

  // Viewport Click (Set Focal Point)
  const handleViewportClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setFocalPoint({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  };

  // Save Framing
  const handleSaveFraming = async () => {
    if (!cropAsset) return;
    setSavingFraming(true);
    try {
      const res = await fetch("/api/media", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: cropAsset.id,
          focal_point: focalPoint,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", "Focal framing saved.");
        setShowCropModal(false);
        fetchMedia();
      }
    } catch (err) {
      showToast("error", "Failed to save framing");
    } finally {
      setSavingFraming(false);
    }
  };

  // Delete Media Asset
  const handleDeleteAsset = async (assetId) => {
    if (!window.confirm("Are you sure you want to permanently delete this media asset?")) return;
    try {
      const res = await fetch(`/api/media?id=${assetId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast("success", "Asset deleted.");
        fetchMedia();
      }
    } catch (err) {
      showToast("error", "Failed to delete asset");
    }
  };

  // Copy Image CDN Link
  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url);
    showToast("success", "CDN URL copied to clipboard.");
  };

  const formatDate = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all ${
            toast.type === "success"
              ? "bg-[#124e2b] text-white border border-[#0a2618]"
              : "bg-red-800 text-white border border-red-900"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#e5e2da]">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Media library</h1>
          <p className="text-xs text-gray-500 mt-1">
            Images upload directly to DigitalOcean Spaces from the browser
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />

          <button
            type="button"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#124e2b] hover:bg-[#0a2618] rounded-lg shadow-sm transition-all disabled:opacity-50"
          >
            {uploading ? (
              <>
                <RefreshCw size={14} className="animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload size={14} />
                <span>Upload image</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={fetchMedia}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-900 bg-white border border-[#e5e2da] rounded-lg hover:bg-gray-50 transition-colors shadow-xs"
            title="Refresh media"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-[#124e2b]" : ""} />
          </button>
        </div>
      </div>

      {/* 5-Column Responsive Gallery Grid */}
      {loading ? (
        <div className="bg-white border border-[#e5e2da] rounded-xl p-16 text-center text-gray-400 text-xs">
          <RefreshCw size={24} className="animate-spin mx-auto text-[#124e2b] mb-2" />
          Loading cloud media assets...
        </div>
      ) : assets.length === 0 ? (
        <div className="bg-white border border-dashed border-[#e5e2da] rounded-xl p-16 text-center text-gray-400 text-xs">
          <ImageIcon size={36} className="mx-auto text-gray-300 mb-2" />
          <p className="font-semibold text-gray-600 text-sm">No media assets found.</p>
          <p className="mt-1 text-gray-400">Click &quot;Upload image&quot; above to upload your first cloud asset.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {assets.map((asset) => {
            const hasAlt = Boolean(asset.alt_text && asset.alt_text.trim());
            const hasCustomCrop = Boolean(
              asset.focal_point && (asset.focal_point.x !== 50 || asset.focal_point.y !== 50)
            );

            return (
              <div
                key={asset.id}
                className="bg-white border border-[#e5e2da] rounded-xl overflow-hidden shadow-2xs hover:shadow-xs hover:border-gray-400 transition-all flex flex-col justify-between group"
              >
                {/* Thumbnail Preview with Focal Point Positioning */}
                <div
                  className="aspect-4/3 bg-[#f7f5f0] relative overflow-hidden flex items-center justify-center cursor-pointer"
                  onClick={() => handleOpenInspector(asset)}
                >
                  <img
                    src={asset.url}
                    alt={asset.alt_text || asset.filename}
                    className="w-full h-full object-cover transition-transform group-hover:scale-102"
                    style={{
                      objectPosition: asset.focal_point
                        ? `${asset.focal_point.x}% ${asset.focal_point.y}%`
                        : "center",
                    }}
                  />

                  {/* Copy Link Quick Icon */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopyLink(asset.url);
                    }}
                    className="absolute top-2 right-2 p-1 bg-black/60 hover:bg-black text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Copy CDN link"
                  >
                    <Copy size={11} />
                  </button>
                </div>

                {/* Card Body */}
                <div className="p-3 space-y-1.5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Filename */}
                    <h4
                      className="text-xs font-semibold text-gray-900 truncate"
                      title={asset.filename}
                    >
                      {asset.filename}
                    </h4>

                    {/* Metadata Line: Size & Alt Status */}
                    <div className="flex items-center justify-between gap-1 mt-1 text-[11px]">
                      <span className="text-gray-500 font-medium">{asset.size || "100 KB"}</span>
                      {hasAlt ? (
                        <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold px-1.5 py-0.2 rounded">
                          Alt OK
                        </span>
                      ) : (
                        <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-semibold px-1.5 py-0.2 rounded">
                          No alt
                        </span>
                      )}
                    </div>

                    {/* Timestamp */}
                    <p className="text-[10px] text-gray-400 mt-1">{formatDate(asset.created_at)}</p>
                  </div>
                </div>

                {/* Bottom Action Strip (Edit, Crop/Re-crop, Delete) */}
                <div className="border-t border-[#f0ede6] bg-[#faf9f6] px-3 py-2 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleOpenInspector(asset)}
                      className="p-1 text-gray-500 hover:text-gray-900 rounded hover:bg-gray-100 transition-colors"
                      title="Edit image details"
                    >
                      <Edit2 size={12} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenCrop(asset)}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#124e2b] hover:text-[#0a2618] transition-colors"
                    >
                      <Crop size={11} />
                      <span>{hasCustomCrop ? "Re-crop" : "Crop"}</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteAsset(asset.id)}
                    className="p-1 text-gray-400 hover:text-red-700 rounded hover:bg-red-50 transition-colors"
                    title="Delete image"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: IMAGE DETAILS INSPECTOR MODAL                  */}
      {/* ======================================================== */}
      {showInspectorModal && selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#e5e2da] rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e2da] bg-[#faf9f6]">
              <div>
                <h3 className="text-base font-bold text-gray-900">Image details</h3>
                <p className="text-[11px] text-gray-500 truncate max-w-[360px]">
                  {selectedAsset.filename}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowInspectorModal(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveInspector} className="overflow-y-auto p-6 space-y-4">
              {/* Centered Image Preview */}
              <div className="w-full h-48 bg-[#f4f2ec] rounded-lg border border-[#e5e2da] overflow-hidden flex items-center justify-center">
                <img
                  src={selectedAsset.url}
                  alt={selectedAsset.filename}
                  className="max-h-full max-w-full object-contain"
                />
              </div>

              {/* Alt Text */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700 flex items-center justify-between">
                  <span>Alt text</span>
                  <span className="text-[10px] font-nastaliq text-emerald-800">متبادل متن</span>
                </label>
                <input
                  type="text"
                  value={inspectorForm.alt_text}
                  onChange={(e) => setInspectorForm({ ...inspectorForm, alt_text: e.target.value })}
                  placeholder="Describe what is in the picture — this is read aloud and indexed by Google Images"
                  className="w-full text-xs border border-[#e5e2da] rounded-lg p-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#124e2b]"
                />
                <p className="text-[10px] text-gray-400">
                  Describe what is in the picture — this is read aloud and indexed by Google Images
                </p>
              </div>

              {/* Caption */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Caption</label>
                <textarea
                  rows={2}
                  value={inspectorForm.caption}
                  onChange={(e) => setInspectorForm({ ...inspectorForm, caption: e.target.value })}
                  placeholder="Printed under the image on the story page"
                  className="w-full text-xs border border-[#e5e2da] rounded-lg p-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#124e2b] resize-none"
                />
                <p className="text-[10px] text-gray-400">Printed under the image on the story page</p>
              </div>

              {/* Credit */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Credit</label>
                <input
                  type="text"
                  value={inspectorForm.credit}
                  onChange={(e) => setInspectorForm({ ...inspectorForm, credit: e.target.value })}
                  placeholder="Photographer or agency"
                  className="w-full text-xs border border-[#e5e2da] rounded-lg p-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#124e2b]"
                />
                <p className="text-[10px] text-gray-400">Photographer or agency</p>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f0ede6]">
                <button
                  type="button"
                  onClick={() => setShowInspectorModal(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#124e2b] hover:bg-[#0a2618] rounded-lg shadow-sm transition-all"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: CROP & POSITION MODAL                          */}
      {/* ======================================================== */}
      {showCropModal && cropAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white border border-[#e5e2da] rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e2da] bg-[#faf9f6]">
              <div>
                <h3 className="text-base font-bold text-gray-900">Crop &amp; position</h3>
                <p className="text-[11px] text-gray-500">
                  The original file is kept. You can change this again at any time.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCropModal(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            {/* Aspect Ratio Presets Tablist */}
            <div className="flex items-center gap-1.5 px-6 py-2.5 bg-[#f4f2ec] border-b border-[#e5e2da] overflow-x-auto">
              {[
                "Focal point",
                "Hero 16:9",
                "Card 4:3",
                "Square",
                "Portrait 3:4",
                "Social share",
              ].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setCropPreset(preset)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                    cropPreset === preset
                      ? "bg-[#124e2b] text-white shadow-xs"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-[#e5e2da]"
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-6 space-y-4">
              {/* Interactive Viewport */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
                  <span>Click the subject. Every shape keeps it in frame.</span>
                  <span className="font-mono text-gray-700">
                    Focal: ({focalPoint.x}%, {focalPoint.y}%)
                  </span>
                </div>

                <div
                  onClick={handleViewportClick}
                  className="w-full h-64 bg-slate-900 rounded-xl overflow-hidden relative flex items-center justify-center cursor-crosshair group shadow-inner"
                >
                  <img
                    src={cropAsset.url}
                    alt={cropAsset.filename}
                    className="max-h-full max-w-full object-contain pointer-events-none select-none"
                  />

                  {/* Interactive Target Crosshair Pin Marker */}
                  <div
                    className="absolute w-7 h-7 -translate-x-1/2 -translate-y-1/2 border-2 border-white rounded-full bg-emerald-600/60 shadow-lg flex items-center justify-center text-white text-xs font-bold pointer-events-none transition-all duration-150 ring-2 ring-black/40"
                    style={{ left: `${focalPoint.x}%`, top: `${focalPoint.y}%` }}
                  >
                    +
                  </div>
                </div>
              </div>

              {/* "How it will look" Live Multi-Preview Strip */}
              <div className="space-y-2 pt-2 border-t border-[#f0ede6]">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                  How it will look
                </span>

                <div className="grid grid-cols-4 gap-3">
                  {/* Hero (16:9) */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase">Hero 16:9</span>
                    <div className="w-full aspect-video rounded-lg overflow-hidden bg-gray-100 border border-[#e5e2da]">
                      <img
                        src={cropAsset.url}
                        alt="Hero preview"
                        className="w-full h-full object-cover"
                        style={{ objectPosition: `${focalPoint.x}% ${focalPoint.y}%` }}
                      />
                    </div>
                  </div>

                  {/* Card (4:3) */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase">Card 4:3</span>
                    <div className="w-full aspect-4/3 rounded-lg overflow-hidden bg-gray-100 border border-[#e5e2da]">
                      <img
                        src={cropAsset.url}
                        alt="Card preview"
                        className="w-full h-full object-cover"
                        style={{ objectPosition: `${focalPoint.x}% ${focalPoint.y}%` }}
                      />
                    </div>
                  </div>

                  {/* Square (1:1) */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase">Square 1:1</span>
                    <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100 border border-[#e5e2da]">
                      <img
                        src={cropAsset.url}
                        alt="Square preview"
                        className="w-full h-full object-cover"
                        style={{ objectPosition: `${focalPoint.x}% ${focalPoint.y}%` }}
                      />
                    </div>
                  </div>

                  {/* Portrait (3:4) */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase">Portrait 3:4</span>
                    <div className="w-full aspect-3/4 rounded-lg overflow-hidden bg-gray-100 border border-[#e5e2da]">
                      <img
                        src={cropAsset.url}
                        alt="Portrait preview"
                        className="w-full h-full object-cover"
                        style={{ objectPosition: `${focalPoint.x}% ${focalPoint.y}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 bg-[#faf9f6] border-t border-[#e5e2da] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setFocalPoint({ x: 50, y: 50 })}
                className="text-xs font-semibold text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-1"
              >
                <RotateCcw size={12} />
                <span>Reset all</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowCropModal(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={savingFraming}
                  onClick={handleSaveFraming}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#124e2b] hover:bg-[#0a2618] rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                >
                  {savingFraming ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
                  <span>Save framing</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
