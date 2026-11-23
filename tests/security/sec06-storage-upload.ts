// tests/security/sec06-storage-upload.ts
// Compliance: AGENTS.md Rules 1, 3, 4, 7, 9 & plan.md v1.14.0 Section 11.2
// PLANNED TEST HARNESS — Execute against configured Supabase project.

import { createClient, SupabaseClient } from "@supabase/supabase-js";
import sharp from "sharp";
import crypto from "crypto";

const rawUrl            = process.env.TEST_SUPABASE_URL || process.env.VITE_SUPABASE_URL!;
const SUPABASE_URL      = rawUrl ? rawUrl.trim().replace(/\/rest\/v1\/?$/, "").replace(/\/+$/, "") : "";
const SUPABASE_ANON_KEY = (process.env.TEST_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || "").trim();
const TOURIST_EMAIL     = process.env.TEST_TOURIST_EMAIL!;
const TOURIST_PASSWORD  = process.env.TEST_TOURIST_PASSWORD!;
const ADMIN_EMAIL       = process.env.TEST_ADMIN_EMAIL!;
const ADMIN_PASSWORD    = process.env.TEST_ADMIN_PASSWORD!;

const MISSING = [
  ["TEST_SUPABASE_URL (or VITE_SUPABASE_URL)", SUPABASE_URL],
  ["TEST_SUPABASE_ANON_KEY (or VITE_SUPABASE_ANON_KEY)", SUPABASE_ANON_KEY],
  ["TEST_TOURIST_EMAIL", TOURIST_EMAIL],
  ["TEST_TOURIST_PASSWORD", TOURIST_PASSWORD],
  ["TEST_ADMIN_EMAIL", ADMIN_EMAIL],
  ["TEST_ADMIN_PASSWORD", ADMIN_PASSWORD],
].filter(([, v]) => !v).map(([k]) => k);

if (MISSING.length > 0) {
  console.error(`SEC-06: Missing required environment variables: ${MISSING.join(", ")}`);
  console.error("Please configure these variables in your test environment or .env.local.");
  process.exit(1);
}

const BUCKET = "places-media";
const RUN_ID = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;

function makeClient(): SupabaseClient {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } });
}

// -----------------------------------------------------------------------
// Dynamic WebP Fixture Generation with Dual Metadata & Full Pixel Decoding Validation
// -----------------------------------------------------------------------
export async function createValidWebPFixture(): Promise<Buffer> {
  const buffer = await sharp({
    create: {
      width: 1,
      height: 1,
      channels: 4,
      background: { r: 14, g: 165, b: 233, alpha: 0.99 },
    },
  })
    .webp()
    .toBuffer();

  // 1. Inspect original input container metadata and explicitly assert format
  const metadata = await sharp(buffer).metadata();
  if (metadata.format !== "webp") {
    throw new Error(`SEC-06 FIXTURE ERROR: Expected WebP container format, got '${metadata.format}'.`);
  }

  // 2. Full pixel decoding validation: decompress the WebP bitstream into raw uncompressed RGBA pixel bytes
  const { data: rawPixels, info } = await sharp(buffer)
    .raw()
    .toBuffer({ resolveWithObject: true });

  if (info.format !== "raw" || info.width !== 1 || info.height !== 1 || info.channels !== 4) {
    throw new Error(
      `SEC-06 FIXTURE ERROR: Decoded image mismatch. Expected 1x1 4-channel image, got ${info.width}x${info.height} with ${info.channels} channels.`
    );
  }

  // Exactly 1 pixel * 4 channels (RGBA) = 4 bytes of decoded pixel data
  if (rawPixels.length !== 4) {
    throw new Error(
      `SEC-06 FIXTURE ERROR: Raw decoded buffer length expected 4 bytes, received ${rawPixels.length} bytes.`
    );
  }

  return buffer;
}

// -----------------------------------------------------------------------
// Deletion Assertion Helper: Strictly Asserts 404 / Object Not Found
// -----------------------------------------------------------------------
export function assertObjectNotFound(downloadData: any, downloadError: any, context: string): void {
  if (downloadData !== null) {
    throw new Error(
      `${context} FAILED: Object was still downloadable after removal call!`
    );
  }

  if (downloadError === null) {
    throw new Error(`${context} FAILED: Expected download error for removed object but received null.`);
  }

  const status = Number(
    (downloadError as any).statusCode ||
    (downloadError as any).status ||
    0
  );
  const errorCode = String(
    (downloadError as any).error ||
    (downloadError as any).code ||
    ""
  ).toLowerCase().trim();
  const errorMessage = String(downloadError.message || "").toLowerCase().trim();

  // Strictly accept ONLY genuine HTTP 404 or recognized storage object-not-found error signatures:
  // 1. HTTP 404 status code with specific object-not-found message or standard Not Found error
  // 2. Recognized S3/Supabase Storage error code ("nosuchkey", "object_not_found", "not_found")
  // 3. Exact Supabase Storage payload message: "object not found"
  const isGenuine404 =
    status === 404 && (
      errorMessage === "object not found" ||
      errorMessage === "not found" ||
      errorMessage.startsWith("object not found") ||
      errorCode === "nosuchkey" ||
      errorCode === "not_found" ||
      errorCode === "object_not_found"
    );

  const isRecognizedStorageNotFoundCode =
    errorCode === "nosuchkey" ||
    errorCode === "object_not_found" ||
    errorMessage === "object not found";

  if (!isGenuine404 && !isRecognizedStorageNotFoundCode) {
    throw new Error(
      `${context} FAILED: Expected genuine 404 / object-not-found error, but received unrelated error (status: ${status}, code: '${errorCode}', message: '${downloadError.message}').`
    );
  }
}

// -----------------------------------------------------------------------
// Verified Emergency Cleanup Routine
// Removes an object and verifies via download that it is genuinely gone.
// -----------------------------------------------------------------------
async function emergencyCleanup(path: string): Promise<void> {
  const adminClient = makeClient();
  try {
    const { error: loginError } = await adminClient.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    if (loginError) {
      throw new Error(`Emergency cleanup authentication failed: ${loginError.message}`);
    }

    const { error: removeError } = await adminClient.storage.from(BUCKET).remove([path]);
    if (removeError) {
      throw new Error(`Emergency cleanup remove call failed: ${removeError.message}`);
    }

    // Empirically verify the object was removed with strict 404 check
    const { data: downloadData, error: downloadError } = await adminClient.storage
      .from(BUCKET)
      .download(path);

    assertObjectNotFound(downloadData, downloadError, `Emergency cleanup for '${path}'`);
  } finally {
    await adminClient.auth.signOut();
  }
}

// -----------------------------------------------------------------------
// SEC-06-ANON: Anonymous Upload Rejection
// -----------------------------------------------------------------------
export async function sec06Anon(fixture: Buffer): Promise<void> {
  const client = makeClient();
  const uploadPath = `places/sec06-anon-${RUN_ID}.webp`;

  const { data: sessionData } = await client.auth.getSession();
  if (sessionData.session !== null) {
    throw new Error("SEC-06-ANON SETUP: Expected no active session but found one.");
  }

  const { data, error } = await client.storage
    .from(BUCKET)
    .upload(uploadPath, fixture, { contentType: "image/webp" });

  if (data !== null) {
    await emergencyCleanup(uploadPath);
    throw new Error(
      `SEC-06-ANON FAILED: Anonymous upload succeeded at '${data.path}'. Object was verified cleaned up, but Storage RLS failed.`
    );
  }

  if (error === null) {
    throw new Error("SEC-06-ANON FAILED: Expected an error but received null.");
  }

  const isAuthError = /row-level security|violates row-level security policy|unauthorized|access denied/i.test(
    error.message
  );

  if (!isAuthError) {
    throw new Error(
      `SEC-06-ANON FAILED: Expected RLS authorization error, but received unrelated error: ${error.message}`
    );
  }

  console.log(`SEC-06-ANON PASSED: Rejected with authorization error as expected: ${error.message}`);
}

// -----------------------------------------------------------------------
// SEC-06-TOURIST: Authenticated Non-Admin Upload Rejection
// -----------------------------------------------------------------------
export async function sec06Tourist(fixture: Buffer): Promise<void> {
  const client = makeClient();
  const uploadPath = `places/sec06-tourist-${RUN_ID}.webp`;

  try {
    const { error: authError } = await client.auth.signInWithPassword({
      email: TOURIST_EMAIL,
      password: TOURIST_PASSWORD,
    });
    if (authError) throw new Error(`SEC-06-TOURIST: Authentication failed — ${authError.message}`);

    const { data, error } = await client.storage
      .from(BUCKET)
      .upload(uploadPath, fixture, { contentType: "image/webp" });

    if (data !== null) {
      await emergencyCleanup(uploadPath);
      throw new Error(
        `SEC-06-TOURIST FAILED: Non-admin upload succeeded at '${data.path}'. Object was verified cleaned up, but Storage RLS failed.`
      );
    }

    if (error === null) {
      throw new Error("SEC-06-TOURIST FAILED: Expected error but received null.");
    }

    const isAuthError = /row-level security|violates row-level security policy|unauthorized|access denied/i.test(
      error.message
    );

    if (!isAuthError) {
      throw new Error(
        `SEC-06-TOURIST FAILED: Expected RLS authorization error, but received unrelated error: ${error.message}`
      );
    }

    console.log(`SEC-06-TOURIST PASSED: Rejected with authorization error as expected: ${error.message}`);
  } finally {
    await client.auth.signOut();
  }
}

// -----------------------------------------------------------------------
// SEC-06-ADMIN: Authenticated Admin Upload Success & Verifiable Removal
// -----------------------------------------------------------------------
export async function sec06Admin(fixture: Buffer): Promise<void> {
  const client = makeClient();
  const uploadPath = `places/sec06-admin-${RUN_ID}.webp`;
  let uploadedPath: string | null = null;
  let removalVerified = false;

  try {
    const { error: authError } = await client.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
    });
    if (authError) throw new Error(`SEC-06-ADMIN: Authentication failed — ${authError.message}`);

    const { data: uploadData, error: uploadError } = await client.storage
      .from(BUCKET)
      .upload(uploadPath, fixture, { contentType: "image/webp" });

    if (uploadError !== null) {
      throw new Error(`SEC-06-ADMIN FAILED: Admin upload failed — ${uploadError.message}`);
    }
    if (uploadData === null || uploadData.path !== uploadPath) {
      throw new Error(`SEC-06-ADMIN FAILED: Path mismatch — expected '${uploadPath}', got '${uploadData?.path}'.`);
    }

    uploadedPath = uploadData.path;
    console.log(`SEC-06-ADMIN: Upload succeeded at '${uploadedPath}'. Proceeding to verified removal.`);

    // Remove the object
    const { error: removeError } = await client.storage.from(BUCKET).remove([uploadedPath]);
    if (removeError !== null) {
      throw new Error(`SEC-06-ADMIN: Remove call returned error: ${removeError.message}`);
    }

    // Empirically verify the object is actually gone with strict 404 assertion
    const { data: downloadData, error: downloadError } = await client.storage
      .from(BUCKET)
      .download(uploadedPath);

    assertObjectNotFound(downloadData, downloadError, `SEC-06-ADMIN removal of '${uploadedPath}'`);
    removalVerified = true;
    console.log(`SEC-06-ADMIN PASSED: Confirmed object no longer exists (strict 404 verified).`);
  } finally {
    // If removal was not verified, execute verifiable cleanup; never silently suppress or swallow errors
    if (uploadedPath !== null && !removalVerified) {
      try {
        const { error: finalRemoveErr } = await client.storage.from(BUCKET).remove([uploadedPath]);
        if (finalRemoveErr) {
          throw new Error(`SEC-06-ADMIN: Emergency removal in finally block failed: ${finalRemoveErr.message}`);
        }

        // Verify genuine HTTP 404/object-not-found after emergency removal
        const { data: downloadData, error: downloadError } = await client.storage
          .from(BUCKET)
          .download(uploadedPath);

        assertObjectNotFound(downloadData, downloadError, `SEC-06-ADMIN emergency cleanup for '${uploadedPath}'`);
      } finally {
        await client.auth.signOut();
      }
    } else {
      await client.auth.signOut();
    }
  }
}

export async function runSec06(): Promise<void> {
  console.log("-----------------------------------------------------------------------------");
  console.log(`Starting SEC-06 Storage Upload Security Suite (Run ID: ${RUN_ID})...`);
  console.log("-----------------------------------------------------------------------------");

  const fixture = await createValidWebPFixture();
  console.log("WebP fixture generated and verified via dual metadata & raw pixel decoding (1x1 RGBA).");

  await sec06Anon(fixture);
  await sec06Tourist(fixture);
  await sec06Admin(fixture);

  console.log("-----------------------------------------------------------------------------");
  console.log("SEC-06 Storage Upload Security Suite completed successfully!");
  console.log("-----------------------------------------------------------------------------");
}

runSec06().catch((err) => {
  console.error("SEC-06 SUITE ABORTED:", err);
  process.exit(1);
});
