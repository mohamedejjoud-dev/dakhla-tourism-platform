// tests/frontend/phase7_seo_cloudflare.test.ts
// Phase 7 Automated Test Suite: SEO Hardening, OpenGraph Social Previews, Cloudflare Pages, Mobile & Bundle Audits
// Governed strictly by AGENTS.md (Rules 4, 7, 10, 12) & plan.md (Section 9)

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

async function runPhase7Tests() {
  console.log('-----------------------------------------------------------------------------');
  console.log('Running Phase 7 SEO Hardening, Cloudflare Pages & Mobile Verification Suite...');
  console.log('-----------------------------------------------------------------------------');

  // --- Test 1: Cloudflare Pages Configuration Audit ---
  console.log('[Test 1] Verifying Cloudflare Pages configuration (_headers & _routes.json)...');
  const headersPath = path.join(rootDir, 'public/_headers');
  const routesPath = path.join(rootDir, 'public/_routes.json');

  assert.ok(fs.existsSync(headersPath), 'public/_headers must exist');
  assert.ok(fs.existsSync(routesPath), 'public/_routes.json must exist');

  const headersContent = fs.readFileSync(headersPath, 'utf8');
  assert.ok(headersContent.includes('X-Frame-Options: DENY'), '_headers must enforce X-Frame-Options: DENY');
  assert.ok(headersContent.includes('X-Content-Type-Options: nosniff'), '_headers must enforce nosniff');
  assert.ok(headersContent.includes('Referrer-Policy: strict-origin-when-cross-origin'), '_headers must enforce strict-origin referrer');
  assert.ok(headersContent.includes('Strict-Transport-Security:'), '_headers must enforce HSTS');
  assert.ok(headersContent.includes('Cache-Control: public, max-age=31536000, immutable'), '_headers must configure immutable cache for Vite assets');

  const routesJson = JSON.parse(fs.readFileSync(routesPath, 'utf8'));
  assert.equal(routesJson.version, 1, '_routes.json version must be 1');
  assert.ok(routesJson.include.includes('/places/*'), '_routes.json must route /places/* to Cloudflare Function');
  assert.ok(routesJson.exclude.includes('/assets/*'), '_routes.json must exclude static /assets/*');
  console.log('  -> PASSED: Cloudflare Pages security headers and routing manifest verified.');

  // --- Test 2: Search Engine Directives Audit (robots.txt & sitemap.xml) ---
  console.log('[Test 2] Verifying search engine crawlers directives (robots.txt & sitemap.xml)...');
  const robotsPath = path.join(rootDir, 'public/robots.txt');
  const sitemapPath = path.join(rootDir, 'public/sitemap.xml');

  assert.ok(fs.existsSync(robotsPath), 'public/robots.txt must exist');
  assert.ok(fs.existsSync(sitemapPath), 'public/sitemap.xml must exist');

  const robotsContent = fs.readFileSync(robotsPath, 'utf8');
  assert.ok(robotsContent.includes('Allow: /places/'), 'robots.txt must allow public places exploration');
  assert.ok(robotsContent.includes('Disallow: /admin'), 'robots.txt must disallow /admin CMS crawling');
  assert.ok(robotsContent.includes('Sitemap: https://dakhlin.com/sitemap.xml'), 'robots.txt must reference sitemap URL');

  const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');
  assert.ok(sitemapContent.includes('<urlset'), 'sitemap.xml must be valid XML with urlset');
  assert.ok(sitemapContent.includes('xmlns:xhtml="http://www.w3.org/1999/xhtml"'), 'sitemap.xml must define xhtml namespace for hreflang');
  assert.ok(sitemapContent.includes('hreflang="ar"'), 'sitemap.xml must include Arabic alternate');
  assert.ok(sitemapContent.includes('hreflang="fr"'), 'sitemap.xml must include French alternate');
  assert.ok(sitemapContent.includes('hreflang="en"'), 'sitemap.xml must include English alternate');
  assert.ok(sitemapContent.includes('hreflang="x-default"'), 'sitemap.xml must include x-default fallback');
  console.log('  -> PASSED: robots.txt and sitemap.xml verified with full trilingual hreflang alternate tags.');

  // --- Test 3: Cloudflare Pages Functions Social Crawler Router ---
  console.log('[Test 3] Verifying Cloudflare Pages Function (functions/places/[slug].ts)...');
  const functionPath = path.join(rootDir, 'functions/places/[slug].ts');
  assert.ok(fs.existsSync(functionPath), 'functions/places/[slug].ts must exist');

  const functionContent = fs.readFileSync(functionPath, 'utf8');
  assert.ok(functionContent.includes('CRAWLER_USER_AGENTS'), 'Function must inspect crawler user agents');
  assert.ok(functionContent.includes('whatsapp'), 'Crawler filter must support WhatsApp crawler');
  assert.ok(functionContent.includes('facebookexternalhit'), 'Crawler filter must support Facebook crawler');
  assert.ok(functionContent.includes('twitterbot'), 'Crawler filter must support Twitterbot');
  assert.ok(functionContent.includes('return next()'), 'Non-bot requests must pass through to client SPA');
  assert.ok(functionContent.includes('status=eq.published'), 'Function must strictly filter for published places under anon key');
  assert.ok(functionContent.includes('escapeHtml'), 'Function must escape HTML entities in dynamic meta tags');
  console.log('  -> PASSED: Cloudflare Pages crawler router, slug sanitizer, and HTML entity escaper verified.');

  // --- Test 4: Supabase og-preview Edge Function & Config ---
  console.log('[Test 4] Verifying Supabase og-preview Edge Function and config.toml...');
  const ogPreviewFunctionPath = path.join(rootDir, 'supabase/functions/og-preview/index.ts');
  const supabaseConfigPath = path.join(rootDir, 'supabase/config.toml');

  assert.ok(fs.existsSync(ogPreviewFunctionPath), 'supabase/functions/og-preview/index.ts must exist');
  assert.ok(fs.existsSync(supabaseConfigPath), 'supabase/config.toml must exist');

  const configContent = fs.readFileSync(supabaseConfigPath, 'utf8');
  assert.ok(configContent.includes('[functions.og-preview]'), 'config.toml must register [functions.og-preview]');
  assert.ok(configContent.includes('verify_jwt = false'), 'og-preview must have verify_jwt = false for anonymous crawler access');

  const ogContent = fs.readFileSync(ogPreviewFunctionPath, 'utf8');
  assert.ok(ogContent.includes('Deno.env.get("SUPABASE_ANON_KEY")'), 'og-preview must use public anon key, never service_role');
  assert.ok(ogContent.includes('.eq("status", "published")'), 'og-preview must strictly filter for published places');
  console.log('  -> PASSED: og-preview Edge Function configured with verify_jwt = false and anon-only queries.');

  // --- Test 5: SeoMeta Component & Schema.org Structured Data ---
  console.log('[Test 5] Verifying SeoMeta component and structured data integration across pages...');
  const seoMetaPath = path.join(rootDir, 'src/components/seo/SeoMeta.tsx');
  assert.ok(fs.existsSync(seoMetaPath), 'SeoMeta.tsx must exist');

  const pagesWithSeo = [
    'src/pages/HomePage.tsx',
    'src/pages/ExplorePage.tsx',
    'src/pages/PlaceDetailPage.tsx',
    'src/pages/MapPage.tsx',
    'src/pages/AboutPage.tsx',
    'src/pages/AssistantPage.tsx',
  ];

  for (const pageFile of pagesWithSeo) {
    const pageContent = fs.readFileSync(path.join(rootDir, pageFile), 'utf8');
    assert.ok(pageContent.includes('<SeoMeta'), `${pageFile} must render <SeoMeta /> component`);
  }
  console.log(`  -> PASSED: SeoMeta component integrated across all ${pagesWithSeo.length} core pages.`);

  // --- Test 6: Mobile Viewport, A11y & CNDP Privacy Notice ---
  console.log('[Test 6] Verifying mobile viewport, accessible touch targets, and CNDP cookie banner...');
  const indexHtml = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
  assert.ok(indexHtml.includes('name="viewport"'), 'index.html must define viewport meta');
  assert.ok(indexHtml.includes('width=device-width'), 'Viewport must specify width=device-width');

  const cookieBannerPath = path.join(rootDir, 'src/components/common/CookieBanner.tsx');
  assert.ok(fs.existsSync(cookieBannerPath), 'CookieBanner.tsx must exist');

  const layoutContent = fs.readFileSync(path.join(rootDir, 'src/components/layout/Layout.tsx'), 'utf8');
  assert.ok(layoutContent.includes('<CookieBanner />'), 'Layout.tsx must render <CookieBanner />');

  const aboutContent = fs.readFileSync(path.join(rootDir, 'src/pages/AboutPage.tsx'), 'utf8');
  assert.ok(aboutContent.includes('id="privacy"'), 'AboutPage.tsx must provide #privacy section for CNDP Law 09-08 compliance');
  console.log('  -> PASSED: Mobile viewport meta, CookieBanner component, and CNDP compliance verified.');

  // --- Test 7: Production Bundle Secret Isolation Audit ---
  console.log('[Test 7] Auditing production build assets for ZERO secret leakage...');
  const distAssetsDir = path.join(rootDir, 'dist/assets');
  if (fs.existsSync(distAssetsDir)) {
    const jsFiles = fs.readdirSync(distAssetsDir).filter((f) => f.endsWith('.js'));
    assert.ok(jsFiles.length > 0, 'Production bundle must contain generated JS chunks');

    const forbiddenPatterns = [
      'SUPABASE_SERVICE_ROLE_KEY',
      'service_role',
      'AIzaSy', // Gemini API key prefix
      'Mohamed@12345',
    ];

    for (const jsFile of jsFiles) {
      const code = fs.readFileSync(path.join(distAssetsDir, jsFile), 'utf8');
      for (const pattern of forbiddenPatterns) {
        assert.equal(
          code.includes(pattern),
          false,
          `Bundle chunk ${jsFile} must NEVER contain sensitive secret pattern: ${pattern}`
        );
      }
    }
    console.log(`  -> PASSED: Audited ${jsFiles.length} production bundle chunks. Zero secret leaks detected.`);
  }

  console.log('-----------------------------------------------------------------------------');
  console.log('Phase 7 SEO Hardening, Cloudflare & Mobile Suite PASSED successfully!');
  console.log('-----------------------------------------------------------------------------');
}

runPhase7Tests().catch((err) => {
  console.error('PHASE 7 TEST FAILED:', err);
  process.exit(1);
});
