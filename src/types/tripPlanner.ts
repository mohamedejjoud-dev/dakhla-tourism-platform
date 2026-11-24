// src/types/tripPlanner.ts
// Strict TypeScript schemas for Dakhlin's "Plan My Trip" AI trip-planning engine.

import { SupportedLanguage } from './database';

export type TripDurationOption = '2' | '3' | '4-5' | '6+';

export type TravelerType = 'solo' | 'couple' | 'friends' | 'family' | 'group';

export type BudgetStyle = 'budget' | 'comfortable' | 'premium';

export type BudgetType = 'total' | 'per_person';

export type TravelPace = 'relaxed' | 'balanced' | 'full';

export type TransportMode = 
  | 'have_car' 
  | 'rental_car' 
  | 'taxi' 
  | 'hotel_transfer' 
  | 'excursions' 
  | 'walking' 
  | 'unsure';

export type AccommodationStatus = 'booked' | 'need_recommendation' | 'none';

export interface TripPlannerInput {
  // Step 1: Duration
  durationDays: number;
  durationOption: TripDurationOption;
  arrivalDate?: string;
  arrivalTime?: string;
  departureDate?: string;
  departureTime?: string;

  // Step 2: Travelers
  travelerType: TravelerType;
  adultsCount: number;
  childrenCount: number;
  childrenAges?: string;
  hasElderly?: boolean;

  // Step 3: Budget
  budgetAmount?: number;
  budgetCurrency: string; // 'MAD', 'EUR', 'USD'
  budgetStyle: BudgetStyle;
  budgetType: BudgetType;
  includesAccommodation: 'yes' | 'no' | 'unsure';

  // Step 4: Interests
  interests: string[];

  // Step 5: Food preferences
  foodPreferences: string[];
  dietaryRequirements: string[];
  specialDietaryNotes?: string;

  // Step 6: Avoidances
  avoidances: string[];
  additionalNotes?: string;

  // Step 7: Travel Pace
  pace: TravelPace;

  // Step 8: Transport & Accommodation
  transportMode: TransportMode;
  accommodationStatus: AccommodationStatus;
  selectedHotelId?: string;
  selectedHotelName?: string;

  // Optional: Accessibility
  accessibilityNeeds: string[];
}

export type VerificationStatus = 'verified' | 'estimated' | 'unverified' | 'not_applicable';

export interface ItineraryItemCost {
  value: number | null;
  currency: string;
  status: VerificationStatus;
}

export interface StructuredItineraryItem {
  id: string;
  recordId?: string; // Real Dakhlin Place ID if linked
  placeSlug?: string;
  type: 'activity' | 'restaurant' | 'hotel' | 'sightseeing' | 'transfer' | 'relaxation';
  title: string;
  timeOfDay: 'morning' | 'lunch' | 'afternoon' | 'dinner' | 'evening';
  suggestedTime?: string;
  estimatedDuration?: string;
  reason: string;
  estimatedCost: ItineraryItemCost;
  latitude?: number | null;
  longitude?: number | null;
  bookingRequired: boolean;
  notes?: string;
}

export interface DailyItinerary {
  dayNumber: number;
  title: string;
  theme: string;
  date?: string;
  isPartialDay?: boolean;
  estimatedDailyCost: {
    min: number;
    max: number;
    currency: string;
  };
  transportNotes: string;
  bookingReminders: string[];
  items: StructuredItineraryItem[];
  backupOption?: {
    title: string;
    description: string;
    reason: string;
  };
}

export interface BudgetBreakdown {
  totalEstimated: number;
  currency: string;
  accommodationEstimated: number;
  activitiesEstimated: number;
  foodEstimated: number;
  transportEstimated: number;
  bufferEstimated: number;
  isOverBudget: boolean;
  budgetAlertMessage?: string;
}

export interface GeneratedItinerary {
  id: string;
  title: string;
  intro: string;
  generatedAt: string;
  language: SupportedLanguage;
  inputSnapshot: TripPlannerInput;
  days: DailyItinerary[];
  budgetBreakdown: BudgetBreakdown;
  preparationChecklist: Array<{
    category: string;
    item: string;
    importance: 'essential' | 'recommended' | 'optional';
  }>;
  summaryAtAGlance: {
    totalDays: number;
    pace: TravelPace;
    activitiesCount: number;
    foodCount: number;
    keyDestinations: string[];
    transportApproach: string;
    requiresConfirmationCount: number;
  };
}
