"use client";
import React, { useState, useEffect } from "react";
import { MessageSquare, Send, CheckCircle2, User, Clock } from "lucide-react";

export default function CommentSection({ articleId }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    let isMounted = true;
    async function loadComments() {
      try {
        const res = await fetch(`/api/comments?article_id=${articleId}`);
        const data = await res.json();
        if (isMounted && data.comments) {
          setComments(data.comments);
        }
      } catch (err) {
        console.error("Comments load error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadComments();
    return () => {
      isMounted = false;
    };
  }, [articleId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!authorName.trim() || !content.trim()) return;

    setSubmitting(true);
    setNotification(null);

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          article_id: articleId,
          author_name: authorName.trim(),
          author_email: authorEmail.trim(),
          content: content.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setNotification({
          type: "success",
          text: data.message || "آپ کا تبصرہ موصول ہو گیا ہے اور ادارتی تصدیق کے بعد لائیو ہو جائے گا۔",
        });
        setContent("");
      } else {
        setNotification({ type: "error", text: data.error || "تبصرہ بھیجنے میں خرابی ہوئی" });
      }
    } catch (err) {
      setNotification({ type: "error", text: "نیٹ ورک خرابی، براہ کرم دوبارہ کوشش کریں" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mt-10 pt-6 border-t border-[#dcd8cd] font-sans">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold urdu-headline text-gray-900 flex items-center gap-2">
          <MessageSquare size={20} className="text-emerald-700" />
          <span>قارئین کے تبصرے ({comments.length})</span>
        </h3>
        <span className="text-xs text-gray-500 font-sans">ایڈمن تصدیق شدہ</span>
      </div>

      {/* 1. Comment Submission Form */}
      <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-lg p-5 mb-8 shadow-xs">
        <h4 className="text-sm font-bold text-gray-800 mb-3">اپنی رائے کا اظہار کریں</h4>
        
        {notification && (
          <div
            className={`p-3 rounded text-xs mb-4 flex items-center gap-2 ${
              notification.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            {notification.type === "success" && <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />}
            <span>{notification.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                آپ کا نام <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="مثلاً: محمد احمد"
                className="w-full text-xs p-2.5 rounded bg-white border border-[#dcd8cd] focus:border-emerald-600 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                ای میل ایڈریس (خفیہ رہے گا)
              </label>
              <input
                type="email"
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full text-xs p-2.5 rounded bg-white border border-[#dcd8cd] focus:border-emerald-600 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              آپ کا تبصرہ <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="شائستہ اور موضوع سے متعلق اپنی رائے تحریر کریں..."
              className="w-full text-xs p-2.5 rounded bg-white border border-[#dcd8cd] focus:border-emerald-600 outline-none leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-gray-500">
              نوٹ: تمام تبصرے ادارتی پالیسی کے تحت تصدیق کے بعد لائیو ہوتے ہیں۔
            </span>
            <button
              type="submit"
              disabled={submitting}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <Send size={13} />
              <span>{submitting ? "بھیجا جا رہا ہے..." : "تبصرہ بھیجیں"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. List of Approved Comments */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-xs text-gray-500 text-center py-4">تبصرے لوڈ ہو رہے ہیں...</p>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 bg-[#efeee9]/40 border border-dashed border-[#dcd8cd] rounded-lg">
            <p className="text-xs text-gray-500">ابھی تک اس خبر پر کوئی تبصرہ نہیں آیا۔ پہلے تبصرہ نگار بنیں!</p>
          </div>
        ) : (
          comments.map((c) => (
            <div
              key={c.id}
              className="bg-[#efeee9]/80 border border-[#dcd8cd] rounded-lg p-4 transition hover:bg-[#efeee9]"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-full bg-emerald-800 text-white grid place-items-center text-xs font-bold">
                    {c.author_name.charAt(0)}
                  </div>
                  <span className="text-sm font-bold text-gray-900">{c.author_name}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-gray-500 font-sans">
                  <Clock size={11} />
                  <span>{new Date(c.created_at).toLocaleDateString("ur-PK")}</span>
                </div>
              </div>
              <p className="text-xs sm:text-[13px] text-gray-800 urdu-body leading-relaxed pr-9">
                {c.content}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
