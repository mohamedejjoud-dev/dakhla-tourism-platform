-- ============================================================================
-- DAKHLA TOURISM PLATFORM — STORAGE CONFIGURATION & POLICIES (v1.14.0)
-- Migration: 20261123000001_storage_setup.sql
-- Governed strictly by plan.md Section 7 and AGENTS.md
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. BUCKET PROVISIONING: places-media
-- ----------------------------------------------------------------------------
-- Bucket is public for high-performance CDN edge delivery of media.
-- File size limit: 5MB (5,242,880 bytes).
-- Allowed MIME types: image/jpeg, image/png, image/webp.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'places-media', 'places-media', true, 5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- ----------------------------------------------------------------------------
-- 2. STORAGE ROW LEVEL SECURITY POLICIES
-- ----------------------------------------------------------------------------
-- Public visitors have unrestricted read access to media in places-media
DROP POLICY IF EXISTS "Public read places-media" ON storage.objects;
CREATE POLICY "Public read places-media"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'places-media');

-- Only verified administrators can upload images into places-media
DROP POLICY IF EXISTS "Admin upload places-media" ON storage.objects;
CREATE POLICY "Admin upload places-media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'places-media' AND public.is_admin());

-- Only verified administrators can update existing images in places-media
DROP POLICY IF EXISTS "Admin update places-media" ON storage.objects;
CREATE POLICY "Admin update places-media"
  ON storage.objects FOR UPDATE TO authenticated
  USING  (bucket_id = 'places-media' AND public.is_admin())
  WITH CHECK (bucket_id = 'places-media' AND public.is_admin());

-- Only verified administrators can delete images from places-media
DROP POLICY IF EXISTS "Admin delete places-media" ON storage.objects;
CREATE POLICY "Admin delete places-media"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'places-media' AND public.is_admin());
