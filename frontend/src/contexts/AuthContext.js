// frontend/src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { authService } from '../services/api';

// Create context
const AuthContext = createContext(null);

// Create provider
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Function to load user data
  const loadUser = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (token) {
        const { data } = await authService.getCurrentUser();
        setCurrentUser(data);
      }
    } catch (err) {
      console.error('Failed to load user', err);
      // Clear storage in case of error
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setCurrentUser(null);
      setError('Session expired. Please log in again.');
    } finally {
      setLoading(false);
    }
  };

  // Load user on component mount
  useEffect(() => {
    loadUser();
  }, []);

  // Login function
  const login = async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await authService.login(username, password);
      
      // Load user data
      await loadUser();
      
      return data;
    } catch (err) {
      console.error('Login failed', err);
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const { data } = await authService.register(userData);
      
      // Auto-login after registration
      await login(userData.username, userData.password);
      
      return data;
    } catch (err) {
      console.error('Registration failed', err);
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const value = {
    currentUser,
    loading,
    error,
    login,
    register,
    logout,
    loadUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};