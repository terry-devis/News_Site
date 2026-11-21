"use client";
import React, { useState, useEffect } from "react";
import {
  Share2,
  Save,
  CheckCircle,
  Mail,
  Phone,
  Info,
  MapPin,
  Clock,
  MessageSquare,
  Trash2,
  Inbox,
} from "lucide-react";
import { useAdminLanguage } from "@/context/AdminLanguageContext";

export default function SettingsAdmin() {
  const { t, lang } = useAdminLanguage();

  const [activeTab, setActiveTab] = useState("settings"); // 'settings' or 'inbox'

  const [socialLinks, setSocialLinks] = useState({
    youtube: "",
    whatsapp: "",
    facebook: "",
    instagram: "",
    twitter: "",
    tiktok: "",
    threads: "",
  });

  const [contactInfo, setContactInfo] = useState({
    address_ur: "شاہراہِ قائدین، صدر، کراچی، پاکستان",
    address_en: "Shahrah-e-Quaideen, Saddar, Karachi, Pakistan",
    phone: "+92 300 1234567",
    whatsapp: "+92 300 1234567",
    editorial_email: "editor@dailyafadiat.com",
    ads_email: "ads@dailyafadiat.com",
    timing_ur: "پیر تا ہفتہ: صبح ۹ تا شام ۶ بجے",
    timing_en: "Mon to Sat: 9:00 AM to 6:00 PM",
  });

  const [siteInfo, setSiteInfo] = useState({
    title_ur: "ڈیلی افادیت",
    tagline_ur: "سچ کے ساتھ، ہر لمحہ باخبر — TRUST • FACTS • GLOBAL NEWS",
    max_featured_posts: 5,
  });

  const [smtpConfig, setSmtpConfig] = useState({
    host: "",
    port: 587,
    user: "",
    pass: "",
    from: "Daily Afadiat <no-reply@dailyafadiat.com>",
    secure: false,
  });
  const [testEmailTo, setTestEmailTo] = useState("");
  const [sendingTestEmail, setSendingTestEmail] = useState(false);

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  async function loadData() {
    setLoading(true);
    try {
      const [setRes, contactRes] = await Promise.all([
        fetch("/api/settings").then((r) => r.json()),
        fetch("/api/contact").then((r) => r.json()),
      ]);

      if (setRes.social_links) setSocialLinks(setRes.social_links);
      if (setRes.site_info) setSiteInfo(setRes.site_info);
      if (setRes.smtp_config) setSmtpConfig((prev) => ({ ...prev, ...setRes.smtp_config }));
      if (contactRes.contactInfo) setContactInfo(contactRes.contactInfo);
      if (contactRes.messages) setMessages(contactRes.messages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setNotice(null);

    try {
      await Promise.all([
        fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "social_links", value: socialLinks }),
        }),
        fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "site_info", value: siteInfo }),
        }),
        fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "contact_info", value: contactInfo }),
        }),
        fetch("/api/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ key: "smtp_config", value: smtpConfig }),
        }),
      ]);

      setNotice(lang === "ur" ? "تمام ترتیبات کامیابی کے ساتھ محفوظ ہو گئیں۔" : "All settings saved successfully!");
    } catch (err) {
      alert("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this inquiry?")) return;
    try {
      const res = await fetch(`/api/contact?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setMessages(messages.filter((m) => m.id !== id));
      }
    } catch (e) {
      alert("Failed to delete message");
    }
  };

  const handleSendTestEmail = async () => {
    const to = testEmailTo.trim();
    if (!to) {
      setNotice("Enter an address to send the test email to.");
      return;
    }
    setSendingTestEmail(true);
    setNotice(null);
    try {
      const res = await fetch("/api/settings/email/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNotice(data.error || "Test email failed");
      } else if (data.mode === "log") {
        setNotice("SMTP isn't configured yet — test was logged in Email alerts. Save host/user/password first.");
      } else {
        setNotice(`Test email sent to ${to}`);
      }
    } catch {
      setNotice("Test email failed");
    } finally {
      setSendingTestEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {t("settings_page_title")}
          </h1>
          <p className="text-xs text-gray-600 mt-0.5">
            {t("settings_page_desc")}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-[#dcd8cd]/50 p-1 rounded-xl text-xs font-semibold">
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              activeTab === "settings"
                ? "bg-emerald-800 text-white shadow-xs font-bold"
                : "text-gray-700 hover:text-gray-900"
            }`}
          >
            <Info size={14} />
            <span>{t("tab_social_info")}</span>
          </button>
          <button
            onClick={() => setActiveTab("inbox")}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition ${
              activeTab === "inbox"
                ? "bg-emerald-800 text-white shadow-xs font-bold"
                : "text-gray-700 hover:text-gray-900"
            }`}
          >
            <Inbox size={14} />
            <span>{t("tab_inbox_messages")} ({messages.length})</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle size={16} />
          <span>{notice}</span>
        </div>
      )}

      {activeTab === "settings" ? (
        <form onSubmit={handleSave} className="space-y-6">
          {/* 1. Official Social Media Links */}
          <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-2xl p-5 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-gray-900 pb-2 border-b border-[#dcd8cd] flex items-center gap-2">
              <Share2 size={18} className="text-emerald-700" />
              <span>{t("section_social_accounts")}</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">YouTube</label>
                <input
                  type="text"
                  value={socialLinks.youtube}
                  onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                  placeholder="https://youtube.com/@dailyafadiat"
                  className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#dcd8cd] font-mono text-left outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">WhatsApp Channel / Group</label>
                <input
                  type="text"
                  value={socialLinks.whatsapp}
                  onChange={(e) => setSocialLinks({ ...socialLinks, whatsapp: e.target.value })}
                  placeholder="https://whatsapp.com/channel/..."
                  className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#dcd8cd] font-mono text-left outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Facebook</label>
                <input
                  type="text"
                  value={socialLinks.facebook}
                  onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                  placeholder="https://facebook.com/dailyafadiat"
                  className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#dcd8cd] font-mono text-left outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Instagram</label>
                <input
                  type="text"
                  value={socialLinks.instagram}
                  onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                  placeholder="https://instagram.com/dailyafadiat"
                  className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#dcd8cd] font-mono text-left outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">X / Twitter</label>
                <input
                  type="text"
                  value={socialLinks.twitter}
                  onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                  placeholder="https://x.com/dailyafadiat"
                  className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#dcd8cd] font-mono text-left outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">TikTok</label>
                <input
                  type="text"
                  value={socialLinks.tiktok}
                  onChange={(e) => setSocialLinks({ ...socialLinks, tiktok: e.target.value })}
                  placeholder="https://tiktok.com/@dailyafadiat"
                  className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#dcd8cd] font-mono text-left outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Threads</label>
                <input
                  type="text"
                  dir="ltr"
                  value={socialLinks.threads || ""}
                  onChange={(e) => setSocialLinks({ ...socialLinks, threads: e.target.value })}
                  placeholder="https://www.threads.com/@dailyafadiat"
                  className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#dcd8cd] font-mono text-left outline-none"
                />
              </div>
            </div>
          </div>

          {/* 2. Contact Details & Office Information (Changeable for /contact page!) */}
          <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-2xl p-5 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-gray-900 pb-2 border-b border-[#dcd8cd] flex items-center gap-2">
              <MapPin size={18} className="text-emerald-700" />
              <span>{t("section_contact_details")}</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t("field_tagline")}
                </label>
                <input
                  type="text"
                  value={siteInfo.tagline_ur}
                  onChange={(e) => setSiteInfo({ ...siteInfo, tagline_ur: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#dcd8cd] outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {t("field_address_ur")}
                  </label>
                  <input
                    type="text"
                    value={contactInfo.address_ur}
                    onChange={(e) => setContactInfo({ ...contactInfo, address_ur: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#dcd8cd] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {t("field_address_en")}
                  </label>
                  <input
                    type="text"
                    value={contactInfo.address_en}
                    onChange={(e) => setContactInfo({ ...contactInfo, address_en: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#dcd8cd] outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {t("field_phone")}
                  </label>
                  <input
                    type="text"
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#dcd8cd] font-mono text-left outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {t("field_editorial_email")}
                  </label>
                  <input
                    type="email"
                    value={contactInfo.editorial_email}
                    onChange={(e) => setContactInfo({ ...contactInfo, editorial_email: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#dcd8cd] font-mono text-left outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {t("field_ads_email")}
                  </label>
                  <input
                    type="email"
                    value={contactInfo.ads_email}
                    onChange={(e) => setContactInfo({ ...contactInfo, ads_email: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#dcd8cd] font-mono text-left outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {t("field_timings")} (Urdu)
                  </label>
                  <input
                    type="text"
                    value={contactInfo.timing_ur}
                    onChange={(e) => setContactInfo({ ...contactInfo, timing_ur: e.target.value })}
                    placeholder="پیر تا ہفتہ: صبح ۹ تا شام ۶ بجے"
                    className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#dcd8cd] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Office Timings (English)
                  </label>
                  <input
                    type="text"
                    dir="ltr"
                    value={contactInfo.timing_en}
                    onChange={(e) => setContactInfo({ ...contactInfo, timing_en: e.target.value })}
                    placeholder="Mon to Sat: 9:00 AM to 6:00 PM"
                    className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#dcd8cd] text-left font-sans outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-[#dcd8cd]/70">
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {lang === "ur" ? "زیادہ سے زیادہ فیچرڈ پوسٹس کی حد (Max Featured Posts)" : "Max Featured Posts Limit (Hero & Featured Rotation)"}
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    max={25}
                    value={siteInfo.max_featured_posts ?? 5}
                    onChange={(e) =>
                      setSiteInfo({
                        ...siteInfo,
                        max_featured_posts: Math.max(1, Math.min(25, Number(e.target.value) || 1)),
                      })
                    }
                    className="w-28 text-xs p-2.5 rounded-lg bg-white border border-[#dcd8cd] font-mono outline-none focus:border-emerald-700"
                  />
                  <p className="text-[11px] text-gray-500">
                    {lang === "ur"
                      ? "جب نئی پوسٹ فیچرڈ ہو اور حد پوری ہو جائے تو سب سے پرانی فیچرڈ پوسٹ خودکار طور پر نارمل ہو جائے گی۔"
                      : "When a new article is marked Featured above this limit, the oldest featured post automatically reverts to normal."}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Email (SMTP) & Test Card (matching scraped-site) */}
          <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-2xl p-5 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-gray-900 pb-2 border-b border-[#dcd8cd] flex items-center gap-2">
              <Mail size={18} className="text-emerald-700" />
              <span>Email (SMTP)</span>
            </h2>
            <p className="text-xs text-gray-600">
              Used to deliver inquiry replies and newsroom alerts. Save your changes before testing.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">SMTP Host</label>
                <input
                  type="text"
                  value={smtpConfig.host || ""}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                  placeholder="smtp.gmail.com"
                  className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#dcd8cd] font-mono outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Port (587 STARTTLS · 465 TLS)</label>
                <input
                  type="number"
                  value={smtpConfig.port || 587}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, port: Number(e.target.value) || 587 })}
                  className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#dcd8cd] font-mono outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  value={smtpConfig.user || ""}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, user: e.target.value })}
                  placeholder="editor@dailyafadiat.com"
                  className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#dcd8cd] font-mono outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Password <span className="font-normal text-gray-500">(Leave blank to keep saved)</span>
                </label>
                <input
                  type="password"
                  value={smtpConfig.pass || ""}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, pass: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#dcd8cd] font-mono outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-gray-700 mb-1">From Address</label>
                <input
                  type="text"
                  value={smtpConfig.from || ""}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, from: e.target.value })}
                  placeholder="Daily Afadiat <no-reply@dailyafadiat.com>"
                  className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#dcd8cd] font-mono outline-none"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(smtpConfig.secure)}
                onChange={(e) => setSmtpConfig({ ...smtpConfig, secure: e.target.checked })}
                className="size-4 accent-emerald-700"
              />
              <span>Use implicit TLS (turn on for port 465; leave off for 587)</span>
            </label>

            <div className="pt-3 border-t border-[#dcd8cd] flex flex-wrap items-center gap-2">
              <input
                type="email"
                value={testEmailTo}
                onChange={(e) => setTestEmailTo(e.target.value)}
                placeholder="you@example.com"
                className="text-xs p-2 rounded-lg bg-white border border-[#dcd8cd] font-mono w-64 outline-none"
              />
              <button
                type="button"
                disabled={sendingTestEmail}
                onClick={handleSendTestEmail}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-white border border-[#dcd8cd] hover:bg-gray-50 text-gray-800 cursor-pointer disabled:opacity-50"
              >
                {sendingTestEmail ? "Sending..." : "Send test"}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-xl flex items-center gap-2 transition shadow-xs disabled:opacity-50"
            >
              <Save size={16} />
              <span>{saving ? "Saving..." : t("save_changes")}</span>
            </button>
          </div>
        </form>
      ) : (
        /* 2. Reader Inquiries Tab (Inbox) */
        <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-2xl p-5 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-gray-900 pb-2 border-b border-[#dcd8cd] flex items-center gap-2">
            <Inbox size={18} className="text-emerald-700" />
            <span>{t("tab_inbox_messages")}</span>
          </h2>

          {loading ? (
            <div className="p-8 text-center text-xs text-gray-500">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500">{t("inbox_no_messages")}</div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className="bg-white border border-[#dcd8cd] rounded-xl p-4 shadow-2xs space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 pb-2 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-gray-900">{msg.name}</span>
                      <span className="text-xs text-gray-500 font-mono">({msg.email})</span>
                      {msg.phone && (
                        <span className="text-xs text-emerald-800 font-mono">📱 {msg.phone}</span>
                      )}
                    </div>
                    <span className="text-[11px] text-gray-400 font-sans">
                      {new Date(msg.created_at).toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <strong className="block text-xs text-emerald-800 font-bold mb-1">
                      Subject: {msg.subject}
                    </strong>
                    <p className="text-xs sm:text-sm text-gray-800 leading-relaxed bg-[#f7f6f3] p-3 rounded-lg border border-[#dcd8cd]/60">
                      {msg.message}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <a
                      href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                      className="text-xs text-emerald-700 hover:underline font-semibold flex items-center gap-1"
                    >
                      <Mail size={12} />
                      <span>Reply via Email</span>
                    </a>

                    <button
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition"
                      title="Delete inquiry"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
