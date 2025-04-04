// frontend/src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token in all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't tried refreshing token yet
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // No refresh token, redirect to login
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        const response = await axios.post(`${API_URL}/token/refresh/`, {
          refresh: refreshToken,
        });
        
        // Save new tokens
        localStorage.setItem('token', response.data.access);
        
        // Retry the original request with new token
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Authentication services
export const authService = {
  login: async (username, password) => {
    const response = await api.post('/token/', { username, password });
    if (response.data.access) {
      localStorage.setItem('token', response.data.access);
      localStorage.setItem('refreshToken', response.data.refresh);
    }
    return response.data;
  },
  
  register: async (userData) => {
    return api.post('/users/register/', userData);
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
  
  getCurrentUser: async () => {
    return api.get('/users/me/');
  },
};

// User services
export const userService = {
  getAll: async () => {
    return api.get('/users/');
  },
  
  getById: async (id) => {
    return api.get(`/users/${id}/`);
  },
  
  update: async (id, userData) => {
    return api.patch(`/users/${id}/`, userData);
  },
  
  delete: async (id) => {
    return api.delete(`/users/${id}/`);
  },
};

// Invoice services
export const invoiceService = {
  getAll: async (params) => {
    return api.get('/invoices/', { params });
  },
  
  getById: async (id) => {
    return api.get(`/invoices/${id}/`);
  },
  
  create: async (invoiceData) => {
    return api.post('/invoices/', invoiceData);
  },
  
  update: async (id, invoiceData) => {
    return api.patch(`/invoices/${id}/`, invoiceData);
  },
  
  delete: async (id) => {
    return api.delete(`/invoices/${id}/`);
  },
  
  uploadWithOcr: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    
    return api.post('/invoices/upload_with_ocr/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// Transaction services
export const transactionService = {
  getAll: async (params) => {
    return api.get('/transactions/', { params });
  },
  
  getById: async (id) => {
    return api.get(`/transactions/${id}/`);
  },
  
  create: async (transactionData) => {
    return api.post('/transactions/', transactionData);
  },
  
  update: async (id, transactionData) => {
    return api.patch(`/transactions/${id}/`, transactionData);
  },
  
  delete: async (id) => {
    return api.delete(`/transactions/${id}/`);
  },
  
  reconcileWithInvoice: async (transactionId, invoiceId) => {
    return api.post('/transactions/reconcile_with_invoice/', {
      transaction_id: transactionId,
      invoice_id: invoiceId,
    });
  },
};

// Bank account services
export const bankAccountService = {
  getAll: async () => {
    return api.get('/bank-accounts/');
  },
  
  getById: async (id) => {
    return api.get(`/bank-accounts/${id}/`);
  },
  
  create: async (bankAccountData) => {
    return api.post('/bank-accounts/', bankAccountData);
  },
  
  update: async (id, bankAccountData) => {
    return api.patch(`/bank-accounts/${id}/`, bankAccountData);
  },
  
  delete: async (id) => {
    return api.delete(`/bank-accounts/${id}/`);
  },
};

// Report services
export const reportService = {
  getAll: async (params) => {
    return api.get('/reports/', { params });
  },
  
  getById: async (id) => {
    return api.get(`/reports/${id}/`);
  },
  
  create: async (reportData) => {
    return api.post('/reports/', reportData);
  },
  
  generateIncomeStatement: async (startDate, endDate) => {
    return api.post('/reports/generate_income_statement/', {
      start_date: startDate,
      end_date: endDate,
    });
  },
};

// Notification services
export const notificationService = {
  getAll: async () => {
    return api.get('/notifications/');
  },
  
  markAsRead: async (id) => {
    return api.patch(`/notifications/${id}/`, { read: true });
  },
  
  markAllAsRead: async () => {
    return api.post('/notifications/mark_all_read/');
  },
};

// Anomaly services
export const anomalyService = {
  getAll: async (params) => {
    return api.get('/anomalies/', { params });
  },
  
  getById: async (id) => {
    return api.get(`/anomalies/${id}/`);
  },
  
  update: async (id, anomalyData) => {
    return api.patch(`/anomalies/${id}/`, anomalyData);
  },
  
  resolve: async (id) => {
    return api.post(`/anomalies/${id}/resolve/`);
  },
  
  markAsFalsePositive: async (id) => {
    return api.post(`/anomalies/${id}/mark_false_positive/`);
  },
};