import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout.jsx';
import LandingPage from '../pages/LandingPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import ProtectedRoute from './ProtectedRoute.jsx';
import PublicRoute from './PublicRoute.jsx';
import AdminRoute from './AdminRoute.jsx';

// Course Management Pages
import Courses from '../pages/Courses.jsx';
import CourseDetails from '../pages/CourseDetails.jsx';
import LessonViewer from '../pages/LessonViewer.jsx';
import MyCourses from '../pages/MyCourses.jsx';
import AdminCourses from '../pages/admin/AdminCourses.jsx';
import AdminCourseForm from '../pages/admin/AdminCourseForm.jsx';
import LearningAnalytics from '../pages/LearningAnalytics.jsx';

/**
 * Centralized Route Configuration for NeuroLearn
 * Configured with HttpOnly cookie session verification and route guards
 */
export const AppRoutes = () => {
  return (
    <Routes>
      {/* Primary Layout Shell */}
      <Route element={<MainLayout />}>
        {/* Public Marketing Overview */}
        <Route path="/" element={<LandingPage />} />

        {/* Public Course Discovery & Lesson Learning Viewer */}
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:slug" element={<CourseDetails />} />
        <Route path="/courses/:slug/lessons/:lessonId" element={<LessonViewer />} />

        {/* Public-Only Auth Routes (Redirects to /dashboard if logged in) */}
        <Route element={<PublicRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Protected Student Routes (Redirects to /login if unauthenticated) */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/analytics" element={<LearningAnalytics />} />
        </Route>

        {/* Protected Admin Routes (Requires admin role) */}
        <Route element={<AdminRoute />}>
          <Route path="/admin/courses" element={<AdminCourses />} />
          <Route path="/admin/courses/create" element={<AdminCourseForm />} />
          <Route path="/admin/courses/:courseId/edit" element={<AdminCourseForm />} />
        </Route>

        {/* Catch-all 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;

