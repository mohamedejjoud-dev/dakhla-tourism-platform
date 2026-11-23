import React from 'react';
import { useTranslation } from 'react-i18next';
import { Star, MessageCircle, User } from 'lucide-react';
import { ReviewWithAuthor } from '@/services/reviewsService';

interface ReviewListProps {
  reviews: ReviewWithAuthor[];
  loading?: boolean;
}

export const ReviewList: React.FC<ReviewListProps> = ({ reviews, loading }) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="py-8 text-center text-xs text-slate-400">
        {t('common.loading')}
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="py-10 text-center bg-sand-50/50 rounded-2xl border border-sand-200/80 p-6 space-y-2">
        <MessageCircle className="w-8 h-8 text-sand-400 mx-auto" />
        <p className="text-sm text-slate-600 font-medium">
          {t('reviews.noReviewsYet')}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((rev) => (
        <article
          key={rev.id}
          className="p-5 bg-white rounded-2xl border border-sand-200/90 shadow-sm space-y-3"
        >
          {/* Reviewer Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {rev.author?.avatar_url ? (
                <img
                  src={rev.author.avatar_url}
                  alt={rev.author.full_name || 'Tourist'}
                  className="w-9 h-9 rounded-full object-cover border border-sand-200"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-sand-100 text-ocean-900 flex items-center justify-center font-bold text-xs">
                  {rev.author?.full_name ? rev.author.full_name.charAt(0).toUpperCase() : <User className="w-4 h-4 text-slate-500" />}
                </div>
              )}
              <div>
                <h5 className="font-bold text-sm text-ocean-900">
                  {rev.author?.full_name || 'Tourist'}
                </h5>
                <span className="text-[11px] text-slate-400">
                  {new Date(rev.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Stars */}
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className={`w-3.5 h-3.5 ${
                    s <= rev.rating ? 'text-amber-500 fill-amber-500' : 'text-sand-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Comment */}
          <p className="text-sm text-slate-700 leading-relaxed">
            {rev.comment}
          </p>
        </article>
      ))}
    </div>
  );
};
