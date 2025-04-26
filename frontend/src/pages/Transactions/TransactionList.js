// frontend/src/pages/Transactions/TransactionList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiSearch, FiFilter, FiDownload, FiDollarSign, FiEye, FiTrash2, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import { transactionService, bankAccountService } from '../../services/api';

const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterBankAccount, setFilterBankAccount] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  
  const fetchTransactions = async (page = 1, search = '', type = '', bank_account = '', status = '') => {
    try {
      setLoading(true);
      const params = {
        page,
        search,
        transaction_type: type,
        bank_account,
        status,
      };
      
      const response = await transactionService.getAll(params);
      setTransactions(response.data.results);
      setTotalPages(Math.ceil(response.data.count / 10)); // Assuming 10 items per page
      setCurrentPage(page);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Une erreur est survenue lors du chargement des transactions.');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchBankAccounts = async () => {
    try {
      const response = await bankAccountService.getAll();
      setBankAccounts(response.data.results);
    } catch (err) {
      console.error('Error fetching bank accounts:', err);
    }
  };
  
  useEffect(() => {
    fetchTransactions(currentPage, searchTerm, filterType, filterBankAccount, filterStatus);
    fetchBankAccounts();
  }, [currentPage, searchTerm, filterType, filterBankAccount, filterStatus]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    fetchTransactions(1, searchTerm, filterType, filterBankAccount, filterStatus);
  };
  
  const handleTypeFilter = (type) => {
    setFilterType(type);
    setCurrentPage(1); // Reset to first page on new filter
  };
  
  const handleBankAccountFilter = (accountId) => {
    setFilterBankAccount(accountId);
    setCurrentPage(1); // Reset to first page on new filter
  };
  
  const handleStatusFilter = (status) => {
    setFilterStatus(status);
    setCurrentPage(1); // Reset to first page on new filter
  };
  
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  
  const handleSelectTransaction = (id) => {
    setSelectedTransactions((prev) => {
      if (prev.includes(id)) {
        return prev.filter(transactionId => transactionId !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  const handleSelectAll = () => {
    if (selectedTransactions.length === transactions.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(transactions.map(transaction => transaction.id));
    }
  };
  
  const handleDeleteSelected = async () => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedTransactions.length} transaction(s) ?`)) {
      try {
        setLoading(true);
        
        // Delete each selected transaction
        for (const id of selectedTransactions) {
          await transactionService.delete(id);
        }
        
        // Refresh the list
        fetchTransactions(currentPage, searchTerm, filterType, filterBankAccount, filterStatus);
        setSelectedTransactions([]);
      } catch (err) {
        console.error('Error deleting transactions:', err);
        setError('Une erreur est survenue lors de la suppression des transactions.');
      } finally {
        setLoading(false);
      }
    }
  };
  
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };
  
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'reconciled':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Transactions</h1>
        <div className="flex space-x-2">
          <Link
            to="/transactions/new"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <FiPlus className="-ml-1 mr-2 h-5 w-5" />
            Nouvelle transaction
          </Link>
        </div>
      </div>
      
      {/* Search and filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <form onSubmit={handleSearch} className="flex-1 max-w-lg">
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="focus:ring-primary focus:border-primary block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="Rechercher une transaction..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="absolute inset-y-0 right-0 flex items-center">
                <button
                  type="submit"
                  className="px-4 py-2 border border-transparent text-sm font-medium rounded-r-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Rechercher
                </button>
              </div>
            </div>
          </form>
          
          <div className="flex flex-wrap gap-2">
            <div className="relative inline-block text-left">
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <FiFilter className="mr-2 h-5 w-5 text-gray-400" />
                Type
              </button>
              
              <div
                className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                role="menu"
                aria-orientation="vertical"
              >
                <div className="py-1" role="none">
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm ${filterType === '' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
                    onClick={() => handleTypeFilter('')}
                    role="menuitem"
                  >
                    Tous les types
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm ${filterType === 'income' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
                    onClick={() => handleTypeFilter('income')}
                    role="menuitem"
                  >
                    Recettes
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm ${filterType === 'expense' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
                    onClick={() => handleTypeFilter('expense')}
                    role="menuitem"
                  >
                    Dépenses
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm ${filterType === 'transfer' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
                    onClick={() => handleTypeFilter('transfer')}
                    role="menuitem"
                  >
                    Virements
                  </button>
                </div>
              </div>
            </div>
            
            <div className="relative inline-block text-left">
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Comptes
              </button>
              
              <div
                className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                role="menu"
                aria-orientation="vertical"
              >
                <div className="py-1" role="none">
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm ${filterBankAccount === '' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
                    onClick={() => handleBankAccountFilter('')}
                    role="menuitem"
                  >
                    Tous les comptes
                  </button>
                  {bankAccounts.map(account => (
                    <button
                      key={account.id}
                      className={`block w-full text-left px-4 py-2 text-sm ${filterBankAccount === account.id ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
                      onClick={() => handleBankAccountFilter(account.id)}
                      role="menuitem"
                    >
                      {account.account_name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="relative inline-block text-left">
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Statut
              </button>
              
              <div
                className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                role="menu"
                aria-orientation="vertical"
              >
                <div className="py-1" role="none">
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm ${filterStatus === '' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
                    onClick={() => handleStatusFilter('')}
                    role="menuitem"
                  >
                    Tous les statuts
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm ${filterStatus === 'pending' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
                    onClick={() => handleStatusFilter('pending')}
                    role="menuitem"
                  >
                    En attente
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm ${filterStatus === 'completed' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
                    onClick={() => handleStatusFilter('completed')}
                    role="menuitem"
                  >
                    Complété
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm ${filterStatus === 'reconciled' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
                    onClick={() => handleStatusFilter('reconciled')}
                    role="menuitem"
                  >
                    Rapproché
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm ${filterStatus === 'failed' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
                    onClick={() => handleStatusFilter('failed')}
                    role="menuitem"
                  >
                    Échoué
                  </button>
                </div>
              </div>
            </div>
            
            <button
              type="button"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              <FiDownload className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
              Exporter
            </button>
          </div>
        </div>
      </div>
      
      {/* Transaction list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
            <div className="flex px-6 py-3 bg-gray-50 border-b border-gray-200">
              <div className="w-12 flex items-center">
                <input
                  type="checkbox"
                  className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                  checked={selectedTransactions.length === transactions.length && transactions.length > 0}
                  onChange={handleSelectAll}
                />
              </div>
              <div className="flex-1 flex items-center justify-between">
                <div className="flex space-x-2">
                  {selectedTransactions.length > 0 && (
                    <button
                      onClick={handleDeleteSelected}
                      className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-danger hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-danger"
                    >
                      <FiTrash2 className="mr-1 h-4 w-4" />
                      Supprimer ({selectedTransactions.length})
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="w-12 px-6 py-3"></th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Description
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Compte
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Type
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Montant
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Statut
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                      Aucune transaction trouvée
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                            checked={selectedTransactions.includes(transaction.id)}
                            onChange={() => handleSelectTransaction(transaction.id)}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(transaction.transaction_date)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-normal">
                        <div className="text-sm text-gray-900">{transaction.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{transaction.bank_account_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {transaction.transaction_type === 'income' ? (
                            <FiTrendingUp className="mr-1 h-4 w-4 text-green-500" />
                          ) : transaction.transaction_type === 'expense' ? (
                            <FiTrendingDown className="mr-1 h-4 w-4 text-red-500" />
                          ) : (
                            <FiDollarSign className="mr-1 h-4 w-4 text-gray-500" />
                          )}
                          <span className="text-sm text-gray-900">{transaction.transaction_type_display}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div 
                          className={`text-sm font-medium ${
                            transaction.transaction_type === 'income' ? 'text-green-600' : 
                            transaction.transaction_type === 'expense' ? 'text-red-600' : 
                            'text-gray-900'
                          }`}
                        >
                          {transaction.transaction_type === 'income' ? '+' : 
                           transaction.transaction_type === 'expense' ? '-' : ''}
                          {formatCurrency(transaction.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                            transaction.status
                          )}`}
                        >
                          {transaction.status_display}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Link
                            to={`/transactions/${transaction.id}`}
                            className="text-primary hover:text-primary-dark"
                          >
                            <FiEye className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => {
                              if (window.confirm('Êtes-vous sûr de vouloir supprimer cette transaction ?')) {
                                transactionService.delete(transaction.id).then(() => {
                                  fetchTransactions(currentPage, searchTerm, filterType, filterBankAccount, filterStatus);
                                });
                              }
                            }}
                            className="text-danger hover:text-red-700"
                          >
                            <FiTrash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            
            {/* Pagination */}
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Précédent
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                      currentPage === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Suivant
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Affichage de <span className="font-medium">1</span> à{' '}
                      <span className="font-medium">{transactions.length}</span> sur{' '}
                      <span className="font-medium">{totalPages * 10}</span> résultats
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === 1
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Précédent</span>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                      
                      {/* Page buttons */}
                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i}
                          onClick={() => handlePageChange(i + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border ${
                            currentPage === i + 1
                              ? 'z-10 bg-primary border-primary text-white'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          } text-sm font-medium`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                          currentPage === totalPages
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        <span className="sr-only">Suivant</span>
                        <svg
                          className="h-5 w-5"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TransactionList;