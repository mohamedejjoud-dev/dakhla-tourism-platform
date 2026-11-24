// src/services/savedTripsService.ts
// Local and cloud storage provider for saved Dakhlin itineraries.

import { GeneratedItinerary } from '@/types/tripPlanner';

const STORAGE_KEY = 'dakhlin_saved_itineraries_v1';

export function getSavedItineraries(): GeneratedItinerary[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load saved itineraries from localStorage:', err);
    return [];
  }
}

export function saveItinerary(itinerary: GeneratedItinerary): boolean {
  try {
    const list = getSavedItineraries();
    const existingIndex = list.findIndex(i => i.id === itinerary.id);
    if (existingIndex >= 0) {
      list[existingIndex] = itinerary;
    } else {
      list.unshift(itinerary);
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return true;
  } catch (err) {
    console.error('Failed to save itinerary to localStorage:', err);
    return false;
  }
}

export function getItineraryById(id: string): GeneratedItinerary | null {
  const list = getSavedItineraries();
  return list.find(i => i.id === id) || null;
}

export function deleteSavedItinerary(id: string): boolean {
  try {
    const list = getSavedItineraries().filter(i => i.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return true;
  } catch (err) {
    console.error('Failed to delete itinerary from localStorage:', err);
    return false;
  }
}

export function duplicateSavedItinerary(id: string, newTitlePrefix = 'Copy of '): GeneratedItinerary | null {
  const item = getItineraryById(id);
  if (!item) return null;
  const copy: GeneratedItinerary = {
    ...item,
    id: `trip-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    title: `${newTitlePrefix}${item.title}`,
    generatedAt: new Date().toISOString(),
  };
  saveItinerary(copy);
  return copy;
}
