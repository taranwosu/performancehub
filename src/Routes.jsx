// src/Routes.jsx
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import { useAuth } from "./context/SupabaseProvider";

// Lazy load page components for better performance
const Login = lazy(() => import("pages/login"));
const Dashboard = lazy(() => import("pages/dashboard"));
const GoalsManagement = lazy(() => import("pages/goals-management"));
const PerformanceReviews = lazy(() => import("pages/performance-reviews"));
const TeamAnalytics = lazy(() => import("pages/team-analytics"));
const PIPs = lazy(() => import("pages/pips"));
const OKRs = lazy(() => import("pages/okrs"));
const Profile = lazy(() => import("pages/profile"));

// Loading component for Suspense fallback
const PageLoader = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      <p className="text-text-secondary text-sm">Loading...</p>
    </div>
  </div>
);

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" replace />;
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return user ? <Navigate to="/dashboard" replace /> : children;
};

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <Suspense fallback={<PageLoader />}>
          <RouterRoutes>
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/goals-management" element={
              <ProtectedRoute>
                <GoalsManagement />
              </ProtectedRoute>
            } />
            <Route path="/performance-reviews" element={
              <ProtectedRoute>
                <PerformanceReviews />
              </ProtectedRoute>
            } />
            <Route path="/team-analytics" element={
              <ProtectedRoute>
                <TeamAnalytics />
              </ProtectedRoute>
            } />
            <Route path="/pips" element={
              <ProtectedRoute>
                <PIPs />
              </ProtectedRoute>
            } />
            <Route path="/okrs" element={
              <ProtectedRoute>
                <OKRs />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="*" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
          </RouterRoutes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;