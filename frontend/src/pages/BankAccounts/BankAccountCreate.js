// frontend/src/pages/BankAccounts/BankAccountCreate.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { bankAccountService } from '../../services/api';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const BankAccountSchema = Yup.object().shape({
  account_name: Yup.string().required('Le nom du compte est requis'),
  account_number: Yup.string().required('Le numéro de compte est requis'),
  bank_name: Yup.string().required('Le nom de la banque est requis'),
  current_balance: Yup.number()
    .required('Le solde actuel est requis')
    .typeError('Le solde doit être un nombre')
});

const BankAccountCreate = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setError(null);
      
      const response = await bankAccountService.create(values);
      console.log("Bank account created:", response.data);

      // Redirect to bank accounts list
      navigate('/bank-accounts', {
        state: {
          message: 'Compte bancaire créé avec succès!',
          messageType: 'success'
        }
      });
    } catch (err) {
      console.error('Error creating bank account:', err);
      const errorMessage = err.response?.data?.error || 
                           err.response?.data?.detail || 
                           'Une erreur est survenue lors de la création du compte bancaire.';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/bank-accounts" className="mr-4 text-gray-500 hover:text-gray-700">
            <FiArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">
            Nouveau compte bancaire
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
          <h2 className="text-lg font-medium text-gray-900">Détails du compte bancaire</h2>
        </div>

        <div className="p-6">
          <Formik
            initialValues={{
              account_name: '',
              account_number: '',
              bank_name: '',
              current_balance: ''
            }}
            validationSchema={BankAccountSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  <div>
                    <label htmlFor="account_name" className="block text-sm font-medium text-gray-700">
                      Nom du compte
                    </label>
                    <Field
                      type="text"
                      name="account_name"
                      id="account_name"
                      placeholder="Ex: Compte courant principal"
                      className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                    <ErrorMessage name="account_name" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div>
                    <label htmlFor="account_number" className="block text-sm font-medium text-gray-700">
                      Numéro de compte
                    </label>
                    <Field
                      type="text"
                      name="account_number"
                      id="account_number"
                      placeholder="Ex: FR76 1234 5678 9101 1121 3141"
                      className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                    <ErrorMessage name="account_number" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div>
                    <label htmlFor="bank_name" className="block text-sm font-medium text-gray-700">
                      Nom de la banque
                    </label>
                    <Field
                      type="text"
                      name="bank_name"
                      id="bank_name"
                      placeholder="Ex: Crédit Agricole"
                      className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                    <ErrorMessage name="bank_name" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div>
                    <label htmlFor="current_balance" className="block text-sm font-medium text-gray-700">
                      Solde actuel
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">€</span>
                      </div>
                      <Field
                        type="number"
                        name="current_balance"
                        id="current_balance"
                        step="0.01"
                        placeholder="0.00"
                        className="focus:ring-primary focus:border-primary block w-full pl-7 sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <ErrorMessage name="current_balance" component="div" className="mt-1 text-sm text-red-600" />
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex justify-end">
                  <Link
                    to="/bank-accounts"
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

export default BankAccountCreate;