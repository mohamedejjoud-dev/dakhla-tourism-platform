// src/components/planner/SaveShareDialog.tsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Copy, Check, Bookmark, Printer } from 'lucide-react';
import { GeneratedItinerary } from '@/types/tripPlanner';
import { useAuth } from '@/context/AuthContext';
import { saveItinerary } from '@/services/savedTripsService';

interface Props {
  itinerary: GeneratedItinerary;
  isOpen: boolean;
  onClose: () => void;
}

export const SaveShareDialog: React.FC<Props> = ({ itinerary, isOpen, onClose }) => {
  const { t } = useTranslation();
  const { user, openAuthModal } = useAuth();
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToAccount = () => {
    if (!user) {
      openAuthModal();
      return;
    }
    saveItinerary(itinerary);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-sm rounded-3xl border border-[#E8E5DE] shadow-xl p-5 sm:p-6 space-y-5 animate-in zoom-in-95 duration-150">
        
        <div className="flex items-center justify-between pb-3 border-b border-[#E8E5DE]">
          <h3 className="font-bold text-sm sm:text-base text-[#1F2933]">
            {t('planner.shareTrip', 'Share & Save Itinerary')}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[#FCFBF8] text-[#667580]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Copy link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full p-3 rounded-2xl border border-[#E8E5DE] hover:border-[#176B87] bg-[#FCFBF8] flex items-center justify-between text-xs font-semibold text-[#1F2933] transition-all"
          >
            <span className="flex items-center gap-2">
              <Copy className="w-4 h-4 text-[#176B87]" />
              <span>Copy shareable link</span>
            </span>
            {copied ? (
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Copied!
              </span>
            ) : null}
          </button>

          {/* Save to account */}
          <button
            type="button"
            onClick={handleSaveToAccount}
            className="w-full p-3 rounded-2xl border border-[#E8E5DE] hover:border-[#176B87] bg-[#FCFBF8] flex items-center justify-between text-xs font-semibold text-[#1F2933] transition-all"
          >
            <span className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 text-[#176B87]" />
              <span>{user ? 'Save to My Account' : 'Sign in to save itinerary'}</span>
            </span>
            {saved ? (
              <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Saved!
              </span>
            ) : null}
          </button>

          {/* Print / PDF */}
          <button
            type="button"
            onClick={handlePrint}
            className="w-full p-3 rounded-2xl border border-[#E8E5DE] hover:border-[#176B87] bg-[#FCFBF8] flex items-center justify-between text-xs font-semibold text-[#1F2933] transition-all"
          >
            <span className="flex items-center gap-2">
              <Printer className="w-4 h-4 text-[#176B87]" />
              <span>{t('planner.printTrip', 'Print / PDF Export')}</span>
            </span>
          </button>
        </div>

        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold text-[#667580] hover:text-[#1F2933]"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
