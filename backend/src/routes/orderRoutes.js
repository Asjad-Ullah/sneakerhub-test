const express = require('express');
const router = express.Router();
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const orderController = require('../controllers/orderController');
const { validateOrderCreation, validateOrderStatusUpdate } = require('../middleware/validation');

// Create a new order - requires authentication
router.post('/', authenticate, validateOrderCreation, orderController.createOrder);

// Get logged in user's orders - requires authentication
router.get('/my-orders', authenticate, orderController.getUserOrders);
router.get('/myorders', authenticate, orderController.getUserOrders); // Keep for backward compatibility

// Admin-specific enhanced endpoints
// These routes need to be BEFORE the /:id route to prevent "admin" being treated as an ID
router.get('/admin', authenticate, authorizeAdmin, orderController.getAllOrders);
router.get('/admin/details', authenticate, authorizeAdmin, orderController.getOrdersWithDetails);
router.get('/admin/summary', authenticate, authorizeAdmin, orderController.getOrdersSummary);
router.put('/admin/cancel/:id', authenticate, authorizeAdmin, orderController.cancelOrder);

// Get order by ID - requires authentication
router.get('/:id', authenticate, orderController.getOrderById);

// Update order status - requires admin privileges
router.put('/:id/status', authenticate, authorizeAdmin, validateOrderStatusUpdate, orderController.updateOrderStatus);

// Admin routes
// Get all orders - requires admin privileges - deprecated, use /admin instead
router.get('/', authenticate, authorizeAdmin, orderController.getAllOrders);

module.exports = router;