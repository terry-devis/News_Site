"use client";
import React, { useState } from "react";
import Header from "@/component/Header";
import Footer from "@/component/Footer";
import NewsletterBox from "@/component/NewsletterBox";
import { useSiteLanguage } from "@/context/SiteLanguageContext";
import {
  Megaphone,
  TrendingUp,
  Users,
  Target,
  Award,
  Download,
  Phone,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Layout,
  Flame,
  FileText,
  Smartphone,
  Globe,
} from "lucide-react";

export default function AdvertiseClient({ categories = [], breakingNews = [] }) {
  const { isUrdu, isEnglish, dir } = useSiteLanguage();

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    adSlot: "leaderboard",
    budget: "standard",
    message: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const stats = [
    { value: "5.2M+", label_ur: "ماہانہ قارئین", label_en: "Monthly Readers", icon: Users },
    { value: "18.5M+", label_ur: "ماہانہ پیج ویوز", label_en: "Monthly Pageviews", icon: TrendingUp },
    { value: "72%", label_ur: "بااثر فیصلہ ساز قارئین", label_en: "High-Income & Decision Makers", icon: Target },
    { value: "24/7", label_ur: "ڈیجیٹل و پرنٹ رسائی", label_en: "Digital & Print Visibility", icon: Award },
  ];

  const adFormats = [
    {
      id: "leaderboard",
      title_ur: "ٹاپ ہیڈر لیڈر بورڈ بینر",
      title_en: "Top Leaderboard Banner",
      dimensions: "728 × 90 px (Desktop) / 320 × 50 px (Mobile)",
      desc_ur: "ہر صفحے پر سب سے نمایاں مقام۔ ویب سائٹ پر آتے ہی قاری کی پہلی نظر آپ کے برانڈ پر پڑے گی۔",
      desc_en: "Prime placement at the top of every page. Highest impression volume and instant recall.",
      tag: "پریمیم سلاٹ",
      icon: Layout,
    },
    {
      id: "inarticle",
      title_ur: "مضامین کے اندر بینر",
      title_en: "In-Article Content Banner",
      dimensions: "300 × 250 px / 336 × 280 px",
      desc_ur: "خبر پڑھنے کے دوران قاری کی بھرپور توجہ۔ ہائی کلک تھرو ریٹ (CTR) کے لیے بہترین آپشن۔",
      desc_en: "Embedded directly between news paragraphs for optimal engagement and high CTR.",
      tag: "بہترین سی ٹی آر",
      icon: FileText,
    },
    {
      id: "breaking_sponsor",
      title_ur: "بریکنگ نیوز پٹی اسپانسر شپ",
      title_en: "Breaking News Ticker Sponsor",
      dimensions: "لوگو + برانڈ نیم + اسپانسرڈ میسج",
      desc_ur: "اوپری ریڈ بریکنگ پٹی پر آپ کے برانڈ کا مسلسل لائیو نام۔ لاکھوں ناظرین کو مستقل یاد دہانی۔",
      desc_en: "Exclusive brand placement alongside the top red breaking news marquee across the site.",
      tag: "خصوصی برانڈنگ",
      icon: Flame,
    },
    {
      id: "epaper_ad",
      title_ur: "ڈیجیٹل ای پیپر پرنٹ اشتہارات",
      title_en: "Digital ePaper Display Ads",
      dimensions: "کوارٹر پیج / ہاف پیج / فرنٹ ایئر پینل",
      desc_ur: "روزنامہ افادیت کے ڈیجیٹل اخبار میں روایتی اور باوقار پرنٹ اشتہار کا امتزاج۔",
      desc_en: "Authentic print newspaper layout presence across regional and national editions.",
      tag: "پرنٹ و ڈیجیٹل",
      icon: Smartphone,
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      setErrorMsg(isUrdu ? "برائے مہربانی نام، ای میل اور فون نمبر درج کریں۔" : "Please fill required fields (Name, Email, Phone).");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${formData.name} (${formData.company || "Company"})`,
          email: formData.email,
          phone: formData.phone,
          subject: `اشتہار بکنگ استفسار - ${formData.adSlot}`,
          message: `Ad Slot: ${formData.adSlot}\nBudget: ${formData.budget}\nMessage: ${formData.message || "No specific message provided."}`,
        }),
      });

      if (res.ok) {
        setSuccessMsg(
          isUrdu
            ? "آپ کی اشتہاری استفسار کامیابی سے موصول ہو گئی ہے۔ ہمارا ایڈورٹائزنگ ڈیسک جلد آپ سے رابطہ کرے گا۔"
            : "Your advertisement inquiry has been received! Our media sales team will connect with you shortly."
        );
        setFormData({
          name: "",
          company: "",
          email: "",
          phone: "",
          adSlot: "leaderboard",
          budget: "standard",
          message: "",
        });
      } else {
        setErrorMsg(isUrdu ? "بھیجنے میں خرابی ہوئی۔ دوبارہ کوشش کریں۔" : "Error submitting inquiry. Please try again.");
      }
    } catch (err) {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f6f3] flex flex-col font-sans" dir={dir}>
      <Header categories={categories} breakingNews={breakingNews} />

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* Hero Section */}
        <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-3xl p-6 sm:p-12 shadow-xs text-center space-y-4 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-1.5 bg-emerald-800 text-white text-xs font-bold px-3 py-1 rounded-full font-sans shadow-xs">
            <Megaphone size={13} />
            <span>DAILY AFADIAT MEDIA KIT & ADVERTISING</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold urdu-headline text-gray-950 leading-tight">
            {isUrdu
              ? "ڈیلی افادیت کے ساتھ اپنے برانڈ کو لاکھوں بااثر قارئین تک پہنچائیں"
              : "Amplify Your Brand Reach with Pakistan's Trusted News Source"}
          </h1>

          <p className="text-sm sm:text-base text-gray-700 max-w-2xl mx-auto leading-relaxed">
            {isUrdu
              ? "پاکستان، خلیجی ممالک، برطانیہ اور امریکہ میں مقیم باخبر اور بااختیار فیصلہ ساز قارئین تک اپنے پروڈکٹس اور سروسز کی فوری اور باوقار رسائی۔"
              : "Connect with verified professionals, business leaders, and global overseas Pakistanis through high-impact digital and ePaper placements."}
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#ad-form"
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-xl transition shadow-xs cursor-pointer"
            >
              {isUrdu ? "اشتہار کے لیے رابطہ کریں" : "Book Advertisement"}
            </a>
            <button
              onClick={() => alert(isUrdu ? "میڈیا کٹ اور ریٹ کارڈ PDF ڈاؤنلوڈ ہو رہا ہے..." : "Downloading Media Kit PDF...")}
              className="bg-white hover:bg-gray-100 text-gray-800 border border-[#dcd8cd] text-xs sm:text-sm font-bold px-5 py-3 rounded-xl flex items-center gap-2 transition cursor-pointer shadow-xs"
            >
              <Download size={15} />
              <span>{isUrdu ? "آفیشل ریٹ کارڈ PDF" : "Download Rate Card PDF"}</span>
            </button>
          </div>
        </div>

        {/* Audience Metrics & Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={idx}
                className="bg-[#efeee9] border border-[#dcd8cd] rounded-2xl p-5 text-center shadow-xs space-y-1.5"
              >
                <div className="size-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto mb-2">
                  <Icon size={20} />
                </div>
                <div className="text-2xl sm:text-3xl font-black font-mono text-gray-950">
                  {s.value}
                </div>
                <div className="text-xs sm:text-sm font-bold text-gray-700 urdu-headline">
                  {isUrdu ? s.label_ur : s.label_en}
                </div>
              </div>
            );
          })}
        </div>

        {/* Ad Formats & Placements Showcase */}
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold urdu-headline text-gray-900">
              {isUrdu ? "دستیاب اشتہاری سلاٹس اور فارمیٹس" : "Available Ad Placements & Formats"}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              {isUrdu ? "اپنی مہم کے تقاضوں کے مطابق بہترین سلاٹ کا انتخاب کیجیے" : "Tailored packages designed for maximum visibility and engagement"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {adFormats.map((ad) => {
              const Icon = ad.icon;
              return (
                <div
                  key={ad.id}
                  className="bg-[#efeee9] border border-[#dcd8cd] rounded-2xl p-6 shadow-xs hover:border-emerald-600 transition space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="size-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                        <Icon size={18} />
                      </div>
                      <span className="text-[10px] font-bold bg-white text-emerald-800 border border-emerald-300 px-2.5 py-0.5 rounded-full font-sans">
                        {ad.tag}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 urdu-headline">
                      {isUrdu ? ad.title_ur : ad.title_en}
                    </h3>

                    <div className="text-xs font-mono font-semibold text-emerald-900 bg-white/70 border border-[#dcd8cd] rounded-lg px-2.5 py-1 inline-block">
                      {ad.dimensions}
                    </div>

                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                      {isUrdu ? ad.desc_ur : ad.desc_en}
                    </p>
                  </div>

                  <a
                    href="#ad-form"
                    onClick={() => setFormData({ ...formData, adSlot: ad.id })}
                    className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 pt-2 border-t border-[#dcd8cd]"
                  >
                    <span>{isUrdu ? "اس سلاٹ کے لیے کوٹیشن حاصل کریں" : "Request Quote for This Slot"}</span>
                    <span>→</span>
                  </a>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ad Booking Form & Direct Contact */}
        <div id="ad-form" className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
          
          {/* Left Column: Interactive Booking Form (8 Cols) */}
          <div className="lg:col-span-8 bg-[#efeee9] border border-[#dcd8cd] rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold urdu-headline text-gray-900">
                {isUrdu ? "اشتہار کی بکنگ یا استفسار فارم" : "Campaign Inquiry & Ad Booking Form"}
              </h2>
              <p className="text-xs text-gray-600 mt-1">
                {isUrdu
                  ? "فارم پر کیجیے، ہمارے نمائندے ۲۴ گھنٹوں میں مکمل پلان کے ساتھ رابطہ کریں گے"
                  : "Fill out the details below and our ad operations team will provide customized pricing within 24 hours."}
              </p>
            </div>

            {successMsg && (
              <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-700 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-4 bg-red-100 border border-red-300 rounded-xl text-red-900 text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={16} className="text-red-700 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">
                    {isUrdu ? "آپ کا نام *" : "Full Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder={isUrdu ? "محمد علی" : "John Doe"}
                    className="w-full p-3 rounded-xl bg-white border border-[#dcd8cd] outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">
                    {isUrdu ? "کمپنی یا برانڈ کا نام" : "Company / Brand Name"}
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder={isUrdu ? "اے بی سی انٹرپرائزز" : "ABC Corporation"}
                    className="w-full p-3 rounded-xl bg-white border border-[#dcd8cd] outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">
                    {isUrdu ? "ای میل ایڈریس *" : "Email Address *"}
                  </label>
                  <input
                    type="email"
                    dir="ltr"
                    inputMode="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="marketing@company.com"
                    className="w-full p-3 rounded-xl bg-white border border-[#dcd8cd] outline-none focus:border-emerald-600 text-left font-sans"
                  />
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">
                    {isUrdu ? "فون یا واٹس ایپ نمبر *" : "Phone / WhatsApp *"}
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+92 300 1234567"
                    className="w-full p-3 rounded-xl bg-white border border-[#dcd8cd] outline-none focus:border-emerald-600 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-800 mb-1">
                    {isUrdu ? "اشتہار کا فارمیٹ منتخب کریں" : "Preferred Ad Format"}
                  </label>
                  <select
                    value={formData.adSlot}
                    onChange={(e) => setFormData({ ...formData, adSlot: e.target.value })}
                    className="w-full p-3 rounded-xl bg-white border border-[#dcd8cd] outline-none focus:border-emerald-600 cursor-pointer"
                  >
                    <option value="leaderboard">ٹاپ ہیڈر لیڈر بورڈ (728x90)</option>
                    <option value="inarticle">مضامین کے اندر بینر (300x250)</option>
                    <option value="breaking_sponsor">بریکنگ نیوز پٹی اسپانسر شپ</option>
                    <option value="epaper_ad">ای پیپر پرنٹ ڈسپلے اشتہار</option>
                    <option value="sponsored_article">اسپانسرڈ آرٹیکل و پی آر فیچر</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-gray-800 mb-1">
                    {isUrdu ? "تخمینہ شدہ بجٹ" : "Campaign Budget"}
                  </label>
                  <select
                    value={formData.budget}
                    onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    className="w-full p-3 rounded-xl bg-white border border-[#dcd8cd] outline-none focus:border-emerald-600 cursor-pointer"
                  >
                    <option value="standard">₨ 50,000 – ₨ 150,000 (سٹینڈرڈ مہم)</option>
                    <option value="medium">₨ 150,000 – ₨ 500,000 (ماہانہ برانڈنگ)</option>
                    <option value="premium">₨ 500,000+ (پریمیم کوریج و اسپانسر شپ)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-1">
                  {isUrdu ? "مہم کی تفصیلات یا خصوصی ہدایات" : "Campaign Details or Requirements"}
                </label>
                <textarea
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder={isUrdu ? "مہم کے دورانیے، اہداف یا خصوصی تقاضوں کے بارے میں لکھیے..." : "Provide target launch date, goals, or creative specs..."}
                  className="w-full p-3 rounded-xl bg-white border border-[#dcd8cd] outline-none focus:border-emerald-600 leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 transition shadow-xs cursor-pointer disabled:opacity-50"
              >
                <Send size={15} />
                <span>{submitting ? (isUrdu ? "ارسال ہو رہا ہے..." : "Submitting...") : (isUrdu ? "اشتہار بکنگ کی درخواست بھیجیں" : "Submit Advertising Request")}</span>
              </button>
            </form>
          </div>

          {/* Right Column: Direct Contact & WhatsApp (4 Cols) */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* Quick Contact Card */}
            <div className="bg-[#efeee9] border border-[#dcd8cd] rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-base text-gray-900 border-b border-[#dcd8cd] pb-2">
                {isUrdu ? "براہ راست رابطہ برائے اشتہارات" : "Direct Ad Inquiries"}
              </h3>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <Phone size={15} className="text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-gray-900 block">{isUrdu ? "فون و واٹس ایپ:" : "Phone & WhatsApp:"}</span>
                    <a href="tel:+923001234567" className="text-gray-600 hover:text-emerald-800 font-mono">+92 300 1234567</a>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Mail size={15} className="text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-gray-900 block">{isUrdu ? "ای میل ڈیسک:" : "Advertising Email:"}</span>
                    <a href="mailto:ads@dailyafadiat.com" className="text-gray-600 hover:text-emerald-800 font-mono">ads@dailyafadiat.com</a>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Globe size={15} className="text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-gray-900 block">{isUrdu ? "مرکزی دفتر:" : "Headquarters:"}</span>
                    <span className="text-gray-600">پریس کلب روڈ، اسلام آباد، پاکستان</span>
                  </div>
                </div>
              </div>

              {/* WhatsApp Button */}
              <a
                href="https://wa.me/923001234567?text=Hello%20Daily%20Afadiat,%20I%20would%20like%20to%20inquire%20about%20advertising%20options."
                target="_blank"
                rel="noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 transition shadow-xs cursor-pointer"
              >
                <span>{isUrdu ? "واٹس ایپ پر فوری رابطہ کریں" : "Chat on WhatsApp"}</span>
              </a>
            </div>

            {/* Editorial Integrity Box */}
            <div className="bg-white border border-[#dcd8cd] rounded-2xl p-5 text-xs text-gray-600 space-y-2 leading-relaxed">
              <h4 className="font-bold text-gray-900 text-xs">
                {isUrdu ? "شفاف اور باوقار اشتہاری پالیسی" : "Editorial Advertising Standards"}
              </h4>
              <p>
                {isUrdu
                  ? "ڈیلی افادیت پر تمام اسپانسرڈ مواد اور اشتہارات قاری کے اعتماد اور اخلاقی صحافتی اصولوں کے عین مطابق شائع کیے جاتے ہیں۔"
                  : "All sponsored content is visibly labeled to maintain complete journalistic integrity and reader trust."}
              </p>
            </div>

          </div>

        </div>

        {/* Newsletter Box */}
        <NewsletterBox />

      </main>

      <Footer categories={categories} />
    </div>
  );
}
