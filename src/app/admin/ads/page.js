"use client";

import React, { useState, useEffect } from "react";
import {
  Megaphone,
  Plus,
  Layers,
  Eye,
  MousePointer,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Trash2,
  ExternalLink,
  Upload,
  X,
  RefreshCw,
  Sliders,
  Globe,
  Tag,
  Calendar,
  Image as ImageIcon,
  Check,
  Search,
} from "lucide-react";

export default function AdminAdsPage() {
  const [slots, setSlots] = useState([]);
  const [creatives, setCreatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all_pages");
  const [toast, setToast] = useState(null);

  // Creative Modal State
  const [showCreativeModal, setShowCreativeModal] = useState(false);
  const [editingCreative, setEditingCreative] = useState(null);
  const [uploadingArtwork, setUploadingArtwork] = useState(false);
  const [creativeForm, setCreativeForm] = useState({
    page_type: "home",
    slot_key: "",
    name: "",
    type: "direct",
    runs_on: "both",
    weight: 1,
    image_url: "",
    image_alt: "",
    html_code: "",
    click_url: "",
    starts_at: "",
    ends_at: "",
    status: "run",
    is_active: true,
  });

  // Slot Modal State
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [slotForm, setSlotForm] = useState({
    slot_key: "",
    name: "",
    sizes: "728x90, 300x250",
    pages: "home",
    is_active: true,
  });

  const [savingAction, setSavingAction] = useState(false);
  const [deletingTarget, setDeletingTarget] = useState(null); // { type: 'creative' | 'slot', id, label }
  const [deleting, setDeleting] = useState(false);

  // Fetch all ads data
  const fetchAdsData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/ads");
      const data = await res.json();
      if (data.slots) setSlots(data.slots);
      if (data.creatives) setCreatives(data.creatives);
    } catch (e) {
      console.error("Failed to load ads:", e);
      showToast("error", "Failed to fetch ad slots and creatives");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdsData();
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Helper to filter slots by category tab
  const getTabSlots = (tab) => {
    if (tab === "all_pages") {
      return slots.filter((s) => s.pages && (s.pages.includes("all") || s.pages.includes("site-wide")));
    }
    if (tab === "home") {
      return slots.filter((s) => s.pages && s.pages.includes("home"));
    }
    if (tab === "section") {
      return slots.filter((s) => s.pages && (s.pages.includes("section") || s.pages.includes("category")));
    }
    if (tab === "story") {
      return slots.filter(
        (s) => s.pages && (s.pages.includes("story") || s.pages.includes("article"))
      );
    }
    return slots;
  };

  // KPI Metrics Calculation
  const totalSlotsCount = slots.length;
  const totalCreativesCount = creatives.length;
  const totalImpressions = creatives.reduce((acc, c) => acc + (c.impressions || 0), 0);
  const totalClicks = creatives.reduce((acc, c) => acc + (c.clicks || 0), 0);

  // Open Add Creative Modal
  const handleOpenAddCreative = (preselectedSlotKey = null) => {
    setEditingCreative(null);
    let initialSlot = preselectedSlotKey;
    let initialPage = "home";

    if (preselectedSlotKey) {
      const found = slots.find((s) => s.slot_key === preselectedSlotKey);
      if (found && found.pages && found.pages.length > 0) {
        initialPage = found.pages[0];
      }
    } else {
      const available = getTabSlots(activeTab);
      if (available.length > 0) {
        initialSlot = available[0].slot_key;
        initialPage = available[0].pages ? available[0].pages[0] : "home";
      }
    }

    setCreativeForm({
      page_type: initialPage,
      slot_key: initialSlot || (slots[0]?.slot_key ?? ""),
      name: "",
      type: "direct",
      runs_on: "both",
      weight: 1,
      image_url: "",
      image_alt: "",
      html_code: "",
      click_url: "",
      starts_at: "",
      ends_at: "",
      status: "run",
      is_active: true,
    });
    setShowCreativeModal(true);
  };

  // Open Edit Creative Modal
  const handleOpenEditCreative = (creative) => {
    setEditingCreative(creative);
    const parentSlot = slots.find((s) => s.slot_key === creative.slot_key);
    setCreativeForm({
      page_type: parentSlot?.pages?.[0] || "home",
      slot_key: creative.slot_key,
      name: creative.name,
      type: creative.type || "direct",
      runs_on: creative.runs_on || "both",
      weight: creative.weight || 1,
      image_url: creative.image_url || "",
      image_alt: creative.image_alt || "",
      html_code: creative.html_code || "",
      click_url: creative.click_url || "",
      starts_at: creative.starts_at || "",
      ends_at: creative.ends_at || "",
      status: creative.status || "run",
      is_active: creative.status === "run",
    });
    setShowCreativeModal(true);
  };

  // Save Creative
  const handleSaveCreative = async (e) => {
    e.preventDefault();
    if (!creativeForm.name.trim()) {
      showToast("error", "Creative name is required.");
      return;
    }
    if (!creativeForm.slot_key) {
      showToast("error", "Please select a placement slot.");
      return;
    }

    setSavingAction(true);
    try {
      if (editingCreative) {
        // Update existing creative
        const res = await fetch("/api/ads", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            target: "creative",
            creative_id: editingCreative.id,
            ...creativeForm,
            status: creativeForm.is_active ? "run" : "pause",
          }),
        });
        const data = await res.json();
        if (data.success) {
          showToast("success", "Creative updated successfully!");
          setShowCreativeModal(false);
          fetchAdsData();
        } else {
          showToast("error", data.error || "Failed to update creative");
        }
      } else {
        // Create new creative
        const res = await fetch("/api/ads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "create_creative",
            ...creativeForm,
            status: creativeForm.is_active ? "run" : "pause",
          }),
        });
        const data = await res.json();
        if (data.success) {
          showToast("success", "New creative published!");
          setShowCreativeModal(false);
          fetchAdsData();
        } else {
          showToast("error", data.error || "Failed to create creative");
        }
      }
    } catch (err) {
      showToast("error", "Network error saving creative");
    } finally {
      setSavingAction(false);
    }
  };

  // Toggle Creative Run/Pause
  const handleToggleCreative = async (creative) => {
    const newStatus = creative.status === "run" ? "pause" : "run";
    try {
      const res = await fetch("/api/ads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target: "creative",
          creative_id: creative.id,
          status: newStatus,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", `Creative status set to ${newStatus === "run" ? "Running" : "Paused"}`);
        fetchAdsData();
      }
    } catch (err) {
      showToast("error", "Failed to update creative status");
    }
  };

  // Delete Creative (opens confirmation modal)
  const handleDeleteCreative = (creativeId) => {
    setDeletingTarget({ type: "creative", id: creativeId, label: "this ad creative" });
  };

  // Open New / Edit Slot Modal
  const handleOpenAddSlot = () => {
    setEditingSlot(null);
    setSlotForm({
      slot_key: "",
      name: "",
      sizes: "728x90, 300x250",
      pages: activeTab === "all_pages" ? "all" : activeTab,
      is_active: true,
    });
    setShowSlotModal(true);
  };

  const handleOpenEditSlot = (slot) => {
    setEditingSlot(slot);
    setSlotForm({
      slot_key: slot.slot_key,
      name: slot.name,
      sizes: slot.sizes || "728x90, 300x250",
      pages: Array.isArray(slot.pages) ? slot.pages.join(", ") : slot.pages || "all",
      is_active: slot.is_active !== false,
    });
    setShowSlotModal(true);
  };

  // Save Slot
  const handleSaveSlot = async (e) => {
    e.preventDefault();
    if (!slotForm.name.trim()) {
      showToast("error", "Slot name is required.");
      return;
    }
    if (!editingSlot && !slotForm.slot_key.trim()) {
      showToast("error", "Slot key is required.");
      return;
    }

    setSavingAction(true);
    try {
      if (editingSlot) {
        const res = await fetch("/api/ads", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slot_key: editingSlot.slot_key,
            name: slotForm.name,
            sizes: slotForm.sizes,
            pages: slotForm.pages.split(",").map((p) => p.trim()),
            is_active: slotForm.is_active,
          }),
        });
        const data = await res.json();
        if (data.success) {
          showToast("success", "Slot settings updated!");
          setShowSlotModal(false);
          fetchAdsData();
        }
      } else {
        const res = await fetch("/api/ads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "create_slot",
            ...slotForm,
          }),
        });
        const data = await res.json();
        if (data.success) {
          showToast("success", "New slot registered!");
          setShowSlotModal(false);
          fetchAdsData();
        } else {
          showToast("error", data.error || "Failed to create slot");
        }
      }
    } catch (err) {
      showToast("error", "Network error saving slot");
    } finally {
      setSavingAction(false);
    }
  };

  // Toggle Slot Active / Disabled
  const handleToggleSlot = async (slot) => {
    const newActive = !slot.is_active;
    try {
      const res = await fetch("/api/ads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slot_key: slot.slot_key,
          is_active: newActive,
        }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", `Slot is now ${newActive ? "Active" : "Disabled"}`);
        fetchAdsData();
      }
    } catch (err) {
      showToast("error", "Failed to toggle slot");
    }
  };

  // Delete Slot (opens confirmation modal)
  const handleDeleteSlot = (slotKey) => {
    setDeletingTarget({ type: "slot", id: slotKey, label: `slot "${slotKey}" and all its creatives` });
  };

  const confirmDeleteTarget = async () => {
    if (!deletingTarget) return;
    setDeleting(true);
    try {
      const url =
        deletingTarget.type === "creative"
          ? `/api/ads?creative_id=${deletingTarget.id}`
          : `/api/ads?slot_key=${deletingTarget.id}`;
      const res = await fetch(url, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("success", deletingTarget.type === "creative" ? "Creative deleted." : "Slot deleted.");
        setDeletingTarget(null);
        fetchAdsData();
      } else {
        showToast("error", data.error || "Failed to delete");
      }
    } catch {
      showToast("error", "Failed to delete");
    } finally {
      setDeleting(false);
    }
  };

  // Filter slots for current tab
  const currentTabSlots = getTabSlots(activeTab);

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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Ads</h1>
          <p className="text-xs text-gray-500 mt-1">
            Ad slots are the placements the public site renders. Each slot rotates its creatives by weight.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => handleOpenAddCreative()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#124e2b] hover:bg-[#0a2618] rounded-lg shadow-sm transition-all"
          >
            <Plus size={14} />
            <span>Add creative</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddSlot}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 bg-white border border-[#e5e2da] hover:bg-gray-50 rounded-lg shadow-xs transition-colors"
          >
            <Plus size={14} />
            <span>New slot</span>
          </button>

          <button
            type="button"
            onClick={fetchAdsData}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-900 bg-white border border-[#e5e2da] rounded-lg hover:bg-gray-50 transition-colors shadow-xs"
            title="Refresh ads data"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-[#124e2b]" : ""} />
          </button>
        </div>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Slots */}
        <div className="bg-white border border-[#e5e2da] rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Slots</span>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalSlotsCount}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#f4f2ec] text-gray-700 flex items-center justify-center">
            <Layers size={18} />
          </div>
        </div>

        {/* Creatives */}
        <div className="bg-white border border-[#e5e2da] rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Creatives</span>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalCreativesCount}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-[#124e2b] flex items-center justify-center">
            <ImageIcon size={18} />
          </div>
        </div>

        {/* Impressions */}
        <div className="bg-white border border-[#e5e2da] rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Impressions</span>
            <p className="text-2xl font-bold text-gray-900 mt-1">{totalImpressions.toLocaleString()}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
            <Eye size={18} />
          </div>
        </div>

        {/* Clicks */}
        <div className="bg-white border border-[#e5e2da] rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Clicks</span>
            <p className="text-2xl font-bold text-[#124e2b] mt-1">{totalClicks.toLocaleString()}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center">
            <MousePointer size={18} />
          </div>
        </div>
      </div>

      {/* 4 Placement Category Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#e5e2da] pb-px">
        {[
          { key: "all_pages", label: "All pages (site-wide)", pages: "all" },
          { key: "home", label: "Home page", pages: "home" },
          { key: "section", label: "Section (category) pages", pages: "section" },
          { key: "story", label: "Story (article) pages", pages: "story" },
        ].map((tab) => {
          const tabSlots = getTabSlots(tab.key);
          const tabCreatives = creatives.filter((c) => tabSlots.some((s) => s.slot_key === c.slot_key));
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-2 ${
                isActive
                  ? "border-[#124e2b] text-[#124e2b] bg-white shadow-2xs"
                  : "border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                  isActive ? "bg-emerald-100 text-[#124e2b]" : "bg-gray-100 text-gray-600"
                }`}
              >
                {tabSlots.length} {tabSlots.length === 1 ? "slot" : "slots"} · {tabCreatives.length}
              </span>
            </button>
          );
        })}
      </div>

      {/* Slot Cards List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white border border-[#e5e2da] rounded-xl p-12 text-center text-gray-400 text-xs">
            <RefreshCw size={24} className="animate-spin mx-auto text-[#124e2b] mb-2" />
            Loading ad slots and placements...
          </div>
        ) : currentTabSlots.length === 0 ? (
          <div className="bg-white border border-dashed border-[#e5e2da] rounded-xl p-12 text-center text-gray-400 text-xs">
            <Megaphone size={32} className="mx-auto text-gray-300 mb-2" />
            <p className="font-semibold text-gray-600 text-sm">No slots found for this page category.</p>
            <p className="mt-1 text-gray-400">Click &quot;New slot&quot; above to create a placement for this tab.</p>
          </div>
        ) : (
          currentTabSlots.map((slot) => {
            const slotCreatives = creatives.filter((c) => c.slot_key === slot.slot_key);

            return (
              <div
                key={slot.slot_key}
                className="bg-white border border-[#e5e2da] rounded-xl p-5 shadow-sm space-y-4"
              >
                {/* Slot Card Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#f0ede6]">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <h3 className="text-base font-bold text-gray-900 tracking-tight">{slot.name}</h3>
                      <span className="font-mono text-[11px] bg-[#f0ede6] text-gray-700 px-2 py-0.5 rounded border border-[#e5e2da]">
                        {slot.slot_key}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          slot.is_active
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-gray-100 text-gray-600 border-gray-200"
                        }`}
                      >
                        {slot.is_active ? "Active" : "Disabled"}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-500">
                      {slot.sizes} · pages:{" "}
                      <span className="font-medium text-gray-700">
                        {Array.isArray(slot.pages) ? slot.pages.join(", ") : slot.pages}
                      </span>
                    </p>
                  </div>

                  {/* Slot Header Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleSlot(slot)}
                      className={`text-xs font-semibold px-3 py-1 rounded-md border transition-colors shadow-2xs ${
                        slot.is_active
                          ? "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                          : "bg-[#124e2b] text-white border-[#0a2618] hover:bg-[#0a2618]"
                      }`}
                    >
                      {slot.is_active ? "Disable" : "Enable"}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditSlot(slot)}
                      className="p-1.5 text-gray-400 hover:text-gray-800 rounded-md hover:bg-gray-100 transition-colors"
                      title="Edit slot details"
                    >
                      <Edit2 size={13} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteSlot(slot.slot_key)}
                      className="p-1.5 text-gray-400 hover:text-red-700 rounded-md hover:bg-red-50 transition-colors"
                      title="Delete slot"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Creatives List Inside Slot */}
                <div className="space-y-2.5">
                  {slotCreatives.length === 0 ? (
                    <div className="py-4 text-center text-xs text-gray-400 bg-[#faf9f6] rounded-lg border border-dashed border-[#e5e2da]">
                      <span>No creatives booked for this slot yet.</span>
                    </div>
                  ) : (
                    slotCreatives.map((creative) => {
                      const isRunning = creative.status === "run";

                      return (
                        <div
                          key={creative.id}
                          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 rounded-lg border border-[#e5e2da] bg-[#fcfbf9] hover:bg-white hover:shadow-xs transition-all"
                        >
                          {/* Creative Info & Artwork Preview */}
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Artwork Thumbnail / Fallback Badge */}
                            <div className="w-12 h-10 rounded bg-[#e8f1eb] border border-[#cbe1d2] text-[#124e2b] flex items-center justify-center shrink-0 font-bold text-xs uppercase overflow-hidden">
                              {creative.image_url ? (
                                <img
                                  src={creative.image_url}
                                  alt={creative.image_alt || creative.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span>AD</span>
                              )}
                            </div>

                            <div className="min-w-0 space-y-1">
                              <div className="flex flex-wrap items-center gap-2">
                                <h4 className="text-xs font-semibold text-gray-900 truncate max-w-[340px]">
                                  {creative.name}
                                </h4>

                                {/* Type Pill */}
                                <span
                                  className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${
                                    creative.type === "direct"
                                      ? "bg-blue-50 text-blue-800 border-blue-200"
                                      : "bg-purple-50 text-purple-800 border-purple-200"
                                  }`}
                                >
                                  {creative.type}
                                </span>

                                {/* Runs on Edition Pill */}
                                <span className="text-[10px] font-medium bg-gray-100 text-gray-700 px-1.5 py-0.2 rounded border border-gray-200">
                                  {creative.runs_on === "both"
                                    ? "Both editions"
                                    : creative.runs_on === "ur"
                                    ? "UR only"
                                    : "EN only"}
                                </span>

                                {/* Status Pill */}
                                <span
                                  className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${
                                    isRunning
                                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                      : "bg-gray-100 text-gray-600 border-gray-200"
                                  }`}
                                >
                                  {isRunning ? "run" : "pause"}
                                </span>
                              </div>

                              <p className="text-[11px] text-gray-500">
                                weight <strong className="text-gray-800">{creative.weight || 1}</strong> ·{" "}
                                <strong className="text-gray-800">
                                  {(creative.impressions || 0).toLocaleString()}
                                </strong>{" "}
                                impr ·{" "}
                                <strong className="text-[#124e2b]">
                                  {(creative.clicks || 0).toLocaleString()}
                                </strong>{" "}
                                clicks
                              </p>
                            </div>
                          </div>

                          {/* Creative Controls */}
                          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                            <button
                              type="button"
                              onClick={() => handleToggleCreative(creative)}
                              className={`text-xs font-semibold px-2.5 py-1 rounded border transition-colors shadow-2xs ${
                                isRunning
                                  ? "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                                  : "bg-[#124e2b] text-white border-[#0a2618] hover:bg-[#0a2618]"
                              }`}
                            >
                              {isRunning ? "Pause" : "Run"}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEditCreative(creative)}
                              className="p-1.5 text-gray-400 hover:text-gray-800 rounded hover:bg-gray-100 transition-colors"
                              title="Edit creative"
                            >
                              <Edit2 size={12} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteCreative(creative.id)}
                              className="p-1.5 text-gray-400 hover:text-red-700 rounded hover:bg-red-50 transition-colors"
                              title="Delete creative"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Slot Card Footer: Quick Add Creative */}
                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => handleOpenAddCreative(slot.slot_key)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#124e2b] hover:text-[#0a2618] transition-colors py-1 px-2 rounded hover:bg-[#e8f1eb]"
                  >
                    <Plus size={13} />
                    <span>+ Add creative to this slot</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: ADD / EDIT CREATIVE MODAL                      */}
      {/* ======================================================== */}
      {showCreativeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#e5e2da] rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e2da] bg-[#faf9f6]">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {editingCreative ? "Edit creative" : "Add creative"}
                </h3>
                <p className="text-[11px] text-gray-500">
                  Book an advertising artwork or custom tag into a site slot.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreativeModal(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveCreative} className="overflow-y-auto p-6 space-y-4">
              {/* Choose Page & Slot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Choose page *</label>
                  <select
                    value={creativeForm.page_type}
                    onChange={(e) => {
                      const newPage = e.target.value;
                      setCreativeForm({
                        ...creativeForm,
                        page_type: newPage,
                        slot_key: getTabSlots(newPage)[0]?.slot_key || slots[0]?.slot_key || "",
                      });
                    }}
                    className="w-full text-xs border border-[#e5e2da] rounded-lg p-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#124e2b]"
                  >
                    <option value="all_pages">All pages (site-wide)</option>
                    <option value="home">Home page</option>
                    <option value="section">Section pages</option>
                    <option value="story">Story pages</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Choose section *</label>
                  <select
                    value={creativeForm.slot_key}
                    onChange={(e) => setCreativeForm({ ...creativeForm, slot_key: e.target.value })}
                    className="w-full text-xs border border-[#e5e2da] rounded-lg p-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#124e2b]"
                  >
                    {slots.map((s) => (
                      <option key={s.slot_key} value={s.slot_key}>
                        {s.name} ({s.slot_key})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Creative Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Name *</label>
                <input
                  type="text"
                  required
                  value={creativeForm.name}
                  onChange={(e) => setCreativeForm({ ...creativeForm, name: e.target.value })}
                  placeholder="Spring campaign — banner"
                  className="w-full text-xs border border-[#e5e2da] rounded-lg p-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#124e2b]"
                />
              </div>

              {/* Type, Runs on & Weight */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Type</label>
                  <select
                    value={creativeForm.type}
                    onChange={(e) => setCreativeForm({ ...creativeForm, type: e.target.value })}
                    className="w-full text-xs border border-[#e5e2da] rounded-lg p-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#124e2b]"
                  >
                    <option value="direct">direct (Paid sponsor)</option>
                    <option value="house">house (Internal promo)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Runs on</label>
                  <select
                    value={creativeForm.runs_on}
                    onChange={(e) => setCreativeForm({ ...creativeForm, runs_on: e.target.value })}
                    className="w-full text-xs border border-[#e5e2da] rounded-lg p-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#124e2b]"
                  >
                    <option value="both">Both editions</option>
                    <option value="ur">Urdu only</option>
                    <option value="en">English only</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Weight</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={creativeForm.weight}
                    onChange={(e) => setCreativeForm({ ...creativeForm, weight: Number(e.target.value) })}
                    className="w-full text-xs border border-[#e5e2da] rounded-lg p-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#124e2b]"
                  />
                  <p className="text-[10px] text-gray-400">Higher = served more often</p>
                </div>
              </div>

              {/* Banner Image URL & Alt Text */}
              <div className="space-y-3 pt-2 border-t border-[#f0ede6]">
                <label className="text-xs font-semibold text-gray-700 flex items-center justify-between">
                  <span>Banner image & Artwork</span>
                  <span className="text-[11px] text-gray-400 font-normal">Direct image upload or URL</span>
                </label>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={creativeForm.image_url}
                      onChange={(e) => setCreativeForm({ ...creativeForm, image_url: e.target.value })}
                      placeholder="https://example.com/banner.webp or upload image"
                      className="flex-1 text-xs border border-[#e5e2da] rounded-lg p-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#124e2b]"
                    />
                    <label className="shrink-0 inline-flex items-center gap-1.5 px-3 py-2.5 rounded-lg bg-[#124e2b] hover:bg-[#0d3b20] text-white text-xs font-semibold cursor-pointer transition">
                      <Upload size={14} />
                      <span>{uploadingArtwork ? "Uploading..." : "Upload"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingArtwork}
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setUploadingArtwork(true);
                          try {
                            const fd = new FormData();
                            fd.append("file", file);
                            fd.append("folder", "ads");
                            const res = await fetch("/api/upload", { method: "POST", body: fd });
                            const data = await res.json();
                            if (res.ok && data.url) {
                              setCreativeForm((prev) => ({ ...prev, image_url: data.url }));
                              setToast({ type: "success", message: "Ad artwork uploaded!" });
                            } else {
                              setToast({ type: "error", message: data.error || "Upload failed" });
                            }
                          } catch {
                            setToast({ type: "error", message: "Network error uploading artwork" });
                          } finally {
                            setUploadingArtwork(false);
                            e.target.value = "";
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {creativeForm.image_url && (
                    <div className="relative rounded-lg border border-[#e5e2da] bg-[#f8f7f4] p-2 flex items-center justify-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={creativeForm.image_url}
                        alt={creativeForm.image_alt || "Ad banner preview"}
                        className="max-h-28 w-auto object-contain rounded"
                      />
                      <button
                        type="button"
                        onClick={() => setCreativeForm({ ...creativeForm, image_url: "" })}
                        title="Remove image"
                        className="absolute top-1.5 right-1.5 size-6 rounded-full bg-black/70 text-white hover:bg-red-600 flex items-center justify-center cursor-pointer"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )}

                  <input
                    type="text"
                    dir="rtl"
                    value={creativeForm.image_alt}
                    onChange={(e) => setCreativeForm({ ...creativeForm, image_alt: e.target.value })}
                    placeholder="متبادل متن (alt) — اختیاری"
                    className="w-full text-right font-nastaliq text-xs border border-[#e5e2da] rounded-lg p-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#124e2b]"
                  />
                </div>
                <p className="text-[10px] text-gray-400 leading-tight">
                  Upload or pick the ad artwork. The slot renders it as a full-bleed banner linking to the click URL below.
                </p>
              </div>

              {/* Custom HTML Code Snippet */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Creative HTML (Optional Tag)</label>
                <textarea
                  rows={2}
                  value={creativeForm.html_code}
                  onChange={(e) => setCreativeForm({ ...creativeForm, html_code: e.target.value })}
                  placeholder='<ins className="adsbygoogle" ...></ins>'
                  className="w-full font-mono text-[11px] border border-[#e5e2da] rounded-lg p-2 bg-[#faf9f6] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#124e2b]"
                />
                <p className="text-[10px] text-gray-400">
                  For Google AdSense or ad-network code. If both image and HTML are provided, the HTML wins.
                </p>
              </div>

              {/* Destination Click URL */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Click URL</label>
                <input
                  type="url"
                  value={creativeForm.click_url}
                  onChange={(e) => setCreativeForm({ ...creativeForm, click_url: e.target.value })}
                  placeholder="https://advertiser.example.com/"
                  className="w-full text-xs border border-[#e5e2da] rounded-lg p-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#124e2b]"
                />
                <p className="text-[10px] text-gray-400">Where the reader lands upon clicking the ad.</p>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-[#f0ede6]">
                <span className="text-xs font-semibold text-gray-700">Active status</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={creativeForm.is_active}
                    onChange={(e) => setCreativeForm({ ...creativeForm, is_active: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#124e2b]"></div>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f0ede6]">
                <button
                  type="button"
                  onClick={() => setShowCreativeModal(false)}
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
                  <span>{editingCreative ? "Save changes" : "Add creative"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: NEW / EDIT SLOT MODAL                          */}
      {/* ======================================================== */}
      {showSlotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#e5e2da] rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e2da] bg-[#faf9f6]">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {editingSlot ? "Edit slot" : "New slot"}
                </h3>
                <p className="text-[11px] text-gray-500">
                  A slot is a keyed placement. The public site renders it by key.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowSlotModal(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSlot} className="p-6 space-y-4">
              {/* Key */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Key *</label>
                <input
                  type="text"
                  required
                  disabled={!!editingSlot}
                  value={slotForm.slot_key}
                  onChange={(e) => setSlotForm({ ...slotForm, slot_key: e.target.value })}
                  placeholder="home-leaderboard"
                  className="w-full font-mono text-xs border border-[#e5e2da] rounded-lg p-2.5 bg-white disabled:bg-gray-100 disabled:text-gray-500 focus:outline-none focus:ring-1 focus:ring-[#124e2b]"
                />
                <p className="text-[10px] text-gray-400">
                  Lowercase, dashes only (e.g. home-leaderboard). Cannot change after create.
                </p>
              </div>

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Name *</label>
                <input
                  type="text"
                  required
                  value={slotForm.name}
                  onChange={(e) => setSlotForm({ ...slotForm, name: e.target.value })}
                  placeholder="Home · leaderboard (top)"
                  className="w-full text-xs border border-[#e5e2da] rounded-lg p-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#124e2b]"
                />
              </div>

              {/* Sizes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Sizes</label>
                <input
                  type="text"
                  value={slotForm.sizes}
                  onChange={(e) => setSlotForm({ ...slotForm, sizes: e.target.value })}
                  placeholder="728x90, 320x50"
                  className="w-full text-xs border border-[#e5e2da] rounded-lg p-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#124e2b]"
                />
                <p className="text-[10px] text-gray-400">Comma-separated WxH pairs, e.g. 728x90, 320x50</p>
              </div>

              {/* Pages */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Pages</label>
                <input
                  type="text"
                  value={slotForm.pages}
                  onChange={(e) => setSlotForm({ ...slotForm, pages: e.target.value })}
                  placeholder="home, section, story"
                  className="w-full text-xs border border-[#e5e2da] rounded-lg p-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#124e2b]"
                />
                <p className="text-[10px] text-gray-400">Comma-separated page keys (home, section, story). Empty = every page.</p>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center justify-between pt-2 border-t border-[#f0ede6]">
                <span className="text-xs font-semibold text-gray-700">Active status</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={slotForm.is_active}
                    onChange={(e) => setSlotForm({ ...slotForm, is_active: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#124e2b]"></div>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f0ede6]">
                <button
                  type="button"
                  onClick={() => setShowSlotModal(false)}
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
                  <span>{editingSlot ? "Save changes" : "Create slot"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Dialog */}
      {deletingTarget && (
        <div className="fixed inset-0 z-50 bg-black/55 flex items-center justify-center p-4">
          <div className="bg-white border border-[#e5e2da] w-full max-w-md shadow-2xl p-5 space-y-4 rounded-xl">
            <h3 className="text-sm font-bold text-[#18221b]">
              Delete {deletingTarget.type === "creative" ? "ad creative" : "ad slot"}?
            </h3>
            <p className="text-xs text-[#5c635b] leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-[#18221b]">{deletingTarget.label}</span>? This cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setDeletingTarget(null)}
                className="px-3.5 py-2 text-xs font-semibold border border-[#e5e2da] bg-white text-[#5c635b] rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={confirmDeleteTarget}
                className="px-4 py-2 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-60 cursor-pointer"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
