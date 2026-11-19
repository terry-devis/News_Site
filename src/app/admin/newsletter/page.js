"use client";
import React, { useState, useEffect } from "react";
import {
  Send,
  Users,
  Settings,
  CheckCircle,
  AlertCircle,
  Save,
} from "lucide-react";
import { useAdminLanguage } from "@/context/AdminLanguageContext";

export default function NewsletterAdmin() {
  const { t, lang } = useAdminLanguage();

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
    from: "Daily Afadiat <newsletter@dailyafadiat.com>",
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
          text: data.message || "Newsletter broadcast successfully dispatched!",
        });
        if (!data.warning) {
          setSubject("");
          setMessage("");
        }
      } else {
        setBroadcastResult({ type: "error", text: data.error || "Failed to send email." });
      }
    } catch (err) {
      setBroadcastResult({ type: "error", text: "Network error, please try again." });
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
        setSmtpNotice(lang === "ur" ? "SMTP کی ترتیبات کامیابی کے ساتھ محفوظ ہو گئیں۔" : "SMTP settings saved successfully!");
      }
    } catch (err) {
      alert("Failed to save SMTP settings");
    } finally {
      setSavingSmtp(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          {t("newsletter_page_title")}
        </h1>
        <p className="text-xs text-gray-600 mt-0.5">
          {t("total_active_subscribers")}: <strong className="font-sans text-gray-900">{subscribers.length}</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 Cols): Compose Broadcast */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-2xl p-5 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-gray-900 pb-2 border-b border-[#dcd8cd] flex items-center gap-2">
              <Send size={18} className="text-emerald-700" />
              <span>{t("broadcast_section_title")}</span>
            </h2>

            {broadcastResult && (
              <div
                className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
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
                  {t("field_email_subject")} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Daily Afadiat Special Bulletin: Breaking Economic Reforms..."
                  className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#dcd8cd] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t("field_email_body")} <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={8}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Dear Readers, here is your daily summary of verified national and global events..."
                  className="w-full text-xs p-3 rounded-xl bg-white border border-[#dcd8cd] outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] text-gray-500 font-sans">
                  Recipients: {subscribers.length} email addresses (BCC)
                </span>
                <button
                  type="submit"
                  disabled={sending || subscribers.length === 0}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition shadow-xs disabled:opacity-50"
                >
                  <Send size={13} />
                  <span>{sending ? "Sending..." : t("btn_send_broadcast")}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Subscribers List */}
          <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-2xl p-5 shadow-xs">
            <h3 className="font-bold text-sm text-gray-900 pb-2 border-b border-[#dcd8cd] flex items-center gap-2 mb-3">
              <Users size={16} className="text-emerald-700" />
              <span>{t("subscribers_list_title")}</span>
            </h3>

            {loading ? (
              <div className="py-4 text-center text-xs text-gray-500">Loading subscribers...</div>
            ) : subscribers.length === 0 ? (
              <div className="py-4 text-center text-xs text-gray-500">No subscribers yet.</div>
            ) : (
              <div className="max-h-60 overflow-y-auto divide-y divide-[#dcd8cd]">
                {subscribers.map((s) => (
                  <div key={s.id || s.email} className="py-2 flex items-center justify-between text-xs">
                    <span className="font-mono text-gray-800 font-semibold">{s.email}</span>
                    <span className="text-[10px] text-gray-400 font-sans">
                      {new Date(s.created_at).toLocaleDateString(lang === "ur" ? "ur-PK" : "en-US")}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (5 Cols): SMTP Settings */}
        <div className="lg:col-span-5">
          <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-2xl p-5 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-gray-900 pb-2 border-b border-[#dcd8cd] flex items-center gap-2">
              <Settings size={18} className="text-emerald-700" />
              <span>{t("smtp_settings_title")}</span>
            </h2>

            {smtpNotice && (
              <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs flex items-center gap-1.5 font-medium">
                <CheckCircle size={14} />
                <span>{smtpNotice}</span>
              </div>
            )}

            <form onSubmit={handleSaveSmtp} className="space-y-3 font-sans">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t("field_smtp_host")}
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={smtpConfig.host}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                  placeholder="smtp.gmail.com"
                  className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#dcd8cd] font-mono text-left outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {t("field_smtp_port")}
                  </label>
                  <input
                    type="number"
                    dir="ltr"
                    value={smtpConfig.port}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, port: Number(e.target.value) })}
                    placeholder="587"
                    className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#dcd8cd] font-mono text-left outline-none"
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
                    <span>{t("field_smtp_secure")}</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t("field_smtp_user")}
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={smtpConfig.user}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, user: e.target.value })}
                  placeholder="newsletter@dailyafadiat.com"
                  className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#dcd8cd] font-mono text-left outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t("field_smtp_pass")}
                </label>
                <input
                  type="password"
                  dir="ltr"
                  value={smtpConfig.pass}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, pass: e.target.value })}
                  placeholder="••••••••••••••••"
                  className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#dcd8cd] font-mono text-left outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t("field_smtp_from")}
                </label>
                <input
                  type="text"
                  dir="ltr"
                  value={smtpConfig.from}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, from: e.target.value })}
                  placeholder="Daily Afadiat <newsletter@dailyafadiat.com>"
                  className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#dcd8cd] text-left outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={savingSmtp}
                  className="w-full bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs disabled:opacity-50"
                >
                  <Save size={14} />
                  <span>{savingSmtp ? "Saving..." : t("btn_save_smtp")}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
