-- ==========================================================
-- DAILY AFADIAT (ڈیلی افادیت) COMPLETE DATABASE SCHEMA
-- Run this in your Supabase Project -> SQL Editor -> Click 'Run'
-- ==========================================================

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id SERIAL PRIMARY KEY,
    name_ur TEXT NOT NULL,
    name_en TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    display_order INT DEFAULT 0,
    show_in_header BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ARTICLES TABLE
CREATE TABLE IF NOT EXISTS public.articles (
    id SERIAL PRIMARY KEY,
    title_ur TEXT NOT NULL,
    title_en TEXT,
    slug TEXT UNIQUE NOT NULL,
    summary_ur TEXT,
    content_ur TEXT NOT NULL,
    content_en TEXT,
    cover_image TEXT, -- Cloudflare R2 public URL
    category_id INT REFERENCES public.categories(id) ON DELETE SET NULL,
    is_breaking BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    views_count INT DEFAULT 0,
    author_name TEXT DEFAULT 'ایڈیٹر ڈیلی افادیت',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. BREAKING NEWS TICKER TABLE
CREATE TABLE IF NOT EXISTS public.breaking_news (
    id SERIAL PRIMARY KEY,
    text_ur TEXT NOT NULL,
    text_en TEXT,
    link_url TEXT,
    priority INT DEFAULT 1,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. ADVERTISEMENT BANNERS TABLE (Customizable & Controllable from CMS)
CREATE TABLE IF NOT EXISTS public.ad_slots (
    id SERIAL PRIMARY KEY,
    slot_key TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    ad_type TEXT DEFAULT 'image', -- 'image' or 'code'
    image_url TEXT,               -- Cloudflare R2 banner image URL
    target_url TEXT,              -- Destination link when banner clicked
    code_snippet TEXT,            -- Custom HTML / Google AdSense script
    is_active BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. COMMENTS TABLE (With Admin Verification / Check & Balance)
CREATE TABLE IF NOT EXISTS public.comments (
    id SERIAL PRIMARY KEY,
    article_id INT REFERENCES public.articles(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_email TEXT,
    content TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SITE SETTINGS TABLE (Social Links, Contact Info, Tagline)
CREATE TABLE IF NOT EXISTS public.site_settings (
    id SERIAL PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. NEWSLETTER SUBSCRIBERS TABLE
CREATE TABLE IF NOT EXISTS public.newsletter_subscribers (
    id SERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================================
-- SEED DATA & INITIAL CONFIGURATIONS
-- ==========================================================

-- Standard Categories
INSERT INTO public.categories (name_ur, name_en, slug, display_order)
VALUES 
    ('پاکستان', 'Pakistan', 'pakistan', 1),
    ('انٹرنیشنل', 'World', 'world', 2),
    ('کھیل', 'Sports', 'sports', 3),
    ('بزنس', 'Business', 'business', 4),
    ('سائنس و ٹیکنالوجی', 'Tech', 'tech', 5),
    ('صحت', 'Health', 'health', 6),
    ('دلچسپ و عجیب', 'Odd News', 'weird', 7)
ON CONFLICT (slug) DO NOTHING;

-- Initial Breaking News
INSERT INTO public.breaking_news (text_ur, priority, is_active)
VALUES 
    ('ڈیلی افادیت کی لائیو ڈیجیٹل سروسز کا باقاعدہ آغاز، پل پل کی مصدقہ خبریں اب آپ کی انگلیوں پر', 1, TRUE),
    ('پاکستان صرافہ مارکیٹ میں سونے اور چاندی کی تازہ ترین قیمتیں جاری', 2, TRUE)
ON CONFLICT DO NOTHING;

-- Pre-Configured Ad Slots
INSERT INTO public.ad_slots (slot_key, title, ad_type, image_url, target_url, is_active)
VALUES
    ('top_banner_728x90', 'اوپری ہیڈر بینر (728x90)', 'image', '', 'https://dailyafadiat.com', TRUE),
    ('home_mid_banner', 'صفحۂ اول درمیانی بینر (970x90)', 'image', '', 'https://dailyafadiat.com', TRUE),
    ('article_sidebar_300x250', 'آرٹیکل سائیڈ بار بینر (300x250)', 'image', '', 'https://dailyafadiat.com', TRUE),
    ('article_inline_banner', 'آرٹیکل کے اندر بینر (728x90)', 'image', '', 'https://dailyafadiat.com', TRUE),
    ('footer_banner', 'فوٹر کے اوپر بینر (970x90)', 'image', '', 'https://dailyafadiat.com', FALSE)
ON CONFLICT (slot_key) DO NOTHING;

-- Social Links Setting
INSERT INTO public.site_settings (setting_key, setting_value)
VALUES
    ('social_links', '{
        "youtube": "https://youtube.com/@dailyafadiat",
        "whatsapp": "https://whatsapp.com/channel/dailyafadiat",
        "facebook": "https://facebook.com/dailyafadiat",
        "instagram": "https://instagram.com/dailyafadiat",
        "twitter": "https://x.com/dailyafadiat",
        "tiktok": "https://tiktok.com/@dailyafadiat"
    }'::jsonb),
    ('site_info', '{
        "title_ur": "ڈیلی افادیت",
        "tagline_ur": "سچ کے ساتھ، ہر لمحہ باخبر — TRUST • FACTS • GLOBAL NEWS",
        "contact_email": "editor@dailyafadiat.com",
        "contact_phone": "+92 300 1234567"
    }'::jsonb),
    ('smtp_config', '{
        "host": "smtp.gmail.com",
        "port": 587,
        "secure": false,
        "user": "",
        "pass": "",
        "from": "ڈیلی افادیت <newsletter@dailyafadiat.com>"
    }'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

-- ==========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==========================================================
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.breaking_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read articles" ON public.articles;
CREATE POLICY "Public read articles" ON public.articles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read breaking_news" ON public.breaking_news;
CREATE POLICY "Public read breaking_news" ON public.breaking_news FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read ad_slots" ON public.ad_slots;
CREATE POLICY "Public read ad_slots" ON public.ad_slots FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read site_settings" ON public.site_settings;
CREATE POLICY "Public read site_settings" ON public.site_settings FOR SELECT USING (true);

-- Only approved comments can be read publicly!
DROP POLICY IF EXISTS "Public read approved comments" ON public.comments;
CREATE POLICY "Public read approved comments" ON public.comments FOR SELECT USING (status = 'approved');

-- Readers can submit new comments (which will default to 'pending')
DROP POLICY IF EXISTS "Public insert comments" ON public.comments;
CREATE POLICY "Public insert comments" ON public.comments FOR INSERT WITH CHECK (true);

-- Readers can subscribe to newsletter
DROP POLICY IF EXISTS "Public insert newsletter" ON public.newsletter_subscribers;
CREATE POLICY "Public insert newsletter" ON public.newsletter_subscribers FOR INSERT WITH CHECK (true);
