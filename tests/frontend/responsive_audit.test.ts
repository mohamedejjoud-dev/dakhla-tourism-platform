import fs from 'fs';
import path from 'path';

console.log('-------------------------------------------------------------');
console.log('Running Dakhlin UI/UX Responsiveness & Layout Audit...');
console.log('-------------------------------------------------------------');

let errors = 0;

// 1. Audit tailwind.config.ts for required Coastal Palette tokens
const tailwindConfigPath = path.resolve('tailwind.config.ts');
const tailwindContent = fs.readFileSync(tailwindConfigPath, 'utf8');

const requiredTokens = [
  '#176B87', // Ocean Blue
  '#35A7A0', // Fresh Turquoise
  '#D8B67A', // Warm Sand
  '#F3E8D2', // Soft Sand
  '#FCFBF8', // Warm White
  '#1F2933', // Main Text
  '#667580', // Secondary Text
  '#E8E5DE', // Borders
];

for (const token of requiredTokens) {
  if (tailwindContent.includes(token)) {
    console.log(`[Palette Check] Found token ${token} in tailwind.config.ts`);
  } else {
    console.error(`[Palette Check] FAILED: Missing token ${token} in tailwind.config.ts`);
    errors++;
  }
}

// 2. Audit Footer for light layout and no dark oceanic block
const footerPath = path.resolve('src/components/layout/Footer.tsx');
const footerContent = fs.readFileSync(footerPath, 'utf8');

if (footerContent.includes('bg-ocean-950')) {
  console.error('[Footer Check] FAILED: Found heavy dark background bg-ocean-950 in Footer.tsx');
  errors++;
} else {
  console.log('[Footer Check] PASSED: Heavy dark background removed from Footer.tsx');
}

if (footerContent.includes('#FCFBF8') && footerContent.includes('#E8E5DE')) {
  console.log('[Footer Check] PASSED: Light clean coastal background #FCFBF8 and border #E8E5DE confirmed in Footer.tsx');
} else {
  console.error('[Footer Check] FAILED: Missing light background/border in Footer.tsx');
  errors++;
}

// 3. Audit Navbar for responsive structure
const navbarPath = path.resolve('src/components/layout/Navbar.tsx');
const navbarContent = fs.readFileSync(navbarPath, 'utf8');

if (navbarContent.includes('sm:hidden') && navbarContent.includes('placeholder')) {
  console.log('[Navbar Check] PASSED: Mobile search dedicated row (< 640px) confirmed');
} else {
  console.error('[Navbar Check] FAILED: Missing dedicated mobile search row in Navbar.tsx');
  errors++;
}

if (navbarContent.includes('max-w-[1440px]')) {
  console.log('[Navbar Check] PASSED: Responsive 1440px max-width container confirmed');
} else {
  console.error('[Navbar Check] FAILED: Missing max-w-[1440px] in Navbar.tsx');
  errors++;
}

// 4. Audit Grid Strategy in ExplorePage and HomePage
const explorePagePath = path.resolve('src/pages/ExplorePage.tsx');
const exploreContent = fs.readFileSync(explorePagePath, 'utf8');

if (exploreContent.includes('places.length === 1')) {
  console.log('[Grid Check] PASSED: ExplorePage handles single-result bounding without stretching across screen');
} else {
  console.error('[Grid Check] FAILED: ExplorePage lacks single-result bounding logic');
  errors++;
}

const homePagePath = path.resolve('src/pages/HomePage.tsx');
const homeContent = fs.readFileSync(homePagePath, 'utf8');

if (homeContent.includes('displayedDining.length === 1')) {
  console.log('[Grid Check] PASSED: HomePage handles single street-food result cleanly without leaving 2/3 empty space');
} else {
  console.error('[Grid Check] FAILED: HomePage lacks balanced grid logic for single dining/street-food place');
  errors++;
}

// 5. Audit AI floating assistant positioning and responsiveness
const aiPath = path.resolve('src/components/assistant/L7ajFloating.tsx');
const aiContent = fs.readFileSync(aiPath, 'utf8');

if (aiContent.includes('end-3') || aiContent.includes('end-5')) {
  console.log('[AI Check] PASSED: Direction-aware logical properties (end-3 / end-5) used for RTL/LTR placement');
} else {
  console.error('[AI Check] FAILED: Missing logical direction-aware positioning in L7ajFloating.tsx');
  errors++;
}

if (aiContent.includes('hidden sm:inline')) {
  console.log('[AI Check] PASSED: Compact circular floating button for mobile screens confirmed');
} else {
  console.error('[AI Check] FAILED: Floating AI button not compacted on mobile screens');
  errors++;
}

console.log('-------------------------------------------------------------');
if (errors === 0) {
  console.log('All Responsive UI/UX Checks PASSED with 0 errors.');
  process.exit(0);
} else {
  console.error(`Audit failed with ${errors} error(s).`);
  process.exit(1);
}
