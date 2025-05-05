import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { FaHeart, FaShoppingBag } from 'react-icons/fa';

const SearchPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('q');
  
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [wishlistItems, setWishlistItems] = useState([]);
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    // Get wishlist and cart items from localStorage
    const storedWishlist = JSON.parse(localStorage.getItem('wishlistItems')) || [];
    const storedCart = JSON.parse(localStorage.getItem('cartItems')) || [];
    setWishlistItems(storedWishlist);
    setCartItems(storedCart);

    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Use the actual backend API endpoint for searching products
        const response = await fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch search results');
        }
        
        const data = await response.json();
        setProducts(data.products);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
        setLoading(false);
      }
    };

    if (searchQuery) {
      fetchProducts();
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [searchQuery]);

  const addToWishlist = (product) => {
    const isInWishlist = wishlistItems.some(item => item.id === product.id);
    
    if (!isInWishlist) {
      const newWishlistItems = [...wishlistItems, product];
      setWishlistItems(newWishlistItems);
      localStorage.setItem('wishlistItems', JSON.stringify(newWishlistItems));
    }
  };

  const addToCart = (product) => {
    const isInCart = cartItems.some(item => item.id === product.id);
    
    if (!isInCart) {
      const newCartItems = [...cartItems, { ...product, quantity: 1 }];
      setCartItems(newCartItems);
      localStorage.setItem('cartItems', JSON.stringify(newCartItems));
    }
  };

  if (!searchQuery) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Search Results</h1>
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">Please enter a search term to find products.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Search Results</h1>
      <p className="text-gray-600 mb-8">
        {products.length} results for "{searchQuery}"
      </p>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <Link to={`/product/${product._id}`} className="block relative h-64">
                <img
                  src={product.image || `https://via.placeholder.com/300x300?text=${encodeURIComponent(product.name)}`}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </Link>
              <div className="p-4">
                <Link to={`/product/${product._id}`} className="block">
                  <h2 className="text-lg font-semibold text-gray-900 hover:text-red-600 transition-colors">{product.name}</h2>
                  <p className="text-gray-600 text-sm mt-1">{product.gender.charAt(0).toUpperCase() + product.gender.slice(1)}</p>
                  <p className="text-red-600 font-semibold mt-2">${product.price.toFixed(2)}</p>
                </Link>
                <div className="flex justify-between mt-4">
                  <button
                    onClick={() => addToWishlist(product)}
                    className={`p-2 rounded-full ${wishlistItems.some(item => item._id === product._id) ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'} transition-colors`}
                    aria-label="Add to wishlist"
                  >
                    <FaHeart />
                  </button>
                  <button
                    onClick={() => addToCart(product)}
                    className="flex-1 ml-3 bg-black text-white rounded-md py-2 px-4 hover:bg-gray-800 transition-colors flex items-center justify-center"
                  >
                    <FaShoppingBag className="mr-2" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-lg text-gray-600">No products found matching "{searchQuery}".</p>
          <p className="text-gray-500 mt-2">Try using different keywords or check out our featured products.</p>
          <Link to="/" className="inline-block mt-4 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
            Browse Featured Products
          </Link>
        </div>
      )}
    </div>
  );
};

export default SearchPage;