// frontend/src/pages/Register.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const RegisterSchema = Yup.object().shape({
  username: Yup.string()
    .min(3, 'Trop court')
    .max(50, 'Trop long')
    .required('Nom d\'utilisateur requis'),
  email: Yup.string()
    .email('Email invalide')
    .required('Email requis'),
  first_name: Yup.string()
    .required('Prénom requis'),
  last_name: Yup.string()
    .required('Nom requis'),
  role: Yup.string()
    .oneOf(['accountant', 'financial_director'], 'Rôle invalide')
    .required('Rôle requis'),
  password: Yup.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .required('Mot de passe requis'),
  password_confirmation: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Les mots de passe doivent correspondre')
    .required('Confirmation du mot de passe requise'),
});

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState('');
  
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setAuthError('');
      await register(values);
      navigate('/');
    } catch (error) {
      if (error.response?.data) {
        // Format validation errors from the API
        const errors = error.response.data;
        const errorMessages = [];
        
        for (const field in errors) {
          if (Array.isArray(errors[field])) {
            errorMessages.push(`${field}: ${errors[field].join(', ')}`);
          } else {
            errorMessages.push(`${field}: ${errors[field]}`);
          }
        }
        
        setAuthError(errorMessages.join('\n'));
      } else {
        setAuthError('Une erreur est survenue lors de l\'inscription. Veuillez réessayer.');
      }
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <img
            className="mx-auto h-12 w-auto"
            src="/logo.svg"
            alt="Elite Finance Consulting"
          />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Créer un compte
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary-dark">
              connectez-vous à votre compte existant
            </Link>
          </p>
        </div>
        
        <Formik
          initialValues={{
            username: '',
            email: '',
            first_name: '',
            last_name: '',
            role: 'accountant',
            password: '',
            password_confirmation: '',
          }}
          validationSchema={RegisterSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="mt-8 space-y-6">
              {authError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm whitespace-pre-line">
                  {authError}
                </div>
              )}
              
              <div className="rounded-md shadow-sm -space-y-px">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                      Prénom
                    </label>
                    <Field
                      type="text"
                      name="first_name"
                      id="first_name"
                      autoComplete="given-name"
                      className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                    <ErrorMessage name="first_name" component="div" className="text-danger text-xs mt-1" />
                  </div>

                  <div className="sm:col-span-3">
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                      Nom
                    </label>
                    <Field
                      type="text"
                      name="last_name"
                      id="last_name"
                      autoComplete="family-name"
                      className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                    <ErrorMessage name="last_name" component="div" className="text-danger text-xs mt-1" />
                  </div>
                  
                  <div className="sm:col-span-6">
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                      Nom d'utilisateur
                    </label>
                    <Field
                      type="text"
                      name="username"
                      id="username"
                      autoComplete="username"
                      className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                    <ErrorMessage name="username" component="div" className="text-danger text-xs mt-1" />
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <Field
                      type="email"
                      name="email"
                      id="email"
                      autoComplete="email"
                      className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                    <ErrorMessage name="email" component="div" className="text-danger text-xs mt-1" />
                  </div>
                  
                  <div className="sm:col-span-6">
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                      Profession
                    </label>
                    <div className="mt-2">
                      <div className="flex items-center space-x-6">
                        <div className="flex items-center">
                          <Field
                            type="radio"
                            name="role"
                            id="role-accountant"
                            value="accountant"
                            className="focus:ring-primary h-4 w-4 text-primary border-gray-300"
                          />
                          <label htmlFor="role-accountant" className="ml-3 block text-sm font-medium text-gray-700">
                            Comptable
                          </label>
                        </div>
                        <div className="flex items-center">
                          <Field
                            type="radio"
                            name="role"
                            id="role-financial-director"
                            value="financial_director"
                            className="focus:ring-primary h-4 w-4 text-primary border-gray-300"
                          />
                          <label htmlFor="role-financial-director" className="ml-3 block text-sm font-medium text-gray-700">
                            Directeur Financier
                          </label>
                        </div>
                      </div>
                    </div>
                    <ErrorMessage name="role" component="div" className="text-danger text-xs mt-1" />
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Mot de passe
                    </label>
                    <Field
                      type="password"
                      name="password"
                      id="password"
                      autoComplete="new-password"
                      className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                    <ErrorMessage name="password" component="div" className="text-danger text-xs mt-1" />
                  </div>

                  <div className="sm:col-span-6">
                    <label htmlFor="password_confirmation" className="block text-sm font-medium text-gray-700">
                      Confirmez votre mot de passe
                    </label>
                    <Field
                      type="password"
                      name="password_confirmation"
                      id="password_confirmation"
                      autoComplete="new-password"
                      className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                    />
                    <ErrorMessage name="password_confirmation" component="div" className="text-danger text-xs mt-1" />
                  </div>
                </div>
              </div>
              
              <div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                    isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Inscription en cours...' : 'S\'inscrire'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Register;