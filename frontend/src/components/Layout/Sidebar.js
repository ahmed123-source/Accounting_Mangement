// frontend/src/components/Layout/Sidebar.js
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FiHome, 
  FiFileText, 
  FiDollarSign,
  FiPieChart,
  FiAlertTriangle,
  FiUsers,
  FiX
} from 'react-icons/fi';

const Sidebar = ({ user, mobile = false, onClose }) => {
  const navigation = [
    { name: 'Tableau de bord', icon: FiHome, href: '/', roles: ['accountant', 'admin', 'financial_director'] },
    { name: 'Factures', icon: FiFileText, href: '/invoices', roles: ['accountant', 'admin', 'financial_director'] },
    { name: 'Transactions', icon: FiDollarSign, href: '/transactions', roles: ['accountant', 'admin', 'financial_director'] },
    { name: 'Rapports', icon: FiPieChart, href: '/reports', roles: ['accountant', 'admin', 'financial_director'] },
    { name: 'Anomalies', icon: FiAlertTriangle, href: '/anomalies', roles: ['accountant', 'admin', 'financial_director'] },
    { name: 'Utilisateurs', icon: FiUsers, href: '/users', roles: ['admin'] },
  ];

  // Filter navigation items based on user role
  const filteredNavigation = navigation.filter(
    item => item.roles.includes(user?.role)
  );

  return (
    <div className="w-64 bg-white h-full border-r border-gray-200">
      {mobile && (
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-primary">Elite Finance</h2>
          <button 
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={onClose}
          >
            <FiX className="h-6 w-6" />
          </button>
        </div>
      )}
      
      <div className="h-0 flex-1 flex flex-col overflow-y-auto">
        {!mobile && (
          <div className="flex items-center justify-center h-16 flex-shrink-0 px-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-primary">Elite Finance</h2>
          </div>
        )}
        
        <nav className="mt-5 flex-1 px-2 space-y-1">
          {filteredNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) => 
                `group flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
                }`
              }
              end
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
      
      <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
        <div className="flex-shrink-0 w-full group block">
          <div className="flex items-center">
            <div className="text-sm font-medium text-gray-500">
              <span className="block">{user?.role === 'accountant' ? 'Comptable' : 
                   user?.role === 'admin' ? 'Administrateur' :
                   user?.role === 'financial_director' ? 'Directeur Financier' : 
                   'Utilisateur'}</span>
              <span className="text-gray-400 text-xs">v1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;