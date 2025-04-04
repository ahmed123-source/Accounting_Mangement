// frontend/src/pages/Login.js
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const LoginSchema = Yup.object().shape({
  username: Yup.string().required('Nom d\'utilisateur requis'),
  password: Yup.string().required('Mot de passe requis'),
});

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [authError, setAuthError] = useState('');
  
  // Get the path to redirect to after login
  const from = location.state?.from?.pathname || '/';
  
  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      setAuthError('');
      await login(values.username, values.password);
      navigate(from, { replace: true });
    } catch (error) {
      setAuthError(
        error.response?.data?.detail || 
        'Erreur de connexion. Veuillez vérifier vos identifiants.'
      );
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
            Connectez-vous à votre compte
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ou{' '}
            <Link to="/register" className="font-medium text-primary hover:text-primary-dark">
              créez un nouveau compte
            </Link>
          </p>
        </div>
        
        <Formik
          initialValues={{ username: '', password: '' }}
          validationSchema={LoginSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="mt-8 space-y-6">
              {authError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
                  {authError}
                </div>
              )}
              
              <div className="rounded-md shadow-sm -space-y-px">
                <div>
                  <label htmlFor="username" className="sr-only">
                    Nom d'utilisateur
                  </label>
                  <Field
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                    placeholder="Nom d'utilisateur"
                  />
                  <ErrorMessage 
                    name="username" 
                    component="div" 
                    className="text-danger text-xs mt-1" 
                  />
                </div>
                <div>
                  <label htmlFor="password" className="sr-only">
                    Mot de passe
                  </label>
                  <Field
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                    placeholder="Mot de passe"
                  />
                  <ErrorMessage 
                    name="password" 
                    component="div" 
                    className="text-danger text-xs mt-1" 
                  />
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
                  {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default Login;