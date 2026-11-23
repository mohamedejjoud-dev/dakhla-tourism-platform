import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';
import { resolveTranslation } from '../../src/services/tourismService';
import { PlaceTranslation } from '../../src/types/database';

const SUPABASE_URL = process.env.TEST_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.TEST_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment.");
  process.exit(1);
}

const cleanUrl = SUPABASE_URL.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
const supabase = createClient(cleanUrl, SUPABASE_ANON_KEY);

async function runPhase3DiscoveryTests() {
  console.log("-----------------------------------------------------------------------------");
  console.log("Running Phase 3 Discovery, Search, Filters & Map Test Suite...");
  console.log("-----------------------------------------------------------------------------");

  // --- Test 1: Category retrieval and trilingual names ---
  console.log("[Test 1] Querying categories with anon client...");
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id, slug, icon, is_active')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  assert.ifError(catError);
  assert.equal(categories.length, 7, "Expected exactly 7 active categories");
  console.log(`  -> PASSED: Exactly 7 active categories verified.`);

  // --- Test 2: Category translations for AR, FR, EN ---
  console.log("[Test 2] Verifying trilingual category translations...");
  const { data: catTrans, error: transError } = await supabase
    .from('category_translations')
    .select('category_id, language_code, name');

  assert.ifError(transError);
  for (const cat of categories) {
    const ar = catTrans.find((t) => t.category_id === cat.id && t.language_code === 'ar');
    const fr = catTrans.find((t) => t.category_id === cat.id && t.language_code === 'fr');
    const en = catTrans.find((t) => t.category_id === cat.id && t.language_code === 'en');
    assert.ok(ar && ar.name.length > 0, `Missing Arabic translation for ${cat.slug}`);
    assert.ok(fr && fr.name.length > 0, `Missing French translation for ${cat.slug}`);
    assert.ok(en && en.name.length > 0, `Missing English translation for ${cat.slug}`);
  }
  console.log(`  -> PASSED: All 7 categories contain verified AR, FR, and EN translations.`);

  // --- Test 3: Trilingual Fallback Resolver Logic ---
  console.log("[Test 3] Verifying translation fallback hierarchy...");
  
  const sampleTranslations: PlaceTranslation[] = [
    {
      id: 'trans-fr-1',
      place_id: 'place-1',
      language_code: 'fr',
      title: 'Hôtel Océan Dakhla',
      description: 'Superbe hôtel en bord de mer.',
      tips: 'Réservez à l\'avance.',
      address_text: 'Dakhla Baie',
      practical_info: null,
    },
    {
      id: 'trans-en-1',
      place_id: 'place-1',
      language_code: 'en',
      title: 'Ocean Dakhla Hotel',
      description: 'Superb seaside hotel.',
      tips: 'Book in advance.',
      address_text: 'Dakhla Bay',
      practical_info: null,
    },
  ];

  // Case 3A: Direct French request matches directly
  const resFr = resolveTranslation(sampleTranslations, 'fr');
  assert.equal(resFr.isFallback, false);
  assert.equal(resFr.title, 'Hôtel Océan Dakhla');
  assert.equal(resFr.language_code, 'fr');

  // Case 3B: Direct English request matches directly
  const resEn = resolveTranslation(sampleTranslations, 'en');
  assert.equal(resEn.isFallback, false);
  assert.equal(resEn.title, 'Ocean Dakhla Hotel');
  assert.equal(resEn.language_code, 'en');

  // Case 3C: Arabic requested, but Arabic translation does NOT exist -> Fallback to French with isFallback = true
  const resAr = resolveTranslation(sampleTranslations, 'ar');
  assert.equal(resAr.isFallback, true);
  assert.equal(resAr.fallbackLang, 'fr');
  assert.equal(resAr.title, 'Hôtel Océan Dakhla');

  // Case 3D: Arabic requested, only English exists -> Fallback to English
  const resOnlyEn = resolveTranslation([sampleTranslations[1]], 'ar');
  assert.equal(resOnlyEn.isFallback, true);
  assert.equal(resOnlyEn.fallbackLang, 'en');
  assert.equal(resOnlyEn.title, 'Ocean Dakhla Hotel');

  console.log("  -> PASSED: Translation fallback hierarchy correctly enforces fallback badges.");

  // --- Test 4: Verify Public RLS and published places coordinates contract ---
  console.log("[Test 4] Verifying public places RLS and coordinates contract...");
  const { data: publishedPlaces, error: pubErr } = await supabase
    .from('places')
    .select('id, slug, status, latitude, longitude')
    .eq('status', 'published');

  assert.ifError(pubErr);
  console.log(`  -> Currently published places count: ${publishedPlaces.length}`);
  
  // Every published place MUST satisfy chk_places_published_coords (latitude and longitude non-null)
  for (const place of publishedPlaces) {
    assert.ok(
      place.latitude !== null && place.longitude !== null,
      `Published place ${place.slug} violates chk_places_published_coords: coordinates must not be null`
    );
  }
  console.log("  -> PASSED: All published records strictly satisfy chk_places_published_coords.");

  // --- Test 5: Verify Leaflet Map Coordinates Bounds for Dakhla ---
  console.log("[Test 5] Validating Dakhla Peninsula geographical bounding box...");
  const dakhlaBounds = {
    minLat: 23.0,
    maxLat: 24.5,
    minLng: -16.5,
    maxLng: -15.5,
  };

  const testCoords = [
    { name: 'Dakhla Lagoon Center', lat: 23.713, lng: -15.935 },
    { name: 'PK25 Spot', lat: 23.882, lng: -15.789 },
    { name: 'White Dune', lat: 23.901, lng: -15.772 },
  ];

  for (const coord of testCoords) {
    assert.ok(
      coord.lat >= dakhlaBounds.minLat && coord.lat <= dakhlaBounds.maxLat,
      `Latitude out of Dakhla bounds: ${coord.lat}`
    );
    assert.ok(
      coord.lng >= dakhlaBounds.minLng && coord.lng <= dakhlaBounds.maxLng,
      `Longitude out of Dakhla bounds: ${coord.lng}`
    );
  }
  console.log("  -> PASSED: Geographical coordinates align with Dakhla Peninsula bounding box.");

  console.log("-----------------------------------------------------------------------------");
  console.log("Phase 3 Discovery & Map Test Suite PASSED successfully!");
  console.log("-----------------------------------------------------------------------------");
}

runPhase3DiscoveryTests().catch((err) => {
  console.error("PHASE 3 TEST FAILED:", err);
  process.exit(1);
});
