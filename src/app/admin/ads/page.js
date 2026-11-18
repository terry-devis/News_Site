"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  Megaphone,
  Upload,
  CheckCircle,
  XCircle,
  Save,
  Eye,
  Code,
  Image as ImageIcon,
} from "lucide-react";

export default function AdsAdmin() {
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
          text: `تصویر Cloudflare R2 پر اپلوڈ ہو گئی۔ محفوظ کرنا نہ بھولیں!`,
        });
      } else {
        alert(data.error || "اپلوڈ میں خرابی ہوئی");
      }
    } catch (err) {
      alert("نیٹ ورک خرابی");
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
          text: "اشتہار کی ترتیبات کامیابی کے ساتھ محفوظ ہو گئیں۔",
        });
      }
    } catch (e) {
      alert("محفوظ کرنے میں خرابی ہوئی");
    } finally {
      setSavingSlot(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold urdu-headline text-gray-900">
          اشتہارات اور پلیس ہولڈرز کا کنٹرول (Ads Manager)
        </h1>
        <p className="text-xs text-gray-600 mt-0.5">
          پورٹل پر تمام بینرز کو فعال/غیر فعال کریں، Cloudflare R2 سے بینر اپلوڈ کریں، یا گوگل ایڈسینس کوڈ لگائیں۔
        </p>
      </div>

      {loading ? (
        <div className="p-8 text-center text-xs text-gray-500 bg-[#efeee9] rounded-xl border border-[#dcd8cd]">
          اشتہارات لوڈ ہو رہے ہیں...
        </div>
      ) : (
        <div className="space-y-6">
          {slots.map((slot) => (
            <div
              key={slot.slot_key}
              className="bg-[#efeee9] border border-[#dcd8cd] rounded-xl p-5 shadow-xs space-y-4"
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
                      {slot.is_active ? "فعال (Active)" : "غیر فعال (Disabled)"}
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
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <Save size={14} />
                    <span>{savingSlot === slot.slot_key ? "..." : "محفوظ کریں"}</span>
                  </button>
                </div>
              </div>

              {notice?.slotKey === slot.slot_key && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded text-xs flex items-center gap-1.5 font-medium">
                  <CheckCircle size={15} />
                  <span>{notice.text}</span>
                </div>
              )}

              {/* Type Switcher: Image Banner vs AdSense / Code */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSlotChange(slot.slot_key, "ad_type", "image")}
                  className={`text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                    slot.ad_type === "image"
                      ? "bg-emerald-800 text-white shadow-xs"
                      : "bg-white text-gray-700 border border-[#dcd8cd]"
                  }`}
                >
                  <ImageIcon size={14} />
                  <span>تصویری بینر (R2 Image Banner)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSlotChange(slot.slot_key, "ad_type", "code")}
                  className={`text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition ${
                    slot.ad_type === "code"
                      ? "bg-emerald-800 text-white shadow-xs"
                      : "bg-white text-gray-700 border border-[#dcd8cd]"
                  }`}
                >
                  <Code size={14} />
                  <span>ایڈسینس / کسٹم ایچ ٹی ایم ایل کوڈ (AdSense Script)</span>
                </button>
              </div>

              {/* 1. Image Banner Settings */}
              {slot.ad_type === "image" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        بینر کی تصویر (R2 URL)
                      </label>
                      <input
                        type="text"
                        value={slot.image_url || ""}
                        onChange={(e) =>
                          handleSlotChange(slot.slot_key, "image_url", e.target.value)
                        }
                        placeholder="https://... بینر تصویر کا URL"
                        className="w-full text-xs p-2.5 rounded bg-white border border-[#dcd8cd] font-mono text-left"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">
                        کلک کرنے پر منزل کا لنک (Target Destination URL)
                      </label>
                      <input
                        type="text"
                        value={slot.target_url || ""}
                        onChange={(e) =>
                          handleSlotChange(slot.slot_key, "target_url", e.target.value)
                        }
                        placeholder="https://client-website.com"
                        className="w-full text-xs p-2.5 rounded bg-white border border-[#dcd8cd] font-mono text-left"
                      />
                    </div>

                    <div>
                      <label className="border-2 border-dashed border-[#dcd8cd] hover:border-emerald-600 rounded-lg p-3 flex items-center justify-center gap-2 cursor-pointer bg-white transition text-xs font-bold text-emerald-800">
                        <Upload size={16} />
                        <span>
                          {uploadingFor === slot.slot_key
                            ? "تصویر اپلوڈ ہو رہی ہے..."
                            : "کمپیوٹر سے بینر اپلوڈ کریں (Cloudflare R2)"}
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
                  <div className="bg-white border border-[#dcd8cd] rounded-lg p-3 flex flex-col items-center justify-center min-h-[140px] text-center">
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest font-sans mb-1">
                      بینر کا براہ راست پیش منظر
                    </span>
                    {slot.image_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={slot.image_url}
                        alt="Ad Preview"
                        className="max-h-28 object-contain rounded shadow-xs"
                      />
                    ) : (
                      <p className="text-xs text-gray-400">
                        کوئی تصویر اپلوڈ نہیں ہے۔ عوام کو رابطہ کا پلیس ہولڈر نظر آئے گا۔
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* 2. Code Snippet Settings */}
              {slot.ad_type === "code" && (
                <div className="pt-2">
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    گوگل ایڈسینس یا کسٹم اشتہاری سکرپٹ (AdSense / HTML Code)
                  </label>
                  <textarea
                    rows={4}
                    value={slot.code_snippet || ""}
                    onChange={(e) =>
                      handleSlotChange(slot.slot_key, "code_snippet", e.target.value)
                    }
                    placeholder="<script async src='https://pagead2.googlesyndication.com...'></script><ins class='adsbygoogle' ...></ins>"
                    className="w-full text-xs p-3 rounded bg-white border border-[#dcd8cd] font-mono text-left leading-relaxed outline-none"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">
                    یہاں آپ گوگل ایڈسینس کا پورا ایڈ کوڈ یا افیلیٹ ایچ ٹی ایم ایل بینر پیسٹ کر سکتے ہیں۔
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
