// tests/frontend/phase6_admin_cms.test.ts
// Phase 6 Automated Test Suite: Admin CMS, RBAC, Place CRUD, Coordinates Constraint, and Review Moderation
// Governed strictly by AGENTS.md (Rules 1, 4, 7, 10, 12)

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.TEST_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const anonKey = process.env.TEST_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const touristEmail = process.env.TEST_TOURIST_EMAIL || 'sec-tourist@dakhlin.com';
const touristPassword = process.env.TEST_TOURIST_PASSWORD || 'Mohamed@12345';
const adminEmail = process.env.TEST_ADMIN_EMAIL || 'admin-test@dakhlin.com';
const adminPassword = process.env.TEST_ADMIN_PASSWORD || 'Mohamed@12345';

async function runPhase6Tests() {
  console.log('-----------------------------------------------------------------------------');
  console.log('Running Phase 6 Admin CMS, Content Editor & Review Moderation Test Suite...');
  console.log('-----------------------------------------------------------------------------');

  assert.ok(supabaseUrl, 'SUPABASE_URL must be provided');
  assert.ok(anonKey, 'SUPABASE_ANON_KEY must be provided');

  const anonClient = createClient(supabaseUrl, anonKey);
  const touristClient = createClient(supabaseUrl, anonKey);
  const adminClient = createClient(supabaseUrl, anonKey);

  // Authenticate tourist
  const { data: touristAuth, error: touristAuthErr } = await touristClient.auth.signInWithPassword({
    email: touristEmail,
    password: touristPassword,
  });
  assert.ifError(touristAuthErr);
  assert.ok(touristAuth.user, 'Tourist must authenticate');

  // Authenticate admin
  const { data: adminAuth, error: adminAuthErr } = await adminClient.auth.signInWithPassword({
    email: adminEmail,
    password: adminPassword,
  });
  assert.ifError(adminAuthErr);
  assert.ok(adminAuth.user, 'Admin must authenticate');

  // Fetch an active category to associate test places
  const { data: categories, error: catErr } = await adminClient
    .from('categories')
    .select('id, slug')
    .limit(1);
  assert.ifError(catErr);
  assert.ok(categories && categories.length > 0, 'At least one category must exist');
  const testCategoryId = categories[0].id;

  const testRunId = Date.now();
  const testSlug = `phase6-test-spot-${testRunId}`;
  let createdPlaceId: string | null = null;

  try {
    // --- Test 1: RBAC Enforcement — Tourist Write Rejection ---
    console.log('[Test 1] Verifying RBAC: Tourist cannot create or modify places...');
    const { error: touristInsertErr } = await touristClient
      .from('places')
      .insert({
        category_id: testCategoryId,
        slug: `tourist-illegal-${testRunId}`,
        status: 'draft',
      });
    assert.ok(touristInsertErr, 'Tourist place creation MUST be rejected by RLS');
    console.log('  -> PASSED: Tourist place insertion rejected by RLS policy.');

    // --- Test 2: Admin Profile & Permissions ---
    console.log('[Test 2] Verifying Admin role in public.profiles...');
    const { data: adminProfile, error: profErr } = await adminClient
      .from('profiles')
      .select('id, role')
      .eq('id', adminAuth.user.id)
      .single();
    assert.ifError(profErr);
    assert.equal(adminProfile.role, 'admin', 'Admin profile must have role = admin');
    console.log('  -> PASSED: Admin profile verified with role = admin.');

    // --- Test 3: Admin Place Creation (Draft with NULL Coordinates) ---
    console.log('[Test 3] Testing Admin Place creation in draft mode with NULL coordinates...');
    const { data: newPlace, error: createErr } = await adminClient
      .from('places')
      .insert({
        category_id: testCategoryId,
        slug: testSlug,
        status: 'draft',
        latitude: null,
        longitude: null,
        price_level: 2,
        is_featured: false,
      })
      .select('id, slug, status, latitude, longitude')
      .single();

    assert.ifError(createErr);
    assert.ok(newPlace && newPlace.id, 'Draft place must be created');
    createdPlaceId = newPlace.id;
    assert.equal(newPlace.status, 'draft');
    assert.equal(newPlace.latitude, null);
    assert.equal(newPlace.longitude, null);
    console.log(`  -> PASSED: Admin created draft place ${testSlug} with NULL coordinates.`);

    // Insert trilingual translations
    const { error: trErr } = await adminClient
      .from('place_translations')
      .insert([
        {
          place_id: createdPlaceId,
          language_code: 'en',
          title: `Test Spot ${testRunId}`,
          short_description: 'An authentic test spot in Dakhla',
          full_description: 'Full description for Phase 6 test spot',
        },
        {
          place_id: createdPlaceId,
          language_code: 'fr',
          title: `Spot Test ${testRunId}`,
          short_description: 'Un spot de test authentique à Dakhla',
          full_description: 'Description complète du spot de test',
        },
        {
          place_id: createdPlaceId,
          language_code: 'ar',
          title: `موقع اختبار ${testRunId}`,
          short_description: 'موقع اختبار أصيل في الداخلة',
          full_description: 'الوصف الكامل لموقع الاختبار',
        },
      ]);
    assert.ifError(trErr);
    console.log('  -> PASSED: Trilingual translations (EN, FR, AR) inserted successfully.');

    // --- Test 4: Strict Coordinates Constraint (chk_places_published_coords) ---
    console.log('[Test 4] Verifying chk_places_published_coords: Publishing without coordinates must fail...');
    const { error: invalidPublishErr } = await adminClient
      .from('places')
      .update({ status: 'published' })
      .eq('id', createdPlaceId);

    assert.ok(invalidPublishErr, 'Publishing with NULL coordinates MUST be rejected by DB constraint');
    assert.ok(
      invalidPublishErr.message.includes('chk_places_published_coords'),
      `Error must cite chk_places_published_coords: got ${invalidPublishErr.message}`
    );
    console.log('  -> PASSED: Database constraint chk_places_published_coords strictly enforced.');

    // Update with verified empirical GPS coordinates and publish
    console.log('[Test 4b] Updating place with empirical GPS coordinates and publishing...');
    const { error: validPublishErr } = await adminClient
      .from('places')
      .update({
        latitude: 23.7185,
        longitude: -15.9348,
        status: 'published',
      })
      .eq('id', createdPlaceId);

    assert.ifError(validPublishErr);
    console.log('  -> PASSED: Place promoted to published with valid coordinates.');

    // Verify public visibility via anon client
    const { data: publicPlace, error: pubErr } = await anonClient
      .from('places')
      .select('id, slug, status, latitude, longitude')
      .eq('id', createdPlaceId)
      .single();
    assert.ifError(pubErr);
    assert.equal(publicPlace.status, 'published');
    assert.equal(Number(publicPlace.latitude), 23.7185);
    console.log('  -> PASSED: Published place is immediately visible to public anonymous visitors.');

    // --- Test 5: Review Moderation & Rating Recalculation ---
    console.log('[Test 5] Testing tourist review submission and admin moderation...');
    const { data: reviewData, error: revErr } = await touristClient
      .from('reviews')
      .insert({
        place_id: createdPlaceId,
        user_id: touristAuth.user.id,
        rating: 5,
        comment: 'Exceptional test experience in Dakhla lagoon! Highly recommended.',
        language_code: 'en',
        status: 'approved',
      })
      .select('id, rating, status')
      .single();

    assert.ifError(revErr);
    assert.ok(reviewData && reviewData.id);

    // Verify place ratings recalculated automatically via trigger trg_recalculate_ratings
    const { data: ratedPlace, error: rateErr } = await anonClient
      .from('places')
      .select('avg_rating, review_count')
      .eq('id', createdPlaceId)
      .single();

    assert.ifError(rateErr);
    assert.equal(Number(ratedPlace.avg_rating), 5.00);
    assert.equal(ratedPlace.review_count, 1);
    console.log('  -> PASSED: Review approved; trg_recalculate_ratings updated avg_rating to 5.00 (count: 1).');

    // Tourist attempts to change moderation status -> MUST BE REJECTED by trg_protect_review_fields
    console.log('[Test 5b] Verifying tourist cannot tamper with review status...');
    const { error: touristStatusTamperErr } = await touristClient
      .from('reviews')
      .update({ status: 'rejected' })
      .eq('id', reviewData.id);

    assert.ok(touristStatusTamperErr, 'Tourist must NOT be allowed to change review status');
    console.log('  -> PASSED: Tourist status update rejected by protect_review_fields trigger.');

    // Admin updates status to rejected
    console.log('[Test 5c] Admin rejecting review and verifying rating recalculation...');
    const { error: adminRejectErr } = await adminClient
      .from('reviews')
      .update({ status: 'rejected' })
      .eq('id', reviewData.id);

    assert.ifError(adminRejectErr);

    const { data: rejectedPlace, error: rejErr } = await anonClient
      .from('places')
      .select('avg_rating, review_count')
      .eq('id', createdPlaceId)
      .single();

    assert.ifError(rejErr);
    assert.equal(Number(rejectedPlace.avg_rating), 0.00);
    assert.equal(rejectedPlace.review_count, 0);
    console.log('  -> PASSED: Review rejected; place rating recalculated to 0.00 (count: 0).');

    // Admin deletes the review cleanly
    const { error: delRevErr } = await adminClient
      .from('reviews')
      .delete()
      .eq('id', reviewData.id);
    assert.ifError(delRevErr);
    console.log('  -> PASSED: Admin deleted review cleanly.');

    // --- Test 6: Verify Admin UI Components and Route Tree ---
    console.log('[Test 6] Verifying Admin UI components and Route tree...');
    const adminFiles = [
      'src/components/admin/AdminGuard.tsx',
      'src/components/admin/AdminLayout.tsx',
      'src/pages/admin/AdminDashboardPage.tsx',
      'src/pages/admin/AdminPlacesPage.tsx',
      'src/pages/admin/AdminPlaceEditPage.tsx',
      'src/pages/admin/AdminCategoriesPage.tsx',
      'src/pages/admin/AdminReviewsPage.tsx',
      'src/services/adminService.ts',
      'src/utils/imageOptimizer.ts',
    ];

    for (const f of adminFiles) {
      assert.ok(fs.existsSync(path.resolve(__dirname, '../../', f)), `File ${f} must exist`);
    }

    const appSource = fs.readFileSync(path.resolve(__dirname, '../../src/App.tsx'), 'utf8');
    assert.ok(appSource.includes('path="/admin"'), 'App.tsx must register /admin route');
    assert.ok(appSource.includes('<AdminGuard />'), 'App.tsx must protect /admin with AdminGuard');
    console.log('  -> PASSED: All 9 Admin CMS components and route trees verified.');
  } finally {
    // Teardown: Cleanly delete test place if created
    if (createdPlaceId) {
      console.log(`[Teardown] Cleaning up test place ${createdPlaceId}...`);
      await adminClient.from('places').delete().eq('id', createdPlaceId);
      console.log('  -> PASSED: Teardown completed.');
    }
    await touristClient.auth.signOut();
    await adminClient.auth.signOut();
  }

  console.log('-----------------------------------------------------------------------------');
  console.log('Phase 6 Admin CMS Verification Suite PASSED successfully!');
  console.log('-----------------------------------------------------------------------------');
}

runPhase6Tests().catch((err) => {
  console.error('PHASE 6 TEST FAILED:', err);
  process.exit(1);
});
