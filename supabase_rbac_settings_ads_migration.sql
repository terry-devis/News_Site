-- ============================================================================
-- DAILY AFADIAT (ڈیلی افادیت)
-- RELATIONAL RBAC, SITE SETTINGS, AD SLOTS & AD CREATIVES MIGRATION
-- Run this once in Supabase Dashboard -> SQL Editor -> Run
-- ============================================================================

-- 1. DEDICATED SITE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.site_settings (
    id SERIAL PRIMARY KEY,
    setting_key TEXT UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RBAC TABLES (roles, role_permissions, newsroom_users, user_roles)
CREATE TABLE IF NOT EXISTS public.roles (
    id TEXT PRIMARY KEY,
    role_key TEXT UNIQUE NOT NULL,
    name_en TEXT UNIQUE NOT NULL,
    name_ur TEXT DEFAULT '',
    description TEXT DEFAULT '',
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
    role_id TEXT NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    permission_key TEXT NOT NULL,
    PRIMARY KEY (role_id, permission_key)
);

CREATE TABLE IF NOT EXISTS public.newsroom_users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name_ur TEXT DEFAULT '',
    full_name_en TEXT DEFAULT '',
    byline_name TEXT DEFAULT '',
    designation_ur TEXT DEFAULT '',
    designation_en TEXT DEFAULT '',
    bio_ur TEXT DEFAULT '',
    bio_en TEXT DEFAULT '',
    desk_scope JSONB DEFAULT '[]'::jsonb,
    is_public_author BOOLEAN DEFAULT FALSE,
    status TEXT NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Disabled')),
    last_active TEXT DEFAULT 'never signed in',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.user_roles (
    user_id TEXT NOT NULL REFERENCES public.newsroom_users(id) ON DELETE CASCADE,
    role_id TEXT NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, role_id)
);

-- 3. CLEAN AD SLOTS & AD CREATIVES TABLES (WITH FOREIGN KEY)
ALTER TABLE public.ad_slots
    ADD COLUMN IF NOT EXISTS label_ur TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS dimensions TEXT DEFAULT '',
    ADD COLUMN IF NOT EXISTS page_scope TEXT DEFAULT 'all',
    ADD COLUMN IF NOT EXISTS ad_type TEXT DEFAULT 'image',
    ADD COLUMN IF NOT EXISTS code_snippet TEXT,
    ADD COLUMN IF NOT EXISTS is_enabled BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

CREATE TABLE IF NOT EXISTS public.ad_creatives (
    id TEXT PRIMARY KEY,
    slot_id INT REFERENCES public.ad_slots(id) ON DELETE CASCADE,
    slot_key TEXT NOT NULL,
    name TEXT NOT NULL,
    advertiser TEXT DEFAULT '',
    ad_type TEXT NOT NULL DEFAULT 'image' CHECK (ad_type IN ('image', 'html', 'adsense')),
    image_url TEXT,
    target_url TEXT,
    html_code TEXT,
    weight INT DEFAULT 1,
    impressions INT DEFAULT 0,
    clicks INT DEFAULT 0,
    start_date TIMESTAMPTZ,
    end_date TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Helpful indexes (RBAC, Settings, Ads, Articles, Categories, Breaking News & Comments)
CREATE INDEX IF NOT EXISTS idx_newsroom_users_email ON public.newsroom_users (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_newsroom_users_status ON public.newsroom_users (status);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON public.user_roles (role_id);
CREATE INDEX IF NOT EXISTS idx_roles_key ON public.roles (LOWER(role_key));
CREATE INDEX IF NOT EXISTS idx_role_permissions_key ON public.role_permissions (permission_key);
CREATE INDEX IF NOT EXISTS idx_site_settings_key ON public.site_settings (setting_key);

CREATE INDEX IF NOT EXISTS idx_ad_slots_active ON public.ad_slots (slot_key, is_active, is_enabled);
CREATE INDEX IF NOT EXISTS idx_ad_creatives_slot_id ON public.ad_creatives (slot_id);
CREATE INDEX IF NOT EXISTS idx_ad_creatives_slot_key ON public.ad_creatives (slot_key);
CREATE INDEX IF NOT EXISTS idx_ad_creatives_active_slot ON public.ad_creatives (slot_key, is_active, weight DESC);

DO $$
BEGIN
    IF to_regclass('public.articles') IS NOT NULL THEN
        CREATE INDEX IF NOT EXISTS idx_articles_created_at_desc ON public.articles (created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_articles_category_created ON public.articles (category_id, created_at DESC);
        CREATE INDEX IF NOT EXISTS idx_articles_breaking ON public.articles (is_breaking, created_at DESC) WHERE is_breaking = TRUE;
        CREATE INDEX IF NOT EXISTS idx_articles_featured ON public.articles (is_featured, created_at DESC) WHERE is_featured = TRUE;
        CREATE INDEX IF NOT EXISTS idx_articles_views_desc ON public.articles (views_count DESC);
    END IF;
    IF to_regclass('public.categories') IS NOT NULL THEN
        CREATE INDEX IF NOT EXISTS idx_categories_display_order ON public.categories (display_order ASC);
    END IF;
    IF to_regclass('public.breaking_news') IS NOT NULL THEN
        CREATE INDEX IF NOT EXISTS idx_breaking_news_active_priority ON public.breaking_news (is_active, priority ASC, created_at DESC);
    END IF;
    IF to_regclass('public.comments') IS NOT NULL THEN
        CREATE INDEX IF NOT EXISTS idx_comments_article_status ON public.comments (article_id, status, created_at DESC);
    END IF;
END $$;

-- 4. DATABASE-LEVEL SECURITY (ROW LEVEL SECURITY)
-- Note: Server routes use SUPABASE_SERVICE_ROLE_KEY which bypasses RLS.
-- Public anon/authenticated keys are strictly locked down below.
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsroom_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_creatives ENABLE ROW LEVEL SECURITY;

-- Drop old policies if re-running
DROP POLICY IF EXISTS "Public read active ad_slots" ON public.ad_slots;
DROP POLICY IF EXISTS "Public read active ad_creatives" ON public.ad_creatives;

-- Public can only read active non-internal ad slots & creatives (zero access to users/roles/settings)
CREATE POLICY "Public read active ad_slots"
    ON public.ad_slots
    FOR SELECT
    TO anon, authenticated
    USING (is_active = TRUE AND slot_key NOT LIKE '__cms_kv__:%');

CREATE POLICY "Public read active ad_creatives"
    ON public.ad_creatives
    FOR SELECT
    TO anon, authenticated
    USING (is_active = TRUE);

-- 5. SEED SYSTEM ROLES & PERMISSIONS
INSERT INTO public.roles (id, role_key, name_en, name_ur, description, is_system) VALUES
    ('role_super_admin', 'super_admin', 'Super Admin', 'سپر ایڈمن', 'Full unrestricted access to all newsroom modules, roles, users and settings.', TRUE),
    ('role_editor_in_chief', 'editor_in_chief', 'Editor-in-Chief', 'چیف ایڈیٹر', 'Editorial leadership with approval, publishing, breaking news and staff oversight.', TRUE),
    ('role_editor', 'editor', 'Editor', 'ایڈیٹر', 'Desk editor able to edit, approve, publish and manage categories and media.', TRUE),
    ('role_sub_editor', 'sub_editor', 'Sub-Editor', 'سب ایڈیٹر', 'Copy-editor able to review drafts, edit copy, and manage tags/media.', TRUE),
    ('role_reporter', 'reporter', 'Reporter', 'رپورٹر', 'Field correspondent able to draft stories and upload media for editorial review.', TRUE),
    ('role_columnist', 'columnist', 'Columnist', 'کالم نگار', 'Opinion writer able to compose and submit columns for review.', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Seed Super Admin permissions
INSERT INTO public.role_permissions (role_id, permission_key)
SELECT 'role_super_admin', perm FROM unnest(ARRAY[
    'article.view','article.create','article.edit_own','article.edit_all','article.publish','article.unpublish','article.delete','article.schedule',
    'breaking.manage','featured.manage','category.manage','media.upload','media.delete',
    'epaper.manage','video.manage','comment.moderate','poll.manage','ad.manage',
    'layout.manage','settings.manage','user.manage','role.manage','inquiry.manage','analytics.view'
]) AS perm
ON CONFLICT DO NOTHING;

-- Seed Editor-in-Chief permissions (all except role.manage)
INSERT INTO public.role_permissions (role_id, permission_key)
SELECT 'role_editor_in_chief', perm FROM unnest(ARRAY[
    'article.view','article.create','article.edit_own','article.edit_all','article.publish','article.unpublish','article.delete','article.schedule',
    'breaking.manage','featured.manage','category.manage','media.upload','media.delete',
    'epaper.manage','video.manage','comment.moderate','poll.manage','ad.manage',
    'layout.manage','settings.manage','user.manage','inquiry.manage','analytics.view'
]) AS perm
ON CONFLICT DO NOTHING;

-- Seed Editor permissions
INSERT INTO public.role_permissions (role_id, permission_key)
SELECT 'role_editor', perm FROM unnest(ARRAY[
    'article.view','article.create','article.edit_own','article.edit_all','article.publish','article.unpublish','article.schedule',
    'breaking.manage','featured.manage','category.manage','media.upload',
    'epaper.manage','video.manage','comment.moderate','poll.manage','inquiry.manage','analytics.view'
]) AS perm
ON CONFLICT DO NOTHING;

-- Seed Sub-Editor permissions
INSERT INTO public.role_permissions (role_id, permission_key)
SELECT 'role_sub_editor', perm FROM unnest(ARRAY[
    'article.view','article.create','article.edit_own','article.edit_all',
    'media.upload','comment.moderate','analytics.view'
]) AS perm
ON CONFLICT DO NOTHING;

-- Seed Reporter & Columnist permissions
INSERT INTO public.role_permissions (role_id, permission_key)
SELECT r_id, perm FROM (VALUES ('role_reporter'), ('role_columnist')) AS r(r_id),
unnest(ARRAY['article.view','article.create','article.edit_own','media.upload']) AS perm
ON CONFLICT DO NOTHING;

-- 6. MIGRATE EXISTING __cms_kv__:* DATA FROM ad_slots INTO PROPER TABLES
-- 6a. Migrate general site_settings (use DISTINCT ON in case duplicate __cms_kv__ rows exist)
INSERT INTO public.site_settings (setting_key, setting_value)
SELECT DISTINCT ON (slot_key)
    REPLACE(slot_key, '__cms_kv__:', ''),
    target_url::jsonb
FROM public.ad_slots
WHERE slot_key LIKE '__cms_kv__:%'
  AND slot_key NOT IN ('__cms_kv__:newsroom_users', '__cms_kv__:ad_slots_v2', '__cms_kv__:ad_creatives')
  AND target_url IS NOT NULL
  AND target_url <> ''
ORDER BY slot_key, id DESC
ON CONFLICT (setting_key) DO UPDATE
SET setting_value = EXCLUDED.setting_value,
    updated_at = NOW();

-- 6b. Migrate newsroom_users + user_roles from __cms_kv__:newsroom_users
DO $$
DECLARE
    users_json jsonb;
    u jsonb;
    r_name text;
    matched_role_id text;
BEGIN
    SELECT target_url::jsonb INTO users_json
    FROM public.ad_slots
    WHERE slot_key = '__cms_kv__:newsroom_users'
    ORDER BY id DESC
    LIMIT 1;

    IF users_json IS NOT NULL AND jsonb_typeof(users_json) = 'array' THEN
        FOR u IN SELECT * FROM jsonb_array_elements(users_json)
        LOOP
            INSERT INTO public.newsroom_users (
                id, email, password_hash, full_name_ur, full_name_en, byline_name,
                designation_ur, designation_en, bio_ur, bio_en, desk_scope,
                is_public_author, status, last_active, created_at
            ) VALUES (
                COALESCE(u->>'id', 'usr_' || extract(epoch from now())::bigint::text),
                LOWER(TRIM(u->>'email')),
                COALESCE(NULLIF(u->>'starting_password', ''), '••••••••••••'),
                COALESCE(u->>'full_name_ur', ''),
                COALESCE(u->>'full_name_en', ''),
                COALESCE(u->>'byline_name', ''),
                COALESCE(u->>'designation_ur', ''),
                COALESCE(u->>'designation_en', ''),
                COALESCE(u->>'bio_ur', ''),
                COALESCE(u->>'bio_en', ''),
                COALESCE(u->'desk_scope', '[]'::jsonb),
                COALESCE((u->>'is_public_author')::boolean, FALSE),
                CASE WHEN LOWER(COALESCE(u->>'status', 'Active')) = 'disabled' THEN 'Disabled' ELSE 'Active' END,
                COALESCE(u->>'last_active', 'never signed in'),
                COALESCE((u->>'created_at')::timestamptz, NOW())
            )
            ON CONFLICT (email) DO UPDATE SET
                password_hash = EXCLUDED.password_hash,
                full_name_ur = EXCLUDED.full_name_ur,
                full_name_en = EXCLUDED.full_name_en,
                byline_name = EXCLUDED.byline_name,
                designation_ur = EXCLUDED.designation_ur,
                designation_en = EXCLUDED.designation_en,
                status = EXCLUDED.status,
                updated_at = NOW();

            IF u->'roles' IS NOT NULL AND jsonb_typeof(u->'roles') = 'array' THEN
                FOR r_name IN SELECT jsonb_array_elements_text(u->'roles')
                LOOP
                    SELECT id INTO matched_role_id
                    FROM public.roles
                    WHERE LOWER(name_en) = LOWER(r_name) OR LOWER(role_key) = LOWER(r_name)
                    LIMIT 1;

                    IF matched_role_id IS NOT NULL THEN
                        INSERT INTO public.user_roles (user_id, role_id)
                        VALUES (u->>'id', matched_role_id)
                        ON CONFLICT DO NOTHING;
                    END IF;
                END LOOP;
            END IF;
        END LOOP;
    END IF;
END $$;

-- 6c. Migrate ad_slots_v2 & ad_creatives into public.ad_slots & public.ad_creatives
DO $$
DECLARE
    slots_json jsonb;
    creatives_json jsonb;
    s jsonb;
    c jsonb;
    resolved_slot_id int;
BEGIN
    SELECT target_url::jsonb INTO slots_json
    FROM public.ad_slots
    WHERE slot_key = '__cms_kv__:ad_slots_v2'
    ORDER BY id DESC
    LIMIT 1;

    IF slots_json IS NOT NULL AND jsonb_typeof(slots_json) = 'array' THEN
        FOR s IN SELECT * FROM jsonb_array_elements(slots_json)
        LOOP
            SELECT id INTO resolved_slot_id
            FROM public.ad_slots
            WHERE slot_key = (s->>'slot_key')
            ORDER BY id DESC
            LIMIT 1;

            IF resolved_slot_id IS NOT NULL THEN
                UPDATE public.ad_slots SET
                    title = COALESCE(s->>'name', s->>'labelEn', s->>'title', s->>'slot_key'),
                    label_ur = COALESCE(s->>'labelUr', ''),
                    dimensions = COALESCE(s->>'sizes', s->>'dimensions', ''),
                    page_scope = COALESCE(s->>'pageScope', 'all'),
                    ad_type = COALESCE(ad_type, 'image'),
                    is_enabled = COALESCE((s->>'is_active')::boolean, (s->>'is_enabled')::boolean, TRUE),
                    is_active = COALESCE((s->>'is_active')::boolean, (s->>'is_enabled')::boolean, TRUE),
                    updated_at = NOW()
                WHERE id = resolved_slot_id;
            ELSE
                INSERT INTO public.ad_slots (
                    slot_key, title, label_ur, dimensions, page_scope, ad_type,
                    image_url, target_url, code_snippet, is_active, is_enabled
                ) VALUES (
                    s->>'slot_key',
                    COALESCE(s->>'name', s->>'labelEn', s->>'title', s->>'slot_key'),
                    COALESCE(s->>'labelUr', ''),
                    COALESCE(s->>'sizes', s->>'dimensions', ''),
                    COALESCE(s->>'pageScope', 'all'),
                    'image',
                    NULL,
                    NULL,
                    NULL,
                    COALESCE((s->>'is_active')::boolean, (s->>'is_enabled')::boolean, TRUE),
                    COALESCE((s->>'is_active')::boolean, (s->>'is_enabled')::boolean, TRUE)
                );
            END IF;
        END LOOP;
    END IF;

    SELECT target_url::jsonb INTO creatives_json
    FROM public.ad_slots
    WHERE slot_key = '__cms_kv__:ad_creatives'
    ORDER BY id DESC
    LIMIT 1;

    IF creatives_json IS NOT NULL AND jsonb_typeof(creatives_json) = 'array' THEN
        FOR c IN SELECT * FROM jsonb_array_elements(creatives_json)
        LOOP
            SELECT id INTO resolved_slot_id
            FROM public.ad_slots
            WHERE slot_key = COALESCE(c->>'slot_key', c->>'slotKey', '')
            LIMIT 1;

            INSERT INTO public.ad_creatives (
                id, slot_id, slot_key, name, advertiser, ad_type,
                image_url, target_url, html_code, weight, impressions, clicks,
                start_date, end_date, is_active, created_at
            ) VALUES (
                COALESCE(c->>'id', 'ad_' || extract(epoch from now())::bigint::text),
                resolved_slot_id,
                COALESCE(c->>'slot_key', c->>'slotKey', ''),
                COALESCE(c->>'name', 'Ad Creative'),
                COALESCE(c->>'image_alt', c->>'advertiser', ''),
                CASE WHEN (c->>'type') IN ('image', 'html', 'adsense') THEN c->>'type' ELSE 'image' END,
                NULLIF(COALESCE(c->>'image_url', c->>'imageUrl', ''), ''),
                NULLIF(COALESCE(c->>'click_url', c->>'targetUrl', ''), ''),
                NULLIF(COALESCE(c->>'html_code', c->>'htmlCode', ''), ''),
                COALESCE((c->>'weight')::int, 1),
                COALESCE((c->>'impressions')::int, 0),
                COALESCE((c->>'clicks')::int, 0),
                NULLIF(COALESCE(c->>'starts_at', c->>'startDate', ''), '')::timestamptz,
                NULLIF(COALESCE(c->>'ends_at', c->>'endDate', ''), '')::timestamptz,
                CASE
                    WHEN c ? 'status' THEN (c->>'status') = 'run'
                    ELSE COALESCE((c->>'active')::boolean, TRUE)
                END,
                COALESCE(NULLIF(COALESCE(c->>'created_at', c->>'createdAt', ''), '')::timestamptz, NOW())
            )
            ON CONFLICT (id) DO UPDATE SET
                slot_id = EXCLUDED.slot_id,
                slot_key = EXCLUDED.slot_key,
                name = EXCLUDED.name,
                image_url = EXCLUDED.image_url,
                target_url = EXCLUDED.target_url,
                html_code = EXCLUDED.html_code,
                impressions = EXCLUDED.impressions,
                clicks = EXCLUDED.clicks,
                is_active = EXCLUDED.is_active,
                updated_at = NOW();
        END LOOP;
    END IF;
END $$;

-- 7. REMOVE __cms_kv__:* CLUTTER FROM public.ad_slots & ENFORCE UNIQUE slot_key
DELETE FROM public.ad_slots WHERE slot_key LIKE '__cms_kv__:%';

DELETE FROM public.ad_slots a
USING public.ad_slots b
WHERE a.slot_key = b.slot_key
  AND a.id < b.id;

CREATE UNIQUE INDEX IF NOT EXISTS uq_ad_slots_slot_key ON public.ad_slots (slot_key);

-- 8. DATABASE-LEVEL GUARD: PREVENT DELETING/DISABLING/DEMOTING THE LAST ACTIVE SUPER ADMIN
CREATE OR REPLACE FUNCTION public.guard_last_super_admin_user()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    target_is_super boolean;
    remaining_active_super int;
BEGIN
    SELECT EXISTS (
        SELECT 1
        FROM public.user_roles ur
        JOIN public.roles r ON r.id = ur.role_id
        WHERE ur.user_id = OLD.id
          AND LOWER(r.role_key) = 'super_admin'
    ) INTO target_is_super;

    IF NOT target_is_super THEN
        IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
    END IF;

    IF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND LOWER(COALESCE(NEW.status, 'Active')) <> 'active') THEN
        SELECT COUNT(DISTINCT u.id) INTO remaining_active_super
        FROM public.newsroom_users u
        JOIN public.user_roles ur ON ur.user_id = u.id
        JOIN public.roles r ON r.id = ur.role_id
        WHERE LOWER(r.role_key) = 'super_admin'
          AND LOWER(u.status) = 'active'
          AND u.id <> OLD.id;

        IF remaining_active_super < 1 THEN
            RAISE EXCEPTION 'Cannot delete or disable the last active Super Admin account'
                USING ERRCODE = 'P0001';
        END IF;
    END IF;

    IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_last_super_admin_user ON public.newsroom_users;
CREATE TRIGGER trg_guard_last_super_admin_user
    BEFORE DELETE OR UPDATE OF status ON public.newsroom_users
    FOR EACH ROW
    EXECUTE FUNCTION public.guard_last_super_admin_user();

CREATE OR REPLACE FUNCTION public.guard_last_super_admin_role()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    removed_role_is_super boolean;
    remaining_active_super int;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM public.roles r
        WHERE r.id = OLD.role_id AND LOWER(r.role_key) = 'super_admin'
    ) INTO removed_role_is_super;

    IF NOT removed_role_is_super THEN
        RETURN OLD;
    END IF;

    -- Allow if the user row itself is not active or is being deleted via cascade? Check remaining active super admins:
    SELECT COUNT(DISTINCT u.id) INTO remaining_active_super
    FROM public.newsroom_users u
    JOIN public.user_roles ur ON ur.user_id = u.id
    JOIN public.roles r ON r.id = ur.role_id
    WHERE LOWER(r.role_key) = 'super_admin'
      AND LOWER(u.status) = 'active'
      AND u.id <> OLD.user_id;

    IF remaining_active_super < 1 THEN
        RAISE EXCEPTION 'Cannot remove Super Admin role from the last active Super Admin account'
            USING ERRCODE = 'P0001';
    END IF;

    RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS trg_guard_last_super_admin_role ON public.user_roles;
CREATE TRIGGER trg_guard_last_super_admin_role
    BEFORE DELETE ON public.user_roles
    FOR EACH ROW
    EXECUTE FUNCTION public.guard_last_super_admin_role();
