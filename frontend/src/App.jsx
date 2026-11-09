import React, { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import ToastRegion from './components/ToastRegion';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const RecruiterDashboard = lazy(() => import('./pages/RecruiterDashboard'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const JobDetailsPage = lazy(() => import('./pages/JobDetailsPage'));
const StudentProfilePage = lazy(() => import('./pages/StudentProfilePage'));
const EditPortfolioPage = lazy(() => import('./pages/EditPortfolioPage'));
const CompanyProfilePage = lazy(() => import('./pages/CompanyProfilePage'));

function PageLoader() {
  return <main className="app-page-loader" role="status" aria-live="polite">Loading Kairos…</main>;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NotificationProvider>
        <HashRouter>
          <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            <Route
              path="/student"
              element={
                <ProtectedRoute allowedRole="Student">
                  <StudentDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/jobs/:jobId" element={<ProtectedRoute allowedRole="Student"><JobDetailsPage /></ProtectedRoute>} />
            <Route path="/companies/:recruiterId" element={<ProtectedRoute allowedRole="Student"><CompanyProfilePage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute allowedRole="Student"><StudentProfilePage ownProfile /></ProtectedRoute>} />
            <Route path="/portfolio/edit" element={<ProtectedRoute allowedRole="Student"><EditPortfolioPage /></ProtectedRoute>} />
            <Route path="/students/:studentId" element={<ProtectedRoute><StudentProfilePage /></ProtectedRoute>} />

            <Route
              path="/recruiter"
              element={
                <ProtectedRoute allowedRole="Recruiter">
                  <RecruiterDashboard />
                </ProtectedRoute>
              }
            />

            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
          </Suspense>
          <ToastRegion />
        </HashRouter>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
