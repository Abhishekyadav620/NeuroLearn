import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';

/**
 * Main Layout wrapper accommodating:
 * - Public marketing & overview pages
 * - Authenticated student pages
 * - Future administrative pages
 */
export const MainLayout = ({ children, hideFooter = false }) => {
  return (
    <div className="min-h-screen flex flex-col bg-neuro-bg text-neuro-text selection:bg-neuro-purple selection:text-white">
      <Navbar />
      <main className="flex-1 flex flex-col">
        {children || <Outlet />}
      </main>
      {!hideFooter && <Footer />}
    </div>
  );
};

export default MainLayout;
