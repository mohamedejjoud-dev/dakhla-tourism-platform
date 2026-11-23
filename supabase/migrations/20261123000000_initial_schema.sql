-- ============================================================================
-- DAKHLA TOURISM PLATFORM — PRODUCTION DDL (SUPABASE POSTGRESQL v1.14.0)
-- Migration: 20261123000000_initial_schema.sql
-- Governed strictly by plan.md and AGENTS.md
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TABLE DEFINITIONS
-- ----------------------------------------------------------------------------

-- 1.1. PROFILES TABLE (Linked to auth.users)
-- Client INSERT is intentionally not granted: handle_new_user() SECURITY DEFINER
-- trigger runs as function owner (postgres) and inserts on user signup.
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'tourist' CHECK (role IN ('tourist', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT NOT NULL UNIQUE,
    icon TEXT NOT NULL,
    display_order INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.3. CATEGORY TRANSLATIONS TABLE
CREATE TABLE IF NOT EXISTS public.category_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL CHECK (language_code IN ('ar', 'fr', 'en')),
    name TEXT NOT NULL,
    description TEXT,
    CONSTRAINT uq_category_language UNIQUE (category_id, language_code)
);

-- 1.4. PLACES TABLE
-- Coordinates are nullable for candidate draft records pending empirical on-site audits.
-- Constraint chk_places_published_coords strictly enforces coordinates on publish.
CREATE TABLE IF NOT EXISTS public.places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
    slug TEXT NOT NULL UNIQUE,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    phone TEXT,
    whatsapp TEXT,
    website_url TEXT,
    instagram_handle TEXT,
    price_level SMALLINT CHECK (price_level BETWEEN 1 AND 4),
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    is_featured BOOLEAN NOT NULL DEFAULT false,
    project_status TEXT NOT NULL DEFAULT 'not_applicable'
        CHECK (project_status IN ('not_applicable', 'planned', 'under_construction', 'completed')),
    project_completion_date DATE,
    avg_rating NUMERIC(3, 2) NOT NULL DEFAULT 0.00 CHECK (avg_rating BETWEEN 0 AND 5),
    review_count INT NOT NULL DEFAULT 0 CHECK (review_count >= 0),
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- STRICT RULE: Published places MUST possess verified GPS coordinates
    CONSTRAINT chk_places_published_coords CHECK (
        status <> 'published' OR (latitude IS NOT NULL AND longitude IS NOT NULL)
    )
);

-- 1.5. PLACE TRANSLATIONS TABLE
-- Supported language_code values: 'ar', 'fr', 'en' ONLY. Schema enforces this.
CREATE TABLE IF NOT EXISTS public.place_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id UUID NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
    language_code VARCHAR(5) NOT NULL CHECK (language_code IN ('ar', 'fr', 'en')),
    title TEXT NOT NULL,
    short_description TEXT,
    full_description TEXT,
    address_display TEXT,
    practical_tips TEXT,
    CONSTRAINT uq_place_language UNIQUE (place_id, language_code)
);

-- 1.6. PLACE IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.place_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id UUID NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
    storage_path TEXT NOT NULL,
    alt_text TEXT,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    display_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 1.7. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id UUID NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT NOT NULL CHECK (char_length(trim(comment)) >= 5),
    language_code VARCHAR(5) NOT NULL DEFAULT 'fr' CHECK (language_code IN ('ar', 'fr', 'en')),
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_place_user_review UNIQUE (place_id, user_id)
);

-- 1.8. FAVORITES TABLE
CREATE TABLE IF NOT EXISTS public.favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    place_id UUID NOT NULL REFERENCES public.places(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uq_user_place_favorite UNIQUE (user_id, place_id)
);

-- 1.9. PERSISTENT AI RATE LIMITING TABLE
-- No direct client access. Accessed solely via SECURITY DEFINER consume_ai_quota().
CREATE TABLE IF NOT EXISTS public.ai_rate_limits (
    identifier TEXT NOT NULL,
    bucket_day DATE NOT NULL DEFAULT (now() AT TIME ZONE 'UTC')::date,
    minute_bucket TIMESTAMPTZ NOT NULL DEFAULT date_trunc('minute', now()),
    minute_count INT NOT NULL DEFAULT 0,
    day_count INT NOT NULL DEFAULT 0,
    last_request_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (identifier, bucket_day)
);

-- 1.10. ADMINISTRATIVE AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    target_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    performed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 2. PUBLIC SECURITY-BARRIER VIEW
-- ----------------------------------------------------------------------------
-- Exposes ONLY id, full_name, avatar_url for users with approved reviews on published places.
CREATE OR REPLACE VIEW public.public_review_authors
WITH (security_barrier = true)
AS
SELECT DISTINCT
    p.id,
    p.full_name,
    p.avatar_url
FROM public.profiles p
INNER JOIN public.reviews r ON r.user_id = p.id
INNER JOIN public.places pl ON pl.id = r.place_id
WHERE r.status = 'approved'
  AND pl.status = 'published';

-- ----------------------------------------------------------------------------
-- 3. PERFORMANCE & FILTERING INDEXES
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_places_published ON public.places (status) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_places_category_status ON public.places (category_id, status);
CREATE INDEX IF NOT EXISTS idx_places_geo ON public.places (latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_places_tags ON public.places USING gin (tags);
CREATE INDEX IF NOT EXISTS idx_place_translations_lookup ON public.place_translations (place_id, language_code);
CREATE INDEX IF NOT EXISTS idx_category_translations_lookup ON public.category_translations (category_id, language_code);
CREATE INDEX IF NOT EXISTS idx_reviews_place_status ON public.reviews (place_id, status);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON public.reviews (user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user ON public.favorites (user_id);
CREATE INDEX IF NOT EXISTS idx_ai_rate_limits_last_request ON public.ai_rate_limits (last_request_at);
CREATE INDEX IF NOT EXISTS idx_admin_audit_log_admin ON public.admin_audit_log (admin_id);

-- ----------------------------------------------------------------------------
-- 4. HARDENED SECURITY FUNCTIONS (SET search_path = pg_catalog, pg_temp)
-- ----------------------------------------------------------------------------

-- Function 4.1: is_admin()
-- Checks if current authenticated JWT user possesses admin role in profiles.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- Function 4.2: handle_new_user() — SECURITY DEFINER trigger on auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name',
             new.raw_user_meta_data->>'name',
             split_part(new.email, '@', 1)),
    COALESCE(new.raw_user_meta_data->>'avatar_url',
             new.raw_user_meta_data->>'picture',
             ''),
    'tourist'
  );
  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function 4.3: protect_profile_role() — BEFORE UPDATE trigger on profiles
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    IF auth.uid() IS NOT NULL THEN
      IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Unauthorized: Users cannot modify user roles or assign administrative privileges.';
      END IF;
    ELSE
      IF session_user NOT IN ('postgres', 'supabase_admin') THEN
        RAISE EXCEPTION 'Unauthorized: Direct database role modification requires a database administrator session.';
      END IF;
    END IF;
  END IF;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_role ON public.profiles;
CREATE TRIGGER trg_protect_profile_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.protect_profile_role();

-- Function 4.4: protect_review_fields() — BEFORE UPDATE trigger on reviews
CREATE OR REPLACE FUNCTION public.protect_review_fields()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
BEGIN
  IF NEW.user_id IS DISTINCT FROM OLD.user_id THEN
    RAISE EXCEPTION 'Immutable field: user_id cannot be modified.';
  END IF;

  IF NEW.place_id IS DISTINCT FROM OLD.place_id THEN
    RAISE EXCEPTION 'Immutable field: place_id cannot be modified.';
  END IF;

  IF NEW.status IS DISTINCT FROM OLD.status THEN
    IF auth.uid() IS NOT NULL THEN
      IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Unauthorized: Only administrators can modify review moderation status.';
      END IF;
    ELSE
      IF session_user NOT IN ('postgres', 'supabase_admin') THEN
        RAISE EXCEPTION 'Unauthorized: Status changes require administrator authorization.';
      END IF;
    END IF;
  END IF;

  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_review_fields ON public.reviews;
CREATE TRIGGER trg_protect_review_fields
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE PROCEDURE public.protect_review_fields();

-- Function 4.5: recalculate_place_ratings() — AFTER INSERT/UPDATE/DELETE on reviews
CREATE OR REPLACE FUNCTION public.recalculate_place_ratings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_place_id UUID;
BEGIN
  v_place_id := CASE WHEN TG_OP = 'DELETE' THEN OLD.place_id ELSE NEW.place_id END;

  UPDATE public.places
  SET
    avg_rating = COALESCE((
      SELECT round(avg(rating)::numeric, 2)
      FROM public.reviews
      WHERE place_id = v_place_id AND status = 'approved'
    ), 0.00),
    review_count = (
      SELECT count(*)::int
      FROM public.reviews
      WHERE place_id = v_place_id AND status = 'approved'
    ),
    updated_at = now()
  WHERE id = v_place_id;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_recalculate_ratings ON public.reviews;
CREATE TRIGGER trg_recalculate_ratings
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE PROCEDURE public.recalculate_place_ratings();

-- Function 4.6: consume_ai_quota() — Persistent atomic rate limiter
CREATE OR REPLACE FUNCTION public.consume_ai_quota(
    p_identifier TEXT,
    p_max_per_minute INT,
    p_max_per_day INT
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_now TIMESTAMPTZ := now();
  v_today DATE := (v_now AT TIME ZONE 'UTC')::date;
  v_minute_window TIMESTAMPTZ := date_trunc('minute', v_now);
  v_record public.ai_rate_limits%ROWTYPE;
  v_allowed BOOLEAN := false;
  v_minute_remaining INT;
  v_day_remaining INT;
  v_retry_after INT := 0;
  v_reason TEXT := 'ok';
BEGIN
  IF p_identifier IS NULL OR length(trim(p_identifier)) < 3 THEN
    RAISE EXCEPTION 'Invalid identifier for rate limiting.';
  END IF;
  IF p_max_per_minute <= 0 OR p_max_per_day <= 0 THEN
    RAISE EXCEPTION 'Rate limit thresholds must be greater than zero.';
  END IF;

  INSERT INTO public.ai_rate_limits
    (identifier, bucket_day, minute_bucket, minute_count, day_count, last_request_at)
  VALUES (p_identifier, v_today, v_minute_window, 0, 0, v_now)
  ON CONFLICT (identifier, bucket_day) DO NOTHING;

  SELECT * INTO v_record
  FROM public.ai_rate_limits
  WHERE identifier = p_identifier AND bucket_day = v_today
  FOR UPDATE;

  IF v_record.minute_bucket < v_minute_window THEN
    v_record.minute_count := 0;
    v_record.minute_bucket := v_minute_window;
  END IF;

  IF v_record.minute_count >= p_max_per_minute THEN
    v_allowed := false;
    v_reason := 'per_minute_exceeded';
    v_retry_after := GREATEST(1, 60 - EXTRACT(SECOND FROM v_now)::int);
  ELSIF v_record.day_count >= p_max_per_day THEN
    v_allowed := false;
    v_reason := 'per_day_exceeded';
    v_retry_after := GREATEST(1,
      EXTRACT(EPOCH FROM ((v_today + interval '1 day') - (v_now AT TIME ZONE 'UTC')))::int);
  ELSE
    v_record.minute_count := v_record.minute_count + 1;
    v_record.day_count := v_record.day_count + 1;
    v_allowed := true;
    v_reason := 'ok';

    UPDATE public.ai_rate_limits
    SET
      minute_bucket = v_record.minute_bucket,
      minute_count = v_record.minute_count,
      day_count = v_record.day_count,
      last_request_at = v_now
    WHERE identifier = p_identifier AND bucket_day = v_today;
  END IF;

  v_minute_remaining := GREATEST(0, p_max_per_minute - v_record.minute_count);
  v_day_remaining := GREATEST(0, p_max_per_day - v_record.day_count);

  RETURN jsonb_build_object(
    'allowed', v_allowed,
    'reason', v_reason,
    'minute_remaining', v_minute_remaining,
    'day_remaining', v_day_remaining,
    'retry_after', v_retry_after
  );
END;
$$;

-- Function 4.7: admin_set_user_role() — Authorized role assignment with audit
CREATE OR REPLACE FUNCTION public.admin_set_user_role(
    p_target_user_id UUID,
    p_new_role TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
DECLARE
  v_admin_id UUID := auth.uid();
  v_old_role TEXT;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized: Only administrators can assign user roles.';
  END IF;

  IF p_new_role NOT IN ('tourist', 'admin') THEN
    RAISE EXCEPTION 'Invalid role: must be tourist or admin.';
  END IF;

  SELECT role INTO v_old_role
  FROM public.profiles
  WHERE id = p_target_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Target user not found.';
  END IF;

  UPDATE public.profiles
  SET role = p_new_role, updated_at = now()
  WHERE id = p_target_user_id;

  INSERT INTO public.admin_audit_log (admin_id, target_user_id, action, details)
  VALUES (
    v_admin_id,
    p_target_user_id,
    'role_change',
    jsonb_build_object('old_role', v_old_role, 'new_role', p_new_role)
  );
END;
$$;

-- ----------------------------------------------------------------------------
-- 5. EXPLICIT DISCRETIONARY ACCESS CONTROL (DAC) GRANTS
-- ----------------------------------------------------------------------------
-- Revoke defaults from PUBLIC
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;

-- Baseline revocations from named roles
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated, service_role;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated, service_role;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated, service_role;

-- Schema USAGE
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

-- Anonymous visitors: read-only access to published catalog and approved reviews
GRANT SELECT ON
    public.categories,
    public.category_translations,
    public.places,
    public.place_translations,
    public.place_images,
    public.reviews,
    public.public_review_authors
  TO anon;

-- Authenticated tourists & admins: read access to catalog and reviews
GRANT SELECT ON
    public.categories,
    public.category_translations,
    public.places,
    public.place_translations,
    public.place_images,
    public.reviews,
    public.public_review_authors
  TO authenticated;

-- Write access on catalog: required for Admin CMS CRUD via PostgREST.
-- RLS policies strictly restrict write access to admins (is_admin() = true).
GRANT INSERT, UPDATE, DELETE ON
    public.categories,
    public.category_translations,
    public.places,
    public.place_translations,
    public.place_images
  TO authenticated;

-- Profiles: authenticated users read and update (RLS isolates to own record or admin)
-- INSERT is not granted: handle_new_user() runs as SECURITY DEFINER.
GRANT SELECT, UPDATE ON public.profiles TO authenticated;

-- Reviews: full user-level CRUD (RLS enforces user_id = auth.uid() or admin)
GRANT INSERT, UPDATE, DELETE ON public.reviews TO authenticated;

-- Favorites: user bookmarks CRUD
GRANT SELECT, INSERT, DELETE ON public.favorites TO authenticated;

-- Admin audit log: SELECT only (RLS restricts to admin)
GRANT SELECT ON public.admin_audit_log TO authenticated;

-- service_role: minimal explicit privileges for Edge Function execution
GRANT SELECT ON
    public.categories,
    public.category_translations,
    public.places,
    public.place_translations,
    public.place_images
  TO service_role;

-- Function Execution Privileges
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_set_user_role(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.consume_ai_quota(text, int, int) TO service_role;

-- ----------------------------------------------------------------------------
-- 6. DECOUPLED ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.category_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.place_translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.place_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- 6.1. PROFILES RLS
CREATE POLICY "Users read own profile" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admin read all profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admin update all profiles" ON public.profiles
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 6.2. CATEGORIES & TRANSLATIONS RLS
CREATE POLICY "Public read active categories" ON public.categories
  FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admin full access on categories" ON public.categories
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Public read category translations" ON public.category_translations
  FOR SELECT
  USING (true);

CREATE POLICY "Admin full access on category translations" ON public.category_translations
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 6.3. PLACES & TRANSLATIONS RLS
CREATE POLICY "Public read published places" ON public.places
  FOR SELECT
  USING (status = 'published');

CREATE POLICY "Admin full access on places" ON public.places
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Public read place translations for published places" ON public.place_translations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.places
      WHERE places.id = place_translations.place_id
        AND places.status = 'published'
    )
  );

CREATE POLICY "Admin full access on place translations" ON public.place_translations
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 6.4. PLACE IMAGES RLS
CREATE POLICY "Public read images for published places" ON public.place_images
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.places
      WHERE places.id = place_images.place_id
        AND places.status = 'published'
    )
  );

CREATE POLICY "Admin full access on place images" ON public.place_images
  FOR ALL TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- 6.5. REVIEWS RLS
CREATE POLICY "Public read approved reviews on published places" ON public.reviews
  FOR SELECT
  USING (
    status = 'approved'
    AND EXISTS (
      SELECT 1 FROM public.places
      WHERE places.id = reviews.place_id
        AND places.status = 'published'
    )
  );

CREATE POLICY "Users read own reviews" ON public.reviews
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admin read all reviews" ON public.reviews
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE POLICY "Authenticated users review published places" ON public.reviews
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.places
      WHERE places.id = reviews.place_id
        AND places.status = 'published'
    )
  );

CREATE POLICY "Users update own review" ON public.reviews
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin update reviews" ON public.reviews
  FOR UPDATE TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Users delete own review" ON public.reviews
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admin delete reviews" ON public.reviews
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- 6.6. FAVORITES RLS
CREATE POLICY "Users view own favorites" ON public.favorites
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own favorites" ON public.favorites
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users delete own favorites" ON public.favorites
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 6.7. INTERNAL TABLES RLS
CREATE POLICY "Deny all direct access to rate limits" ON public.ai_rate_limits
  FOR ALL
  USING (false);

CREATE POLICY "Admins read audit logs" ON public.admin_audit_log
  FOR SELECT TO authenticated
  USING (public.is_admin());
