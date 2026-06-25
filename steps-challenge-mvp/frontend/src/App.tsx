import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/" replace />;
};

// Admin Route Component (only for admin users)
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  // Debug logging
  console.log('AdminRoute - isAuthenticated:', isAuthenticated);
  console.log('AdminRoute - user:', user);
  console.log('AdminRoute - user?.is_admin:', user?.is_admin);
  console.log('AdminRoute - typeof user?.is_admin:', typeof user?.is_admin);
  
  if (!isAuthenticated) {
    console.log('AdminRoute - Redirecting to / (not authenticated)');
    return <Navigate to="/" replace />;
  }
  
  if (!user?.is_admin) {
    console.log('AdminRoute - Redirecting to /dashboard (not admin)');
    return <Navigate to="/dashboard" replace />;
  }
  
  console.log('AdminRoute - Allowing access to admin panel');
  return <>{children}</>;
};

// Public Route Component (redirect to appropriate dashboard if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <>{children}</>;
  }
  
  // Redirect admins to admin dashboard, regular users to user dashboard
  return <Navigate to={user?.is_admin ? "/admin" : "/dashboard"} replace />;
};

function AppRoutes() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;

// Made with Bob
