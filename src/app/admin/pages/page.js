"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { toPublicSiteUrl } from "@/lib/publicUrl";
import {
  Layers,
  PlusCircle,
  FileText,
  Search,
  Trash2,
  Edit2,
  ExternalLink,
  CheckCircle2,
  Globe,
  Calendar,
  X,
  Code,
  ShieldCheck,
} from "lucide-react";
import { useAdminLanguage } from "@/context/AdminLanguageContext";

export default function AdminPagesPage() {
  const { lang, t, dir } = useAdminLanguage();
  const isUrdu = lang === "ur";

  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  const [formData, setFormData] = useState({
    title_ur: "",
    title_en: "",
    slug: "",
    summary_ur: "",
    summary_en: "",
    content_ur: "",
    content_en: "",
    is_published: true,
  });

  async function loadPages() {
    setLoading(true);
    try {
      const res = await fetch("/api/pages");
      const data = await res.json();
      setPages(data.pages || []);
    } catch (e) {
      console.error("Load pages error:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPages();
  }, []);

  const showNotice = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(null), 3500);
  };

  const openNewModal = () => {
    setEditingPage(null);
    setFormData({
      title_ur: "",
      title_en: "",
      slug: "",
      summary_ur: "",
      summary_en: "",
      content_ur: "<p>یہاں صفحے کا تفصیلی متن درج کریں...</p>",
      content_en: "<p>Write detailed page content here...</p>",
      is_published: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (page) => {
    setEditingPage(page);
    setFormData({
      title_ur: page.title_ur || "",
      title_en: page.title_en || "",
      slug: page.slug || "",
      summary_ur: page.summary_ur || "",
      summary_en: page.summary_en || "",
      content_ur: page.content_ur || "",
      content_en: page.content_en || "",
      is_published: Boolean(page.is_published),
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.title_ur || !formData.slug) {
      alert(isUrdu ? "عنوان اور یو آر ایل س slug درج کرنا لازمی ہے۔" : "Title and Slug are required.");
      return;
    }

    setSaving(true);
    try {
      const url = editingPage ? `/api/pages/${editingPage.id}` : "/api/pages";
      const method = editingPage ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        showNotice(isUrdu ? "صفحہ کامیابی سے محفوظ ہو گیا!" : "Page saved and updated live!");
        setModalOpen(false);
        loadPages();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save page");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving page");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, slug) => {
    if (!confirm(isUrdu ? `کیا آپ واقعی '${slug}' صفحہ حذف کرنا چاہتے ہیں؟` : `Are you sure you want to delete '${slug}'?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/pages/${id}`, { method: "DELETE" });
      if (res.ok) {
        showNotice(isUrdu ? "صفحہ حذف کر دیا گیا" : "Page deleted successfully");
        loadPages();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = pages.filter((p) => {
    const s = search.toLowerCase();
    return (
      (p.title_ur || "").toLowerCase().includes(s) ||
      (p.title_en || "").toLowerCase().includes(s) ||
      (p.slug || "").toLowerCase().includes(s)
    );
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6" dir={dir}>
      
      {/* Top Banner */}
      <div className="bg-white border border-[#dcd8cd] rounded-none p-4 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase tracking-wider mb-1">
            <Layers size={15} />
            <span>{isUrdu ? "جامع صفحات کا انتظام" : "PAGE MANAGEMENT CMS"}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-gray-950 urdu-headline">
            {isUrdu ? "ویب سائٹ کے مستقل صفحات مینیجر" : "Website Pages & Content Manager"}
          </h1>
          <p className="text-xs text-gray-600 mt-1">
            {isUrdu
              ? "ہمارے بارے میں، ادارتی ضابطۂ اخلاق، پرائیویسی پالیسی اور کسٹم صفحات یہاں سے تخلیق، ترمیم اور شائع کریں۔"
              : "Create, edit, and publish static pages like About Us, Editorial Policy, Terms, and custom policy documents."}
          </p>
        </div>

        <button
          onClick={openNewModal}
          className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs px-4 py-2.5 rounded-none shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <PlusCircle size={15} />
          <span>{isUrdu ? "نیا صفحہ بنائیں" : "Create New Page"}</span>
        </button>
      </div>

      {/* Notification Banner */}
      {notice && (
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 px-4 py-2.5 rounded-none text-xs font-semibold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 size={16} className="text-emerald-700" />
          <span>{notice}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="bg-white border border-[#dcd8cd] rounded-none p-3.5 shadow-xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-[#f7f6f3] border border-[#dcd8cd] px-3 py-1.5 rounded-none w-full sm:w-80">
          <Search size={15} className="text-gray-400 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isUrdu ? "صفحات تلاش کریں..." : "Search pages by title or slug..."}
            className="w-full text-xs outline-none bg-transparent"
          />
        </div>
        <div className="text-xs font-mono text-gray-500">
          {filtered.length} {isUrdu ? "صفحات" : "pages"}
        </div>
      </div>

      {/* Pages Table */}
      <div className="bg-white border border-[#dcd8cd] rounded-none shadow-2xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-gray-500 font-sans">
            {isUrdu ? "صفحات لوڈ ہو رہے ہیں..." : "Loading pages..."}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-500">
            {isUrdu ? "کوئی صفحہ نہیں ملا۔" : "No pages found."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-700">
              <thead className="bg-[#f7f6f3] text-gray-900 border-b border-[#dcd8cd] font-bold">
                <tr>
                  <th className="p-3.5">ID / URL Slug</th>
                  <th className="p-3.5">{isUrdu ? "صفحے کا عنوان (اردو)" : "Urdu Title"}</th>
                  <th className="p-3.5">{isUrdu ? "انگریزی عنوان" : "English Title"}</th>
                  <th className="p-3.5">{isUrdu ? "حیثیت" : "Status"}</th>
                  <th className="p-3.5">{isUrdu ? "آخری تجدید" : "Last Updated"}</th>
                  <th className="p-3.5 text-right">{isUrdu ? "اقدامات" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eceae3]">
                {filtered.map((page) => (
                  <tr key={page.id} className="hover:bg-gray-50/70 transition">
                    <td className="p-3.5 font-mono text-emerald-800 font-bold">
                      <div className="flex items-center gap-1.5">
                        <FileText size={14} className="text-gray-400" />
                        <span>/p/{page.slug}</span>
                      </div>
                    </td>
                    <td className="p-3.5 font-bold text-gray-950 urdu-headline text-[13px]">
                      {page.title_ur}
                    </td>
                    <td className="p-3.5 font-medium text-gray-600 font-sans">
                      {page.title_en || "—"}
                    </td>
                    <td className="p-3.5">
                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-none font-bold text-[10px] font-sans">
                        PUBLISHED
                      </span>
                    </td>
                    <td className="p-3.5 text-gray-500 font-sans text-[11px]">
                      {page.updated_at
                        ? new Date(page.updated_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
                        : "Today"}
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={toPublicSiteUrl(`/p/${page.slug}`)}
                          target="_blank"
                          className="p-1.5 text-gray-600 hover:text-emerald-700 hover:bg-white rounded-none border border-transparent hover:border-[#dcd8cd]"
                          title="View Live Page"
                        >
                          <ExternalLink size={14} />
                        </Link>
                        <button
                          onClick={() => openEditModal(page)}
                          className="p-1.5 text-gray-600 hover:text-emerald-700 hover:bg-white rounded-none border border-transparent hover:border-[#dcd8cd]"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(page.id, page.slug)}
                          className="p-1.5 text-gray-400 hover:text-red-700 hover:bg-white rounded-none border border-transparent hover:border-red-200"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Page Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#dcd8cd] rounded-none max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-[#eceae3] pb-3">
              <h2 className="text-lg font-bold text-gray-950 urdu-headline flex items-center gap-2">
                <Layers size={18} className="text-emerald-700" />
                <span>{editingPage ? (isUrdu ? "صفحے میں ترمیم کریں" : "Edit Page") : (isUrdu ? "نیا صفحہ بنائیں" : "Create New Page")}</span>
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-700 p-1">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs font-sans">
              
              {/* Slug & Status Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-gray-800 mb-1">
                    {isUrdu ? "صفحے کا URL Slug (لازمی)" : "URL Slug (e.g. about-us, privacy-policy)"} *
                  </label>
                  <div className="flex items-center border border-[#dcd8cd] rounded-none bg-white">
                    <span className="bg-[#f7f6f3] text-gray-500 font-mono px-2.5 py-2 border-r border-[#dcd8cd] text-xs">
                      /p/
                    </span>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-"),
                        })
                      }
                      placeholder="about-us"
                      className="w-full p-2 text-xs font-mono outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">
                    {isUrdu ? "حیثیت (Status)" : "Publish Status"}
                  </label>
                  <select
                    value={formData.is_published ? "true" : "false"}
                    onChange={(e) => setFormData({ ...formData, is_published: e.target.value === "true" })}
                    className="w-full border border-[#dcd8cd] rounded-none p-2 text-xs outline-none bg-white font-sans"
                  >
                    <option value="true">{isUrdu ? "شائع شدہ (Live)" : "Published (Live)"}</option>
                    <option value="false">{isUrdu ? "ڈرافٹ (Draft)" : "Draft"}</option>
                  </select>
                </div>
              </div>

              {/* Titles Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">
                    {isUrdu ? "صفحے کا اردو عنوان (لازمی)" : "Urdu Headline"} *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title_ur}
                    onChange={(e) => setFormData({ ...formData, title_ur: e.target.value })}
                    placeholder="مثال: ہمارے بارے میں"
                    className="w-full border border-[#dcd8cd] rounded-none p-2.5 text-xs text-right font-urdu outline-none focus:border-emerald-700"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">
                    {isUrdu ? "انگریزی عنوان (اختیاری)" : "English Headline"}
                  </label>
                  <input
                    type="text"
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    placeholder="e.g. About Daily Afadiat"
                    className="w-full border border-[#dcd8cd] rounded-none p-2.5 text-xs outline-none font-sans focus:border-emerald-700"
                  />
                </div>
              </div>

              {/* Summary */}
              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  {isUrdu ? "مختصر خلاصہ / لیڈ تعارف" : "Short Excerpt / Lead Summary"}
                </label>
                <textarea
                  rows={2}
                  value={formData.summary_ur}
                  onChange={(e) => setFormData({ ...formData, summary_ur: e.target.value })}
                  placeholder="صفحے کا مختصر تعارف..."
                  className="w-full border border-[#dcd8cd] rounded-none p-2 text-xs text-right font-urdu outline-none"
                />
              </div>

              {/* Full Content (Urdu) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-bold text-gray-800">
                    {isUrdu ? "صفحے کا تفصیلی مواد (HTML / ٹیکسٹ)" : "Full Page Body Content (HTML or Plain Text)"} *
                  </label>
                  <span className="text-[10px] text-gray-500 font-mono">Supports &lt;p&gt;, &lt;h3&gt;, &lt;ul&gt;, &lt;strong&gt;</span>
                </div>
                <textarea
                  rows={8}
                  required
                  value={formData.content_ur}
                  onChange={(e) => setFormData({ ...formData, content_ur: e.target.value })}
                  placeholder="<p>تفصیلی مواد...</p>"
                  className="w-full border border-[#dcd8cd] rounded-none p-2.5 text-xs font-mono outline-none focus:border-emerald-700 leading-relaxed"
                />
              </div>

              {/* English Content (Optional) */}
              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  {isUrdu ? "انگریزی مواد (اختیاری)" : "English Content (Optional)"}
                </label>
                <textarea
                  rows={4}
                  value={formData.content_en}
                  onChange={(e) => setFormData({ ...formData, content_en: e.target.value })}
                  placeholder="<p>English content...</p>"
                  className="w-full border border-[#dcd8cd] rounded-none p-2.5 text-xs font-mono outline-none focus:border-emerald-700"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#eceae3]">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-[#dcd8cd] bg-white text-gray-700 font-bold hover:bg-gray-100 rounded-none transition"
                >
                  {isUrdu ? "منسوخ کریں" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-none shadow-xs transition"
                >
                  {saving ? (isUrdu ? "محفوظ ہو رہا ہے..." : "Saving...") : (isUrdu ? "صفحہ شائع کریں" : "Publish Page")}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
