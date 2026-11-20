"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Trash2,
  RefreshCw,
  Search,
  ExternalLink,
  ShieldAlert,
  Check,
  X,
  Flag,
  User,
  Clock,
  Filter,
} from "lucide-react";

const INITIAL_DEMO_COMMENTS = [
  {
    id: 101,
    article_id: 11,
    author_name: "محمد عمران خان",
    author_email: "imran.khan@gmail.com",
    content: "ماشاءاللہ یہ ایک نہایت شاندار اور انقلابی اقدام ہے۔ اگر اسکول کی سطح پر ہی بچوں کو مصنوعی ذہانت اور پروگرامنگ سکھائی جائے تو پاکستان آئی ٹی انڈسٹری میں دنیا کی قیادت کر سکتا ہے۔",
    status: "pending",
    created_at: "2026-11-20T06:40:00Z",
    ip_address: "39.40.112.45",
    articles: {
      title_ur: "ملک بھر کے اسکولوں میں مصنوعی ذہانت اور کوڈنگ کی مفت تعلیم کا منصوبہ",
    },
  },
  {
    id: 102,
    article_id: 10,
    author_name: "Ayesha Tariq",
    author_email: "ayesha.tariq@outlook.com",
    content: "Incredible archaeological discovery! Subterranean cities always hold profound insights into historical human survival systems.",
    status: "pending",
    created_at: "2026-11-20T06:15:00Z",
    ip_address: "182.180.78.90",
    articles: {
      title_ur: "صدیوں پرانا زیرِ زمین شہر دریافت، آثارِ قدیمہ کے ماہرین ششدر رہ گئے",
    },
  },
  {
    id: 103,
    article_id: 9,
    author_name: "طارق محمود چوہدری",
    author_email: "tariq.ch@fintech.pk",
    content: "اسٹاک مارکیٹ میں تیزی معاشی بحالی کا واضح اشارہ ہے۔ امید ہے کہ سرمایہ کاروں کا اعتماد مزید مستحکم ہوگا۔",
    status: "approved",
    created_at: "2026-11-20T05:20:00Z",
    ip_address: "119.160.19.12",
    articles: {
      title_ur: "پاکستان اسٹاک ایکسچینج میں تاریخی تیزی، ہنڈریڈ انڈیکس نئی بلندیوں پر پہنچ گیا",
    },
  },
  {
    id: 104,
    article_id: 8,
    author_name: "ڈاکٹر شازیہ رحمان",
    author_email: "dr.shazia@health.org",
    content: "امراضِ قلب کی روک تھام کے لیے یہ تحقیق واقعی لائقِ تحسین ہے۔ معمول کی چہل قدمی اور متوازن غذا زندگی بدل سکتی ہے۔",
    status: "approved",
    created_at: "2026-11-20T04:45:00Z",
    ip_address: "39.50.201.88",
    articles: {
      title_ur: "طبی ماہرین کی نئی دریافت: دل کے امراض کے خطرے کو نصف تک کم کرنے کا آسان طریقہ",
    },
  },
  {
    id: 105,
    article_id: 4,
    author_name: "Crypt0_B0t_Official",
    author_email: "fast_money_crypto99@yahoo.com",
    content: "Get rich fast! Join telegram channel @crypto_scam_link to double your Bitcoin in 24 hours guaranteed!!!",
    status: "spam",
    created_at: "2026-11-20T03:10:00Z",
    ip_address: "45.134.22.9",
    articles: {
      title_ur: "پاکستان کرکٹ ٹیم نے ون ڈے سیریز اپنے نام کر لی، سنسنی خیز مقابلے کے بعد فتح",
    },
  },
  {
    id: 106,
    article_id: 1,
    author_name: "نامعلوم صارف",
    author_email: "hate_speech_anon@trashmail.com",
    content: "یہ تمام خبریں بے بنیاد اور نامناسب ہیں۔ ادارے کو بند کر دینا چاہیے۔",
    status: "rejected",
    created_at: "2026-11-20T02:30:00Z",
    ip_address: "115.186.45.67",
    articles: {
      title_ur: "ڈیلی افادیت نیوز پورٹل کا باضابطہ آغاز: سچ کے ساتھ، ہر لمحہ باخبر",
    },
  },
];

export default function CommentsAdmin() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusTab, setStatusTab] = useState("pending"); // 'pending' | 'approved' | 'rejected' | 'spam'
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [toastNotice, setToastNotice] = useState(null);

  async function loadComments() {
    setLoading(true);
    try {
      const res = await fetch("/api/comments?all=true");
      const data = await res.json();
      if (data?.comments && data.comments.length > 0) {
        // Merge demo comments with existing comments if list is small
        const existingIds = new Set(data.comments.map((c) => c.id));
        const merged = [...data.comments];
        INITIAL_DEMO_COMMENTS.forEach((demo) => {
          if (!existingIds.has(demo.id)) merged.push(demo);
        });
        setComments(merged);
      } else {
        setComments(INITIAL_DEMO_COMMENTS);
      }
    } catch (e) {
      console.error(e);
      setComments(INITIAL_DEMO_COMMENTS);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComments();
  }, []);

  const handleStatusChange = async (commentId, newStatus) => {
    // Optimistic UI update
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, status: newStatus } : c))
    );

    try {
      const res = await fetch("/api/comments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment_id: commentId, status: newStatus }),
      });

      const labelMap = {
        approved: "منظور شدہ (Approved)",
        rejected: "مسترد (Rejected)",
        spam: "سپام (Spam)",
        pending: "زیر التواء (Pending)",
      };

      setToastNotice(`✓ تبصرے کا اسٹیٹس کامیابی سے "${labelMap[newStatus]}" میں تبدیل کر دیا گیا۔`);
      setTimeout(() => setToastNotice(null), 3500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (commentId) => {
    if (!confirm("کیا آپ واقعی اس تبصرے کو مستقل طور پر حذف کرنا چاہتے ہیں؟")) return;

    setComments((prev) => prev.filter((c) => c.id !== commentId));
    setSelectedIds((prev) => prev.filter((id) => id !== commentId));

    try {
      await fetch(`/api/comments?id=${commentId}`, { method: "DELETE" });
      setToastNotice("✓ تبصرہ کامیابی کے ساتھ حذف کر دیا گیا۔");
      setTimeout(() => setToastNotice(null), 3500);
    } catch (e) {
      console.error(e);
    }
  };

  // Bulk actions
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const idsOnScreen = filteredComments.map((c) => c.id);
      setSelectedIds(idsOnScreen);
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleBulkStatus = async (newStatus) => {
    if (selectedIds.length === 0) return;

    // Optimistically update selected comments
    setComments((prev) =>
      prev.map((c) => (selectedIds.includes(c.id) ? { ...c, status: newStatus } : c))
    );

    for (const id of selectedIds) {
      try {
        await fetch("/api/comments", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ comment_id: id, status: newStatus }),
        });
      } catch (err) {}
    }

    setToastNotice(`✓ منتخب کردہ ${selectedIds.length} تبصرے کامیابی سے اپ ڈیٹ ہو گئے۔`);
    setSelectedIds([]);
    setTimeout(() => setToastNotice(null), 3500);
  };

  // Counts per tab
  const pendingCount = comments.filter((c) => c.status === "pending").length;
  const approvedCount = comments.filter((c) => c.status === "approved").length;
  const rejectedCount = comments.filter((c) => c.status === "rejected").length;
  const spamCount = comments.filter((c) => c.status === "spam").length;

  // Filtered comments
  const filteredComments = comments.filter((c) => {
    if (c.status !== statusTab) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = c.author_name?.toLowerCase().includes(q);
      const matchEmail = c.author_email?.toLowerCase().includes(q);
      const matchContent = c.content?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchContent) return false;
    }

    return true;
  });

  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-16">
      {/* 1. Header Bar */}
      <div className="bg-white border border-[#e5e2da] rounded-xl p-4 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#0a2618] text-white flex items-center justify-center">
              <MessageSquare size={16} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 tracking-tight">Comments</h1>
              <p className="text-xs text-gray-500">
                Reader discussion moderation queue across all published news stories.
              </p>
            </div>
          </div>
        </div>

        {/* Right Action: Refresh */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={loadComments}
            disabled={loading}
            className="border border-[#e5e2da] bg-white hover:bg-gray-50 px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <RefreshCw size={13} className={loading ? "animate-spin text-emerald-700" : ""} />
            <span>Refresh queue</span>
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

      {/* 2. 4-Queue Status Switcher Tabs */}
      <div className="flex items-center bg-[#f0eee6] p-1 rounded-xl border border-[#e5e2da] gap-1 overflow-x-auto">
        <button
          onClick={() => {
            setStatusTab("pending");
            setSelectedIds([]);
          }}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all shrink-0 ${
            statusTab === "pending"
              ? "bg-amber-600 text-white shadow-xs"
              : "text-gray-700 hover:text-black hover:bg-white/60"
          }`}
        >
          <span>Pending (زیر انتظار)</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              statusTab === "pending" ? "bg-amber-800 text-white" : "bg-white text-gray-700"
            }`}
          >
            {pendingCount}
          </span>
        </button>

        <button
          onClick={() => {
            setStatusTab("approved");
            setSelectedIds([]);
          }}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all shrink-0 ${
            statusTab === "approved"
              ? "bg-[#124e2b] text-white shadow-xs"
              : "text-gray-700 hover:text-black hover:bg-white/60"
          }`}
        >
          <span>Approved (منظور شدہ)</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              statusTab === "approved" ? "bg-[#0a2618] text-white" : "bg-white text-gray-700"
            }`}
          >
            {approvedCount}
          </span>
        </button>

        <button
          onClick={() => {
            setStatusTab("rejected");
            setSelectedIds([]);
          }}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all shrink-0 ${
            statusTab === "rejected"
              ? "bg-gray-700 text-white shadow-xs"
              : "text-gray-700 hover:text-black hover:bg-white/60"
          }`}
        >
          <span>Rejected (مسترد)</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              statusTab === "rejected" ? "bg-gray-900 text-white" : "bg-white text-gray-700"
            }`}
          >
            {rejectedCount}
          </span>
        </button>

        <button
          onClick={() => {
            setStatusTab("spam");
            setSelectedIds([]);
          }}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-all shrink-0 ${
            statusTab === "spam"
              ? "bg-red-700 text-white shadow-xs"
              : "text-gray-700 hover:text-black hover:bg-white/60"
          }`}
        >
          <span>Spam (سپام)</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
              statusTab === "spam" ? "bg-red-900 text-white" : "bg-white text-gray-700"
            }`}
          >
            {spamCount}
          </span>
        </button>
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
            placeholder="Search reader name, email, or comment text..."
            className="w-full pl-9 pr-3 py-1.5 border border-[#e5e2da] bg-[#f9f8f5] rounded-lg text-xs outline-none focus:bg-white focus:ring-1 focus:ring-emerald-700"
          />
        </div>

        {/* Bulk Action Controls */}
        {selectedIds.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-gray-700">{selectedIds.length} selected:</span>
            {statusTab !== "approved" && (
              <button
                onClick={() => handleBulkStatus("approved")}
                className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold hover:bg-emerald-200 transition-colors"
              >
                Approve all
              </button>
            )}
            {statusTab !== "rejected" && (
              <button
                onClick={() => handleBulkStatus("rejected")}
                className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-800 text-xs font-bold hover:bg-gray-200 transition-colors"
              >
                Reject all
              </button>
            )}
            {statusTab !== "spam" && (
              <button
                onClick={() => handleBulkStatus("spam")}
                className="px-2.5 py-1 rounded-lg bg-red-100 text-red-800 text-xs font-bold hover:bg-red-200 transition-colors"
              >
                Mark spam
              </button>
            )}
          </div>
        )}
      </div>

      {/* 4. Comments Table / Card Container */}
      <div className="bg-white border border-[#e5e2da] rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#f9f8f5] border-b border-[#e5e2da] text-gray-600 font-bold uppercase text-[11px]">
              <tr>
                <th className="p-3 w-8 text-center">
                  <input
                    type="checkbox"
                    checked={
                      filteredComments.length > 0 &&
                      selectedIds.length === filteredComments.length
                    }
                    onChange={handleSelectAll}
                    className="w-3.5 h-3.5 rounded text-emerald-700 focus:ring-emerald-700 cursor-pointer"
                  />
                </th>
                <th className="p-3 w-48">Reader / Author</th>
                <th className="p-3">Comment Text & Story Context</th>
                <th className="p-3 w-32">Timestamp & IP</th>
                <th className="p-3 w-36 text-center">Moderation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0eee6]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    Loading moderation queue...
                  </td>
                </tr>
              ) : filteredComments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-400">
                    No comments found in {statusTab} queue.
                  </td>
                </tr>
              ) : (
                filteredComments.map((comment) => {
                  const isSelected = selectedIds.includes(comment.id);
                  const initial = (comment.author_name || "U").charAt(0).toUpperCase();

                  return (
                    <tr
                      key={comment.id}
                      className={`hover:bg-[#fcfbf9] transition-colors ${
                        isSelected ? "bg-emerald-50/50" : "bg-white"
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="p-3 text-center align-top">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(comment.id)}
                          className="w-3.5 h-3.5 rounded text-emerald-700 focus:ring-emerald-700 cursor-pointer"
                        />
                      </td>

                      {/* Author */}
                      <td className="p-3 align-top">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#0a2618] text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-gray-900 block truncate">
                              {comment.author_name}
                            </span>
                            <span className="text-[11px] text-gray-400 font-mono truncate block">
                              {comment.author_email || "no-email@reader.pk"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Comment Body & Article Link */}
                      <td className="p-3 align-top space-y-2">
                        {/* Article Context Badge */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="bg-[#f0eee6] text-gray-700 text-[10px] font-bold px-1.5 py-0.2 rounded font-sans">
                            Article #{comment.article_id}
                          </span>
                          <Link
                            href={`/story/${comment.article_id}`}
                            target="_blank"
                            className="text-xs font-serif urdu-headline text-emerald-800 hover:underline flex items-center gap-1 font-bold"
                          >
                            <span>
                              {comment.articles?.title_ur || "ڈیلی افادیت مصدقہ خبر"}
                            </span>
                            <ExternalLink size={10} className="shrink-0" />
                          </Link>
                        </div>

                        {/* Comment Text */}
                        <div className="p-2.5 bg-[#fcfbf9] border border-[#e5e2da] rounded-lg text-gray-800 font-serif urdu-body text-sm leading-relaxed text-right">
                          {comment.content}
                        </div>
                      </td>

                      {/* Timestamp & IP */}
                      <td className="p-3 align-top text-[11px] text-gray-500 space-y-1">
                        <div className="flex items-center gap-1">
                          <Clock size={11} className="text-gray-400" />
                          <span>
                            {new Date(comment.created_at || Date.now()).toLocaleTimeString("en-US", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}{" "}
                            PKT
                          </span>
                        </div>
                        <div className="font-mono text-[10px] text-gray-400">
                          IP: {comment.ip_address || "39.40.xxx.xxx"}
                        </div>
                      </td>

                      {/* Quick Moderation Actions */}
                      <td className="p-3 align-top text-center">
                        <div className="flex items-center justify-center gap-1">
                          {comment.status !== "approved" && (
                            <button
                              onClick={() => handleStatusChange(comment.id, "approved")}
                              className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                              title="Approve comment"
                            >
                              <Check size={14} />
                            </button>
                          )}

                          {comment.status !== "rejected" && (
                            <button
                              onClick={() => handleStatusChange(comment.id, "rejected")}
                              className="p-1.5 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-colors"
                              title="Reject comment"
                            >
                              <X size={14} />
                            </button>
                          )}

                          {comment.status !== "spam" && (
                            <button
                              onClick={() => handleStatusChange(comment.id, "spam")}
                              className="p-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 transition-colors"
                              title="Mark as spam"
                            >
                              <Flag size={14} />
                            </button>
                          )}

                          <button
                            onClick={() => handleDelete(comment.id)}
                            className="p-1.5 rounded-lg bg-gray-50 text-gray-500 hover:text-red-700 hover:bg-red-50 border border-gray-200 transition-colors"
                            title="Delete permanently"
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
    </div>
  );
}
