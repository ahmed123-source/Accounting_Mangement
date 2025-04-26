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
import InvoiceDetail from './pages/Invoices/InvoiceDetails';
import TransactionList from './pages/Transactions/TransactionList';
import TransactionDetail from './pages/Transactions/TransactionDetail';
import TransactionCreate from './pages/Transactions/TransactionCreate'; 
import BankAccountList from './pages/BankAccounts/BankAccountList';
import BankAccountCreate from './pages/BankAccounts/BankAccountCreate';
import ReportList from './pages/Reports/ReportList';
import AnomalyList from './pages/Anomalies/AnomalyList';
import UserList from './pages/Users/UserList';
import UserDetail from './pages/Users/UserDetails';
//import NotFound from './pages/NotFound';

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
            <Route path="invoices/:id" element={<InvoiceDetail />} />
            
            {/* Transaction routes */}
            <Route path="transactions" element={<TransactionList />} />
            <Route path="transactions/new" element={<TransactionCreate />} /> {/* Nouvelle route */}
            <Route path="transactions/:id" element={<TransactionDetail />} />
            
            {/* Bank Account routes */}
            <Route path="bank-accounts" element={<BankAccountList />} />
            <Route path="bank-accounts/new" element={<BankAccountCreate />} />
                        
            {/* Report routes */}
            <Route path="reports" element={<ReportList />} />
            
            {/* Anomaly routes */}
            <Route path="anomalies" element={<AnomalyList />} />
            
            {/* User management (admin only) */}
            <Route
              path="users"
              element={
                <ProtectedRoute requiredRole="admin">
                  <UserList />
                </ProtectedRoute>
              }
            />
            <Route
              path="users/:id"
              element={
                <ProtectedRoute requiredRole="admin">
                  <UserDetail />
                </ProtectedRoute>
              }
            />
          </Route>
          
          {/* 404 route */}
          {/*<Route path="*" element={<NotFound />} />*/}
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;