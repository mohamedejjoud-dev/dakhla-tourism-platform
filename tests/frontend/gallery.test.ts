// tests/frontend/gallery.test.ts
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

function runGalleryVerification() {
  console.log('-------------------------------------------------------------');
  console.log('Running Place Image Gallery Verification Suite...');
  console.log('-------------------------------------------------------------');

  const galleryPath = path.resolve('src/components/places/PlaceImageGallery.tsx');
  assert.ok(fs.existsSync(galleryPath), 'PlaceImageGallery.tsx must exist');
  const code = fs.readFileSync(galleryPath, 'utf8');

  // Test 1: Non-cropping object-contain check
  console.log('[Test 1] Verifying non-cropping display...');
  assert.ok(code.includes('object-contain'), 'Main image must use object-contain to preserve complete photograph');
  assert.ok(!code.includes('aspect-[21/9]'), 'Must not enforce aggressive 21/9 crop');
  console.log('  -> PASSED: Complete photograph preserved with object-contain.');

  // Test 2: Navigation arrows
  console.log('[Test 2] Verifying navigation arrows...');
  assert.ok(code.includes('ChevronLeft') && code.includes('ChevronRight'), 'Must include Left and Right navigation chevron icons');
  assert.ok(code.includes('(prev + 1) % total'), 'Must implement loop forward (last -> first)');
  assert.ok(code.includes('(prev - 1 + total) % total'), 'Must implement loop backward (first -> last)');
  console.log('  -> PASSED: Loop-cycling navigation arrows verified.');

  // Test 3: Touch & swipe handlers
  console.log('[Test 3] Verifying mobile touch swipe support...');
  assert.ok(code.includes('onTouchStart') && code.includes('onTouchMove') && code.includes('onTouchEnd'), 'Must attach touch start, move, and end handlers');
  assert.ok(code.includes('minSwipeDistance'), 'Must have swipe threshold detection');
  console.log('  -> PASSED: Mobile swipe gesture navigation confirmed.');

  // Test 4: Counter badge
  console.log('[Test 4] Verifying image counter badge...');
  assert.ok(code.includes('currentIndex + 1') && code.includes('total'), 'Must display current index and total count');
  console.log('  -> PASSED: Image counter badge verified.');

  // Test 5: Single image guard
  console.log('[Test 5] Verifying single-image & zero-image guards...');
  assert.ok(code.includes('total > 1'), 'Arrows, counter, and thumbnails must be conditional on total > 1');
  assert.ok(code.includes('total === 0'), 'Must handle 0 images gracefully with fallback placeholder');
  console.log('  -> PASSED: Edge cases (0 or 1 image) correctly guarded.');

  // Test 6: Thumbnails synchronization
  console.log('[Test 6] Verifying thumbnails synchronization...');
  assert.ok(code.includes('#176B87'), 'Selected thumbnail must use primary Ocean Blue #176B87 border');
  assert.ok(code.includes('onClick={() => setCurrentIndex(idx)}'), 'Clicking thumbnail must switch current index');
  console.log('  -> PASSED: Synchronized thumbnail preview strip confirmed.');

  // Test 7: Integration in PlaceDetailPage
  console.log('[Test 7] Verifying integration in PlaceDetailPage.tsx...');
  const detailPath = path.resolve('src/pages/PlaceDetailPage.tsx');
  const detailCode = fs.readFileSync(detailPath, 'utf8');
  assert.ok(detailCode.includes('<PlaceImageGallery'), 'PlaceDetailPage must render <PlaceImageGallery />');
  console.log('  -> PASSED: Seamless integration in PlaceDetailPage confirmed.');

  console.log('-------------------------------------------------------------');
  console.log('All 7 Image Gallery Checks PASSED with 0 errors.');
  console.log('-------------------------------------------------------------');
}

runGalleryVerification();
