import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Star, Send, LogIn, CheckCircle } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { submitPlaceReview } from '@/services/reviewsService';
import { SupportedLanguage } from '@/types/database';

interface ReviewFormProps {
  placeId: string;
  onReviewSubmitted: () => void;
}

export const ReviewForm: React.FC<ReviewFormProps> = ({ placeId, onReviewSubmitted }) => {
  const { t, i18n } = useTranslation();
  const { user, openAuthModal } = useAuth();
  const currentLang = (i18n.resolvedLanguage || i18n.language || 'fr') as SupportedLanguage;

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!user) {
    return (
      <div className="p-6 bg-sand-50/80 rounded-2xl border border-sand-200 text-center space-y-3">
        <h4 className="font-bold text-ocean-900 text-base">
          {t('reviews.writeReview')}
        </h4>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          {t('reviews.loginToReview')}
        </p>
        <button
          onClick={openAuthModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-lagoon-600 hover:bg-lagoon-500 text-white font-bold text-xs shadow-md transition-colors"
        >
          <LogIn className="w-4 h-4" />
          <span>{t('auth.signIn')}</span>
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (comment.trim().length < 5) {
      setErrorMsg(t('reviews.minCharacters'));
      return;
    }

    setSubmitting(true);
    const res = await submitPlaceReview({
      placeId,
      userId: user.id,
      rating,
      comment: comment.trim(),
      languageCode: currentLang,
    });

    setSubmitting(false);

    if (!res.success) {
      if (res.duplicate) {
        setErrorMsg(t('reviews.alreadyReviewed'));
      } else {
        setErrorMsg(res.error || 'Failed to submit review');
      }
    } else {
      setSuccess(true);
      setComment('');
      onReviewSubmitted();
    }
  };

  if (success) {
    return (
      <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2 text-emerald-800">
        <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
        <h4 className="font-bold text-base">{t('reviews.reviewSuccess')}</h4>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-2xl border border-sand-200/90 shadow-sm space-y-4">
      <h4 className="font-bold text-ocean-900 text-base">
        {t('reviews.writeReview')}
      </h4>

      {errorMsg && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
          {errorMsg}
        </div>
      )}

      {/* Star Rating Selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-semibold text-slate-600">
          {t('reviews.yourRating')}
        </label>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(null)}
              className="p-1 focus:outline-none transition-transform hover:scale-110"
              aria-label={`${star} stars`}
            >
              <Star
                className={`w-6 h-6 ${
                  (hoverRating !== null ? star <= hoverRating : star <= rating)
                    ? 'text-amber-500 fill-amber-500'
                    : 'text-sand-300'
                }`}
              />
            </button>
          ))}
          <span className="ms-2 text-xs font-bold text-slate-700">
            {rating} / 5
          </span>
        </div>
      </div>

      {/* Comment Input */}
      <div className="space-y-1">
        <textarea
          rows={3}
          required
          minLength={5}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t('reviews.yourComment')}
          className="w-full p-3 rounded-xl border border-sand-200 text-sm focus:outline-none focus:ring-2 focus:ring-lagoon-500/20 focus:border-lagoon-500"
        />
        <div className="flex justify-between text-[11px] text-slate-400">
          <span>{t('reviews.minCharacters')}</span>
          <span>{comment.length} chars</span>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting || comment.trim().length < 5}
        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-lagoon-600 hover:bg-lagoon-500 text-white font-bold text-xs shadow-md transition-colors disabled:opacity-50"
      >
        <Send className="w-3.5 h-3.5" />
        <span>{submitting ? t('common.loading') : t('reviews.submitReview')}</span>
      </button>
    </form>
  );
};
