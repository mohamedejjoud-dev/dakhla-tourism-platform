-- ============================================================================
-- DAKHLA TOURISM PLATFORM — FIRST ADMINISTRATOR BOOTSTRAP (v1.14.0)
-- Script: supabase/scripts/admin_bootstrap.sql
-- Governed strictly by plan.md Section 5 and AGENTS.md
-- ============================================================================
--
-- BOOTSTRAP PROCEDURE:
-- 1. Project owner registers via AuthPage.tsx (or Supabase Auth Dashboard)
--    with email 'owner@dakhlin.com'.
-- 2. handle_new_user() trigger automatically provisions profile with role = 'tourist'.
-- 3. Database administrator opens Supabase Dashboard -> SQL Editor and runs this script.
-- 4. In SQL Editor, session_user is 'postgres', which satisfies protect_profile_role().
-- 5. Subsequent admin role changes MUST be performed via admin_set_user_role() RPC.
--

DO $$
DECLARE
  v_owner_email TEXT := 'owner@dakhlin.com';
  v_user_id UUID;
  v_current_role TEXT;
BEGIN
  -- 1. Verify caller has database administrator connection
  IF session_user NOT IN ('postgres', 'supabase_admin') THEN
    RAISE EXCEPTION 'BOOTSTRAP FAILED: Direct role bootstrap must be executed in a database administrator session (current: %).', session_user;
  END IF;

  -- 2. Resolve user ID from auth.users
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = v_owner_email;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'BOOTSTRAP FAILED: User % must register in Supabase Auth first before bootstrap.', v_owner_email;
  END IF;

  -- 3. Check existing profile role
  SELECT role INTO v_current_role
  FROM public.profiles
  WHERE id = v_user_id;

  IF v_current_role = 'admin' THEN
    RAISE NOTICE 'BOOTSTRAP NOTICE: User % is already an administrator.', v_owner_email;
    RETURN;
  END IF;

  -- 4. Perform atomic bootstrap update
  UPDATE public.profiles
  SET role = 'admin', updated_at = now()
  WHERE id = v_user_id;

  -- 5. Log audit trail entry
  INSERT INTO public.admin_audit_log (admin_id, target_user_id, action, details)
  VALUES (
    v_user_id,
    v_user_id,
    'bootstrap_initial_admin',
    jsonb_build_object(
      'email', v_owner_email,
      'previous_role', v_current_role,
      'new_role', 'admin',
      'executed_by', session_user,
      'timestamp', now()
    )
  );

  RAISE NOTICE 'BOOTSTRAP SUCCESS: User % (%) successfully promoted to admin.', v_owner_email, v_user_id;
END;
$$;
