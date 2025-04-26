// frontend/src/pages/Users/UserDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiEdit2, FiTrash2, FiUser, FiMail, FiUserCheck, FiShield } from 'react-icons/fi';
import { userService } from '../../services/api';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

const UpdateUserSchema = Yup.object().shape({
  first_name: Yup.string().required('Le prénom est requis'),
  last_name: Yup.string().required('Le nom est requis'),
  email: Yup.string().email('Email invalide').required('L\'email est requis'),
  role: Yup.string().oneOf(['admin', 'accountant', 'financial_director'], 'Rôle invalide').required('Le rôle est requis'),
});

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        const response = await userService.getById(id);
        setUser(response.data);
        
      } catch (err) {
        console.error('Error fetching user details:', err);
        setError('Une erreur est survenue lors du chargement des détails de l\'utilisateur.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [id]);
  
  const handleUpdateUser = async (values, { setSubmitting }) => {
    try {
      setLoading(true);
      
      await userService.update(id, values);
      
      // Refresh user data
      const response = await userService.getById(id);
      setUser(response.data);
      
      // Exit edit mode
      setEditing(false);
      
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Une erreur est survenue lors de la mise à jour de l\'utilisateur.');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };
  
  const handleDeleteUser = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        setLoading(true);
        
        await userService.delete(id);
        
        // Redirect to user list
        navigate('/users', { 
          state: { 
            message: 'Utilisateur supprimé avec succès',
            messageType: 'success'
          } 
        });
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Une erreur est survenue lors de la suppression de l\'utilisateur.');
        setLoading(false);
      }
    }
  };
  
  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'accountant':
        return 'bg-blue-100 text-blue-800';
      case 'financial_director':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const getRoleDisplay = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrateur';
      case 'accountant':
        return 'Comptable';
      case 'financial_director':
        return 'Directeur Financier';
      default:
        return role;
    }
  };
  
  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <FiShield className="h-5 w-5 text-purple-500" />;
      case 'accountant':
        return <FiUserCheck className="h-5 w-5 text-blue-500" />;
      case 'financial_director':
        return <FiUserCheck className="h-5 w-5 text-green-500" />;
      default:
        return <FiUser className="h-5 w-5 text-gray-500" />;
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
  
  if (!user) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-yellow-700">Utilisateur non trouvé.</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/users" className="mr-4 text-gray-500 hover:text-gray-700">
            <FiArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-semibold text-gray-900">
            Détails de l'utilisateur
          </h1>
        </div>
        <div className="flex space-x-2">
          {!editing && (
            <>
              <button
                onClick={() => setEditing(true)}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md bg-blue-100 text-blue-800 hover:bg-blue-200"
              >
                <FiEdit2 className="mr-1 h-4 w-4" />
                Modifier
              </button>
              <button
                onClick={handleDeleteUser}
                className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md bg-red-100 text-red-800 hover:bg-red-200"
              >
                <FiTrash2 className="mr-1 h-4 w-4" />
                Supprimer
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Informations de l'utilisateur</h2>
        </div>
        
        {editing ? (
          <div className="p-6">
            <Formik
              initialValues={{
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                role: user.role,
              }}
              validationSchema={UpdateUserSchema}
              onSubmit={handleUpdateUser}
            >
              {({ isSubmitting }) => (
                <Form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">
                        Prénom
                      </label>
                      <Field
                        type="text"
                        name="first_name"
                        id="first_name"
                        className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                      <ErrorMessage name="first_name" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                    
                    <div>
                      <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">
                        Nom
                      </label>
                      <Field
                        type="text"
                        name="last_name"
                        id="last_name"
                        className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                      <ErrorMessage name="last_name" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <Field
                        type="email"
                        name="email"
                        id="email"
                        className="mt-1 focus:ring-primary focus:border-primary block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                      <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                    
                    <div>
                      <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                        Rôle
                      </label>
                      <Field
                        as="select"
                        name="role"
                        id="role"
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                      >
                        <option value="admin">Administrateur</option>
                        <option value="accountant">Comptable</option>
                        <option value="financial_director">Directeur Financier</option>
                      </Field>
                      <ErrorMessage name="role" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setEditing(false)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      Enregistrer
                    </button>
                  </div>
                </Form>
              )}
            </Formik>
          </div>
        ) : (
          <div className="p-6">
            <div className="flex items-center mb-6">
              <div className="flex-shrink-0 h-24 w-24">
                {user.profile_image ? (
                  <img className="h-24 w-24 rounded-full" src={user.profile_image} alt="" />
                ) : (
                  <div className="h-24 w-24 rounded-full bg-primary-light flex items-center justify-center text-white">
                    <FiUser className="h-12 w-12" />
                  </div>
                )}
              </div>
              <div className="ml-6">
                <h3 className="text-xl font-medium text-gray-900">
                  {user.first_name} {user.last_name}
                </h3>
                <div className="mt-1 flex items-center">
                  <FiMail className="mr-1 h-4 w-4 text-gray-500" />
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
                <div className="mt-2 flex items-center">
                  {getRoleIcon(user.role)}
                  <span
                    className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClass(
                      user.role
                    )}`}
                  >
                    {getRoleDisplay(user.role)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Nom d'utilisateur</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.username}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Date de création</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {new Date(user.date_joined).toLocaleDateString('fr-FR')}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Dernière connexion</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {user.last_login 
                      ? new Date(user.last_login).toLocaleDateString('fr-FR') 
                      : 'Jamais connecté'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </div>
      
      {/* Activity section could be added here */}
    </div>
  );
};

export default UserDetail;