"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  LayoutGrid,
  Plus,
  Sliders,
  RefreshCw,
  ExternalLink,
  GripVertical,
  ArrowUp,
  ArrowDown,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  Check,
  Play,
  FileText,
  Eye,
  Layers,
  ChevronDown,
  Monitor,
  Flame,
  Layout,
  ListFilter,
} from "lucide-react";

export default function AdminLayoutBuilderPage() {
  const [zones, setZones] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Filter State
  const [selectedPage, setSelectedPage] = useState("home");
  const [selectedEdition, setSelectedEdition] = useState("ur"); // 'ur' or 'en'
  const [previewKey, setPreviewKey] = useState(Date.now());

  // Modal State: Add/Edit Block
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [editingBlock, setEditingBlock] = useState(null);
  const [blockForm, setBlockForm] = useState({
    title_ur: "",
    title_en: "",
    subtitle_ur: "",
    subtitle_en: "",
    style: "Grid",
    zone: "body",
    fill_mode: "auto",
    category_slug: "",
    limit: 6,
    order_by: "recent",
    featured_only: false,
    is_active: true,
  });

  // Modal State: Placement Rules
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [editableZones, setEditableZones] = useState([]);
  const [savingAction, setSavingAction] = useState(false);
  const [deletingBlockId, setDeletingBlockId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Block style icons & definitions
  const blockStyleOptions = [
    { key: "Hero", label: "Hero", icon: "🅷", desc: "Large lead package" },
    { key: "Grid", label: "Grid", icon: "▦", desc: "Package of stories in a responsive grid" },
    { key: "List", label: "List", icon: "☰", desc: "Ranked, headline-only list" },
    { key: "Carousel", label: "Carousel", icon: "◧", desc: "Swipeable story carousel" },
    { key: "Video rail", label: "Video rail", icon: "▶", desc: "Video player and reel strip" },
    { key: "Opinion", label: "Opinion", icon: "✍", desc: "Editorial & columnists with author avatars" },
    { key: "Widget", label: "Widget", icon: "⊞", desc: "Prayer times, weather, currency rates, polls" },
    { key: "Ad", label: "Ad", icon: "📣", desc: "Ad banner placement block" },
    { key: "Ticker", label: "Ticker", icon: "⚡", desc: "Breaking ticker bar" },
  ];

  // Fetch layout configuration
  const fetchLayoutData = async () => {
    setLoading(true);
    try {
      const [layoutRes, catRes] = await Promise.all([
        fetch(`/api/layout?page=${selectedPage}&edition=${selectedEdition}`),
        fetch("/api/categories"),
      ]);
      const layoutData = await layoutRes.json();
      const catData = await catRes.json();

      if (layoutData.zones) setZones(layoutData.zones);
      if (layoutData.blocks) setBlocks(layoutData.blocks);
      if (catData.categories) setCategories(catData.categories);
    } catch (e) {
      console.error("Failed to load layout:", e);
      showToast("error", "Failed to load layout configuration");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLayoutData();
  }, [selectedPage, selectedEdition]);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Reorder Block (Move Up / Down)
  const handleMoveBlock = async (blockIndex, direction) => {
    const newIndex = direction === "up" ? blockIndex - 1 : blockIndex + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;

    const reordered = [...blocks];
    const temp = reordered[blockIndex];
    reordered[blockIndex] = reordered[newIndex];
    reordered[newIndex] = temp;

    setBlocks(reordered);

    try {
      await fetch("/api/layout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_blocks", blocks: reordered }),
      });
      showToast("success", "Layout order updated.");
      setPreviewKey(Date.now());
    } catch (e) {
      showToast("error", "Failed to save block order");
    }
  };

  // Toggle Block Active Status
  const handleToggleBlock = async (block) => {
    const newActive = !block.is_active;
    const updatedBlocks = blocks.map((b) => (b.id === block.id ? { ...b, is_active: newActive } : b));
    setBlocks(updatedBlocks);

    try {
      const res = await fetch("/api/layout", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: block.id, is_active: newActive }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", `Block "${selectedEdition === "ur" ? (block.title_ur || block.title_en) : block.title_en}" is now ${newActive ? "Active" : "Hidden"}`);
        setPreviewKey(Date.now());
      }
    } catch (e) {
      showToast("error", "Failed to update block status");
    }
  };

  // Delete Block (opens confirmation modal)
  const handleDeleteBlock = (blockId) => {
    setDeletingBlockId(blockId);
  };

  const confirmDeleteBlock = async () => {
    if (!deletingBlockId) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/layout?id=${deletingBlockId}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        setBlocks(blocks.filter((b) => b.id !== deletingBlockId));
        setDeletingBlockId(null);
        showToast("success", "Block removed from layout.");
        setPreviewKey(Date.now());
      } else {
        showToast("error", data.error || "Failed to delete block");
      }
    } catch {
      showToast("error", "Failed to delete block");
    } finally {
      setDeleting(false);
    }
  };

  // Open Add Block Modal
  const handleOpenAddBlock = (targetZone = "body") => {
    setEditingBlock(null);
    setBlockForm({
      title_ur: "",
      title_en: "",
      subtitle_ur: "",
      subtitle_en: "",
      style: targetZone === "top" ? "Hero" : "Grid",
      zone: targetZone,
      fill_mode: "auto",
      category_slug: "",
      limit: 6,
      order_by: "recent",
      featured_only: false,
      is_active: true,
    });
    setShowBlockModal(true);
  };

  // Open Edit Block Modal
  const handleOpenEditBlock = (block) => {
    setEditingBlock(block);
    setBlockForm({
      title_ur: block.title_ur || "",
      title_en: block.title_en || "",
      subtitle_ur: block.subtitle_ur || "",
      subtitle_en: block.subtitle_en || "",
      style: block.style || "Grid",
      zone: block.zone || "body",
      fill_mode: block.fill_mode || "auto",
      category_slug: block.category_slug || "",
      limit: block.limit || 6,
      order_by: block.order_by || "recent",
      featured_only: Boolean(block.featured_only),
      is_active: block.is_active !== false,
    });
    setShowBlockModal(true);
  };

  // Save Block (Add or Edit)
  const handleSaveBlock = async (e) => {
    e.preventDefault();
    setSavingAction(true);
    try {
      if (editingBlock) {
        const res = await fetch("/api/layout", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingBlock.id,
            ...blockForm,
          }),
        });
        const data = await res.json();
        if (data.success) {
          showToast("success", "Block updated successfully!");
          setShowBlockModal(false);
          fetchLayoutData();
          setPreviewKey(Date.now());
        }
      } else {
        const res = await fetch("/api/layout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(blockForm),
        });
        const data = await res.json();
        if (data.success) {
          showToast("success", "New block added to layout!");
          setShowBlockModal(false);
          fetchLayoutData();
          setPreviewKey(Date.now());
        }
      }
    } catch (e) {
      showToast("error", "Error saving block");
    } finally {
      setSavingAction(false);
    }
  };

  // Open Rules Modal
  const handleOpenRules = () => {
    setEditableZones(JSON.parse(JSON.stringify(zones)));
    setShowRulesModal(true);
  };

  // Save Rules
  const handleSaveRules = async () => {
    setSavingAction(true);
    try {
      const res = await fetch("/api/layout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_zones", zones: editableZones }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", "Placement rules updated!");
        setShowRulesModal(false);
        setZones(editableZones);
      }
    } catch (e) {
      showToast("error", "Failed to save placement rules");
    } finally {
      setSavingAction(false);
    }
  };

  // Helper to get visual block icon
  const getStyleIcon = (style) => {
    switch (style) {
      case "Hero":
        return <span className="font-bold text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200 text-xs">🅷</span>;
      case "Grid":
        return <span className="font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 text-xs">▦</span>;
      case "List":
        return <span className="font-bold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-300 text-xs">☰</span>;
      case "Video rail":
        return <span className="font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 text-xs">▶</span>;
      case "Opinion":
        return <span className="font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-xs">✍</span>;
      case "Carousel":
        return <span className="font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 text-xs">◧</span>;
      case "Widget":
        return <span className="font-bold text-teal-800 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 text-xs">⊞</span>;
      case "Ad":
        return <span className="font-bold text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200 text-xs">📣</span>;
      default:
        return <span className="font-bold text-gray-700 bg-gray-50 px-1.5 py-0.5 rounded border text-xs">▦</span>;
    }
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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Layout builder</h1>
          <p className="text-xs text-gray-500 mt-1">
            Drag blocks to arrange the page. Zones set the order and what&apos;s allowed where.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleOpenRules}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-[#e5e2da] hover:bg-gray-50 rounded-lg shadow-xs transition-colors"
          >
            <Sliders size={14} />
            <span>Rules</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenAddBlock("body")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#124e2b] hover:bg-[#0a2618] rounded-lg shadow-sm transition-all"
          >
            <Plus size={14} />
            <span>+ Add block</span>
          </button>

          <button
            type="button"
            onClick={fetchLayoutData}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-900 bg-white border border-[#e5e2da] rounded-lg hover:bg-gray-50 transition-colors shadow-xs"
            title="Refresh layout"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-[#124e2b]" : ""} />
          </button>
        </div>
      </div>

      {/* Scope Filter Strip (Page Selector & Edition Selector) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white border border-[#e5e2da] rounded-xl p-4 shadow-2xs">
        {/* Page Selector */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700">Page</label>
          <select
            value={selectedPage}
            onChange={(e) => setSelectedPage(e.target.value)}
            className="w-full text-xs font-semibold text-gray-800 border border-[#e5e2da] rounded-lg p-2.5 bg-[#fcfbf9] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#124e2b]"
          >
            <option value="home">Home page</option>
            {categories.map((c) => (
              <option key={c.id} value={c.slug}>
                Section: {c.name_en} ({c.url_path || `/${c.slug}`})
              </option>
            ))}
          </select>
          <p className="text-[10px] text-gray-400">The home page, or any section&apos;s own landing page</p>
        </div>

        {/* Edition Selector */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-700">Edition</label>
          <select
            value={selectedEdition}
            onChange={(e) => {
              setSelectedEdition(e.target.value);
              setPreviewKey(Date.now());
            }}
            className="w-full text-xs font-semibold text-gray-800 border border-[#e5e2da] rounded-lg p-2.5 bg-[#fcfbf9] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#124e2b]"
          >
            <option value="ur">اردو — Urdu</option>
            <option value="en">English</option>
          </select>
          <p className="text-[10px] text-gray-400">The two editions have genuinely different layouts</p>
        </div>
      </div>

      {/* Two-Column Grid: Configurable Zones & Live Preview */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* ======================================================== */}
        {/* LEFT COLUMN (~60%): 3 CONFIGURABLE VERTICAL ZONES        */}
        {/* ======================================================== */}
        <div className="xl:col-span-7 space-y-6">
          {zones.map((zone) => {
            const zoneBlocks = blocks.filter((b) => b.zone === zone.key);
            const isAtCapacity = zone.max_blocks && zoneBlocks.length >= zone.max_blocks;

            return (
              <div
                key={zone.key}
                className="bg-white border border-[#e5e2da] rounded-xl shadow-sm overflow-hidden"
              >
                {/* Zone Header Bar */}
                <div className="bg-[#f7f5f0] border-b border-[#e5e2da] px-4 py-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-gray-800 tracking-wide uppercase">
                      {zone.label}
                    </span>
                    <span className="text-xs font-medium text-gray-500">
                      · {zone.max_blocks ? `${zoneBlocks.length} / ${zone.max_blocks}` : zoneBlocks.length}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      · {(zone.allowed_types || []).join(" · ")}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={Boolean(isAtCapacity)}
                    onClick={() => handleOpenAddBlock(zone.key)}
                    className="text-[11px] font-semibold text-[#124e2b] hover:text-[#0a2618] transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    <Plus size={12} />
                    <span>Add to {zone.label}</span>
                  </button>
                </div>

                {/* Zone Blocks List */}
                <div className="p-3.5 space-y-2.5">
                  {zoneBlocks.length === 0 ? (
                    <div className="py-6 text-center text-xs text-gray-400 border border-dashed border-[#e5e2da] rounded-lg bg-[#faf9f6]">
                      No blocks in this zone. Click &quot;Add to {zone.label}&quot; above.
                    </div>
                  ) : (
                    zoneBlocks.map((block) => {
                      const globalIndex = blocks.findIndex((b) => b.id === block.id);
                      const isFirst = globalIndex === 0;
                      const isLast = globalIndex === blocks.length - 1;

                      const displayTitle =
                        selectedEdition === "ur"
                          ? block.title_ur || block.title_en || "Untitled block"
                          : block.title_en || block.title_ur || "Untitled block";

                      return (
                        <div
                          key={block.id}
                          className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                            block.is_active
                              ? "bg-white border-[#e5e2da] hover:border-gray-400 shadow-2xs"
                              : "bg-[#fcfbf9] border-dashed border-gray-300 opacity-60"
                          }`}
                        >
                          {/* Left: Reorder, Icon, Title, Tags */}
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Move Up/Down Controls */}
                            <div className="flex flex-col items-center gap-0.5 text-gray-400 shrink-0">
                              <button
                                type="button"
                                disabled={isFirst}
                                onClick={() => handleMoveBlock(globalIndex, "up")}
                                className="hover:text-gray-900 disabled:opacity-20 transition-colors p-0.5"
                                title="Move block up"
                              >
                                <ArrowUp size={11} />
                              </button>
                              <span className="text-gray-300">⠿</span>
                              <button
                                type="button"
                                disabled={isLast}
                                onClick={() => handleMoveBlock(globalIndex, "down")}
                                className="hover:text-gray-900 disabled:opacity-20 transition-colors p-0.5"
                                title="Move block down"
                              >
                                <ArrowDown size={11} />
                              </button>
                            </div>

                            {/* Visual Block Style Icon */}
                            <div className="shrink-0">{getStyleIcon(block.style)}</div>

                            {/* Block Title & Metadata Pills */}
                            <div className="min-w-0 space-y-1">
                              <div className="flex items-center gap-2">
                                <h4
                                  className={`text-xs font-bold text-gray-900 truncate max-w-[280px] ${
                                    selectedEdition === "ur" && block.title_ur ? "font-nastaliq text-sm" : ""
                                  }`}
                                  dir={selectedEdition === "ur" && block.title_ur ? "rtl" : "ltr"}
                                >
                                  {displayTitle}
                                </h4>
                              </div>

                              <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                                {/* Style Badge */}
                                <span className="bg-[#f2efe9] text-gray-700 px-1.5 py-0.5 rounded font-semibold border border-[#e5e2da]">
                                  {block.style}
                                </span>

                                {/* Source / Limit Badge */}
                                <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                                  {block.fill_mode === "auto"
                                    ? `Auto · ${block.category_slug ? `${block.category_slug} · ` : ""}${block.limit || 6} stories`
                                    : "Manual curated"}
                                </span>

                                {block.featured_only && (
                                  <span className="bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded font-medium">
                                    Featured only
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Right: Active Switch & Actions */}
                          <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                            {/* Active Switch */}
                            <div className="flex items-center gap-1.5">
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={block.is_active}
                                  onChange={() => handleToggleBlock(block)}
                                  className="sr-only peer"
                                />
                                <div className="w-8 h-4.5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#124e2b]"></div>
                              </label>
                              <span className="text-[10px] text-gray-400">
                                {block.is_active ? "Active" : "Off"}
                              </span>
                            </div>

                            {/* Edit Button */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditBlock(block)}
                              className="p-1.5 text-gray-400 hover:text-gray-900 rounded hover:bg-gray-100 transition-colors"
                              title="Edit block settings"
                            >
                              <Edit2 size={12} />
                            </button>

                            {/* Delete Button */}
                            <button
                              type="button"
                              onClick={() => handleDeleteBlock(block.id)}
                              className="p-1.5 text-gray-400 hover:text-red-700 rounded hover:bg-red-50 transition-colors"
                              title="Delete block"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN (~40%): LIVE BROADSHEET PREVIEW PANE       */}
        {/* ======================================================== */}
        <div className="xl:col-span-5 sticky top-6 space-y-3">
          <div className="bg-white border border-[#e5e2da] rounded-xl shadow-sm overflow-hidden flex flex-col h-[750px]">
            {/* Preview Header */}
            <div className="px-4 py-3 bg-[#faf9f6] border-b border-[#e5e2da] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Monitor size={14} className="text-[#124e2b]" />
                <span className="text-xs font-bold text-gray-800">Live preview</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded font-semibold uppercase">
                  {selectedEdition === "ur" ? "Urdu" : "English"}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={selectedEdition === "ur" ? "/" : "/en"}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-semibold text-[#124e2b] hover:underline flex items-center gap-1"
                >
                  <span>Open in a new tab</span>
                  <ExternalLink size={11} />
                </a>

                <button
                  type="button"
                  onClick={() => setPreviewKey(Date.now())}
                  className="p-1 text-gray-400 hover:text-gray-800 rounded hover:bg-gray-100 transition-colors"
                  title="Reload preview"
                >
                  <RefreshCw size={12} />
                </button>
              </div>
            </div>

            {/* Responsive Iframe Container */}
            <div className="flex-1 bg-[#f9f8f5] p-2 overflow-hidden flex items-center justify-center">
              <iframe
                key={previewKey}
                src={selectedEdition === "ur" ? "/" : "/en"}
                title="Live Broadsheet Preview"
                className="w-full h-full border border-[#e5e2da] rounded-lg shadow-inner bg-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: ADD / EDIT BLOCK MODAL                          */}
      {/* ======================================================== */}
      {showBlockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#e5e2da] rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e2da] bg-[#faf9f6]">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {editingBlock ? "Edit block" : "Add block"}
                </h3>
                <p className="text-[11px] text-gray-500">
                  Configure visual story block style, category source, and capacity.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowBlockModal(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveBlock} className="overflow-y-auto p-6 space-y-4">
              {/* Bilingual Titles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 flex items-center justify-between">
                    <span>Title (Urdu)</span>
                    <span className="font-nastaliq text-emerald-800 text-[10px]">اردو عنوان</span>
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={blockForm.title_ur}
                    onChange={(e) => setBlockForm({ ...blockForm, title_ur: e.target.value })}
                    placeholder="بزنس / اہم خبریں"
                    className="w-full text-right font-nastaliq text-xs border border-[#e5e2da] rounded-lg p-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#124e2b]"
                  />
                  <p className="text-[10px] text-gray-400">Leave blank for an untitled hero package</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Title (English)</label>
                  <input
                    type="text"
                    value={blockForm.title_en}
                    onChange={(e) => setBlockForm({ ...blockForm, title_en: e.target.value })}
                    placeholder="Business / Top stories"
                    className="w-full text-xs border border-[#e5e2da] rounded-lg p-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#124e2b]"
                  />
                  <p className="text-[10px] text-gray-400">Shown in the English edition</p>
                </div>
              </div>

              {/* Block Style Combobox */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Block style</label>
                <select
                  value={blockForm.style}
                  onChange={(e) => setBlockForm({ ...blockForm, style: e.target.value })}
                  className="w-full text-xs font-semibold border border-[#e5e2da] rounded-lg p-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#124e2b]"
                >
                  {blockStyleOptions.map((opt) => (
                    <option key={opt.key} value={opt.key}>
                      {opt.icon} {opt.label} — {opt.desc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Zone */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Zone</label>
                <select
                  value={blockForm.zone}
                  onChange={(e) => setBlockForm({ ...blockForm, zone: e.target.value })}
                  className="w-full text-xs border border-[#e5e2da] rounded-lg p-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#124e2b]"
                >
                  {zones.map((z) => (
                    <option key={z.key} value={z.key}>
                      {z.label} (Allowed: {(z.allowed_types || []).join(", ")})
                    </option>
                  ))}
                </select>
              </div>

              {/* Fill Mode (Auto vs Manual) */}
              <div className="space-y-3 pt-2 border-t border-[#f0ede6]">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                    <input
                      type="radio"
                      name="fill_mode"
                      value="auto"
                      checked={blockForm.fill_mode === "auto"}
                      onChange={() => setBlockForm({ ...blockForm, fill_mode: "auto" })}
                      className="text-[#124e2b] focus:ring-[#124e2b]"
                    />
                    <span>Auto (saved query)</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
                    <input
                      type="radio"
                      name="fill_mode"
                      value="manual"
                      checked={blockForm.fill_mode === "manual"}
                      onChange={() => setBlockForm({ ...blockForm, fill_mode: "manual" })}
                      className="text-[#124e2b] focus:ring-[#124e2b]"
                    />
                    <span>Manual (curated)</span>
                  </label>
                </div>

                {blockForm.fill_mode === "auto" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[#faf9f6] rounded-lg border border-[#e5e2da]">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-gray-700">Source section</label>
                      <select
                        value={blockForm.category_slug}
                        onChange={(e) => setBlockForm({ ...blockForm, category_slug: e.target.value })}
                        className="w-full text-xs border border-[#e5e2da] rounded p-2 bg-white"
                      >
                        <option value="">— Any section —</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.slug}>
                            {c.name_en} ({c.name_ur})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-gray-700">How many stories</label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={blockForm.limit}
                        onChange={(e) => setBlockForm({ ...blockForm, limit: Number(e.target.value) })}
                        className="w-full text-xs border border-[#e5e2da] rounded p-2 bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-gray-700">Order by</label>
                      <select
                        value={blockForm.order_by}
                        onChange={(e) => setBlockForm({ ...blockForm, order_by: e.target.value })}
                        className="w-full text-xs border border-[#e5e2da] rounded p-2 bg-white"
                      >
                        <option value="recent">Most recent</option>
                        <option value="views">Most viewed</option>
                        <option value="featured">Featured first</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-[#faf9f6] rounded-lg border border-dashed border-[#e5e2da] text-xs text-gray-500">
                    You hand-pick and order the exact stories shown. Add the block first, then curate its stories from the editor.
                  </div>
                )}
              </div>

              {/* Active Switch */}
              <div className="flex items-center justify-between pt-2 border-t border-[#f0ede6]">
                <div>
                  <span className="text-xs font-semibold text-gray-700">Active status</span>
                  <p className="text-[10px] text-gray-400">Inactive blocks are hidden from readers but kept here</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={blockForm.is_active}
                    onChange={(e) => setBlockForm({ ...blockForm, is_active: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#124e2b]"></div>
                </label>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f0ede6]">
                <button
                  type="button"
                  onClick={() => setShowBlockModal(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingAction}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#124e2b] hover:bg-[#0a2618] rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                >
                  {savingAction ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
                  <span>{editingBlock ? "Save block" : "Add block"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: PLACEMENT RULES CONFIGURATION MODAL             */}
      {/* ======================================================== */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#e5e2da] rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e2da] bg-[#faf9f6]">
              <div>
                <h3 className="text-base font-bold text-gray-900">Placement rules</h3>
                <p className="text-[11px] text-gray-500">
                  Zones order the page top-to-bottom and control which block types are allowed where.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRulesModal(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-4">
              {editableZones.map((zone, idx) => (
                <div key={zone.key} className="p-4 border border-[#e5e2da] rounded-xl bg-[#fcfbf9] space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                      Zone {idx + 1}: {zone.label}
                    </span>
                    <span className="font-mono text-[11px] bg-white border border-[#e5e2da] px-2 py-0.5 rounded text-gray-600">
                      key: {zone.key}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-gray-700">Label</label>
                      <input
                        type="text"
                        value={zone.label}
                        onChange={(e) => {
                          const updated = [...editableZones];
                          updated[idx].label = e.target.value;
                          setEditableZones(updated);
                        }}
                        className="w-full text-xs border border-[#e5e2da] rounded p-2 bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-gray-700">Max blocks (Limit)</label>
                      <input
                        type="number"
                        placeholder="Unlimited"
                        value={zone.max_blocks || ""}
                        onChange={(e) => {
                          const updated = [...editableZones];
                          updated[idx].max_blocks = e.target.value ? Number(e.target.value) : null;
                          setEditableZones(updated);
                        }}
                        className="w-full text-xs border border-[#e5e2da] rounded p-2 bg-white"
                      />
                    </div>
                  </div>

                  {/* Allowed Block Type Chips */}
                  <div className="space-y-1.5 pt-1">
                    <label className="text-[11px] font-semibold text-gray-700">Allowed block types</label>
                    <div className="flex flex-wrap gap-1.5">
                      {blockStyleOptions.map((opt) => {
                        const isAllowed = (zone.allowed_types || []).includes(opt.key);
                        return (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => {
                              const updated = [...editableZones];
                              const currentAllowed = updated[idx].allowed_types || [];
                              if (isAllowed) {
                                updated[idx].allowed_types = currentAllowed.filter((t) => t !== opt.key);
                              } else {
                                updated[idx].allowed_types = [...currentAllowed, opt.key];
                              }
                              setEditableZones(updated);
                            }}
                            className={`text-[10px] font-semibold px-2 py-1 rounded border transition-colors ${
                              isAllowed
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                                : "bg-white text-gray-400 border-gray-200 hover:text-gray-700"
                            }`}
                          >
                            {opt.icon} {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f0ede6]">
                <button
                  type="button"
                  onClick={() => setShowRulesModal(false)}
                  className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={savingAction}
                  onClick={handleSaveRules}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#124e2b] hover:bg-[#0a2618] rounded-lg shadow-sm transition-all flex items-center gap-1.5"
                >
                  {savingAction ? <RefreshCw size={13} className="animate-spin" /> : <Check size={13} />}
                  <span>Save rules</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Delete Block Confirmation Dialog */}
      {deletingBlockId && (
        <div className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-4">
          <div className="bg-white border border-[#e5e2da] w-full max-w-md shadow-2xl p-5 space-y-4 rounded-xl">
            <h3 className="text-sm font-bold text-[#18221b]">Remove block from layout?</h3>
            <p className="text-xs text-[#5c635b] leading-relaxed">
              This will remove the block from the active page layout. You can always add a new block later.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeletingBlockId(null)}
                className="px-3.5 py-2 text-xs font-semibold border border-[#e5e2da] bg-white text-[#5c635b] rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDeleteBlock}
                className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-60 cursor-pointer"
              >
                {deleting ? "Removing..." : "Remove block"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
