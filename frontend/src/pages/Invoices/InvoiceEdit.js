// frontend/src/pages/Invoices/InvoiceEdit.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { invoiceService } from '../../services/api';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const InvoiceSchema = Yup.object().shape({
  invoice_number: Yup.string().required('Le numéro de facture est requis'),
  supplier: Yup.string().required('Le fournisseur est requis'),
  invoice_date: Yup.date().required('La date de facture est requise'),
  due_date: Yup.date().required('La date d\'échéance est requise'),
  total_amount: Yup.number().required('Le montant total est requis').positive('Le montant doit être positif'),
  tax_amount: Yup.number().required('Le montant de la TVA est requis').min(0, 'Le montant doit être positif ou zéro'),
  status: Yup.string().required('Le statut est requis')
});

const InvoiceEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        setLoading(true);
        const response = await invoiceService.getById(id);
        setInvoice(response.data);
      } catch (err) {
        console.error('Error fetching invoice:', err);
        setError('Une erreur est survenue lors du chargement de la facture.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInvoice();
  }, [id]);
  
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError(null);
      
      // Convert form values to proper format
      const formData = new FormData();
      
      Object.keys(values).forEach(key => {
        formData.append(key, values[key]);
      });
      
      await invoiceService.update(id, values);
      
      navigate(`/invoices/${id}`, {
        state: {
          message: 'Facture mise à jour avec succès!',
          messageType: 'success'
        }
      });
    } catch (err) {
      console.error('Error updating invoice:', err);
      setError('Une erreur est survenue lors de la mise à jour de la facture.');
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
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
          <Link to={`/invoices/${id}`} className="mr-4 text-gray-500 hover:text-gray-700">
            <FiArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">
            Modifier la facture
          </h1>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Détails de la facture</h2>
        </div>
        
        <div className="p-6">
          <Formik
            initialValues={{
              invoice_number: invoice.invoice_number || '',
              supplier: invoice.supplier || '',
              invoice_date: invoice.invoice_date || '',
              due_date: invoice.due_date || '',
              total_amount: invoice.total_amount || '',
              tax_amount: invoice.tax_amount || '',
              status: invoice.status || 'pending'
            }}
            validationSchema={InvoiceSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <label htmlFor="invoice_number" className="block text-sm font-medium text-gray-700">
                      Numéro de facture
                    </label>
                    <Field
                      type="text"
                      name="invoice_number"
                      id="invoice_number"
                      className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                    <ErrorMessage name="invoice_number" component="div" className="mt-1 text-sm text-red-600" />
                  </div>
                  
                  <div>
                    <label htmlFor="supplier" className="block text-sm font-medium text-gray-700">
                      Fournisseur
                    </label>
                    <Field
                      type="text"
                      name="supplier"
                      id="supplier"
                      className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                    <ErrorMessage name="supplier" component="div" className="mt-1 text-sm text-red-600" />
                  </div>
                  
                  <div>
                    <label htmlFor="invoice_date" className="block text-sm font-medium text-gray-700">
                      Date de facture
                    </label>
                    <Field
                      type="date"
                      name="invoice_date"
                      id="invoice_date"
                      className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                    <ErrorMessage name="invoice_date" component="div" className="mt-1 text-sm text-red-600" />
                  </div>
                  
                  <div>
                    <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">
                      Date d'échéance
                    </label>
                    <Field
                      type="date"
                      name="due_date"
                      id="due_date"
                      className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                    <ErrorMessage name="due_date" component="div" className="mt-1 text-sm text-red-600" />
                  </div>
                  
                  <div>
                    <label htmlFor="total_amount" className="block text-sm font-medium text-gray-700">
                      Montant total
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">€</span>
                      </div>
                      <Field
                        type="number"
                        name="total_amount"
                        id="total_amount"
                        step="0.01"
                        min="0"
                        className="focus:ring-primary focus:border-primary block w-full pl-7 sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <ErrorMessage name="total_amount" component="div" className="mt-1 text-sm text-red-600" />
                  </div>
                  
                  <div>
                    <label htmlFor="tax_amount" className="block text-sm font-medium text-gray-700">
                      Montant TVA
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">€</span>
                      </div>
                      <Field
                        type="number"
                        name="tax_amount"
                        id="tax_amount"
                        step="0.01"
                        min="0"
                        className="focus:ring-primary focus:border-primary block w-full pl-7 sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <ErrorMessage name="tax_amount" component="div" className="mt-1 text-sm text-red-600" />
                  </div>
                  
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      Statut
                    </label>
                    <Field
                      as="select"
                      name="status"
                      id="status"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                    >
                      <option value="pending">En attente</option>
                      <option value="processing">En traitement</option>
                      <option value="validated">Validé</option>
                      <option value="error">Erreur</option>
                    </Field>
                    <ErrorMessage name="status" component="div" className="mt-1 text-sm text-red-600" />
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                  <Link
                    to={`/invoices/${id}`}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary mr-2"
                  >
                    Annuler
                  </Link>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                      isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default InvoiceEdit;