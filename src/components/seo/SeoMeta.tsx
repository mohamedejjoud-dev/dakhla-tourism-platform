// src/components/seo/SeoMeta.tsx
// Comprehensive SEO metadata, Open Graph, Twitter Cards, Hreflang, and Schema.org JSON-LD
// Lean, zero-dependency implementation via native DOM head manipulation (AGENTS.md Rule 5 & 12)

import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SupportedLanguage } from '@/types/database';

export interface SeoMetaProps {
  title?: string;
  description?: string;
  ogImage?: string;
  canonicalPath?: string;
  ogType?: 'website' | 'article' | 'place';
  structuredData?: Record<string, unknown>;
}

const SITE_URL = 'https://dakhlin.com';
const DEFAULT_OG_IMAGE = 'https://dakhlin.com/og-default-dakhla.webp';

function setMetaTag(name: string, content: string, isProperty = false) {
  const attr = isProperty ? 'property' : 'name';
  let el = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function setLinkTag(rel: string, href: string, hreflang?: string) {
  let selector = `link[rel="${rel}"]`;
  if (hreflang) {
    selector += `[hreflang="${hreflang}"]`;
  }
  let el = document.querySelector(selector) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    if (hreflang) el.setAttribute('hreflang', hreflang);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export const SeoMeta: React.FC<SeoMetaProps> = ({
  title,
  description,
  ogImage,
  canonicalPath = '',
  ogType = 'website',
  structuredData,
}) => {
  const { i18n, t } = useTranslation();
  const currentLang = (i18n.language || 'fr') as SupportedLanguage;

  const defaultTitle = t('hero.title', 'Dakhlin — La Perle du Sahara Marocain | Visit Dakhla');
  const defaultDesc = t(
    'hero.subtitle',
    'Plateforme officielle de découverte touristique de Dakhla, Sahara Marocain. Hôtels, camps de kitesurf, restaurants, artisanat et grands projets.'
  );

  const finalTitle = title ? `${title} | Dakhlin` : defaultTitle;
  const finalDesc = description || defaultDesc;
  const finalImage = ogImage || DEFAULT_OG_IMAGE;
  const fullCanonicalUrl = `${SITE_URL}${canonicalPath.startsWith('/') ? canonicalPath : `/${canonicalPath}`}`;

  useEffect(() => {
    // 1. Page title
    document.title = finalTitle;

    // 2. Standard description
    setMetaTag('description', finalDesc);

    // 3. Open Graph
    setMetaTag('og:title', finalTitle, true);
    setMetaTag('og:description', finalDesc, true);
    setMetaTag('og:image', finalImage, true);
    setMetaTag('og:url', fullCanonicalUrl, true);
    setMetaTag('og:type', ogType === 'place' ? 'article' : ogType, true);
    setMetaTag('og:site_name', 'Dakhlin — Dakhla Tourism Platform', true);
    setMetaTag('og:locale', currentLang === 'ar' ? 'ar_MA' : currentLang === 'en' ? 'en_US' : 'fr_FR', true);

    // 4. Twitter Card
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', finalTitle);
    setMetaTag('twitter:description', finalDesc);
    setMetaTag('twitter:image', finalImage);

    // 5. Canonical URL
    setLinkTag('canonical', fullCanonicalUrl);

    // 6. Hreflang alternates for multilingual SEO
    setLinkTag('alternate', fullCanonicalUrl, 'x-default');
    setLinkTag('alternate', fullCanonicalUrl, 'fr');
    setLinkTag('alternate', fullCanonicalUrl, 'en');
    setLinkTag('alternate', fullCanonicalUrl, 'ar');

    // 7. Schema.org JSON-LD
    let scriptEl = document.querySelector('script[data-schema="dakhlin"]') as HTMLScriptElement | null;
    if (structuredData) {
      if (!scriptEl) {
        scriptEl = document.createElement('script');
        scriptEl.type = 'application/ld+json';
        scriptEl.setAttribute('data-schema', 'dakhlin');
        document.head.appendChild(scriptEl);
      }
      scriptEl.textContent = JSON.stringify(structuredData);
    } else if (scriptEl) {
      scriptEl.remove();
    }
  }, [finalTitle, finalDesc, finalImage, fullCanonicalUrl, currentLang, ogType, structuredData]);

  return null;
};
