// src/pages/TripPlannerPage.tsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SeoMeta } from '@/components/seo/SeoMeta';
import { TripPlannerInput, GeneratedItinerary } from '@/types/tripPlanner';
import { SupportedLanguage } from '@/types/database';
import { generateItinerary, modifyItinerary } from '@/services/tripPlannerService';
import { getItineraryById, saveItinerary } from '@/services/savedTripsService';

// Step Components
import { PlannerProgressBar } from '@/components/planner/PlannerProgressBar';
import { StepDuration } from '@/components/planner/StepDuration';
import { StepTravelers } from '@/components/planner/StepTravelers';
import { StepBudget } from '@/components/planner/StepBudget';
import { StepInterests } from '@/components/planner/StepInterests';
import { StepFoodPreferences } from '@/components/planner/StepFoodPreferences';
import { StepAvoidance } from '@/components/planner/StepAvoidance';
import { StepPace } from '@/components/planner/StepPace';
import { StepTransportAccom } from '@/components/planner/StepTransportAccom';
import { StepAccessibility } from '@/components/planner/StepAccessibility';
import { StepReview } from '@/components/planner/StepReview';
import { ItineraryGenerationState } from '@/components/planner/ItineraryGenerationState';
import { ItineraryResult } from '@/components/planner/ItineraryResult';
import { AlertCircle } from 'lucide-react';

const DRAFT_STORAGE_KEY = 'dakhlin_planner_draft_v1';

const INITIAL_INPUT: TripPlannerInput = {
  durationDays: 3,
  durationOption: '3',
  travelerType: 'couple',
  adultsCount: 2,
  childrenCount: 0,
  budgetStyle: 'comfortable',
  budgetType: 'total',
  budgetCurrency: 'MAD',
  includesAccommodation: 'yes',
  interests: ['lagoon', 'white_dune', 'seafood', 'moroccan_food'],
  foodPreferences: ['moroccan', 'seafood'],
  dietaryRequirements: ['none'],
  avoidances: [],
  pace: 'balanced',
  transportMode: 'unsure',
  accommodationStatus: 'need_recommendation',
  accessibilityNeeds: [],
};

export const TripPlannerPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const currentLang = (i18n.language?.slice(0, 2) || 'en') as SupportedLanguage;

  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 10; // 1 to 8 main steps + 9 Accessibility + 10 Review

  const [inputData, setInputData] = useState<TripPlannerInput>(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_INPUT;
    } catch {
      return INITIAL_INPUT;
    }
  });

  const [generatedItinerary, setGeneratedItinerary] = useState<GeneratedItinerary | null>(() => {
    const tripId = searchParams.get('id');
    if (tripId) {
      return getItineraryById(tripId);
    }
    return null;
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [isModifying, setIsModifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-save draft answers
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(inputData));
    } catch (err) {
      console.warn('Failed to persist draft answers to localStorage:', err);
    }
  }, [inputData]);

  const handleUpdate = (updates: Partial<TripPlannerInput>) => {
    setInputData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    setErrorMessage(null);
    setCurrentStep((prev) => Math.min(totalSteps, prev + 1));
    window.scrollTo({ top: 80, behavior: 'smooth' });
  };

  const handlePrev = () => {
    setErrorMessage(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
    window.scrollTo({ top: 80, behavior: 'smooth' });
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const result = await generateItinerary(inputData, currentLang);
      saveItinerary(result);
      setGeneratedItinerary(result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Trip generation error:', err);
      setErrorMessage(t('planner.errorDesc', 'An error occurred during generation. Your answers are saved. Please try again.'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleModify = (type: string, customText?: string) => {
    if (!generatedItinerary) return;
    setIsModifying(true);
    try {
      const updated = modifyItinerary(generatedItinerary, type, customText);
      saveItinerary(updated);
      setGeneratedItinerary(updated);
    } catch (err) {
      console.error('Failed to modify itinerary:', err);
    } finally {
      setIsModifying(false);
    }
  };

  const handleReset = () => {
    setGeneratedItinerary(null);
    setCurrentStep(1);
    setInputData(INITIAL_INPUT);
    localStorage.removeItem(DRAFT_STORAGE_KEY);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FCFBF8] text-[#1F2933]">
      <SeoMeta
        title={t('planner.title', 'Plan My Trip')}
        description={t('planner.subtitle', 'Let El Haj build your perfect Dakhla experience.')}
      />

      {/* When Questionnaire is Active */}
      {!generatedItinerary && !isGenerating && (
        <div>
          <PlannerProgressBar
            currentStep={currentStep}
            totalSteps={totalSteps}
            onPrev={handlePrev}
            onExit={() => navigate('/')}
            canPrev={currentStep > 1}
          />

          <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
            
            {/* Error Notification if any */}
            {errorMessage && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
                <button
                  type="button"
                  onClick={handleGenerate}
                  className="px-3 py-1 rounded-full bg-rose-600 text-white font-semibold text-[11px]"
                >
                  {t('planner.btnRetry', 'Try Again')}
                </button>
              </div>
            )}

            {currentStep === 1 && (
              <StepDuration data={inputData} onChange={handleUpdate} onNext={handleNext} />
            )}
            {currentStep === 2 && (
              <StepTravelers data={inputData} onChange={handleUpdate} onNext={handleNext} />
            )}
            {currentStep === 3 && (
              <StepBudget data={inputData} onChange={handleUpdate} onNext={handleNext} />
            )}
            {currentStep === 4 && (
              <StepInterests data={inputData} onChange={handleUpdate} onNext={handleNext} />
            )}
            {currentStep === 5 && (
              <StepFoodPreferences data={inputData} onChange={handleUpdate} onNext={handleNext} />
            )}
            {currentStep === 6 && (
              <StepAvoidance data={inputData} onChange={handleUpdate} onNext={handleNext} />
            )}
            {currentStep === 7 && (
              <StepPace data={inputData} onChange={handleUpdate} onNext={handleNext} />
            )}
            {currentStep === 8 && (
              <StepTransportAccom data={inputData} onChange={handleUpdate} onNext={handleNext} />
            )}
            {currentStep === 9 && (
              <StepAccessibility data={inputData} onChange={handleUpdate} onNext={handleNext} />
            )}
            {currentStep === 10 && (
              <StepReview
                data={inputData}
                onEditStep={(s) => setCurrentStep(s)}
                onGenerate={handleGenerate}
                loading={isGenerating}
              />
            )}
          </main>
        </div>
      )}

      {/* Generating State */}
      {isGenerating && (
        <main className="max-w-2xl mx-auto px-4 py-16">
          <ItineraryGenerationState />
        </main>
      )}

      {/* Generated Itinerary Result Dashboard */}
      {generatedItinerary && !isGenerating && (
        <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <ItineraryResult
            itinerary={generatedItinerary}
            onEditAnswers={() => {
              setGeneratedItinerary(null);
              setCurrentStep(10);
            }}
            onModify={handleModify}
            onReset={handleReset}
            modifying={isModifying}
          />
        </main>
      )}
    </div>
  );
};

export default TripPlannerPage;
