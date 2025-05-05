const Product = require('../models/Product');

// Create a new product
exports.createProduct = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      price, 
      category, 
      sizes, 
      images, 
      featured 
    } = req.body;

    // Validate required fields
    if (!name || !description || !price || !category || !sizes || !images) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Create product with the admin user as creator
    const product = await Product.create({
      name,
      description,
      price,
      category,
      sizes,
      images,
      featured: featured || false,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to create product',
      error: error.message 
    });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    
    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch products',
      error: error.message 
    });
  }
};

// Get products by gender category
exports.getProductsByGender = async (req, res) => {
  try {
    const { gender } = req.params;
    
    // Validate gender parameter
    if (!['men', 'women', 'kids'].includes(gender)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid gender category' 
      });
    }
    
    const products = await Product.find({ 'category.gender': gender });
    
    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    console.error('Get products by gender error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch products',
      error: error.message 
    });
  }
};

// Get a single product
exports.getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch product',
      error: error.message 
    });
  }
};

// Update a product
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Find the product and update it
    const product = await Product.findByIdAndUpdate(
      id, 
      { ...updates, updatedAt: Date.now() }, 
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update product',
      error: error.message 
    });
  }
};

// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByIdAndDelete(id);
    
    if (!product) {
      return res.status(404).json({ 
        success: false,
        message: 'Product not found' 
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete product',
      error: error.message 
    });
  }
};

// Get product stats for admin dashboard
exports.getProductStats = async (req, res) => {
  try {
    const totalCount = await Product.countDocuments();
    
    const categoryStats = await Product.aggregate([
      {
        $group: {
          _id: '$category.gender',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const typeStats = await Product.aggregate([
      {
        $group: {
          _id: '$category.type',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      stats: {
        totalCount,
        byGender: categoryStats,
        byType: typeStats
      }
    });
  } catch (error) {
    console.error('Get product stats error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch product statistics',
      error: error.message 
    });
  }
};

// Search products
exports.searchProducts = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // Create a search regex (case insensitive)
    const searchRegex = new RegExp(q, 'i');
    
    // Search for products that match the query in name or description
    const products = await Product.find({
      $or: [
        { name: searchRegex },
        { description: searchRegex },
        { 'category.gender': searchRegex },
        { 'category.type': searchRegex }
      ]
    });
    
    res.status(200).json({
      success: true,
      count: products.length,
      products,
      query: q
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to search products',
      error: error.message 
    });
  }
};