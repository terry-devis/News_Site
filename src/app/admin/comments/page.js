"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  MessageSquare,
  CheckCircle,
  XCircle,
  Trash2,
  ExternalLink,
  Clock,
  Filter,
} from "lucide-react";

export default function CommentsAdmin() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");

  async function loadComments() {
    setLoading(true);
    try {
      const res = await fetch("/api/comments?all=true");
      const data = await res.json();
      setComments(data.comments || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadComments();
  }, []);

  const handleStatusChange = async (commentId, newStatus) => {
    try {
      const res = await fetch("/api/comments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment_id: commentId, status: newStatus }),
      });
      if (res.ok) {
        setComments(
          comments.map((c) => (c.id === commentId ? { ...c, status: newStatus } : c))
        );
      }
    } catch (e) {
      alert("خرابی پیش آئی");
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("کیا آپ واقعی اس تبصرے کو حذف کرنا چاہتے ہیں؟")) return;
    try {
      const res = await fetch(`/api/comments?id=${commentId}`, { method: "DELETE" });
      if (res.ok) {
        setComments(comments.filter((c) => c.id !== commentId));
      }
    } catch (e) {
      alert("حذف کرنے میں خرابی ہوئی");
    }
  };

  const filtered = comments.filter((c) => {
    if (statusFilter === "all") return true;
    return c.status === statusFilter;
  });

  const pendingCount = comments.filter((c) => c.status === "pending").length;
  const approvedCount = comments.filter((c) => c.status === "approved").length;
  const rejectedCount = comments.filter((c) => c.status === "rejected").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold urdu-headline text-gray-900">
            قارئین کے تبصروں کی تصدیق و نگرانی (Check & Balance)
          </h1>
          <p className="text-xs text-gray-600 mt-0.5">
            صرف وہی تبصرے عوام کے لیے لائیو ہوں گے جنہیں آپ یہاں سے &quot;منظور&quot; کریں گے۔
          </p>
        </div>

        {/* Status Tab Filters */}
        <div className="flex items-center gap-1 bg-[#dcd8cd]/50 p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-3 py-1.5 rounded-md transition ${
              statusFilter === "pending"
                ? "bg-amber-600 text-white shadow-xs"
                : "text-gray-700 hover:text-gray-900"
            }`}
          >
            زیرِ التواء ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter("approved")}
            className={`px-3 py-1.5 rounded-md transition ${
              statusFilter === "approved"
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-gray-700 hover:text-gray-900"
            }`}
          >
            منظور شدہ ({approvedCount})
          </button>
          <button
            onClick={() => setStatusFilter("rejected")}
            className={`px-3 py-1.5 rounded-md transition ${
              statusFilter === "rejected"
                ? "bg-red-700 text-white shadow-xs"
                : "text-gray-700 hover:text-gray-900"
            }`}
          >
            مسترد شدہ ({rejectedCount})
          </button>
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-md transition ${
              statusFilter === "all"
                ? "bg-gray-800 text-white shadow-xs"
                : "text-gray-700 hover:text-gray-900"
            }`}
          >
            تمام ({comments.length})
          </button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-xs text-gray-500 bg-[#efeee9] rounded-xl border border-[#dcd8cd]">
            تبصرے لوڈ ہو رہے ہیں...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-500 bg-[#efeee9] rounded-xl border border-[#dcd8cd]">
            اس کیٹیگری میں کوئی تبصرہ موجود نہیں ہے۔
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className="bg-[#efeee9] border border-[#dcd8cd] rounded-xl p-4 sm:p-5 shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2.5 border-b border-[#dcd8cd]">
                <div className="flex items-center gap-2.5">
                  <span className="font-bold text-sm text-gray-900">{item.author_name}</span>
                  {item.author_email && (
                    <span className="text-[11px] text-gray-500 font-mono">({item.author_email})</span>
                  )}
                  {item.status === "pending" && (
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
                      زیرِ التواء
                    </span>
                  )}
                  {item.status === "approved" && (
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
                      منظور شدہ (لائیو)
                    </span>
                  )}
                  {item.status === "rejected" && (
                    <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded">
                      مسترد
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-500 font-sans">
                  <Clock size={12} />
                  <span>{new Date(item.created_at).toLocaleString("ur-PK")}</span>
                </div>
              </div>

              {/* Comment Content */}
              <p className="text-xs sm:text-sm text-gray-800 urdu-body leading-relaxed bg-white p-3 rounded-lg border border-[#dcd8cd]">
                {item.content}
              </p>

              {/* Article Link & Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
                <div>
                  {item.article_id && (
                    <Link
                      href={`/story/${item.article_id}`}
                      target="_blank"
                      className="text-xs text-emerald-700 hover:underline flex items-center gap-1 font-semibold"
                    >
                      <span>متعلقہ مضمون دیکھیں</span>
                      <ExternalLink size={12} />
                    </Link>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {item.status !== "approved" && (
                    <button
                      onClick={() => handleStatusChange(item.id, "approved")}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1 transition"
                    >
                      <CheckCircle size={13} />
                      <span>منظور کریں (Approve)</span>
                    </button>
                  )}
                  {item.status !== "rejected" && (
                    <button
                      onClick={() => handleStatusChange(item.id, "rejected")}
                      className="bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1 transition"
                    >
                      <XCircle size={13} />
                      <span>مسترد کریں (Reject)</span>
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded transition"
                    title="حذف کریں"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
