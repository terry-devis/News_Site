"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Newspaper,
  Calendar,
  FileText,
  Upload,
  Download,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  Check,
  RefreshCw,
  Eye,
  Maximize2,
  ZoomIn,
  Sliders,
  Crop,
} from "lucide-react";

export default function AdminEpaperPage() {
  const today = new Date().toISOString().split("T")[0];
  const [editions, setEditions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("both"); // 'both', 'ur', 'en'
  const [toast, setToast] = useState(null);

  // Upload Form State
  const [uploadPaper, setUploadPaper] = useState("ur");
  const [uploadDate, setUploadDate] = useState(today);
  const [uploadTitle, setUploadTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  // Clickable Regions (Hot-Zones) Workspace State
  const [activeEdition, setActiveEdition] = useState(null);
  const [activePageNum, setActivePageNum] = useState(null);
  const [regions, setRegions] = useState([]);
  const [selectedRegionIndex, setSelectedRegionIndex] = useState(null);
  const [isUnsaved, setIsUnsaved] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [savingRegions, setSavingRegions] = useState(false);
  const [deletingEditionId, setDeletingEditionId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Canvas drawing ref and state
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [currentBox, setCurrentBox] = useState(null);

  // Fetch editions
  const fetchEditions = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/epaper");
      const data = await res.json();
      if (data.editions) {
        setEditions(data.editions);
      }
    } catch (e) {
      console.error("Failed to load epaper editions:", e);
      showToast("error", "Failed to fetch epaper editions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEditions();
  }, []);

  // Warn before leaving with unsaved clipping changes
  useEffect(() => {
    if (!isUnsaved) return;
    const handleBeforeUnload = (e) => e.preventDefault();
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isUnsaved]);

  // Keyboard nudge / resize / delete for selected clipping region (matching scraped-site)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (selectedRegionIndex === null || !activeEdition) return;
      const tag = e.target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      const cur = regions[selectedRegionIndex];
      if (!cur || !cur.coordinates) return;

      const step = e.shiftKey ? 1.5 : 0.2;
      const c = { ...cur.coordinates };

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (e.altKey) c.width = Math.max(1, c.width - step);
        else c.x = Math.max(0, c.x - step);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (e.altKey) c.width = Math.min(100 - c.x, c.width + step);
        else c.x = Math.min(100 - c.width, c.x + step);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (e.altKey) c.height = Math.max(1, c.height - step);
        else c.y = Math.max(0, c.y - step);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (e.altKey) c.height = Math.min(100 - c.y, c.height + step);
        else c.y = Math.min(100 - c.height, c.y + step);
      } else if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        setRegions((prev) => prev.filter((_, i) => i !== selectedRegionIndex));
        setSelectedRegionIndex(null);
        setIsUnsaved(true);
        return;
      } else if (e.key === "Escape") {
        setSelectedRegionIndex(null);
        return;
      } else {
        return;
      }

      c.x = Math.round(c.x * 100) / 100;
      c.y = Math.round(c.y * 100) / 100;
      c.width = Math.round(c.width * 100) / 100;
      c.height = Math.round(c.height * 100) / 100;

      setRegions((prev) =>
        prev.map((r, i) => (i === selectedRegionIndex ? { ...r, coordinates: c } : r))
      );
      setIsUnsaved(true);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedRegionIndex, activeEdition, regions]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Upload Edition
  const handleUploadEdition = async (e) => {
    e.preventDefault();
    setUploading(true);

    try {
      let uploadedPdfUrl = "";
      if (selectedFile) {
        const fd = new FormData();
        fd.append("file", selectedFile);
        const upRes = await fetch("/api/upload", { method: "POST", body: fd });
        const upData = await upRes.json();
        if (!upRes.ok || !upData.url) {
          throw new Error(upData.error || "Failed to upload file to R2");
        }
        uploadedPdfUrl = upData.url;
      }

      const payload = {
        action: "upload_edition",
        edition_date: uploadDate,
        paper: uploadPaper,
        title: uploadTitle.trim() || (uploadPaper === "ur" ? "اسلام آباد" : "Islamabad"),
        city: uploadTitle.trim() || "Islamabad",
        file_size: selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : "—",
        pdf_url: uploadedPdfUrl || null,
      };

      const res = await fetch("/api/epaper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        showToast("success", `New ${uploadPaper === "ur" ? "Urdu" : "English"} edition published! 8 pages generated.`);
        setSelectedFile(null);
        setUploadTitle("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        fetchEditions();
      } else {
        showToast("error", data.error || "Failed to upload edition");
      }
    } catch (err) {
      showToast("error", "Error uploading edition");
    } finally {
      setUploading(false);
    }
  };

  // Toggle Live / Unpublish
  const handleToggleLive = async (edition) => {
    const newLive = !edition.is_live;
    try {
      const res = await fetch("/api/epaper", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: edition.id, is_live: newLive }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", `Edition is now ${newLive ? "Live" : "Unpublished"}`);
        fetchEditions();
      }
    } catch (err) {
      showToast("error", "Failed to update edition status");
    }
  };

  // Delete Edition (opens styled modal)
  const handleDeleteEdition = (editionId) => {
    setDeletingEditionId(editionId);
  };

  const confirmDeleteEdition = async () => {
    if (!deletingEditionId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/epaper?id=${deletingEditionId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("success", "Edition deleted.");
        if (activeEdition && activeEdition.id === deletingEditionId) {
          handleCloseClippingWorkspace();
        }
        setDeletingEditionId(null);
        fetchEditions();
      } else {
        showToast("error", data.error || "Failed to delete edition");
      }
    } catch {
      showToast("error", "Failed to delete edition");
    } finally {
      setDeleting(false);
    }
  };

  // Open Clipping Workspace for a specific page
  const handleOpenPageClipping = (edition, pageNum) => {
    setActiveEdition(edition);
    setActivePageNum(pageNum);
    const targetPage = (edition.pages || []).find((p) => p.page_number === pageNum);
    const existingRegions = targetPage?.regions || [];
    setRegions(JSON.parse(JSON.stringify(existingRegions)));
    setSelectedRegionIndex(existingRegions.length > 0 ? 0 : null);
    setIsUnsaved(false);
    setZoomLevel(1);
  };

  const handleCloseClippingWorkspace = () => {
    setActiveEdition(null);
    setActivePageNum(null);
    setRegions([]);
    setSelectedRegionIndex(null);
    setIsUnsaved(false);
  };

  // Canvas Mouse Events for Dragging to Draw Regions
  const handleMouseDown = (e) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setIsDrawing(true);
    setStartPos({ x, y });
    setCurrentBox({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const curX = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const curY = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));

    const left = Math.min(startPos.x, curX);
    const top = Math.min(startPos.y, curY);
    const width = Math.abs(curX - startPos.x);
    const height = Math.abs(curY - startPos.y);

    setCurrentBox({ x: left, y: top, width, height });
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (currentBox && currentBox.width > 2 && currentBox.height > 2) {
      const newRegion = {
        id: `reg_${Date.now()}`,
        headline: "",
        body: "",
        article_id: "",
        coordinates: {
          x: Math.round(currentBox.x * 10) / 10,
          y: Math.round(currentBox.y * 10) / 10,
          width: Math.round(currentBox.width * 10) / 10,
          height: Math.round(currentBox.height * 10) / 10,
        },
      };
      const updated = [...regions, newRegion];
      setRegions(updated);
      setSelectedRegionIndex(updated.length - 1);
      setIsUnsaved(true);
    }
    setCurrentBox(null);
  };

  // Save Regions
  const handleSaveRegions = async () => {
    if (!activeEdition || !activePageNum) return;
    setSavingRegions(true);
    try {
      const res = await fetch("/api/epaper", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_regions",
          editionId: activeEdition.id,
          pageNumber: activePageNum,
          regions,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", `Regions saved for page ${activePageNum}.`);
        setIsUnsaved(false);
        fetchEditions();
      }
    } catch (e) {
      showToast("error", "Failed to save regions");
    } finally {
      setSavingRegions(false);
    }
  };

  // Delete Region
  const handleDeleteRegion = (indexToRemove) => {
    const updated = regions.filter((_, idx) => idx !== indexToRemove);
    setRegions(updated);
    setSelectedRegionIndex(updated.length > 0 ? 0 : null);
    setIsUnsaved(true);
  };

  // Filter editions by tab
  const filteredEditions = editions.filter((e) => {
    if (activeTab === "both") return true;
    return e.paper === activeTab;
  });

  const activePageObj = activeEdition?.pages?.find((p) => p.page_number === activePageNum);
  const selectedRegion = selectedRegionIndex !== null ? regions[selectedRegionIndex] : null;

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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">E-paper</h1>
          <p className="text-xs text-gray-500 mt-1">
            Upload Urdu and English PDFs separately — pages generate automatically
          </p>
        </div>

        <button
          type="button"
          onClick={fetchEditions}
          disabled={loading}
          className="p-2 text-gray-500 hover:text-gray-900 bg-white border border-[#e5e2da] rounded-lg hover:bg-gray-50 transition-colors shadow-xs self-start sm:self-auto"
          title="Refresh editions"
        >
          <RefreshCw size={14} className={loading ? "animate-spin text-[#124e2b]" : ""} />
        </button>
      </div>

      {/* ======================================================== */}
      {/* SECTION 1: UPLOAD AN EDITION CARD                        */}
      {/* ======================================================== */}
      <div className="bg-white border border-[#e5e2da] rounded-xl p-5 shadow-sm space-y-4">
        <span className="text-xs font-bold text-gray-500 tracking-wider uppercase">
          UPLOAD AN EDITION
        </span>

        <form onSubmit={handleUploadEdition} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Paper / Edition */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Paper / Edition</label>
              <select
                value={uploadPaper}
                onChange={(e) => setUploadPaper(e.target.value)}
                className="w-full text-xs font-semibold text-gray-800 border border-[#e5e2da] rounded-lg p-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#124e2b]"
              >
                <option value="ur">اردو (Urdu)</option>
                <option value="en">English</option>
              </select>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Date</label>
              <input
                type="date"
                required
                value={uploadDate}
                onChange={(e) => setUploadDate(e.target.value)}
                className="w-full text-xs font-semibold text-gray-800 border border-[#e5e2da] rounded-lg p-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#124e2b]"
              />
            </div>

            {/* Title / City */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">Title</label>
              <input
                type="text"
                dir="rtl"
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                placeholder="اختیاری — مثلاً کراچی ایڈیشن"
                className="w-full text-right font-nastaliq text-xs border border-[#e5e2da] rounded-lg p-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#124e2b]"
              />
            </div>
          </div>

          {/* PDF File Picker */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-700">PDF File</label>
            <div className="flex items-center gap-3">
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#f0ede6] file:text-gray-800 hover:file:bg-[#e5e2da] cursor-pointer"
              />
              <span className="text-[11px] text-gray-400">
                {selectedFile ? `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB` : "up to 150 MB"}
              </span>
            </div>
          </div>

          {/* Submit Action */}
          <div>
            <button
              type="submit"
              disabled={uploading}
              className="py-2.5 px-5 bg-[#124e2b] hover:bg-[#0a2618] text-white text-xs font-semibold rounded-lg shadow-sm transition-all disabled:opacity-40 flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <RefreshCw size={13} className="animate-spin" />
                  <span>Splitting PDF into pages...</span>
                </>
              ) : (
                <span>Upload edition</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ======================================================== */}
      {/* SECTION 2: EDITIONS LIST                                 */}
      {/* ======================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-gray-500 tracking-wider uppercase">
            EDITIONS
          </span>

          {/* Filter Tabs: Both, Urdu, English */}
          <div className="flex items-center gap-1 bg-[#f4f2ec] p-1 rounded-lg border border-[#e5e2da]">
            {[
              { key: "both", label: "Both" },
              { key: "ur", label: "اردو (Urdu)" },
              { key: "en", label: "English" },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key);
                  handleCloseClippingWorkspace();
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                  activeTab === tab.key
                    ? "bg-white text-gray-900 shadow-2xs border border-[#e5e2da]"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Editions Container */}
        {loading ? (
          <div className="bg-white border border-[#e5e2da] rounded-xl p-12 text-center text-gray-400 text-xs">
            <RefreshCw size={24} className="animate-spin mx-auto text-[#124e2b] mb-2" />
            Loading editions pipeline...
          </div>
        ) : filteredEditions.length === 0 ? (
          <div className="bg-white border border-dashed border-[#e5e2da] rounded-xl p-12 text-center text-gray-400 text-xs space-y-1">
            <Newspaper size={32} className="mx-auto text-gray-300 mb-1" />
            <p className="font-semibold text-gray-700 text-sm">No editions in this paper</p>
            <p className="text-[11px] text-gray-400">
              Nothing has been uploaded for this edition. Switch to “Both” to see the others.
            </p>
          </div>
        ) : (
          filteredEditions.map((edition) => (
            <div
              key={edition.id}
              className="bg-white border border-[#e5e2da] rounded-xl p-5 shadow-sm space-y-4"
            >
              {/* Row Header: Date, Language, Badges, Metadata, Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#f0ede6]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-gray-900">
                    {edition.edition_date}
                  </span>

                  {/* Language Badge */}
                  <span className="bg-cyan-50 text-cyan-800 border border-cyan-200 text-[10px] font-semibold px-2 py-0.5 rounded">
                    {edition.paper === "ur" ? "اردو (Urdu)" : "English"}
                  </span>

                  {/* Ready / Live Status Badges */}
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded">
                    {edition.status || "Ready"}
                  </span>

                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                      edition.is_live
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-gray-100 text-gray-600 border-gray-200"
                    }`}
                  >
                    {edition.is_live ? "Live" : "Unpublished"}
                  </span>

                  {/* City Tag */}
                  <span className="text-xs font-semibold text-gray-700 ml-1">
                    {edition.title || edition.city}
                  </span>

                  {/* Technical Metadata */}
                  <span className="text-[11px] text-gray-400">
                    · {(edition.pages || []).length} pages · PDF {edition.file_size || "34.6 MB"} · published{" "}
                    {edition.edition_date}
                  </span>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2">
                  <a
                    href={edition.pdf_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-semibold text-gray-700 bg-white border border-[#e5e2da] hover:bg-gray-50 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 shadow-2xs"
                  >
                    <span>PDF</span>
                    <ExternalLink size={11} />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleToggleLive(edition)}
                    className="text-xs font-semibold text-gray-700 bg-white border border-[#e5e2da] hover:bg-gray-50 px-2.5 py-1 rounded-md transition-colors shadow-2xs"
                  >
                    {edition.is_live ? "Unpublish" : "Publish"}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteEdition(edition.id)}
                    className="p-1.5 text-gray-400 hover:text-red-700 rounded hover:bg-red-50 transition-colors"
                    title="Delete edition"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Sequential Page Thumbnails Strip */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-medium text-gray-400">
                  Click a page thumbnail to open the clickable regions clipping tool:
                </span>

                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                  {(edition.pages || []).map((page) => {
                    const isSelected =
                      activeEdition?.id === edition.id && activePageNum === page.page_number;

                    return (
                      <button
                        key={page.page_number}
                        type="button"
                        onClick={() => handleOpenPageClipping(edition, page.page_number)}
                        className={`group rounded-lg overflow-hidden border transition-all text-left flex flex-col ${
                          isSelected
                            ? "border-[#124e2b] ring-2 ring-[#124e2b]/30 shadow-sm"
                            : "border-[#e5e2da] hover:border-gray-400 hover:shadow-xs"
                        }`}
                      >
                        {/* Page Preview Thumbnail */}
                        <div className="aspect-3/4 bg-[#f7f5f0] overflow-hidden relative">
                          <img
                            src={page.thumbnail_url || page.image_url}
                            alt={`Page ${page.page_number}`}
                            className="w-full h-full object-cover"
                          />
                          {(page.regions || []).length > 0 && (
                            <span className="absolute top-1 right-1 bg-[#124e2b] text-white text-[9px] font-bold px-1 rounded">
                              {page.regions.length}
                            </span>
                          )}
                        </div>

                        {/* Page Number Label */}
                        <div className="p-1.5 text-center bg-[#faf9f6] border-t border-[#f0ede6]">
                          <span
                            className={`text-xs font-bold ${
                              isSelected ? "text-[#124e2b]" : "text-gray-700"
                            }`}
                          >
                            {page.page_number}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ======================================================== */}
              {/* SECTION 3: CLICKABLE REGIONS (HOT-ZONES) WORKSPACE       */}
              {/* ======================================================== */}
              {activeEdition?.id === edition.id && activePageObj && (
                <div className="pt-4 mt-2 border-t border-[#e5e2da] space-y-4 animate-in fade-in">
                  {/* Workspace Header & Zoom Toolbar */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#faf9f6] p-3 rounded-xl border border-[#e5e2da]">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-900">
                          Clickable regions — page {activePageNum}
                        </span>
                        {isUnsaved ? (
                          <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-semibold px-2 py-0.2 rounded">
                            Unsaved
                          </span>
                        ) : (
                          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-semibold px-2 py-0.2 rounded">
                            Saved
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500">
                        Drag to draw · click to select · arrows nudge · Del removes
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Zoom Pills */}
                      <div className="flex items-center gap-1 bg-white border border-[#e5e2da] p-0.5 rounded-lg text-xs font-semibold text-gray-700">
                        <span className="px-1.5 text-[10px] text-gray-400">Zoom</span>
                        {[1, 1.5, 2].map((z) => (
                          <button
                            key={z}
                            type="button"
                            onClick={() => setZoomLevel(z)}
                            className={`px-2 py-0.5 rounded text-[11px] ${
                              zoomLevel === z
                                ? "bg-[#124e2b] text-white"
                                : "hover:bg-gray-100 text-gray-600"
                            }`}
                          >
                            {z}×
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={handleCloseClippingWorkspace}
                        className="text-xs font-semibold text-gray-600 hover:text-gray-900 px-2.5 py-1 rounded border border-gray-300 hover:bg-gray-50 transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>

                  {/* Two-Column Clipping Workspace: Canvas & Inspector */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* Left: High-Res Interactive Canvas */}
                    <div className="lg:col-span-8 bg-slate-900 rounded-xl overflow-auto max-h-[650px] p-4 flex items-center justify-center border border-[#e5e2da]">
                      <div
                        ref={canvasRef}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        style={{ transform: `scale(${zoomLevel})`, transformOrigin: "top center" }}
                        className="relative select-none cursor-crosshair inline-block shadow-2xl transition-transform duration-150"
                      >
                        <img
                          src={activePageObj.image_url}
                          alt={`Page ${activePageNum}`}
                          className="max-w-full h-auto block pointer-events-none"
                        />

                        {/* Existing Regions */}
                        {regions.map((region, idx) => {
                          const isSelected = selectedRegionIndex === idx;
                          return (
                            <div
                              key={region.id || idx}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedRegionIndex(idx);
                              }}
                              style={{
                                left: `${region.coordinates.x}%`,
                                top: `${region.coordinates.y}%`,
                                width: `${region.coordinates.width}%`,
                                height: `${region.coordinates.height}%`,
                              }}
                              className={`absolute border-2 transition-all cursor-pointer ${
                                isSelected
                                  ? "border-emerald-500 bg-emerald-500/25 ring-2 ring-emerald-300 shadow-md"
                                  : "border-blue-500 bg-blue-500/15 hover:bg-blue-500/25"
                              }`}
                            >
                              <span className="absolute top-0 left-0 bg-[#124e2b] text-white text-[9px] font-bold px-1 rounded-br">
                                {idx + 1}
                              </span>
                            </div>
                          );
                        })}

                        {/* Currently Drawing Box */}
                        {currentBox && (
                          <div
                            style={{
                              left: `${currentBox.x}%`,
                              top: `${currentBox.y}%`,
                              width: `${currentBox.width}%`,
                              height: `${currentBox.height}%`,
                            }}
                            className="absolute border-2 border-emerald-400 bg-emerald-400/30 pointer-events-none"
                          />
                        )}
                      </div>
                    </div>

                    {/* Right: Region Properties Inspector */}
                    <div className="lg:col-span-4 bg-[#faf9f6] border border-[#e5e2da] rounded-xl p-4 space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-[#e5e2da]">
                        <span className="text-xs font-bold text-gray-700">
                          {regions.length} {regions.length === 1 ? "region" : "regions"}
                        </span>

                        <button
                          type="button"
                          disabled={savingRegions}
                          onClick={handleSaveRegions}
                          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#124e2b] hover:bg-[#0a2618] rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                        >
                          {savingRegions ? <RefreshCw size={12} className="animate-spin" /> : <Check size={12} />}
                          <span>Save regions</span>
                        </button>
                      </div>

                      {/* Region Quick Select Pills */}
                      {regions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pb-2">
                          {regions.map((reg, idx) => (
                            <button
                              key={reg.id || idx}
                              type="button"
                              onClick={() => setSelectedRegionIndex(idx)}
                              className={`text-[10px] font-semibold px-2 py-0.5 rounded border transition-colors ${
                                selectedRegionIndex === idx
                                  ? "bg-[#124e2b] text-white border-[#0a2618]"
                                  : "bg-white text-gray-700 border-[#e5e2da] hover:bg-gray-100"
                              }`}
                            >
                              {idx + 1} {reg.headline ? `(${reg.headline.slice(0, 10)}...)` : "(بغیر سرخی)"}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Selected Region Card Form */}
                      {selectedRegion ? (
                        <div className="p-3.5 bg-white border border-[#e5e2da] rounded-xl space-y-3 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-800">
                              Region #{selectedRegionIndex + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDeleteRegion(selectedRegionIndex)}
                              className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1"
                              title="Delete region"
                            >
                              <Trash2 size={12} />
                              <span>Delete region</span>
                            </button>
                          </div>

                          {/* Headline (سرخی) */}
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 flex items-center justify-between">
                              <span>سرخی (Headline)</span>
                              <span className="text-[10px] text-gray-400">Nastaliq</span>
                            </label>
                            <input
                              type="text"
                              dir="rtl"
                              value={selectedRegion.headline || ""}
                              onChange={(e) => {
                                const updated = [...regions];
                                updated[selectedRegionIndex].headline = e.target.value;
                                setRegions(updated);
                                setIsUnsaved(true);
                              }}
                              placeholder="خبر کی سرخی..."
                              className="w-full text-right font-nastaliq text-xs border border-[#e5e2da] rounded p-2 bg-[#fcfbf9] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#124e2b]"
                            />
                          </div>

                          {/* Story Text Body (خبر کا متن) */}
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700">
                              خبر کا متن (اختیاری)
                            </label>
                            <textarea
                              rows={3}
                              dir="rtl"
                              value={selectedRegion.body || ""}
                              onChange={(e) => {
                                const updated = [...regions];
                                updated[selectedRegionIndex].body = e.target.value;
                                setRegions(updated);
                                setIsUnsaved(true);
                              }}
                              placeholder="قاری کو تصویر کے ساتھ متن بھی ملے گا..."
                              className="w-full text-right font-nastaliq text-xs border border-[#e5e2da] rounded p-2 bg-[#fcfbf9] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#124e2b] resize-none"
                            />
                          </div>

                          {/* Link Article ID */}
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700">
                              Link article ID (optional)
                            </label>
                            <input
                              type="text"
                              value={selectedRegion.article_id || ""}
                              onChange={(e) => {
                                const updated = [...regions];
                                updated[selectedRegionIndex].article_id = e.target.value;
                                setRegions(updated);
                                setIsUnsaved(true);
                              }}
                              placeholder="e.g. 101"
                              className="w-full text-xs font-mono border border-[#e5e2da] rounded p-2 bg-[#fcfbf9] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#124e2b]"
                            />
                          </div>

                          {/* Coordinates Readout */}
                          <div className="pt-1 text-[11px] font-mono text-gray-400">
                            {selectedRegion.coordinates.x}%, {selectedRegion.coordinates.y}% ·{" "}
                            {selectedRegion.coordinates.width} × {selectedRegion.coordinates.height}%
                          </div>
                        </div>
                      ) : (
                        <div className="py-8 text-center text-xs text-gray-400 border border-dashed border-[#e5e2da] rounded-xl bg-white">
                          No region selected. Drag on the newspaper page on the left to draw a clickable story region.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Delete Edition Confirmation Modal */}
      {deletingEditionId && (
        <div className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-4">
          <div className="bg-white border border-[#e5e2da] w-full max-w-md shadow-2xl p-5 space-y-4 rounded-xl">
            <h3 className="text-sm font-bold text-[#18221b]">Delete this e-paper edition?</h3>
            <p className="text-xs text-[#5c635b] leading-relaxed">
              This will permanently remove the edition and all of its page clippings. This cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeletingEditionId(null)}
                className="px-3.5 py-2 text-xs font-semibold border border-[#e5e2da] bg-white text-[#5c635b] rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDeleteEdition}
                className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-60 cursor-pointer"
              >
                {deleting ? "Deleting..." : "Delete edition"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
