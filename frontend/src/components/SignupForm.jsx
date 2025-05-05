import React, { useState } from 'react';
import { FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { 
  sanitizeInput, 
  sanitizeObject, 
  isValidEmail, 
  isValidPassword, 
  isValidName 
} from '../utils/validation';

const SignupForm = ({ closeModal, switchToLogin }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const { register } = useAuth();

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
    
    // First name validation using validation utility
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    } else if (!isValidName(formData.firstName)) {
      newErrors.firstName = 'First name contains invalid characters';
    }
    
    // Last name validation using validation utility
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    } else if (!isValidName(formData.lastName)) {
      newErrors.lastName = 'Last name contains invalid characters';
    }
    
    // Email validation using validation utility
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation using validation utility
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!isValidPassword(formData.password, 6)) {
      newErrors.password = 'Password must be at least 6 characters long';
    }
    
    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    
    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    try {
      setLoading(true);
      setErrors({});
      
      // Sanitize the entire form data object before sending to API
      const sanitizedData = sanitizeObject({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      });
      
      const result = await register(sanitizedData);
      
      if (result.success) {
        closeModal();
      } else {
        setErrors({ form: result.error || 'Registration failed. Please try again.' });
      }
    } catch (err) {
      setErrors({ form: 'An error occurred during signup. Please try again.' });
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fadeIn">
      <h2 className="text-2xl font-bold mb-2 text-gray-800">Create an account</h2>
      <p className="text-gray-600 mb-6">Join our community of sneaker enthusiasts</p>
      
      {errors.form && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700 text-sm">{errors.form}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* First Name Field */}
          <div>
            <label htmlFor="firstName" className="block text-gray-700 text-sm font-medium mb-2">
              First Name
            </label>
            <div className={`flex items-center border ${errors.firstName && formSubmitted ? 'border-red-500' : 'border-gray-300'} rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-red-500 focus-within:border-transparent`}>
              <div className="px-3 py-2 bg-gray-50 text-gray-500">
                <FaUser />
              </div>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="flex-1 px-3 py-2 outline-none"
                placeholder="John"
              />
            </div>
            {errors.firstName && formSubmitted && (
              <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
            )}
          </div>
          
          {/* Last Name Field */}
          <div>
            <label htmlFor="lastName" className="block text-gray-700 text-sm font-medium mb-2">
              Last Name
            </label>
            <div className={`flex items-center border ${errors.lastName && formSubmitted ? 'border-red-500' : 'border-gray-300'} rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-red-500 focus-within:border-transparent`}>
              <div className="px-3 py-2 bg-gray-50 text-gray-500">
                <FaUser />
              </div>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="flex-1 px-3 py-2 outline-none"
                placeholder="Doe"
              />
            </div>
            {errors.lastName && formSubmitted && (
              <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
            )}
          </div>
        </div>
        
        {/* Email Field */}
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
        
        {/* Password Field */}
        <div className="mb-4">
          <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">
            Password
          </label>
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
        
        {/* Confirm Password Field */}
        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-medium mb-2">
            Confirm Password
          </label>
          <div className={`flex items-center border ${errors.confirmPassword && formSubmitted ? 'border-red-500' : 'border-gray-300'} rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-red-500 focus-within:border-transparent`}>
            <div className="px-3 py-2 bg-gray-50 text-gray-500">
              <FaLock />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="flex-1 px-3 py-2 outline-none"
              placeholder="••••••••"
            />
          </div>
          {errors.confirmPassword && formSubmitted && (
            <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
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
              Creating account...
            </>
          ) : (
            'Create account'
          )}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <button
            type="button"
            onClick={switchToLogin}
            className="text-red-600 hover:text-red-800 font-medium"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignupForm;