// frontend/src/pages/Anomalies/AnomalyList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiFilter, FiCheckCircle, FiXCircle, FiAlertTriangle, FiFileText, FiDollarSign } from 'react-icons/fi';
import { anomalyService } from '../../services/api';

const AnomalyList = () => {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showTypeMenu, setShowTypeMenu] = useState(false);
const [showStatusMenu, setShowStatusMenu] = useState(false);

  
  const fetchAnomalies = async (page = 1, search = '', type = '', status = '') => {
    try {
      setLoading(true);
      const params = {
        page,
        search,
        anomaly_type: type,
        status,
      };
      
      const response = await anomalyService.getAll(params);
      setAnomalies(response.data.results);
      setTotalPages(Math.ceil(response.data.count / 10)); // Assuming 10 items per page
      setCurrentPage(page);
    } catch (err) {
      console.error('Error fetching anomalies:', err);
      setError('Une erreur est survenue lors du chargement des anomalies.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchAnomalies(currentPage, searchTerm, filterType, filterStatus);
  }, [currentPage, searchTerm, filterType, filterStatus]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    fetchAnomalies(1, searchTerm, filterType, filterStatus);
  };
  
  const handleTypeFilter = (type) => {
    setFilterType(type);
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
  
  const handleResolveAnomaly = async (id) => {
    try {
      await anomalyService.resolve(id);
      
      // Refresh the list
      fetchAnomalies(currentPage, searchTerm, filterType, filterStatus);
    } catch (err) {
      console.error('Error resolving anomaly:', err);
      setError('Une erreur est survenue lors de la résolution de l\'anomalie.');
    }
  };
  
  const handleMarkFalsePositive = async (id) => {
    try {
      await anomalyService.markAsFalsePositive(id);
      
      // Refresh the list
      fetchAnomalies(currentPage, searchTerm, filterType, filterStatus);
    } catch (err) {
      console.error('Error marking anomaly as false positive:', err);
      setError('Une erreur est survenue lors du marquage de l\'anomalie comme faux positif.');
    }
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };
  
  const getAnomalyTypeBadgeClass = (type) => {
    switch (type) {
      case 'duplicate_invoice':
        return 'bg-orange-100 text-orange-800';
      case 'amount_mismatch':
        return 'bg-red-100 text-red-800';
      case 'missing_data':
        return 'bg-yellow-100 text-yellow-800';
      case 'unusual_transaction':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'new':
        return 'bg-yellow-100 text-yellow-800';
      case 'investigating':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'false_positive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getAnomalyIcon = (type) => {
    switch (type) {
      case 'duplicate_invoice':
        return <FiFileText className="h-5 w-5 text-orange-500" />;
      case 'amount_mismatch':
        return <FiDollarSign className="h-5 w-5 text-red-500" />;
      case 'missing_data':
        return <FiAlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'unusual_transaction':
        return <FiDollarSign className="h-5 w-5 text-purple-500" />;
      default:
        return <FiAlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Anomalies</h1>
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
                placeholder="Rechercher une anomalie..."
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
          
          <div className="flex space-x-2">
  {/* Type dropdown */}
  <div className="relative inline-block text-left">
    <button
      type="button"
      onClick={() => setShowTypeMenu(open => !open)}
      className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
    >
      <FiFilter className="mr-2 h-5 w-5 text-gray-400" />
      Type
    </button>

    {showTypeMenu && (
      <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
        <div className="py-1" role="none">
          <button
            className={`block w-full px-4 py-2 text-sm ${filterType === '' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
            onClick={() => { handleTypeFilter(''); setShowTypeMenu(false); }}
            role="menuitem"
          >
            Tous les types
          </button>
          <button
            className={`block w-full px-4 py-2 text-sm ${filterType === 'duplicate_invoice' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
            onClick={() => { handleTypeFilter('duplicate_invoice'); setShowTypeMenu(false); }}
            role="menuitem"
          >
            Facture en double
          </button>
          <button
            className={`block w-full px-4 py-2 text-sm ${filterType === 'amount_mismatch' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
            onClick={() => { handleTypeFilter('amount_mismatch'); setShowTypeMenu(false); }}
            role="menuitem"
          >
            Montant incohérent
          </button>
          <button
            className={`block w-full px-4 py-2 text-sm ${filterType === 'missing_data' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
            onClick={() => { handleTypeFilter('missing_data'); setShowTypeMenu(false); }}
            role="menuitem"
          >
            Données manquantes
          </button>
          <button
            className={`block w-full px-4 py-2 text-sm ${filterType === 'unusual_transaction' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
            onClick={() => { handleTypeFilter('unusual_transaction'); setShowTypeMenu(false); }}
            role="menuitem"
          >
            Transaction inhabituelle
          </button>
        </div>
      </div>
    )}
  </div>

  {/* Statut dropdown */}
  <div className="relative inline-block text-left">
    <button
      type="button"
      onClick={() => setShowStatusMenu(open => !open)}
      className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
    >
      <FiFilter className="mr-2 h-5 w-5 text-gray-400" />
      Statut
    </button>

    {showStatusMenu && (
      <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
        <div className="py-1" role="none">
          <button
            className={`block w-full px-4 py-2 text-sm ${filterStatus === '' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
            onClick={() => { handleStatusFilter(''); setShowStatusMenu(false); }}
            role="menuitem"
          >
            Tous les statuts
          </button>
          <button
            className={`block w-full px-4 py-2 text-sm ${filterStatus === 'new' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
            onClick={() => { handleStatusFilter('new'); setShowStatusMenu(false); }}
            role="menuitem"
          >
            Nouveau
          </button>
          <button
            className={`block w-full px-4 py-2 text-sm ${filterStatus === 'investigating' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
            onClick={() => { handleStatusFilter('investigating'); setShowStatusMenu(false); }}
            role="menuitem"
          >
            En cours d'investigation
          </button>
          <button
            className={`block w-full px-4 py-2 text-sm ${filterStatus === 'resolved' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
            onClick={() => { handleStatusFilter('resolved'); setShowStatusMenu(false); }}
            role="menuitem"
          >
            Résolu
          </button>
          <button
            className={`block w-full px-4 py-2 text-sm ${filterStatus === 'false_positive' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
            onClick={() => { handleStatusFilter('false_positive'); setShowStatusMenu(false); }}
            role="menuitem"
          >
            Faux positif
          </button>
        </div>
      </div>
    )}
  </div>
</div>

        </div>
      </div>
      
      {/* Anomalies list */}
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
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Type
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
                    Élément lié
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Détecté le
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
                {anomalies.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                      Aucune anomalie trouvée
                    </td>
                  </tr>
                ) : (
                  anomalies.map((anomaly) => (
                    <tr key={anomaly.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getAnomalyIcon(anomaly.anomaly_type)}
                          <span
                            className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAnomalyTypeBadgeClass(
                              anomaly.anomaly_type
                            )}`}
                          >
                            {anomaly.anomaly_type_display}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-normal">
                        <div className="text-sm text-gray-900">{anomaly.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {anomaly.invoice_number ? (
                            <Link 
                              to={`/invoices/${anomaly.related_invoice}`}
                              className="text-primary hover:text-primary-dark flex items-center"
                            >
                              <FiFileText className="mr-1 h-4 w-4" />
                              {anomaly.invoice_number}
                            </Link>
                          ) : anomaly.transaction_description ? (
                            <Link 
                              to={`/transactions/${anomaly.related_transaction}`}
                              className="text-primary hover:text-primary-dark flex items-center"
                            >
                              <FiDollarSign className="mr-1 h-4 w-4" />
                              {anomaly.transaction_description}
                            </Link>
                          ) : (
                            'N/A'
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(anomaly.detected_at)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
                            anomaly.status
                          )}`}
                        >
                          {anomaly.status_display}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {anomaly.status !== 'resolved' && anomaly.status !== 'false_positive' && (
                            <>
                              <button
                                onClick={() => handleResolveAnomaly(anomaly.id)}
                                className="text-green-600 hover:text-green-900"
                                title="Marquer comme résolu"
                              >
                                <FiCheckCircle className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleMarkFalsePositive(anomaly.id)}
                                className="text-gray-600 hover:text-gray-900"
                                title="Marquer comme faux positif"
                              >
                                <FiXCircle className="h-5 w-5" />
                              </button>
                            </>
                          )}
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
                      <span className="font-medium">{anomalies.length}</span> sur{' '}
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

export default AnomalyList;