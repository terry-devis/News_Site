"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Mail,
  MailOpen,
  Star,
  Trash2,
  RefreshCw,
  Search,
  ExternalLink,
  Reply,
  CheckCircle2,
  AlertCircle,
  Phone,
  Clock,
  User,
  Filter,
  X,
  Send,
  Tag,
} from "lucide-react";

const INITIAL_DEMO_INQUIRIES = [
  {
    id: 201,
    name: "طارق سلیم ایڈورٹائزنگ بیورو",
    email: "tariq.ads@medianet.pk",
    phone: "+92 300 1234567",
    category: "advertising",
    subject: "سرورق ٹاپ بینر اور ای پیپر اسپانسرشپ کی تفصیلات درکار ہیں",
    message: "محترم ایڈیٹر و ایڈورٹائزنگ ٹیم، ہم ڈیلی افادیت کی ویب سائٹ کے ہوم پیج ٹاپ بینر (728x90) اور ای پیپر فرنٹ پیج کے لیے سہ ماہی اسپانسرشپ پیکیج حاصل کرنا چاہتے ہیں۔ ازراہ کرم اپنے مصدقہ ریٹ کارڈ اور متوقع امپریشنز کی تفصیلات ارسال فرمائیں۔ شکریہ۔",
    is_read: false,
    is_starred: true,
    created_at: "2026-11-20T06:30:00Z",
  },
  {
    id: 202,
    name: "Zainab Haroon",
    email: "zainab.h@techtimes.com",
    phone: "+92 321 9876543",
    category: "editorial",
    subject: "News Tip: Islamabad National AI Center Inauguration",
    message: "Hello Editorial Desk, The Ministry of IT is scheduled to officially launch the National Artificial Intelligence Research Cluster in Islamabad next Tuesday. Key international AI delegates and policy makers will be present. I can provide the official press invite and agenda documents.",
    is_read: false,
    is_starred: false,
    created_at: "2026-11-20T05:45:00Z",
  },
  {
    id: 203,
    name: "سید راشد علی",
    email: "rashid.ali@edu.pk",
    phone: "+92 333 4567890",
    category: "general",
    subject: "ای پیپر ڈاؤنلوڈ اور زومنگ فیچر کے حوالے سے تجویز",
    message: "السلام علیکم، ڈیلی افادیت کا نیا ڈیزائن نہایت خوبصورت اور آنکھوں کو بھانے والا ہے۔ ای پیپر سیکشن میں اگر پی ڈی ایف ہائی ریزولوشن ڈائریکٹ ڈاؤنلوڈ کا بٹن شامل کر دیا جائے تو قارئین کے لیے مزید آسانی ہو جائے گی۔ آپ کی صحافتی خدمات کو سراہتے ہیں۔",
    is_read: true,
    is_starred: false,
    created_at: "2026-11-20T04:10:00Z",
  },
  {
    id: 204,
    name: "Apex Brand Marketing Group",
    email: "campaigns@apexmarketing.ae",
    phone: "+971 4 398 7654",
    category: "advertising",
    subject: "Infeed Sponsored Op-Ed and Digital Brand Partnership",
    message: "Dear Daily Afadiat commercial team, We represent a leading fintech brand looking to publish a bilingual thought-leadership article series on the Pakistani digital banking landscape. Please share editorial guidelines for branded content and rates.",
    is_read: true,
    is_starred: true,
    created_at: "2026-11-19T18:20:00Z",
  },
  {
    id: 205,
    name: "شاہد منیر ایڈووکیٹ",
    email: "shahid.munir.law@gmail.com",
    phone: "+92 345 6789012",
    category: "editorial",
    subject: "عدالتی فیصلے کے حوالے سے قانونی وضاحتی نوٹ",
    message: "جناب ایڈیٹر صاحب، آج کے اخبار میں اسلام آباد ہائی کورٹ کے فیصلے کی کوریج کے پیراگراف 3 میں اپیل کے حق سے متعلق ایک شق کی تشریح میں معمولی سہو نظر آیا ہے۔ ازراہ کرم تصحیح کے لیے منسلک قانونی تفصیل ملاحظہ فرمائیں۔",
    is_read: true,
    is_starred: false,
    created_at: "2026-11-19T14:00:00Z",
  },
];

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all"); // 'all' | 'advertising' | 'editorial' | 'general'
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [activeModalItem, setActiveModalItem] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const handleSendReply = async (item) => {
    if (!replyText.trim()) return;
    setSendingReply(true);
    try {
      const res = await fetch(`/api/inquiries/${item.id}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toEmail: item.email,
          subject: item.subject,
          replyText: replyText.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Could not send reply");
        return;
      }
      setReplyText("");
      setActiveModalItem((prev) => (prev ? { ...prev, is_read: true, replyBody: replyText.trim() } : null));
      setInquiries((prev) =>
        prev.map((m) => (m.id === item.id ? { ...m, is_read: true, replyBody: replyText.trim() } : m))
      );
    } catch {
      alert("Network error sending reply");
    } finally {
      setSendingReply(false);
    }
  };
  const [toastNotice, setToastNotice] = useState(null);

  async function loadInquiries() {
    setLoading(true);
    try {
      const res = await fetch("/api/contact");
      const data = await res.json();
      if (data?.messages && data.messages.length > 0) {
        // Merge with demo data so inquiries inbox is fully populated
        const existingIds = new Set(data.messages.map((m) => m.id));
        const merged = [...data.messages];
        INITIAL_DEMO_INQUIRIES.forEach((d) => {
          if (!existingIds.has(d.id)) merged.push(d);
        });
        setInquiries(merged);
      } else {
        setInquiries(INITIAL_DEMO_INQUIRIES);
      }
    } catch (e) {
      console.error(e);
      setInquiries(INITIAL_DEMO_INQUIRIES);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInquiries();
  }, []);

  const handleToggleRead = async (id, currentStatus) => {
    const nextStatus = !currentStatus;
    setInquiries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, is_read: nextStatus } : item))
    );

    try {
      await fetch("/api/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_read: nextStatus }),
      });
      setToastNotice(nextStatus ? "✓ پیغام کو پڑھا ہوا نشان زد کر دیا گیا۔" : "✓ پیغام کو ناخواندہ نشان زد کر دیا گیا۔");
      setTimeout(() => setToastNotice(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleStar = async (id, currentStarred) => {
    const nextStarred = !currentStarred;
    setInquiries((prev) =>
      prev.map((item) => (item.id === id ? { ...item, is_starred: nextStarred } : item))
    );

    try {
      await fetch("/api/contact", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_starred: nextStarred }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("کیا آپ واقعی اس پیغام کو حذف کرنا چاہتے ہیں؟")) return;

    setInquiries((prev) => prev.filter((item) => item.id !== id));
    setSelectedIds((prev) => prev.filter((i) => i !== id));
    if (activeModalItem?.id === id) setActiveModalItem(null);

    try {
      await fetch(`/api/contact?id=${id}`, { method: "DELETE" });
      setToastNotice("✓ پیغام کامیابی سے حذف کر دیا گیا۔");
      setTimeout(() => setToastNotice(null), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  // Bulk actions
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredInquiries.map((i) => i.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleBulkMarkRead = (markAs) => {
    setInquiries((prev) =>
      prev.map((item) => (selectedIds.includes(item.id) ? { ...item, is_read: markAs } : item))
    );
    setSelectedIds([]);
    setToastNotice(`✓ منتخب کردہ پیغامات اپ ڈیٹ ہو گئے۔`);
    setTimeout(() => setToastNotice(null), 3000);
  };

  // Counts
  const totalCount = inquiries.length;
  const unreadCount = inquiries.filter((i) => !i.is_read).length;
  const adCount = inquiries.filter((i) => i.category === "advertising").length;
  const edCount = inquiries.filter((i) => i.category === "editorial").length;
  const genCount = inquiries.filter((i) => i.category === "general").length;

  // Filtered
  const filteredInquiries = inquiries.filter((item) => {
    if (unreadOnly && item.is_read) return false;
    if (activeCategory !== "all" && item.category !== activeCategory) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.name?.toLowerCase().includes(q);
      const matchEmail = item.email?.toLowerCase().includes(q);
      const matchPhone = item.phone?.toLowerCase().includes(q);
      const matchSub = item.subject?.toLowerCase().includes(q);
      const matchMsg = item.message?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchPhone && !matchSub && !matchMsg) return false;
    }

    return true;
  });

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case "advertising":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">Advertising</span>;
      case "editorial":
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-300">Editorial Tip</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">General</span>;
    }
  };

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-16">
      {/* 1. Header Bar */}
      <div className="bg-white border border-[#e5e2da] rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0a2618] text-white flex items-center justify-center">
              <Mail size={16} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                <span>Inquiries</span>
                {unreadCount > 0 && (
                  <span className="bg-amber-100 text-amber-900 text-[11px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                    {unreadCount} Unread
                  </span>
                )}
              </h1>
              <p className="text-xs text-gray-500">
                Reader contact submissions, news tip-offs, and advertising inquiry threads.
              </p>
            </div>
          </div>
        </div>

        {/* Right Stats & Refresh */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-gray-600 bg-[#f9f8f5] px-3 py-1.5 rounded-xl border border-[#e5e2da]">
            <span>Total: <strong>{totalCount}</strong></span>
            <span>·</span>
            <span className="text-emerald-800">Ads: <strong>{adCount}</strong></span>
            <span>·</span>
            <span className="text-indigo-800">Editorial: <strong>{edCount}</strong></span>
          </div>

          <button
            onClick={loadInquiries}
            disabled={loading}
            className="border border-[#e5e2da] bg-white hover:bg-gray-50 p-2 rounded-xl text-gray-600 transition-colors shadow-xs"
            title="Refresh inquiries"
          >
            <RefreshCw size={14} className={loading ? "animate-spin text-emerald-700" : ""} />
          </button>
        </div>
      </div>

      {/* Toast Notice */}
      {toastNotice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs px-3.5 py-2.5 rounded-xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 size={15} className="text-emerald-700" />
            <span>{toastNotice}</span>
          </div>
          <button onClick={() => setToastNotice(null)} className="text-gray-400 hover:text-gray-600 text-xs">
            ✕
          </button>
        </div>
      )}

      {/* 2. Category Queues & Message Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center bg-[#f0eee6] p-1 rounded-xl border border-[#e5e2da] gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveCategory("all")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${
              activeCategory === "all" ? "bg-white text-gray-900 shadow-xs" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span>All inquiries</span>
            <span className="bg-gray-200 text-gray-700 text-[10px] px-1.5 py-0.2 rounded-full">
              {totalCount}
            </span>
          </button>

          <button
            onClick={() => setActiveCategory("editorial")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${
              activeCategory === "editorial"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span>Editorial & Tips (ادارتی)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeCategory === "editorial" ? "bg-indigo-800 text-white" : "bg-gray-200 text-gray-700"
            }`}>
              {edCount}
            </span>
          </button>

          <button
            onClick={() => setActiveCategory("advertising")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${
              activeCategory === "advertising"
                ? "bg-[#124e2b] text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span>Advertising (اشتہارات)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeCategory === "advertising" ? "bg-[#0a2618] text-white" : "bg-gray-200 text-gray-700"
            }`}>
              {adCount}
            </span>
          </button>

          <button
            onClick={() => setActiveCategory("general")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${
              activeCategory === "general"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span>General (عمومی)</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeCategory === "general" ? "bg-blue-800 text-white" : "bg-gray-200 text-gray-700"
            }`}>
              {genCount}
            </span>
          </button>
        </div>

        {/* Unread Only Toggle */}
        <label className="flex items-center gap-2 cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-[#e5e2da] shadow-xs self-start sm:self-auto">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => setUnreadOnly(e.target.checked)}
            className="w-4 h-4 text-emerald-700 rounded focus:ring-emerald-700 cursor-pointer"
          />
          <span className="text-xs font-bold text-gray-700">Unread only</span>
        </label>
      </div>

      {/* 3. Search & Bulk Actions Bar */}
      <div className="bg-white border border-[#e5e2da] rounded-xl p-3 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sender, email, phone, or subject..."
            className="w-full pl-9 pr-3 py-1.5 border border-[#e5e2da] bg-[#f9f8f5] rounded-lg text-xs outline-none focus:bg-white focus:ring-1 focus:ring-emerald-700"
          />
        </div>

        {/* Bulk Action Controls */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-gray-700">{selectedIds.length} selected:</span>
            <button
              onClick={() => handleBulkMarkRead(true)}
              className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold hover:bg-emerald-200 transition-colors"
            >
              Mark read
            </button>
            <button
              onClick={() => handleBulkMarkRead(false)}
              className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 text-xs font-bold hover:bg-amber-200 transition-colors"
            >
              Mark unread
            </button>
          </div>
        )}
      </div>

      {/* 4. Inquiries Table */}
      <div className="bg-white border border-[#e5e2da] rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f9f8f5] border-b border-[#e5e2da] text-gray-600 font-bold uppercase text-[11px]">
              <tr>
                <th className="p-3 w-8 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredInquiries.length > 0 &&
                      selectedIds.length === filteredInquiries.length
                    }
                    onChange={handleSelectAll}
                    className="w-3.5 h-3.5 rounded text-emerald-700 focus:ring-emerald-700 cursor-pointer"
                  />
                </th>
                <th className="p-3 w-8 text-center">★</th>
                <th className="p-3 w-48">Sender / Contact</th>
                <th className="p-3 w-28">Category</th>
                <th className="p-3">Subject & Message Preview</th>
                <th className="p-3 w-28">Date / Time</th>
                <th className="p-3 w-24 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0eee6]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    Loading inquiries inbox...
                  </td>
                </tr>
              ) : filteredInquiries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
                    No inquiries found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredInquiries.map((item) => {
                  const isSelected = selectedIds.includes(item.id);

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-[#fcfbf9] transition-colors cursor-pointer ${
                        !item.is_read ? "bg-amber-50/30 font-semibold" : "bg-white"
                      } ${isSelected ? "bg-emerald-50/50" : ""}`}
                    >
                      {/* Checkbox */}
                      <td
                        className="p-3 text-center align-top"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(item.id)}
                          className="w-3.5 h-3.5 rounded text-emerald-700 focus:ring-emerald-700 cursor-pointer"
                        />
                      </td>

                      {/* Star Toggle */}
                      <td
                        className="p-3 text-center align-top"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleStar(item.id, item.is_starred)}
                          className="text-gray-300 hover:text-amber-500 transition-colors"
                        >
                          <Star
                            size={14}
                            className={item.is_starred ? "text-amber-500 fill-amber-500" : ""}
                          />
                        </button>
                      </td>

                      {/* Sender Details */}
                      <td
                        className="p-3 align-top"
                        onClick={() => setActiveModalItem(item)}
                      >
                        <div className="flex items-center gap-1.5">
                          {!item.is_read && (
                            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                          )}
                          <span className="font-bold text-gray-900 block truncate">
                            {item.name}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-500 font-mono block truncate">
                          {item.email}
                        </span>
                        {item.phone && (
                          <span className="text-[10px] text-gray-400 font-mono block">
                            {item.phone}
                          </span>
                        )}
                      </td>

                      {/* Category Badge */}
                      <td
                        className="p-3 align-top"
                        onClick={() => setActiveModalItem(item)}
                      >
                        {getCategoryBadge(item.category)}
                      </td>

                      {/* Subject & Preview */}
                      <td
                        className="p-3 align-top space-y-1"
                        onClick={() => setActiveModalItem(item)}
                      >
                        <div className="font-bold text-gray-900 text-xs line-clamp-1">
                          {item.subject}
                        </div>
                        <div className="text-gray-500 text-[11px] line-clamp-1 font-serif urdu-body">
                          {item.message}
                        </div>
                      </td>

                      {/* Date */}
                      <td
                        className="p-3 align-top text-[11px] text-gray-500"
                        onClick={() => setActiveModalItem(item)}
                      >
                        <div className="flex items-center gap-1">
                          <Clock size={11} className="text-gray-400" />
                          <span>
                            {new Date(item.created_at || Date.now()).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            PKT
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td
                        className="p-3 align-top text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleToggleRead(item.id, item.is_read)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title={item.is_read ? "Mark unread" : "Mark read"}
                          >
                            {item.is_read ? <MailOpen size={14} /> : <Mail size={14} className="text-blue-600" />}
                          </button>

                          <a
                            href={`mailto:${item.email}?subject=Re: ${encodeURIComponent(item.subject || "Daily Afadiat Inquiry")}`}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                            title="Reply via Email"
                          >
                            <Reply size={14} />
                          </a>

                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 rounded-lg text-gray-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                            title="Delete inquiry"
                          >
                            <Trash2 size={14} />
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

      {/* 5. Detail & Response Modal */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#e5e2da] shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-4 border-b border-[#e5e2da] flex items-center justify-between bg-[#fcfbf9]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0a2618] text-white flex items-center justify-center">
                  <Mail size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Inquiry Thread Details</h3>
                  <span className="text-[11px] text-gray-500 font-mono">
                    ID #{activeModalItem.id} · {activeModalItem.category?.toUpperCase()}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveModalItem(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto">
              {/* Sender Details Card */}
              <div className="bg-[#f9f8f5] p-3.5 rounded-xl border border-[#e5e2da] grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px] font-bold uppercase">Sender Name</span>
                  <strong className="text-gray-900 text-sm">{activeModalItem.name}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] font-bold uppercase">Email Address</span>
                  <a href={`mailto:${activeModalItem.email}`} className="text-emerald-700 hover:underline font-mono">
                    {activeModalItem.email}
                  </a>
                </div>
                {activeModalItem.phone && (
                  <div>
                    <span className="text-gray-400 block text-[10px] font-bold uppercase">Phone Number</span>
                    <a href={`tel:${activeModalItem.phone}`} className="text-gray-800 font-mono">
                      {activeModalItem.phone}
                    </a>
                  </div>
                )}
                <div>
                  <span className="text-gray-400 block text-[10px] font-bold uppercase">Category</span>
                  {getCategoryBadge(activeModalItem.category)}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Subject</label>
                <h4 className="text-base font-bold text-gray-900">{activeModalItem.subject}</h4>
              </div>

              {/* Message Content */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Full Message Content</label>
                <div className="p-4 bg-white border border-[#e5e2da] rounded-xl text-gray-800 font-serif urdu-body text-base leading-relaxed whitespace-pre-wrap">
                  {activeModalItem.message}
                </div>
              </div>

              {/* Direct SMTP Reply Box (matching scraped-site) */}
              <div className="pt-2 border-t border-[#e5e2da] space-y-2">
                <label className="text-[11px] font-bold text-gray-700 block">
                  Direct Email Reply to {activeModalItem.email}
                </label>
                {activeModalItem.replyBody && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 whitespace-pre-wrap">
                    <span className="font-bold block mb-1">Sent reply:</span>
                    {activeModalItem.replyBody}
                  </div>
                )}
                <textarea
                  rows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply — emailed directly via configured SMTP..."
                  className="w-full p-3 text-xs border border-[#e5e2da] rounded-xl bg-[#fcfbf9] focus:bg-white focus:outline-none focus:border-[#124e2b]"
                />
                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={sendingReply || !replyText.trim()}
                    onClick={() => handleSendReply(activeModalItem)}
                    className="px-4 py-1.5 text-xs font-bold rounded-lg bg-[#124e2b] hover:bg-[#0e3d22] text-white flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                  >
                    <Send size={13} />
                    <span>{sendingReply ? "Sending..." : "Send SMTP Reply"}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer / Actions */}
            <div className="p-4 border-t border-[#e5e2da] bg-[#fcfbf9] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  handleToggleRead(activeModalItem.id, activeModalItem.is_read);
                  setActiveModalItem((prev) => ({ ...prev, is_read: !prev.is_read }));
                }}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#e5e2da] bg-white text-gray-700 hover:bg-gray-50 flex items-center gap-1.5"
              >
                {activeModalItem.is_read ? <Mail size={13} /> : <MailOpen size={13} />}
                <span>{activeModalItem.is_read ? "Mark as unread" : "Mark as read"}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleDelete(activeModalItem.id)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-200 text-red-700 hover:bg-red-50 flex items-center gap-1"
                >
                  <Trash2 size={13} />
                  <span>Delete</span>
                </button>

                <a
                  href={`mailto:${activeModalItem.email}?subject=Re: ${encodeURIComponent(activeModalItem.subject || "Daily Afadiat Inquiry")}`}
                  className="px-4 py-1.5 text-xs font-bold rounded-lg bg-[#124e2b] hover:bg-[#0e3d22] text-white flex items-center gap-1.5 shadow-xs"
                >
                  <Reply size={13} />
                  <span>Reply via Email</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
