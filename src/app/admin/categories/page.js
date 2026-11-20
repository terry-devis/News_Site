"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FolderTree,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  Search,
  ArrowRight,
  Info,
} from "lucide-react";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingAction, setSavingAction] = useState(false);
  const [toast, setToast] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [seoExpanded, setSeoExpanded] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name_en: "",
    name_ur: "",
    parent_id: "",
    slug: "",
    description_ur: "",
    description_en: "",
    layout: "Grid",
    sort_order: 0,
    show_in_header: true,
    show_in_mobile: true,
    show_in_footer: false,
    is_active: true,
    seo_title: "",
    meta_description: "",
    no_index: false,
  });

  const [searchFilter, setSearchFilter] = useState("");

  // Fetch categories
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (e) {
      console.error("Failed to load categories:", e);
      showToast("error", "Failed to load sections hierarchy");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  // Organize categories into hierarchical tree
  const hierarchicalCategories = useMemo(() => {
    const topLevel = categories.filter((c) => !c.parent_id);
    const result = [];

    topLevel.forEach((parent) => {
      result.push(parent);
      const children = categories.filter((c) => c.parent_id === parent.id);
      children.forEach((child) => {
        result.push(child);
      });
    });

    // Append any orphaned children if parent wasn't found
    categories.forEach((cat) => {
      if (!result.some((r) => r.id === cat.id)) {
        result.push(cat);
      }
    });

    if (searchFilter.trim()) {
      const query = searchFilter.toLowerCase();
      return result.filter(
        (c) =>
          c.name_en.toLowerCase().includes(query) ||
          c.name_ur.includes(query) ||
          c.slug.toLowerCase().includes(query)
      );
    }

    return result;
  }, [categories, searchFilter]);

  // Open Add Modal
  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setForm({
      name_en: "",
      name_ur: "",
      parent_id: "",
      slug: "",
      description_ur: "",
      description_en: "",
      layout: "Grid",
      sort_order: categories.length + 1,
      show_in_header: true,
      show_in_mobile: true,
      show_in_footer: false,
      is_active: true,
      seo_title: "",
      meta_description: "",
      no_index: false,
    });
    setSeoExpanded(false);
    setShowModal(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setForm({
      name_en: cat.name_en || "",
      name_ur: cat.name_ur || "",
      parent_id: cat.parent_id ? String(cat.parent_id) : "",
      slug: cat.slug || "",
      description_ur: cat.description_ur || "",
      description_en: cat.description_en || "",
      layout: cat.layout || "Grid",
      sort_order: cat.sort_order || 0,
      show_in_header: cat.show_in_header !== false,
      show_in_mobile: cat.show_in_mobile !== false,
      show_in_footer: Boolean(cat.show_in_footer),
      is_active: cat.is_active !== false,
      seo_title: cat.seo_title || "",
      meta_description: cat.meta_description || "",
      no_index: Boolean(cat.no_index),
    });
    setSeoExpanded(Boolean(cat.seo_title || cat.meta_description || cat.no_index));
    setShowModal(true);
  };

  // Auto-slug generation from English Name
  const handleNameEnChange = (e) => {
    const val = e.target.value;
    const generatedSlug = val.toLowerCase().trim().replace(/[^a-z0-9_-]/g, "-");
    setForm((prev) => ({
      ...prev,
      name_en: val,
      slug: prev.slug === "" || prev.slug === prev.name_en.toLowerCase().trim().replace(/[^a-z0-9_-]/g, "-") ? generatedSlug : prev.slug,
    }));
  };

  // Save / Update Category
  const handleSaveCategory = async (e) => {
    e.preventDefault();
    if (!form.name_en.trim() && !form.name_ur.trim()) {
      showToast("error", "Both English and Urdu names are recommended.");
      return;
    }

    setSavingAction(true);
    try {
      if (editingCategory) {
        const res = await fetch("/api/categories", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: editingCategory.id,
            ...form,
            parent_id: form.parent_id ? Number(form.parent_id) : null,
          }),
        });
        const data = await res.json();
        if (data.success) {
          showToast("success", "Section updated successfully!");
          setShowModal(false);
          fetchCategories();
        } else {
          showToast("error", data.error || "Failed to update section");
        }
      } else {
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...form,
            parent_id: form.parent_id ? Number(form.parent_id) : null,
          }),
        });
        const data = await res.json();
        if (data.success) {
          showToast("success", "New section registered!");
          setShowModal(false);
          fetchCategories();
        } else {
          showToast("error", data.error || "Failed to create section");
        }
      }
    } catch (err) {
      showToast("error", "Network error saving section");
    } finally {
      setSavingAction(false);
    }
  };

  // Delete Category
  const handleDeleteCategory = async (cat) => {
    if (cat.articles_count > 0) {
      alert(`Cannot delete section "${cat.name_en}" because it has ${cat.articles_count} published stories. Please reassign or delete the stories first.`);
      return;
    }
    if (!window.confirm(`Are you sure you want to delete section "${cat.name_en}"?`)) return;

    try {
      const res = await fetch(`/api/categories?id=${cat.id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        showToast("success", "Section deleted.");
        fetchCategories();
      }
    } catch (err) {
      showToast("error", "Failed to delete section");
    }
  };

  // Toggle Status directly
  const handleToggleActive = async (cat) => {
    const newActive = !cat.is_active;
    try {
      const res = await fetch("/api/categories", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cat.id, is_active: newActive }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("success", `Section "${cat.name_en}" is now ${newActive ? "Active" : "Inactive"}`);
        fetchCategories();
      }
    } catch (err) {
      showToast("error", "Failed to toggle status");
    }
  };

  // Available parent options (only top-level sections without parents)
  const availableParents = categories.filter(
    (c) => !c.parent_id && (!editingCategory || c.id !== editingCategory.id)
  );

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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Sections</h1>
          <p className="text-xs text-gray-500 mt-1">
            The section hierarchy — public URLs are built from these paths
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search sections..."
              className="text-xs border border-[#e5e2da] rounded-lg pl-8 pr-3 py-2 bg-white focus:outline-none focus:ring-1 focus:ring-[#124e2b] w-48 sm:w-56"
            />
            <Search size={13} className="absolute left-2.5 top-2.5 text-gray-400" />
          </div>

          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#124e2b] hover:bg-[#0a2618] rounded-lg shadow-sm transition-all shrink-0"
          >
            <Plus size={14} />
            <span>+ New section</span>
          </button>

          <button
            type="button"
            onClick={fetchCategories}
            disabled={loading}
            className="p-2 text-gray-500 hover:text-gray-900 bg-white border border-[#e5e2da] rounded-lg hover:bg-gray-50 transition-colors shadow-xs"
            title="Refresh sections"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-[#124e2b]" : ""} />
          </button>
        </div>
      </div>

      {/* Sections Taxonomy Table */}
      <div className="bg-white border border-[#e5e2da] rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#f7f5f0] border-b border-[#e5e2da] text-gray-600 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">NAME</th>
                <th className="py-3 px-4 text-right">URDU NAME</th>
                <th className="py-3 px-4">URL PATH</th>
                <th className="py-3 px-4 text-center">ARTICLES</th>
                <th className="py-3 px-4">MENU</th>
                <th className="py-3 px-4">STATUS</th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0ede6]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <RefreshCw size={20} className="animate-spin mx-auto text-[#124e2b] mb-2" />
                    Loading taxonomy tree...
                  </td>
                </tr>
              ) : hierarchicalCategories.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No sections found. Click &quot;+ New section&quot; above to create one.
                  </td>
                </tr>
              ) : (
                hierarchicalCategories.map((cat) => {
                  const isChild = Boolean(cat.parent_id);

                  return (
                    <tr
                      key={cat.id}
                      className={`hover:bg-[#faf9f6] transition-colors ${
                        isChild ? "bg-[#fdfcfb]" : "bg-white"
                      }`}
                    >
                      {/* Name (English) */}
                      <td className="py-3.5 px-4 font-medium text-gray-900 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {isChild && (
                            <span className="text-gray-400 font-mono text-sm ml-2 mr-1">└</span>
                          )}
                          <span className={isChild ? "text-gray-700 font-normal" : "font-bold text-gray-900"}>
                            {cat.name_en}
                          </span>
                        </div>
                      </td>

                      {/* Name (Urdu) */}
                      <td className="py-3.5 px-4 text-right font-nastaliq text-sm font-bold text-gray-900 whitespace-nowrap" dir="rtl">
                        {cat.name_ur}
                      </td>

                      {/* URL Path */}
                      <td className="py-3.5 px-4 font-mono text-[11px] text-gray-600 whitespace-nowrap">
                        <span className="bg-[#f2efe9] text-gray-800 px-2 py-0.5 rounded border border-[#e5e2da]">
                          {cat.url_path || `/${cat.slug}`}
                        </span>
                      </td>

                      {/* Articles Count */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#f0ede6] text-gray-800">
                          {cat.articles_count || 0}
                        </span>
                      </td>

                      {/* Menu Indicator */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {cat.show_in_header ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            In header
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      {/* Status Toggle Pill */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(cat)}
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-colors ${
                            cat.is_active
                              ? "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100"
                              : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                          }`}
                        >
                          {cat.is_active ? "Active" : "Inactive"}
                        </button>
                      </td>

                      {/* Row Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(cat)}
                            className="p-1.5 text-gray-500 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
                            title="Edit section"
                          >
                            <Edit2 size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            disabled={cat.articles_count > 0}
                            className={`p-1.5 rounded-md transition-colors ${
                              cat.articles_count > 0
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-gray-400 hover:text-red-700 hover:bg-red-50"
                            }`}
                            title={
                              cat.articles_count > 0
                                ? "Cannot delete section with active articles"
                                : "Delete section"
                            }
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* SEO & 301 Redirect Notice Callout */}
      <div className="flex items-start gap-3 p-4 bg-[#fbf9f4] border border-[#e8e4da] rounded-xl text-xs text-gray-600 leading-relaxed">
        <Info size={16} className="text-[#124e2b] shrink-0 mt-0.5" />
        <p>
          <strong>Note:</strong> changing a section&apos;s path automatically writes a 301 redirect from the old URL to the new one, so nothing already indexed by Google ever breaks.
        </p>
      </div>

      {/* ======================================================== */}
      {/* MODAL: NEW / EDIT SECTION MODAL                         */}
      {/* ======================================================== */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#e5e2da] rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#e5e2da] bg-[#faf9f6]">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {editingCategory ? "Edit section" : "New section"}
                </h3>
                <p className="text-[11px] text-gray-500">
                  Both editions read from this one row — one section, two labels.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-md"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleSaveCategory} className="overflow-y-auto p-6 space-y-4">
              {/* English & Urdu Name Pair */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Name (English) *</label>
                  <input
                    type="text"
                    required
                    value={form.name_en}
                    onChange={handleNameEnChange}
                    placeholder="Sports"
                    className="w-full text-xs border border-[#e5e2da] rounded-lg p-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#124e2b]"
                  />
                  <p className="text-[10px] text-gray-400">Also used to generate the URL slug</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 flex items-center justify-between">
                    <span>Name (Urdu) *</span>
                    <span className="font-nastaliq text-emerald-800 text-[10px]">اردو نام</span>
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    required
                    value={form.name_ur}
                    onChange={(e) => setForm({ ...form, name_ur: e.target.value })}
                    placeholder="کھیل"
                    className="w-full text-right font-nastaliq text-xs border border-[#e5e2da] rounded-lg p-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#124e2b]"
                  />
                </div>
              </div>

              {/* Parent Section & Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Parent section</label>
                  <select
                    value={form.parent_id}
                    onChange={(e) => setForm({ ...form, parent_id: e.target.value })}
                    className="w-full text-xs border border-[#e5e2da] rounded-lg p-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#124e2b]"
                  >
                    <option value="">— None (top level) —</option>
                    {availableParents.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name_en} ({p.name_ur})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-gray-400">Leave empty for a top-level section</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Slug</label>
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="sports"
                    className="w-full font-mono text-xs border border-[#e5e2da] rounded-lg p-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#124e2b]"
                  />
                  <p className="text-[10px] text-gray-400">Leave blank to generate it from the English name</p>
                </div>
              </div>

              {/* Descriptions (Urdu & English) */}
              <div className="space-y-3 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700 flex items-center justify-between">
                    <span>Description (Urdu)</span>
                    <span className="font-nastaliq text-emerald-800 text-[10px]">سیکشن کی وضاحت</span>
                  </label>
                  <textarea
                    dir="rtl"
                    rows={2}
                    value={form.description_ur}
                    onChange={(e) => setForm({ ...form, description_ur: e.target.value })}
                    placeholder="سیکشن کے تحت شائع ہونے والی خبروں کی مختصر تفصیل..."
                    className="w-full text-right font-nastaliq text-xs border border-[#e5e2da] rounded-lg p-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#124e2b] resize-none leading-relaxed"
                  />
                  <p className="text-[10px] text-gray-400">Shown under the heading on the section page</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Description (English)</label>
                  <textarea
                    rows={2}
                    value={form.description_en}
                    onChange={(e) => setForm({ ...form, description_en: e.target.value })}
                    placeholder="Brief description of stories published in this section..."
                    className="w-full text-xs border border-[#e5e2da] rounded-lg p-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#124e2b] resize-none"
                  />
                  <p className="text-[10px] text-gray-400">Blank falls back to the Urdu one</p>
                </div>
              </div>

              {/* Layout & Sort Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Section page layout</label>
                  <select
                    value={form.layout}
                    onChange={(e) => setForm({ ...form, layout: e.target.value })}
                    className="w-full text-xs border border-[#e5e2da] rounded-lg p-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#124e2b]"
                  >
                    <option value="Grid">Grid</option>
                    <option value="Magazine">Magazine</option>
                    <option value="Standard">Standard List</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-700">Sort order</label>
                  <input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                    className="w-full text-xs border border-[#e5e2da] rounded-lg p-2.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#124e2b]"
                  />
                  <p className="text-[10px] text-gray-400">Lower numbers appear first in the menu</p>
                </div>
              </div>

              {/* Visibility Switches */}
              <div className="space-y-2.5 pt-3 border-t border-[#f0ede6]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700">Show in the header menu</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.show_in_header}
                      onChange={(e) => setForm({ ...form, show_in_header: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#124e2b]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700">Show in the mobile menu</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.show_in_mobile}
                      onChange={(e) => setForm({ ...form, show_in_mobile: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#124e2b]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700">Show in the footer</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.show_in_footer}
                      onChange={(e) => setForm({ ...form, show_in_footer: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#124e2b]"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-xs font-semibold text-gray-700">Active</span>
                    <p className="text-[10px] text-gray-400">
                      Inactive sections disappear from the site but keep their articles
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#124e2b]"></div>
                  </label>
                </div>
              </div>

              {/* Collapsible SEO Overrides Accordion */}
              <div className="border border-[#e5e2da] rounded-lg overflow-hidden mt-2">
                <button
                  type="button"
                  onClick={() => setSeoExpanded(!seoExpanded)}
                  className="w-full flex items-center justify-between p-3 bg-[#faf9f6] text-xs font-semibold text-gray-700 hover:bg-[#f5f2ea] transition-colors"
                >
                  <span>SEO Overrides</span>
                  {seoExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                </button>

                {seoExpanded && (
                  <div className="p-3 bg-white space-y-3 border-t border-[#e5e2da]">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-gray-700">SEO title</label>
                      <input
                        type="text"
                        value={form.seo_title}
                        onChange={(e) => setForm({ ...form, seo_title: e.target.value })}
                        placeholder="Urdu — the English edition uses the English name instead"
                        className="w-full text-xs border border-[#e5e2da] rounded p-2 focus:outline-none focus:ring-1 focus:ring-[#124e2b]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-gray-700">Meta description</label>
                      <textarea
                        rows={2}
                        value={form.meta_description}
                        onChange={(e) => setForm({ ...form, meta_description: e.target.value })}
                        placeholder="Urdu — up to 320 characters"
                        className="w-full text-xs border border-[#e5e2da] rounded p-2 focus:outline-none focus:ring-1 focus:ring-[#124e2b] resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="no_index_checkbox"
                        checked={form.no_index}
                        onChange={(e) => setForm({ ...form, no_index: e.target.checked })}
                        className="rounded border-gray-300 text-[#124e2b] focus:ring-[#124e2b]"
                      />
                      <label htmlFor="no_index_checkbox" className="text-xs text-gray-700 cursor-pointer">
                        Keep out of search engines (<code className="text-[11px]">noindex</code> tag)
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#f0ede6]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
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
                  <span>{editingCategory ? "Save changes" : "Create section"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
