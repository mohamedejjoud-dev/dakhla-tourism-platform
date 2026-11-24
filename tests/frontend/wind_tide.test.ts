import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { getBaselineConditions, fetchLiveDakhlaMarine } from '../../src/services/weatherService';

describe('Dakhla Live Wind & Tide Verification Suite', () => {
  it('1. Verifies baseline marine conditions provide valid Dakhla telemetry', () => {
    const base = getBaselineConditions();
    assert.ok(base.windSpeedKts >= 12, 'Wind speed must reflect Dakhla alizés baseline');
    assert.ok(base.windGustsKts >= base.windSpeedKts, 'Gusts must be greater or equal to base wind');
    assert.strictEqual(base.windDirectionCompass, 'NNE', 'Standard alizés direction must be NNE');
    assert.ok(['optimal', 'moderate', 'light', 'strong'].includes(base.kiteSuitability), 'Suitability must be valid');
    
    // Check HH:mm format
    assert.match(base.nextHighTideTime, /^\d{2}:\d{2}$/, 'High tide time must match HH:mm');
    assert.match(base.nextLowTideTime, /^\d{2}:\d{2}$/, 'Low tide time must match HH:mm');
    assert.ok(['ideal', 'walkable'].includes(base.duneBlancheTip), 'Dune Blanche tip must be valid');
    assert.ok(['ideal', 'submerged'].includes(base.oysterFarmTip), 'Oyster farm tip must be valid');
  });

  it('2. Verifies fetchLiveDakhlaMarine returns resilient conditions object', async () => {
    const live = await fetchLiveDakhlaMarine();
    assert.ok(typeof live.windSpeedKts === 'number', 'Wind speed must be a number');
    assert.ok(typeof live.temperatureC === 'number', 'Temperature must be a number');
    assert.match(live.nextHighTideTime, /^\d{2}:\d{2}$/, 'High tide time must be HH:mm');
    assert.match(live.nextLowTideTime, /^\d{2}:\d{2}$/, 'Low tide time must be HH:mm');
  });

  it('3. Verifies WindTideBar component exists and is referenced in HomePage.tsx', () => {
    const componentPath = path.resolve('src/components/common/WindTideBar.tsx');
    assert.ok(fs.existsSync(componentPath), 'WindTideBar.tsx must exist');

    const homeContent = fs.readFileSync(path.resolve('src/pages/HomePage.tsx'), 'utf8');
    assert.ok(homeContent.includes('<WindTideBar'), 'HomePage.tsx must render <WindTideBar />');
  });

  it('4. Verifies complete trilingual locale keys for marine module', () => {
    const en = JSON.parse(fs.readFileSync(path.resolve('src/locales/en.json'), 'utf8'));
    const fr = JSON.parse(fs.readFileSync(path.resolve('src/locales/fr.json'), 'utf8'));
    const ar = JSON.parse(fs.readFileSync(path.resolve('src/locales/ar.json'), 'utf8'));

    const requiredKeys = [
      'title', 'badge', 'alizes', 'knots', 'gusts', 'highTide', 'lowTide',
      'airTemp', 'waterTemp', 'kiteOptimal', 'kiteModerate', 'kiteLight',
      'kiteStrong', 'duneIdeal', 'duneWalkable', 'oysterIdeal', 'oysterSubmerged',
      'viewDetails', 'close', 'dakhlaLagoon'
    ];

    for (const k of requiredKeys) {
      assert.ok(en.marine && en.marine[k], `Missing EN key: marine.${k}`);
      assert.ok(fr.marine && fr.marine[k], `Missing FR key: marine.${k}`);
      assert.ok(ar.marine && ar.marine[k], `Missing AR key: marine.${k}`);
    }
  });
});
