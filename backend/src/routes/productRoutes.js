const express = require('express');
const productController = require('../controllers/productController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { validateProductData } = require('../middleware/validation');

const router = express.Router();

// Public routes for customers
router.get('/', productController.getAllProducts);
router.get('/search', productController.searchProducts); // New search endpoint
router.get('/:id', productController.getProduct);
router.get('/category/:gender', productController.getProductsByGender);

// Admin-only routes (protected)
router.post('/', authenticate, authorizeAdmin, validateProductData, productController.createProduct);
router.put('/:id', authenticate, authorizeAdmin, validateProductData, productController.updateProduct);
router.delete('/:id', authenticate, authorizeAdmin, productController.deleteProduct);
router.get('/admin/stats', authenticate, authorizeAdmin, productController.getProductStats);

module.exports = router;