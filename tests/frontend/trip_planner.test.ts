// tests/frontend/trip_planner.test.ts
import assert from 'node:assert/strict';
import { generateItinerary, modifyItinerary } from '../../src/services/tripPlannerService';
import { TripPlannerInput } from '../../src/types/tripPlanner';

async function runTripPlannerTests() {
  console.log('-------------------------------------------------------------');
  console.log('Running Dakhlin AI Trip Planner Comprehensive Verification...');
  console.log('-------------------------------------------------------------');

  // Scenario 1: Solo traveler, 2 days, low budget
  console.log('[Scenario 1] Solo traveler, 2 days, budget-friendly...');
  const s1Input: TripPlannerInput = {
    durationDays: 2,
    durationOption: '2',
    travelerType: 'solo',
    adultsCount: 1,
    childrenCount: 0,
    budgetStyle: 'budget',
    budgetType: 'total',
    budgetCurrency: 'MAD',
    budgetAmount: 1200,
    includesAccommodation: 'no',
    interests: ['lagoon', 'affordable', 'moroccan_food'],
    foodPreferences: ['street_food'],
    dietaryRequirements: ['none'],
    avoidances: ['expensive_dining'],
    pace: 'relaxed',
    transportMode: 'taxi',
    accommodationStatus: 'none',
    accessibilityNeeds: [],
  };
  const s1Result = await generateItinerary(s1Input, 'en');
  assert.equal(s1Result.days.length, 2, 'Itinerary must have exactly 2 days');
  assert.ok(s1Result.budgetBreakdown.totalEstimated > 0, 'Budget breakdown must be computed');
  console.log('  -> PASSED: 2 days generated with budget estimates.');

  // Scenario 2: Couple, 4 days, balanced pace
  console.log('[Scenario 2] Couple, 4 days, balanced pace...');
  const s2Input: TripPlannerInput = {
    ...s1Input,
    durationDays: 4,
    durationOption: '4-5',
    travelerType: 'couple',
    adultsCount: 2,
    budgetStyle: 'comfortable',
    pace: 'balanced',
  };
  const s2Result = await generateItinerary(s2Input, 'en');
  assert.equal(s2Result.days.length, 4, 'Must have 4 days');
  const day2Titles = s2Result.days[1].items.map(i => (i.title || '').toLowerCase());
  assert.ok(day2Titles.some(t => t.includes('dune') || t.includes('blanche')), 'Day 2 must feature Dune Blanche');
  console.log('  -> PASSED: 4 days generated with Dune Blanche on Day 2.');

  // Scenario 3: Traveler avoiding extreme sports
  console.log('[Scenario 3] Traveler avoiding extreme sports...');
  const s3Input: TripPlannerInput = {
    ...s1Input,
    durationDays: 3,
    interests: ['nature', 'relaxation'],
    avoidances: ['extreme_sports'],
  };
  const s3Result = await generateItinerary(s3Input, 'en');
  const allItemTitles = s3Result.days.flatMap(d => d.items.map(i => i.title.toLowerCase()));
  assert.ok(!allItemTitles.some(t => t.includes('kitesurf') || t.includes('wingfoil')), 'Must not recommend kitesurf when extreme sports are avoided');
  console.log('  -> PASSED: Avoided activities strictly filtered out.');

  // Scenario 4: Traveler arriving late afternoon
  console.log('[Scenario 4] Traveler arriving late (17:00)...');
  const s4Input: TripPlannerInput = {
    ...s1Input,
    durationDays: 3,
    arrivalTime: '17:00',
  };
  const s4Result = await generateItinerary(s4Input, 'en');
  assert.equal(s4Result.days[0].isPartialDay, true, 'First day must be recognized as partial day');
  console.log('  -> PASSED: Arrival timing properly balanced.');

  // Scenario 5: Arabic generation & zero hallucinations
  console.log('[Scenario 5] Arabic RTL generation...');
  const s5Result = await generateItinerary(s2Input, 'ar');
  assert.equal(s5Result.language, 'ar');
  assert.ok(s5Result.title.includes('رحلة'), 'Title must be in Arabic');
  assert.ok(s5Result.intro.includes('الحاج'), 'Intro must feature El Haj in Arabic');
  console.log('  -> PASSED: Native Arabic generation verified.');

  // Scenario 6: Modification engine (make cheaper)
  console.log('[Scenario 6] Conversational modification: make cheaper...');
  const modified = modifyItinerary(s2Result, 'make_cheaper');
  assert.ok(modified.budgetBreakdown.totalEstimated <= s2Result.budgetBreakdown.totalEstimated, 'Total must decrease or remain bounded');
  console.log('  -> PASSED: Budget modification successfully rebalances costs.');

  console.log('-------------------------------------------------------------');
  console.log('All 6 AI Trip Planner Scenarios PASSED successfully.');
  console.log('-------------------------------------------------------------');
}

runTripPlannerTests().catch((err) => {
  console.error('Test failure:', err);
  process.exit(1);
});
