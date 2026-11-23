// src/pages/admin/AdminCategoriesPage.tsx
// Management of tourism categories and their trilingual translations

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  listAdminCategories, 
  saveAdminCategory, 
  deleteAdminCategory, 
  AdminCategoryItem 
} from '@/services/adminService';
import { SupportedLanguage } from '@/types/database';
import { 
  Plus, 
  Edit, 
  Trash2, 
  X, 
  CheckCircle2
} from 'lucide-react';

export const AdminCategoriesPage: React.FC = () => {
  const { t } = useTranslation();
  const [categories, setCategories] = useState<AdminCategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('Compass');
  const [displayOrder, setDisplayOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [names, setNames] = useState<Record<SupportedLanguage, string>>({
    ar: '',
    fr: '',
    en: '',
  });
  const [descriptions, setDescriptions] = useState<Record<SupportedLanguage, string>>({
    ar: '',
    fr: '',
    en: '',
  });
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await listAdminCategories();
      setCategories(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setSlug('');
    setIcon('Compass');
    setDisplayOrder(categories.length);
    setIsActive(true);
    setNames({ ar: '', fr: '', en: '' });
    setDescriptions({ ar: '', fr: '', en: '' });
    setErrorMsg(null);
    setModalOpen(true);
  };

  const openEditModal = (cat: AdminCategoryItem) => {
    setEditingId(cat.id);
    setSlug(cat.slug);
    setIcon(cat.icon);
    setDisplayOrder(cat.display_order);
    setIsActive(cat.is_active);
    setNames({
      ar: cat.translations.ar?.name || '',
      fr: cat.translations.fr?.name || '',
      en: cat.translations.en?.name || '',
    });
    setDescriptions({
      ar: cat.translations.ar?.description || '',
      fr: cat.translations.fr?.description || '',
      en: cat.translations.en?.description || '',
    });
    setErrorMsg(null);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug.trim()) {
      setErrorMsg('Slug is required');
      return;
    }
    if (!names.en.trim() && !names.fr.trim() && !names.ar.trim()) {
      setErrorMsg('Category name in at least one language is required');
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    try {
      await saveAdminCategory({
        id: editingId || undefined,
        slug: slug.trim().toLowerCase(),
        icon: icon.trim(),
        display_order: displayOrder,
        is_active: isActive,
        translations: {
          ar: { name: names.ar, description: descriptions.ar || null },
          fr: { name: names.fr, description: descriptions.fr || null },
          en: { name: names.en, description: descriptions.en || null },
        },
      });

      setModalOpen(false);
      await fetchCategories();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, slugName: string) => {
    if (!window.confirm(`Delete category "${slugName}"? (Fails if any place is assigned to this category)`)) {
      return;
    }

    try {
      await deleteAdminCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      alert(err.message || 'Cannot delete category');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-sand-950 dark:text-sand-100">
            {t('admin.categories_title', 'Category Taxonomy')}
          </h1>
          <p className="text-sand-600 dark:text-sand-400 text-sm mt-1">
            {t('admin.categories_subtitle', 'Manage Dakhla discovery categories and their trilingual translations.')}
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-ocean-600 hover:bg-ocean-700 text-white rounded-xl text-sm font-semibold transition shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          {t('admin.add_category', 'Add Category')}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-stone-800 rounded-2xl border border-sand-200 dark:border-stone-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-ocean-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-sm">
              <thead className="bg-sand-50 dark:bg-stone-900/60 text-xs text-sand-600 dark:text-sand-400 uppercase font-semibold border-b border-sand-200 dark:border-stone-700">
                <tr>
                  <th className="px-6 py-3.5">Slug & Icon</th>
                  <th className="px-6 py-3.5">English Name</th>
                  <th className="px-6 py-3.5">French Name</th>
                  <th className="px-6 py-3.5">Arabic Name</th>
                  <th className="px-6 py-3.5 text-center">Active</th>
                  <th className="px-6 py-3.5 text-center">Order</th>
                  <th className="px-6 py-3.5 text-right rtl:text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-200 dark:divide-stone-700">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-sand-50/50 dark:hover:bg-stone-750 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-sand-900 dark:text-sand-100 flex items-center gap-2">
                        <span className="p-1.5 bg-ocean-50 dark:bg-ocean-950/40 text-ocean-600 rounded-lg text-xs font-mono">
                          {cat.icon}
                        </span>
                        <span>{cat.slug}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-sand-800 dark:text-sand-200">
                      {cat.translations.en?.name || '—'}
                    </td>
                    <td className="px-6 py-4 text-sand-700 dark:text-sand-300">
                      {cat.translations.fr?.name || '—'}
                    </td>
                    <td className="px-6 py-4 font-arabic text-sand-700 dark:text-sand-300">
                      {cat.translations.ar?.name || '—'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {cat.is_active ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 mx-auto" />
                      ) : (
                        <X className="w-4 h-4 text-stone-400 mx-auto" />
                      )}
                    </td>
                    <td className="px-6 py-4 text-center text-xs font-mono text-sand-500">
                      {cat.display_order}
                    </td>
                    <td className="px-6 py-4 text-right rtl:text-left space-x-2 rtl:space-x-reverse">
                      <button
                        onClick={() => openEditModal(cat)}
                        className="p-1.5 text-ocean-600 hover:text-ocean-700 rounded-lg hover:bg-ocean-50 transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.slug)}
                        className="p-1.5 text-red-600 hover:text-red-700 rounded-lg hover:bg-red-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-stone-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-sand-200 dark:border-stone-700 space-y-4">
            <div className="flex items-center justify-between border-b border-sand-200 dark:border-stone-700 pb-3">
              <h3 className="font-bold font-serif text-lg text-sand-900 dark:text-sand-100">
                {editingId ? 'Edit Category' : 'Create New Category'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-sand-400 hover:text-sand-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs rounded-xl border border-red-200 dark:border-red-900">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-sand-700 dark:text-sand-300 mb-1">
                    Slug *
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                    placeholder="kitesurf"
                    className="w-full px-3 py-2 bg-sand-50 dark:bg-stone-900 border border-sand-200 dark:border-stone-700 rounded-xl font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-sand-700 dark:text-sand-300 mb-1">
                    Icon Component *
                  </label>
                  <input
                    type="text"
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="Compass, Waves, Bed..."
                    className="w-full px-3 py-2 bg-sand-50 dark:bg-stone-900 border border-sand-200 dark:border-stone-700 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-sand-700 dark:text-sand-300 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value, 10))}
                    className="w-full px-3 py-2 bg-sand-50 dark:bg-stone-900 border border-sand-200 dark:border-stone-700 rounded-xl text-xs"
                  />
                </div>
                <div className="flex items-center pt-5 gap-2">
                  <input
                    type="checkbox"
                    id="catActive"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-ocean-600 rounded border-sand-300"
                  />
                  <label htmlFor="catActive" className="text-xs font-semibold text-sand-700 dark:text-sand-300 cursor-pointer">
                    Active (Publicly Visible)
                  </label>
                </div>
              </div>

              {/* Names */}
              <div className="pt-2 border-t border-sand-200 dark:border-stone-700 space-y-2">
                <span className="text-xs font-bold text-sand-500 uppercase tracking-wider block">
                  Trilingual Names
                </span>
                <div>
                  <label className="block text-[11px] text-sand-600 mb-0.5">English</label>
                  <input
                    type="text"
                    value={names.en}
                    onChange={(e) => setNames({ ...names, en: e.target.value })}
                    placeholder="e.g. Kitesurf & Watersports"
                    className="w-full px-3 py-1.5 bg-sand-50 dark:bg-stone-900 border border-sand-200 dark:border-stone-700 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-sand-600 mb-0.5">French</label>
                  <input
                    type="text"
                    value={names.fr}
                    onChange={(e) => setNames({ ...names, fr: e.target.value })}
                    placeholder="e.g. Kitesurf et Sports Nautiques"
                    className="w-full px-3 py-1.5 bg-sand-50 dark:bg-stone-900 border border-sand-200 dark:border-stone-700 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-sand-600 mb-0.5">Arabic</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={names.ar}
                    onChange={(e) => setNames({ ...names, ar: e.target.value })}
                    placeholder="مثال: ركوب الأمواج والرياضات البحرية"
                    className="w-full px-3 py-1.5 bg-sand-50 dark:bg-stone-900 border border-sand-200 dark:border-stone-700 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-sand-200 dark:border-stone-700">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-sand-100 hover:bg-sand-200 text-sand-800 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-ocean-600 hover:bg-ocean-700 text-white rounded-xl text-xs font-semibold shadow-sm disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
