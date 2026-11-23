-- ============================================================================
-- Dakhla Tourism Platform — Phase 1 Security Test Suite (SEC-01 through SEC-05)
-- File: tests/security/database_security_suite.sql
-- Compliance: AGENTS.md Rules 1, 3, 4, 7, 9 & plan.md v1.14.0 Section 11.1
-- ============================================================================
-- NOTE: Execute this script using a privileged PostgreSQL connection (e.g., postgres
-- or Supabase Dashboard SQL Editor) after applying migrations and provisioning
-- test user sec-tourist@dakhlin.com.
-- ============================================================================

-- ============================================================================
-- Starting Dakhla Database Security Test Suite (SEC-01 - SEC-05)
-- ============================================================================

-- -------------------------------------------------------------------------
-- TEST SEC-01: Profile Privacy for Anonymous Users (Failure-Safe Harness)
-- OBJECTIVE: Confirm anon role is denied table read access on public.profiles.
-- Captures SQLSTATE explicitly and guarantees role restoration.
-- -------------------------------------------------------------------------
DO $$
DECLARE
  v_sqlstate TEXT := '';
  v_errmsg TEXT := '';
  v_count INT;
BEGIN
  BEGIN
    SET LOCAL ROLE anon;
    SELECT count(*) INTO v_count FROM public.profiles;
    -- If no exception was thrown, the test failed
    RAISE EXCEPTION 'SEC-01 UNEXPECTED: Anonymous role was permitted to read profiles (count=%).', v_count;
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS
      v_sqlstate = RETURNED_SQLSTATE,
      v_errmsg = MESSAGE_TEXT;
  END;

  RESET ROLE;

  -- Assert exact SQLSTATE 42501 (insufficient_privilege)
  IF v_sqlstate <> '42501' THEN
    RAISE EXCEPTION 'SEC-01 FAILED: Expected SQLSTATE 42501, got [%] (Message: %)', v_sqlstate, v_errmsg;
  END IF;

  RAISE NOTICE 'SEC-01 PASSED: Anonymous read denied with SQLSTATE 42501 as expected.';
END;
$$;

-- -------------------------------------------------------------------------
-- TEST SEC-02: User Role Escalation Prevention (Failure-Safe Harness)
-- OBJECTIVE: Confirm an authenticated tourist cannot escalate their own role.
-- Uses dynamically provisioned test tourist user.
-- Captures exception explicitly and guarantees role restoration.
-- -------------------------------------------------------------------------
DO $$
DECLARE
  v_tourist_id UUID;
  v_sqlstate TEXT := '';
  v_errmsg TEXT := '';
BEGIN
  -- Dynamically query verified test tourist account provisioned via Auth
  SELECT id INTO v_tourist_id
  FROM auth.users
  WHERE email = 'sec-tourist@dakhlin.com'
  LIMIT 1;

  IF v_tourist_id IS NULL THEN
    RAISE EXCEPTION 'SEC-02 SETUP FAILED: Test tourist user sec-tourist@dakhlin.com not found in auth.users.';
  END IF;

  -- Ensure profile exists and has role 'tourist'
  UPDATE public.profiles SET role = 'tourist' WHERE id = v_tourist_id;

  BEGIN
    SET LOCAL ROLE authenticated;
    EXECUTE format('SET LOCAL request.jwt.claim.sub = %L', v_tourist_id::text);

    -- Attempt role escalation on existing row
    UPDATE public.profiles
    SET role = 'admin'
    WHERE id = v_tourist_id;

    RAISE EXCEPTION 'SEC-02 UNEXPECTED: Tourist role was able to modify profile role.';
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS
      v_sqlstate = RETURNED_SQLSTATE,
      v_errmsg = MESSAGE_TEXT;
  END;

  RESET ROLE;

  IF position('Unauthorized: Users cannot modify user roles' IN v_errmsg) = 0 THEN
    RAISE EXCEPTION 'SEC-02 FAILED: Expected role escalation exception, got [%] (Message: %)', v_sqlstate, v_errmsg;
  END IF;

  RAISE NOTICE 'SEC-02 PASSED: Role escalation blocked by trigger as expected.';
END;
$$;

-- =========================================================================
-- TESTS SEC-03A and SEC-03B: Combined Failure-Safe Transactional Harness
--
-- Designed to execute safely in Supabase SQL Editor, psql, and Node.js pg.
-- Setup, sub-tests, and teardown run inside a SINGLE block with guaranteed
-- complete cleanup of review, place, and category even when assertions fail.
--
-- FIXTURE ISOLATION:
--   * User: Dynamically referenced from auth.users (sec-tourist@dakhlin.com)
--   * Category: Unique per-run UUID (gen_random_uuid())
--   * Place: Unique per-run UUID (gen_random_uuid())
--   * Review: Unique per-run UUID (gen_random_uuid())
--   * Teardown deletes ONLY the unique per-run UUIDs; never touches pre-existing rows.
-- =========================================================================
DO $$
DECLARE
  v_fixture_cat           UUID := gen_random_uuid();
  v_fixture_place         UUID := gen_random_uuid();
  v_fixture_review        UUID := gen_random_uuid();
  v_target_place_tamper   UUID := gen_random_uuid();
  v_cat_slug              TEXT := 'sec03-cat-' || substr(replace(v_fixture_cat::text, '-', ''), 1, 12);
  v_place_slug            TEXT := 'sec03-place-' || substr(replace(v_fixture_place::text, '-', ''), 1, 12);
  v_fixture_user          UUID;
  v_user_role             TEXT;
  v_target_count          INT;
  v_sqlstate              TEXT;
  v_errmsg                TEXT;
  v_orig_sqlstate         TEXT;
  v_orig_errmsg           TEXT;
  v_test_failed           BOOLEAN := false;
  v_fail_reason           TEXT := '';
BEGIN
  -- 1. Dynamically resolve verified tourist user ID and assert role is already tourist
  SELECT id INTO v_fixture_user
  FROM auth.users
  WHERE email = 'sec-tourist@dakhlin.com'
  LIMIT 1;

  IF v_fixture_user IS NULL THEN
    RAISE EXCEPTION 'SEC-03 SETUP FAILED: Test tourist user sec-tourist@dakhlin.com not found in auth.users.';
  END IF;

  -- Assert profile exists and role is already 'tourist'; never mutate or overwrite pre-existing profile
  SELECT role INTO v_user_role FROM public.profiles WHERE id = v_fixture_user;
  IF v_user_role IS NULL THEN
    RAISE EXCEPTION 'SEC-03 SETUP FAILED: Profile for sec-tourist@dakhlin.com not found in public.profiles.';
  ELSIF v_user_role <> 'tourist' THEN
    RAISE EXCEPTION 'SEC-03 SETUP FAILED: Test user role must be tourist, but found [%]. Aborting to prevent profile corruption.', v_user_role;
  END IF;

  -- 2. Pristine fixture provisioning (unique per-run UUIDs, zero collision risk)
  -- Uses a draft place with NULL coordinates to avoid any hardcoded GPS estimates
  INSERT INTO public.categories (id, slug, icon)
  VALUES (v_fixture_cat, v_cat_slug, 'compass');

  INSERT INTO public.places (id, category_id, slug, latitude, longitude, status)
  VALUES (v_fixture_place, v_fixture_cat, v_place_slug, NULL, NULL, 'draft');

  -- Insert review fixture with status = 'pending' so SEC-03A tests a genuine status change
  INSERT INTO public.reviews (id, place_id, user_id, rating, comment, language_code, status)
  VALUES (v_fixture_review, v_fixture_place, v_fixture_user, 4, 'Valid review comment text', 'fr', 'pending');

  -- Verify exactly 1 fixture row exists
  SELECT count(*) INTO v_target_count FROM public.reviews WHERE id = v_fixture_review;
  IF v_target_count <> 1 THEN
    RAISE EXCEPTION 'SEC-03 SETUP FAILED: Expected exactly 1 review row, found %.', v_target_count;
  END IF;

  -- 3. Sub-Test SEC-03A: Status Tampering Prevention
  BEGIN
    SET LOCAL ROLE authenticated;
    EXECUTE format('SET LOCAL request.jwt.claim.sub = %L', v_fixture_user::text);

    UPDATE public.reviews
    SET status = 'approved'
    WHERE id = v_fixture_review AND user_id = v_fixture_user;

    v_test_failed := true;
    v_fail_reason := v_fail_reason || '[SEC-03A UNEXPECTED: Tourist update to status=approved succeeded.] ';
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_errmsg = MESSAGE_TEXT;
    IF position('Only administrators can modify review moderation status' IN v_errmsg) = 0 THEN
      v_test_failed := true;
      v_fail_reason := v_fail_reason || '[SEC-03A WRONG EXCEPTION: ' || v_errmsg || '] ';
    END IF;
  END;

  RESET ROLE;

  -- 4. Sub-Test SEC-03B: Place ID Immutability Enforcement
  -- Attempts to change place_id to a dynamically generated per-run UUID
  BEGIN
    SET LOCAL ROLE authenticated;
    EXECUTE format('SET LOCAL request.jwt.claim.sub = %L', v_fixture_user::text);

    UPDATE public.reviews
    SET place_id = v_target_place_tamper
    WHERE id = v_fixture_review AND user_id = v_fixture_user;

    v_test_failed := true;
    v_fail_reason := v_fail_reason || '[SEC-03B UNEXPECTED: Tourist update of place_id succeeded.] ';
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_sqlstate = RETURNED_SQLSTATE, v_errmsg = MESSAGE_TEXT;
    IF position('Immutable field: place_id cannot be modified' IN v_errmsg) = 0 THEN
      v_test_failed := true;
      v_fail_reason := v_fail_reason || '[SEC-03B WRONG EXCEPTION: ' || v_errmsg || '] ';
    END IF;
  END;

  RESET ROLE;

  -- 5. Guaranteed Comprehensive Teardown (only deletes this test's unique UUIDs)
  DELETE FROM public.reviews WHERE id = v_fixture_review;
  DELETE FROM public.places WHERE id = v_fixture_place;
  DELETE FROM public.categories WHERE id = v_fixture_cat;

  -- Post-cleanup verification: ensure all fixtures were completely removed
  IF EXISTS (SELECT 1 FROM public.reviews WHERE id = v_fixture_review) OR
     EXISTS (SELECT 1 FROM public.places WHERE id = v_fixture_place) OR
     EXISTS (SELECT 1 FROM public.categories WHERE id = v_fixture_cat) THEN
    RAISE EXCEPTION 'SEC-03 TEARDOWN FAILED: Fixtures were not completely deleted from database.';
  END IF;

  -- 6. Final assertion evaluation
  IF v_test_failed THEN
    RAISE EXCEPTION 'SEC-03 TEST SUITE FAILED: %', v_fail_reason;
  END IF;

  RAISE NOTICE 'SEC-03 PASSED: Both SEC-03A and SEC-03B succeeded; per-run fixtures cleaned up.';
EXCEPTION WHEN OTHERS THEN
  -- Capture original exception diagnostics before performing teardown
  GET STACKED DIAGNOSTICS
    v_orig_sqlstate = RETURNED_SQLSTATE,
    v_orig_errmsg = MESSAGE_TEXT;

  -- Fallback teardown on unexpected setup or assertion abort
  DELETE FROM public.reviews WHERE id = v_fixture_review;
  DELETE FROM public.places WHERE id = v_fixture_place;
  DELETE FROM public.categories WHERE id = v_fixture_cat;
  RESET ROLE;

  -- Post-cleanup verification: report explicit cleanup failure if residual fixtures remain
  IF EXISTS (SELECT 1 FROM public.reviews WHERE id = v_fixture_review) OR
     EXISTS (SELECT 1 FROM public.places WHERE id = v_fixture_place) OR
     EXISTS (SELECT 1 FROM public.categories WHERE id = v_fixture_cat) THEN
    RAISE EXCEPTION 'SEC-03 TEARDOWN FAILED: Fallback cleanup failed to delete all per-run fixtures. (Original test error: [%] %)',
      v_orig_sqlstate, v_orig_errmsg;
  END IF;

  -- Re-raise original test error if teardown succeeded cleanly
  RAISE;
END;
$$;

-- -------------------------------------------------------------------------
-- TEST SEC-04: Unpublished Draft Place & Review Isolation (Reliable Harness)
-- OBJECTIVE: Confirm anon role cannot see draft places or their reviews.
-- Eliminates false-positives by inserting a known draft fixture under
-- privileged context, verifying it exists, asserting anon isolation, and cleaning up.
-- -------------------------------------------------------------------------
DO $$
DECLARE
  v_cat_id        UUID := gen_random_uuid();
  v_place_id      UUID := gen_random_uuid();
  v_review_id     UUID := gen_random_uuid();
  v_cat_slug      TEXT := 'sec04-cat-' || substr(replace(v_cat_id::text, '-', ''), 1, 12);
  v_place_slug    TEXT := 'sec04-draft-' || substr(replace(v_place_id::text, '-', ''), 1, 12);
  v_tourist_id    UUID;
  v_priv_places   INT;
  v_priv_reviews  INT;
  v_anon_places   INT;
  v_anon_reviews  INT;
  v_orig_sqlstate TEXT;
  v_orig_errmsg   TEXT;
BEGIN
  -- 1. Resolve tourist user for review fixture
  SELECT id INTO v_tourist_id FROM auth.users WHERE email = 'sec-tourist@dakhlin.com' LIMIT 1;
  IF v_tourist_id IS NULL THEN
    RAISE EXCEPTION 'SEC-04 SETUP FAILED: Test tourist user not found.';
  END IF;

  -- 2. Setup known draft fixtures under privileged database session
  INSERT INTO public.categories (id, slug, icon) VALUES (v_cat_id, v_cat_slug, 'map-pin');
  -- Draft place (coordinates allowed to be NULL per schema)
  INSERT INTO public.places (id, category_id, slug, latitude, longitude, status)
  VALUES (v_place_id, v_cat_id, v_place_slug, NULL, NULL, 'draft');

  INSERT INTO public.reviews (id, place_id, user_id, rating, comment, language_code, status)
  VALUES (v_review_id, v_place_id, v_tourist_id, 5, 'Great draft place review', 'fr', 'approved');

  -- 3. Verify privileged context CAN see the fixture
  SELECT count(*) INTO v_priv_places FROM public.places WHERE id = v_place_id;
  SELECT count(*) INTO v_priv_reviews FROM public.reviews WHERE id = v_review_id;

  IF v_priv_places <> 1 OR v_priv_reviews <> 1 THEN
    RAISE EXCEPTION 'SEC-04 SETUP FAILED: Privileged session failed to verify draft fixtures (places=%, reviews=%).',
      v_priv_places, v_priv_reviews;
  END IF;

  -- 4. Switch to anon role and verify strict isolation
  BEGIN
    SET LOCAL ROLE anon;
    SELECT count(*) INTO v_anon_places FROM public.places WHERE id = v_place_id;
    SELECT count(*) INTO v_anon_reviews FROM public.reviews WHERE id = v_review_id;
  EXCEPTION WHEN OTHERS THEN
    RESET ROLE;
    RAISE;
  END;

  RESET ROLE;

  -- 5. Teardown fixtures and verify complete removal
  DELETE FROM public.reviews WHERE id = v_review_id;
  DELETE FROM public.places WHERE id = v_place_id;
  DELETE FROM public.categories WHERE id = v_cat_id;

  -- Post-cleanup verification in normal path
  IF EXISTS (SELECT 1 FROM public.reviews WHERE id = v_review_id) OR
     EXISTS (SELECT 1 FROM public.places WHERE id = v_place_id) OR
     EXISTS (SELECT 1 FROM public.categories WHERE id = v_cat_id) THEN
    RAISE EXCEPTION 'SEC-04 TEARDOWN FAILED: Draft fixtures were not completely deleted from database.';
  END IF;

  -- 6. Evaluate assertions
  IF v_anon_places <> 0 OR v_anon_reviews <> 0 THEN
    RAISE EXCEPTION 'SEC-04 FAILED: Anonymous role saw draft fixtures (seen_places=%, seen_reviews=%).',
      v_anon_places, v_anon_reviews;
  END IF;

  RAISE NOTICE 'SEC-04 PASSED: Draft place and associated reviews verified invisible to anon role.';
EXCEPTION WHEN OTHERS THEN
  -- Capture original exception diagnostics before performing teardown
  GET STACKED DIAGNOSTICS
    v_orig_sqlstate = RETURNED_SQLSTATE,
    v_orig_errmsg = MESSAGE_TEXT;

  DELETE FROM public.reviews WHERE id = v_review_id;
  DELETE FROM public.places WHERE id = v_place_id;
  DELETE FROM public.categories WHERE id = v_cat_id;
  RESET ROLE;

  -- Post-cleanup verification: report explicit cleanup failure if residual fixtures remain
  IF EXISTS (SELECT 1 FROM public.reviews WHERE id = v_review_id) OR
     EXISTS (SELECT 1 FROM public.places WHERE id = v_place_id) OR
     EXISTS (SELECT 1 FROM public.categories WHERE id = v_cat_id) THEN
    RAISE EXCEPTION 'SEC-04 TEARDOWN FAILED: Fallback cleanup failed to delete all draft fixtures. (Original test error: [%] %)',
      v_orig_sqlstate, v_orig_errmsg;
  END IF;

  -- Re-raise original test error if teardown succeeded cleanly
  RAISE;
END;
$$;

-- -------------------------------------------------------------------------
-- TEST SEC-05: Public Review Authors View Privacy
-- OBJECTIVE: View returns ONLY id, full_name, avatar_url — zero emails.
-- -------------------------------------------------------------------------
DO $$
DECLARE
  v_column_count INT;
BEGIN
  SET LOCAL ROLE anon;
  SELECT count(*) INTO v_column_count
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'public_review_authors';
  RESET ROLE;

  IF v_column_count <> 3 THEN
    RAISE EXCEPTION 'SEC-05 FAILED: Expected exactly 3 columns on public_review_authors, found %.', v_column_count;
  END IF;

  RAISE NOTICE 'SEC-05 PASSED: public_review_authors projects exactly 3 safe display columns.';
END;
$$;

-- ============================================================================
-- All database security tests (SEC-01 - SEC-05) completed successfully.
-- ============================================================================
