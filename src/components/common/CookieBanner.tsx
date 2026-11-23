// src/components/common/CookieBanner.tsx
// Privacy Policy & Cookie Notification complying with Moroccan Law 09-08 (CNDP)
// Governed strictly by AGENTS.md (Rule 12: Security & Privacy Compliance)

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const COOKIE_CONSENT_KEY = 'dakhlin_cookie_consent_v1';

export const CookieBanner: React.FC = () => {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      // Small delay before showing so it doesn't obstruct initial layout render
      const timer = setTimeout(() => setIsVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'declined');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-40 bg-white dark:bg-stone-850 rounded-2xl shadow-2xl border border-sand-300 dark:border-stone-700 p-5 animate-in slide-in-from-bottom-5 duration-300"
    >
      <div className="flex items-start gap-3.5">
        <div className="p-2.5 rounded-xl bg-ocean-50 dark:bg-ocean-950/50 text-ocean-600 dark:text-ocean-400 shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="space-y-2 flex-1 min-w-0">
          <h4 className="text-sm font-bold text-sand-950 dark:text-sand-100">
            {t('privacy.cookie_title', 'Respect de votre vie privée (Loi 09-08 / CNDP)')}
          </h4>
          <p className="text-xs text-sand-600 dark:text-sand-400 leading-relaxed">
            {t(
              'privacy.cookie_desc',
              'Nous utilisons des cookies essentiels pour sécuriser votre session et mémoriser vos préférences de langue. Vos données sont protégées conformément à la législation marocaine.'
            )}
          </p>
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <button
              onClick={handleAccept}
              className="px-4 py-2 bg-ocean-600 hover:bg-ocean-700 text-white rounded-xl text-xs font-semibold transition shadow-xs"
            >
              {t('common.accept', 'Accepter')}
            </button>
            <button
              onClick={handleDecline}
              className="px-3 py-2 bg-sand-100 hover:bg-sand-200 dark:bg-stone-700 dark:hover:bg-stone-600 text-sand-800 dark:text-sand-200 rounded-xl text-xs font-medium transition"
            >
              {t('common.decline', 'Refuser')}
            </button>
            <Link
              to="/about#privacy"
              className="text-xs font-semibold text-ocean-600 dark:text-ocean-400 hover:underline px-2 py-1"
            >
              {t('footer.privacy', 'En savoir plus')}
            </Link>
          </div>
        </div>
        <button
          onClick={handleDecline}
          aria-label="Close"
          className="text-sand-400 hover:text-sand-600 dark:hover:text-sand-200 shrink-0 p-1"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
