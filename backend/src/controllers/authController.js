const User = require('../models/User');
const { generateToken, setTokenCookie } = require('../middleware/auth');

// Register a new user
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log(`[AUTH ERROR] Registration failed: Email ${email} already exists`);
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Validate input fields
    if (!firstName || !lastName || !email || !password) {
      const missingFields = [];
      if (!firstName) missingFields.push('firstName');
      if (!lastName) missingFields.push('lastName');
      if (!email) missingFields.push('email');
      if (!password) missingFields.push('password');
      
      console.log(`[AUTH ERROR] Registration failed: Missing required fields: ${missingFields.join(', ')}`);
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password
    });

    // Generate JWT
    const token = generateToken(user._id);
    
    // Set token in HTTP-only cookie
    setTokenCookie(res, token);

    // Send response
    res.status(201).json({
      token, // Still including for backward compatibility with frontend
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log(`[AUTH ERROR] Login failed: Invalid email ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if password is correct
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log(`[AUTH ERROR] Login failed: Incorrect password for email ${email}`);
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT
    const token = generateToken(user._id);
    
    // Set token in HTTP-only cookie
    setTokenCookie(res, token);

    // Send response
    res.status(200).json({
      token, // Still including for backward compatibility with frontend
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Admin Login
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Hardcoded admin credentials check
    if (email !== "admin@gmail.com") {
      console.log(`[AUTH ERROR] Admin login failed: Invalid email ${email}`);
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }
    
    if (password !== "adminadmin") {
      console.log(`[AUTH ERROR] Admin login failed: Incorrect password for email ${email}`);
      return res.status(401).json({ message: 'Invalid admin credentials' });
    }

    // Find or create admin user
    let adminUser = await User.findOne({ email });
    
    if (!adminUser) {
      // Create admin user if it doesn't exist
      adminUser = await User.create({
        firstName: "Admin",
        lastName: "User",
        email: "admin@gmail.com",
        password: "adminadmin",
        isAdmin: true
      });
    } else {
      // Ensure the user has admin privileges
      if (!adminUser.isAdmin) {
        adminUser.isAdmin = true;
        await adminUser.save();
      }
    }

    // Generate JWT
    const token = generateToken(adminUser._id);
    
    // Set token in HTTP-only cookie
    setTokenCookie(res, token);

    // Send response
    res.status(200).json({
      token, // Still including for backward compatibility with frontend
      user: {
        id: adminUser._id,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        email: adminUser.email,
        isAdmin: adminUser.isAdmin
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ message: 'Server error during admin login' });
  }
};

// Logout user
exports.logout = async (req, res) => {
  try {
    // Clear the authentication cookie
    const { clearTokenCookie } = require('../middleware/auth');
    clearTokenCookie(res);
    
    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
};

// Get current user profile
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin,
        cart: user.cart || [],
        wishlist: user.wishlist || []
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error while getting user profile' });
  }
};

// Sync cart items
exports.syncCart = async (req, res) => {
  try {
    const { cartItems } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.cart = cartItems;
    await user.save();
    
    res.status(200).json({ message: 'Cart synchronized successfully', cart: user.cart });
  } catch (error) {
    console.error('Cart sync error:', error);
    res.status(500).json({ message: 'Server error while syncing cart' });
  }
};

// Sync wishlist items
exports.syncWishlist = async (req, res) => {
  try {
    const { wishlistItems } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.wishlist = wishlistItems;
    await user.save();
    
    res.status(200).json({ message: 'Wishlist synchronized successfully', wishlist: user.wishlist });
  } catch (error) {
    console.error('Wishlist sync error:', error);
    res.status(500).json({ message: 'Server error while syncing wishlist' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, email, currentPassword, newPassword } = req.body;

    // Find the user
    const user = await User.findById(req.user._id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is already in use by another user
    if (email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Email is already in use by another account' });
      }
    }

    // Update basic profile info
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;

    // If user is trying to change password
    if (newPassword && currentPassword) {
      // Verify current password
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }

      // Set new password
      user.password = newPassword;
    }

    // Save the updated user
    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ message: 'Server error while updating profile' });
  }
};

// ADMIN ENDPOINTS

// Get all users (admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    // Count users by registration date (for analytics)
    const usersByDate = {};
    users.forEach(user => {
      const date = new Date(user.createdAt || user._id.getTimestamp()).toISOString().split('T')[0];
      usersByDate[date] = (usersByDate[date] || 0) + 1;
    });
    
    res.status(200).json({ 
      success: true, 
      count: users.length, 
      users,
      analytics: {
        usersByDate
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
};

// Delete user (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find the user to delete
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't allow deleting admin accounts
    if (user.isAdmin) {
      return res.status(400).json({ message: 'Cannot delete admin accounts' });
    }
    
    // Get the user's orders
    const Order = require('../models/Order');
    const userOrders = await Order.find({ user: userId });
    
    // Process each order to restore stock
    for (const order of userOrders) {
      // Only restore stock for orders that reduced inventory (processing, shipped, delivered)
      if (['processing', 'shipped', 'delivered'].includes(order.status)) {
        const Product = require('../models/Product');
        
        // Loop through items in the order
        for (const item of order.items) {
          const product = await Product.findById(item.product);
          
          if (product) {
            // Find the matching size and restore stock
            const sizeIndex = product.sizes.findIndex(s => s.size === item.size);
            
            if (sizeIndex !== -1) {
              product.sizes[sizeIndex].stock += item.quantity;
              await product.save();
            }
          }
        }
      }
      
      // Delete the order
      await Order.findByIdAndDelete(order._id);
    }
    
    // Delete the user
    await User.findByIdAndDelete(userId);
    
    res.status(200).json({ 
      success: true, 
      message: `User and ${userOrders.length} associated orders deleted successfully.`,
      restoredInventory: true
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error while deleting user' });
  }
};

// Toggle user admin status (admin only)
exports.toggleAdminStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Toggle admin status
    user.isAdmin = !user.isAdmin;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: `Admin status for ${user.firstName} ${user.lastName} set to ${user.isAdmin}`,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        isAdmin: user.isAdmin
      }
    });
  } catch (error) {
    console.error('Toggle admin status error:', error);
    res.status(500).json({ message: 'Server error while toggling admin status' });
  }
};

// Get dashboard statistics (admin only)
exports.getDashboardStats = async (req, res) => {
  try {
    // Get models
    const Order = require('../models/Order');
    const Product = require('../models/Product');
    
    // Count total users
    const totalUsers = await User.countDocuments();
    const totalAdmins = await User.countDocuments({ isAdmin: true });
    
    // Count total products and calculate total inventory
    const products = await Product.find();
    const totalProducts = products.length;
    
    let totalInventory = 0;
    let lowStockProducts = 0;
    let outOfStockProducts = 0;
    
    products.forEach(product => {
      const productStock = product.sizes.reduce((total, size) => total + size.stock, 0);
      totalInventory += productStock;
      
      // Count products with low stock (less than 10 items total)
      if (productStock > 0 && productStock < 10) {
        lowStockProducts++;
      }
      
      // Count out of stock products (0 items across all sizes)
      if (productStock === 0) {
        outOfStockProducts++;
      }
    });
    
    // Get order statistics
    const orders = await Order.find().sort({ createdAt: -1 }).limit(1000);
    const totalOrders = orders.length;
    
    // Calculate total revenue
    const totalRevenue = orders.reduce((total, order) => total + order.totalAmount, 0);
    
    // Count orders by status
    const ordersByStatus = {
      pending: await Order.countDocuments({ status: 'pending' }),
      processing: await Order.countDocuments({ status: 'processing' }),
      shipped: await Order.countDocuments({ status: 'shipped' }),
      delivered: await Order.countDocuments({ status: 'delivered' }),
      cancelled: await Order.countDocuments({ status: 'cancelled' })
    };
    
    // Get orders by date (for charts)
    const ordersByDate = {};
    const revenueByDate = {};
    
    orders.forEach(order => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      ordersByDate[date] = (ordersByDate[date] || 0) + 1;
      revenueByDate[date] = (revenueByDate[date] || 0) + order.totalAmount;
    });
    
    // Get top selling products
    const productSales = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.product.toString();
        productSales[productId] = (productSales[productId] || 0) + item.quantity;
      });
    });
    
    // Convert to array and sort
    const topSellingProducts = await Promise.all(
      Object.entries(productSales)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(async ([productId, quantity]) => {
          const product = await Product.findById(productId);
          return {
            productId,
            name: product ? product.name : 'Unknown Product',
            quantity,
            image: product && product.images.length > 0 ? product.images[0].url : null
          };
        })
    );
    
    // Generate a summary of data for charts
    // Convert date-based objects to arrays for easier use in charts
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      last30Days.push({
        date: dateStr,
        orders: ordersByDate[dateStr] || 0,
        revenue: revenueByDate[dateStr] || 0
      });
    }
    
    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          admins: totalAdmins,
          customers: totalUsers - totalAdmins
        },
        products: {
          total: totalProducts,
          inventory: totalInventory,
          lowStock: lowStockProducts,
          outOfStock: outOfStockProducts
        },
        orders: {
          total: totalOrders,
          byStatus: ordersByStatus
        },
        revenue: {
          total: totalRevenue,
          average: totalOrders > 0 ? totalRevenue / totalOrders : 0
        },
        charts: {
          last30Days,
          topSellingProducts
        }
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard statistics' });
  }
};