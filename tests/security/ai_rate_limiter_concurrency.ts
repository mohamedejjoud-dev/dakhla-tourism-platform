// tests/security/ai_rate_limiter_concurrency.ts
// Compliance: AGENTS.md Rules 1, 3, 4, 7, 9 & plan.md v1.14.0 Section 11.3
// PLANNED TEST HARNESS — 10-call concurrent quota stress test against consume_ai_quota().

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import crypto from "crypto";

const rawUrl = process.env.TEST_SUPABASE_URL || process.env.VITE_SUPABASE_URL!;
const SUPABASE_URL = rawUrl ? rawUrl.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "") : "";
const SUPABASE_SERVICE_ROLE_KEY = (process.env.TEST_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim();

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("AI Concurrency Test: Missing TEST_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  console.error("This test invokes consume_ai_quota() via PostgREST RPC using service_role privileges.");
  process.exit(1);
}

const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

interface QuotaResult {
  allowed: boolean;
  minute_remaining: number;
  day_remaining: number;
  retry_after: number;
  reason: string;
}

export async function runAiRateLimiterConcurrencyTest(): Promise<void> {
  // Use unique IP identifier per run to prevent interference from prior test runs
  const randomSuffix = crypto.randomBytes(4).toString("hex");
  const testIp = `ip:test-${Date.now()}-${randomSuffix}`;
  const maxPerMinute = 6;
  const maxPerDay = 30;
  const concurrentCalls = 10;

  console.log("-----------------------------------------------------------------------------");
  console.log(`Starting AI Rate Limiter Concurrency Test on ${testIp}...`);
  console.log(`Parameters: maxPerMinute=${maxPerMinute}, maxPerDay=${maxPerDay}, concurrentCalls=${concurrentCalls}`);
  console.log("-----------------------------------------------------------------------------");

  // Fire 10 simultaneous RPC requests
  const promises: Promise<{ index: number; data: QuotaResult | null; error: any }>[] = [];

  for (let i = 0; i < concurrentCalls; i++) {
    promises.push(
      (async () => {
        const { data, error } = await supabase.rpc("consume_ai_quota", {
          p_identifier: testIp,
          p_max_per_minute: maxPerMinute,
          p_max_per_day: maxPerDay,
        });
        return { index: i, data: data as QuotaResult, error };
      })()
    );
  }

  const results = await Promise.all(promises);

  // Check for database errors
  const errors = results.filter((r) => r.error !== null);
  if (errors.length > 0) {
    console.error("Database errors encountered during concurrent execution:", errors);
    throw new Error(`AI Concurrency Test FAILED: ${errors.length} database calls failed with errors.`);
  }

  const allowedResults = results.filter((r) => r.data?.allowed === true);
  const deniedResults = results.filter((r) => r.data?.allowed === false);

  console.log(`Results: ${allowedResults.length} allowed, ${deniedResults.length} denied.`);

  // Assertions:
  // 1. Exactly maxPerMinute (6) must be allowed
  if (allowedResults.length !== maxPerMinute) {
    throw new Error(
      `AI Concurrency Test FAILED: Expected exactly ${maxPerMinute} allowed calls, but received ${allowedResults.length}. Race condition detected!`
    );
  }

  // 2. Exactly (concurrentCalls - maxPerMinute) (4) must be denied
  const expectedDenied = concurrentCalls - maxPerMinute;
  if (deniedResults.length !== expectedDenied) {
    throw new Error(
      `AI Concurrency Test FAILED: Expected exactly ${expectedDenied} denied calls, but received ${deniedResults.length}.`
    );
  }

  // 3. All denied calls must have reason 'per_minute_exceeded' and retry_after > 0
  for (const denied of deniedResults) {
    if (denied.data?.reason !== "per_minute_exceeded") {
      throw new Error(
        `AI Concurrency Test FAILED: Expected reason 'per_minute_exceeded', got '${denied.data?.reason}'.`
      );
    }
    if (!denied.data?.retry_after || denied.data.retry_after <= 0) {
      throw new Error(
        `AI Concurrency Test FAILED: Expected positive retry_after seconds, got ${denied.data?.retry_after}.`
      );
    }
  }

  console.log("-----------------------------------------------------------------------------");
  console.log("AI Rate Limiter Concurrency Test PASSED: Zero race conditions; exact quota enforcement verified.");
  console.log("-----------------------------------------------------------------------------");
}

runAiRateLimiterConcurrencyTest().catch((err) => {
  console.error("AI CONCURRENCY TEST ABORTED:", err);
  process.exit(1);
});
