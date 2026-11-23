import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL: string = process.env.TEST_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY: string = process.env.TEST_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const TOURIST_EMAIL: string = process.env.TEST_TOURIST_EMAIL || 'sec-tourist@dakhlin.com';
const TOURIST_PASSWORD: string = process.env.TEST_TOURIST_PASSWORD || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment.");
  process.exit(1);
}

if (!TOURIST_PASSWORD) {
  console.error("Missing TEST_TOURIST_PASSWORD in environment.");
  process.exit(1);
}

const cleanUrl = SUPABASE_URL.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");

async function runPhase4Tests() {
  console.log("-----------------------------------------------------------------------------");
  console.log("Running Phase 4 Tourist Auth, Reviews & Favorites Test Suite...");
  console.log("-----------------------------------------------------------------------------");

  const anonClient = createClient(cleanUrl, SUPABASE_ANON_KEY);

  // --- Test 1: Unauthenticated RLS enforcement on favorites & reviews ---
  console.log("[Test 1] Verifying unauthenticated write rejection (RLS 42501)...");
  
  const dummyPlaceId = '11111111-0001-0000-0000-000000000001'; // hotels category UUID as dummy
  const dummyUserId = '00000000-0000-0000-0000-000000000000';

  // 1A. Anon insert favorite must fail
  const { error: favAnonErr } = await anonClient
    .from('favorites')
    .insert({ user_id: dummyUserId, place_id: dummyPlaceId });

  assert.ok(favAnonErr, "Anon favorite insert must be rejected by RLS");
  console.log(`  -> PASSED: Anon favorite insert rejected: ${favAnonErr.message}`);

  // 1B. Anon insert review must fail
  const { error: revAnonErr } = await anonClient
    .from('reviews')
    .insert({
      user_id: dummyUserId,
      place_id: dummyPlaceId,
      rating: 5,
      comment: 'Super séjour à Dakhla !',
    });

  assert.ok(revAnonErr, "Anon review insert must be rejected by RLS");
  console.log(`  -> PASSED: Anon review insert rejected: ${revAnonErr.message}`);

  // --- Test 2: Tourist Authentication via Supabase Auth ---
  console.log("[Test 2] Authenticating test tourist user...");
  const touristClient = createClient(cleanUrl, SUPABASE_ANON_KEY);
  const { data: authData, error: authErr } = await touristClient.auth.signInWithPassword({
    email: TOURIST_EMAIL,
    password: TOURIST_PASSWORD,
  });

  assert.ifError(authErr);
  assert.ok(authData.user, "Tourist user must exist in session");
  const touristId = authData.user.id;
  console.log(`  -> PASSED: Tourist authenticated successfully (UID: ${touristId})`);

  // --- Test 3: Hydrate and verify Profile Role ---
  console.log("[Test 3] Verifying tourist profile in public.profiles...");
  const { data: profile, error: profErr } = await touristClient
    .from('profiles')
    .select('id, email, full_name, role')
    .eq('id', touristId)
    .single();

  assert.ifError(profErr);
  assert.equal(profile.role, 'tourist', "Profile role must be tourist");
  console.log(`  -> PASSED: Profile verified with role = 'tourist'.`);

  // --- Test 4: Favorites toggle & RLS for authenticated user ---
  console.log("[Test 4] Testing persistent favorites insert, select, and delete...");
  
  // Use known place #01 from seed_dakhla_places.sql: 22222222-0001-0000-0000-000000000001
  const targetPlaceId = '22222222-0001-0000-0000-000000000001';

  // 4A. Add favorite
  const { error: addFavErr } = await touristClient
    .from('favorites')
    .insert({ user_id: touristId, place_id: targetPlaceId });
  
  // Ignore duplicate if already existed from prior run
  if (addFavErr && addFavErr.code !== '23505') {
    assert.ifError(addFavErr);
  }

  // 4B. Query user's favorites
  const { data: userFavs, error: getFavErr } = await touristClient
    .from('favorites')
    .select('place_id')
    .eq('user_id', touristId);

  assert.ifError(getFavErr);
  const hasFav = (userFavs || []).some((f) => f.place_id === targetPlaceId);
  assert.ok(hasFav, "Target place must appear in user's favorites");

  // 4C. Remove favorite
  const { error: delFavErr } = await touristClient
    .from('favorites')
    .delete()
    .eq('user_id', touristId)
    .eq('place_id', targetPlaceId);

  assert.ifError(delFavErr);
  console.log("  -> PASSED: Authenticated user favorites lifecycle verified (add, read, remove).");

  // --- Test 5: Verify public_review_authors Privacy View ---
  console.log("[Test 5] Verifying public_review_authors privacy security barrier...");
  const { data: authors, error: authorErr } = await anonClient
    .from('public_review_authors')
    .select('*')
    .limit(5);

  assert.ifError(authorErr);
  if (authors && authors.length > 0) {
    for (const a of authors) {
      assert.ok(!('email' in a), "SECURITY VIOLATION: public_review_authors view must NEVER expose email");
      assert.ok('id' in a, "Author id expected");
      assert.ok('full_name' in a, "Author full_name expected");
      assert.ok('avatar_url' in a, "Author avatar_url expected");
    }
  }
  console.log("  -> PASSED: public_review_authors strictly isolates profile identities with ZERO email exposure.");

  // --- Test 6: Sign Out ---
  console.log("[Test 6] Signing out tourist session...");
  await touristClient.auth.signOut();
  console.log("  -> PASSED: Signed out cleanly.");

  console.log("-----------------------------------------------------------------------------");
  console.log("Phase 4 Tourist Auth, Reviews & Favorites Test Suite PASSED successfully!");
  console.log("-----------------------------------------------------------------------------");
}

runPhase4Tests().catch((err) => {
  console.error("PHASE 4 TEST FAILED:", err);
  process.exit(1);
});
