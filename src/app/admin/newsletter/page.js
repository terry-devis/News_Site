"use client";
import React, { useState, useEffect } from "react";
import {
  Mail,
  Send,
  Users,
  Settings,
  CheckCircle,
  AlertCircle,
  Clock,
  Save,
} from "lucide-react";

export default function NewsletterAdmin() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Broadcast state
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState(null);

  // SMTP Settings state
  const [smtpConfig, setSmtpConfig] = useState({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    user: "",
    pass: "",
    from: "ڈیلی افادیت <newsletter@dailyafadiat.com>",
  });
  const [savingSmtp, setSavingSmtp] = useState(false);
  const [smtpNotice, setSmtpNotice] = useState(null);

  async function loadData() {
    setLoading(true);
    try {
      const [subRes, setRes] = await Promise.all([
        fetch("/api/newsletter").then((r) => r.json()),
        fetch("/api/settings?key=smtp_config").then((r) => r.json()),
      ]);

      setSubscribers(subRes.subscribers || []);
      if (setRes.smtp_config) setSmtpConfig(setRes.smtp_config);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    setSending(true);
    setBroadcastResult(null);

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "broadcast",
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setBroadcastResult({
          type: data.warning ? "warning" : "success",
          text: data.message || "نیوز لیٹر کامیابی کے ساتھ بھیج دیا گیا!",
        });
        if (!data.warning) {
          setSubject("");
          setMessage("");
        }
      } else {
        setBroadcastResult({ type: "error", text: data.error || "ای میل بھیجنے میں خرابی ہوئی" });
      }
    } catch (err) {
      setBroadcastResult({ type: "error", text: "نیٹ ورک خرابی، براہ کرم بعد میں کوشش کریں" });
    } finally {
      setSending(false);
    }
  };

  const handleSaveSmtp = async (e) => {
    e.preventDefault();
    setSavingSmtp(true);
    setSmtpNotice(null);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "smtp_config", value: smtpConfig }),
      });
      if (res.ok) {
        setSmtpNotice("SMTP کی ترتیبات کامیابی کے ساتھ محفوظ ہو گئیں۔");
      }
    } catch (err) {
      alert("خرابی پیش آئی");
    } finally {
      setSavingSmtp(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold urdu-headline text-gray-900">
          نیوز لیٹر سبسکرائبرز اور SMTP براڈکاسٹ
        </h1>
        <p className="text-xs text-gray-600 mt-0.5">
          کل فعال سبسکرائبرز: <strong className="font-sans text-gray-900">{subscribers.length}</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 Cols): Compose Broadcast */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-xl p-5 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-gray-900 pb-2 border-b border-[#dcd8cd] flex items-center gap-2">
              <Send size={18} className="text-emerald-700" />
              <span>تمام سبسکرائبرز کو خبر نامہ / ای میل بھیجیں (Broadcast)</span>
            </h2>

            {broadcastResult && (
              <div
                className={`p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                  broadcastResult.type === "success"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-300"
                    : broadcastResult.type === "warning"
                    ? "bg-amber-50 text-amber-800 border border-amber-300"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {broadcastResult.type === "success" ? (
                  <CheckCircle size={16} className="shrink-0 text-emerald-600" />
                ) : (
                  <AlertCircle size={16} className="shrink-0 text-amber-600" />
                )}
                <span>{broadcastResult.text}</span>
              </div>
            )}

            <form onSubmit={handleBroadcast} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  ای میل کا موضوع (Email Subject) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="مثلاً: ڈیلی افادیت کی خصوصی رپورٹ: پاکستان معیشت کا نیا رُخ..."
                  className="w-full text-xs p-2.5 rounded bg-white border border-[#dcd8cd] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  ای میل کا پیغام (HTML / Text) <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={8}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="السلام علیکم قارئین کرام! آج کی اہم ترین خبریں اور تجزئیات پیش خدمت ہیں..."
                  className="w-full text-xs p-3 rounded bg-white border border-[#dcd8cd] outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-gray-500 font-sans">
                  وصول کنندگان: {subscribers.length} ای میل پتے (BCC)
                </span>
                <button
                  type="submit"
                  disabled={sending || subscribers.length === 0}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition shadow-xs disabled:opacity-50"
                >
                  <Send size={13} />
                  <span>{sending ? "ارسال ہو رہا ہے..." : "سبسکرائبرز کو ای میل بھیجیں"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Subscribers List */}
          <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-xl p-5 shadow-xs">
            <h3 className="font-bold text-sm text-gray-900 pb-2 border-b border-[#dcd8cd] flex items-center gap-2 mb-3">
              <Users size={16} className="text-emerald-700" />
              <span>سبسکرائب کرنے والے قارئین کی فہرست</span>
            </h3>

            {loading ? (
              <div className="py-4 text-center text-xs text-gray-500">لوڈ ہو رہا ہے...</div>
            ) : subscribers.length === 0 ? (
              <div className="py-4 text-center text-xs text-gray-500">ابھی کوئی سبسکرائبر نہیں ہے۔</div>
            ) : (
              <div className="max-h-60 overflow-y-auto divide-y divide-[#dcd8cd]">
                {subscribers.map((s) => (
                  <div key={s.id || s.email} className="py-2 flex items-center justify-between text-xs">
                    <span className="font-mono text-gray-800 font-semibold">{s.email}</span>
                    <span className="text-[10px] text-gray-400 font-sans">
                      {new Date(s.created_at).toLocaleDateString("ur-PK")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 Cols): SMTP Settings */}
        <div className="lg:col-span-5">
          <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-xl p-5 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-gray-900 pb-2 border-b border-[#dcd8cd] flex items-center gap-2">
              <Settings size={18} className="text-emerald-700" />
              <span>ای میل سرور کی ترتیبات (SMTP Settings)</span>
            </h2>

            {smtpNotice && (
              <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded text-xs flex items-center gap-1.5 font-medium">
                <CheckCircle size={14} />
                <span>{smtpNotice}</span>
              </div>
            )}

            <form onSubmit={handleSaveSmtp} className="space-y-3 font-sans">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  SMTP Host
                </label>
                <input
                  type="text"
                  value={smtpConfig.host}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                  placeholder="smtp.gmail.com"
                  className="w-full text-xs p-2.5 rounded bg-white border border-[#dcd8cd] font-mono text-left outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Port
                  </label>
                  <input
                    type="number"
                    value={smtpConfig.port}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, port: Number(e.target.value) })}
                    placeholder="587"
                    className="w-full text-xs p-2.5 rounded bg-white border border-[#dcd8cd] font-mono text-left outline-none"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-gray-700">
                    <input
                      type="checkbox"
                      checked={smtpConfig.secure}
                      onChange={(e) => setSmtpConfig({ ...smtpConfig, secure: e.target.checked })}
                      className="size-4 rounded accent-emerald-700"
                    />
                    <span>SSL/TLS (Port 465)</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  SMTP Username / Email
                </label>
                <input
                  type="text"
                  value={smtpConfig.user}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, user: e.target.value })}
                  placeholder="newsletter@dailyafadiat.com"
                  className="w-full text-xs p-2.5 rounded bg-white border border-[#dcd8cd] font-mono text-left outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  SMTP Password / App Password
                </label>
                <input
                  type="password"
                  value={smtpConfig.pass}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, pass: e.target.value })}
                  placeholder="••••••••••••••••"
                  className="w-full text-xs p-2.5 rounded bg-white border border-[#dcd8cd] font-mono text-left outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Sender From Address
                </label>
                <input
                  type="text"
                  value={smtpConfig.from}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, from: e.target.value })}
                  placeholder="ڈیلی افادیت <newsletter@dailyafadiat.com>"
                  className="w-full text-xs p-2.5 rounded bg-white border border-[#dcd8cd] text-left outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingSmtp}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 transition shadow-xs disabled:opacity-50"
                >
                  <Save size={14} />
                  <span>{savingSmtp ? "محفوظ ہو رہا ہے..." : "SMTP ترتیبات محفوظ کریں"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
