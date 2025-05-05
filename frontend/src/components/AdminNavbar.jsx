import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaTools, FaRunning } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const AdminNavbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 w-full bg-gray-900 text-white z-50 shadow-md transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Link to="/admin/dashboard" className="group relative flex items-center">
              <div className="flex items-center overflow-hidden">
                <div className="bg-red-600 text-white p-1.5 rounded-lg transform -rotate-6 shadow-md transition-transform group-hover:rotate-0 mr-2">
                  <FaRunning className="text-xl" />
                </div>
                <div className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-orange-500 text-2xl tracking-tighter hover:tracking-normal transition-all duration-300">
                  SNEAKER<span className="font-light italic">hub</span>
                </div>
                <span className="ml-2 bg-red-600 px-2 py-0.5 rounded-md text-xs font-bold text-white">ADMIN</span>
              </div>
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-red-600 to-orange-500 group-hover:w-full transition-all duration-500"></span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link 
              to="/"
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center group relative"
            >
              <FaTools className="mr-2" />
              <span>View Store</span>
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 group-hover:w-full transition-all duration-300"></span>
            </Link>
            
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center"
            >
              <FaSignOutAlt className="mr-2" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;