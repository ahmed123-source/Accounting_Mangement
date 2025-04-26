// frontend/src/pages/Transactions/TransactionCreate.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiSave } from 'react-icons/fi';
import { transactionService, bankAccountService } from '../../services/api';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const TransactionSchema = Yup.object().shape({
  description: Yup.string().required('La description est requise'),
  transaction_date: Yup.date().required('La date de transaction est requise'),
  amount: Yup.number().required('Le montant est requis').positive('Le montant doit être positif'),
  transaction_type: Yup.string()
    .oneOf(['income', 'expense', 'transfer'], 'Type de transaction invalide')
    .required('Le type de transaction est requis'),
  bank_account: Yup.string().required('Le compte bancaire est requis'),
  status: Yup.string()
    .oneOf(['pending', 'completed', 'reconciled', 'failed'], 'Statut invalide')
    .required('Le statut est requis'),
});

const TransactionCreate = () => {
  const navigate = useNavigate();
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBankAccounts = async () => {
      try {
        setLoading(true);
        const response = await bankAccountService.getAll();
        if (response.data.results && response.data.results.length > 0) {
          setBankAccounts(response.data.results);
        } else {
          setError("Aucun compte bancaire disponible. Veuillez d'abord créer un compte bancaire.");
        }
      } catch (err) {
        console.error('Error fetching bank accounts:', err);
        setError('Une erreur est survenue lors du chargement des comptes bancaires.');
      } finally {
        setLoading(false);
      }
    };

    fetchBankAccounts();
  }, []);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError(null);
      
      // Conversion des valeurs pour correspondre au format attendu par l'API
      const transactionData = {
        ...values,
        bank_account: values.bank_account, // Assurez-vous que c'est un UUID valide
        // Pas besoin de convertir transaction_date car il est déjà au format YYYY-MM-DD
      };
      
      console.log("Submitting transaction data:", transactionData);
      
      const response = await transactionService.create(transactionData);
      console.log("Transaction created:", response.data);

      // Redirect to transaction list
      navigate('/transactions', {
        state: {
          message: 'Transaction ajoutée avec succès!',
          messageType: 'success'
        }
      });
    } catch (err) {
      console.error('Error creating transaction:', err);
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.detail || 
                          'Une erreur est survenue lors de la création de la transaction.';
      setError(errorMessage);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/transactions" className="mr-4 text-gray-500 hover:text-gray-700">
            <FiArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">
            Nouvelle transaction
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

      {bankAccounts.length === 0 ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Aucun compte bancaire disponible. Veuillez d'abord 
                <Link to="/bank-accounts/new" className="text-primary hover:text-primary-dark ml-1">
                  créer un compte bancaire
                </Link>.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Détails de la transaction</h2>
          </div>

          <div className="p-6">
            <Formik
              initialValues={{
                description: '',
                transaction_date: new Date().toISOString().split('T')[0],
                amount: '',
                transaction_type: 'expense',
                bank_account: bankAccounts.length > 0 ? bankAccounts[0].id : '',
                status: 'pending',
              }}
              validationSchema={TransactionSchema}
              onSubmit={handleSubmit}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <Field
                        type="text"
                        name="description"
                        id="description"
                        className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                      <ErrorMessage name="description" component="div" className="mt-1 text-sm text-red-600" />
                    </div>

                    <div>
                      <label htmlFor="transaction_date" className="block text-sm font-medium text-gray-700">
                        Date
                      </label>
                      <Field
                        type="date"
                        name="transaction_date"
                        id="transaction_date"
                        className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                      <ErrorMessage name="transaction_date" component="div" className="mt-1 text-sm text-red-600" />
                    </div>

                    <div>
                      <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
                        Montant
                      </label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-500 sm:text-sm">€</span>
                        </div>
                        <Field
                          type="number"
                          name="amount"
                          id="amount"
                          step="0.01"
                          min="0"
                          className="focus:ring-primary focus:border-primary block w-full pl-7 sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      <ErrorMessage name="amount" component="div" className="mt-1 text-sm text-red-600" />
                    </div>

                    <div>
                      <label htmlFor="transaction_type" className="block text-sm font-medium text-gray-700">
                        Type
                      </label>
                      <Field
                        as="select"
                        name="transaction_type"
                        id="transaction_type"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                      >
                        <option value="income">Recette</option>
                        <option value="expense">Dépense</option>
                        <option value="transfer">Virement</option>
                      </Field>
                      <ErrorMessage name="transaction_type" component="div" className="mt-1 text-sm text-red-600" />
                    </div>

                    <div>
                      <label htmlFor="bank_account" className="block text-sm font-medium text-gray-700">
                        Compte bancaire
                      </label>
                      <Field
                        as="select"
                        name="bank_account"
                        id="bank_account"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                      >
                        {bankAccounts.map(account => (
                          <option key={account.id} value={account.id}>
                            {account.account_name} - {account.bank_name}
                          </option>
                        ))}
                      </Field>
                      <ErrorMessage name="bank_account" component="div" className="mt-1 text-sm text-red-600" />
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
                        <option value="completed">Complété</option>
                        <option value="reconciled">Rapproché</option>
                        <option value="failed">Échoué</option>
                      </Field>
                      <ErrorMessage name="status" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                    <Link
                      to="/transactions"
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
      )}
    </div>
  );
};

export default TransactionCreate;