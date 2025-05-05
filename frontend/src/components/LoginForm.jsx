import React, { useState } from 'react';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { sanitizeInput, isValidEmail } from '../utils/validation';

const LoginForm = ({ closeModal, switchToSignup }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizeInput(value);
    setFormData(prev => ({
      ...prev,
      [name]: sanitizedValue
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    try {
      setLoading(true);
      setErrors({});
      
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        closeModal();
      } else {
        setErrors({ form: result.error || 'Invalid email or password' });
      }
    } catch (err) {
      setErrors({ form: 'An error occurred during login. Please try again.' });
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-bold mb-2 text-gray-800">Welcome back</h2>
      <p className="text-gray-600 mb-6">Please enter your details to sign in</p>
      
      {errors.form && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700 text-sm">{errors.form}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-4">
          <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
            Email
          </label>
          <div className={`flex items-center border ${errors.email && formSubmitted ? 'border-red-500' : 'border-gray-300'} rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-red-500 focus-within:border-transparent`}>
            <div className="px-3 py-2 bg-gray-50 text-gray-500">
              <FaEnvelope />
            </div>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="flex-1 px-3 py-2 outline-none"
              placeholder="you@example.com"
            />
          </div>
          {errors.email && formSubmitted && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label htmlFor="password" className="block text-gray-700 text-sm font-medium">
              Password
            </label>
            <button type="button" className="text-xs text-red-600 hover:text-red-800 font-medium">
              Forgot password?
            </button>
          </div>
          <div className={`flex items-center border ${errors.password && formSubmitted ? 'border-red-500' : 'border-gray-300'} rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-red-500 focus-within:border-transparent`}>
            <div className="px-3 py-2 bg-gray-50 text-gray-500">
              <FaLock />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="flex-1 px-3 py-2 outline-none"
              placeholder="••••••••"
            />
            <button 
              type="button" 
              className="px-3 py-2 text-gray-500 hover:text-gray-700"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>
          {errors.password && formSubmitted && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Signing in...
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={switchToSignup}
            data-testid="switch-to-signup"
            className="text-red-600 hover:text-red-800 font-medium"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;