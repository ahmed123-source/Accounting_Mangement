// frontend/src/pages/Invoices/InvoiceUpload.js
import React, { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiFileText, FiCheck, FiX, FiArrowLeft } from 'react-icons/fi';
import { invoiceService } from '../../services/api';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const InvoiceUploadSchema = Yup.object().shape({
  invoice_number: Yup.string().required('Le numéro de facture est requis'),
  supplier: Yup.string().required('Le fournisseur est requis'),
  invoice_date: Yup.date().required('La date de facture est requise'),
  due_date: Yup.date().required('La date d\'échéance est requise'),
  total_amount: Yup.number().required('Le montant total est requis').positive('Le montant doit être positif'),
  tax_amount: Yup.number().required('Le montant de la TVA est requis').min(0, 'Le montant doit être positif ou zéro'),
});

const InvoiceUpload = () => {
  const navigate = useNavigate();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [ocrData, setOcrData] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  
  // File dropzone
  const onDrop = useCallback((acceptedFiles) => {
    // Only accept the first file, replace any previous files
    if (acceptedFiles.length > 0) {
      setFiles([acceptedFiles[0]]);
    }
  }, []);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'application/pdf': [],
    },
    maxFiles: 1,
    multiple: false,
  });
  
  // Process file with OCR
  const processWithOcr = async () => {
    if (files.length === 0) {
      setError('Veuillez d\'abord télécharger un fichier.');
      return;
    }
    
    try {
      setOcrProcessing(true);
      setError(null);
      
      // Upload file for OCR processing
      const formData = new FormData();
      formData.append('file', files[0]);
      
      // Simulate upload progress (in a real app, you'd use axios progress events)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);
      
      const response = await invoiceService.uploadWithOcr(formData);
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Set OCR data
      setOcrData({
        invoice_number: response.data.invoice_number,
        supplier: response.data.supplier,
        invoice_date: response.data.invoice_date,
        due_date: response.data.due_date,
        total_amount: response.data.total_amount,
        tax_amount: response.data.tax_amount,
        items: response.data.items || [],
      });
      
    } catch (err) {
      console.error('Error processing with OCR:', err);
      setError('Une erreur est survenue lors du traitement OCR. Veuillez réessayer ou saisir les données manuellement.');
    } finally {
      setOcrProcessing(false);
    }
  };
  
  // Remove file
  const removeFile = () => {
    setFiles([]);
    setOcrData(null);
    setUploadProgress(0);
  };
  
  // Submit form
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setUploading(true);
      setError(null);
      
      // Create a FormData object
      const formData = new FormData();
      
      // Append file if available
      if (files.length > 0) {
        formData.append('original_file', files[0]);
      }
      
      // Append other form data
      Object.keys(values).forEach(key => {
        formData.append(key, values[key]);
      });
      
      // Submit the invoice
      await invoiceService.create(formData);
      
      // Redirect to invoice list
      navigate('/invoices', { 
        state: { 
          message: 'Facture ajoutée avec succès!',
          messageType: 'success'
        } 
      });
    } catch (err) {
      console.error('Error uploading invoice:', err);
      setError('Une erreur est survenue lors de l\'ajout de la facture. Veuillez réessayer.');
    } finally {
      setUploading(false);
      setSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/invoices" className="mr-4 text-gray-500 hover:text-gray-700">
            <FiArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">Ajouter une facture</h1>
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
          <h2 className="text-lg font-medium text-gray-900">Télécharger un document</h2>
          <p className="mt-1 text-sm text-gray-500">
            Téléchargez une facture pour extraire automatiquement les données via OCR ou saisissez les informations manuellement.
          </p>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* File Upload */}
            <div>
              <div
                {...getRootProps()}
                className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
                  isDragActive ? 'border-primary bg-blue-50' : 'border-gray-300 hover:border-primary'
                }`}
              >
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none">
                      <span>Télécharger un fichier</span>
                      <input {...getInputProps()} className="sr-only" />
                    </label>
                    <p className="pl-1">ou glisser-déposer</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, PDF jusqu'à 10MB</p>
                </div>
              </div>
              
              {files.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
                    <div className="flex items-center">
                      <FiFileText className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {files[0].name}
                      </span>
                      <span className="ml-2 text-sm text-gray-500">
                        ({Math.round(files[0].size / 1024)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      <FiX className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={processWithOcr}
                      disabled={ocrProcessing || uploading}
                      className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                        (ocrProcessing || uploading) ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      <FiUpload className="mr-2 h-5 w-5" />
                      {ocrProcessing ? 'Traitement OCR en cours...' : 'Traiter avec OCR'}
                    </button>
                  </div>
                  
                  {ocrProcessing && (
                    <div className="mt-4">
                      <div className="relative pt-1">
                        <div className="flex mb-2 items-center justify-between">
                          <div>
                            <span className="text-xs font-semibold inline-block text-primary">
                              {uploadProgress}%
                            </span>
                          </div>
                        </div>
                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-primary-light">
                          <div
                            style={{ width: `${uploadProgress}%` }}
                            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-500"
                          ></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Invoice Form */}
            <div>
              <Formik
                initialValues={{
                  invoice_number: ocrData?.invoice_number || '',
                  supplier: ocrData?.supplier || '',
                  invoice_date: ocrData?.invoice_date || '',
                  due_date: ocrData?.due_date || '',
                  total_amount: ocrData?.total_amount || '',
                  tax_amount: ocrData?.tax_amount || '',
                }}
                enableReinitialize={true}
                validationSchema={InvoiceUploadSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting, values }) => (
                  <Form className="space-y-4">
                    <div className="grid grid-cols-1 gap-y-4">
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
                        <ErrorMessage name="invoice_number" component="div" className="text-danger text-xs mt-1" />
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
                        <ErrorMessage name="supplier" component="div" className="text-danger text-xs mt-1" />
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                          <ErrorMessage name="invoice_date" component="div" className="text-danger text-xs mt-1" />
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
                          <ErrorMessage name="due_date" component="div" className="text-danger text-xs mt-1" />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                          <ErrorMessage name="total_amount" component="div" className="text-danger text-xs mt-1" />
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
                          <ErrorMessage name="tax_amount" component="div" className="text-danger text-xs mt-1" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                      <Link
                        to="/invoices"
                        className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary mr-2"
                      >
                        Annuler
                      </Link>
                      <button
                        type="submit"
                        disabled={isSubmitting || uploading}
                        className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                          (isSubmitting || uploading) ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                      >
                        {isSubmitting || uploading ? 'Enregistrement...' : 'Enregistrer'}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceUpload;