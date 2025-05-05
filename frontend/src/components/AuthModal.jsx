import React, { useState, useEffect } from 'react';
import { FaTimes, FaShoppingBag } from 'react-icons/fa';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    if (isOpen) {
      // Add event listener to close on escape key
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleEscape);
      
      // Disable scrolling on the body when modal is open
      document.body.style.overflow = 'hidden';
      
      return () => {
        window.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, onClose]);

  const switchMode = () => {
    setIsLogin(!isLogin);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-white bg-opacity-95" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-start justify-center min-h-screen p-4">
        <div className="grid md:grid-cols-2 gap-8 w-full max-w-5xl mx-auto mt-16">
          {/* Store info section */}
          <div className="hidden md:block p-8">
            <div className="flex items-center mb-6">
              <FaShoppingBag className="text-3xl text-red-500 mr-3" />
              <h2 className="text-3xl font-bold">SneakerHub</h2>
            </div>
            <div className="mb-8">
              <h3 className="text-2xl font-semibold mb-3">Your Destination for Premium Footwear</h3>
              <p className="text-gray-600 mb-4">
                Join our community of sneaker enthusiasts and discover the latest in footwear innovation and style.
              </p>
              <ul className="space-y-3">
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-100 text-red-500 mr-2">✓</span>
                  <span>Exclusive access to new releases</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-100 text-red-500 mr-2">✓</span>
                  <span>Track orders easily</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-100 text-red-500 mr-2">✓</span>
                  <span>Faster checkout experience</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-red-100 text-red-500 mr-2">✓</span>
                  <span>Personalized recommendations</span>
                </li>
              </ul>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="italic text-gray-600 mb-3">
                "The perfect shopping experience for sneaker enthusiasts. Quality products and excellent service!"
              </p>
              <p className="font-medium">— Happy Customer</p>
            </div>
          </div>
          
          {/* Modal panel */}
          <div className="relative bg-white rounded-lg shadow-lg border border-gray-200 w-full">
            <div className="absolute top-0 right-0 pt-4 pr-4">
              <button
                type="button"
                className="bg-white rounded-full p-1 text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={onClose}
              >
                <span className="sr-only">Close</span>
                <FaTimes className="h-5 w-5" />
              </button>
            </div>
            
            <div className="px-6 py-8 sm:px-8">
              {isLogin ? (
                <LoginForm closeModal={onClose} switchToSignup={switchMode} />
              ) : (
                <SignupForm closeModal={onClose} switchToLogin={switchMode} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;