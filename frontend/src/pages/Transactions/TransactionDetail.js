// frontend/src/pages/Transactions/TransactionDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiTrash2, FiCheckCircle, FiFile, FiLink, FiX } from 'react-icons/fi';
import { transactionService, invoiceService } from '../../services/api';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const InvoiceLinkSchema = Yup.object().shape({
  invoice_id: Yup.string().required('Une facture est requise'),
});

const TransactionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState(null);
  const [availableInvoices, setAvailableInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLinkForm, setShowLinkForm] = useState(false);
  
  useEffect(() => {
    const fetchTransactionData = async () => {
      try {
        setLoading(true);
        
        // Fetch transaction details
        const transactionResponse = await transactionService.getById(id);
        setTransaction(transactionResponse.data);
        
        // Fetch available invoices if needed
        if (!transactionResponse.data.related_invoice) {
          const invoicesResponse = await invoiceService.getAll({
            status: 'validated',
            page_size: 100,
          });
          setAvailableInvoices(invoicesResponse.data.results);
        }
        
      } catch (err) {
        console.error('Error fetching transaction details:', err);
        setError('Une erreur est survenue lors du chargement des détails de la transaction.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactionData();
  }, [id]);
  
  const handleStatusChange = async (newStatus) => {
    try {
      setLoading(true);
      
      await transactionService.update(id, { status: newStatus });
      
      // Refresh transaction data
      const response = await transactionService.getById(id);
      setTransaction(response.data);
      
    } catch (err) {
      console.error('Error updating transaction status:', err);
      setError('Une erreur est survenue lors de la mise à jour du statut de la transaction.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDeleteTransaction = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette transaction ?')) {
      try {
        setLoading(true);
        
        await transactionService.delete(id);
        
        // Redirect to transaction list
        navigate('/transactions', { 
          state: { 
            message: 'Transaction supprimée avec succès',
            messageType: 'success'
          } 
        });
      } catch (err) {
        console.error('Error deleting transaction:', err);
        setError('Une erreur est survenue lors de la suppression de la transaction.');
        setLoading(false);
      }
    }
  };
  
  const handleLinkInvoice = async (values, { setSubmitting, resetForm }) => {
    try {
      setLoading(true);
      
      await transactionService.reconcileWithInvoice(id, values.invoice_id);
      
      // Refresh transaction data
      const response = await transactionService.getById(id);
      setTransaction(response.data);
      
      // Close form
      setShowLinkForm(false);
      resetForm();
      
    } catch (err) {
      console.error('Error linking invoice:', err);
      setError('Une erreur est survenue lors de la liaison avec la facture.');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };
  
  const handleUnlinkInvoice = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir retirer la liaison avec cette facture ?')) {
      try {
        setLoading(true);
        
        await transactionService.update(id, { 
          related_invoice: null,
          status: 'completed'
        });
        
        // Refresh transaction data
        const response = await transactionService.getById(id);
        setTransaction(response.data);
        
      } catch (err) {
        console.error('Error unlinking invoice:', err);
        setError('Une erreur est survenue lors du retrait de la liaison avec la facture.');
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
  
  const getTypeDisplay = (type) => {
    switch (type) {
      case 'income':
        return 'Recette';
      case 'expense':
        return 'Dépense';
      case 'transfer':
        return 'Virement';
      default:
        return type;
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
  
  if (!transaction) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-yellow-700">Transaction non trouvée.</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/transactions" className="mr-4 text-gray-500 hover:text-gray-700">
            <FiArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">
            Transaction: {transaction.description}
          </h1>
        </div>
        <div className="flex space-x-2">
          {transaction.status !== 'reconciled' && (
            <button
              onClick={() => handleStatusChange(transaction.status === 'pending' ? 'completed' : 'pending')}
              className={`inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md ${
                transaction.status === 'completed'
                  ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                  : 'bg-green-100 text-green-800 hover:bg-green-200'
              }`}
            >
              <FiCheckCircle className="mr-1 h-4 w-4" />
              {transaction.status === 'completed' ? 'Marquer en attente' : 'Marquer comme complété'}
            </button>
          )}
          <Link
            to={`/transactions/${id}/edit`}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200"
          >
            <FiEdit2 className="mr-1 h-4 w-4" />
            Modifier
          </Link>
          <button
            onClick={handleDeleteTransaction}
            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md bg-red-100 text-red-800 hover:bg-red-200"
          >
            <FiTrash2 className="mr-1 h-4 w-4" />
            Supprimer
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Détails de la transaction</h2>
          <span 
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(
              transaction.status
            )}`}
          >
            {transaction.status_display}
          </span>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              <p className="mt-1 text-sm text-gray-900">{transaction.description}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Date</h3>
              <p className="mt-1 text-sm text-gray-900">{formatDate(transaction.transaction_date)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Compte bancaire</h3>
              <p className="mt-1 text-sm text-gray-900">{transaction.bank_account_name}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Type</h3>
              <p className="mt-1 text-sm text-gray-900">{getTypeDisplay(transaction.transaction_type)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Montant</h3>
              <p className={`mt-1 text-sm font-medium ${
                transaction.transaction_type === 'income' ? 'text-green-600' : 
                transaction.transaction_type === 'expense' ? 'text-red-600' : 
                'text-gray-900'
              }`}>
                {transaction.transaction_type === 'income' ? '+' : 
                 transaction.transaction_type === 'expense' ? '-' : ''}
                {formatCurrency(transaction.amount)}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Date de création</h3>
              <p className="mt-1 text-sm text-gray-900">{formatDate(transaction.created_at)}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Dernière mise à jour</h3>
              <p className="mt-1 text-sm text-gray-900">{formatDate(transaction.updated_at)}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Linked Invoice */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Facture associée</h2>
          <div>
            {transaction.related_invoice ? (
              <button
                onClick={handleUnlinkInvoice}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md bg-gray-100 text-gray-800 hover:bg-gray-200"
              >
                <FiX className="mr-1 h-4 w-4" />
                Dissocier
              </button>
            ) : (
              <button
                onClick={() => setShowLinkForm(!showLinkForm)}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md bg-primary text-white hover:bg-primary-dark"
              >
                <FiLink className="mr-1 h-4 w-4" />
                Associer une facture
              </button>
            )}
          </div>
        </div>
        
        <div className="p-6">
          {transaction.related_invoice ? (
            <div>
              <div className="flex items-center mb-4">
                <FiFile className="h-5 w-5 text-gray-400 mr-2" />
                <Link 
                  to={`/invoices/${transaction.related_invoice}`}
                  className="text-primary hover:text-primary-dark font-medium"
                >
                  {transaction.invoice_number}
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Fournisseur</h3>
                  <p className="mt-1 text-sm text-gray-900">{transaction.invoice_supplier || "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Date de facture</h3>
                  <p className="mt-1 text-sm text-gray-900">{transaction.invoice_date ? formatDate(transaction.invoice_date) : "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Montant</h3>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {transaction.invoice_amount ? formatCurrency(transaction.invoice_amount) : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          ) : showLinkForm ? (
            <Formik
              initialValues={{ invoice_id: '' }}
              validationSchema={InvoiceLinkSchema}
              onSubmit={handleLinkInvoice}
            >
              {({ isSubmitting }) => (
                <Form>
                  <div className="mb-4">
                    <label htmlFor="invoice_id" className="block text-sm font-medium text-gray-700">
                      Sélectionner une facture
                    </label>
                    <Field
                      as="select"
                      name="invoice_id"
                      id="invoice_id"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                    >
                      <option value="">Sélectionnez une facture</option>
                      {availableInvoices.map((invoice) => (
                        <option key={invoice.id} value={invoice.id}>
                          {invoice.invoice_number} - {invoice.supplier} ({formatCurrency(invoice.total_amount)})
                        </option>
                      ))}
                    </Field>
                    <ErrorMessage name="invoice_id" component="div" className="mt-1 text-sm text-red-600" />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowLinkForm(false)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      Associer
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          ) : (
            <div className="text-sm text-gray-500 italic">
              Aucune facture associée à cette transaction.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionDetail;