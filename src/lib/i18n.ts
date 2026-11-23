import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import arTranslations from '../locales/ar.json';
import frTranslations from '../locales/fr.json';
import enTranslations from '../locales/en.json';

export const SUPPORTED_LANGUAGES = ['ar', 'fr', 'en'] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_NAMES: Record<SupportedLanguage, { native: string; english: string; dir: 'rtl' | 'ltr' }> = {
  ar: { native: 'العربية', english: 'Arabic', dir: 'rtl' },
  fr: { native: 'Français', english: 'French', dir: 'ltr' },
  en: { native: 'English', english: 'English', dir: 'ltr' },
};

export const STORAGE_KEY = 'dakhlin_language';

export function applyLanguageDirection(lang: string): 'rtl' | 'ltr' {
  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', lang);
    if (dir === 'rtl') {
      document.documentElement.classList.add('font-arabic');
      document.documentElement.classList.remove('font-sans');
    } else {
      document.documentElement.classList.add('font-sans');
      document.documentElement.classList.remove('font-arabic');
    }
  }
  return dir;
}

export const resources = {
  ar: { translation: arTranslations },
  fr: { translation: frTranslations },
  en: { translation: enTranslations },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    supportedLngs: SUPPORTED_LANGUAGES,
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: STORAGE_KEY,
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false, // React already escapes values
    },
  });

// Set initial direction based on detected / resolved language
applyLanguageDirection(i18n.resolvedLanguage || i18n.language || 'fr');

// Listen for language changes to update document direction dynamically
i18n.on('languageChanged', (lng: string) => {
  applyLanguageDirection(lng);
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(STORAGE_KEY, lng);
  }
});

export default i18n;
