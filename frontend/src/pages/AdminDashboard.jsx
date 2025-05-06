import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';
import { useAuth } from '../context/AuthContext';
import { FaHome, FaUsers, FaBox, FaShoppingCart, FaPlus, FaBars, FaTimes } from 'react-icons/fa';
import { getApiUrl } from '../utils/axiosConfig';

// Import admin components
import DashboardHome from '../components/admin/DashboardHome';
import UserManagement from '../components/admin/UserManagement';
import OrderManagement from '../components/admin/OrderManagement';
import ProductManagement from '../components/admin/ProductManagement';
import AddProduct from '../components/admin/AddProduct';
import EditProduct from '../components/admin/EditProduct';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { currentUser, isAdmin, token } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if user is authorized to access admin dashboard
  useEffect(() => {
    if (!currentUser || !isAdmin) {
      navigate('/admin-login');
    }
  }, [currentUser, isAdmin, navigate]);

  // Fetch data based on active section
  useEffect(() => {
    if (token && activeSection === 'users') {
      fetchUsers();
    }
    
    if (token && activeSection === 'orders') {
      fetchOrders();
    }
  }, [token, activeSection]);

  // Custom setActiveSection function to handle product editing
  const handleSetActiveSection = (section, productId = null) => {
    setActiveSection(section);
    if (section === 'edit-product' && productId) {
      setSelectedProductId(productId);
    }
  };

  // Fetch users for user management
  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      setUsersError(null);
      
      const response = await fetch(getApiUrl('/api/auth/admin/users'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch users');
      }
      
      setUsers(data.users);
    } catch (err) {
      console.error('Error fetching users:', err);
      setUsersError(err.message);
    } finally {
      setUsersLoading(false);
    }
  };

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      setOrdersError(null);
      
      const response = await fetch(getApiUrl('/api/orders/admin'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch orders');
      }
      
      setOrders(data.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setOrdersError(err.message);
    } finally {
      setOrdersLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      <AdminNavbar />
      
      {/* Mobile menu toggle button */}
      <div className="fixed top-20 left-4 z-20 md:hidden">
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-gray-800 text-white p-2 rounded-md shadow-lg"
          aria-label={sidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
          {sidebarOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
        </button>
      </div>
      
      <div className="flex pt-16">
        {/* Sidebar - hidden by default on mobile, shown when sidebarOpen is true */}
        <div className={`bg-gray-800 text-white h-screen fixed left-0 top-16 overflow-auto transition-all duration-300 z-10 ${
          sidebarOpen ? 'w-64 opacity-100' : 'w-0 opacity-0 md:opacity-100 md:w-64'
        }`}>
          <div className="p-4 min-w-64">
            <h2 className="text-lg font-semibold mb-4">Admin Panel</h2>
            <ul className="space-y-2">
              <li>
                <button
                  className={`w-full flex items-center px-4 py-3 rounded-md transition-colors ${
                    activeSection === 'dashboard' 
                      ? 'bg-red-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => handleSetActiveSection('dashboard')}
                >
                  <FaHome className="mr-3" />
                  Dashboard
                </button>
              </li>
              <li>
                <button
                  className={`w-full flex items-center px-4 py-3 rounded-md transition-colors ${
                    activeSection === 'users' 
                      ? 'bg-red-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => handleSetActiveSection('users')}
                >
                  <FaUsers className="mr-3" />
                  Users
                </button>
              </li>
              <li>
                <button
                  className={`w-full flex items-center px-4 py-3 rounded-md transition-colors ${
                    activeSection === 'orders' 
                      ? 'bg-red-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => handleSetActiveSection('orders')}
                >
                  <FaShoppingCart className="mr-3" />
                  Orders
                </button>
              </li>
              <li>
                <button
                  className={`w-full flex items-center px-4 py-3 rounded-md transition-colors ${
                    activeSection === 'products' 
                      ? 'bg-red-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => handleSetActiveSection('products')}
                >
                  <FaBox className="mr-3" />
                  Products
                </button>
              </li>
              <li>
                <button
                  className={`w-full flex items-center px-4 py-3 rounded-md transition-colors ${
                    activeSection === 'add-product' 
                      ? 'bg-red-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700'
                  }`}
                  onClick={() => handleSetActiveSection('add-product')}
                >
                  <FaPlus className="mr-3" />
                  Add New Product
                </button>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Main Content */}
        <div className={`transition-all duration-300 p-4 md:p-8 ${
          sidebarOpen ? 'ml-64' : 'ml-0 md:ml-64'
        }`}>
          {/* Render the appropriate component based on the active section */}
          {activeSection === 'dashboard' && (
            <DashboardHome currentUser={currentUser} />
          )}
          
          {activeSection === 'users' && (
            <UserManagement 
              users={users} 
              loading={usersLoading} 
              error={usersError} 
            />
          )}
          
          {activeSection === 'orders' && (
            <OrderManagement 
              orders={orders} 
              loading={ordersLoading} 
              error={ordersError}
              token={token}
            />
          )}
          
          {activeSection === 'products' && (
            <ProductManagement 
              setActiveSection={handleSetActiveSection} 
              token={token}
            />
          )}
          
          {activeSection === 'add-product' && (
            <AddProduct token={token} />
          )}
          
          {activeSection === 'edit-product' && selectedProductId && (
            <EditProduct 
              token={token} 
              productId={selectedProductId} 
              setActiveSection={handleSetActiveSection}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;