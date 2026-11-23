import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { L7ajFloating } from '@/components/assistant/L7ajFloating';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-sand-50">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <L7ajFloating />
    </div>
  );
};
