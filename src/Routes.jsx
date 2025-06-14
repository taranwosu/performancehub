// src/Routes.jsx
import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import { useAuth } from "./context/SupabaseProvider";

// Page imports
import Login from "pages/login";
import Dashboard from "pages/dashboard";
import GoalsManagement from "pages/goals-management";
import PerformanceReviews from "pages/performance-reviews";
import TeamAnalytics from "pages/team-analytics";
import PIPs from "pages/pips";
import OKRs from "pages/okrs";
import Profile from "pages/profile";

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
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;