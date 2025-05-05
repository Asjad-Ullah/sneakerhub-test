import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CartPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCartItems = async () => {
      try {
        setLoading(true);
        // Get cart items from localStorage
        const cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        
        if (cartItems.length > 0) {
          setItems(cartItems);
        }
      } catch (err) {
        setError('Error loading cart items');
        console.error('Error loading cart items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  const removeItem = (id) => {
    const updatedItems = items.filter(item => item._id !== id);
    setItems(updatedItems);
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;

    const updatedItems = items.map(item =>
      item._id === id ? { ...item, quantity: newQuantity } : item
    );
    
    setItems(updatedItems);
    localStorage.setItem('cartItems', JSON.stringify(updatedItems));
  };

  const handleCheckout = () => {
    if (currentUser) {
      // User is logged in, proceed to payment page
      navigate('/payment');
    } else {
      // User is not logged in, show login modal
      setShowLoginModal(true);
    }
  };

  const subtotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = subtotal > 0 ? 10.99 : 0;
  const total = subtotal + shipping;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      {loading && (
        <div className="text-center py-12">
          <p className="text-lg">Loading cart items...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12 text-red-500">
          <p className="text-lg">{error}</p>
        </div>
      )}

      {!loading && !error && items.length > 0 ? (
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-8">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-16 w-16 flex-shrink-0 rounded-md overflow-hidden">
                            <img src={item.images[0]?.url || "/src/assets/men.jpg"} alt={item.name} className="h-full w-full object-cover" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500">
                              {item.category.gender.charAt(0).toUpperCase() + item.category.gender.slice(1)}'s {item.category.type.charAt(0).toUpperCase() + item.category.type.slice(1)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">${item.price}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            className="text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                          </button>
                          <span className="mx-2 text-gray-700">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            className="text-gray-500 hover:text-gray-700 focus:outline-none focus:text-gray-700"
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">${(item.price * item.quantity).toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => removeItem(item._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-8 lg:mt-0 lg:col-span-4">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
              <div className="border-t border-gray-200 pt-4">
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
              <div className="mt-6">
                <button 
                  onClick={handleCheckout}
                  className="w-full bg-red-500 text-white px-4 py-3 rounded-full hover:bg-red-600 transition-colors duration-300 font-medium">
                  Proceed to Checkout
                </button>
              </div>
              <div className="mt-4 text-center">
                <Link to="/" className="text-red-500 hover:text-red-700 font-medium text-sm">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : !loading && !error ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Your cart is empty</h3>
          <p className="mt-2 text-gray-600">Looks like you haven't added any items to your cart yet.</p>
          <div className="mt-6">
            <Link to="/" className="bg-red-500 text-white px-6 py-3 rounded-full font-medium hover:bg-red-600 transition-colors">
              Shop Now
            </Link>
          </div>
        </div>
      ) : null}
      
      {/* Login/Signup Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 relative">
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">Sign in to continue</h2>
              <p className="text-gray-600 mt-2">
                You need to be logged in to complete your purchase
              </p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => {
                  setShowLoginModal(false);
                  document.querySelector('nav button[data-testid="login-button"]')?.click();
                }}
                className="w-full bg-red-500 text-white py-3 px-4 rounded-md hover:bg-red-600 transition-colors"
              >
                Sign In
              </button>
              
              <div className="relative flex items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-600">Or</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>
              
              <button
                onClick={() => {
                  navigate('/');
                  setTimeout(() => {
                    document.querySelector('nav button[data-testid="login-button"]')?.click();
                    const switchToSignupBtn = document.querySelector('button[data-testid="switch-to-signup"]');
                    if (switchToSignupBtn) {
                      switchToSignupBtn.click();
                    }
                  }, 100);
                }}
                className="w-full bg-gray-100 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-200 transition-colors"
              >
                Create an Account
              </button>
              
              <div className="text-center mt-4">
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Continue shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;