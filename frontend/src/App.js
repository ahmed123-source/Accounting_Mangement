import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Auth provider
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Layouts
import DashboardLayout from './components/Layout/DashboardLayout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import InvoiceList from './pages/Invoices/InvoiceList';
import InvoiceUpload from './pages/Invoices/InvoiceUpload';

// Protected Route component
const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  // If a role is required, check if user has it
  if (requiredRole && currentUser.role !== requiredRole) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

// Main App component
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            
            {/* Invoice routes */}
            <Route path="invoices" element={<InvoiceList />} />
            <Route path="invoices/upload" element={<InvoiceUpload />} />
            {/*<Route path="invoices/:id" element={<InvoiceDetail />} />*/}
            
            
          </Route>
          
          {/* 404 route */}

        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
