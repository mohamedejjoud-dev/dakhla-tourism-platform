import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { L7ajFloating } from '@/components/assistant/L7ajFloating';
import { CookieBanner } from '@/components/common/CookieBanner';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#FCFBF8] text-[#1F2933]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <L7ajFloating />
      <CookieBanner />
    </div>
  );
};
