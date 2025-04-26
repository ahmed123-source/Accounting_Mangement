// frontend/src/pages/Reports/ReportList.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiSearch, FiFilter, FiDownload, FiFileText, FiEye, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import { reportService } from '../../services/api';
import dayjs from 'dayjs';

const ReportList = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReports, setSelectedReports] = useState([]);
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [reportFormData, setReportFormData] = useState({
    title: '',
    report_type: 'income_statement',
    start_date: dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
    end_date: dayjs().format('YYYY-MM-DD')
  });
  
  const fetchReports = async (page = 1, search = '', type = '') => {
    try {
      setLoading(true);
      const params = {
        page,
        search,
        report_type: type,
      };
      
      const response = await reportService.getAll(params);
      setReports(response.data.results);
      setTotalPages(Math.ceil(response.data.count / 10)); // Assuming 10 items per page
      setCurrentPage(page);
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Une erreur est survenue lors du chargement des rapports.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchReports(currentPage, searchTerm, filterType);
  }, [currentPage, searchTerm, filterType]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    fetchReports(1, searchTerm, filterType);
  };
  
  const handleTypeFilter = (type) => {
    setFilterType(type);
    setCurrentPage(1); // Reset to first page on new filter
  };
  
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  
  const handleSelectReport = (id) => {
    setSelectedReports((prev) => {
      if (prev.includes(id)) {
        return prev.filter(reportId => reportId !== id);
      } else {
        return [...prev, id];
      }
    });
  };
  
  const handleSelectAll = () => {
    if (selectedReports.length === reports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(reports.map(report => report.id));
    }
  };
  
  const handleDeleteSelected = async () => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${selectedReports.length} rapport(s) ?`)) {
      try {
        setLoading(true);
        
        // Delete each selected report
        for (const id of selectedReports) {
          await reportService.delete(id);
        }
        
        // Refresh the list
        fetchReports(currentPage, searchTerm, filterType);
        setSelectedReports([]);
      } catch (err) {
        console.error('Error deleting reports:', err);
        setError('Une erreur est survenue lors de la suppression des rapports.');
      } finally {
        setLoading(false);
      }
    }
  };
  
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setReportFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleGenerateReport = async (e) => {
    e.preventDefault();
    try {
      setGeneratingReport(true);
      
      // Generate the report based on type
      if (reportFormData.report_type === 'income_statement') {
        await reportService.generateIncomeStatement(
          reportFormData.start_date,
          reportFormData.end_date
        );
      } else {
        // Create generic report
        await reportService.create(reportFormData);
      }
      
      // Refresh reports list
      fetchReports(1, searchTerm, filterType);
      
      // Reset form
      setShowGenerateForm(false);
      setReportFormData({
        title: '',
        report_type: 'income_statement',
        start_date: dayjs().subtract(1, 'month').format('YYYY-MM-DD'),
        end_date: dayjs().format('YYYY-MM-DD')
      });
      
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Une erreur est survenue lors de la génération du rapport.');
    } finally {
      setGeneratingReport(false);
    }
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };
  
  const getReportTypeBadgeClass = (type) => {
    switch (type) {
      case 'income_statement':
        return 'bg-green-100 text-green-800';
      case 'balance_sheet':
        return 'bg-blue-100 text-blue-800';
      case 'cash_flow':
        return 'bg-purple-100 text-purple-800';
      case 'tax_report':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900">Rapports</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowGenerateForm(!showGenerateForm)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <FiPlus className="-ml-1 mr-2 h-5 w-5" />
            Générer un rapport
          </button>
        </div>
      </div>
      
      {/* Report generation form */}
      {showGenerateForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Générer un nouveau rapport</h2>
          <form onSubmit={handleGenerateReport}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Titre du rapport
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={reportFormData.title}
                  onChange={handleFormChange}
                  className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="Ex: Rapport financier Q1 2023"
                  required
                />
              </div>
              <div>
                <label htmlFor="report_type" className="block text-sm font-medium text-gray-700">
                  Type de rapport
                </label>
                <select
                  id="report_type"
                  name="report_type"
                  value={reportFormData.report_type}
                  onChange={handleFormChange}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                >
                  <option value="income_statement">Compte de résultat</option>
                  <option value="balance_sheet">Bilan comptable</option>
                  <option value="cash_flow">Flux de trésorerie</option>
                  <option value="tax_report">Rapport fiscal</option>
                  <option value="custom">Rapport personnalisé</option>
                </select>
              </div>
              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                  Date de début
                </label>
                <input
                  type="date"
                  name="start_date"
                  id="start_date"
                  value={reportFormData.start_date}
                  onChange={handleFormChange}
                  className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                  Date de fin
                </label>
                <input
                  type="date"
                  name="end_date"
                  id="end_date"
                  value={reportFormData.end_date}
                  onChange={handleFormChange}
                  className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowGenerateForm(false)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={generatingReport}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                {generatingReport ? (
                  <>
                    <FiRefreshCw className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <FiPlus className="-ml-1 mr-2 h-5 w-5" />
                    Générer
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
      
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
                placeholder="Rechercher un rapport..."
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
            <div className="relative inline-block text-left">
              <button
                type="button"
                className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <FiFilter className="mr-2 h-5 w-5 text-gray-400" />
                Filtrer
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
                    className={`block w-full text-left px-4 py-2 text-sm ${filterType === 'income_statement' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
                    onClick={() => handleTypeFilter('income_statement')}
                    role="menuitem"
                  >
                    Compte de résultat
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm ${filterType === 'balance_sheet' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
                    onClick={() => handleTypeFilter('balance_sheet')}
                    role="menuitem"
                  >
                    Bilan comptable
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm ${filterType === 'cash_flow' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
                    onClick={() => handleTypeFilter('cash_flow')}
                    role="menuitem"
                  >
                    Flux de trésorerie
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm ${filterType === 'tax_report' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
                    onClick={() => handleTypeFilter('tax_report')}
                    role="menuitem"
                  >
                    Rapport fiscal
                  </button>
                  <button
                    className={`block w-full text-left px-4 py-2 text-sm ${filterType === 'custom' ? 'bg-gray-100 text-gray-900' : 'text-gray-700'}`}
                    onClick={() => handleTypeFilter('custom')}
                    role="menuitem"
                  >
                    Rapport personnalisé
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
      
      {/* Reports list */}
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
                  checked={selectedReports.length === reports.length && reports.length > 0}
                  onChange={handleSelectAll}
                />
              </div>
              <div className="flex-1 flex items-center justify-between">
                <div className="flex space-x-2">
                  {selectedReports.length > 0 && (
                    <button
                      onClick={handleDeleteSelected}
                      className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-danger hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-danger"
                    >
                      <FiTrash2 className="mr-1 h-4 w-4" />
                      Supprimer ({selectedReports.length})
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
                    Titre
                  </th>
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
                    Période
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Créé par
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Date de création
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
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                      Aucun rapport trouvé
                    </td>
                  </tr>
                ) : (
                  reports.map((report) => (
                    <tr key={report.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                            checked={selectedReports.includes(report.id)}
                            onChange={() => handleSelectReport(report.id)}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FiFileText className="h-5 w-5 text-gray-400 mr-2" />
                          <div className="text-sm font-medium text-gray-900">
                            {report.title}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getReportTypeBadgeClass(
                            report.report_type
                          )}`}
                        >
                          {report.report_type_display}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatDate(report.start_date)} - {formatDate(report.end_date)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{report.generated_by_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(report.created_at)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {report.file && (
                            <a
                              href={report.file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary-dark"
                              title="Télécharger"
                            >
                              <FiDownload className="h-5 w-5" />
                            </a>
                          )}
                          <Link
                            to={`/reports/${report.id}`}
                            className="text-primary hover:text-primary-dark"
                            title="Voir"
                          >
                            <FiEye className="h-5 w-5" />
                          </Link>
                          <button
                            onClick={() => {
                              if (window.confirm('Êtes-vous sûr de vouloir supprimer ce rapport ?')) {
                                reportService.delete(report.id).then(() => {
                                  fetchReports(currentPage, searchTerm, filterType);
                                });
                              }
                            }}
                            className="text-danger hover:text-red-700"
                            title="Supprimer"
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
                      <span className="font-medium">{reports.length}</span> sur{' '}
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

export default ReportList;