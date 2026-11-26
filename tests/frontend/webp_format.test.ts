import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { toWebpUrl } from '../../src/lib/imageUtils';

describe('WebP Image Format Verification Suite', () => {
  it('1. Verifies toWebpUrl helper enforces WebP for Unsplash and local assets', () => {
    const rawUnsplash = 'https://images.unsplash.com/photo-1502680390469-be75c86b636f?auto=format&fit=crop&w=800&q=80';
    const webpUnsplash = toWebpUrl(rawUnsplash);
    assert.ok(webpUnsplash.includes('fm=webp'), 'Unsplash URL must include fm=webp');

    const rawJpg = '/images/elhaj-avatar.jpg';
    const webpJpg = toWebpUrl(rawJpg);
    assert.strictEqual(webpJpg, '/images/elhaj-avatar.webp', 'Legacy jpg avatar must rewrite to .webp');
  });

  it('2. Verifies local public images exist in WebP format', () => {
    const publicWebpFiles = [
      'public/images/elhaj-avatar.webp',
      'public/images/elhaj.webp',
      'public/logo.webp',
      'public/hotels/dakhla-club/cover.webp',
      'public/hotels/bavaro-beach/cover.webp',
      'public/hotels/la-tour-deole/cover.webp',
      'public/hotels/tulum-beach/cover.webp',
      'public/hotels/west-point/cover.webp',
      'public/images/places/mama-saida/mama-saida-1.webp'
    ];

    for (const relPath of publicWebpFiles) {
      const fullPath = path.resolve(relPath);
      assert.ok(fs.existsSync(fullPath), `Expected WebP image file does not exist: ${relPath}`);
      const stats = fs.statSync(fullPath);
      assert.ok(stats.size > 0, `WebP image file is empty: ${relPath}`);
    }
  });

  it('3. Verifies zero photograph references to .jpg in src components', () => {
    const componentsToCheck = [
      'src/components/assistant/L7ajFloating.tsx',
      'src/pages/AssistantPage.tsx',
      'src/pages/HomePage.tsx',
      'src/components/planner/ItineraryGenerationState.tsx'
    ];

    for (const file of componentsToCheck) {
      const content = fs.readFileSync(path.resolve(file), 'utf8');
      assert.ok(
        !content.includes('elhaj-avatar.jpg'),
        `${file} still references elhaj-avatar.jpg instead of .webp`
      );
    }
  });

  it('4. Verifies all Unsplash image URLs in PlaceCard.tsx specify fm=webp', () => {
    const placeCardContent = fs.readFileSync(path.resolve('src/components/places/PlaceCard.tsx'), 'utf8');
    const unsplashMatches = placeCardContent.match(/https:\/\/images\.unsplash\.com\/[^\s"']+/g) || [];
    assert.ok(unsplashMatches.length > 0, 'PlaceCard must contain Unsplash images');
    for (const url of unsplashMatches) {
      assert.ok(url.includes('fm=webp'), `Unsplash URL in PlaceCard missing fm=webp: ${url}`);
    }
  });

  it('5. Verifies all Unsplash image URLs in HomePage.tsx specify fm=webp', () => {
    const homeContent = fs.readFileSync(path.resolve('src/pages/HomePage.tsx'), 'utf8');
    const unsplashMatches = homeContent.match(/https:\/\/images\.unsplash\.com\/[^\s"']+/g) || [];
    for (const url of unsplashMatches) {
      assert.ok(url.includes('fm=webp'), `Unsplash URL in HomePage missing fm=webp: ${url}`);
    }
  });

  it('6. Verifies all Unsplash image URLs in curatedPlaces.ts specify fm=webp', () => {
    const curatedContent = fs.readFileSync(path.resolve('src/services/curatedPlaces.ts'), 'utf8');
    const unsplashMatches = curatedContent.match(/https:\/\/images\.unsplash\.com\/[^\s"']+/g) || [];
    assert.ok(unsplashMatches.length > 0, 'curatedPlaces must contain Unsplash images');
    for (const url of unsplashMatches) {
      assert.ok(url.includes('fm=webp'), `Unsplash URL in curatedPlaces missing fm=webp: ${url}`);
    }
  });
});
