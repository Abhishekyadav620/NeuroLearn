import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout.jsx';
import LandingPage from '../pages/LandingPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';

/**
 * Centralized Route Configuration for NeuroLearn
 * Designed to cleanly scale with Authenticated and Admin route guards
 */
export const AppRoutes = () => {
  return (
    <Routes>
      {/* Primary Layout Routes */}
      <Route element={<MainLayout />}>
        {/* Landing / Overview Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Student Dashboard Placeholder */}
        <Route path="/dashboard" element={<DashboardPage />} />

        {/* Catch-all 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
