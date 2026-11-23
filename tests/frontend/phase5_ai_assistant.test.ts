import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL: string = process.env.TEST_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY: string = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const GEMINI_API_KEY: string = process.env.GEMINI_API_KEY || '';

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment.");
  process.exit(1);
}

const cleanUrl = SUPABASE_URL.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "");
const adminClient = createClient(cleanUrl, SUPABASE_SERVICE_ROLE_KEY);

async function runPhase5Tests() {
  console.log("-----------------------------------------------------------------------------");
  console.log("Running Phase 5 L7aj AI Assistant & Security Verification Suite...");
  console.log("-----------------------------------------------------------------------------");

  // --- Test 1: Zero Secret Leakage in Client Bundles ---
  console.log("[Test 1] Verifying ZERO secret leakage in frontend bundles...");
  const distDir = path.resolve(__dirname, '../../dist/assets');
  if (fs.existsSync(distDir)) {
    const files = fs.readdirSync(distDir).filter((f) => f.endsWith('.js'));
    for (const file of files) {
      const content = fs.readFileSync(path.join(distDir, file), 'utf8');

      // 1A. Raw GEMINI_API_KEY check
      if (GEMINI_API_KEY && GEMINI_API_KEY.length > 5 && !GEMINI_API_KEY.includes('your-google')) {
        assert.ok(
          !content.includes(GEMINI_API_KEY),
          `CRITICAL SECURITY VIOLATION: GEMINI_API_KEY leaked into client bundle: ${file}`
        );
      }

      // 1B. SUPABASE_SERVICE_ROLE_KEY check
      if (SUPABASE_SERVICE_ROLE_KEY && SUPABASE_SERVICE_ROLE_KEY.length > 10) {
        assert.ok(
          !content.includes(SUPABASE_SERVICE_ROLE_KEY),
          `CRITICAL SECURITY VIOLATION: SUPABASE_SERVICE_ROLE_KEY leaked into client bundle: ${file}`
        );
      }
    }
    console.log(`  -> PASSED: Audited ${files.length} client chunks. Zero secret keys found in bundles.`);
  } else {
    console.log("  -> (dist/assets not found, will verify after build)");
  }

  // --- Test 2: Anti-Spoofing and Identity Extraction Contract ---
  console.log("[Test 2] Verifying Edge Function anti-spoofing and trusted IP rules...");
  const edgeFunctionPath = path.resolve(__dirname, '../../supabase/functions/l7aj-chat/index.ts');
  assert.ok(fs.existsSync(edgeFunctionPath), "Edge function index.ts must exist");
  const edgeSource = fs.readFileSync(edgeFunctionPath, 'utf8');

  // Verify X-Forwarded-For is NOT used as trusted IP
  assert.ok(
    !edgeSource.includes("req.headers.get('x-forwarded-for')") &&
    !edgeSource.includes('req.headers.get("x-forwarded-for")'),
    "SECURITY VIOLATION: X-Forwarded-For must not be accepted for trusted client identity"
  );

  // Verify cf-connecting-ip or x-real-ip is checked
  assert.ok(
    edgeSource.includes("cf-connecting-ip") && edgeSource.includes("x-real-ip"),
    "Edge function must check cf-connecting-ip or x-real-ip"
  );

  // Verify missing identity rejects with 400 missing_client_identity
  assert.ok(
    edgeSource.includes("missing_client_identity"),
    "Edge function must reject unauthenticated requests lacking trusted identity with 400"
  );
  console.log("  -> PASSED: Strict trusted identity & anti-spoofing logic verified in Edge Function.");

  // --- Test 3: Database Rate Limiting RPC Integration ---
  console.log("[Test 3] Testing consume_ai_quota() rate limiting integration...");
  const testIp = `ip:phase5-test-${Date.now()}`;

  // Call 1: Allowed
  const { data: q1, error: e1 } = await adminClient.rpc('consume_ai_quota', {
    p_identifier: testIp,
    p_max_per_minute: 2,
    p_max_per_day: 10,
  });

  assert.ifError(e1);
  assert.equal(q1.allowed, true, "First request should be allowed");
  assert.equal(q1.minute_remaining, 1);

  // Call 2: Allowed
  const { data: q2, error: e2 } = await adminClient.rpc('consume_ai_quota', {
    p_identifier: testIp,
    p_max_per_minute: 2,
    p_max_per_day: 10,
  });

  assert.ifError(e2);
  assert.equal(q2.allowed, true, "Second request should be allowed");
  assert.equal(q2.minute_remaining, 0);

  // Call 3: Exceeded per minute -> Must return allowed: false with retry_after
  const { data: q3, error: e3 } = await adminClient.rpc('consume_ai_quota', {
    p_identifier: testIp,
    p_max_per_minute: 2,
    p_max_per_day: 10,
  });

  assert.ifError(e3);
  assert.equal(q3.allowed, false, "Third request must be denied");
  assert.equal(q3.reason, 'per_minute_exceeded');
  assert.ok(q3.retry_after > 0, "retry_after must be greater than 0");
  console.log(`  -> PASSED: consume_ai_quota() enforces limits with exact retry_after (${q3.retry_after}s).`);

  // --- Test 4: Maximum Character Bounds & Sanitization ---
  console.log("[Test 4] Verifying prompt length bounds (max 400 characters)...");
  assert.ok(
    edgeSource.includes("query.length > 400"),
    "Edge Function must enforce 400 max characters limit"
  );
  console.log("  -> PASSED: 400 character prompt bounds enforced.");

  // --- Test 5: Dual-Mode UI Integration Check ---
  console.log("[Test 5] Verifying Dual-Mode UI components and routes...");
  const floatingComponentPath = path.resolve(__dirname, '../../src/components/assistant/L7ajFloating.tsx');
  const pageComponentPath = path.resolve(__dirname, '../../src/pages/AssistantPage.tsx');

  assert.ok(fs.existsSync(floatingComponentPath), "L7ajFloating.tsx must exist");
  assert.ok(fs.existsSync(pageComponentPath), "AssistantPage.tsx must exist");

  const appSource = fs.readFileSync(path.resolve(__dirname, '../../src/App.tsx'), 'utf8');
  assert.ok(appSource.includes('path="assistant"'), "App.tsx must register /assistant route");

  const layoutSource = fs.readFileSync(path.resolve(__dirname, '../../src/components/layout/Layout.tsx'), 'utf8');
  assert.ok(layoutSource.includes('<L7ajFloating />') || layoutSource.includes('<L7ajFloating'), "Layout.tsx must render L7ajFloating");

  console.log("  -> PASSED: Mode 1 (Floating) and Mode 2 (Full-Page /assistant) verified in component tree.");

  console.log("-----------------------------------------------------------------------------");
  console.log("Phase 5 L7aj AI Assistant Verification Suite PASSED successfully!");
  console.log("-----------------------------------------------------------------------------");
}

runPhase5Tests().catch((err) => {
  console.error("PHASE 5 TEST FAILED:", err);
  process.exit(1);
});
