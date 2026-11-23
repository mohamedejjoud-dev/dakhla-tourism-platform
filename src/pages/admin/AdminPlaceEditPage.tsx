// src/pages/admin/AdminPlaceEditPage.tsx
// Comprehensive place content editor with trilingual AR/FR/EN tabs, coordinates validator, and WebP image uploader

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  getAdminPlaceById, 
  createAdminPlace, 
  updateAdminPlace, 
  listAdminCategories, 
  AdminCategoryItem,
  AdminPlaceInput,
  AdminPlaceTranslationInput,
  AdminPlaceImageInput
} from '@/services/adminService';
import { uploadPlaceImage } from '@/utils/imageOptimizer';
import { PlaceStatus, ProjectStatus, SupportedLanguage } from '@/types/database';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  Trash2, 
  Star, 
  AlertTriangle,
  Globe,
  Phone,
  Compass
} from 'lucide-react';

export const AdminPlaceEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<AdminCategoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<SupportedLanguage>('en');

  // Place core fields
  const [categoryId, setCategoryId] = useState('');
  const [slug, setSlug] = useState('');
  const [latitude, setLatitude] = useState<string>('');
  const [longitude, setLongitude] = useState<string>('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [priceLevel, setPriceLevel] = useState<number>(2);
  const [status, setStatus] = useState<PlaceStatus>('draft');
  const [isFeatured, setIsFeatured] = useState(false);
  const [projectStatus, setProjectStatus] = useState<ProjectStatus>('not_applicable');
  const [tagsInput, setTagsInput] = useState('');

  // Trilingual Translations
  const [translations, setTranslations] = useState<Record<SupportedLanguage, AdminPlaceTranslationInput>>({
    ar: { language_code: 'ar', title: '', short_description: '', full_description: '', address_display: '', practical_tips: '' },
    fr: { language_code: 'fr', title: '', short_description: '', full_description: '', address_display: '', practical_tips: '' },
    en: { language_code: 'en', title: '', short_description: '', full_description: '', address_display: '', practical_tips: '' },
  });

  // Images
  const [images, setImages] = useState<AdminPlaceImageInput[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    listAdminCategories().then((cats) => {
      setCategories(cats);
      if (!isEditing && cats.length > 0) {
        setCategoryId(cats[0].id);
      }
    });

    if (isEditing && id) {
      getAdminPlaceById(id)
        .then((place) => {
          if (!place) {
            setFormError('Place not found');
            return;
          }
          setCategoryId(place.category_id);
          setSlug(place.slug);
          setLatitude(place.latitude !== null ? String(place.latitude) : '');
          setLongitude(place.longitude !== null ? String(place.longitude) : '');
          setPhone(place.phone || '');
          setWhatsapp(place.whatsapp || '');
          setWebsiteUrl(place.website_url || '');
          setInstagramHandle(place.instagram_handle || '');
          setPriceLevel(place.price_level || 2);
          setStatus(place.status);
          setIsFeatured(place.is_featured);
          setProjectStatus(place.project_status || 'not_applicable');
          setTagsInput(Array.isArray(place.tags) ? place.tags.join(', ') : '');
          setTranslations(place.translations);
          setImages(place.images || []);
        })
        .catch((err) => setFormError(err.message))
        .finally(() => setLoading(false));
    }
  }, [id, isEditing]);

  const handleTranslationChange = (
    lang: SupportedLanguage,
    field: keyof AdminPlaceTranslationInput,
    value: string
  ) => {
    setTranslations((prev) => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        [field]: value,
      },
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    setFormError(null);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await uploadPlaceImage(file, slug || 'place');
        setImages((prev) => [
          ...prev,
          {
            storage_path: res.storagePath,
            alt_text: translations.en.title || 'Dakhla place photo',
            is_primary: prev.length === 0,
            display_order: prev.length,
          },
        ]);
      }
    } catch (err: any) {
      setFormError(err.message || 'Image upload failed');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const setPrimaryImage = (index: number) => {
    setImages((prev) =>
      prev.map((img, idx) => ({
        ...img,
        is_primary: idx === index,
      }))
    );
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const next = prev.filter((_, idx) => idx !== index);
      if (next.length > 0 && !next.some((img) => img.is_primary)) {
        next[0].is_primary = true;
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    // 1. Basic validation
    if (!slug.trim()) {
      setFormError('Slug is required');
      return;
    }
    if (!categoryId) {
      setFormError('Category is required');
      return;
    }

    const latNum = latitude.trim() !== '' ? parseFloat(latitude) : null;
    const lngNum = longitude.trim() !== '' ? parseFloat(longitude) : null;

    // 2. Strict published coordinates constraint validation (chk_places_published_coords)
    if (status === 'published' && (latNum === null || lngNum === null)) {
      setFormError(
        t(
          'admin.error_coords_required_for_publish',
          'GPS coordinates (Latitude & Longitude) are mandatory before publishing a place to the live catalog.'
        )
      );
      return;
    }

    // 3. Translations check: At least one language must have a title
    const hasAtLeastOneTitle = Object.values(translations).some((t) => t.title && t.title.trim());
    if (!hasAtLeastOneTitle) {
      setFormError('Please enter a title in at least one language.');
      return;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const placeInput: AdminPlaceInput = {
      category_id: categoryId,
      slug: slug.trim().toLowerCase(),
      latitude: latNum,
      longitude: lngNum,
      phone: phone.trim() || null,
      whatsapp: whatsapp.trim() || null,
      website_url: websiteUrl.trim() || null,
      instagram_handle: instagramHandle.trim() || null,
      price_level: priceLevel,
      status,
      is_featured: isFeatured,
      project_status: projectStatus,
      tags,
    };

    const translationList: AdminPlaceTranslationInput[] = Object.values(translations);

    setSaving(true);
    try {
      if (isEditing && id) {
        await updateAdminPlace(id, placeInput, translationList, images);
      } else {
        await createAdminPlace(placeInput, translationList, images);
      }
      navigate('/admin/places');
    } catch (err: any) {
      setFormError(err.message || 'Failed to save place');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-ocean-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-sand-200 dark:border-stone-700 pb-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/places"
            className="p-2 bg-white dark:bg-stone-800 hover:bg-sand-100 dark:hover:bg-stone-700 text-sand-700 dark:text-sand-300 rounded-xl border border-sand-200 dark:border-stone-700 transition"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-bold text-sand-950 dark:text-sand-100">
              {isEditing ? t('admin.edit_place', 'Edit Place') : t('admin.new_place', 'Create New Place')}
            </h1>
            <p className="text-xs text-sand-500 font-mono">
              {isEditing ? `ID: ${id}` : t('admin.draft_candidate', 'Draft candidate staged for verification')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/places"
            className="px-4 py-2 bg-sand-100 dark:bg-stone-700 hover:bg-sand-200 dark:hover:bg-stone-600 text-sand-800 dark:text-sand-200 rounded-xl text-sm font-semibold transition"
          >
            {t('common.cancel', 'Cancel')}
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2 bg-ocean-600 hover:bg-ocean-700 text-white rounded-xl text-sm font-semibold transition shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? t('common.saving', 'Saving...') : t('common.save', 'Save Place')}
          </button>
        </div>
      </div>

      {formError && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl flex items-start gap-3 text-red-700 dark:text-red-300 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>{formError}</div>
        </div>
      )}

      {/* Grid: 2 columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2/3): Content & Translations */}
        <div className="lg:col-span-2 space-y-6">
          {/* Trilingual Tabs Card */}
          <div className="bg-white dark:bg-stone-800 rounded-2xl border border-sand-200 dark:border-stone-700 p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-sand-200 dark:border-stone-700 pb-3 mb-6">
              <h2 className="text-base font-bold text-sand-900 dark:text-sand-100 flex items-center gap-2">
                <Globe className="w-4 h-4 text-ocean-600" />
                {t('admin.multilingual_content', 'Trilingual Content')}
              </h2>
              <div className="flex rounded-lg bg-sand-100 dark:bg-stone-700 p-1">
                {(['en', 'fr', 'ar'] as SupportedLanguage[]).map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setActiveTab(lang)}
                    className={`px-3 py-1 rounded-md text-xs font-semibold uppercase transition ${
                      activeTab === lang
                        ? 'bg-white dark:bg-stone-800 text-ocean-600 dark:text-ocean-400 shadow-sm'
                        : 'text-sand-600 dark:text-sand-400 hover:text-sand-900'
                    }`}
                  >
                    {lang === 'ar' ? 'العربية' : lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Form Fields */}
            <div className="space-y-4" dir={activeTab === 'ar' ? 'rtl' : 'ltr'}>
              <div>
                <label className="block text-xs font-semibold text-sand-700 dark:text-sand-300 mb-1">
                  {t('places.title', 'Title')} ({activeTab.toUpperCase()}) *
                </label>
                <input
                  type="text"
                  value={translations[activeTab].title}
                  onChange={(e) => handleTranslationChange(activeTab, 'title', e.target.value)}
                  placeholder={`Enter place name in ${activeTab.toUpperCase()}`}
                  className="w-full px-3.5 py-2.5 bg-sand-50 dark:bg-stone-900 border border-sand-200 dark:border-stone-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-sand-700 dark:text-sand-300 mb-1">
                  {t('admin.short_description', 'Short Tagline / Summary')}
                </label>
                <input
                  type="text"
                  value={translations[activeTab].short_description}
                  onChange={(e) => handleTranslationChange(activeTab, 'short_description', e.target.value)}
                  placeholder="One-sentence teaser displayed on cards"
                  className="w-full px-3.5 py-2.5 bg-sand-50 dark:bg-stone-900 border border-sand-200 dark:border-stone-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-sand-700 dark:text-sand-300 mb-1">
                  {t('places.description', 'Full Description')}
                </label>
                <textarea
                  rows={4}
                  value={translations[activeTab].full_description}
                  onChange={(e) => handleTranslationChange(activeTab, 'full_description', e.target.value)}
                  placeholder="Detailed place description, history, highlights, and experience details"
                  className="w-full px-3.5 py-2.5 bg-sand-50 dark:bg-stone-900 border border-sand-200 dark:border-stone-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-sand-700 dark:text-sand-300 mb-1">
                  {t('places.address', 'Address / Location Display')}
                </label>
                <input
                  type="text"
                  value={translations[activeTab].address_display || ''}
                  onChange={(e) => handleTranslationChange(activeTab, 'address_display', e.target.value)}
                  placeholder="e.g. PK25 Lagoon Highway, Dakhla"
                  className="w-full px-3.5 py-2.5 bg-sand-50 dark:bg-stone-900 border border-sand-200 dark:border-stone-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-sand-700 dark:text-sand-300 mb-1">
                  {t('places.tips', 'Practical Tips for Visitors')}
                </label>
                <textarea
                  rows={2}
                  value={translations[activeTab].practical_tips || ''}
                  onChange={(e) => handleTranslationChange(activeTab, 'practical_tips', e.target.value)}
                  placeholder="e.g. Best wind 14:00-18:00; 4x4 required for access"
                  className="w-full px-3.5 py-2.5 bg-sand-50 dark:bg-stone-900 border border-sand-200 dark:border-stone-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
                />
              </div>
            </div>
          </div>

          {/* Media & Images Card */}
          <div className="bg-white dark:bg-stone-800 rounded-2xl border border-sand-200 dark:border-stone-700 p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-sand-200 dark:border-stone-700 pb-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-sand-900 dark:text-sand-100">
                  {t('admin.images_gallery', 'Image Gallery & WebP Upload')}
                </h2>
                <p className="text-xs text-sand-500">
                  {t('admin.webp_auto_transcode_note', 'Images are transcoded to WebP client-side before upload to places-media bucket.')}
                </p>
              </div>
              <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 bg-ocean-50 dark:bg-ocean-950/40 text-ocean-700 dark:text-ocean-300 hover:bg-ocean-100 rounded-xl text-xs font-semibold transition">
                <Upload className="w-3.5 h-3.5" />
                {uploadingImage ? t('common.uploading', 'Uploading...') : t('admin.upload_images', 'Upload Image')}
                <input
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
            </div>

            {images.length === 0 ? (
              <div className="py-8 text-center text-sand-400 border-2 border-dashed border-sand-200 dark:border-stone-700 rounded-xl">
                <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs">{t('admin.no_images_uploaded', 'No images uploaded yet. Upload JPEG, PNG, or WebP.')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {images.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-xl overflow-hidden border border-sand-200 dark:border-stone-700 bg-sand-100 aspect-video flex items-center justify-center"
                  >
                    <img
                      src={`https://yrcxhyevjfqbbimzzmro.supabase.co/storage/v1/object/public/places-media/${img.storage_path}`}
                      alt={img.alt_text || 'Place'}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPrimaryImage(idx)}
                        title={t('admin.set_as_primary', 'Set as Cover')}
                        className={`p-1.5 rounded-lg text-xs font-semibold ${
                          img.is_primary ? 'bg-amber-500 text-white' : 'bg-white/80 hover:bg-white text-sand-900'
                        }`}
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        title={t('common.delete', 'Delete')}
                        className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {img.is_primary && (
                      <span className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-ocean-600 text-white text-[10px] font-bold uppercase rounded-md shadow-sm">
                        Cover
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1/3): Categorization, Status & GPS Constraints */}
        <div className="space-y-6">
          {/* Status & Publication Checklist */}
          <div className="bg-white dark:bg-stone-800 rounded-2xl border border-sand-200 dark:border-stone-700 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-sand-900 dark:text-sand-100">
              {t('places.status', 'Publication Status')}
            </h2>

            <div>
              <label className="block text-xs font-semibold text-sand-700 dark:text-sand-300 mb-1">
                {t('admin.lifecycle_status', 'Lifecycle Status')} *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PlaceStatus)}
                className="w-full px-3.5 py-2.5 bg-sand-50 dark:bg-stone-900 border border-sand-200 dark:border-stone-700 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-ocean-500"
              >
                <option value="draft">{t('places.draft', 'Draft (Audit Pending)')}</option>
                <option value="published">{t('places.published', 'Published (Live on Portal)')}</option>
                <option value="archived">{t('places.archived', 'Archived')}</option>
              </select>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="isFeatured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-ocean-600 rounded border-sand-300 focus:ring-ocean-500"
              />
              <label htmlFor="isFeatured" className="text-xs font-semibold text-sand-700 dark:text-sand-300 cursor-pointer">
                {t('admin.featured_on_homepage', 'Feature on Homepage & Discovery Highlights')}
              </label>
            </div>
          </div>

          {/* Coordinates & Location Constraint */}
          <div className="bg-white dark:bg-stone-800 rounded-2xl border border-sand-200 dark:border-stone-700 p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-lagoon-600" />
              <h2 className="text-base font-bold text-sand-900 dark:text-sand-100">
                {t('places.coordinates', 'GPS Coordinates')}
              </h2>
            </div>

            <p className="text-xs text-sand-500 leading-relaxed">
              {t(
                'admin.coords_constraint_explanation',
                'Constraint chk_places_published_coords strictly requires empirical coordinates before promoting to published.'
              )}
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-sand-700 dark:text-sand-300 mb-1">
                  Latitude
                </label>
                <input
                  type="number"
                  step="0.0000001"
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder="23.7185"
                  className="w-full px-3 py-2 bg-sand-50 dark:bg-stone-900 border border-sand-200 dark:border-stone-700 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ocean-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-sand-700 dark:text-sand-300 mb-1">
                  Longitude
                </label>
                <input
                  type="number"
                  step="0.0000001"
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder="-15.9348"
                  className="w-full px-3 py-2 bg-sand-50 dark:bg-stone-900 border border-sand-200 dark:border-stone-700 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ocean-500"
                />
              </div>
            </div>

            {status === 'published' && (!latitude || !longitude) && (
              <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl flex items-center gap-2 text-amber-700 dark:text-amber-300 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Publishing requires both coordinates!</span>
              </div>
            )}
          </div>

          {/* Classification & Metadata */}
          <div className="bg-white dark:bg-stone-800 rounded-2xl border border-sand-200 dark:border-stone-700 p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-sand-900 dark:text-sand-100">
              {t('admin.classification_meta', 'Classification & Meta')}
            </h2>

            <div>
              <label className="block text-xs font-semibold text-sand-700 dark:text-sand-300 mb-1">
                {t('places.category', 'Category')} *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-sand-50 dark:bg-stone-900 border border-sand-200 dark:border-stone-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.translations.en?.name || cat.slug}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-sand-700 dark:text-sand-300 mb-1">
                {t('admin.url_slug', 'URL Slug')} *
              </label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                placeholder="e.g. dakhla-attitude-kitesurf"
                className="w-full px-3.5 py-2 bg-sand-50 dark:bg-stone-900 border border-sand-200 dark:border-stone-700 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ocean-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-sand-700 dark:text-sand-300 mb-1">
                {t('places.price_level', 'Price Level (1-4)')}
              </label>
              <select
                value={priceLevel}
                onChange={(e) => setPriceLevel(parseInt(e.target.value, 10))}
                className="w-full px-3.5 py-2 bg-sand-50 dark:bg-stone-900 border border-sand-200 dark:border-stone-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-ocean-500"
              >
                <option value={1}>$ — Budget</option>
                <option value={2}>$$ — Moderate</option>
                <option value={3}>$$$ — Upscale</option>
                <option value={4}>$$$$ — Luxury</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-sand-700 dark:text-sand-300 mb-1">
                {t('admin.tags_comma_separated', 'Tags (comma-separated)')}
              </label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="kitesurf, lagoon, seafood, wifi"
                className="w-full px-3.5 py-2 bg-sand-50 dark:bg-stone-900 border border-sand-200 dark:border-stone-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-ocean-500"
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="bg-white dark:bg-stone-800 rounded-2xl border border-sand-200 dark:border-stone-700 p-6 shadow-sm space-y-3">
            <h2 className="text-base font-bold text-sand-900 dark:text-sand-100 flex items-center gap-2">
              <Phone className="w-4 h-4 text-ocean-600" />
              {t('places.contact', 'Contact & Socials')}
            </h2>

            <div>
              <label className="block text-[11px] font-semibold text-sand-600 dark:text-sand-400 mb-0.5">
                Phone
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+212 5 28..."
                className="w-full px-3 py-1.5 bg-sand-50 dark:bg-stone-900 border border-sand-200 dark:border-stone-700 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-sand-600 dark:text-sand-400 mb-0.5">
                WhatsApp
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+212 6..."
                className="w-full px-3 py-1.5 bg-sand-50 dark:bg-stone-900 border border-sand-200 dark:border-stone-700 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-sand-600 dark:text-sand-400 mb-0.5">
                Website URL
              </label>
              <input
                type="url"
                value={websiteUrl}
                onChange={(e) => setWebsiteUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-1.5 bg-sand-50 dark:bg-stone-900 border border-sand-200 dark:border-stone-700 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-sand-600 dark:text-sand-400 mb-0.5">
                Instagram Handle
              </label>
              <input
                type="text"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
                placeholder="@dakhla_spot"
                className="w-full px-3 py-1.5 bg-sand-50 dark:bg-stone-900 border border-sand-200 dark:border-stone-700 rounded-lg text-xs"
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};
