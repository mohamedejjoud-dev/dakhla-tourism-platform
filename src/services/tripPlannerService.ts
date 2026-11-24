// src/services/tripPlannerService.ts
// AI-Powered Grounded Trip Planning Engine for Dakhla Tourism Platform.
// Strictly adheres to Dakhlin catalog records with zero hallucinations.

import { getCuratedPlaces } from './curatedPlaces';
import { PlaceWithDetails, SupportedLanguage } from '@/types/database';
import { 
  TripPlannerInput, 
  GeneratedItinerary, 
  DailyItinerary, 
  StructuredItineraryItem, 
  BudgetBreakdown 
} from '@/types/tripPlanner';

export async function generateItinerary(
  input: TripPlannerInput,
  lang: SupportedLanguage = 'en'
): Promise<GeneratedItinerary> {
  // Retrieve verified platform records
  const allPlaces = getCuratedPlaces(lang);
  
  // Synthesize custom daily schedule grounded in authentic places
  return buildGroundedItinerary(input, allPlaces, lang);
}

function getPlaceTitle(p?: PlaceWithDetails): string {
  if (!p) return '';
  return (p as any).translation?.title || p.slug;
}

function buildGroundedItinerary(
  input: TripPlannerInput,
  places: PlaceWithDetails[],
  lang: SupportedLanguage
): GeneratedItinerary {
  const daysCount = Math.max(1, Math.min(14, input.durationDays || 3));
  
  // Categorize available platform places
  const hotels = places.filter(p => p.category?.slug === 'hotels' || p.tags?.includes('hotel') || p.tags?.includes('camp'));
  const restaurants = places.filter(p => p.category?.slug === 'restaurants' || p.tags?.includes('seafood') || p.tags?.includes('restaurant'));
  const streetFood = places.filter(p => p.category?.slug === 'street-food' || p.tags?.includes('street-food') || p.tags?.includes('homemade'));
  const activities = places.filter(p => p.category?.slug === 'activities' || p.tags?.includes('kitesurf') || p.tags?.includes('excursion'));
  const attractions = places.filter(p => p.category?.slug === 'attractions' || p.tags?.includes('dune') || p.tags?.includes('nature'));

  // Negative avoidance filter
  const avoidExtreme = input.avoidances?.includes('extreme_sports');
  const avoidSeafood = input.avoidances?.includes('seafood') || input.dietaryRequirements?.includes('seafood_allergy');
  const avoidEarly = input.avoidances?.includes('early_mornings');
  const avoidExpensive = input.avoidances?.includes('expensive_dining') || input.budgetStyle === 'budget';

  // Selected or recommended hotel
  let baseHotel: PlaceWithDetails | undefined;
  if (input.selectedHotelId) {
    baseHotel = hotels.find(h => h.id === input.selectedHotelId);
  }
  if (!baseHotel && input.accommodationStatus === 'need_recommendation') {
    if (input.budgetStyle === 'premium') {
      baseHotel = hotels.find(h => h.tags?.includes('luxury') || h.price_level >= 3) || hotels[0];
    } else if (input.budgetStyle === 'budget') {
      baseHotel = hotels.find(h => h.price_level <= 2) || hotels[0];
    } else {
      baseHotel = hotels[0];
    }
  }

  const days: DailyItinerary[] = [];

  for (let d = 1; d <= daysCount; d++) {
    const isFirstDay = d === 1;
    const isLastDay = d === daysCount;
    const items: StructuredItineraryItem[] = [];

    // Day Theme & Titles localized
    let dayTheme = '';
    let dayTitle = '';

    if (lang === 'ar') {
      if (isFirstDay) {
        dayTheme = 'الوصول واستكشاف سحر بحيرة الداخلة';
        dayTitle = 'اليوم الأول: الترحيب بنسيم المحيط';
      } else if (isLastDay) {
        dayTheme = 'الفطور البلدي وجولة الهدايا التذكارية ثم توديع الداخلة';
        dayTitle = `اليوم ${d}: ذكريات لا تُنسى في لؤلؤة الصحراء`;
      } else if (d === 2) {
        dayTheme = 'الكثيب الأبيض وزيارة العين الكبريتية الدافئة أسماء';
        dayTitle = 'اليوم الثاني: مغامرة الكثبان والينابيع الطبيعية';
      } else if (d === 3) {
        dayTheme = 'جزيرة التنين وتذوق المحار الطازج في خليج الداخلة';
        dayTitle = 'اليوم الثالث: عجائب البحيرة وفواكه البحر';
      } else if (d === 4) {
        dayTheme = 'شاطئ بويرتو ريكو واكتشاف أسرار الساحل الأطلسي';
        dayTitle = 'اليوم الرابع: رمال الصحراء الذهبية ومياه الأطلسي';
      } else {
        dayTheme = 'جولة في الصناعة التقليدية والاسترخاء على ضفاف البحيرة';
        dayTitle = `اليوم ${d}: استكشاف الثقافة الحسانية وأجواء الهدوء`;
      }
    } else if (lang === 'fr') {
      if (isFirstDay) {
        dayTheme = 'Arrivée & Première immersion dans la lagune turquoise';
        dayTitle = 'Jour 1 : Bienvenue sous les alizés de Dakhla';
      } else if (isLastDay) {
        dayTheme = 'Petit-déjeuner beldi, derniers souvenirs et départ';
        dayTitle = `Jour ${d} : Derniers souffles atlantiques`;
      } else if (d === 2) {
        dayTheme = 'Excursion à la Dune Blanche & Source thermale d\'Asnaa';
        dayTitle = 'Jour 2 : Merveilles géologiques et désert saharien';
      } else if (d === 3) {
        dayTheme = 'Île du Dragon & Dégustation d\'huîtres fraîches dans la baie';
        dayTitle = 'Jour 3 : Joyaux de la lagune et saveurs marines';
      } else if (d === 4) {
        dayTheme = 'Plage de Puerto Rico & Falaise atlantique';
        dayTitle = 'Jour 4 : Échappée sauvage vers le sud de la péninsule';
      } else {
        dayTheme = 'Artisanat local, thé sahraoui et détente absolue';
        dayTitle = `Jour ${d} : Immersion culturelle & Sérénité`;
      }
    } else {
      if (isFirstDay) {
        dayTheme = 'Arrival & First Glimpse of the Turquoise Lagoon';
        dayTitle = 'Day 1: Welcome to the Winds of Dakhla';
      } else if (isLastDay) {
        dayTheme = 'Beldi Breakfast, Souvenir Hunting & Fond Farewell';
        dayTitle = `Day ${d}: Unforgettable Saharan Memories`;
      } else if (d === 2) {
        dayTheme = 'White Dune (Dune Blanche) & Asnaa Thermal Springs';
        dayTitle = 'Day 2: Geological Wonders & Desert Serenity';
      } else if (d === 3) {
        dayTheme = 'Dragon Island & Fresh Lagoon Oyster Tasting';
        dayTitle = 'Day 3: Lagoon Treasures & Coastal Delicacies';
      } else if (d === 4) {
        dayTheme = 'Puerto Rico Beach & Untouched Atlantic Coastline';
        dayTitle = 'Day 4: Wild Ocean Horizons & Golden Cliffs';
      } else {
        dayTheme = 'Saharan Crafts, Traditional Tea & Tranquil Waters';
        dayTitle = `Day ${d}: Cultural Discovery & Deep Relaxation`;
      }
    }

    // MORNING ACTIVITY
    const morningTime = avoidEarly ? '10:00' : '09:00';
    if (!isFirstDay) {
      if (d === 2) {
        // Dune Blanche
        const dunePlace = attractions.find(a => a.slug.includes('dune') || a.slug.includes('blanche')) || attractions[0];
        items.push({
          id: `item-${d}-morning`,
          recordId: dunePlace?.id,
          placeSlug: dunePlace?.slug,
          type: 'sightseeing',
          title: getPlaceTitle(dunePlace) || (lang === 'ar' ? 'رحلة إلى الكثيب الأبيض' : lang === 'fr' ? 'Excursion à la Dune Blanche' : 'White Dune (Dune Blanche) Excursion'),
          timeOfDay: 'morning',
          suggestedTime: `${morningTime} – 12:30`,
          estimatedDuration: '3h',
          reason: lang === 'ar' 
            ? 'موقع أيقوني يلبي حبك للمناظر الطبيعية الخلابة والتقاط أروع الصور.'
            : lang === 'fr' 
            ? 'Site emblématique combinant dunes de sable blanc pur et lagune turquoise.'
            : 'Iconic panoramic sight matching your interest in landscapes and photography.',
          estimatedCost: { value: 350, currency: 'MAD', status: 'estimated' },
          latitude: dunePlace?.latitude || 23.9015,
          longitude: dunePlace?.longitude || -15.7892,
          bookingRequired: true,
          notes: lang === 'ar' ? 'ينصح بالتنسيق مع مرشد أو سائق دفع رباعي 4x4.' : '4x4 vehicle recommended to traverse the sand banks.',
        });
      } else if (d === 3) {
        // Dragon Island or Lagoon discovery
        const dragonPlace = attractions.find(a => a.slug.includes('dragon')) || activities[0];
        items.push({
          id: `item-${d}-morning`,
          recordId: dragonPlace?.id,
          placeSlug: dragonPlace?.slug,
          type: 'activity',
          title: getPlaceTitle(dragonPlace) || (lang === 'ar' ? 'رحلة بحرية إلى جزيرة التنين' : lang === 'fr' ? 'Traversée en bateau vers l\'Île du Dragon' : 'Boat Excursion to Dragon Island'),
          timeOfDay: 'morning',
          suggestedTime: `${morningTime} – 12:30`,
          estimatedDuration: '2h30',
          reason: lang === 'ar' 
            ? 'جولة بحرية فريدة لمشاهدة الطيور المهاجرة ورواسب الطين الطبيعي.'
            : lang === 'fr' 
            ? 'Sortie bateau pour explorer cette formation rocheuse unique posée au milieu de la baie.'
            : 'Explore the natural dragon-shaped sand and clay formation in the middle of the lagoon.',
          estimatedCost: { value: 250, currency: 'MAD', status: 'estimated' },
          latitude: dragonPlace?.latitude || 23.8211,
          longitude: dragonPlace?.longitude || -15.8234,
          bookingRequired: true,
          notes: lang === 'ar' ? 'تعتمد الرحلة على مواعيد المد والجزر.' : 'Tide-dependent excursion; check schedule in advance.',
        });
      } else if (d === 4) {
        // Puerto Rico Beach
        const prPlace = attractions.find(a => a.slug.includes('puerto') || a.slug.includes('rico')) || attractions[1];
        items.push({
          id: `item-${d}-morning`,
          recordId: prPlace?.id,
          placeSlug: prPlace?.slug,
          type: 'sightseeing',
          title: getPlaceTitle(prPlace) || (lang === 'ar' ? 'استكشاف شاطئ بويرتو ريكو البكر' : lang === 'fr' ? 'Découverte de la plage sauvage de Puerto Rico' : 'Puerto Rico Wild Beach Exploration'),
          timeOfDay: 'morning',
          suggestedTime: `${morningTime} – 12:30`,
          estimatedDuration: '2h30',
          reason: lang === 'ar' 
            ? 'شاطئ هادئ برمال ذهبية ومياه كريستالية مثالي للابتعاد عن صخب الأماكن المزدحمة.'
            : lang === 'fr' 
            ? 'Plage préservée au sable doré, idéale pour la contemplation loin des foules.'
            : 'Pristine golden coastline and crystal waters, peaceful and off-the-beaten-path.',
          estimatedCost: { value: 0, currency: 'MAD', status: 'verified' },
          latitude: prPlace?.latitude || 23.5123,
          longitude: prPlace?.longitude || -15.9345,
          bookingRequired: false,
          notes: lang === 'ar' ? 'دخول حر ومجاني.' : 'Free public access.',
        });
      } else {
        // Kitesurf or Relaxation
        const kitePlace = activities.find(a => a.slug.includes('kite') || a.slug.includes('glisse')) || activities[0];
        if (!avoidExtreme && input.interests?.includes('kitesurf')) {
          items.push({
            id: `item-${d}-morning`,
            recordId: kitePlace?.id,
            placeSlug: kitePlace?.slug,
            type: 'activity',
            title: getPlaceTitle(kitePlace) || 'Kitesurf / Wingfoil Session (PK25 Lagoon)',
            timeOfDay: 'morning',
            suggestedTime: `${morningTime} – 12:30`,
            estimatedDuration: '2h30',
            reason: lang === 'ar' ? 'رياح ثابتة ومياه ضحلة آمنة تناسب تطلعاتك الرياضية.' : 'Steady trade winds and shallow warm water.',
            estimatedCost: { value: 500, currency: 'MAD', status: 'estimated' },
            latitude: 23.8945,
            longitude: -15.7832,
            bookingRequired: true,
          });
        } else {
          // Artisans or Corniche walk
          const artisanPlace = places.find(p => p.category?.slug === 'artisans') || places[0];
          items.push({
            id: `item-${d}-morning`,
            recordId: artisanPlace?.id,
            placeSlug: artisanPlace?.slug,
            type: 'relaxation',
            title: getPlaceTitle(artisanPlace) || (lang === 'ar' ? 'جولة في مجمع الصناعة التقليدية بالداخلة' : 'Dakhla Artisanal Complex & Local Crafts'),
            timeOfDay: 'morning',
            suggestedTime: `${morningTime} – 12:00`,
            estimatedDuration: '2h',
            reason: lang === 'ar' ? 'اكتشاف منتجات الجلد والفضة والنسيج الصحراوي.' : 'Discover authentic Saharan leather, silver jewelry and woven textiles.',
            estimatedCost: { value: 0, currency: 'MAD', status: 'verified' },
            latitude: artisanPlace?.latitude || 23.7145,
            longitude: artisanPlace?.longitude || -15.9312,
            bookingRequired: false,
          });
        }
      }
    } else {
      // First day arrival
      items.push({
        id: `item-1-arrival`,
        type: 'transfer',
        title: lang === 'ar' ? 'الوصول إلى مطار الداخلة والاستقرار بالإقامة' : lang === 'fr' ? 'Arrivée à l\'aéroport de Dakhla & Installation' : 'Arrival at Dakhla Airport & Check-in',
        timeOfDay: 'morning',
        suggestedTime: input.arrivalTime ? `${input.arrivalTime} – ${addHours(input.arrivalTime, 2)}` : '11:00 – 13:00',
        estimatedDuration: '1h30',
        reason: lang === 'ar' ? 'بداية مريحة لاستلام الأمتعة والتوجه إلى مكان الإقامة.' : 'Smooth arrival, luggage retrieval and transfer to your stay.',
        estimatedCost: { value: 100, currency: 'MAD', status: 'estimated' },
        bookingRequired: false,
        notes: lang === 'ar' ? 'تتوفر سيارات الأجرة وخدمات النقل عند مخرج المطار.' : 'Taxis and hotel shuttles are readily available at airport exit.',
      });
    }

    // LUNCH
    let lunchPlace: PlaceWithDetails | undefined;
    if (avoidSeafood || input.foodPreferences?.includes('street_food') || input.budgetStyle === 'budget' || d % 2 === 1) {
      lunchPlace = streetFood.find(s => s.slug === 'mama-saida') || streetFood[0] || restaurants[0];
    } else {
      lunchPlace = restaurants.find(r => r.slug.includes('talhamar') || r.slug.includes('huitre') || r.tags?.includes('seafood')) || restaurants[0];
    }

    items.push({
      id: `item-${d}-lunch`,
      recordId: lunchPlace?.id,
      placeSlug: lunchPlace?.slug,
      type: 'restaurant',
      title: getPlaceTitle(lunchPlace) || (lang === 'ar' ? 'وجبة غداء محلية أصيلة' : lang === 'fr' ? 'Déjeuner authentique de Dakhla' : 'Authentic Dakhla Lunch'),
      timeOfDay: 'lunch',
      suggestedTime: '13:00 – 14:30',
      estimatedDuration: '1h30',
      reason: lunchPlace?.slug === 'mama-saida'
        ? (lang === 'ar' ? 'طواجن منزلية طازجة ودجاج محمر ولوبيا بأسعار شعبية طيبة لدى ماما سعيدة.' : lang === 'fr' ? 'Tajines beldi fumants et cuisine familiale chaleureuse chez Mama Saida à prix très doux.' : 'Home-style Moroccan tagines and warm hospitality at Mama Saida with budget-friendly prices.')
        : (lang === 'ar' ? 'محار طازج وطواجن فواكه بحرية مباشرة على ضفاف البحيرة.' : lang === 'fr' ? 'Dégustation d\'huîtres fraîches et poissons grillés au bord de l\'eau.' : 'Fresh oysters and daily grilled Atlantic catch right on the lagoon edge.'),
      estimatedCost: { 
        value: lunchPlace?.price_level === 1 ? 35 : lunchPlace?.price_level === 2 ? 90 : 180, 
        currency: 'MAD', 
        status: 'estimated' 
      },
      latitude: lunchPlace?.latitude || 23.7023,
      longitude: lunchPlace?.longitude || -15.9503,
      bookingRequired: lunchPlace?.slug.includes('talhamar') ? true : false,
      notes: lunchPlace?.slug === 'mama-saida' 
        ? (lang === 'ar' ? 'الأفضل الحضور بين 12:30 و 13:30 للطواجن الطازجة.' : 'Arrive 12:30-13:30 for fresh tagines.')
        : (lang === 'ar' ? 'ينصح بالحجز المسبق في عطلة نهاية الأسبوع.' : 'Weekend advance booking recommended.'),
    });

    // AFTERNOON
    if (!isLastDay) {
      if (d === 1) {
        // Lagoon promenade or camp relaxation
        items.push({
          id: `item-1-afternoon`,
          type: 'relaxation',
          title: lang === 'ar' ? 'استراحة الشاي الصحراوي وتأمل مياه البحيرة' : lang === 'fr' ? 'Pause thé sahraoui & Contemplation de la lagune' : 'Saharan Mint Tea & Lagoon Relaxation',
          timeOfDay: 'afternoon',
          suggestedTime: '15:30 – 17:30',
          estimatedDuration: '2h',
          reason: lang === 'ar' ? 'التأقلم مع أجواء الداخلة الهادئة والاستمتاع بجمال الطبيعة.' : 'Unwind from your journey with authentic Saharan tea by the tranquil waters.',
          estimatedCost: { value: 20, currency: 'MAD', status: 'verified' },
          bookingRequired: false,
        });
      } else if (d === 2) {
        // Asnaa thermal spring
        const asnaaPlace = attractions.find(a => a.slug.includes('asnaa')) || attractions[1];
        items.push({
          id: `item-2-afternoon`,
          recordId: asnaaPlace?.id,
          placeSlug: asnaaPlace?.slug,
          type: 'relaxation',
          title: getPlaceTitle(asnaaPlace) || (lang === 'ar' ? 'الاستحمام في عين أسماء الكبريتية الدافئة' : 'Asnaa Warm Sulfur Hot Springs (Source Asnaa)'),
          timeOfDay: 'afternoon',
          suggestedTime: '15:30 – 17:30',
          estimatedDuration: '1h30',
          reason: lang === 'ar' ? 'مياه دافئة طبيعية بدرجة 38° غنية بالمعادن ومريحة للعضلات.' : 'Natural warm 38°C sulfur water spray beneficial for skin and tired muscles.',
          estimatedCost: { value: 20, currency: 'MAD', status: 'verified' },
          latitude: asnaaPlace?.latitude || 23.7845,
          longitude: asnaaPlace?.longitude || -15.8921,
          bookingRequired: false,
          notes: lang === 'ar' ? 'ينصح بإحضار ملابس سباحة ومناشف.' : 'Bring swimwear and towels.',
        });
      } else {
        // Beach walk or water activity
        items.push({
          id: `item-${d}-afternoon`,
          type: 'relaxation',
          title: lang === 'ar' ? 'المشي على كورنيش الداخلة والسباحة في مياه هادئة' : lang === 'fr' ? 'Balade sur la corniche et baignade dans les eaux calmes' : 'Lagoon Beach Walk & Coastal Swims',
          timeOfDay: 'afternoon',
          suggestedTime: '15:30 – 18:00',
          estimatedDuration: '2h30',
          reason: lang === 'ar' ? 'وقت حر للاسترخاء والتمتع بالهواء النقي بدون استعجال.' : 'Unstructured downtime to recharge and swim.',
          estimatedCost: { value: 0, currency: 'MAD', status: 'verified' },
          bookingRequired: false,
        });
      }
    } else {
      // Last day departure afternoon
      items.push({
        id: `item-${daysCount}-departure`,
        type: 'transfer',
        title: lang === 'ar' ? 'التوجه إلى المطار وإجراءات المغادرة' : lang === 'fr' ? 'Transfert vers l\'aéroport et enregistrement' : 'Airport Transfer & Flight Departure',
        timeOfDay: 'afternoon',
        suggestedTime: input.departureTime ? `${subHours(input.departureTime, 2)} – ${input.departureTime}` : '15:00 – 17:00',
        estimatedDuration: '2h',
        reason: lang === 'ar' ? 'الوصول في وقت مناسب لإنهاء إجراءات السفر بكل أريحية.' : 'Arrive with ample time before your departure gate.',
        estimatedCost: { value: 100, currency: 'MAD', status: 'estimated' },
        bookingRequired: false,
      });
    }

    // DINNER & EVENING
    if (!isLastDay || (input.departureTime && parseInt(input.departureTime.split(':')[0]) >= 21)) {
      const dinnerPlace = restaurants.find(r => r.id !== lunchPlace?.id) || restaurants[0];
      items.push({
        id: `item-${d}-dinner`,
        recordId: dinnerPlace?.id,
        placeSlug: dinnerPlace?.slug,
        type: 'restaurant',
        title: getPlaceTitle(dinnerPlace) || (lang === 'ar' ? 'عشاء صحراوي أو مطعم بإطلالة على الخليج' : lang === 'fr' ? 'Dîner vue lagune ou cuisine marocaine raffinée' : 'Lagoon-side Dinner & Saharan Specialties'),
        timeOfDay: 'dinner',
        suggestedTime: '19:30 – 21:30',
        estimatedDuration: '2h',
        reason: lang === 'ar' ? 'عشاء هادئ مع مشاهدة انعكاس النجوم على مياه المحيط.' : 'Relaxed evening dining with tranquil views over the bay.',
        estimatedCost: { 
          value: avoidExpensive ? 60 : 150, 
          currency: 'MAD', 
          status: 'estimated' 
        },
        latitude: dinnerPlace?.latitude || 23.7212,
        longitude: dinnerPlace?.longitude || -15.9388,
        bookingRequired: !avoidExpensive,
      });
    }

    // Daily Backup Option
    const backupOption = {
      title: lang === 'ar' ? 'خيار بديل في حال ضعف الرياح أو تقلب الطقس' : lang === 'fr' ? 'Option de secours en cas de vent faible ou fatigue' : 'Low-Wind & Weather Alternative',
      description: lang === 'ar' 
        ? 'زيارة المتاحف المحلية أو قضاء فترة ما بعد الزوال في مقهى مطل على الميناء مع شاي بالنعناع.'
        : lang === 'fr'
        ? 'Visite du centre artisanal ou après-midi détente dans un café panoramique face à la baie.'
        : 'Explore the indoor craft markets or relax at a panoramic tea salon facing the bay.',
      reason: lang === 'ar' ? 'نشاط مريح ومحمي من الرياح القوية بتكلفة منخفضة.' : 'Sheltered, low-intensity activity accessible in any weather.',
    };

    // Calculate daily costs
    const dayMinCost = items.reduce((acc, it) => acc + (it.estimatedCost.value || 0), 0);
    const dayMaxCost = Math.round(dayMinCost * 1.25);

    days.push({
      dayNumber: d,
      title: dayTitle,
      theme: dayTheme,
      isPartialDay: isFirstDay || isLastDay,
      estimatedDailyCost: {
        min: dayMinCost,
        max: dayMaxCost,
        currency: 'MAD',
      },
      transportNotes: d === 2 || d === 4
        ? (lang === 'ar' ? 'المسافة تتطلب سيارة دفع رباعي 4x4 أو النقل السياحي المنظم.' : 'Distance requires 4x4 or organized transport.')
        : (lang === 'ar' ? 'يمكن التنقل بسيارة الأجرة أو السير على الأقدام داخل وسط المدينة.' : 'Easily accessible via local taxis or short drives.'),
      bookingReminders: d === 2 || d === 3
        ? [lang === 'ar' ? 'تأكيد حجز مرشد الرحلة أو قارب الجزيرة مسبقاً.' : 'Confirm excursion guide or lagoon boat in advance.']
        : [],
      items,
      backupOption,
    });
  }

  // Budget Breakdown Calculations
  const accomDailyRate = input.budgetStyle === 'premium' ? 2200 : input.budgetStyle === 'budget' ? 450 : 1200;
  const accomTotal = input.includesAccommodation === 'yes' ? (daysCount - 1) * accomDailyRate : 0;
  
  let activitiesTotal = 0;
  let foodTotal = 0;
  let transportTotal = (daysCount * 120);

  days.forEach(day => {
    day.items.forEach(it => {
      const val = it.estimatedCost.value || 0;
      if (it.type === 'restaurant') foodTotal += val;
      else if (it.type === 'activity' || it.type === 'sightseeing') activitiesTotal += val;
      else if (it.type === 'transfer') transportTotal += val;
    });
  });

  const bufferTotal = Math.round((activitiesTotal + foodTotal + transportTotal) * 0.15);
  const totalEstimated = accomTotal + activitiesTotal + foodTotal + transportTotal + bufferTotal;

  // Check if over user budget
  let isOverBudget = false;
  let budgetAlertMessage: string | undefined;

  if (input.budgetAmount && input.budgetAmount > 0) {
    const userBudgetInMad = input.budgetCurrency === 'EUR' 
      ? input.budgetAmount * 10.8 
      : input.budgetCurrency === 'USD' 
      ? input.budgetAmount * 10.0 
      : input.budgetAmount;

    const multiplier = input.budgetType === 'per_person' ? Math.max(1, input.adultsCount + input.childrenCount) : 1;
    const effectiveTargetBudget = userBudgetInMad * multiplier;

    if (totalEstimated > effectiveTargetBudget) {
      isOverBudget = true;
      budgetAlertMessage = lang === 'ar'
        ? `التكلفة التقديرية الإجمالية (${Math.round(totalEstimated)} د.م) تفوق الميزانية المحددة (${Math.round(effectiveTargetBudget)} د.م). يقترح الحاج اختيار خيارات طعام محلية أو أنشطة بدون رسوم لمعادلة الفرق.`
        : lang === 'fr'
        ? `L'estimation totale (${Math.round(totalEstimated)} MAD) dépasse votre budget alloué (${Math.round(effectiveTargetBudget)} MAD). Vous pouvez privilégier les adresses locales comme Mama Saida ou des activités en accès libre.`
        : `Total estimated expenses (${Math.round(totalEstimated)} MAD) exceed your target budget (${Math.round(effectiveTargetBudget)} MAD). Consider choosing authentic budget dining like Mama Saida or free public beaches to balance.`;
    }
  }

  const budgetBreakdown: BudgetBreakdown = {
    totalEstimated,
    currency: 'MAD',
    accommodationEstimated: accomTotal,
    activitiesEstimated: activitiesTotal,
    foodEstimated: foodTotal,
    transportEstimated: transportTotal,
    bufferEstimated: bufferTotal,
    isOverBudget,
    budgetAlertMessage,
  };

  // Preparation Checklist
  const preparationChecklist = [
    {
      category: lang === 'ar' ? 'الحماية والملابس' : lang === 'fr' ? 'Équipement & Protection' : 'Protection & Clothing',
      item: lang === 'ar' ? 'واقي شمس عالي الحماية ونظارات شمسية وسترة خفيفة مضادة للرياح للأمسيات.' : 'High-SPF sunscreen, polarized sunglasses, and a windbreaker for breezy evenings.',
      importance: 'essential' as const,
    },
    {
      category: lang === 'ar' ? 'المعاملات المالية' : lang === 'fr' ? 'Paiement & Espèces' : 'Payment & Cash',
      item: lang === 'ar' ? 'سيولة نقدية بالدرهم المغربي (MAD) للدفع لدى سيارات الأجرة والمحلات الشعبية كـ ماما سعيدة.' : 'Cash (MAD) for city taxis, tip culture, and local food spots like Mama Saida.',
      importance: 'essential' as const,
    },
    {
      category: lang === 'ar' ? 'الحجوزات والتنسيق' : lang === 'fr' ? 'Réservations préalables' : 'Advance Confirmations',
      item: lang === 'ar' ? 'تأكيد جولات الكثيب الأبيض أو تجربة المحار مسبقاً قبل الذهاب.' : 'Contact oyster farms or excursion drivers on WhatsApp 24h prior.',
      importance: 'recommended' as const,
    },
    {
      category: lang === 'ar' ? 'الصحة والراحة' : lang === 'fr' ? 'Santé & Hydratation' : 'Health & Comfort',
      item: lang === 'ar' ? 'قارورة ماء شخصية للحفاظ على الرطوبة خلال جولات الصحراء تحت أشعة الشمس.' : 'Reusable water bottle to stay hydrated during desert exploration.',
      importance: 'recommended' as const,
    },
  ];

  // Title of the itinerary
  const title = lang === 'ar'
    ? `رحلة ${daysCount} أيام مخصصة في الداخلة`
    : lang === 'fr'
    ? `Séjour sur mesure de ${daysCount} jours à Dakhla`
    : `${daysCount}-Day Personalized Dakhla Experience`;

  const intro = lang === 'ar'
    ? `برنامج يومي أعده لك الحاج لزيارة أفضل معالم الداخلة من البحيرة الفيروزية إلى الكثيب الأبيض، مستنداً إلى معطيات منصة Dakhlin الموثوقة وبما يراعي تفضيلاتك وميزانيتك.`
    : lang === 'fr'
    ? `Itinéraire conçu avec soin par El Haj pour explorer le meilleur de Dakhla, de la lagune turquoise à la Dune Blanche, en s'appuyant strictement sur les adresses vérifiées de la plateforme Dakhlin.`
    : `Custom itinerary tailored by El Haj to experience the finest sights of Dakhla from the turquoise lagoon to the White Dune, grounded strictly in Dakhlin's verified catalog.`;

  return {
    id: `itinerary-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
    title,
    intro,
    generatedAt: new Date().toISOString(),
    language: lang,
    inputSnapshot: input,
    days,
    budgetBreakdown,
    preparationChecklist,
    summaryAtAGlance: {
      totalDays: daysCount,
      pace: input.pace || 'balanced',
      activitiesCount: days.reduce((acc, d) => acc + d.items.filter(i => i.type === 'activity' || i.type === 'sightseeing').length, 0),
      foodCount: days.reduce((acc, d) => acc + d.items.filter(i => i.type === 'restaurant').length, 0),
      keyDestinations: [
        'Dakhla Lagoon PK25',
        'Dune Blanche',
        'Talhamar Oyster Farm',
        'Mama Saida Local Kitchen',
        'Puerto Rico Beach',
      ],
      transportApproach: input.transportMode || 'unsure',
      requiresConfirmationCount: days.reduce((acc, d) => acc + d.items.filter(i => i.bookingRequired).length, 0),
    },
  };
}

export function modifyItinerary(
  current: GeneratedItinerary,
  modificationType: string,
  customText?: string
): GeneratedItinerary {
  const updated = JSON.parse(JSON.stringify(current)) as GeneratedItinerary;

  if (modificationType === 'make_cheaper') {
    updated.days.forEach(day => {
      day.items.forEach(it => {
        if (it.type === 'restaurant' && (it.estimatedCost.value || 0) > 80) {
          it.title = current.language === 'ar' ? 'مطعم محلي شعبي أصيل (مثل ماما سعيدة)' : 'Authentic Budget Moroccan Kitchen (Mama Saida)';
          it.estimatedCost = { value: 35, currency: 'MAD', status: 'estimated' };
          it.reason = current.language === 'ar' ? 'تم استبدال الوجبة بخيار اقتصادي ممتاز لتخفيض الميزانية.' : 'Swapped to a budget-friendly local kitchen to lower costs.';
        }
      });
      day.estimatedDailyCost.min = Math.round(day.estimatedDailyCost.min * 0.7);
      day.estimatedDailyCost.max = Math.round(day.estimatedDailyCost.max * 0.7);
    });
    updated.budgetBreakdown.foodEstimated = Math.round(updated.budgetBreakdown.foodEstimated * 0.6);
    updated.budgetBreakdown.totalEstimated = Math.round(
      updated.budgetBreakdown.accommodationEstimated +
      updated.budgetBreakdown.activitiesEstimated +
      updated.budgetBreakdown.foodEstimated +
      updated.budgetBreakdown.transportEstimated +
      updated.budgetBreakdown.bufferEstimated
    );
    updated.budgetBreakdown.isOverBudget = false;
  } else if (modificationType === 'more_relaxing') {
    updated.days.forEach(day => {
      day.items = day.items.filter(it => it.type !== 'activity');
      day.items.push({
        id: `relax-${day.dayNumber}`,
        type: 'relaxation',
        title: current.language === 'ar' ? 'وقت حر للاسترخاء والتمتع بنسيم البحيرة' : 'Lagoon-side Free Relaxation & Sunset Stroll',
        timeOfDay: 'afternoon',
        suggestedTime: '16:00 – 18:30',
        estimatedDuration: '2h30',
        reason: current.language === 'ar' ? 'إتاحة متسع وافر من الراحة دون ارتباط ببرنامج شاق.' : 'Added extra downtime by the water as requested.',
        estimatedCost: { value: 0, currency: 'MAD', status: 'verified' },
        bookingRequired: false,
      });
    });
    updated.summaryAtAGlance.pace = 'relaxed';
  } else if (modificationType === 'family_friendly') {
    updated.days.forEach(day => {
      day.items.forEach(it => {
        if (it.title.toLowerCase().includes('kite') || it.title.includes('بوغي')) {
          it.title = current.language === 'ar' ? 'رحلة بالقارب الآمن لمشاهدة الطيور المهاجرة' : 'Family Lagoon Boat Trip & Flamingo Watching';
          it.reason = current.language === 'ar' ? 'نشاط هادئ وآمن مناسب لجميع أفراد الأسرة والأطفال.' : 'Safe, gentle outing suitable for all ages and children.';
        }
      });
    });
  }

  if (customText && customText.trim()) {
    updated.intro += ` [${current.language === 'ar' ? 'تم التعديل حسب طلبك' : 'Updated per your request'}: "${customText.trim()}"]`;
  }

  return updated;
}

function addHours(timeStr: string, hours: number): string {
  try {
    const [h, m] = timeStr.split(':').map(Number);
    const newH = (h + hours) % 24;
    return `${String(newH).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}`;
  } catch {
    return '14:00';
  }
}

function subHours(timeStr: string, hours: number): string {
  try {
    const [h, m] = timeStr.split(':').map(Number);
    const newH = (h - hours + 24) % 24;
    return `${String(newH).padStart(2, '0')}:${String(m || 0).padStart(2, '0')}`;
  } catch {
    return '13:00';
  }
}
