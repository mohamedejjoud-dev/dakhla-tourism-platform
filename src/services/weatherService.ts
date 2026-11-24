// src/services/weatherService.ts
// Real-time marine, wind, and tide intelligence for Dakhla Lagoon & Bay
// Uses Open-Meteo free marine/weather API with zero API keys + deterministic astronomical fallback

export interface MarineConditions {
  temperatureC: number;
  waterTempC: number;
  windSpeedKts: number;
  windGustsKts: number;
  windDirectionDeg: number;
  windDirectionCompass: string;
  kiteSuitability: 'optimal' | 'moderate' | 'light' | 'strong';
  tideStatus: 'high_incoming' | 'high_peak' | 'low_outgoing' | 'low_slack';
  nextHighTideTime: string; // HH:mm
  nextLowTideTime: string;  // HH:mm
  duneBlancheTip: 'ideal' | 'walkable';
  oysterFarmTip: 'ideal' | 'submerged';
  isLive: boolean;
}

// Convert wind degrees to cardinal direction
function degreesToCompass(deg: number): string {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round((deg % 360) / 22.5) % 16;
  return directions[index];
}

// Approximate semi-diurnal tides for Dakhla (~12h 25m cycle)
function calculateAstronomicalTides(now: Date) {
  const hour = now.getHours() + now.getMinutes() / 60;
  
  // Dakhla typical astronomical reference offsets
  // Cycle roughly peaks around 03:00 / 15:20 and troughs around 09:15 / 21:40 depending on lunar day
  const baseTideHour = 3.33; // 03:20 AM
  const cycleLength = 12.42; // hours
  
  const phaseInCycle = ((hour - baseTideHour) % cycleLength + cycleLength) % cycleLength;
  
  let nextHigh = (baseTideHour + Math.ceil((hour - baseTideHour) / cycleLength) * cycleLength);
  let nextLow = (baseTideHour + 6.21 + Math.floor((hour - baseTideHour) / cycleLength) * cycleLength);
  
  if (nextLow < hour) nextLow += cycleLength;
  
  const formatTime = (h: number) => {
    const wrappedH = Math.floor(h % 24);
    const m = Math.floor((h % 1) * 60);
    return `${wrappedH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const isHighTide = phaseInCycle < 2.5 || phaseInCycle > 9.9;
  
  return {
    isHighTide,
    nextHighTideTime: formatTime(nextHigh),
    nextLowTideTime: formatTime(nextLow),
    phaseInCycle,
  };
}

/**
 * Fallback baseline based on Dakhla's 300+ days annual average alizés & temperatures
 */
export function getBaselineConditions(now = new Date()): MarineConditions {
  const tides = calculateAstronomicalTides(now);
  const hour = now.getHours();

  // Dakhla afternoon thermal acceleration (strongest between 13:00 and 18:00)
  const isAfternoon = hour >= 13 && hour <= 18;
  const windSpeedKts = isAfternoon ? 21 : 16;
  const windGustsKts = isAfternoon ? 26 : 20;

  return {
    temperatureC: 22,
    waterTempC: 19,
    windSpeedKts,
    windGustsKts,
    windDirectionDeg: 25, // NNE (Classic Alizés)
    windDirectionCompass: 'NNE',
    kiteSuitability: 'optimal',
    tideStatus: tides.isHighTide ? 'high_peak' : 'low_outgoing',
    nextHighTideTime: tides.nextHighTideTime,
    nextLowTideTime: tides.nextLowTideTime,
    duneBlancheTip: tides.isHighTide ? 'ideal' : 'walkable',
    oysterFarmTip: tides.isHighTide ? 'submerged' : 'ideal',
    isLive: false,
  };
}

/**
 * Fetches real-time marine data from Open-Meteo for Dakhla (23.72°N, -15.93°W)
 */
export async function fetchLiveDakhlaMarine(): Promise<MarineConditions> {
  const now = new Date();
  const fallback = getBaselineConditions(now);

  try {
    const weatherUrl = 'https://api.open-meteo.com/v1/forecast?latitude=23.72&longitude=-15.93&current=temperature_2m,wind_speed_10m,wind_direction_10m,wind_gusts_10m&wind_speed_unit=kn';
    
    // 3.5s timeout for ultra-fast fallback on slow networks
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3500);

    const res = await fetch(weatherUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!res.ok) return fallback;

    const data = await res.json();
    const current = data?.current;

    if (!current) return fallback;

    const windSpeed = Math.round(current.wind_speed_10m || fallback.windSpeedKts);
    const windGusts = Math.round(current.wind_gusts_10m || fallback.windGustsKts);
    const windDir = Math.round(current.wind_direction_10m || fallback.windDirectionDeg);
    const temp = Math.round(current.temperature_2m || fallback.temperatureC);

    let suitability: MarineConditions['kiteSuitability'] = 'optimal';
    if (windSpeed < 12) suitability = 'light';
    else if (windSpeed >= 13 && windSpeed <= 25) suitability = 'optimal';
    else if (windSpeed > 25 && windSpeed <= 30) suitability = 'strong';
    else suitability = 'moderate';

    const tides = calculateAstronomicalTides(now);

    return {
      temperatureC: temp,
      waterTempC: 19,
      windSpeedKts: windSpeed,
      windGustsKts: windGusts,
      windDirectionDeg: windDir,
      windDirectionCompass: degreesToCompass(windDir),
      kiteSuitability: suitability,
      tideStatus: tides.isHighTide ? 'high_peak' : 'low_outgoing',
      nextHighTideTime: tides.nextHighTideTime,
      nextLowTideTime: tides.nextLowTideTime,
      duneBlancheTip: tides.isHighTide ? 'ideal' : 'walkable',
      oysterFarmTip: tides.isHighTide ? 'submerged' : 'ideal',
      isLive: true,
    };
  } catch {
    return fallback;
  }
}
