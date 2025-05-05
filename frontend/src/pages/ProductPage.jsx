import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/axiosConfig';
import { FaHeart, FaArrowLeft } from 'react-icons/fa';
import Toast from '../components/Toast';

const ProductPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/products/${id}`);
        if (response.data.success) {
          setProduct(response.data.product);
          // Set first size as default if available
          if (response.data.product.sizes && response.data.product.sizes.length > 0) {
            setSelectedSize(response.data.product.sizes[0].size);
          }
          
          // Check if product is already in wishlist
          const wishlistItems = JSON.parse(localStorage.getItem('wishlistItems')) || [];
          const isInWishlist = wishlistItems.some(item => item._id === response.data.product._id);
          setIsWishlisted(isInWishlist);
        } else {
          setError('Failed to fetch product');
        }
      } catch (err) {
        setError('Error connecting to the server');
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }

    // Refresh product data every 30 seconds to keep stock information updated
    const refreshInterval = setInterval(() => {
      if (id) {
        fetchProduct();
      }
    }, 30000);

    // Clean up interval on component unmount
    return () => clearInterval(refreshInterval);
  }, [id]);

  // Handle image navigation
  const nextImage = () => {
    if (product && product.images.length > 1) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = () => {
    if (product && product.images.length > 1) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
      );
    }
  };

  // Handle add to cart
  const addToCart = () => {
    if (!selectedSize) {
      setToast({
        show: true,
        message: 'Please select a size',
        type: 'warning'
      });
      return;
    }

    // Get current cart items from localStorage or initialize empty array
    const currentCart = JSON.parse(localStorage.getItem('cartItems')) || [];
    
    // Find selected size info
    const sizeInfo = product.sizes.find(s => s.size === selectedSize);
    
    // Check if size is in stock
    if (!sizeInfo || sizeInfo.stock < quantity) {
      setToast({
        show: true,
        message: 'Selected size is out of stock or insufficient quantity available',
        type: 'error'
      });
      return;
    }
    
    // Create cart item with selected size
    const cartItem = {
      _id: product._id,
      name: product.name,
      price: product.price,
      category: product.category,
      images: product.images,
      size: selectedSize,
      quantity: quantity
    };
    
    // Check if product with same size already exists in cart
    const existingItemIndex = currentCart.findIndex(
      item => item._id === product._id && item.size === selectedSize
    );
    
    if (existingItemIndex !== -1) {
      // Update quantity if product already in cart
      const newQuantity = currentCart[existingItemIndex].quantity + quantity;
      if (sizeInfo.stock >= newQuantity) {
        currentCart[existingItemIndex].quantity = newQuantity;
      } else {
        setToast({
          show: true,
          message: `Cannot add more. Only ${sizeInfo.stock} items available in this size.`,
          type: 'warning'
        });
        return;
      }
    } else {
      // Add new item
      currentCart.push(cartItem);
    }
    
    // Save updated cart to localStorage
    localStorage.setItem('cartItems', JSON.stringify(currentCart));
    
    // Provide feedback to user with toast notification
    setToast({
      show: true,
      message: `Added ${product.name} (Size: ${selectedSize}) to cart`,
      type: 'success'
    });
  };

  // Handle wishlist toggle
  const toggleWishlist = () => {
    // Get current wishlist items from localStorage
    const wishlistItems = JSON.parse(localStorage.getItem('wishlistItems')) || [];
    
    if (!isWishlisted) {
      // Add to wishlist
      const wishlistItem = {
        _id: product._id,
        name: product.name,
        price: product.price,
        category: product.category,
        images: product.images
      };
      
      // Check if product already exists in wishlist (shouldn't happen, but just to be safe)
      if (!wishlistItems.some(item => item._id === product._id)) {
        wishlistItems.push(wishlistItem);
        localStorage.setItem('wishlistItems', JSON.stringify(wishlistItems));
        setToast({
          show: true,
          message: `Added ${product.name} to wishlist`,
          type: 'success'
        });
      }
    } else {
      // Remove from wishlist
      const updatedWishlist = wishlistItems.filter(item => item._id !== product._id);
      localStorage.setItem('wishlistItems', JSON.stringify(updatedWishlist));
      setToast({
        show: true,
        message: `Removed ${product.name} from wishlist`,
        type: 'info'
      });
    }
    
    // Update state
    setIsWishlisted(!isWishlisted);
  };

  // Get stock for selected size
  const getSelectedSizeStock = () => {
    if (!product || !selectedSize) return 0;
    const sizeInfo = product.sizes.find(s => s.size === selectedSize);
    return sizeInfo ? sizeInfo.stock : 0;
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12">
          <p className="text-lg">Loading product...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center py-12 text-red-500">
          <p className="text-lg">{error || 'Product not found'}</p>
          <Link to="/" className="inline-block mt-4 text-blue-500 hover:underline">
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Toast Notification */}
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })} 
        />
      )}
      
      {/* Back button */}
      <Link 
        to={`/${product.category.gender}`} 
        className="inline-flex items-center text-gray-600 hover:text-red-500 mb-6"
      >
        <FaArrowLeft className="mr-2" /> Back to {product.category.gender}'s sneakers
      </Link>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          {/* Product Image Section - Left Side */}
          <div className="md:w-1/2 relative">
            {/* Main product image */}
            <div className="relative h-96 md:h-full">
              <img 
                src={product.images[currentImageIndex]?.url} 
                alt={product.images[currentImageIndex]?.alt || product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Image navigation controls */}
              {product.images.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
                  >
                    &larr;
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"
                  >
                    &rarr;
                  </button>

                  {/* Image thumbnails */}
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
                    {product.images.map((img, idx) => (
                      <button 
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={`h-2 w-2 rounded-full ${
                          idx === currentImageIndex ? 'bg-red-500' : 'bg-white bg-opacity-50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          
          {/* Product Details Section - Right Side */}
          <div className="md:w-1/2 p-6 md:p-8">
            <div className="flex justify-between items-start">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.name}</h1>
              <button 
                onClick={toggleWishlist}
                className={`p-2 rounded-full ${
                  isWishlisted 
                    ? 'text-red-500 hover:text-red-600' 
                    : 'text-gray-400 hover:text-red-500'
                }`}
              >
                <FaHeart className="h-6 w-6" />
              </button>
            </div>
            
            <div className="mt-2">
              <span className="text-xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
              <p className="text-sm text-gray-500 mt-1 capitalize">
                {product.category.gender}'s {product.category.type} Sneakers
              </p>
            </div>
            
            <div className="mt-6">
              <h2 className="text-lg font-medium text-gray-900">Description</h2>
              <p className="mt-2 text-gray-600">{product.description}</p>
            </div>
            
            {/* Size selection */}
            <div className="mt-6">
              <h2 className="text-lg font-medium text-gray-900">Select Size</h2>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {product.sizes.map((sizeOption) => (
                  <button
                    key={sizeOption.size}
                    onClick={() => setSelectedSize(sizeOption.size)}
                    disabled={sizeOption.stock === 0}
                    className={`py-2 px-3 border rounded-md hover:border-red-500 ${
                      selectedSize === sizeOption.size 
                        ? 'border-red-500 bg-red-50' 
                        : 'border-gray-300'
                    } ${
                      sizeOption.stock === 0 
                        ? 'opacity-50 cursor-not-allowed' 
                        : 'cursor-pointer'
                    }`}
                  >
                    {sizeOption.size}
                    {sizeOption.stock === 0 && <span className="block text-xs text-red-500">Out of stock</span>}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Quantity and stock */}
            <div className="mt-6">
              <h2 className="text-lg font-medium text-gray-900">Quantity</h2>
              <div className="flex items-center mt-2">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="bg-gray-200 px-3 py-1 rounded-l-md"
                >
                  -
                </button>
                <span className="px-4 py-1 border-t border-b">{quantity}</span>
                <button 
                  onClick={() => setQuantity(Math.min(getSelectedSizeStock(), quantity + 1))}
                  className="bg-gray-200 px-3 py-1 rounded-r-md"
                  disabled={quantity >= getSelectedSizeStock()}
                >
                  +
                </button>
                <span className="ml-4 text-sm text-gray-500">
                  {selectedSize && `${getSelectedSizeStock()} available`}
                </span>
              </div>
            </div>
            
            {/* Add to cart button */}
            <div className="mt-8">
              <button
                onClick={addToCart}
                disabled={!selectedSize || getSelectedSizeStock() === 0}
                className="w-full bg-red-500 text-white py-3 px-6 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {!selectedSize 
                  ? 'Select a Size' 
                  : getSelectedSizeStock() === 0 
                    ? 'Out of Stock' 
                    : 'Add to Cart'
                }
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;