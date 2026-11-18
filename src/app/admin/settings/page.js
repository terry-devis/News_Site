"use client";
import React, { useState, useEffect } from "react";
import {
  Share2,
  Save,
  CheckCircle,
  Globe,
  Mail,
  Phone,
  Info,
} from "lucide-react";

export default function SettingsAdmin() {
  const [socialLinks, setSocialLinks] = useState({
    youtube: "",
    whatsapp: "",
    facebook: "",
    instagram: "",
    twitter: "",
    tiktok: "",
  });

  const [siteInfo, setSiteInfo] = useState({
    title_ur: "ڈیلی افادیت",
    tagline_ur: "سچ کے ساتھ، ہر لمحہ باخبر — TRUST • FACTS • GLOBAL NEWS",
    contact_email: "editor@dailyafadiat.com",
    contact_phone: "+92 300 1234567",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        if (data.social_links) setSocialLinks(data.social_links);
        if (data.site_info) setSiteInfo(data.site_info);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
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
      ]);

      setNotice("تمام ترتیبات کامیابی کے ساتھ محفوظ ہو گئیں۔ ہیڈر اور فوٹر فوری اپ ڈیٹ ہو گئے ہیں۔");
    } catch (err) {
      alert("محفوظ کرنے میں خرابی ہوئی۔");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold urdu-headline text-gray-900">
          سوشل میڈیا اور رابطہ کی ترتیبات
        </h1>
        <p className="text-xs text-gray-600 mt-0.5">
          یہاں سے آپ سوشل میڈیا کے تمام آفیشل چینلز، ہیڈر و فوٹر کے لنکس اور رابطہ نمبر تبدیل کر سکتے ہیں۔
        </p>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-lg text-xs font-semibold flex items-center gap-2">
          <CheckCircle size={16} />
          <span>{notice}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* 1. Official Social Media Links */}
        <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-gray-900 pb-2 border-b border-[#dcd8cd] flex items-center gap-2">
            <Share2 size={18} className="text-emerald-700" />
            <span>آفیشل سوشل میڈیا لنکس (Social Media Accounts)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* YouTube */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                YouTube چینل لنک
              </label>
              <input
                type="text"
                value={socialLinks.youtube}
                onChange={(e) => setSocialLinks({ ...socialLinks, youtube: e.target.value })}
                placeholder="https://youtube.com/@dailyafadiat"
                className="w-full text-xs p-2.5 rounded bg-white border border-[#dcd8cd] font-mono text-left outline-none"
              />
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                WhatsApp چینل / گروپ لنک
              </label>
              <input
                type="text"
                value={socialLinks.whatsapp}
                onChange={(e) => setSocialLinks({ ...socialLinks, whatsapp: e.target.value })}
                placeholder="https://whatsapp.com/channel/..."
                className="w-full text-xs p-2.5 rounded bg-white border border-[#dcd8cd] font-mono text-left outline-none"
              />
            </div>

            {/* Facebook */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Facebook پیج لنک
              </label>
              <input
                type="text"
                value={socialLinks.facebook}
                onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
                placeholder="https://facebook.com/dailyafadiat"
                className="w-full text-xs p-2.5 rounded bg-white border border-[#dcd8cd] font-mono text-left outline-none"
              />
            </div>

            {/* Instagram */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Instagram پروفائل لنک
              </label>
              <input
                type="text"
                value={socialLinks.instagram}
                onChange={(e) => setSocialLinks({ ...socialLinks, instagram: e.target.value })}
                placeholder="https://instagram.com/dailyafadiat"
                className="w-full text-xs p-2.5 rounded bg-white border border-[#dcd8cd] font-mono text-left outline-none"
              />
            </div>

            {/* Twitter / X */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                X / Twitter اکاؤنٹ لنک
              </label>
              <input
                type="text"
                value={socialLinks.twitter}
                onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
                placeholder="https://x.com/dailyafadiat"
                className="w-full text-xs p-2.5 rounded bg-white border border-[#dcd8cd] font-mono text-left outline-none"
              />
            </div>

            {/* TikTok */}
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                TikTok اکاؤنٹ لنک
              </label>
              <input
                type="text"
                value={socialLinks.tiktok}
                onChange={(e) => setSocialLinks({ ...socialLinks, tiktok: e.target.value })}
                placeholder="https://tiktok.com/@dailyafadiat"
                className="w-full text-xs p-2.5 rounded bg-white border border-[#dcd8cd] font-mono text-left outline-none"
              />
            </div>
          </div>
        </div>

        {/* 2. Site Tagline & Contact Details */}
        <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-gray-900 pb-2 border-b border-[#dcd8cd] flex items-center gap-2">
            <Info size={18} className="text-emerald-700" />
            <span>پورٹل کی عمومی تفصیلات اور رابطہ</span>
          </h2>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                ادارے کا موٹو / ٹیگ لائن (Tagline)
              </label>
              <input
                type="text"
                value={siteInfo.tagline_ur}
                onChange={(e) => setSiteInfo({ ...siteInfo, tagline_ur: e.target.value })}
                className="w-full text-xs p-2.5 rounded bg-white border border-[#dcd8cd] outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  رابطہ ای میل (Official Email)
                </label>
                <input
                  type="email"
                  value={siteInfo.contact_email}
                  onChange={(e) => setSiteInfo({ ...siteInfo, contact_email: e.target.value })}
                  className="w-full text-xs p-2.5 rounded bg-white border border-[#dcd8cd] font-mono text-left outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  رابطہ فون / واٹس ایپ نمبر
                </label>
                <input
                  type="text"
                  value={siteInfo.contact_phone}
                  onChange={(e) => setSiteInfo({ ...siteInfo, contact_phone: e.target.value })}
                  className="w-full text-xs p-2.5 rounded bg-white border border-[#dcd8cd] font-mono text-left outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm px-6 py-2.5 rounded-lg flex items-center gap-2 transition shadow-xs disabled:opacity-50"
          >
            <Save size={16} />
            <span>{saving ? "محفوظ کیا جا رہا ہے..." : "تمام ترتیبات محفوظ کریں"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
