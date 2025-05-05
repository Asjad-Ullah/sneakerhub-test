const express = require('express');
const authController = require('../controllers/authController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const { validateRegistration, validateLogin, validateProfileUpdate } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/register', validateRegistration, authController.register);
router.post('/login', validateLogin, authController.login);
router.post('/admin/login', validateLogin, authController.adminLogin);
router.post('/logout', authController.logout); // New logout endpoint

// Protected routes
router.get('/me', authenticate, authController.getCurrentUser);
router.post('/sync-cart', authenticate, authController.syncCart);
router.post('/sync-wishlist', authenticate, authController.syncWishlist);
router.put('/update-profile', authenticate, validateProfileUpdate, authController.updateProfile);

// Admin protected routes
router.get('/admin/dashboard-stats', authenticate, authorizeAdmin, authController.getDashboardStats);
router.get('/admin/users', authenticate, authorizeAdmin, authController.getAllUsers);
router.delete('/admin/users/:userId', authenticate, authorizeAdmin, authController.deleteUser);
router.patch('/admin/users/:userId/toggle-admin', authenticate, authorizeAdmin, authController.toggleAdminStatus);

// Admin protected route - test route
router.get('/admin/dashboard', authorizeAdmin, (req, res) => {
  res.status(200).json({ message: 'Admin dashboard access granted', user: req.user });
});

module.exports = router;