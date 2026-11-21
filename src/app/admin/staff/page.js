"use client";

import React, { useState, useEffect, useRef } from "react";
import { toPublicSiteUrl } from "@/lib/publicUrl";
import {
  Users,
  Plus,
  Edit3,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Building2,
  Upload,
  Check,
  X,
  RefreshCw,
  ExternalLink,
  Search,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  GripVertical,
} from "lucide-react";

const EMPTY_FORM = {
  id: null,
  name_ur: "",
  name_en: "",
  designation_ur: "",
  designation_en: "",
  department_ur: "",
  department_en: "",
  city_ur: "",
  city_en: "",
  phone: "",
  email: "",
  image_url: "",
  bio_ur: "",
  bio_en: "",
  display_order: 1,
  is_active: true,
};

export default function AdminStaffPage() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);

  // Create / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  // Delete confirm
  const [deletingId, setDeletingId] = useState(null);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/staff?all=1", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data.staff)) {
        setStaff(data.staff);
      }
    } catch {
      showToast("error", "Failed to load staff directory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const openCreateModal = () => {
    setForm({
      ...EMPTY_FORM,
      display_order: staff.length + 1,
    });
    setModalOpen(true);
  };

  const openEditModal = (member) => {
    setForm({
      id: member.id,
      name_ur: member.name_ur || "",
      name_en: member.name_en || "",
      designation_ur: member.designation_ur || "",
      designation_en: member.designation_en || "",
      department_ur: member.department_ur || "",
      department_en: member.department_en || "",
      city_ur: member.city_ur || "",
      city_en: member.city_en || "",
      phone: member.phone || "",
      email: member.email || "",
      image_url: member.image_url || "",
      bio_ur: member.bio_ur || "",
      bio_en: member.bio_en || "",
      display_order: Number(member.display_order) || 1,
      is_active: member.is_active !== false,
    });
    setModalOpen(true);
  };

  const handleUploadAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        setForm((prev) => ({ ...prev, image_url: data.url }));
        showToast("success", "Staff photo uploaded!");
      } else {
        showToast("error", data.error || "Failed to upload photo");
      }
    } catch {
      showToast("error", "Failed to upload photo");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSaveStaff = async (e) => {
    e.preventDefault();
    if (!form.name_ur.trim() && !form.name_en.trim()) {
      showToast("error", "Please enter staff name in Urdu or English");
      return;
    }
    setSaving(true);
    try {
      const isEdit = Boolean(form.id);
      const res = await fetch("/api/staff", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(
          "success",
          isEdit ? "Staff member updated!" : "New staff member added!"
        );
        setModalOpen(false);
        await fetchStaff();
      } else {
        showToast("error", data.error || "Failed to save staff member");
      }
    } catch {
      showToast("error", "Error saving staff member");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (member) => {
    const nextActive = member.is_active === false;
    setStaff((prev) =>
      prev.map((m) => (m.id === member.id ? { ...m, is_active: nextActive } : m))
    );
    try {
      await fetch("/api/staff", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: member.id, is_active: nextActive }),
      });
      showToast(
        "success",
        nextActive ? "Shown on public /staff page" : "Hidden from public /staff page"
      );
    } catch {
      showToast("error", "Failed to update visibility");
    }
  };

  const [dragId, setDragId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  const persistOrder = async (next) => {
    const prev = staff;
    setStaff(next.map((m, i) => ({ ...m, display_order: i + 1 })));
    try {
      const res = await fetch("/api/staff", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reorder", ids: next.map((m) => m.id) }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error();
      showToast("success", "Order saved — public /staff page updated");
    } catch {
      setStaff(prev);
      showToast("error", "Failed to save order");
    }
  };

  const moveMember = (id, delta) => {
    const idx = staff.findIndex((m) => m.id === id);
    const to = idx + delta;
    if (idx < 0 || to < 0 || to >= staff.length) return;
    const next = [...staff];
    const [item] = next.splice(idx, 1);
    next.splice(to, 0, item);
    persistOrder(next);
  };

  const moveMemberTo = (id, position) => {
    const idx = staff.findIndex((m) => m.id === id);
    const to = Math.min(Math.max(position, 1), staff.length) - 1;
    if (idx < 0 || idx === to) return;
    const next = [...staff];
    const [item] = next.splice(idx, 1);
    next.splice(to, 0, item);
    persistOrder(next);
  };

  const handleDropOn = (targetId) => {
    if (!dragId || dragId === targetId) return;
    const from = staff.findIndex((m) => m.id === dragId);
    const to = staff.findIndex((m) => m.id === targetId);
    if (from < 0 || to < 0) return;
    const next = [...staff];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    setDragId(null);
    setDragOverId(null);
    persistOrder(next);
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/staff?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStaff((prev) => prev.filter((m) => m.id !== id));
        setDeletingId(null);
        showToast("success", "Staff member removed.");
      } else {
        showToast("error", data.error || "Failed to delete");
      }
    } catch {
      showToast("error", "Failed to delete");
    }
  };

  const isSearching = Boolean(searchQuery.trim());
  const filtered = staff.filter((m) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (m.name_ur || "").toLowerCase().includes(q) ||
      (m.name_en || "").toLowerCase().includes(q) ||
      (m.designation_ur || "").toLowerCase().includes(q) ||
      (m.designation_en || "").toLowerCase().includes(q) ||
      (m.phone || "").toLowerCase().includes(q) ||
      (m.email || "").toLowerCase().includes(q) ||
      (m.city_en || "").toLowerCase().includes(q) ||
      (m.city_ur || "").toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-20">
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-lg shadow-xl border text-xs font-semibold ${
            toast.type === "success"
              ? "bg-[#0a2618] text-white border-emerald-700"
              : "bg-red-950 text-white border-red-700"
          }`}
        >
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Public Staff Directory</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage editorial board, bureau chiefs, reporters & staff displayed on the public{" "}
            <span className="font-mono text-gray-700">/staff</span> page.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <a
            href={toPublicSiteUrl("/staff")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold border border-[#e5e2da] bg-white hover:border-[#124e2b] hover:text-[#124e2b] px-3 py-2 rounded-lg transition shadow-xs"
          >
            <span>View Public /staff</span>
            <ExternalLink size={13} />
          </a>

          <button
            type="button"
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 py-2 px-4 bg-[#124e2b] hover:bg-[#0a2618] text-white text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Staff Member</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-[#e5e2da] rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-2xs">
        <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          STAFF MEMBERS ({filtered.length})
        </div>
        <div className="relative w-full sm:w-72">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search name, designation, email, phone..."
            className="w-full pl-8 pr-3 py-2 text-xs border border-[#e5e2da] rounded-lg bg-[#f9f8f5] focus:bg-white focus:outline-none focus:border-[#124e2b]"
          />
        </div>
      </div>

      <p className="text-[11px] text-gray-500 -mt-3">
        {isSearching
          ? "Clear the search box to rearrange staff."
          : "Arrange the order shown on the public /staff page: drag a card, use the arrows, or pick a position."}
      </p>

      {/* Staff List */}
      {loading ? (
        <div className="bg-white border border-[#e5e2da] rounded-xl p-12 text-center text-xs text-gray-400">
          <RefreshCw size={22} className="animate-spin mx-auto text-[#124e2b] mb-2" />
          Loading staff directory...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-dashed border-[#e5e2da] rounded-xl p-12 text-center text-xs text-gray-400 space-y-2">
          <Users size={28} className="mx-auto text-gray-300" />
          <p className="font-semibold text-gray-700 text-sm">No staff members found</p>
          <button
            type="button"
            onClick={openCreateModal}
            className="mt-1 inline-flex items-center gap-1.5 py-2 px-4 bg-[#124e2b] text-white text-xs font-semibold rounded-lg cursor-pointer"
          >
            <Plus size={13} />
            <span>Add First Staff Member</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((member) => {
            const initial = (member.name_en || member.name_ur || "S")
              .trim()
              .charAt(0)
              .toUpperCase();
            return (
              <div
                key={member.id}
                draggable={!isSearching}
                onDragStart={() => setDragId(member.id)}
                onDragOver={(e) => {
                  if (dragId) {
                    e.preventDefault();
                    setDragOverId(member.id);
                  }
                }}
                onDragLeave={() => setDragOverId(null)}
                onDrop={() => handleDropOn(member.id)}
                onDragEnd={() => {
                  setDragId(null);
                  setDragOverId(null);
                }}
                className={`bg-white border rounded-xl p-4 shadow-2xs flex flex-col justify-between gap-4 transition ${
                  member.is_active === false
                    ? "border-gray-200 opacity-65"
                    : "border-[#e5e2da]"
                } ${dragId === member.id ? "opacity-40" : ""} ${
                  dragOverId === member.id && dragId !== member.id
                    ? "ring-2 ring-[#124e2b]"
                    : ""
                }`}
              >
                <div className="flex items-start gap-3.5">
                  {member.image_url ? (
                    <img
                      src={member.image_url}
                      alt={member.name_en || member.name_ur}
                      className="w-16 h-16 rounded-xl object-cover border border-[#e5e2da] shrink-0 bg-gray-100"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-[#0d542f] text-white flex items-center justify-center text-xl font-black shrink-0">
                      {initial}
                    </div>
                  )}

                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-sm font-bold text-gray-900 truncate">
                        {member.name_en || member.name_ur}
                        {member.name_ur && member.name_en && (
                          <span className="ml-2 font-nastaliq text-gray-600 font-normal">
                            ({member.name_ur})
                          </span>
                        )}
                      </h3>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded border shrink-0 ${
                          member.is_active !== false
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-gray-100 text-gray-500 border-gray-200"
                        }`}
                      >
                        {member.is_active !== false ? "Visible" : "Hidden"}
                      </span>
                    </div>

                    <p className="text-xs font-semibold text-[#124e2b]">
                      {member.designation_en || member.designation_ur}
                      {member.designation_ur &&
                        member.designation_en &&
                        member.designation_ur !== member.designation_en && (
                          <span className="ml-1.5 font-nastaliq text-gray-600">
                            · {member.designation_ur}
                          </span>
                        )}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500 pt-0.5">
                      {(member.department_en || member.department_ur) && (
                        <span className="inline-flex items-center gap-1">
                          <Building2 size={11} />
                          <span>{member.department_en || member.department_ur}</span>
                        </span>
                      )}
                      {(member.city_en || member.city_ur) && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin size={11} />
                          <span>{member.city_en || member.city_ur}</span>
                        </span>
                      )}
                      {member.phone && (
                        <span className="inline-flex items-center gap-1 font-mono">
                          <Phone size={11} />
                          <span>{member.phone}</span>
                        </span>
                      )}
                      {member.email && (
                        <span className="inline-flex items-center gap-1 font-mono truncate">
                          <Mail size={11} />
                          <span className="truncate">{member.email}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-[#f0ede6] text-xs">
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
                    <GripVertical
                      size={14}
                      className={isSearching ? "text-gray-200" : "text-gray-400 cursor-grab"}
                    />
                    <button
                      type="button"
                      disabled={isSearching || staff.findIndex((m) => m.id === member.id) === 0}
                      onClick={() => moveMember(member.id, -1)}
                      title="Move up"
                      className="p-1 border border-[#e5e2da] rounded-md hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ArrowUp size={12} />
                    </button>
                    <button
                      type="button"
                      disabled={
                        isSearching ||
                        staff.findIndex((m) => m.id === member.id) === staff.length - 1
                      }
                      onClick={() => moveMember(member.id, 1)}
                      title="Move down"
                      className="p-1 border border-[#e5e2da] rounded-md hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ArrowDown size={12} />
                    </button>
                    <span>Position</span>
                    <select
                      disabled={isSearching}
                      value={staff.findIndex((m) => m.id === member.id) + 1}
                      onChange={(e) => moveMemberTo(member.id, Number(e.target.value))}
                      className="border border-[#e5e2da] rounded-md px-1.5 py-0.5 bg-white text-[11px] font-semibold disabled:opacity-40 cursor-pointer"
                    >
                      {staff.map((_, i) => (
                        <option key={i} value={i + 1}>
                          #{i + 1}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(member)}
                      className="px-2.5 py-1 border border-[#e5e2da] rounded-md text-gray-700 hover:bg-gray-50 inline-flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      {member.is_active !== false ? (
                        <>
                          <EyeOff size={12} />
                          <span>Hide</span>
                        </>
                      ) : (
                        <>
                          <Eye size={12} />
                          <span>Show</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditModal(member)}
                      className="px-2.5 py-1 border border-[#e5e2da] rounded-md text-gray-700 hover:bg-gray-50 inline-flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Edit3 size={12} />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeletingId(member.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition cursor-pointer"
                      title="Delete staff member"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Staff Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setModalOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#e5e2da] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-5"
          >
            <div className="flex items-center justify-between border-b border-[#f0ede6] pb-3">
              <h2 className="text-base font-bold text-gray-900">
                {form.id ? "Edit Staff Member" : "Add Staff Member"}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-800 rounded-md cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-4">
              {/* Profile Photo Upload */}
              <div className="flex items-center gap-4 bg-[#f9f8f5] p-3.5 rounded-xl border border-[#e5e2da]">
                {form.image_url ? (
                  <img
                    src={form.image_url}
                    alt="Staff preview"
                    className="w-16 h-16 rounded-xl object-cover border border-[#e5e2da] bg-white shrink-0"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-[#0d542f] text-white flex items-center justify-center text-xl font-black shrink-0">
                    {(form.name_en || form.name_ur || "S").charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex-1 space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 block">
                    Staff Photo / Image
                  </label>
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleUploadAvatar}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={uploadingImage}
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#e5e2da] hover:border-[#124e2b] rounded-lg text-xs font-semibold text-gray-800 cursor-pointer"
                    >
                      <Upload size={12} />
                      <span>{uploadingImage ? "Uploading..." : "Upload Photo"}</span>
                    </button>
                    <input
                      type="text"
                      value={form.image_url}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, image_url: e.target.value }))
                      }
                      placeholder="Or paste image URL..."
                      className="flex-1 min-w-[180px] text-xs border border-[#e5e2da] rounded-lg px-2.5 py-1.5 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Name (Urdu & English) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">
                    Full Name (Urdu) *
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={form.name_ur}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, name_ur: e.target.value }))
                    }
                    placeholder="مثلاً ارشد ندیم"
                    className="w-full text-right font-nastaliq text-sm leading-loose border border-[#e5e2da] rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-[#124e2b]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">
                    Full Name (English) *
                  </label>
                  <input
                    type="text"
                    value={form.name_en}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, name_en: e.target.value }))
                    }
                    placeholder="e.g. Arshad Nadeem"
                    className="w-full text-xs border border-[#e5e2da] rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:border-[#124e2b]"
                  />
                </div>
              </div>

              {/* Designation (Urdu & English) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">
                    Designation (Urdu) *
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={form.designation_ur}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, designation_ur: e.target.value }))
                    }
                    placeholder="مثلاً چیف ایڈیٹر / بیورو چیف"
                    className="w-full text-right font-nastaliq text-sm leading-loose border border-[#e5e2da] rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-[#124e2b]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">
                    Designation (English)
                  </label>
                  <input
                    type="text"
                    value={form.designation_en}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, designation_en: e.target.value }))
                    }
                    placeholder="e.g. Editor-in-Chief / Bureau Chief"
                    className="w-full text-xs border border-[#e5e2da] rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:border-[#124e2b]"
                  />
                </div>
              </div>

              {/* Contact No & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">
                    Contact Number (Phone / WhatsApp)
                  </label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    placeholder="e.g. +92 300 1234567"
                    className="w-full text-xs font-mono border border-[#e5e2da] rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:border-[#124e2b]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                    placeholder="e.g. reporter@dailyafadiat.com"
                    className="w-full text-xs font-mono border border-[#e5e2da] rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:border-[#124e2b]"
                  />
                </div>
              </div>

              {/* Department & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">
                    Department / Desk (Urdu & English)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      dir="rtl"
                      value={form.department_ur}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, department_ur: e.target.value }))
                      }
                      placeholder="ادارتی بورڈ"
                      className="w-full text-right font-nastaliq text-xs border border-[#e5e2da] rounded-lg px-2.5 py-2 bg-white"
                    />
                    <input
                      type="text"
                      value={form.department_en}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, department_en: e.target.value }))
                      }
                      placeholder="Editorial Board"
                      className="w-full text-xs border border-[#e5e2da] rounded-lg px-2.5 py-2 bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">
                    City / Bureau (Urdu & English)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      dir="rtl"
                      value={form.city_ur}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, city_ur: e.target.value }))
                      }
                      placeholder="اسلام آباد"
                      className="w-full text-right font-nastaliq text-xs border border-[#e5e2da] rounded-lg px-2.5 py-2 bg-white"
                    />
                    <input
                      type="text"
                      value={form.city_en}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, city_en: e.target.value }))
                      }
                      placeholder="Islamabad"
                      className="w-full text-xs border border-[#e5e2da] rounded-lg px-2.5 py-2 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Bio (Urdu & English) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">
                    Short Bio (Urdu)
                  </label>
                  <textarea
                    rows={2}
                    dir="rtl"
                    value={form.bio_ur}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, bio_ur: e.target.value }))
                    }
                    placeholder="مختصر تعارف..."
                    className="w-full text-right font-nastaliq text-xs leading-loose border border-[#e5e2da] rounded-lg p-2.5 bg-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">
                    Short Bio (English)
                  </label>
                  <textarea
                    rows={2}
                    value={form.bio_en}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, bio_en: e.target.value }))
                    }
                    placeholder="Brief description of role..."
                    className="w-full text-xs border border-[#e5e2da] rounded-lg p-2.5 bg-white"
                  />
                </div>
              </div>

              {/* Display Order & Active Toggle */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#f0ede6]">
                <div className="flex items-center gap-3">
                  <label className="text-xs font-semibold text-gray-700">
                    Display Order:
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={form.display_order}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        display_order: Number(e.target.value) || 1,
                      }))
                    }
                    className="w-20 text-xs border border-[#e5e2da] rounded-lg px-2.5 py-1.5 bg-white"
                  />
                  <label className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 cursor-pointer ml-2">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, is_active: e.target.checked }))
                      }
                      className="rounded border-gray-300 text-[#124e2b] focus:ring-[#124e2b]"
                    />
                    <span>Show on public /staff page</span>
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 border border-[#e5e2da] rounded-lg hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 text-xs font-semibold text-white bg-[#124e2b] hover:bg-[#0a2618] rounded-lg shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? "Saving..." : form.id ? "Save Changes" : "Add Staff Member"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setDeletingId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white border border-[#e5e2da] rounded-xl max-w-sm w-full p-5 shadow-2xl space-y-4"
          >
            <h3 className="text-sm font-bold text-gray-900">Remove Staff Member?</h3>
            <p className="text-xs text-gray-600">
              This will remove the staff member from the public{" "}
              <span className="font-mono">/staff</span> directory.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-gray-600 border border-[#e5e2da] rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deletingId)}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
