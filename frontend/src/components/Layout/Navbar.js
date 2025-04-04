// frontend/src/components/Layout/Navbar.js
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiBell, FiUser, FiLogOut } from 'react-icons/fi';
import { notificationService } from '../../services/api';

const Navbar = ({ user, onMenuClick, onLogout }) => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const notificationsRef = useRef(null);
  const profileMenuRef = useRef(null);

  // Fetch notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data } = await notificationService.getAll();
        setNotifications(data.results);
        setUnreadCount(data.results.filter(n => !n.read).length);
      } catch (error) {
        console.error('Failed to fetch notifications', error);
      }
    };
    
    fetchNotifications();
    
    // Polling for new notifications (every 30 seconds)
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(
        notifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(
        notifications.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read', error);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <button
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
              onClick={onMenuClick}
            >
              <FiMenu className="h-6 w-6" />
            </button>
            <div className="flex-shrink-0 flex items-center">
              <Link 
                to="/" 
                className="text-xl font-bold text-primary flex items-center"
              >
                <img 
                  src="/logo.svg" 
                  alt="Logo" 
                  className="h-8 w-8 mr-2" 
                />
                Elite Finance
              </Link>
            </div>
          </div>
          
          <div className="flex items-center">
            {/* Notifications */}
            <div className="relative" ref={notificationsRef}>
              <button
                className="p-2 rounded-full text-gray-400 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary relative"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <FiBell className="h-6 w-6" />
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 inline-block w-5 h-5 text-xs text-white bg-danger rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {/* Notifications dropdown */}
              {showNotifications && (
                <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  <div className="py-1 border-b border-gray-200">
                    <div className="flex justify-between items-center px-4 py-2">
                      <h3 className="text-sm font-semibold">Notifications</h3>
                      <button
                        className="text-xs text-primary hover:text-primary-dark"
                        onClick={markAllAsRead}
                      >
                        Tout marquer comme lu
                      </button>
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-2 text-sm text-gray-500">
                        Aucune notification
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div 
                          key={notification.id}
                          className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-100 ${!notification.read ? 'bg-blue-50' : ''}`}
                          onClick={() => markAsRead(notification.id)}
                        >
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {notification.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Profile dropdown */}
            <div className="ml-3 relative" ref={profileMenuRef}>
              <button
                className="flex text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-primary items-center"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
              >
                <span className="sr-only">Open user menu</span>
                {user?.profile_image ? (
                  <img
                    className="h-8 w-8 rounded-full"
                    src={user.profile_image}
                    alt={user.username}
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-primary-light flex items-center justify-center text-white">
                    <FiUser />
                  </div>
                )}
                <span className="ml-2 text-gray-700 hidden md:block">
                  {user?.first_name} {user?.last_name}
                </span>
              </button>
              
              {/* Profile menu */}
              {showProfileMenu && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-200">
                    Connecté en tant que <span className="font-semibold">{user?.username}</span>
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Profil
                  </Link>
                  <button
                    className="w-full text-left px-4 py-2 text-sm text-danger hover:bg-gray-100 flex items-center"
                    onClick={onLogout}
                  >
                    <FiLogOut className="mr-2" />
                    Déconnexion
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;