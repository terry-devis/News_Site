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
  });

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

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t("field_timings")}
                </label>
                <input
                  type="text"
                  value={contactInfo.timing_ur}
                  onChange={(e) => setContactInfo({ ...contactInfo, timing_ur: e.target.value })}
                  placeholder="پیر تا ہفتہ: صبح ۹ تا شام ۶ بجے"
                  className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#dcd8cd] outline-none"
                />
              </div>
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
