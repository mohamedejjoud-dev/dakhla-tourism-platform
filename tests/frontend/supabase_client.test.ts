import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.TEST_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.TEST_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment.");
  process.exit(1);
}

const cleanUrl = SUPABASE_URL.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
const supabase = createClient(cleanUrl, SUPABASE_ANON_KEY);

async function runDatabaseIntegrationTest() {
  console.log("-----------------------------------------------------------------------------");
  console.log("Verifying Frontend Supabase Integration (Anon Key)...");
  console.log("-----------------------------------------------------------------------------");

  // 1. Categories Query
  console.log("[Check 1] Querying active categories...");
  const { data: categories, error: catErr } = await supabase
    .from('categories')
    .select('id, slug, icon, display_order, is_active')
    .order('display_order', { ascending: true });

  assert.ifError(catErr);
  assert.ok(Array.isArray(categories), "Categories should be an array");
  console.log(`  -> Retrieved ${categories.length} active categories.`);
  assert.equal(categories.length, 7, "Expected exactly 7 seeded categories");

  // 2. Category Translations Query
  console.log("[Check 2] Querying category translations...");
  const { data: catTrans, error: transErr } = await supabase
    .from('category_translations')
    .select('id, category_id, language_code, name, description');

  assert.ifError(transErr);
  assert.ok(Array.isArray(catTrans), "Category translations should be an array");
  console.log(`  -> Retrieved ${catTrans.length} category translations.`);
  assert.equal(catTrans.length, 21, "Expected 21 category translations (7 x 3 languages)");

  // 3. Published Places Query (Public view)
  console.log("[Check 3] Querying published places (Public RLS)...");
  const { data: places, error: placeErr } = await supabase
    .from('places')
    .select('id, slug, status, latitude, longitude');

  assert.ifError(placeErr);
  assert.ok(Array.isArray(places), "Places should be an array");
  console.log(`  -> Retrieved ${places.length} published places via public anon key.`);

  console.log("-----------------------------------------------------------------------------");
  console.log("Frontend Supabase Integration Verified Successfully!");
  console.log("-----------------------------------------------------------------------------");
}

runDatabaseIntegrationTest().catch((err) => {
  console.error("DATABASE INTEGRATION TEST FAILED:", err);
  process.exit(1);
});
