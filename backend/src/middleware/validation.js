const { body, validationResult } = require('express-validator');

// User registration validation middleware
const validateRegistration = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .trim()
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array(),
        message: errors.array()[0].msg
      });
    }
    next();
  }
];

// User login validation middleware
const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .trim()
    .notEmpty().withMessage('Password is required'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array(),
        message: errors.array()[0].msg
      });
    }
    next();
  }
];

// Profile update validation middleware
const validateProfileUpdate = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters'),
  
  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be between 2 and 50 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('newPassword')
    .optional({ checkFalsy: true })
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters long'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array(),
        message: errors.array()[0].msg
      });
    }
    next();
  }
];

// Order creation validation middleware
const validateOrderCreation = [
  body('items')
    .isArray().withMessage('Items must be an array')
    .notEmpty().withMessage('Order must contain at least one item'),
  
  body('items.*.product')
    .notEmpty().withMessage('Product ID is required for each item'),
    
  body('items.*.quantity')
    .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    
  body('items.*.size')
    .notEmpty().withMessage('Size is required for each item'),
    
  body('shippingAddress.fullName')
    .trim()
    .notEmpty().withMessage('Full name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Full name must be between 2 and 100 characters'),
    
  body('shippingAddress.email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address'),
    
  body('shippingAddress.address')
    .trim()
    .notEmpty().withMessage('Address is required')
    .isLength({ min: 5, max: 200 }).withMessage('Address must be between 5 and 200 characters'),
    
  body('shippingAddress.city')
    .trim()
    .notEmpty().withMessage('City is required'),
    
  body('shippingAddress.state')
    .trim()
    .notEmpty().withMessage('State/Province is required'),
    
  body('shippingAddress.zipCode')
    .trim()
    .notEmpty().withMessage('Zip/Postal code is required'),
    
  body('shippingAddress.country')
    .trim()
    .notEmpty().withMessage('Country is required'),
    
  body('shippingAddress.phoneNumber')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/).withMessage('Please provide a valid phone number'),
    
  body('totalAmount')
    .isNumeric().withMessage('Total amount must be a number')
    .custom(value => value > 0).withMessage('Total amount must be greater than 0'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array(),
        message: errors.array()[0].msg
      });
    }
    next();
  }
];

// Order status update validation middleware
const validateOrderStatusUpdate = [
  body('status')
    .trim()
    .notEmpty().withMessage('Status is required')
    .isIn(['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled']).withMessage('Invalid status value'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array(),
        message: errors.array()[0].msg
      });
    }
    next();
  }
];

// Product creation/update validation middleware
const validateProductData = [
  body('name')
    .trim()
    .notEmpty().withMessage('Product name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Product name must be between 2 and 100 characters'),
    
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
    
  body('price')
    .isNumeric().withMessage('Price must be a number')
    .custom(value => value > 0).withMessage('Price must be greater than 0'),
    
  // Properly validate the nested category object
  body('category')
    .isObject().withMessage('Category must be an object'),
    
  body('category.gender')
    .trim()
    .notEmpty().withMessage('Gender category is required')
    .isIn(['men', 'women', 'kids']).withMessage('Invalid gender category'),
    
  body('category.type')
    .trim()
    .notEmpty().withMessage('Product type is required')
    .isIn(['running', 'casual', 'sports', 'training', 'basketball', 'lifestyle']).withMessage('Invalid product type'),
    
  body('sizes')
    .isArray().withMessage('Sizes must be an array')
    .notEmpty().withMessage('At least one size is required'),
    
  body('sizes.*.size')
    .notEmpty().withMessage('Size name is required'),
    
  body('sizes.*.stock')
    .isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
    
  body('images')
    .isArray().withMessage('Images must be an array')
    .notEmpty().withMessage('At least one image is required'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array(),
        message: errors.array()[0].msg
      });
    }
    next();
  }
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateProfileUpdate,
  validateOrderCreation,
  validateOrderStatusUpdate,
  validateProductData
};