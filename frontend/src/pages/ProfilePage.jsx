import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { getApiUrl } from '../utils/axiosConfig';
import Toast from '../components/Toast';

const ProfilePage = () => {
  const { currentUser, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // User profile form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Form submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // Orders state
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  
  // Toast notification state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // Active tab state - check location.state for initial tab
  const [activeTab, setActiveTab] = useState(
    location.state?.activeTab || 'profile'
  );

  // Load user data into form when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setFormData(prevState => ({
        ...prevState,
        firstName: currentUser.firstName || '',
        lastName: currentUser.lastName || '',
        email: currentUser.email || ''
      }));
    } else {
      // If no user is logged in, redirect to home page
      navigate('/');
    }
    
    // Check if we just navigated from successful payment
    if (location.state?.activeTab === 'orders' && location.state?.fromPayment) {
      setToast({
        show: true,
        message: 'Your order has been placed successfully!',
        type: 'success'
      });
    }
  }, [currentUser, navigate, location.state]);

  // Load user's order history
  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) return;
      
      try {
        setLoadingOrders(true);
        const response = await fetch(getApiUrl('/api/orders/my-orders'), {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setOrders(data.orders);
        } else {
          console.error('Failed to fetch orders');
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoadingOrders(false);
      }
    };

    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [token, activeTab]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // Handle form submission to update profile
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUpdateSuccess(false);
    setUpdateError('');
    setPasswordError('');

    // Validate form inputs
    const errors = validateProfileForm();
    if (Object.keys(errors).length > 0) {
      if (errors.password) {
        setPasswordError(errors.password);
      } else {
        setUpdateError(Object.values(errors)[0]);
      }
      setIsSubmitting(false);
      return;
    }

    try {
      const updateData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email
      };

      // Only include password fields if user is trying to change password
      if (formData.newPassword && formData.currentPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await fetch(getApiUrl('/api/auth/update-profile'), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });

      const data = await response.json();

      if (response.ok) {
        setUpdateSuccess(true);
        
        // Reset password fields
        setFormData(prevState => ({
          ...prevState,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
        
        // Refresh the page after 2 seconds to reflect changes
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setUpdateError(data.message || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setUpdateError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validate profile form with comprehensive checks
  const validateProfileForm = () => {
    const errors = {};
    
    // First name validation
    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = 'First name must be at least 2 characters long';
    } else if (formData.firstName.trim().length > 50) {
      errors.firstName = 'First name must be less than 50 characters';
    }
    
    // Last name validation
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = 'Last name must be at least 2 characters long';
    } else if (formData.lastName.trim().length > 50) {
      errors.lastName = 'Last name must be less than 50 characters';
    }
    
    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    // Password validation (only if user is trying to change password)
    if (formData.newPassword || formData.confirmPassword || formData.currentPassword) {
      if (!formData.currentPassword) {
        errors.password = 'Current password is required to set a new password';
      }
      
      if (formData.newPassword) {
        if (formData.newPassword.length < 6) {
          errors.password = 'New password must be at least 6 characters long';
        } else if (formData.newPassword !== formData.confirmPassword) {
          errors.password = 'New passwords do not match';
        }
      }
    }
    
    return errors;
  };

  // Format date for order history
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Please login to view your profile</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* Toast Notification */}
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })} 
        />
      )}
      
      <h1 className="text-3xl font-bold mb-8 text-center">My Account</h1>
      
      {/* Tab navigation */}
      <div className="flex border-b border-gray-200 mb-8">
        <button 
          className={`py-3 px-5 font-medium text-lg ${activeTab === 'profile' 
            ? 'border-b-2 border-red-600 text-red-600' 
            : 'text-gray-500 hover:text-gray-800'}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile Information
        </button>
        <button 
          className={`py-3 px-5 font-medium text-lg ${activeTab === 'orders' 
            ? 'border-b-2 border-red-600 text-red-600' 
            : 'text-gray-500 hover:text-gray-800'}`}
          onClick={() => setActiveTab('orders')}
        >
          Order History
        </button>
      </div>
      
      {/* Profile Information Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6">Profile Information</h2>
          
          {updateSuccess && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded border border-green-200">
              Profile updated successfully!
            </div>
          )}
          
          {updateError && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded border border-red-200">
              {updateError}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="firstName" className="block mb-2 font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="lastName" className="block mb-2 font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="email" className="block mb-2 font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
            
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-xl font-semibold mb-4">Change Password</h3>
              
              {passwordError && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded border border-red-200">
                  {passwordError}
                </div>
              )}
              
              <div className="mb-4">
                <label htmlFor="currentPassword" className="block mb-2 font-medium text-gray-700">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <p className="text-sm text-gray-500 mt-1">Required only if you want to change your password</p>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="newPassword" className="block mb-2 font-medium text-gray-700">
                    New Password
                  </label>
                  <input
                    type="password"
                    id="newPassword"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="confirmPassword" className="block mb-2 font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-6 py-3 bg-red-600 text-white rounded-md font-medium ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-red-700'
                }`}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Order History Tab */}
      {activeTab === 'orders' && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-6">Order History</h2>
          
          {loadingOrders ? (
            <div className="py-10 text-center">
              <p className="text-gray-500">Loading your orders...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="py-10 text-center border border-gray-200 rounded-lg">
              <p className="text-gray-500">You haven't placed any orders yet.</p>
              <button 
                onClick={() => navigate('/')}
                className="mt-4 px-6 py-2 bg-red-600 text-white rounded-md font-medium hover:bg-red-700"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order #
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order._id.substring(0, 8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${order.status === 'delivered' ? 'bg-green-100 text-green-800' : 
                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                            'bg-yellow-100 text-yellow-800'}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${order.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button 
                          className="text-red-600 hover:text-red-900"
                          onClick={() => navigate(`/order/${order._id}`)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfilePage;