"use client";
import React, { useState, useEffect } from "react";
import Header from "@/component/Header";
import Footer from "@/component/Footer";
import NewsletterBox from "@/component/NewsletterBox";
import {
  MapPin,
  Phone,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Clock,
  Share2,
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [contactInfo, setContactInfo] = useState({
    address_ur: "شاہراہِ قائدین، صدر، کراچی، پاکستان",
    phone: "+92 300 1234567",
    whatsapp: "+92 300 1234567",
    editorial_email: "editor@dailyafadiat.com",
    ads_email: "ads@dailyafadiat.com",
    timing_ur: "پیر تا ہفتہ: صبح ۹ تا شام ۶ بجے",
  });

  const [socialLinks, setSocialLinks] = useState({
    youtube: "https://youtube.com/@dailyafadiat",
    whatsapp: "https://whatsapp.com",
    facebook: "https://facebook.com/dailyafadiat",
    instagram: "https://instagram.com/dailyafadiat",
    twitter: "https://x.com/dailyafadiat",
    tiktok: "https://tiktok.com/@dailyafadiat",
  });

  const [status, setStatus] = useState(null); // 'submitting', 'success', 'error'
  const [responseMsg, setResponseMsg] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        const [contactRes, settingsRes] = await Promise.all([
          fetch("/api/contact").then((r) => r.json()),
          fetch("/api/settings").then((r) => r.json()),
        ]);

        if (contactRes.contactInfo) setContactInfo(contactRes.contactInfo);
        if (settingsRes.social_links) setSocialLinks(settingsRes.social_links);
      } catch (e) {
        console.error("Failed to load contact data:", e);
      }
    }
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) return;

    setStatus("submitting");
    setResponseMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus("success");
        setResponseMsg(data.message || "آپ کا پیغام کامیابی کے ساتھ موصول ہو گیا ہے!");
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      } else {
        setStatus("error");
        setResponseMsg(data.error || "پیغام بھیجنے میں خرابی ہوئی، دوبارہ کوشش کریں۔");
      }
    } catch (err) {
      setStatus("error");
      setResponseMsg("نیٹ ورک خرابی، براہ کرم بعد میں کوشش کریں۔");
    }
  };

  return (
    <div className="min-h-screen text-gray-900 font-sans">
      <Header />

      <main className="u-shell py-6 sm:py-10">
        {/* 1. Page Header (Daily Insaaf Style) */}
        <header className="border-b-2 border-[#1a1a1a] pb-3 mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold urdu-headline text-gray-900">
            ہم سے رابطہ کریں
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed urdu-body">
            خبر، تجویز، شکایت یا اشتہارات کے لیے ہم سے رابطہ کرنے کے لیے درج ذیل ذرائع استعمال کریں۔
          </p>
        </header>

        {/* 2. Two-Column Broadsheet Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content: Contact Form (8 Cols in RTL, right side) */}
          <div className="lg:col-span-8">
            <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-2xl p-6 sm:p-8 shadow-xs">
              <div className="mb-6">
                <h2 className="text-xl sm:text-2xl font-bold urdu-headline text-gray-900 flex items-center gap-2">
                  <MessageSquare size={22} className="text-emerald-700" />
                  <span>ہمیں پیغام بھیجیں</span>
                </h2>
                <p className="text-gray-600 text-xs sm:text-sm mt-1 urdu-body">
                  کوئی سوال، تجویز یا خبر؟ نیچے دیا گیا فارم پُر کریں، ہماری ادارتی ٹیم جلد جواب دے گی۔
                </p>
              </div>

              {status === "success" && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs sm:text-sm flex items-center gap-3">
                  <CheckCircle2 size={24} className="shrink-0 text-emerald-600" />
                  <span className="font-semibold">{responseMsg}</span>
                </div>
              )}

              {status === "error" && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs sm:text-sm flex items-center gap-3">
                  <AlertCircle size={22} className="shrink-0 text-red-600" />
                  <span>{responseMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Row 1: Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">
                      آپ کا نام <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثلاً: محمد علی"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full text-xs sm:text-sm p-3 rounded-lg bg-white border border-[#dcd8cd] focus:border-emerald-600 outline-none shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">
                      ای میل ایڈریس <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      dir="ltr"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full text-xs sm:text-sm p-3 rounded-lg bg-white border border-[#dcd8cd] focus:border-emerald-600 outline-none text-left font-sans shadow-xs"
                    />
                  </div>
                </div>

                {/* Row 2: Phone & Subject */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">
                      فون / واٹس ایپ نمبر <span className="text-gray-400 font-normal">(اختیاری)</span>
                    </label>
                    <input
                      type="tel"
                      dir="ltr"
                      placeholder="+92 300 0000000"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full text-xs sm:text-sm p-3 rounded-lg bg-white border border-[#dcd8cd] focus:border-emerald-600 outline-none text-left font-sans shadow-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-800 mb-1.5">
                      موضوع (Subject) <span className="text-gray-400 font-normal">(اختیاری)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="خبر کی تصدیق، اشتہار یا عام استفسار..."
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full text-xs sm:text-sm p-3 rounded-lg bg-white border border-[#dcd8cd] focus:border-emerald-600 outline-none shadow-xs"
                    />
                  </div>
                </div>

                {/* Row 3: Message Content */}
                <div>
                  <label className="block text-xs font-bold text-gray-800 mb-1.5">
                    تفصیلی پیغام <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={6}
                    placeholder="اپنا تفصیلی پیغام یا خبر تحریر کریں..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full text-xs sm:text-sm p-3.5 rounded-lg bg-white border border-[#dcd8cd] focus:border-emerald-600 outline-none urdu-body leading-relaxed shadow-xs"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-2 flex items-center justify-between">
                  <span className="text-[11px] text-gray-500">
                    نوٹ: ہم آپ کی ذاتی معلومات کو مکمل صیغہ راز میں رکھتے ہیں۔
                  </span>
                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition flex items-center gap-2 shadow-xs disabled:opacity-50"
                  >
                    <Send size={15} />
                    <span>{status === "submitting" ? "بھیجا جا رہا ہے..." : "پیغام بھیجیں"}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Sidebar: Details & Social Channels (4 Cols in RTL, left side) */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* 1. Office & Contact Card */}
            <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-base text-gray-900 pb-2 border-b border-[#dcd8cd] flex items-center gap-2">
                <MapPin size={18} className="text-emerald-700" />
                <span>دفتر اور رابطہ کی معلومات</span>
              </h3>

              <div className="space-y-3.5 text-xs sm:text-[13px] text-gray-700 font-sans">
                {/* Address */}
                <div className="flex items-start gap-2.5">
                  <MapPin size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-gray-900 font-bold mb-0.5">مرکزی دفتر:</strong>
                    <span className="urdu-body leading-relaxed">{contactInfo.address_ur}</span>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-2.5">
                  <Phone size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-gray-900 font-bold mb-0.5">فون و واٹس ایپ:</strong>
                    <a href={`tel:${contactInfo.phone}`} className="hover:text-emerald-700 font-mono" dir="ltr">
                      {contactInfo.phone}
                    </a>
                  </div>
                </div>

                {/* Editorial Email */}
                <div className="flex items-start gap-2.5">
                  <Mail size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-gray-900 font-bold mb-0.5">ادارتی ڈیسک (Editorial):</strong>
                    <a href={`mailto:${contactInfo.editorial_email}`} className="hover:text-emerald-700 font-mono text-[12px]">
                      {contactInfo.editorial_email}
                    </a>
                  </div>
                </div>

                {/* Ads Email */}
                <div className="flex items-start gap-2.5">
                  <Mail size={16} className="text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-gray-900 font-bold mb-0.5">اشتہارات و کمرشل (Advertising):</strong>
                    <a href={`mailto:${contactInfo.ads_email}`} className="hover:text-emerald-700 font-mono text-[12px]">
                      {contactInfo.ads_email}
                    </a>
                  </div>
                </div>

                {/* Timings */}
                {contactInfo.timing_ur && (
                  <div className="flex items-start gap-2.5 pt-2 border-t border-[#dcd8cd]">
                    <Clock size={16} className="text-gray-500 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-gray-900 font-bold mb-0.5">دفتری اوقات:</strong>
                      <span className="text-gray-600 urdu-body">{contactInfo.timing_ur}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Social Channels Card (Daily Insaaf Style) */}
            <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-2xl p-5 shadow-xs">
              <h3 className="font-bold text-base text-gray-900 pb-2 border-b border-[#dcd8cd] flex items-center gap-2 mb-3">
                <Share2 size={18} className="text-emerald-700" />
                <span>ہمیں فالو کریں</span>
              </h3>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {/* YouTube */}
                <a
                  href={socialLinks.youtube || "https://youtube.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-10 rounded-full bg-[#FF0000] text-white grid place-items-center hover:scale-105 transition shadow-xs"
                  title="YouTube"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>

                {/* WhatsApp */}
                <a
                  href={socialLinks.whatsapp || "https://whatsapp.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-10 rounded-full bg-[#25D366] text-white grid place-items-center hover:scale-105 transition shadow-xs"
                  title="WhatsApp"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.885 3.488"/>
                  </svg>
                </a>

                {/* Facebook */}
                <a
                  href={socialLinks.facebook || "https://facebook.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-10 rounded-full bg-[#1877F2] text-white grid place-items-center hover:scale-105 transition shadow-xs"
                  title="Facebook"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>

                {/* Instagram */}
                <a
                  href={socialLinks.instagram || "https://instagram.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-10 rounded-full bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white grid place-items-center hover:scale-105 transition shadow-xs"
                  title="Instagram"
                >
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                  </svg>
                </a>

                {/* X / Twitter */}
                <a
                  href={socialLinks.twitter || "https://x.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-10 rounded-full bg-black text-white grid place-items-center hover:scale-105 transition shadow-xs"
                  title="X (Twitter)"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>

                {/* TikTok */}
                <a
                  href={socialLinks.tiktok || "https://tiktok.com"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="size-10 rounded-full bg-black text-white grid place-items-center hover:scale-105 transition shadow-xs"
                  title="TikTok"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* 3. Newsletter Box */}
            <NewsletterBox variant="light" />

          </aside>

        </div>
      </main>

      <Footer />
    </div>
  );
}
