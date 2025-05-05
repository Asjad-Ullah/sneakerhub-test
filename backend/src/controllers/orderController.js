const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Create a new order
exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, totalAmount } = req.body;

    // Validate required fields
    if (!items || !shippingAddress || !totalAmount) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide all required order details' 
      });
    }

    // Start a transaction
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Check stock availability and update product quantities
      for (const item of items) {
        const product = await Product.findById(item.product).session(session);
        
        if (!product) {
          throw new Error(`Product not found: ${item.product}`);
        }
        
        // Find the size in the product's sizes array
        const sizeIndex = product.sizes.findIndex(s => s.size === item.size);
        
        if (sizeIndex === -1) {
          throw new Error(`Size ${item.size} not found for product ${product.name}`);
        }
        
        // Check if enough stock is available
        if (product.sizes[sizeIndex].stock < item.quantity) {
          throw new Error(`Not enough stock for ${product.name} in size ${item.size}. Available: ${product.sizes[sizeIndex].stock}, Requested: ${item.quantity}`);
        }
        
        // Reduce the stock quantity
        product.sizes[sizeIndex].stock -= item.quantity;
        
        // Save the updated product
        await product.save({ session });
      }

      // Create new order with current user as the customer
      const order = await Order.create([{
        user: req.user._id,
        items,
        shippingAddress,
        totalAmount,
        createdAt: new Date()
      }], { session });
      
      // Commit the transaction
      await session.commitTransaction();
      session.endSession();

      res.status(201).json({
        success: true,
        order: order[0]
      });
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ 
      success: false,
      message: error.message || 'Failed to create order',
      error: error.message 
    });
  }
};

// Get all orders for admin
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch orders',
      error: error.message 
    });
  }
};

// Get user's orders
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch your orders',
      error: error.message 
    });
  }
};

// Get order by ID
exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }
    
    // Check if order belongs to user or user is admin
    if (order.user.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ 
        success: false,
        message: 'Not authorized to access this order' 
      });
    }
    
    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch order',
      error: error.message 
    });
  }
};

// Update order status (admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ 
        success: false,
        message: 'Please provide status' 
      });
    }
    
    const order = await Order.findByIdAndUpdate(
      id, 
      { status }, 
      { new: true, runValidators: true }
    );
    
    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'Order not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update order status',
      error: error.message 
    });
  }
};

// ADMIN SPECIFIC ENDPOINTS

// Get orders with user details and filters (admin only)
exports.getOrdersWithDetails = async (req, res) => {
  try {
    // Extract query parameters for filtering
    const { status, sort = 'newest', page = 1, limit = 10 } = req.query;
    const skipCount = (parseInt(page) - 1) * parseInt(limit);
    
    // Build query object for filtering
    const query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    
    // Determine sort order
    let sortOption = { createdAt: -1 }; // Default: newest first
    if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'highest') {
      sortOption = { totalAmount: -1 };
    } else if (sort === 'lowest') {
      sortOption = { totalAmount: 1 };
    }
    
    // Count total matching orders
    const totalOrders = await Order.countDocuments(query);
    
    // Fetch orders with pagination and sorting
    const orders = await Order.find(query)
      .sort(sortOption)
      .skip(skipCount)
      .limit(parseInt(limit))
      .lean(); // Use lean() for better performance
    
    // Fetch user details for each order
    const ordersWithUserDetails = await Promise.all(
      orders.map(async (order) => {
        const user = await User.findById(order.user).select('firstName lastName email');
        return {
          ...order,
          userDetails: user ? {
            id: user._id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email
          } : {
            name: 'Unknown User',
            email: 'unknown'
          }
        };
      })
    );
    
    // Get count of orders by status for summary
    const orderCounts = {
      all: await Order.countDocuments({}),
      pending: await Order.countDocuments({ status: 'pending' }),
      processing: await Order.countDocuments({ status: 'processing' }),
      shipped: await Order.countDocuments({ status: 'shipped' }),
      delivered: await Order.countDocuments({ status: 'delivered' }),
      cancelled: await Order.countDocuments({ status: 'cancelled' })
    };
    
    res.status(200).json({
      success: true,
      totalOrders,
      totalPages: Math.ceil(totalOrders / parseInt(limit)),
      currentPage: parseInt(page),
      orders: ordersWithUserDetails,
      summary: orderCounts
    });
  } catch (error) {
    console.error('Get orders with details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order details',
      error: error.message
    });
  }
};

// Cancel an order and restore inventory (admin only)
exports.cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    // Find the order
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if order can be cancelled (not already delivered or cancelled)
    if (order.status === 'delivered') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel an order that has already been delivered'
      });
    }
    
    if (order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Order is already cancelled'
      });
    }
    
    // Start a transaction
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      // Restore inventory for each product
      // We only need to restore stock if the order has already reduced inventory
      if (['processing', 'shipped'].includes(order.status)) {
        for (const item of order.items) {
          const product = await Product.findById(item.product).session(session);
          
          if (product) {
            const sizeIndex = product.sizes.findIndex(s => s.size === item.size);
            
            if (sizeIndex !== -1) {
              // Restore the stock
              product.sizes[sizeIndex].stock += item.quantity;
              await product.save({ session });
            }
          }
        }
      }
      
      // Update order status to cancelled
      order.status = 'cancelled';
      order.cancellationReason = reason || 'Cancelled by admin';
      order.updatedAt = new Date();
      
      await order.save({ session });
      
      // Commit the transaction
      await session.commitTransaction();
      session.endSession();
      
      res.status(200).json({
        success: true,
        message: 'Order cancelled successfully and inventory restored',
        order
      });
    } catch (error) {
      // Abort transaction on error
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel order',
      error: error.message
    });
  }
};

// Get recent orders with summary data (admin only)
exports.getOrdersSummary = async (req, res) => {
  try {
    // Get recent orders (last 10)
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'firstName lastName email');
      
    // Get total sales and order count
    const totalSales = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Get sales by date (for the last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const salesByDate = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo },
          status: { $ne: 'cancelled' } // Exclude cancelled orders
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          sales: { $sum: "$totalAmount" },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Transform salesByDate for easier charting
    const salesChartData = [];
    const dateIterator = new Date(thirtyDaysAgo);
    
    while (dateIterator <= new Date()) {
      const dateString = dateIterator.toISOString().split('T')[0];
      const existingData = salesByDate.find(item => item._id === dateString);
      
      salesChartData.push({
        date: dateString,
        sales: existingData ? existingData.sales : 0,
        orders: existingData ? existingData.count : 0
      });
      
      dateIterator.setDate(dateIterator.getDate() + 1);
    }
    
    res.status(200).json({
      success: true,
      recentOrders,
      stats: {
        totalSales: totalSales.length > 0 ? totalSales[0].totalAmount : 0,
        totalOrders: totalSales.length > 0 ? totalSales[0].count : 0,
        averageOrderValue: totalSales.length > 0 ? totalSales[0].totalAmount / totalSales[0].count : 0
      },
      salesChartData
    });
  } catch (error) {
    console.error('Get orders summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch orders summary',
      error: error.message
    });
  }
};