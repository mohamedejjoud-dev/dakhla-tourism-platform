// src/pages/admin/AdminDashboardPage.tsx
// High-level CMS overview showing live counts and quick actions

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  getAdminStats, 
  AdminStats, 
  listAdminReviews, 
  AdminReviewItem 
} from '@/services/adminService';
import { 
  MapPin, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  AlertCircle, 
  Plus, 
  ArrowRight,
  Star
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingReviews, setPendingReviews] = useState<AdminReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getAdminStats(),
      listAdminReviews('pending'),
    ])
      .then(([statsData, reviewsData]) => {
        setStats(statsData);
        setPendingReviews(reviewsData.slice(0, 5));
      })
      .catch((err) => console.error('Failed to load dashboard data:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-10 h-10 border-4 border-ocean-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: t('admin.stats_total_places', 'Total Places'),
      count: stats?.totalPlaces || 0,
      icon: MapPin,
      color: 'bg-ocean-50 text-ocean-600 dark:bg-ocean-950/40 dark:text-ocean-400',
      link: '/admin/places',
    },
    {
      title: t('admin.stats_published', 'Published Places'),
      count: stats?.publishedPlaces || 0,
      icon: CheckCircle2,
      color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
      link: '/admin/places?status=published',
    },
    {
      title: t('admin.stats_drafts', 'Draft Candidates'),
      count: stats?.draftPlaces || 0,
      icon: Clock,
      color: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
      link: '/admin/places?status=draft',
    },
    {
      title: t('admin.stats_pending_reviews', 'Pending Reviews'),
      count: stats?.pendingReviews || 0,
      icon: MessageSquare,
      color: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400',
      link: '/admin/reviews?status=pending',
      badge: (stats?.pendingReviews || 0) > 0 ? 'Action Needed' : undefined,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-sand-950 dark:text-sand-100">
            {t('admin.dashboard_title', 'CMS Dashboard')}
          </h1>
          <p className="text-sand-600 dark:text-sand-400 text-sm mt-1">
            {t('admin.dashboard_subtitle', 'Manage Dakhla tourism catalog, content translations, and community reviews.')}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/places/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-ocean-600 hover:bg-ocean-700 text-white rounded-xl text-sm font-semibold transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            {t('admin.add_new_place', 'Add Place')}
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              to={card.link}
              className="bg-white dark:bg-stone-800 p-6 rounded-2xl border border-sand-200 dark:border-stone-700 shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold text-sand-500 uppercase tracking-wider">
                  {card.title}
                </span>
                <div className={`p-2.5 rounded-xl ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-bold font-serif text-sand-900 dark:text-sand-100">
                  {card.count}
                </span>
                {card.badge && (
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-400">
                    {card.badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Two Column Layout: Pending Moderation & Quick Guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Reviews Queue */}
        <div className="lg:col-span-2 bg-white dark:bg-stone-800 rounded-2xl border border-sand-200 dark:border-stone-700 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-sand-100 dark:border-stone-700">
            <div>
              <h2 className="text-lg font-bold text-sand-900 dark:text-sand-100">
                {t('admin.pending_reviews_queue', 'Reviews Awaiting Moderation')}
              </h2>
              <p className="text-xs text-sand-500 mt-0.5">
                {pendingReviews.length} {t('admin.items_requiring_review', 'item(s) in queue')}
              </p>
            </div>
            <Link
              to="/admin/reviews"
              className="text-xs font-semibold text-ocean-600 hover:text-ocean-700 dark:text-ocean-400 flex items-center gap-1"
            >
              {t('common.view_all', 'View All')}
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </Link>
          </div>

          {pendingReviews.length === 0 ? (
            <div className="py-12 text-center text-sand-500 dark:text-sand-400">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="text-sm font-medium">
                {t('admin.all_reviews_moderated', 'All community reviews have been moderated!')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-xl bg-sand-50/80 dark:bg-stone-900/60 border border-sand-100 dark:border-stone-700/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-sand-800 dark:text-sand-200 truncate">
                        {rev.author?.full_name || 'Anonymous Tourist'}
                      </span>
                      <span className="text-sand-400">•</span>
                      <span className="text-xs text-ocean-600 dark:text-ocean-400 truncate">
                        {rev.place?.title || rev.place?.slug}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-amber-500">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs text-sand-600 dark:text-sand-400 line-clamp-2">
                      "{rev.comment}"
                    </p>
                  </div>
                  <Link
                    to="/admin/reviews"
                    className="shrink-0 px-3 py-1.5 bg-white dark:bg-stone-800 hover:bg-ocean-50 text-ocean-700 dark:text-ocean-300 text-xs font-semibold rounded-lg border border-sand-200 dark:border-stone-700 transition"
                  >
                    {t('admin.action_moderate', 'Moderate')}
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Operating Rules & Policy Checklist */}
        <div className="bg-white dark:bg-stone-800 rounded-2xl border border-sand-200 dark:border-stone-700 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-2 rounded-xl bg-lagoon-50 text-lagoon-600 dark:bg-lagoon-950/40 dark:text-lagoon-400">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-sand-900 dark:text-sand-100">
                {t('admin.publishing_rules_title', 'Publishing Rules')}
              </h2>
            </div>
            <ul className="space-y-3 text-xs text-sand-600 dark:text-sand-400 leading-relaxed">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Strict GPS Constraint:</strong> Places published to the live portal MUST have verified latitude and longitude coordinates.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Trilingual Translations:</strong> Every place requires verified Arabic, French, and English titles and descriptions.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>WebP Asset Standard:</strong> Images are automatically transcoded to WebP before upload to optimize Core Web Vitals.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Audit Trail:</strong> All creation, publication, and moderation events are immutably logged in `admin_audit_log`.
                </span>
              </li>
            </ul>
          </div>

          <div className="mt-6 pt-4 border-t border-sand-100 dark:border-stone-700">
            <Link
              to="/admin/places"
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-sand-100 dark:bg-stone-700 hover:bg-sand-200 dark:hover:bg-stone-600 text-sand-800 dark:text-sand-200 rounded-xl text-xs font-semibold transition"
            >
              {t('admin.manage_places', 'Manage All Places')}
              <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
