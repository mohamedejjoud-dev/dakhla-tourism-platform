import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SUPPORTED_LANGUAGES, applyLanguageDirection } from '../../src/lib/i18n';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getAllKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  let keys: string[] = [];
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      keys = keys.concat(getAllKeys(value as Record<string, unknown>, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys.sort();
}

function runI18nTests() {
  console.log('-----------------------------------------------------------------------------');
  console.log('Running Dakhlin Trilingual Engine Verification Suite...');
  console.log('-----------------------------------------------------------------------------');

  // Test 1: Supported languages strictly ar, fr, en
  console.log('[Test 1] Verifying supported languages...');
  assert.deepEqual([...SUPPORTED_LANGUAGES].sort(), ['ar', 'en', 'fr']);
  console.log('  -> PASSED: Strictly ar, fr, en supported.');

  // Test 2: Direction resolution
  console.log('[Test 2] Verifying direction controller mapping...');
  assert.equal(applyLanguageDirection('ar'), 'rtl');
  assert.equal(applyLanguageDirection('fr'), 'ltr');
  assert.equal(applyLanguageDirection('en'), 'ltr');
  console.log('  -> PASSED: RTL for Arabic, LTR for French & English.');

  // Test 3: Load locale files and verify structure
  console.log('[Test 3] Loading locale JSON files...');
  const localesDir = path.resolve(__dirname, '../../src/locales');
  const arRaw = JSON.parse(fs.readFileSync(path.join(localesDir, 'ar.json'), 'utf8'));
  const frRaw = JSON.parse(fs.readFileSync(path.join(localesDir, 'fr.json'), 'utf8'));
  const enRaw = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf8'));

  const arKeys = getAllKeys(arRaw);
  const frKeys = getAllKeys(frRaw);
  const enKeys = getAllKeys(enRaw);

  console.log(`  -> AR keys count: ${arKeys.length}`);
  console.log(`  -> FR keys count: ${frKeys.length}`);
  console.log(`  -> EN keys count: ${enKeys.length}`);

  // Test 4: Key parity between all 3 locales
  console.log('[Test 4] Verifying 100% key parity across all 3 languages...');
  const missingInFr = arKeys.filter((k) => !frKeys.includes(k));
  const missingInEn = arKeys.filter((k) => !enKeys.includes(k));
  const extraInFr = frKeys.filter((k) => !arKeys.includes(k));
  const extraInEn = enKeys.filter((k) => !arKeys.includes(k));

  assert.equal(missingInFr.length, 0, `Missing keys in fr.json: ${missingInFr.join(', ')}`);
  assert.equal(missingInEn.length, 0, `Missing keys in en.json: ${missingInEn.join(', ')}`);
  assert.equal(extraInFr.length, 0, `Unexpected extra keys in fr.json: ${extraInFr.join(', ')}`);
  assert.equal(extraInEn.length, 0, `Unexpected extra keys in en.json: ${extraInEn.join(', ')}`);
  console.log('  -> PASSED: Complete key parity verified across AR, FR, EN.');

  // Test 5: Verify no empty strings in any translations
  console.log('[Test 5] Checking for empty translation values...');
  function checkNoEmptyValues(obj: Record<string, unknown>, localeName: string, prefix = '') {
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'string') {
        assert.ok(value.trim().length > 0, `Empty string found at ${localeName}:${fullKey}`);
      } else if (value && typeof value === 'object') {
        checkNoEmptyValues(value as Record<string, unknown>, localeName, fullKey);
      }
    }
  }

  checkNoEmptyValues(arRaw, 'ar');
  checkNoEmptyValues(frRaw, 'fr');
  checkNoEmptyValues(enRaw, 'en');
  console.log('  -> PASSED: Zero empty values detected.');

  console.log('-----------------------------------------------------------------------------');
  console.log('All Trilingual Engine Tests PASSED successfully.');
  console.log('-----------------------------------------------------------------------------');
}

runI18nTests();
