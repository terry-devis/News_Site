import { supabaseAdmin } from "./supabaseServer";
import fs from "fs";
import path from "path";

const localStorePath = path.join(process.cwd(), "data", "cms_store.json");

function ensureLocalStore() {
  const dir = path.dirname(localStorePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(localStorePath)) {
    const defaultData = {
      ad_slots: [
        {
          id: 1,
          slot_key: "top_banner_728x90",
          title: "اوپری ہیڈر بینر (728x90)",
          ad_type: "image",
          image_url: "",
          target_url: "https://dailyafadiat.com",
          code_snippet: "",
          is_active: true,
        },
        {
          id: 2,
          slot_key: "home_mid_banner",
          title: "صفحۂ اول درمیانی بینر (970x90)",
          ad_type: "image",
          image_url: "",
          target_url: "https://dailyafadiat.com",
          code_snippet: "",
          is_active: true,
        },
        {
          id: 3,
          slot_key: "article_sidebar_300x250",
          title: "آرٹیکل سائیڈ بار بینر (300x250)",
          ad_type: "image",
          image_url: "",
          target_url: "https://dailyafadiat.com",
          code_snippet: "",
          is_active: true,
        },
        {
          id: 4,
          slot_key: "article_inline_banner",
          title: "آرٹیکل کے اندر بینر (728x90)",
          ad_type: "image",
          image_url: "",
          target_url: "https://dailyafadiat.com",
          code_snippet: "",
          is_active: true,
        },
        {
          id: 5,
          slot_key: "footer_banner",
          title: "فوٹر کے اوپر بینر (970x90)",
          ad_type: "image",
          image_url: "",
          target_url: "https://dailyafadiat.com",
          code_snippet: "",
          is_active: false,
        },
      ],
      comments: [
        {
          id: 1,
          article_id: 1,
          author_name: "محمد بلال",
          author_email: "bilal@example.com",
          content: "بہت ہی شاندار اور تیز رفتار نیوز پورٹل ہے۔ ڈیلی افادیت کی ادارتی ٹیم کو مبارکباد!",
          status: "approved",
          created_at: new Date().toISOString(),
        },
      ],
      site_settings: {
        social_links: {
          youtube: "https://youtube.com/@dailyafadiat",
          whatsapp: "https://whatsapp.com/channel/dailyafadiat",
          facebook: "https://facebook.com/dailyafadiat",
          instagram: "https://instagram.com/dailyafadiat",
          twitter: "https://x.com/dailyafadiat",
          tiktok: "https://tiktok.com/@dailyafadiat",
        },
        site_info: {
          title_ur: "ڈیلی افادیت",
          tagline_ur: "سچ کے ساتھ، ہر لمحہ باخبر — TRUST • FACTS • GLOBAL NEWS",
          contact_email: "editor@dailyafadiat.com",
          contact_phone: "+92 300 1234567",
        },
        smtp_config: {
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          user: "",
          pass: "",
          from: "ڈیلی افادیت <newsletter@dailyafadiat.com>",
        },
      },
      newsletter_subscribers: [
        {
          id: 1,
          email: "reader@example.com",
          is_active: true,
          created_at: new Date().toISOString(),
        },
      ],
    };
    fs.writeFileSync(localStorePath, JSON.stringify(defaultData, null, 2));
  }
  return JSON.parse(fs.readFileSync(localStorePath, "utf-8"));
}

function writeLocalStore(data) {
  ensureLocalStore();
  fs.writeFileSync(localStorePath, JSON.stringify(data, null, 2));
}

// ==========================================
// 1. AD SLOTS API
// ==========================================
export async function getAdSlots() {
  try {
    const { data, error } = await supabaseAdmin.from("ad_slots").select("*").order("id");
    if (!error && data && data.length > 0) return data;
  } catch (e) {}
  const local = ensureLocalStore();
  return local.ad_slots || [];
}

export async function getAdSlot(slotKey) {
  try {
    const { data, error } = await supabaseAdmin
      .from("ad_slots")
      .select("*")
      .eq("slot_key", slotKey)
      .eq("is_active", true)
      .maybeSingle();
    if (!error && data) return data;
  } catch (e) {}
  const local = ensureLocalStore();
  return (local.ad_slots || []).find((s) => s.slot_key === slotKey && s.is_active);
}

export async function updateAdSlot(slotKey, updates) {
  try {
    const { data, error } = await supabaseAdmin
      .from("ad_slots")
      .upsert({ slot_key: slotKey, ...updates, updated_at: new Date().toISOString() })
      .select();
    if (!error && data) return data[0];
  } catch (e) {}

  const local = ensureLocalStore();
  const idx = local.ad_slots.findIndex((s) => s.slot_key === slotKey);
  if (idx >= 0) {
    local.ad_slots[idx] = { ...local.ad_slots[idx], ...updates, updated_at: new Date().toISOString() };
  } else {
    local.ad_slots.push({ slot_key: slotKey, ...updates, updated_at: new Date().toISOString() });
  }
  writeLocalStore(local);
  return local.ad_slots.find((s) => s.slot_key === slotKey);
}

// ==========================================
// 2. COMMENTS API (Admin Verified / Check & Balance)
// ==========================================
export async function getComments(articleId = null, includeAll = false) {
  try {
    let query = supabaseAdmin.from("comments").select("*, articles(title_ur)").order("created_at", { ascending: false });
    if (articleId) query = query.eq("article_id", articleId);
    if (!includeAll) query = query.eq("status", "approved");

    const { data, error } = await query;
    if (!error && data) return data;
  } catch (e) {}

  const local = ensureLocalStore();
  let list = local.comments || [];
  if (articleId) list = list.filter((c) => c.article_id === Number(articleId));
  if (!includeAll) list = list.filter((c) => c.status === "approved");
  return list;
}

export async function addComment({ article_id, author_name, author_email, content }) {
  const newComment = {
    article_id: Number(article_id),
    author_name,
    author_email,
    content,
    status: "pending", // requires admin approval!
    created_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabaseAdmin.from("comments").insert(newComment).select();
    if (!error && data) return data[0];
  } catch (e) {}

  const local = ensureLocalStore();
  newComment.id = Date.now();
  local.comments.unshift(newComment);
  writeLocalStore(local);
  return newComment;
}

export async function updateCommentStatus(commentId, status) {
  try {
    const { data, error } = await supabaseAdmin
      .from("comments")
      .update({ status })
      .eq("id", commentId)
      .select();
    if (!error && data) return data[0];
  } catch (e) {}

  const local = ensureLocalStore();
  const c = local.comments.find((item) => item.id === Number(commentId));
  if (c) {
    c.status = status;
    writeLocalStore(local);
  }
  return c;
}

export async function deleteComment(commentId) {
  try {
    await supabaseAdmin.from("comments").delete().eq("id", commentId);
  } catch (e) {}

  const local = ensureLocalStore();
  local.comments = local.comments.filter((item) => item.id !== Number(commentId));
  writeLocalStore(local);
  return { success: true };
}

// ==========================================
// 3. SITE SETTINGS API (Social Media & Info)
// ==========================================
export async function getSiteSetting(key) {
  try {
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .select("setting_value")
      .eq("setting_key", key)
      .maybeSingle();
    if (!error && data) return data.setting_value;
  } catch (e) {}

  const local = ensureLocalStore();
  return local.site_settings?.[key] || null;
}

export async function updateSiteSetting(key, value) {
  try {
    const { data, error } = await supabaseAdmin
      .from("site_settings")
      .upsert({ setting_key: key, setting_value: value, updated_at: new Date().toISOString() })
      .select();
    if (!error && data) return data[0].setting_value;
  } catch (e) {}

  const local = ensureLocalStore();
  local.site_settings[key] = value;
  writeLocalStore(local);
  return value;
}

// ==========================================
// 4. NEWSLETTER & SUBSCRIBERS API
// ==========================================
export async function getSubscribers() {
  try {
    const { data, error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) return data;
  } catch (e) {}

  const local = ensureLocalStore();
  return local.newsletter_subscribers || [];
}

export async function addSubscriber(email) {
  const cleanEmail = email.trim().toLowerCase();
  try {
    const { data, error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .insert({ email: cleanEmail, is_active: true })
      .select();
    if (!error && data) return { success: true, subscriber: data[0] };
  } catch (e) {}

  const local = ensureLocalStore();
  const exists = local.newsletter_subscribers.find((s) => s.email === cleanEmail);
  if (!exists) {
    const sub = { id: Date.now(), email: cleanEmail, is_active: true, created_at: new Date().toISOString() };
    local.newsletter_subscribers.push(sub);
    writeLocalStore(local);
    return { success: true, subscriber: sub };
  }
  return { success: true, message: "Already subscribed" };
}
