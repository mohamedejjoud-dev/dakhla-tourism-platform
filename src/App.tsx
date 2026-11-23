import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { FavoritesProvider } from '@/context/FavoritesContext';
import { AuthModal } from '@/components/auth/AuthModal';
import { Layout } from './components/layout/Layout';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { PlaceDetailPage } from './pages/PlaceDetailPage';
import { MapPage } from './pages/MapPage';
import { AboutPage } from './pages/AboutPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { AuthPage } from './pages/AuthPage';
import { AssistantPage } from './pages/AssistantPage';

// Admin CMS Components & Pages
import { AdminGuard } from './components/admin/AdminGuard';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminPlacesPage } from './pages/admin/AdminPlacesPage';
import { AdminPlaceEditPage } from './pages/admin/AdminPlaceEditPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminReviewsPage } from './pages/admin/AdminReviewsPage';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <BrowserRouter>
          <AuthModal />
          <Routes>
            {/* Public Tourist Portal */}
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="explore" element={<ExplorePage />} />
              <Route path="category/:slug" element={<ExplorePage />} />
              <Route path="places/:slug" element={<PlaceDetailPage />} />
              <Route path="map" element={<MapPage />} />
              <Route path="projects" element={<ExplorePage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="favorites" element={<FavoritesPage />} />
              <Route path="assistant" element={<AssistantPage />} />
              <Route path="auth" element={<AuthPage />} />
            </Route>

            {/* Protected Admin CMS */}
            <Route path="/admin" element={<AdminGuard />}>
              <Route element={<AdminLayout />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="places" element={<AdminPlacesPage />} />
                <Route path="places/new" element={<AdminPlaceEditPage />} />
                <Route path="places/:id/edit" element={<AdminPlaceEditPage />} />
                <Route path="categories" element={<AdminCategoriesPage />} />
                <Route path="reviews" element={<AdminReviewsPage />} />
              </Route>
            </Route>

            {/* Catch-all fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </FavoritesProvider>
    </AuthProvider>
  );
};

export default App;
