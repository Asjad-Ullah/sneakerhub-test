import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const WishlistPage = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const loadWishlistItems = () => {
      try {
        setLoading(true);
        // Get wishlist items from localStorage
        const items = JSON.parse(localStorage.getItem('wishlistItems')) || [];
        setWishlistItems(items);
      } catch (err) {
        setError('Error loading wishlist items');
        console.error('Error loading wishlist items:', err);
      } finally {
        setLoading(false);
      }
    };

    loadWishlistItems();
  }, []);
  
  const removeFromWishlist = (id) => {
    // Remove from state
    const updatedItems = wishlistItems.filter(item => item._id !== id);
    setWishlistItems(updatedItems);
    
    // Update localStorage
    localStorage.setItem('wishlistItems', JSON.stringify(updatedItems));
  };

  const addToCart = (product) => {
    // Get current cart items from localStorage
    const currentCart = JSON.parse(localStorage.getItem('cartItems')) || [];
    
    // Check if product already exists in cart
    const existingItemIndex = currentCart.findIndex(item => item._id === product._id);
    
    if (existingItemIndex !== -1) {
      // Update quantity if product already in cart
      currentCart[existingItemIndex].quantity += 1;
    } else {
      // Add new item with quantity 1
      currentCart.push({ ...product, quantity: 1 });
    }
    
    // Save updated cart to localStorage
    localStorage.setItem('cartItems', JSON.stringify(currentCart));
    
    // Provide feedback to user
    alert(`Added ${product.name} to cart`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">My Wishlist</h1>
      
      {loading && (
        <div className="text-center py-12">
          <p className="text-lg">Loading wishlist items...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-12 text-red-500">
          <p className="text-lg">{error}</p>
        </div>
      )}
      
      {!loading && !error && wishlistItems.length > 0 ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {wishlistItems.map((item) => (
                <tr key={item._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-16 w-16 flex-shrink-0 rounded-md overflow-hidden">
                        <img src={item.images[0]?.url || "/src/assets/men.jpg"} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {item.category.gender.charAt(0).toUpperCase() + item.category.gender.slice(1)}'s {item.category.type.charAt(0).toUpperCase() + item.category.type.slice(1)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">${item.price}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => removeFromWishlist(item._id)}
                      className="text-red-500 hover:text-red-700 mr-4"
                    >
                      Remove
                    </button>
                    <button 
                      onClick={() => addToCart(item)}
                      className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition-colors duration-300"
                    >
                      Add to Cart
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : !loading && !error ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Your wishlist is empty</h3>
          <p className="mt-2 text-gray-600">Save items you love to your wishlist. Review them anytime and easily move them to the cart.</p>
          <div className="mt-6">
            <Link to="/" className="text-red-500 hover:text-red-700 font-medium">
              Continue Shopping <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default WishlistPage;