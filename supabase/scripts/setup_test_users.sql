-- ============================================================================
-- DAKHLA TOURISM PLATFORM — TEST ACCOUNTS PROVISIONING HELPER (v1.15.0)
-- Script: supabase/scripts/setup_test_users.sql
-- Governed strictly by plan.md Section 11 and AGENTS.md
-- ============================================================================

DO $$
DECLARE
  v_tourist_email CONSTANT TEXT := 'sec-tourist@dakhlin.com';
  v_admin_email   CONSTANT TEXT := 'admin-test@dakhlin.com';
  v_tourist_id    UUID;
  v_admin_id      UUID;
  v_rowcount      INT;
BEGIN
  -- 1. Verify caller has database administrator privileges
  IF session_user NOT IN ('postgres', 'supabase_admin') THEN
    RAISE EXCEPTION 'TEST SETUP FAILED: Direct role provisioning requires a database administrator session (current: %).', session_user;
  END IF;

  -- 2. Verify both users exist in auth.users
  SELECT id INTO v_tourist_id FROM auth.users WHERE email = v_tourist_email;
  IF v_tourist_id IS NULL THEN
    RAISE EXCEPTION 'TEST SETUP FAILED: Tourist user % not found in auth.users. Please create it in Supabase Auth first.', v_tourist_email;
  END IF;

  SELECT id INTO v_admin_id FROM auth.users WHERE email = v_admin_email;
  IF v_admin_id IS NULL THEN
    RAISE EXCEPTION 'TEST SETUP FAILED: Admin test user % not found in auth.users. Please create it in Supabase Auth first.', v_admin_email;
  END IF;

  -- 3. Update tourist profile (explicitly tourist, satisfying CHECK (role IN ('tourist', 'admin')))
  UPDATE public.profiles
  SET role = 'tourist', updated_at = now()
  WHERE id = v_tourist_id;

  GET DIAGNOSTICS v_rowcount = ROW_COUNT;
  IF v_rowcount <> 1 THEN
    RAISE EXCEPTION 'TEST SETUP FAILED: Expected exactly 1 profile updated for tourist user %, but % rows were affected. Rolling back.', v_tourist_email, v_rowcount;
  END IF;

  -- 4. Update admin test profile (explicitly admin, satisfying CHECK (role IN ('tourist', 'admin')))
  UPDATE public.profiles
  SET role = 'admin', updated_at = now()
  WHERE id = v_admin_id;

  GET DIAGNOSTICS v_rowcount = ROW_COUNT;
  IF v_rowcount <> 1 THEN
    RAISE EXCEPTION 'TEST SETUP FAILED: Expected exactly 1 profile updated for admin user %, but % rows were affected. Rolling back.', v_admin_email, v_rowcount;
  END IF;

  -- 5. Print success confirmation ONLY after both updates succeed
  RAISE NOTICE 'TEST SETUP VERIFIED: Successfully configured sec-tourist@dakhlin.com (role: tourist) and admin-test@dakhlin.com (role: admin).';
END;
$$;
