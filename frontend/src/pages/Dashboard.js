// frontend/src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiFileText, FiDollarSign, FiAlertTriangle, FiPieChart, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { 
  invoiceService, 
  transactionService, 
  reportService, 
  anomalyService 
} from '../services/api';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    invoiceCount: 0,
    transactionCount: 0,
    anomalyCount: 0,
    totalRevenue: 0,
    totalExpenses: 0,
  });
  
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [recentAnomalies, setRecentAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Chart data
  const [chartData, setChartData] = useState({
    revenueExpenses: {
      labels: [],
      datasets: [],
    },
    invoiceStatus: {
      labels: [],
      datasets: [],
    },
  });
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch invoices
        const invoicesResponse = await invoiceService.getAll();
        setRecentInvoices(invoicesResponse.data.results.slice(0, 5));
        
        // Fetch transactions
        const transactionsResponse = await transactionService.getAll();
        setRecentTransactions(transactionsResponse.data.results.slice(0, 5));
        
        // Fetch anomalies
        const anomaliesResponse = await anomalyService.getAll();
        setRecentAnomalies(anomaliesResponse.data.results.slice(0, 5));
        
        // Calculate stats
        const allTransactions = transactionsResponse.data.results;
        const income = allTransactions
          .filter(t => t.transaction_type === 'income')
          .reduce((sum, t) => sum + parseFloat(t.amount), 0);
          
        const expenses = allTransactions
          .filter(t => t.transaction_type === 'expense')
          .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
        setStats({
          invoiceCount: invoicesResponse.data.count,
          transactionCount: transactionsResponse.data.count,
          anomalyCount: anomaliesResponse.data.count,
          totalRevenue: income,
          totalExpenses: expenses,
        });
        
        // Prepare chart data
        prepareChartData(invoicesResponse.data.results, allTransactions);
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Une erreur est survenue lors du chargement des données du tableau de bord.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  const prepareChartData = (invoices, transactions) => {
    // Prepare revenue and expenses chart data
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - 5 + i);
      return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
    });
    
    const incomeByMonth = {};
    const expensesByMonth = {};
    
    last6Months.forEach(month => {
      incomeByMonth[month] = 0;
      expensesByMonth[month] = 0;
    });
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.transaction_date);
      const monthYear = date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
      
      if (last6Months.includes(monthYear)) {
        if (transaction.transaction_type === 'income') {
          incomeByMonth[monthYear] += parseFloat(transaction.amount);
        } else if (transaction.transaction_type === 'expense') {
          expensesByMonth[monthYear] += parseFloat(transaction.amount);
        }
      }
    });
    
    // Prepare invoice status chart data
    const statusCounts = {
      'pending': 0,
      'processing': 0,
      'validated': 0,
      'error': 0,
    };
    
    invoices.forEach(invoice => {
      if (statusCounts[invoice.status] !== undefined) {
        statusCounts[invoice.status]++;
      }
    });
    
    setChartData({
      revenueExpenses: {
        labels: last6Months,
        datasets: [
          {
            label: 'Revenus',
            data: last6Months.map(month => incomeByMonth[month]),
            borderColor: '#38c172',
            backgroundColor: 'rgba(56, 193, 114, 0.1)',
            tension: 0.3,
          },
          {
            label: 'Dépenses',
            data: last6Months.map(month => expensesByMonth[month]),
            borderColor: '#e3342f',
            backgroundColor: 'rgba(227, 52, 47, 0.1)',
            tension: 0.3,
          },
        ],
      },
      invoiceStatus: {
        labels: ['En attente', 'En traitement', 'Validé', 'Erreur'],
        datasets: [
          {
            label: 'Statut des factures',
            data: [
              statusCounts.pending,
              statusCounts.processing,
              statusCounts.validated,
              statusCounts.error,
            ],
            backgroundColor: [
              'rgba(246, 153, 63, 0.7)',  // warning
              'rgba(52, 144, 220, 0.7)',  // primary
              'rgba(56, 193, 114, 0.7)',  // success
              'rgba(227, 52, 47, 0.7)',   // danger
            ],
          },
        ],
      },
    });
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        {error}
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Tableau de bord</h1>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6 flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm mb-1">Factures</p>
            <p className="text-2xl font-semibold">{stats.invoiceCount}</p>
          </div>
          <div className="p-3 bg-blue-100 rounded-full">
            <FiFileText className="h-6 w-6 text-primary" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm mb-1">Transactions</p>
            <p className="text-2xl font-semibold">{stats.transactionCount}</p>
          </div>
          <div className="p-3 bg-green-100 rounded-full">
            <FiDollarSign className="h-6 w-6 text-success" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm mb-1">Anomalies</p>
            <p className="text-2xl font-semibold">{stats.anomalyCount}</p>
          </div>
          <div className="p-3 bg-red-100 rounded-full">
            <FiAlertTriangle className="h-6 w-6 text-danger" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 flex justify-between items-center">
          <div>
            <p className="text-gray-500 text-sm mb-1">Marge</p>
            <p className="text-2xl font-semibold">
              {formatCurrency(stats.totalRevenue - stats.totalExpenses)}
            </p>
          </div>
          <div className="p-3 bg-purple-100 rounded-full">
            <FiPieChart className="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>
      
      {/* Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Revenus et Dépenses</h2>
          <div className="h-64">
            <Line 
              data={chartData.revenueExpenses} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      callback: (value) => formatCurrency(value),
                    }
                  }
                },
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Statut des Factures</h2>
          <div className="h-64">
            <Bar 
              data={chartData.invoiceStatus} 
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Invoices */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Factures Récentes</h2>
            <Link to="/invoices" className="text-sm text-primary hover:text-primary-dark">
              Voir tout
            </Link>
          </div>
          <div className="divide-y divide-gray-200">
            {recentInvoices.length === 0 ? (
              <div className="p-4 text-gray-500 italic">Aucune facture disponible</div>
            ) : (
              recentInvoices.map((invoice) => (
                <div key={invoice.id} className="p-4 hover:bg-gray-50">
                  <Link to={`/invoices/${invoice.id}`} className="block">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{invoice.invoice_number}</p>
                        <p className="text-sm text-gray-500">{invoice.supplier}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(invoice.total_amount)}</p>
                        <span 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            invoice.status === 'validated' ? 'bg-green-100 text-green-800' :
                            invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            invoice.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}
                        >
                          {invoice.status_display}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Transactions Récentes</h2>
            <Link to="/transactions" className="text-sm text-primary hover:text-primary-dark">
              Voir tout
            </Link>
          </div>
          <div className="divide-y divide-gray-200">
            {recentTransactions.length === 0 ? (
              <div className="p-4 text-gray-500 italic">Aucune transaction disponible</div>
            ) : (
              recentTransactions.map((transaction) => (
                <div key={transaction.id} className="p-4 hover:bg-gray-50">
                  <Link to={`/transactions/${transaction.id}`} className="block">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{transaction.description}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(transaction.transaction_date).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <div className="text-right flex items-center">
                        <div className="mr-3">
                          {transaction.transaction_type === 'income' ? (
                            <FiTrendingUp className="h-5 w-5 text-success" />
                          ) : (
                            <FiTrendingDown className="h-5 w-5 text-danger" />
                          )}
                        </div>
                        <div>
                          <p 
                            className={`font-medium ${
                              transaction.transaction_type === 'income' ? 'text-success' : 'text-danger'
                            }`}
                          >
                            {transaction.transaction_type === 'income' ? '+' : '-'} 
                            {formatCurrency(transaction.amount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Recent Anomalies */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold">Anomalies Détectées</h2>
            <Link to="/anomalies" className="text-sm text-primary hover:text-primary-dark">
              Voir tout
            </Link>
          </div>
          <div className="divide-y divide-gray-200">
            {recentAnomalies.length === 0 ? (
              <div className="p-4 text-gray-500 italic">Aucune anomalie détectée</div>
            ) : (
              recentAnomalies.map((anomaly) => (
                <div key={anomaly.id} className="p-4 hover:bg-gray-50">
                  <div className="block">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{anomaly.anomaly_type_display}</p>
                        <p className="text-sm text-gray-500">
                          {anomaly.invoice_number || anomaly.transaction_description || 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <span 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            anomaly.status === 'resolved' ? 'bg-green-100 text-green-800' :
                            anomaly.status === 'false_positive' ? 'bg-gray-100 text-gray-800' :
                            anomaly.status === 'investigating' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}
                        >
                          {anomaly.status_display}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(anomaly.detected_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;