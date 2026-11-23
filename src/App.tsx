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

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <BrowserRouter>
          <AuthModal />
          <Routes>
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
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </FavoritesProvider>
    </AuthProvider>
  );
};

export default App;
