// src/pages/admin/AdminReviewsPage.tsx
// Review moderation queue with Approve, Reject, and Delete actions
// Adheres strictly to AGENTS.md (Rule 12: Security & review integrity)

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  listAdminReviews, 
  updateReviewStatus, 
  deleteAdminReview, 
  AdminReviewItem 
} from '@/services/adminService';
import { 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Star, 
  Clock, 
  User
} from 'lucide-react';

export const AdminReviewsPage: React.FC = () => {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<AdminReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const data = await listAdminReviews(statusFilter);
      setReviews(data);
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [statusFilter]);

  const handleApprove = async (id: string) => {
    setActionInProgress(id);
    try {
      await updateReviewStatus(id, 'approved');
      if (statusFilter === 'pending') {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      } else {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: 'approved' } : r))
        );
      }
    } catch (err: any) {
      alert(err.message || 'Failed to approve review');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleReject = async (id: string) => {
    setActionInProgress(id);
    try {
      await updateReviewStatus(id, 'rejected');
      if (statusFilter === 'pending') {
        setReviews((prev) => prev.filter((r) => r.id !== id));
      } else {
        setReviews((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r))
        );
      }
    } catch (err: any) {
      alert(err.message || 'Failed to reject review');
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm(t('admin.confirm_delete_review', 'Are you sure you want to permanently delete this review? This triggers place rating recalculation.'))) {
      return;
    }

    setActionInProgress(id);
    try {
      await deleteAdminReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete review');
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-sand-950 dark:text-sand-100">
            {t('admin.review_moderation_title', 'Community Review Moderation')}
          </h1>
          <p className="text-sand-600 dark:text-sand-400 text-sm mt-1">
            {t('admin.review_moderation_subtitle', 'Audit tourist feedback, enforce platform community guidelines, and recalculate ratings.')}
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-white dark:bg-stone-800 p-1.5 rounded-xl border border-sand-200 dark:border-stone-700 shadow-xs self-start sm:self-auto">
          {(['pending', 'approved', 'rejected', 'all'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                statusFilter === s
                  ? 'bg-ocean-600 text-white shadow-xs'
                  : 'text-sand-600 dark:text-sand-400 hover:text-sand-900'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Review List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-ocean-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="py-20 bg-white dark:bg-stone-800 rounded-2xl border border-sand-200 dark:border-stone-700 p-8 text-center text-sand-500">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3 opacity-80" />
            <h3 className="text-base font-semibold text-sand-900 dark:text-sand-100">
              {statusFilter === 'pending'
                ? t('admin.no_pending_reviews', 'Queue Clear: No pending reviews awaiting moderation.')
                : t('admin.no_reviews_in_filter', 'No reviews found in this view.')}
            </h3>
            <p className="text-xs text-sand-400 mt-1">
              Switch filter tabs above to inspect approved or rejected reviews.
            </p>
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white dark:bg-stone-800 rounded-2xl border border-sand-200 dark:border-stone-700 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition hover:border-sand-300"
            >
              {/* Left Content Area */}
              <div className="space-y-3 flex-1 min-w-0">
                {/* Meta Header */}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-sand-900 dark:text-sand-100">
                    <User className="w-3.5 h-3.5 text-sand-400" />
                    <span>{rev.author?.full_name || 'Anonymous Tourist'}</span>
                    {rev.author?.email && (
                      <span className="text-sand-400 font-normal">({rev.author.email})</span>
                    )}
                  </div>
                  <span className="text-sand-300">•</span>
                  <span className="text-ocean-700 dark:text-ocean-400 font-medium">
                    {rev.place?.title || rev.place?.slug}
                  </span>
                  <span className="text-sand-300">•</span>
                  <span className="text-sand-500">
                    {new Date(rev.created_at).toLocaleDateString()}
                  </span>
                  <span className="uppercase text-[10px] font-mono px-1.5 py-0.5 rounded bg-sand-100 text-sand-600">
                    {rev.language_code}
                  </span>
                </div>

                {/* Rating Stars */}
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                  {[...Array(5 - rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-sand-200 dark:text-stone-700" />
                  ))}
                  <span className="ml-1.5 text-xs font-bold text-sand-700 dark:text-sand-300">
                    {rev.rating} / 5
                  </span>
                </div>

                {/* Comment Text */}
                <p className="text-sm text-sand-800 dark:text-sand-200 leading-relaxed font-sans bg-sand-50/60 dark:bg-stone-900/40 p-3 rounded-xl border border-sand-100 dark:border-stone-750">
                  "{rev.comment}"
                </p>

                {/* Status Badge */}
                <div>
                  {rev.status === 'pending' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                      <Clock className="w-3 h-3" />
                      Pending Approval
                    </span>
                  )}
                  {rev.status === 'approved' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
                      <CheckCircle2 className="w-3 h-3" />
                      Approved
                    </span>
                  )}
                  {rev.status === 'rejected' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                      <XCircle className="w-3 h-3" />
                      Rejected
                    </span>
                  )}
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center md:flex-col gap-2 shrink-0">
                {rev.status !== 'approved' && (
                  <button
                    onClick={() => handleApprove(rev.id)}
                    disabled={actionInProgress === rev.id}
                    className="flex-1 md:w-32 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition shadow-xs disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve
                  </button>
                )}

                {rev.status !== 'rejected' && (
                  <button
                    onClick={() => handleReject(rev.id)}
                    disabled={actionInProgress === rev.id}
                    className="flex-1 md:w-32 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl transition shadow-xs disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject
                  </button>
                )}

                <button
                  onClick={() => handleDelete(rev.id)}
                  disabled={actionInProgress === rev.id}
                  className="flex-1 md:w-32 inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-sand-100 hover:bg-red-50 text-red-600 dark:bg-stone-700 dark:hover:bg-red-950/40 dark:text-red-400 text-xs font-semibold rounded-xl transition disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
