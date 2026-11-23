// src/pages/admin/AdminPlacesPage.tsx
// Management catalog for tourism places with search, filters, status indicators, and actions

import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  listAdminPlaces, 
  deleteAdminPlace, 
  listAdminCategories, 
  AdminPlaceDetail, 
  AdminCategoryItem 
} from '@/services/adminService';
import { PlaceStatus } from '@/types/database';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  Archive, 
  Star,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';

export const AdminPlacesPage: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  const [places, setPlaces] = useState<AdminPlaceDetail[]>([]);
  const [categories, setCategories] = useState<AdminCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<PlaceStatus | 'all'>(
    (searchParams.get('status') as PlaceStatus) || 'all'
  );
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchPlaces = async () => {
    setLoading(true);
    try {
      const [placesData, categoriesData] = await Promise.all([
        listAdminPlaces({
          search: searchTerm,
          status: statusFilter,
          categoryId: categoryFilter,
        }),
        listAdminCategories(),
      ]);
      setPlaces(placesData);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Failed to fetch places:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, [statusFilter, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchPlaces();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(t('admin.confirm_delete_place', `Are you sure you want to delete "${name}"? This action cannot be undone.`))) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteAdminPlace(id);
      setPlaces((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete place');
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusBadge = (status: PlaceStatus) => {
    switch (status) {
      case 'published':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 className="w-3 h-3" />
            {t('places.published', 'Published')}
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
            <Clock className="w-3 h-3" />
            {t('places.draft', 'Draft')}
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
            <Archive className="w-3 h-3" />
            {t('places.archived', 'Archived')}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-sand-950 dark:text-sand-100">
            {t('admin.places_title', 'Places & Content Management')}
          </h1>
          <p className="text-sand-600 dark:text-sand-400 text-sm mt-1">
            {t('admin.places_subtitle', 'Audit candidates, verify GPS coordinates, and publish trilingual tourism experiences.')}
          </p>
        </div>
        <Link
          to="/admin/places/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-ocean-600 hover:bg-ocean-700 text-white rounded-xl text-sm font-semibold transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          {t('admin.add_new_place', 'Add New Place')}
        </Link>
      </div>

      {/* Search & Filters Bar */}
      <div className="bg-white dark:bg-stone-800 p-4 rounded-2xl border border-sand-200 dark:border-stone-700 shadow-sm flex flex-col md:flex-row gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 rtl:left-auto rtl:right-3 top-1/2 -translate-y-1/2 text-sand-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('admin.search_places_placeholder', 'Search by title, slug...')}
              className="w-full pl-9 rtl:pl-4 rtl:pr-9 pr-4 py-2 bg-sand-50 dark:bg-stone-900 border border-sand-200 dark:border-stone-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-sand-100 dark:bg-stone-700 hover:bg-sand-200 dark:hover:bg-stone-600 text-sand-800 dark:text-sand-200 text-sm font-medium rounded-xl transition"
          >
            {t('common.search', 'Search')}
          </button>
        </form>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-sand-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => {
              const val = e.target.value as PlaceStatus | 'all';
              setStatusFilter(val);
              setSearchParams(val === 'all' ? {} : { status: val });
            }}
            className="px-3 py-2 bg-sand-50 dark:bg-stone-900 border border-sand-200 dark:border-stone-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500"
          >
            <option value="all">{t('common.all_statuses', 'All Statuses')}</option>
            <option value="draft">{t('places.draft', 'Draft Candidates')}</option>
            <option value="published">{t('places.published', 'Published')}</option>
            <option value="archived">{t('places.archived', 'Archived')}</option>
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-sand-50 dark:bg-stone-900 border border-sand-200 dark:border-stone-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-ocean-500 w-full"
          >
            <option value="all">{t('common.all_categories', 'All Categories')}</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.translations.en?.name || cat.slug}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Places Table */}
      <div className="bg-white dark:bg-stone-800 rounded-2xl border border-sand-200 dark:border-stone-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-ocean-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : places.length === 0 ? (
          <div className="py-16 text-center text-sand-500 dark:text-sand-400">
            <MapPin className="w-12 h-12 text-sand-300 dark:text-stone-600 mx-auto mb-3" />
            <p className="text-base font-semibold">{t('admin.no_places_found', 'No places match your search criteria.')}</p>
            <p className="text-xs text-sand-400 mt-1">{t('admin.try_clearing_filters', 'Try clearing your filters or add a new place candidate.')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-sm">
              <thead className="bg-sand-50 dark:bg-stone-900/60 text-xs text-sand-600 dark:text-sand-400 uppercase font-semibold border-b border-sand-200 dark:border-stone-700">
                <tr>
                  <th className="px-6 py-3.5">{t('places.title', 'Place / Title')}</th>
                  <th className="px-6 py-3.5">{t('places.category', 'Category')}</th>
                  <th className="px-6 py-3.5">{t('places.status', 'Status')}</th>
                  <th className="px-6 py-3.5">{t('places.coordinates', 'Coordinates')}</th>
                  <th className="px-6 py-3.5">{t('places.rating', 'Rating')}</th>
                  <th className="px-6 py-3.5 text-right rtl:text-left">{t('common.actions', 'Actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200 dark:divide-stone-700">
                {places.map((place) => {
                  const title =
                    place.translations.en?.title ||
                    place.translations.fr?.title ||
                    place.translations.ar?.title ||
                    place.slug;

                  const hasCoords = place.latitude !== null && place.longitude !== null;

                  return (
                    <tr
                      key={place.id}
                      className="hover:bg-sand-50/50 dark:hover:bg-stone-750 transition"
                    >
                      <td className="px-6 py-4">
                        <div className="font-semibold text-sand-900 dark:text-sand-100 flex items-center gap-2">
                          <span>{title}</span>
                          {place.status === 'published' && (
                            <Link
                              to={`/places/${place.slug}`}
                              target="_blank"
                              rel="noreferrer"
                              title={t('common.view_live', 'View Live')}
                              className="text-sand-400 hover:text-ocean-600 transition"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          )}
                        </div>
                        <div className="text-xs text-sand-500 font-mono mt-0.5">
                          slug: {place.slug}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sand-700 dark:text-sand-300">
                        {place.category?.slug || '—'}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(place.status)}
                      </td>
                      <td className="px-6 py-4">
                        {hasCoords ? (
                          <span className="text-xs font-mono text-sand-600 dark:text-sand-400">
                            {Number(place.latitude).toFixed(4)}, {Number(place.longitude).toFixed(4)}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-medium">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {t('admin.missing_coords', 'Missing GPS')}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sand-700 dark:text-sand-300">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-current" />
                          <span className="font-semibold">{Number(place.avg_rating).toFixed(1)}</span>
                          <span className="text-xs text-sand-400">({place.review_count})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right rtl:text-left space-x-2 rtl:space-x-reverse">
                        <Link
                          to={`/admin/places/${place.id}/edit`}
                          className="inline-flex items-center p-1.5 text-ocean-600 hover:text-ocean-700 dark:text-ocean-400 rounded-lg hover:bg-ocean-50 dark:hover:bg-ocean-950/40 transition"
                          title={t('common.edit', 'Edit')}
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(place.id, title)}
                          disabled={deletingId === place.id}
                          className="inline-flex items-center p-1.5 text-red-600 hover:text-red-700 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition disabled:opacity-50"
                          title={t('common.delete', 'Delete')}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
