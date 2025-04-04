// frontend/src/pages/Invoices/InvoiceDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiTrash2, FiDownload, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import { invoiceService, transactionService } from '../../services/api';

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [relatedTransactions, setRelatedTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchInvoiceData = async () => {
      try {
        setLoading(true);
        
        // Fetch invoice details
        const invoiceResponse = await invoiceService.getById(id);
        setInvoice(invoiceResponse.data);
        
        // Fetch related transactions
        const transactionsResponse = await transactionService.getAll({
          related_invoice: id
        });
        setRelatedTransactions(transactionsResponse.data.results);
        
      } catch (err) {
        console.error('Error fetching invoice details:', err);
        setError('Une erreur est survenue lors du chargement des détails de la facture.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvoiceData();
  }, [id]);
  
  const handleStatusChange = async (newStatus) => {
    try {
      setLoading(true);
      
      await invoiceService.update(id, { status: newStatus });
      
      // Refresh invoice data
      const response = await invoiceService.getById(id);
      setInvoice(response.data);
      
    } catch (err) {
      console.error('Error updating invoice status:', err);
      setError('Une erreur est survenue lors de la mise à jour du statut de la facture.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteInvoice = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
      try {
        setLoading(true);
        
        await invoiceService.delete(id);
        
        // Redirect to invoice list
        navigate('/invoices', { 
          state: { 
            message: 'Facture supprimée avec succès',
            messageType: 'success'
          } 
        });
      } catch (err) {
        console.error('Error deleting invoice:', err);
        setError('Une erreur est survenue lors de la suppression de la facture.');
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
      case 'validated':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
      <div className="bg-red-50 border-l-4 border-red-400 p-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!invoice) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-yellow-700">Facture non trouvée.</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/invoices" className="mr-4 text-gray-500 hover:text-gray-700">
            <FiArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">
            Facture: {invoice.invoice_number}
          </h1>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handleStatusChange('validated')}
            disabled={invoice.status === 'validated'}
            className={`inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md ${
              invoice.status === 'validated'
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-green-100 text-green-800 hover:bg-green-200'
            }`}
          >
            <FiCheckCircle className="mr-1 h-4 w-4" />
            Valider
          </button>
          <Link
            to={`/invoices/${id}/edit`}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200"
          >
            <FiEdit2 className="mr-1 h-4 w-4" />
            Modifier
          </Link>
          <button
            onClick={handleDeleteInvoice}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md bg-red-100 text-red-800 hover:bg-red-200"
          >
            <FiTrash2 className="mr-1 h-4 w-4" />
            Supprimer
          </button>
          {invoice.original_file && (
            <a
              href={invoice.original_file}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200"
            >
              <FiDownload className="mr-1 h-4 w-4" />
              Télécharger
            </a>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Détails de la facture</h2>
          <span 
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
              invoice.status
            )}`}
          >
            {invoice.status_display}
          </span>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Fournisseur</h3>
              <p className="mt-1 text-sm text-gray-900">{invoice.supplier}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Numéro de facture</h3>
              <p className="mt-1 text-sm text-gray-900">{invoice.invoice_number}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Date de facture</h3>
              <p className="mt-1 text-sm text-gray-900">{formatDate(invoice.invoice_date)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Date d'échéance</h3>
              <p className="mt-1 text-sm text-gray-900">{formatDate(invoice.due_date)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Montant HT</h3>
              <p className="mt-1 text-sm text-gray-900">
                {formatCurrency(invoice.total_amount - invoice.tax_amount)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Montant TVA</h3>
              <p className="mt-1 text-sm text-gray-900">{formatCurrency(invoice.tax_amount)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Montant total</h3>
              <p className="mt-1 text-sm font-gray-900 font-medium">{formatCurrency(invoice.total_amount)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Ajouté par</h3>
              <p className="mt-1 text-sm text-gray-900">{invoice.uploaded_by_username}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Invoice Items */}
      {invoice.items && invoice.items.length > 0 && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Lignes de facture</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Description
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Quantité
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Prix unitaire
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoice.items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">
                      {item.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(item.unit_price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {formatCurrency(item.total_price)}
                    </td>
                  </tr>
                ))}
                <tr className="bg-gray-50">
                  <td colSpan="3" className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                    Total HT
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                    {formatCurrency(invoice.total_amount - invoice.tax_amount)}
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td colSpan="3" className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                    TVA
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                    {formatCurrency(invoice.tax_amount)}
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td colSpan="3" className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                    Total TTC
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right">
                    {formatCurrency(invoice.total_amount)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Related Transactions */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Transactions liées</h2>
        </div>
        
        {relatedTransactions.length === 0 ? (
          <div className="p-6 text-sm text-gray-500 italic">
            Aucune transaction liée à cette facture.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {relatedTransactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(transaction.transaction_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-normal text-sm text-gray-900">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.bank_account_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {transaction.transaction_type_display}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                      <span 
                        className={transaction.transaction_type === 'income' ? 'text-green-600' : 'text-red-600'}
                      >
                        {transaction.transaction_type === 'income' ? '+' : '-'} 
                        {formatCurrency(transaction.amount)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                          transaction.status === 'reconciled' ? 'bg-blue-100 text-blue-800' :
                          transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}
                      >
                        {transaction.status_display}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceDetail;