"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Megaphone,
  Upload,
  CheckCircle,
  Save,
  Code,
  Image as ImageIcon,
} from "lucide-react";
import { useAdminLanguage } from "@/context/AdminLanguageContext";

export default function AdsAdmin() {
  const { t, lang } = useAdminLanguage();

  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingSlot, setSavingSlot] = useState(null);
  const [notice, setNotice] = useState(null);
  const [uploadingFor, setUploadingFor] = useState(null);

  async function loadSlots() {
    setLoading(true);
    try {
      const res = await fetch("/api/ads");
      const data = await res.json();
      setSlots(data.slots || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSlots();
  }, []);

  const handleSlotChange = (slotKey, field, val) => {
    setSlots(
      slots.map((s) => (s.slot_key === slotKey ? { ...s, [field]: val } : s))
    );
  };

  const handleFileUpload = async (slotKey, e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingFor(slotKey);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        handleSlotChange(slotKey, "image_url", data.url);
        setNotice({
          slotKey,
          text: lang === "ur" ? "تصویر Cloudflare R2 پر اپلوڈ ہو گئی۔ محفوظ کرنا نہ بھولیں!" : "Banner uploaded to Cloudflare R2! Don't forget to save.",
        });
      } else {
        alert(data.error || "Upload failed");
      }
    } catch (err) {
      alert("Network error");
    } finally {
      setUploadingFor(null);
    }
  };

  const handleSave = async (slot) => {
    setSavingSlot(slot.slot_key);
    try {
      const res = await fetch("/api/ads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slot),
      });
      if (res.ok) {
        setNotice({
          slotKey: slot.slot_key,
          text: lang === "ur" ? "اشتہار کی ترتیبات کامیابی کے ساتھ محفوظ ہو گئیں۔" : "Banner settings saved successfully!",
        });
      }
    } catch (e) {
      alert("Failed to save banner");
    } finally {
      setSavingSlot(null);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
          {t("ads_page_title")}
        </h1>
        <p className="text-xs text-gray-600 mt-0.5">
          {t("ads_page_desc")}
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-gray-500 bg-[#efeee9] rounded-2xl border border-[#dcd8cd]">
          Loading advertisement slots...
        </div>
      ) : (
        <div className="space-y-6">
          {slots.map((slot) => (
            <div
              key={slot.slot_key}
              className="bg-[#efeee9] border border-[#dcd8cd] rounded-2xl p-5 shadow-xs space-y-4"
            >
              {/* Top row: Title, Key, Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#dcd8cd]">
                <div>
                  <h3 className="font-bold text-base text-gray-900 flex items-center gap-2">
                    <Megaphone size={18} className="text-emerald-700" />
                    <span>{slot.title}</span>
                  </h3>
                  <span className="text-[11px] text-gray-500 font-mono">{slot.slot_key}</span>
                </div>

                <div className="flex items-center gap-4">
                  {/* Active Toggle Switch */}
                  <label className="flex items-center gap-2 cursor-pointer">
                    <span className="text-xs font-bold text-gray-700">
                      {slot.is_active ? t("status_active") : t("status_disabled")}
                    </span>
                    <input
                      type="checkbox"
                      checked={slot.is_active}
                      onChange={(e) =>
                        handleSlotChange(slot.slot_key, "is_active", e.target.checked)
                      }
                      className="size-4.5 rounded accent-emerald-700"
                    />
                  </label>

                  <button
                    onClick={() => handleSave(slot)}
                    disabled={savingSlot === slot.slot_key}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <Save size={14} />
                    <span>{savingSlot === slot.slot_key ? "..." : t("save_changes")}</span>
                  </button>
                </div>
              </div>

              {notice?.slotKey === slot.slot_key && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-xl text-xs flex items-center gap-1.5 font-medium">
                  <CheckCircle size={15} />
                  <span>{notice.text}</span>
                </div>
              )}

              {/* Type Switcher: Image Banner vs AdSense / Code */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSlotChange(slot.slot_key, "ad_type", "image")}
                  className={`text-xs px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                    slot.ad_type === "image"
                      ? "bg-emerald-800 text-white shadow-xs"
                      : "bg-white text-gray-700 border border-[#dcd8cd]"
                  }`}
                >
                  <ImageIcon size={14} />
                  <span>{t("tab_image_banner")}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSlotChange(slot.slot_key, "ad_type", "code")}
                  className={`text-xs px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                    slot.ad_type === "code"
                      ? "bg-emerald-800 text-white shadow-xs"
                      : "bg-white text-gray-700 border border-[#dcd8cd]"
                  }`}
                >
                  <Code size={14} />
                  <span>{t("tab_code_snippet")}</span>
                </button>
              </div>

              {/* 1. Image Banner Settings */}
              {slot.ad_type === "image" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        {t("field_banner_image_url")}
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={slot.image_url || ""}
                        onChange={(e) =>
                          handleSlotChange(slot.slot_key, "image_url", e.target.value)
                        }
                        placeholder="https://pub-....r2.dev/banner.jpg"
                        className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#dcd8cd] font-mono text-left"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        {t("field_target_url")}
                      </label>
                      <input
                        type="text"
                        dir="ltr"
                        value={slot.target_url || ""}
                        onChange={(e) =>
                          handleSlotChange(slot.slot_key, "target_url", e.target.value)
                        }
                        placeholder="https://advertiser-website.com"
                        className="w-full text-xs p-2.5 rounded-lg bg-white border border-[#dcd8cd] font-mono text-left"
                      />
                    </div>

                    <div>
                      <label className="border-2 border-dashed border-[#dcd8cd] hover:border-emerald-600 rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer bg-white transition text-xs font-bold text-emerald-800">
                        <Upload size={16} />
                        <span>
                          {uploadingFor === slot.slot_key
                            ? "Uploading to Cloudflare R2..."
                            : t("btn_pick_file")}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(slot.slot_key, e)}
                          disabled={uploadingFor === slot.slot_key}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  {/* Preview Box */}
                  <div className="bg-white border border-[#dcd8cd] rounded-xl p-3 flex flex-col items-center justify-center min-h-[140px] text-center">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-sans mb-1">
                      {t("preview_banner_text")}
                    </span>
                    {slot.image_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={slot.image_url}
                        alt="Ad Preview"
                        className="max-h-28 object-contain rounded-lg shadow-xs"
                      />
                    ) : (
                      <p className="text-xs text-gray-400">
                        No image uploaded yet. A contact placeholder will be visible to readers.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* 2. Code Snippet Settings */}
              {slot.ad_type === "code" && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    {t("field_adsense_snippet")}
                  </label>
                  <textarea
                    rows={4}
                    dir="ltr"
                    value={slot.code_snippet || ""}
                    onChange={(e) =>
                      handleSlotChange(slot.slot_key, "code_snippet", e.target.value)
                    }
                    placeholder="<script async src='https://pagead2.googlesyndication.com...'></script><ins class='adsbygoogle' ...></ins>"
                    className="w-full text-xs p-3 rounded-lg bg-white border border-[#dcd8cd] font-mono text-left leading-relaxed outline-none"
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
