import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/axiosConfig';
import { 
  sanitizeInput, 
  sanitizeObject, 
  isValidEmail, 
  isValidZipCode, 
  isValidPhoneNumber 
} from '../utils/validation';

const PaymentPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [formData, setFormData] = useState({
    fullName: currentUser ? `${currentUser.firstName} ${currentUser.lastName}` : '',
    email: currentUser ? currentUser.email : '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phoneNumber: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  // Calculate order summary
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = 10.99;
  const total = subtotal + shipping;

  useEffect(() => {
    // Redirect if not logged in
    if (!currentUser) {
      navigate('/cart');
      return;
    }

    // Load cart items from localStorage
    const items = JSON.parse(localStorage.getItem('cartItems')) || [];
    if (items.length === 0) {
      // Redirect to cart if no items
      navigate('/cart');
      return;
    }
    
    setCartItems(items);
  }, [currentUser, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Sanitize input as it's entered
    const sanitizedValue = sanitizeInput(value);
    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate all required fields
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.state.trim()) {
      newErrors.state = 'State/Province is required';
    }
    
    if (!formData.zipCode) {
      newErrors.zipCode = 'Postal/Zip code is required';
    } else if (!isValidZipCode(formData.zipCode)) {
      newErrors.zipCode = 'Please enter a valid postal/zip code';
    }
    
    if (!formData.country.trim()) {
      newErrors.country = 'Country is required';
    }
    
    if (!formData.phoneNumber) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!isValidPhoneNumber(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setFieldErrors(validationErrors);
      setError('Please fill in all fields correctly');
      return;
    }

    setLoading(true);
    setError('');
    setFieldErrors({});

    try {
      // Format the items for backend
      const orderItems = cartItems.map(item => ({
        product: item._id,
        name: sanitizeInput(item.name),
        price: item.price,
        quantity: item.quantity,
        size: sanitizeInput(item.size) || 'N/A',
        image: item.images && item.images.length > 0 ? sanitizeInput(item.images[0].url) : ''
      }));

      // Verify stock availability before placing order
      const stockCheckPromises = cartItems.map(async item => {
        const response = await api.get(`/api/products/${item._id}`);
        if (response.data.success) {
          const product = response.data.product;
          const sizeInfo = product.sizes.find(s => s.size === item.size);
          
          if (!sizeInfo || sizeInfo.stock < item.quantity) {
            throw new Error(`Sorry, ${product.name} (Size: ${item.size}) only has ${sizeInfo ? sizeInfo.stock : 0} items left in stock.`);
          }
          return true;
        } else {
          throw new Error(`Failed to verify stock for ${item.name}`);
        }
      });
      
      // Wait for all stock checks to complete
      await Promise.all(stockCheckPromises);

      // Create order data with sanitized form data
      const orderData = {
        items: orderItems,
        shippingAddress: sanitizeObject({
          fullName: formData.fullName,
          email: formData.email,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
          phoneNumber: formData.phoneNumber
        }),
        totalAmount: total
      };

      // Get the authentication token
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Authentication error. Please log in again.');
        setLoading(false);
        return;
      }

      // Send order to backend API
      const response = await api.post('/api/orders', orderData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data.success) {
        // Clear cart
        localStorage.setItem('cartItems', JSON.stringify([]));
        
        // Show success message and redirect
        alert('Order placed successfully! Thank you for your purchase.');
        navigate('/');
      } else {
        setError('Failed to create order. Please try again.');
      }
    } catch (error) {
      console.error('Order creation error:', error);
      setError(error.response?.data?.message || error.message || 'Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="lg:grid lg:grid-cols-12 lg:gap-8">
        {/* Shipping Address Form - Left side */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-medium mb-6">Shipping Information</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${fieldErrors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-red-500`}
                    required
                  />
                  {fieldErrors.fullName && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.fullName}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${fieldErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-red-500`}
                    required
                  />
                  {fieldErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.email}</p>
                  )}
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${fieldErrors.address ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-red-500`}
                  required
                  placeholder="Street address"
                />
                {fieldErrors.address && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.address}</p>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${fieldErrors.city ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-red-500`}
                    required
                  />
                  {fieldErrors.city && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.city}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State/Province
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${fieldErrors.state ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-red-500`}
                    required
                  />
                  {fieldErrors.state && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.state}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal/Zip Code
                  </label>
                  <input
                    type="text"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${fieldErrors.zipCode ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-red-500`}
                    required
                  />
                  {fieldErrors.zipCode && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.zipCode}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border ${fieldErrors.country ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-red-500`}
                    required
                  />
                  {fieldErrors.country && (
                    <p className="text-red-500 text-xs mt-1">{fieldErrors.country}</p>
                  )}
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border ${fieldErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-red-500`}
                  required
                />
                {fieldErrors.phoneNumber && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.phoneNumber}</p>
                )}
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-red-500 text-white py-3 px-6 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-red-300 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing Payment...' : 'Complete Payment'}
              </button>
            </form>
          </div>
        </div>
        
        {/* Order Summary - Right side */}
        <div className="lg:col-span-4 mt-8 lg:mt-0">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
            
            <div className="mt-4 space-y-2">
              {cartItems.map((item) => (
                <div key={`${item._id}-${item.size}`} className="flex justify-between text-sm">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="block text-gray-500">
                      {item.size && `Size: ${item.size}`} × {item.quantity}
                    </span>
                  </div>
                  <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-200 mt-4 pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900 font-medium">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Shipping</span>
                <span className="text-gray-900 font-medium">${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2 border-t border-gray-200 pt-4">
                <span className="text-gray-900 font-medium">Total</span>
                <span className="text-gray-900 font-bold">${total.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div className="mt-4 bg-yellow-50 p-4 rounded-md border border-yellow-100">
            <p className="text-sm text-yellow-800">
              <span className="font-medium">Note:</span> This is a demo checkout. No real payment will be processed.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;