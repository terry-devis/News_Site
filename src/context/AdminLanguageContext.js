"use client";
import React, { createContext, useContext, useState, useEffect } from "react";

const translations = {
  en: {
    // Header & Brand
    cms_title: "Editorial CMS Panel",
    visit_website: "View Website",
    verified_badge: "Editorial System Active",
    editorial_departments: "Editorial Management",

    // Navigation Items
    nav_dashboard: "Dashboard",
    nav_posts: "All Articles",
    nav_new_post: "Write New Article",
    nav_comments: "Comments Moderation",
    nav_ads: "Ads & Banners",
    nav_settings: "Site & Contact Settings",
    nav_newsletter: "Newsletter & SMTP",
    nav_breaking: "Breaking News Ticker",

    // Dashboard
    dashboard_welcome_title: "Daily Afadiat — Editorial CMS",
    dashboard_welcome_desc:
      "Manage news publishing, photo uploads, advertisement banners, reader comments, and inquiries.",
    dashboard_publish_btn: "Publish New Article",
    stat_published_articles: "Published Articles",
    stat_pending_comments: "Pending Comments",
    stat_active_ads: "Active Ad Placements",
    stat_subscribers: "Newsletter Subscribers",
    view_all: "View All",
    recent_articles: "Recent Articles",
    pending_comments_title: "Pending Comments (Check & Balance)",
    all_clear_comments: "No pending comments awaiting review. All clear!",
    approve: "Approve",
    reject: "Reject",
    delete: "Delete",
    save_changes: "Save Changes",

    // Posts Manager
    posts_list_title: "Articles & News Management",
    total_published_count: "Total Published Articles",
    search_posts_placeholder: "Search news by headline...",
    filter_department: "Department:",
    all_departments: "All Departments",
    col_photo: "Photo",
    col_title: "Headline",
    col_category: "Category",
    col_author: "Author",
    col_badge: "Status",
    col_date: "Date",
    col_actions: "Actions",
    no_posts_found: "No articles found matching your criteria.",
    confirm_delete_post: "Are you sure you want to permanently delete this article?",

    // Post Editor
    new_post_title: "Write New Article",
    edit_post_title: "Edit Article",
    new_post_desc: "Draft content, upload cover photo, and publish instantly.",
    back_to_posts: "Back to Articles",
    field_urdu_title: "Urdu Headline",
    field_english_title: "English Headline",
    field_slug: "URL Slug",
    field_excerpt: "Summary / Excerpt",
    field_content: "Full Article Content",
    tab_editor: "Editor",
    tab_preview: "Live Preview",
    btn_insert_image: "Insert Image",
    category_label: "Select Category",
    cover_image_label: "Cover Photo",
    btn_pick_file: "Choose Photo from Computer",
    or_paste_url: "or paste image URL below",
    flags_heading: "Special Placement & Ticker Flags",
    flag_breaking: "Breaking News (Show in Red Marquee Ticker)",
    flag_featured: "Featured Story (Priority in Homepage Hero)",
    field_byline: "Reporter / Byline Attribution",
    btn_publish: "Publish Article",
    btn_save_changes: "Save Changes",

    // Comments Moderation
    comments_page_title: "Reader Comments Moderation & Check-and-Balance",
    comments_page_desc: "Only comments approved by an administrator will appear publicly on the website.",
    tab_pending: "Pending",
    tab_approved: "Approved (Live)",
    tab_rejected: "Rejected",
    tab_all: "All",
    related_story_link: "View Related Story",

    // Ads Manager
    ads_page_title: "Advertisement Banners Controller (Ads Manager)",
    ads_page_desc: "Control banner placements, upload banners, or paste custom Google AdSense scripts.",
    status_active: "Active",
    status_disabled: "Disabled",
    tab_image_banner: "Image Banner",
    tab_code_snippet: "AdSense / Custom Script",
    field_banner_image_url: "Banner Image URL",
    field_target_url: "Target Click URL",
    field_adsense_snippet: "Google AdSense or HTML Script Code",
    preview_banner_text: "Live Banner Preview",

    // Settings
    settings_page_title: "Social Media & Contact Information Settings",
    settings_page_desc: "Update official channels, office address, contact numbers, and view incoming messages.",
    tab_social_info: "Social Media & Contact Info",
    tab_inbox_messages: "Reader Contact Inquiries",
    section_social_accounts: "Official Social Media Accounts",
    section_contact_details: "Office Details & Inquiries",
    field_tagline: "Editorial Tagline / Motto",
    field_address_ur: "Head Office Address (Urdu)",
    field_address_en: "Head Office Address (English)",
    field_phone: "Primary Phone / WhatsApp",
    field_editorial_email: "Editorial Desk Email",
    field_ads_email: "Advertising Desk Email",
    field_timings: "Office Timings",
    inbox_no_messages: "No contact inquiries received yet.",
    inbox_date: "Received on",

    // Newsletter & SMTP
    newsletter_page_title: "Newsletter Subscribers & SMTP Broadcast",
    total_active_subscribers: "Total Active Subscribers",
    broadcast_section_title: "Broadcast Email to All Subscribers",
    field_email_subject: "Email Subject",
    field_email_body: "Email Message Content",
    btn_send_broadcast: "Send Email to All Subscribers",
    subscribers_list_title: "Subscribed Readers Directory",
    smtp_settings_title: "Email Server Settings (SMTP)",
    field_smtp_host: "SMTP Host",
    field_smtp_port: "SMTP Port",
    field_smtp_secure: "SSL/TLS (Port 465)",
    field_smtp_user: "SMTP Username / Email",
    field_smtp_pass: "SMTP Password / App Password",
    field_smtp_from: "Sender From Address",
    btn_save_smtp: "Save SMTP Settings",
  },

  ur: {
    // Header & Brand
    cms_title: "CMS ایڈمن پینل",
    visit_website: "ویب سائٹ دیکھیں",
    verified_badge: "ادارتی سسٹم فعال",
    editorial_departments: "ادارتی شعبہ جات",

    // Navigation Items
    nav_dashboard: "ڈیش بورڈ",
    nav_posts: "تمام مضامین",
    nav_new_post: "نیا مضمون لکھیں",
    nav_comments: "تبصرے اور تصدیق",
    nav_ads: "اشتہارات کا کنٹرول",
    nav_settings: "سوشل میڈیا اور رابطہ",
    nav_newsletter: "نیوز لیٹر اور SMTP",
    nav_breaking: "بریکنگ نیوز ٹکر",

    // Dashboard
    dashboard_welcome_title: "ڈیلی افادیت — ادارتی کنٹرول پینل (CMS)",
    dashboard_welcome_desc:
      "یہاں سے آپ خبروں کی اشاعت، تصاویر کی اپلوڈنگ، اشتہارات اور قارئین کے تبصروں کو کنٹرول کر سکتے ہیں۔",
    dashboard_publish_btn: "نیا مضمون شائع کریں",
    stat_published_articles: "شائع شدہ مضامین",
    stat_pending_comments: "زیرِ التواء تبصرے",
    stat_active_ads: "فعال اشتہارات",
    stat_subscribers: "نیوز لیٹر قارئین",
    view_all: "سب دیکھیں",
    recent_articles: "تازہ ترین مضامین",
    pending_comments_title: "زیرِ التواء تبصرے (Check & Balance)",
    all_clear_comments: "کوئی نیا تبصرہ تصدیق کے لیے زیرِ التواء نہیں ہے۔ سب کلیر ہے!",
    approve: "منظور کریں",
    reject: "مسترد کریں",
    delete: "حذف کریں",
    save_changes: "محفوظ کریں",

    // Posts Manager
    posts_list_title: "مضامین اور خبروں کی فہرست",
    total_published_count: "کل شائع شدہ خبریں",
    search_posts_placeholder: "خبر کا عنوان تلاش کریں...",
    filter_department: "شعبہ:",
    all_departments: "تمام شعبہ جات",
    col_photo: "تصویر",
    col_title: "عنوانِ خبر",
    col_category: "شعبہ",
    col_author: "مصنف",
    col_badge: "خصوصیت",
    col_date: "تاریخ",
    col_actions: "ایکشن",
    no_posts_found: "کوئی مضمون نہیں ملا۔",
    confirm_delete_post: "کیا آپ واقعی اس مضمون کو حذف کرنا چاہتے ہیں؟",

    // Post Editor
    new_post_title: "نیا مضمون تحریر کریں",
    edit_post_title: "مضمون میں ترمیم کریں",
    new_post_desc: "مضمون لکھیں، تصویر اپلوڈ کریں اور فوری شائع کریں۔",
    back_to_posts: "واپس مضامین پر جائیں",
    field_urdu_title: "خبر کا اردو عنوان",
    field_english_title: "انگریزی عنوان",
    field_slug: "یو آر ایل سلگ (URL Slug)",
    field_excerpt: "مختصر خلاصہ (Excerpt)",
    field_content: "مکمل تفصیلی خبر کا متن",
    tab_editor: "ایڈیٹر",
    tab_preview: "پیش منظر (Preview)",
    btn_insert_image: "تصویر شامل کریں",
    category_label: "شعبہ منتخب کریں (Category)",
    cover_image_label: "سرورق کی تصویر (Cover Photo)",
    btn_pick_file: "کمپیوٹر سے تصویر منتخب کریں",
    or_paste_url: "یا نیچے یو آر ایل درج کریں",
    flags_heading: "خصوصی اشاعت اور بینرز",
    flag_breaking: "بریکنگ نیوز (ریڈ مارکی ٹکر میں دکھائیں)",
    flag_featured: "اہم خبر (صفحۂ اول کے ہیرو سیکشن میں ترجیح دیں)",
    field_byline: "رپورٹر / ایڈیٹر کا نام",
    btn_publish: "مضمون شائع کریں",
    btn_save_changes: "تبدیلیاں محفوظ کریں",

    // Comments Moderation
    comments_page_title: "قارئین کے تبصروں کی تصدیق و نگرانی (Check & Balance)",
    comments_page_desc: "صرف وہی تبصرے عوام کے لیے لائیو ہوں گے جنہیں آپ یہاں سے منظور کریں گے۔",
    tab_pending: "زیرِ التواء",
    tab_approved: "منظور شدہ (لائیو)",
    tab_rejected: "مسترد",
    tab_all: "تمام",
    related_story_link: "متعلقہ مضمون دیکھیں",

    // Ads Manager
    ads_page_title: "اشتہارات اور پلیس ہولڈرز کا کنٹرول (Ads Manager)",
    ads_page_desc: "پورٹل پر تمام بینرز کو فعال/غیر فعال کریں، بینر اپلوڈ کریں، یا گوگل ایڈسینس کوڈ لگائیں۔",
    status_active: "فعال (Active)",
    status_disabled: "غیر فعال (Disabled)",
    tab_image_banner: "تصویری بینر",
    tab_code_snippet: "ایڈسینس / کسٹم ایچ ٹی ایم ایل کوڈ",
    field_banner_image_url: "بینر تصویر کا لنک",
    field_target_url: "منزل کا لنک (Target Destination URL)",
    field_adsense_snippet: "گوگل ایڈسینس یا کسٹم اشتہاری سکرپٹ",
    preview_banner_text: "بینر کا براہ راست پیش منظر",

    // Settings
    settings_page_title: "سوشل میڈیا اور رابطہ کی ترتیبات",
    settings_page_desc: "یہاں سے آپ سوشل میڈیا کے تمام آفیشل چینلز، دفتر کا پتہ اور رابطہ نمبر تبدیل کر سکتے ہیں۔",
    tab_social_info: "سوشل میڈیا اور رابطہ معلومات",
    tab_inbox_messages: "قارئین کے پیغامات (Inbox)",
    section_social_accounts: "آفیشل سوشل میڈیا لنکس",
    section_contact_details: "پورٹل کی عمومی تفصیلات اور رابطہ",
    field_tagline: "ادارے کا موٹو / ٹیگ لائن (Tagline)",
    field_address_ur: "مرکزی دفتر کا پتہ (اردو)",
    field_address_en: "مرکزی دفتر کا پتہ (انگریزی)",
    field_phone: "رابطہ فون / واٹس ایپ نمبر",
    field_editorial_email: "ادارتی ڈیسک ای میل",
    field_ads_email: "اشتہارات و کمرشل ای میل",
    field_timings: "دفتری اوقات",
    inbox_no_messages: "ابھی تک قارئین کا کوئی نیا پیغام نہیں آیا۔",
    inbox_date: "موصولہ تاریخ",

    // Newsletter & SMTP
    newsletter_page_title: "نیوز لیٹر سبسکرائبرز اور SMTP براڈکاسٹ",
    total_active_subscribers: "کل فعال سبسکرائبرز",
    broadcast_section_title: "تمام سبسکرائبرز کو خبر نامہ / ای میل بھیجیں (Broadcast)",
    field_email_subject: "ای میل کا موضوع (Email Subject)",
    field_email_body: "ای میل کا پیغام (HTML / Text)",
    btn_send_broadcast: "سبسکرائبرز کو ای میل بھیجیں",
    subscribers_list_title: "سبسکرائب کرنے والے قارئین کی فہرست",
    smtp_settings_title: "ای میل سرور کی ترتیبات (SMTP Settings)",
    field_smtp_host: "SMTP Host",
    field_smtp_port: "Port",
    field_smtp_secure: "SSL/TLS (Port 465)",
    field_smtp_user: "SMTP Username / Email",
    field_smtp_pass: "SMTP Password / App Password",
    field_smtp_from: "Sender From Address",
    btn_save_smtp: "SMTP ترتیبات محفوظ کریں",
  },
};

const AdminLanguageContext = createContext(null);

export function AdminLanguageProvider({ children }) {
  // Default language is ENGLISH as requested!
  const [lang, setLangState] = useState("en");

  useEffect(() => {
    const saved = localStorage.getItem("daily_afadiat_admin_lang");
    if (saved && (saved === "en" || saved === "ur")) {
      setLangState(saved);
    }
  }, []);

  const setLang = (newLang) => {
    setLangState(newLang);
    try {
      localStorage.setItem("daily_afadiat_admin_lang", newLang);
    } catch (e) {}
  };

  const t = (key) => {
    return translations[lang]?.[key] || translations.en[key] || key;
  };

  const dir = lang === "ur" ? "rtl" : "ltr";

  return (
    <AdminLanguageContext.Provider value={{ lang, setLang, t, dir }}>
      <div dir={dir} className={lang === "ur" ? "font-urdu" : "font-sans"}>
        {children}
      </div>
    </AdminLanguageContext.Provider>
  );
}

export function useAdminLanguage() {
  const context = useContext(AdminLanguageContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      lang: "en",
      setLang: () => {},
      t: (key) => translations.en[key] || key,
      dir: "ltr",
    };
  }
  return context;
}
