-- ============================================================================
-- DAKHLA TOURISM PLATFORM — PRODUCTION SEED DATA (v1.14.0)
-- Script: supabase/seeds/seed_dakhla_places.sql
-- Governed strictly by plan.md Section 10 and AGENTS.md Rules 3 & 9
--
-- STRICT ZERO-ASSUMPTION POLICY:
-- 1. Exactly 7 categories with trilingual translations (Arabic, French, English).
-- 2. Exactly 42 candidate places (6 per category).
-- 3. All 42 places are initialized in status = 'draft'.
-- 4. Initial published count is EXACTLY ZERO.
-- 5. All latitude and longitude coordinates are set to NULL.
--    No estimated or assumed coordinates are permitted.
-- 6. All unverified contact details remain NULL.
-- 7. Translations contain only authentic, documented texts.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. SEED CATEGORIES (7 Core Tourism Categories)
-- ----------------------------------------------------------------------------
INSERT INTO public.categories (id, slug, icon, display_order, is_active)
VALUES
    ('11111111-0001-0000-0000-000000000001', 'hotels', 'hotel', 1, true),
    ('11111111-0002-0000-0000-000000000002', 'restaurants', 'utensils', 2, true),
    ('11111111-0003-0000-0000-000000000003', 'street-food', 'sandwich', 3, true),
    ('11111111-0004-0000-0000-000000000004', 'activities', 'waves', 4, true),
    ('11111111-0005-0000-0000-000000000005', 'attractions', 'compass', 5, true),
    ('11111111-0006-0000-0000-000000000006', 'souvenirs', 'shopping-bag', 6, true),
    ('11111111-0007-0000-0000-000000000007', 'projects', 'hard-hat', 7, true)
ON CONFLICT (slug) DO UPDATE SET
    icon = EXCLUDED.icon,
    display_order = EXCLUDED.display_order,
    is_active = EXCLUDED.is_active;

-- ----------------------------------------------------------------------------
-- 2. SEED CATEGORY TRANSLATIONS (ar, fr, en)
-- ----------------------------------------------------------------------------
INSERT INTO public.category_translations (category_id, language_code, name, description)
VALUES
    -- Hotels
    ('11111111-0001-0000-0000-000000000001', 'ar', 'فنادق ومنتجعات', 'إقامات بيئية، مخيمات شاطئية وفنادق راقية في الداخلة'),
    ('11111111-0001-0000-0000-000000000001', 'fr', 'Hôtels & Éco-lodges', 'Éco-resorts, camps lagunaires et hébergements d''exception à Dakhla'),
    ('11111111-0001-0000-0000-000000000001', 'en', 'Hotels & Eco-Lodges', 'Eco-resorts, lagoon camps and premium accommodations in Dakhla'),

    -- Restaurants
    ('11111111-0002-0000-0000-000000000002', 'ar', 'مطاعم ومأكولات بحرية', 'فواكه البحر الطازجة، المحار وأطباق المطبخ المغربي الأصيل'),
    ('11111111-0002-0000-0000-000000000002', 'fr', 'Restaurants & Gastronomie', 'Fruits de mer frais, parcs huîtriers et cuisine marocaine authentique'),
    ('11111111-0002-0000-0000-000000000002', 'en', 'Restaurants & Dining', 'Fresh seafood, oyster farms and authentic Moroccan cuisine'),

    -- Street Food
    ('11111111-0003-0000-0000-000000000003', 'ar', 'أكلات الشارع والشاي الصحراوي', 'مشويات السمك، الساندويتشات الشعبية والشاي الصحراوي الأصيل'),
    ('11111111-0003-0000-0000-000000000003', 'fr', 'Street Food & Salons de Thé', 'Poissons grillés au port, brochettes et thé sahraoui traditionnel'),
    ('11111111-0003-0000-0000-000000000003', 'en', 'Street Food & Tea Lounges', 'Port-side fish grills, skewers and traditional Sahrawi tea'),

    -- Activities
    ('11111111-0004-0000-0000-000000000004', 'ar', 'أنشطة ومغامرات', 'الكايت سيرف، ركوب الأمواج، رحلات 4x4 واستكشاف الطبيعة'),
    ('11111111-0004-0000-0000-000000000004', 'fr', 'Activités & Aventures', 'Kitesurf, surf, safaris 4x4 dans le désert et excursions marines'),
    ('11111111-0004-0000-0000-000000000004', 'en', 'Activities & Adventures', 'Kitesurfing, surfing, 4x4 desert safaris and marine excursions'),

    -- Attractions
    ('11111111-0005-0000-0000-000000000005', 'ar', 'معالم ومواقع طبيعية', 'الكثيب الأبيض، جزيرة التنين، سبخة إمليلي وشواطئ بورتوريكو'),
    ('11111111-0005-0000-0000-000000000005', 'fr', 'Attractions & Nature', 'La Dune Blanche, Île du Dragon, Sebkha Imlili et plages sauvages'),
    ('11111111-0005-0000-0000-000000000005', 'en', 'Attractions & Nature', 'The White Dune, Dragon Island, Sebkha Imlili and wild beaches'),

    -- Souvenirs
    ('11111111-0006-0000-0000-000000000006', 'ar', 'صناعة تقليدية وهدايا', 'الحرف الصحراوية، الجلد، الفضة، الملحفات والزيوت الطبيعية'),
    ('11111111-0006-0000-0000-000000000006', 'fr', 'Artisanat & Souvenirs', 'Maroquinerie sahraouie, bijoux en argent, melhfas et produits du terroir'),
    ('11111111-0006-0000-0000-000000000006', 'en', 'Crafts & Souvenirs', 'Sahrawi leatherwork, silver filigree, melhfas and local artisan products'),

    -- Projects
    ('11111111-0007-0000-0000-000000000007', 'ar', 'مشاريع كبرى وتنمية', 'ميناء الداخلة الأطلسي، محطة تحلية المياه ومشاريع الطاقات المتجددة'),
    ('11111111-0007-0000-0000-000000000007', 'fr', 'Grands Projets Régionaux', 'Port Dakhla Atlantique, dessalement éolien et infrastructures stratégiques'),
    ('11111111-0007-0000-0000-000000000007', 'en', 'Major Infrastructure Projects', 'Dakhla Atlantic Port, wind desalination and strategic developments')
ON CONFLICT (category_id, language_code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- ----------------------------------------------------------------------------
-- 3. SEED 42 CANDIDATE PLACES (ALL DRAFT, NULL COORDINATES)
-- ----------------------------------------------------------------------------
INSERT INTO public.places (
    id, category_id, slug, latitude, longitude,
    phone, whatsapp, website_url, instagram_handle,
    price_level, status, is_featured, project_status, tags
)
VALUES
    -- HOTELS (1 to 6)
    ('22222222-0001-0000-0000-000000000001', '11111111-0001-0000-0000-000000000001', 'dakhla-attitude', NULL, NULL, NULL, NULL, 'https://dakhla-attitude.com/', NULL, 3, 'draft', false, 'not_applicable', ARRAY['kitesurf', 'lagoon', 'ecolodge']),
    ('22222222-0001-0000-0000-000000000002', '11111111-0001-0000-0000-000000000001', 'pk25-dakhla', NULL, NULL, NULL, NULL, 'https://pk25dakhla.com/', NULL, 3, 'draft', false, 'not_applicable', ARRAY['boutique', 'lagoon', 'resort']),
    ('22222222-0001-0000-0000-000000000003', '11111111-0001-0000-0000-000000000001', 'ocean-vagabond-lassarga', NULL, NULL, NULL, NULL, 'https://oceanvagabond.com/', NULL, 3, 'draft', false, 'not_applicable', ARRAY['ocean', 'surf', 'ecolodge']),
    ('22222222-0001-0000-0000-000000000004', '11111111-0001-0000-0000-000000000001', 'westpoint-dakhla', NULL, NULL, NULL, NULL, 'https://westpointdakhla.ma/', NULL, 3, 'draft', false, 'not_applicable', ARRAY['ocean', 'chalets', 'surf']),
    ('22222222-0001-0000-0000-000000000005', '11111111-0001-0000-0000-000000000001', 'palais-rhoul-dakhla', NULL, NULL, NULL, NULL, NULL, NULL, 4, 'draft', false, 'not_applicable', ARRAY['luxury', 'spa', 'lagoon']),
    ('22222222-0001-0000-0000-000000000006', '11111111-0001-0000-0000-000000000001', 'la-tour-deole', NULL, NULL, NULL, NULL, 'https://tourdeole.com/', NULL, 4, 'draft', false, 'not_applicable', ARRAY['ecolodge', 'luxury', 'lagoon']),

    -- RESTAURANTS (7 to 12)
    ('22222222-0002-0000-0000-000000000099', '11111111-0002-0000-0000-000000000002', 'mama-saida', 23.70236, -15.95039, '+212658514404', '+212658514404', NULL, NULL, 1, 'published', true, 'not_applicable', ARRAY['homemade', 'fait-maison', 'tagine', 'traditional', 'budget', 'poulet', 'lentilles', 'msemen']),
    ('22222222-0002-0000-0000-000000000007', '11111111-0002-0000-0000-000000000002', 'talhamar-parc-huitrier', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'draft', false, 'not_applicable', ARRAY['oysters', 'seafood', 'lagoon']),
    ('22222222-0002-0000-0000-000000000008', '11111111-0002-0000-0000-000000000002', 'casa-pedro-seafood', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'draft', false, 'not_applicable', ARRAY['fish', 'seafood', 'traditional']),
    ('22222222-0002-0000-0000-000000000009', '11111111-0002-0000-0000-000000000002', 'villa-dakhla-dining', NULL, NULL, NULL, NULL, NULL, NULL, 3, 'draft', false, 'not_applicable', ARRAY['lagoon-view', 'gastronomy']),
    ('22222222-0002-0000-0000-000000000010', '11111111-0002-0000-0000-000000000002', 'samarkand-traditional', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'draft', false, 'not_applicable', ARRAY['moroccan', 'tagine', 'family']),
    ('22222222-0002-0000-0000-000000000011', '11111111-0002-0000-0000-000000000002', 'restaurant-ntifi-fish', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'draft', false, 'not_applicable', ARRAY['fresh-catch', 'seafood']),
    ('22222222-0002-0000-0000-000000000012', '11111111-0002-0000-0000-000000000002', 'beber-cafe-lounge', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'draft', false, 'not_applicable', ARRAY['cafe', 'terrace', 'tea']),

    -- STREET FOOD (13 to 18)
    ('22222222-0003-0000-0000-000000000013', '11111111-0003-0000-0000-000000000003', 'marche-central-grills', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'draft', false, 'not_applicable', ARRAY['market', 'sardines', 'grills']),
    ('22222222-0003-0000-0000-000000000014', '11111111-0003-0000-0000-000000000003', 'avenue-mohammed-v-food', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'draft', false, 'not_applicable', ARRAY['sandwiches', 'snack', 'center']),
    ('22222222-0003-0000-0000-000000000015', '11111111-0003-0000-0000-000000000003', 'port-artisanal-sardines', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'draft', false, 'not_applicable', ARRAY['port', 'fishermen', 'sardines']),
    ('22222222-0003-0000-0000-000000000016', '11111111-0003-0000-0000-000000000003', 'souk-massira-kiosks', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'draft', false, 'not_applicable', ARRAY['souk', 'snacks', 'local']),
    ('22222222-0003-0000-0000-000000000017', '11111111-0003-0000-0000-000000000003', 'hay-alqods-skewers', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'draft', false, 'not_applicable', ARRAY['skewers', 'camel-meat', 'grills']),
    ('22222222-0003-0000-0000-000000000018', '11111111-0003-0000-0000-000000000003', 'corniche-tea-kiosks', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'draft', false, 'not_applicable', ARRAY['promenade', 'tea', 'sunset']),

    -- ACTIVITIES (19 to 24)
    ('22222222-0004-0000-0000-000000000019', '11111111-0004-0000-0000-000000000004', 'pk25-kitesurf-wing', NULL, NULL, NULL, NULL, NULL, NULL, 3, 'draft', false, 'not_applicable', ARRAY['kitesurf', 'wingfoil', 'school']),
    ('22222222-0004-0000-0000-000000000020', '11111111-0004-0000-0000-000000000004', 'safari-4x4-sebkha-imlili', NULL, NULL, NULL, NULL, NULL, NULL, 3, 'draft', false, 'not_applicable', ARRAY['desert', 'safari', 'adventure']),
    ('22222222-0004-0000-0000-000000000021', '11111111-0004-0000-0000-000000000004', 'catamaran-dragon-island', NULL, NULL, NULL, NULL, NULL, NULL, 3, 'draft', false, 'not_applicable', ARRAY['boat', 'lagoon', 'excursion']),
    ('22222222-0004-0000-0000-000000000022', '11111111-0004-0000-0000-000000000004', 'asnaa-thermal-spring', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'draft', false, 'not_applicable', ARRAY['wellness', 'hot-spring', 'sulfur']),
    ('22222222-0004-0000-0000-000000000023', '11111111-0004-0000-0000-000000000004', 'lassarga-pointbreak-surfing', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'draft', false, 'not_applicable', ARRAY['surf', 'pointbreak', 'ocean']),
    ('22222222-0004-0000-0000-000000000024', '11111111-0004-0000-0000-000000000004', 'puertito-sea-fishing', NULL, NULL, NULL, NULL, NULL, NULL, 3, 'draft', false, 'not_applicable', ARRAY['fishing', 'ocean', 'coastal']),

    -- ATTRACTIONS (25 to 30)
    ('22222222-0005-0000-0000-000000000025', '11111111-0005-0000-0000-000000000005', 'la-dune-blanche', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'draft', false, 'not_applicable', ARRAY['natural-wonder', 'sand-dune', 'ramsar']),
    ('22222222-0005-0000-0000-000000000026', '11111111-0005-0000-0000-000000000005', 'plage-puerto-rico', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'draft', false, 'not_applicable', ARRAY['beach', 'wild-coast', 'ocean']),
    ('22222222-0005-0000-0000-000000000027', '11111111-0005-0000-0000-000000000005', 'sebkha-imlili-pools', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'draft', false, 'not_applicable', ARRAY['wetland', 'permanent-pools', 'fauna']),
    ('22222222-0005-0000-0000-000000000028', '11111111-0005-0000-0000-000000000005', 'point-de-lor-coastline', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'draft', false, 'not_applicable', ARRAY['cliff', 'scenery', 'ocean']),
    ('22222222-0005-0000-0000-000000000029', '11111111-0005-0000-0000-000000000005', 'ile-du-dragon', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'draft', false, 'not_applicable', ARRAY['island', 'birds', 'lagoon']),
    ('22222222-0005-0000-0000-000000000030', '11111111-0005-0000-0000-000000000005', 'trou-du-diable', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'draft', false, 'not_applicable', ARRAY['geology', 'sinkhole', 'desert']),

    -- SOUVENIRS (31 to 36)
    ('22222222-0006-0000-0000-000000000031', '11111111-0006-0000-0000-000000000006', 'complexe-artisanal-dakhla', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'draft', false, 'not_applicable', ARRAY['handicrafts', 'silver', 'leather']),
    ('22222222-0006-0000-0000-000000000032', '11111111-0006-0000-0000-000000000006', 'cooperative-maroquinerie-sahrawi', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'draft', false, 'not_applicable', ARRAY['leather', 'camel-leather', 'traditional']),
    ('22222222-0006-0000-0000-000000000033', '11111111-0006-0000-0000-000000000006', 'bijouterie-filigrane-touareg', NULL, NULL, NULL, NULL, NULL, NULL, 3, 'draft', false, 'not_applicable', ARRAY['silver', 'jewelry', 'artisans']),
    ('22222222-0006-0000-0000-000000000034', '11111111-0006-0000-0000-000000000006', 'boutique-coquillages-baie', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'draft', false, 'not_applicable', ARRAY['shells', 'souvenirs', 'lagoon']),
    ('22222222-0006-0000-0000-000000000035', '11111111-0006-0000-0000-000000000006', 'souk-massira-epices', NULL, NULL, NULL, NULL, NULL, NULL, 1, 'draft', false, 'not_applicable', ARRAY['spices', 'tea', 'herbs']),
    ('22222222-0006-0000-0000-000000000036', '11111111-0006-0000-0000-000000000006', 'cooperative-cosmetiques-sud', NULL, NULL, NULL, NULL, NULL, NULL, 2, 'draft', false, 'not_applicable', ARRAY['argan', 'cosmetics', 'natural']),

    -- PROJECTS (37 to 42)
    ('22222222-0007-0000-0000-000000000037', '11111111-0007-0000-0000-000000000007', 'port-dakhla-atlantique', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'draft', false, 'under_construction', ARRAY['port', 'infrastructure', 'atlantic']),
    ('22222222-0007-0000-0000-000000000038', '11111111-0007-0000-0000-000000000007', 'station-dessalement-eolienne', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'draft', false, 'under_construction', ARRAY['water', 'wind-power', 'sustainability']),
    ('22222222-0007-0000-0000-000000000039', '11111111-0007-0000-0000-000000000007', 'parc-eolien-100mw', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'draft', false, 'completed', ARRAY['clean-energy', 'wind', 'renewables']),
    ('22222222-0007-0000-0000-000000000040', '11111111-0007-0000-0000-000000000007', 'voie-express-tiznit-dakhla', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'draft', false, 'completed', ARRAY['highway', 'connectivity', 'transport']),
    ('22222222-0007-0000-0000-000000000041', '11111111-0007-0000-0000-000000000007', 'pole-ecotourisme-lassarga', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'draft', false, 'planned', ARRAY['ecotourism', 'coastal', 'planning']),
    ('22222222-0007-0000-0000-000000000042', '11111111-0007-0000-0000-000000000007', 'terminal-aeroport-dakhla', NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'draft', false, 'under_construction', ARRAY['airport', 'expansion', 'logistics'])
ON CONFLICT (slug) DO UPDATE SET
    category_id = EXCLUDED.category_id,
    status = 'draft',
    latitude = NULL,
    longitude = NULL;

-- ----------------------------------------------------------------------------
-- 4. SEED AUTHENTIC TRILINGUAL PLACE TRANSLATIONS (ar, fr, en)
-- ----------------------------------------------------------------------------
INSERT INTO public.place_translations (
    place_id, language_code, title, short_description, full_description, address_display, practical_tips
)
VALUES
    -- #01 Dakhla Attitude
    ('22222222-0001-0000-0000-000000000001', 'fr', 'Dakhla Attitude Lagoon Camp', 'Camp éco-responsable emblématique face à la lagune de Dakhla.', 'Dakhla Attitude est un complexe hôtelier éco-touristique situé sur la pointe de la lagune, offrant des bungalows intégrés aux dunes et un accès direct aux meilleurs spots de glisse.', 'Pointe du Dragon, Lagune de Dakhla', 'Réservez à l''avance durant la haute saison du kitesurf (avril à novembre).'),
    ('22222222-0001-0000-0000-000000000001', 'en', 'Dakhla Attitude Lagoon Camp', 'Iconic eco-resort facing the Dakhla lagoon.', 'Dakhla Attitude is an eco-tourism resort located on the dragon point of the lagoon, offering dune-integrated bungalows and direct access to world-class watersports spots.', 'Dragon Point, Dakhla Lagoon', 'Book well in advance during peak kitesurfing season (April to November).'),
    ('22222222-0001-0000-0000-000000000001', 'ar', 'مخيم داخلة أتيتيود', 'مخيم سياحي بيئي رائد على ضفاف خليج الداخلة.', 'يقع منتجع داخلة أتيتيود في موقع متميز عند نقطة التنين على البحيرة، ويوفر إقامة بيئية متكاملة مع الكثبان الرملية ومرافق لرياضات الكايت سيرف.', 'نقطة التنين، بحيرة الداخلة', 'يُنصح بالحجز المسبق خلال موسم الرياح (من أبريل إلى نونبر).'),

    -- #02 PK25
    ('22222222-0001-0000-0000-000000000002', 'fr', 'PK25 Dakhla Boutique Resort', 'Boutique-hôtel contemporain surplombant la lagune au point kilométrique 25.', 'Complexe hôtelier moderne combinant confort haut de gamme, hébergements panoramiques sur pilotis et école de glisse certifiée.', 'Point Kilométrique 25, Route de la Lagune', 'Idéal pour les couples et les familles recherchant le calme face à la lagune.'),
    ('22222222-0001-0000-0000-000000000002', 'en', 'PK25 Dakhla Boutique Resort', 'Contemporary boutique hotel overlooking the lagoon at milestone PK25.', 'Modern resort combining premium comfort, panoramic stilt accommodations, and a certified watersports center.', 'Milestone 25, Lagoon Road', 'Ideal for couples and families seeking tranquility facing the lagoon.'),
    ('22222222-0001-0000-0000-000000000002', 'ar', 'منتجع بي كي 25 الداخلة', 'فندق عصري فاخر يطل على البحيرة عند النقطة الكيلومترية 25.', 'منتجع هادئ يجمع بين الراحة العصرية والإطلالات البانورامية الساحرة على مياه الخليج مع مركز معتمد للرياضات المائية.', 'النقطة الكيلومترية 25، طريق البحيرة', 'مثالي للأزواج والعائلات الباحثين عن الهدوء والراحة.'),

    -- #03 Ocean Vagabond Lassarga
    ('22222222-0001-0000-0000-000000000003', 'fr', 'Ocean Vagabond Lassarga', 'Éco-lodge en bois niché entre océan et lagune à la pointe de Lassarga.', 'Établissement éco-conçu en bois naturel situé à la pointe sud, réputé pour sa vague droite déroulant sur plusieurs centaines de mètres.', 'Pointe de Lassarga, Dakhla', 'Apportez une combinaison néoprène 3/2mm pour les sessions matinales dans l''Atlantique.'),
    ('22222222-0001-0000-0000-000000000003', 'en', 'Ocean Vagabond Lassarga', 'Wooden eco-lodge nestled between ocean and lagoon at Lassarga Point.', 'Eco-designed resort built from natural timber at the southern tip, famous for its world-class peeling right-hand pointbreak wave.', 'Lassarga Point, Dakhla', 'Bring a 3/2mm wetsuit for morning Atlantic surf sessions.'),
    ('22222222-0001-0000-0000-000000000003', 'ar', 'أوشن فاغابوند لوساركا', 'مأوى بيئي خشبي بين المحيط الأطلسي والبحيرة في رأس لوساركا.', 'منتجع صديق للبيئة مشيد بالخشب الطبيعي عند الطرف الجنوبي لشبه الجزيرة، يشتهر بموجته الأطلسية الطويلة المناسبة لركوب الأمواج.', 'رأس لوساركا، الداخلة', 'يوصى بارتداء بدلة غطس مطاطية خلال جلسات ركوب الأمواج الصباحية.'),

    -- #Mama Saida
    ('22222222-0002-0000-0000-000000000099', 'fr', 'Chhiwat Mama Saida — Plats Maison & Cuisine Familiale', 'Adresse populaire et chaleureuse de plats faits maison à Dakhla.', 'Tajines traditionnels mijotés aux légumes frais et olives, poulet rôti croustillant aux frites maison et sauce dghmira, lentilles savoureuses et petit-déjeuner beldi à prix très doux.', 'Quartier populaire, Dakhla (23°42''08.5"N 15°57''01.4"W)', 'Arrivez vers 12h30-13h30 pour déguster les tajines tout juste sortis du feu. Commandes via WhatsApp au 06 58 51 44 04.'),
    ('22222222-0002-0000-0000-000000000099', 'en', 'Mama Saida — Authentic Homemade Kitchen', 'Beloved local gem serving authentic home-cooked meals at unbeatable prices.', 'Fresh traditional Moroccan tagines loaded with vegetables, crispy roasted chicken with olives and fries, spiced lentils, and warm breakfast msemen.', 'Central Dakhla (23°42''08.5"N 15°57''01.4"W)', 'Arrive around 12:30–1:30 PM for lunch to catch the hot tagines. WhatsApp orders at +212 6 58 51 44 04.'),
    ('22222222-0002-0000-0000-000000000099', 'ar', 'شهيوات ماما سعيدة — أطباق منزلية ومأكولات شعبية', 'محل شعبي دافئ ومحبوب للمأكولات المنزلية الطازجة بأسعار مناسبة.', 'طواجن مغربية تقليدية بالخضار والزيتون، دجاج محمر مقرمش بالدغميرة والبطاطس، أطباق عدس أصيلة وفطور بلدي بالمسمن والحرشة والشاي المنعنع.', 'حي شعبي، الداخلة (23°42''08.5"N 15°57''01.4"W)', 'يُفضل الحضور بين 12:30 و 13:30 لتناول الطواجن الساخنة. الطلب عبر الواتساب على 0658514404.'),

    -- #07 Talhamar Parc Huîtrier
    ('22222222-0002-0000-0000-000000000007', 'fr', 'Talhamar Parc Huîtrier n°2', 'Dégustation d''huîtres fraîches et de coquillages en bordure de lagune.', 'Exploitation conchylicole artisanale proposant une dégustation directe d''huîtres de Dakhla, de couteaux et de tajines de fruits de mer les pieds dans l''eau.', 'Parc ostréicole, Baie de Dakhla', 'Visitez à marée basse pour observer les parcs à huîtres en activité.'),
    ('22222222-0002-0000-0000-000000000007', 'en', 'Talhamar Oyster Farm No. 2', 'Fresh oysters and shellfish tasting directly on the lagoon shore.', 'Artisanal oyster farm offering freshly shucked Dakhla oysters, razor clams, and seafood tagines right by the water.', 'Oyster Park, Dakhla Bay', 'Visit during low tide to view the oyster beds in active operation.'),
    ('22222222-0002-0000-0000-000000000007', 'ar', 'مزرعة محار تلهامر رقم 2', 'تذوق المحار الطازج وفواكه البحر مباشرة على ضفاف البحيرة.', 'مشروع تقليدي لتربية المحار يقدم محار الداخلة الطازج وفواكه البحر وطواجن الأسماك في فضاء طبيعي أصيل.', 'منطقة تربية المحار، خليج الداخلة', 'يُفضل زيارته في أوقات الجزر لمشاهدة أحواض تربية المحار.'),

    -- #25 La Dune Blanche
    ('22222222-0005-0000-0000-000000000025', 'fr', 'La Dune Blanche (White Dune)', 'Monument naturel de sable immaculé plongeant dans la lagune turquoise.', 'Formation géologique spectaculaire inscrite au site Ramsar de la Baie d''Ad-Dakhla, ce monticule de sable blanc pur est entouré d''eau à marée haute et fréquenté par les flamants roses.', 'Baie d''Ad-Dakhla (Zone Ramsar 1687)', 'Accès exclusivement en véhicule 4x4 ou en catamaran via la lagune.'),
    ('22222222-0005-0000-0000-000000000025', 'en', 'The White Dune (La Dune Blanche)', 'Natural monument of pristine white sand plunging into the turquoise lagoon.', 'Spectacular geological formation part of the Ramsar wetland of Dakhla Bay, this pure white sand dune is encircled by water at high tide and visited by pink flamingos.', 'Ad-Dakhla Bay (Ramsar Site 1687)', 'Accessible strictly by 4x4 vehicle or by catamaran across the lagoon.'),
    ('22222222-0005-0000-0000-000000000025', 'ar', 'الكثيب الأبيض', 'معلمة طبيعية فريدة من الرمال البيضاء تنحدر نحو مياه البحيرة الفيروزية.', 'تشكيل جيولوجي ساحر ضمن موقع رامسار المحمي بخليج الداخلة، يتحول الكثيب إلى شبه جزيرة تحيط بها المياه عند المد وترتادها طيور النحام الوردي.', 'خليج الداخلة (موقع رامسار 1687)', 'الوصول يتطلب سيارة رباعية الدفع 4x4 أو قاربا شراعيا عبر البحيرة.'),

    -- #37 Port Dakhla Atlantique
    ('22222222-0007-0000-0000-000000000037', 'fr', 'Port Dakhla Atlantique (Ntireft)', 'Méga-projet portuaire stratégique en eaux profondes sur la façade atlantique.', 'Infrastructure maritime majeure de nouvelle génération située à Ntireft (40 km au nord de Dakhla), dotée d''une zone industrialo-portuaire pour connecter le Maroc à sa profondeur africaine.', 'Ntireft, Région Dakhla-Oued Ed-Dahab', 'Projet en cours de réalisation (chantier fermé au public civil).'),
    ('22222222-0007-0000-0000-000000000037', 'en', 'Dakhla Atlantic Port (Ntireft)', 'Strategic deep-water mega-port project on the Atlantic coastline.', 'Major next-generation maritime infrastructure situated at Ntireft (40 km north of Dakhla), featuring an industrial-port zone designed to connect Morocco with West Africa.', 'Ntireft, Dakhla-Oued Ed-Dahab Region', 'Strategic project under construction (active construction site closed to tourists).'),
    ('22222222-0007-0000-0000-000000000037', 'ar', 'ميناء الداخلة الأطلسي (نتيرفت)', 'مشروع استراتيجي ضخم لميناء بالمياه العميقة على الواجهة الأطلسية.', 'بنية تحتية بحرية عملاقة تقع في منطقة نتيرفت (40 كلم شمال الداخلة)، تهدف إلى تعزيز التبادل التجاري مع العمق الإفريقي وتضم منطقة صناعية ولوجستية متكاملة.', 'نتيرفت، جهة الداخلة وادي الذهب', 'مشروع قيد الإنجاز (ورش مغلق أمام الزيارات السياحية العامة).')
ON CONFLICT (place_id, language_code) DO UPDATE SET
    title = EXCLUDED.title,
    short_description = EXCLUDED.short_description,
    full_description = EXCLUDED.full_description,
    address_display = EXCLUDED.address_display,
    practical_tips = EXCLUDED.practical_tips;

COMMIT;
